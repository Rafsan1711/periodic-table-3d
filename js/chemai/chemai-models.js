/**
 * ============================================
 * CHEMAI MODELS MODULE
 * AI Model configurations and management
 * ============================================
 */

// Model Configurations
const CHEMAI_MODELS = {
    vicuna: {
        id: 'vicuna',
        name: 'Vicuna 13B',
        displayName: 'Vicuna 13B',
        description: 'Fast and efficient - Best for quick questions',
        endpoint: 'https://router.huggingface.co/featherless-ai/v1/completions',
        type: 'completion', // completion API
        icon: 'fa-brain',
        color: '#58a6ff',
        maxTokens: 2048,
        temperature: 0.7,
        default: true
    },
    'gpt-20b': {
        id: 'gpt-20b',
        name: 'GPT-OSS 20B',
        displayName: 'GPT-OSS 20B',
        description: 'Balanced performance - Good for detailed answers',
        endpoint: 'https://router.huggingface.co/v1/chat/completions',
        type: 'chat', // chat completions API
        model: 'openai/gpt-oss-20b:novita',
        icon: 'fa-rocket',
        color: '#7ce38b',
        maxTokens: 4096,
        temperature: 0.8,
        default: false
    },
    'gpt-120b': {
        id: 'gpt-120b',
        name: 'GPT-OSS 120B',
        displayName: 'GPT-OSS 120B',
        description: 'Most advanced - Best for complex chemistry',
        endpoint: 'https://router.huggingface.co/v1/chat/completions',
        type: 'chat', // chat completions API
        model: 'openai/gpt-oss-120b:novita',
        icon: 'fa-star',
        color: '#bc8cff',
        maxTokens: 8192,
        temperature: 0.9,
        default: false
    }
};

// Current selected model
let currentModel = 'vicuna'; // Default

/**
 * Get model configuration
 */
function getModel(modelId) {
    return CHEMAI_MODELS[modelId] || CHEMAI_MODELS.vicuna;
}

/**
 * Set current model
 */
function setCurrentModel(modelId) {
    if (CHEMAI_MODELS[modelId]) {
        currentModel = modelId;
        console.log('✅ Model switched to:', CHEMAI_MODELS[modelId].displayName);
        return true;
    }
    console.error('❌ Invalid model:', modelId);
    return false;
}

/**
 * Get current model
 */
function getCurrentModel() {
    return getModel(currentModel);
}

/**
 * Get all models
 */
function getAllModels() {
    return Object.values(CHEMAI_MODELS);
}

/**
 * Format model display name
 */
function getModelDisplayName(modelId) {
    const model = getModel(modelId);
    return model.displayName;
}

/**
 * Get model icon
 */
function getModelIcon(modelId) {
    const model = getModel(modelId);
    return model.icon;
}

/**
 * Get model color
 */
function getModelColor(modelId) {
    const model = getModel(modelId);
    return model.color;
}

// Export
window.ChemAIModels = {
    MODELS: CHEMAI_MODELS,
    getModel,
    setCurrentModel,
    getCurrentModel,
    getAllModels,
    getModelDisplayName,
    getModelIcon,
    getModelColor,
    get currentModel() {
        return currentModel;
    }
};

console.log('✅ ChemAI Models module loaded');
console.log('📊 Available models:', Object.keys(CHEMAI_MODELS));
