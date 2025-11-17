/**
 * ============================================
 * AI CONTROLLER - VICUNA FIX + AUTO-FALLBACK
 * Vicuna না চললে automatically GPT-OSS 20B use হবে
 * ============================================
 */

const fetch = require('node-fetch');

// Model configurations - FIXED VICUNA ENDPOINT
const MODELS = {
    vicuna: {
        endpoint: 'https://api-inference.huggingface.co/models/lmsys/vicuna-13b-v1.5',
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
 * Get AI response with auto-fallback
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
        console.error(`❌ ${modelId} Error:`, error.message);
        
        // AUTO-FALLBACK: Vicuna fail → GPT-OSS 20B
        if (modelId === 'vicuna') {
            console.log('🔄 Falling back to GPT-OSS 20B...');
            try {
                const fallbackResponse = await callChatAPI(userMessage, MODELS['gpt-20b'], history);
                return {
                    response: `⚠️ **Vicuna model is currently unavailable. Switched to GPT-OSS 20B.**\n\n${fallbackResponse}`,
                    model: 'gpt-20b',
                    fallback: true,
                    timestamp: Date.now()
                };
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError.message);
            }
        }
        
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
            content: 'You are ChemAI, a helpful chemistry assistant. Provide accurate, detailed information about chemistry topics. Be friendly and educational. Format your responses professionally with proper structure.'
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
            max_tokens: 1024,
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

    throw new Error('Invalid response format from API');
}

/**
 * Call Text Generation API (Vicuna) - FIXED ENDPOINT
 */
async function callTextGenerationAPI(userMessage, modelConfig, history) {
    let prompt = 'You are ChemAI, a chemistry expert. Answer chemistry questions accurately and professionally.\n\n';
    
    if (history && history.length > 0) {
        const recentHistory = history.slice(-6);
        recentHistory.forEach(msg => {
            if (msg.role === 'user') {
                prompt += `Human: ${msg.content}\n`;
            } else {
                prompt += `Assistant: ${msg.content}\n`;
            }
        });
    }
    
    prompt += `Human: ${userMessage}\nAssistant:`;

    console.log('📝 Sending to Vicuna, prompt length:', prompt.length);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
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
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Vicuna API error: ${response.status} - ${errorText}`);
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
                cleaned = "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?";
            }
            
            return cleaned;
        }

        throw new Error('Invalid response format from Vicuna API');

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Vicuna request timeout (30s)');
        }
        throw error;
    }
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
    const hasKeyword = chemistryKeywords.some(keyword => lowerMessage.includes(keyword));
    const formulaPattern = /\b[A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)*\b/;
    const hasFormula = formulaPattern.test(message);

    return hasKeyword || hasFormula;
}

module.exports = {
    getAIResponse,
    isChemistryRelated
};
