/**
 * ============================================
 * AI CONTROLLER
 * Hugging Face API integration and logic
 * ============================================
 */

const fetch = require('node-fetch');

// Model configurations
const MODELS = {
    vicuna: {
        endpoint: 'https://router.huggingface.co/featherless-ai/v1/completions',
        type: 'completion'
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
            // Chat completions API (GPT-OSS models)
            response = await callChatAPI(userMessage, modelConfig, history);
        } else {
            // Completion API (Vicuna)
            response = await callCompletionAPI(userMessage, modelConfig, history);
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
            content: 'You are ChemAI, a helpful chemistry assistant. You provide accurate, detailed information about chemistry topics including elements, molecules, reactions, and chemical concepts. Always be friendly and educational.'
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
    
    // Extract response
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
    }

    throw new Error('Invalid response format from API');
}

/**
 * Call Completion API (Vicuna)
 */
async function callCompletionAPI(userMessage, modelConfig, history) {
    // Build prompt with history
    let prompt = 'You are ChemAI, a helpful chemistry assistant.\n\n';

    // Add history
    history.forEach(msg => {
        if (msg.role === 'user') {
            prompt += `Human: ${msg.content}\n`;
        } else {
            prompt += `Assistant: ${msg.content}\n`;
        }
    });

    // Add current message
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
                max_new_tokens: 512,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract response
    if (Array.isArray(data) && data[0] && data[0].generated_text) {
        const fullText = data[0].generated_text;
        // Extract only the assistant's response
        const assistantResponse = fullText.split('Assistant:').pop().trim();
        return assistantResponse;
    }

    throw new Error('Invalid response format from API');
}

/**
 * Check if message is chemistry-related
 */
function isChemistryRelated(message) {
    const chemistryKeywords = [
        // Basic chemistry
        'element', 'atom', 'molecule', 'compound', 'reaction', 'periodic',
        'chemical', 'chemistry', 'bond', 'ion', 'electron', 'proton', 'neutron',
        
        // Formulas and equations
        'formula', 'equation', 'balance', 'stoichiometry', 'mole', 'molarity',
        'concentration', 'mass', 'weight', 'molecular',
        
        // Types of chemistry
        'organic', 'inorganic', 'physical', 'analytical', 'biochemistry',
        
        // Reactions
        'acid', 'base', 'ph', 'oxidation', 'reduction', 'catalyst', 'synthesis',
        'combustion', 'precipitation', 'neutralization',
        
        // Solutions
        'solution', 'solvent', 'solute', 'dissolve', 'saturated', 'dilute',
        
        // Atomic structure
        'valence', 'orbital', 'shell', 'subshell', 'quantum', 'nucleus',
        
        // Specific elements (partial list)
        'hydrogen', 'oxygen', 'carbon', 'nitrogen', 'sodium', 'chlorine',
        'h2o', 'co2', 'nacl', 'h2', 'o2', 'n2',
        
        // Lab terms
        'lab', 'experiment', 'titration', 'beaker', 'flask', 'bunsen'
    ];

    const lowerMessage = message.toLowerCase();
    
    // Check for keywords
    const hasKeyword = chemistryKeywords.some(keyword => 
        lowerMessage.includes(keyword)
    );

    // Check for chemical formulas (e.g., H2O, CO2, NaCl)
    const formulaPattern = /\b[A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)*\b/;
    const hasFormula = formulaPattern.test(message);

    return hasKeyword || hasFormula;
}

module.exports = {
    getAIResponse,
    isChemistryRelated
};
