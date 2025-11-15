/**
 * ============================================
 * CHEMAI API MODULE
 * Communication with Node.js backend
 * ============================================
 */

// Backend API URL (auto-detects local vs production)
const API_URL = (() => {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    
    // Production - Render.com backend
    // UPDATE THIS when you deploy backend
    return 'https://periodic-table-3d-chemai.onrender.com/api';
})();

// Backend connection status (GLOBAL)
let backendAvailable = false;

/**
 * Check API health
 */
async function checkAPIHealth() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connected:', data);
            backendAvailable = true;
            return true;
        }
        
        backendAvailable = false;
        return false;
    } catch (error) {
        backendAvailable = false;
        console.warn('⚠️ Backend not available (UI will work with mock responses)');
        return false;
    }
}

/**
 * Send message to AI
 */
async function sendMessage(message, chatHistory = [], model = 'vicuna') {
    // If backend not available, return mock response
    if (!backendAvailable) {
        console.warn('⚠️ Using mock response (backend not connected)');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            success: true,
            message: `I'm ChemAI, your chemistry assistant! 🧪\n\n**Note:** Backend server is not connected yet.\n\nTo get real AI responses:\n1. Start your backend server: \`cd backend && npm start\`\n2. Or deploy to Render.com and update the API_URL\n\nOnce connected, I'll be able to answer all your chemistry questions in detail!\n\nYour question was: "${message}"`,
            model: model,
            timestamp: Date.now()
        };
    }

    try {
        console.log('📤 Sending to backend:', { message, model });

        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                model: model,
                history: chatHistory
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Received AI response');

        return {
            success: true,
            message: data.response,
            model: data.model,
            timestamp: Date.now()
        };

    } catch (error) {
        console.error('❌ Backend error:', error);
        
        return {
            success: false,
            error: error.message,
            message: '❌ Sorry, I cannot connect to the AI service right now. Please make sure the backend server is running.',
            timestamp: Date.now()
        };
    }
}

/**
 * Validate chemistry question
 */
function isChemistryRelated(message) {
    const chemistryKeywords = [
        'element', 'atom', 'molecule', 'compound', 'reaction', 'periodic',
        'chemical', 'chemistry', 'bond', 'ion', 'electron', 'proton', 'neutron',
        'formula', 'equation', 'balance', 'acid', 'base', 'ph', 'oxidation',
        'reduction', 'catalyst', 'solution', 'solvent', 'solute', 'concentration',
        'mole', 'molarity', 'mass', 'weight', 'valence', 'orbital', 'shell'
    ];

    const lowerMessage = message.toLowerCase();
    return chemistryKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Format chat history for API
 */
function formatChatHistory(messages) {
    return messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
    }));
}

/**
 * Get error message
 */
function getErrorMessage(error) {
    if (error.message && error.message.includes('fetch')) {
        return 'Unable to connect to server. Please check your connection.';
    }
    if (error.message && error.message.includes('timeout')) {
        return 'Request timeout. Please try again.';
    }
    return error.message || 'An unexpected error occurred.';
}

// Export
window.ChemAIAPI = {
    sendMessage,
    checkAPIHealth,
    isChemistryRelated,
    formatChatHistory,
    getErrorMessage,
    API_URL,
    get backendAvailable() {
        return backendAvailable;
    }
};

console.log('✅ ChemAI API module loaded');
console.log('🔗 Backend URL:', API_URL);
