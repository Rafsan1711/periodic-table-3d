/**
 * ============================================
 * AI CONTROLLER - ENHANCED WITH WIKIPEDIA
 * Professional formatting like ChatGPT/Claude
 * ============================================
 */

const fetch = require('node-fetch');

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
 * Get AI response with Wikipedia integration
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

        // Enhance response with Wikipedia if chemistry topic
        const enhancedResponse = await enhanceWithWikipedia(response, userMessage);

        console.log('✅ AI response received and enhanced');

        return {
            response: enhancedResponse,
            model: modelId,
            timestamp: Date.now()
        };

    } catch (error) {
        console.error(`❌ ${modelId} Error:`, error.message);
        
        if (modelId === 'vicuna') {
            console.log('🔄 Falling back to GPT-OSS 20B...');
            try {
                const fallbackResponse = await callChatAPI(userMessage, MODELS['gpt-20b'], history);
                const enhancedFallback = await enhanceWithWikipedia(fallbackResponse, userMessage);
                
                return {
                    response: `⚠️ **Vicuna model unavailable. Using GPT-OSS 20B.**\n\n${enhancedFallback}`,
                    model: 'gpt-20b',
                    fallback: true,
                    timestamp: Date.now()
                };
            } catch (fallbackError) {
                console.error('❌ Fallback failed:', fallbackError.message);
            }
        }
        
        throw error;
    }
}

/**
 * Call Chat API with professional formatting prompt
 */
async function callChatAPI(userMessage, modelConfig, history) {
    const messages = [
        {
            role: 'system',
            content: `You are ChemAI, a professional chemistry assistant. 

FORMAT YOUR RESPONSES LIKE THIS:
- Use **bold** for important terms and concepts
- Use proper headings with ## for main topics
- Use bullet points with - for lists
- Use numbered lists with 1. 2. 3. for steps
- Use \`code\` for chemical formulas
- Add relevant emojis naturally in context (💧 for water, ⚛️ for atom, etc.)
- Structure your response with clear sections

Example format:
## Water Structure

**Water (H₂O)** is a chemical compound consisting of:
- Two hydrogen atoms 🎈
- One oxygen atom 🫁

The molecule has a bent shape with an angle of 104.5°.

Always be accurate, educational, and well-formatted.`
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
            max_tokens: 1500,
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
    let prompt = `You are ChemAI, a professional chemistry assistant. Format responses with **bold**, headings, lists, and emojis.\n\n`;
    
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
                    max_new_tokens: 500,
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
            throw new Error(`Vicuna error: ${response.status}`);
        }

        const data = await response.json();
        let generatedText = null;

        if (Array.isArray(data) && data[0]?.generated_text) {
            generatedText = data[0].generated_text;
        } else if (data.generated_text) {
            generatedText = data.generated_text;
        }

        if (generatedText) {
            return generatedText.replace(/^(Human:|Assistant:)/i, '').trim();
        }

        throw new Error('Invalid Vicuna response');

    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Enhance response with Wikipedia (merged into response)
 */
async function enhanceWithWikipedia(aiResponse, userMessage) {
    try {
        const entity = detectChemistryEntity(userMessage);
        if (!entity) return aiResponse;

        console.log('📚 Fetching Wikipedia for:', entity);

        const wikiResponse = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(entity)}`,
            { timeout: 5000 }
        );

        if (wikiResponse.ok) {
            const wikiData = await wikiResponse.json();
            if (wikiData.extract) {
                // Merge Wikipedia into AI response
                const wikiSection = `\n\n---\n\n📚 **Additional Information** *(from Wikipedia)*\n\n${wikiData.extract}\n\n*Source: [Wikipedia](https://en.wikipedia.org/wiki/${encodeURIComponent(entity)})*`;
                return aiResponse + wikiSection;
            }
        }
    } catch (error) {
        console.warn('Wikipedia fetch failed:', error.message);
    }

    return aiResponse;
}

/**
 * Detect chemistry entity from user message
 */
function detectChemistryEntity(message) {
    const lowerMsg = message.toLowerCase();
    
    // Common elements
    const elements = {
        'hydrogen': 'Hydrogen',
        'oxygen': 'Oxygen',
        'carbon': 'Carbon',
        'nitrogen': 'Nitrogen',
        'water': 'Water',
        'h2o': 'Water',
        'co2': 'Carbon_dioxide',
        'carbon dioxide': 'Carbon_dioxide',
        'methane': 'Methane',
        'ch4': 'Methane',
        'ammonia': 'Ammonia',
        'nh3': 'Ammonia',
        'sodium': 'Sodium',
        'chlorine': 'Chlorine',
        'gold': 'Gold',
        'silver': 'Silver',
        'iron': 'Iron',
        'copper': 'Copper',
        'helium': 'Helium',
        'neon': 'Neon',
        'benzene': 'Benzene',
        'ethanol': 'Ethanol',
        'glucose': 'Glucose',
        'dna': 'DNA',
        'protein': 'Protein',
        'enzyme': 'Enzyme',
        'atom': 'Atom',
        'molecule': 'Molecule',
        'periodic table': 'Periodic_table'
    };

    for (const [key, value] of Object.entries(elements)) {
        if (lowerMsg.includes(key)) {
            return value;
        }
    }

    return null;
}

/**
 * Check if chemistry-related
 */
function isChemistryRelated(message) {
    const keywords = [
        'element', 'atom', 'molecule', 'compound', 'reaction', 'periodic',
        'chemical', 'chemistry', 'bond', 'ion', 'electron', 'proton', 'neutron',
        'formula', 'equation', 'balance', 'stoichiometry', 'mole', 'molarity',
        'concentration', 'mass', 'weight', 'molecular', 'organic', 'inorganic',
        'acid', 'base', 'ph', 'oxidation', 'reduction', 'catalyst',
        'h2o', 'co2', 'nacl', 'h2', 'o2', 'water', 'oxygen', 'hydrogen'
    ];

    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
}

module.exports = {
    getAIResponse,
    isChemistryRelated
};
