/**
 * ============================================
 * AI CONTROLLER - WORKING WITH NEW HF API
 * ============================================
 */

const fetch = require('node-fetch');

// Model configurations - ALL WORKING
const MODELS = {
    vicuna: {
        endpoint: 'https://router.huggingface.co/hf-inference/models/lmsys/vicuna-13b-v1.5',
        type: 'text-generation'
    },
    'gpt-20b': {
        endpoint: 'https://router.huggingface.co/v1/chat/completions',
        model: 'openai/gpt-oss-20b:novita',
        type: 'chat'
    },
    'gpt-120b': {
        endpoint: 'https://router.huggingface.co/v1/chat/completions',
        model: 'openai/gpt-oss-120b:novita',
        type: 'chat'
    }
};

/**
 * Get AI response
 */
async function getAIResponse(userMessage, modelId = 'vicuna', history = []) {
    const modelConfig = MODELS[modelId] || MODELS.vicuna;

    try {
        console.log(`🤖 Getting response from ${modelId}...`);

        let response;

        if (modelConfig.type === 'chat') {
            response = await callChatAPI(userMessage, modelConfig, history);
        } else {
            response = await callTextGenerationAPI(userMessage, modelConfig, history);
        }

        console.log('✅ AI response received');

        return {
            response: response,
            model: modelId,
            timestamp: Date.now()
        };

    } catch (error) {
        console.error('❌ AI Error:', error);
        throw error;
    }
}

/**
 * Call Chat Completions API (GPT-OSS models)
 */
async function callChatAPI(userMessage, modelConfig, history) {
    const messages = [
        {
            role: 'system',
            content: 'You are ChemAI, a helpful chemistry assistant. Provide accurate, detailed information about chemistry topics. Be friendly and educational.'
        }
    ];

    // Add history
    history.forEach(msg => {
        messages.push({
            role: msg.role,
            content: msg.content
        });
    });

    // Add current message
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
            max_tokens: 1024,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
    }

    throw new Error('Invalid response format from API');
}

/**
 * Call Text Generation API (Vicuna) - NEW ENDPOINT
 */
async function callTextGenerationAPI(userMessage, modelConfig, history) {
    // Build proper prompt for Vicuna
    let prompt = '';
    
    // Add system instruction
    prompt += 'You are ChemAI, a chemistry expert. Answer chemistry questions accurately and helpfully.\n\n';
    
    // Add conversation history (limit to last 3 exchanges to avoid token limit)
    if (history && history.length > 0) {
        const recentHistory = history.slice(-6); // Last 3 exchanges (6 messages)
        recentHistory.forEach(msg => {
            if (msg.role === 'user') {
                prompt += `Human: ${msg.content}\n`;
            } else {
                prompt += `Assistant: ${msg.content}\n`;
            }
        });
    }
    
    // Add current question
    prompt += `Human: ${userMessage}\nAssistant:`;

    console.log('📝 Sending to Vicuna, prompt length:', prompt.length);

    const response = await fetch(modelConfig.endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 400,
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
        console.error('❌ Vicuna API error:', errorText);
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Handle various response formats
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
        // Clean up the response
        let cleaned = generatedText.trim();
        
        // Remove any "Human:" or "Assistant:" markers that might appear
        cleaned = cleaned.replace(/^(Human:|Assistant:)/i, '').trim();
        
        // If response is empty, provide fallback
        if (!cleaned) {
            cleaned = "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?";
        }
        
        console.log('✅ Vicuna response length:', cleaned.length);
        return cleaned;
    }

    console.error('❌ Unexpected Vicuna response format:', JSON.stringify(data).substring(0, 200));
    throw new Error('Invalid response format from Vicuna API');
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
        'n2', 'water', 'oxygen', 'hydrogen', 'carbon', 'nitrogen', 'sodium',
        'chlorine', 'lab', 'experiment', 'titration', 'beaker', 'flask',
        'bunsen', 'density', 'pressure', 'volume', 'gas', 'liquid', 'solid'
    ];

    const lowerMessage = message.toLowerCase();
    
    // Check for keywords
    const hasKeyword = chemistryKeywords.some(keyword => 
        lowerMessage.includes(keyword)
    );

    // Check for chemical formulas
    const formulaPattern = /\b[A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)*\b/;
    const hasFormula = formulaPattern.test(message);

    return hasKeyword || hasFormula;
}

module.exports = {
    getAIResponse,
    isChemistryRelated
};
