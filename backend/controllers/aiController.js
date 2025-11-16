/**
 * ============================================
 * AI CONTROLLER - AUTO-FALLBACK SYSTEM
 * ============================================
 */

const fetch = require('node-fetch');

// Model configurations - WITH AUTO-FALLBACK
const MODELS = {
    vicuna: {
        endpoint: 'https://api-inference.huggingface.co/models/lmsys/vicuna-7b-v1.5',
        type: 'text-generation',
        fallback: 'gpt-20b' // Auto fallback if fails
    },
    'gpt-20b': {
        endpoint: 'https://router.huggingface.co/v1/chat/completions',
        model: 'openai/gpt-oss-20b:novita',
        type: 'chat',
        fallback: 'gpt-120b'
    },
    'gpt-120b': {
        endpoint: 'https://router.huggingface.co/v1/chat/completions',
        model: 'openai/gpt-oss-120b:novita',
        type: 'chat',
        fallback: null
    }
};

/**
 * Get AI response with AUTO-FALLBACK
 */
async function getAIResponse(userMessage, modelId = 'vicuna', history = []) {
    let currentModel = modelId;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        const modelConfig = MODELS[currentModel];
        if (!modelConfig) break;

        try {
            console.log(`🤖 Attempting with ${currentModel}... (attempt ${attempts + 1})`);

            let response;
            if (modelConfig.type === 'chat') {
                response = await callChatAPI(userMessage, modelConfig, history);
            } else {
                response = await callTextGenerationAPI(userMessage, modelConfig, history);
            }

            console.log(`✅ Success with ${currentModel}!`);
            
            return {
                response: response,
                model: currentModel,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error(`❌ ${currentModel} failed:`, error.message);
            
            // Try fallback model
            if (modelConfig.fallback) {
                console.log(`🔄 Falling back to ${modelConfig.fallback}...`);
                currentModel = modelConfig.fallback;
                attempts++;
            } else {
                throw new Error(`All models failed. Last error: ${error.message}`);
            }
        }
    }

    throw new Error('Maximum fallback attempts reached');
}

/**
 * Call Chat Completions API (GPT-OSS models)
 */
async function callChatAPI(userMessage, modelConfig, history) {
    const messages = [
        {
            role: 'system',
            content: `You are ChemAI, an expert chemistry assistant with a friendly personality.

CRITICAL FORMATTING RULES:
1. Use proper Markdown formatting
2. Add contextual emojis (⚛️ 🧪 🔬 💧 🔥 ⚡ etc.)
3. Structure your response professionally:
   - Main explanation with headers (##)
   - Key points in bullet lists
   - Important terms in **bold**
   - Chemical formulas in \`code format\`

4. When mentioning elements/molecules, use this EXACT format:
   [ELEMENT:H] or [ELEMENT:Oxygen] or [ELEMENT:6] (for Carbon)
   [MOLECULE:h2o] or [MOLECULE:benzene] or [MOLECULE:glucose]
   [REACTION:H₂+O₂] for reactions

5. For Wikipedia info, use: [WIKI:Water] or [WIKI:Photosynthesis]

Example:
"## 💧 Water Structure

**Water** ([MOLECULE:h2o]) is a polar molecule consisting of:
- Two [ELEMENT:H] atoms
- One [ELEMENT:O] atom

[WIKI:Water]

The bent shape (104.5°) creates polarity, making water an excellent solvent! 🌊"`
        }
    ];

    history.forEach(msg => {
        messages.push({
            role: msg.role,
            content: msg.content
        });
    });

    messages.push({
        role: 'user',
        content: userMessage
    });

    const response = await fetch(modelConfig.endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: modelConfig.model,
            messages: messages,
            max_tokens: 2048,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
    }

    throw new Error('Invalid response format');
}

/**
 * Call Text Generation API (Vicuna)
 */
async function callTextGenerationAPI(userMessage, modelConfig, history) {
    let prompt = `You are ChemAI, a chemistry expert. Use emojis and Markdown formatting.

CRITICAL: When mentioning elements/molecules, use:
[ELEMENT:name] - for elements (e.g., [ELEMENT:Carbon])
[MOLECULE:id] - for molecules (e.g., [MOLECULE:h2o])
[WIKI:topic] - for Wikipedia info

`;
    
    if (history && history.length > 0) {
        const recentHistory = history.slice(-4);
        recentHistory.forEach(msg => {
            if (msg.role === 'user') {
                prompt += `Human: ${msg.content}\n`;
            } else {
                prompt += `Assistant: ${msg.content}\n`;
            }
        });
    }
    
    prompt += `Human: ${userMessage}\nAssistant:`;

    const response = await fetch(modelConfig.endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 800,
                temperature: 0.7,
                top_p: 0.9,
                repetition_penalty: 1.1,
                return_full_text: false,
                do_sample: true
            },
            options: {
                use_cache: false,
                wait_for_model: true
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    let generatedText = null;

    if (Array.isArray(data)) {
        if (data[0] && data[0].generated_text) {
            generatedText = data[0].generated_text;
        }
    } else if (data.generated_text) {
        generatedText = data.generated_text;
    } else if (typeof data === 'string') {
        generatedText = data;
    }

    if (generatedText) {
        let cleaned = generatedText.trim();
        cleaned = cleaned.replace(/^(Human:|Assistant:)/i, '').trim();
        
        if (!cleaned) {
            throw new Error('Empty response from model');
        }
        
        return cleaned;
    }

    throw new Error('Invalid response format');
}

/**
 * Check if message is chemistry-related
 */
function isChemistryRelated(message) {
    const chemistryKeywords = [
        'element', 'atom', 'molecule', 'compound', 'reaction', 'periodic',
        'chemical', 'chemistry', 'bond', 'ion', 'electron', 'proton', 'neutron',
        'formula', 'equation', 'balance', 'stoichiometry', 'mole', 'molarity',
        'concentration', 'mass', 'weight', 'molecular', 'organic', 'inorganic',
        'physical', 'analytical', 'biochemistry', 'acid', 'base', 'ph',
        'oxidation', 'reduction', 'catalyst', 'synthesis', 'combustion',
        'precipitation', 'neutralization', 'solution', 'solvent', 'solute',
        'dissolve', 'saturated', 'dilute', 'valence', 'orbital', 'shell',
        'subshell', 'quantum', 'nucleus', 'h2o', 'co2', 'nacl', 'h2', 'o2',
        'water', 'oxygen', 'hydrogen', 'carbon', 'nitrogen', 'sodium'
    ];

    const lowerMessage = message.toLowerCase();
    return chemistryKeywords.some(keyword => lowerMessage.includes(keyword));
}

module.exports = {
    getAIResponse,
    isChemistryRelated
};
