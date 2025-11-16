/**
 * ============================================
 * CHEMAI MODELS MODULE - FIXED ENDPOINTS
 * Matches backend configuration exactly
 * ============================================
 */

const CHEMAI_MODELS = {
    vicuna: {
        id: 'vicuna',
        name: 'Vicuna 7B',
        displayName: 'Vicuna 7B',
        description: 'Fast and efficient - Best for quick questions',
        endpoint: 'https://api-inference.huggingface.co/models/lmsys/vicuna-7b-v1.5',
        type: 'text-generation',
        icon: 'fa-brain',
        color: '#58a6ff',
        maxTokens: 800,
        temperature: 0.7,
        default: true,
        fallback: 'gpt-20b'
    },
    'gpt-20b': {
        id: 'gpt-20b',
        name: 'GPT-OSS 20B',
        displayName: 'GPT-OSS 20B',
        description: 'Balanced performance - Good for detailed answers',
        endpoint: 'https://router.huggingface.co/v1/chat/completions',
        type: 'chat',
        model: 'openai/gpt-oss-20b:novita',
        icon: 'fa-rocket',
        color: '#7ce38b',
        maxTokens: 2048,
        temperature: 0.7,
        default: false,
        fallback: 'gpt-120b'
    },
    'gpt-120b': {
        id: 'gpt-120b',
        name: 'GPT-OSS 120B',
        displayName: 'GPT-OSS 120B',
        description: 'Most advanced - Best for complex chemistry',
        endpoint: 'https://router.huggingface.co/v1/chat/completions',
        type: 'chat',
        model: 'openai/gpt-oss-120b:novita',
        icon: 'fa-star',
        color: '#bc8cff',
        maxTokens: 2048,
        temperature: 0.7,
        default: false,
        fallback: null
    }
};

let currentModel = 'vicuna';

function getModel(modelId) {
    return CHEMAI_MODELS[modelId] || CHEMAI_MODELS.vicuna;
}

function setCurrentModel(modelId) {
    if (CHEMAI_MODELS[modelId]) {
        currentModel = modelId;
        console.log('✅ Model switched to:', CHEMAI_MODELS[modelId].displayName);
        return true;
    }
    console.error('❌ Invalid model:', modelId);
    return false;
}

function getCurrentModel() {
    return getModel(currentModel);
}

function getAllModels() {
    return Object.values(CHEMAI_MODELS);
}

function getModelDisplayName(modelId) {
    const model = getModel(modelId);
    return model.displayName;
}

function getModelIcon(modelId) {
    const model = getModel(modelId);
    return model.icon;
}

function getModelColor(modelId) {
    const model = getModel(modelId);
    return model.color;
}

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
console.log('🔄 Auto-fallback enabled for all models');
