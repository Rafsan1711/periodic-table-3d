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
    
    // Production (Render.com or Netlify)
    // UPDATE THIS URL when you deploy backend to Render.com
    return 'https://periodic-table-3d-chemai.onrender.com/api';
})();

/**
 * Send message to AI
 */
async function sendMessage(message, chatHistory = [], model = 'vicuna') {
    // If backend not available, return mock response
    if (!backendAvailable) {
        console.warn('⚠️ Using mock response (backend not connected)');
        return {
            success: true,
            message: "I'm ChemAI, your chemistry assistant! (Note: Backend is not connected yet. Please start the backend server or deploy to Render.com to get real AI responses.)\n\nFor now, I can tell you that chemistry is fascinating! Once the backend is connected, I'll be able to answer all your chemistry questions in detail.",
            model: model,
            timestamp: Date.now()
        };
    }

    try {
        console.log('📤 Sending message to AI:', { message, model, historyLength: chatHistory.length });

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
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
        console.error('❌ API Error:', error);
        
        // Return user-friendly error
        return {
            success: false,
            error: error.message || 'Failed to get response from AI',
            message: 'Sorry, I encountered an error connecting to the AI service. Please make sure the backend server is running.',
            timestamp: Date.now()
        };
    }
}

/**
 * Check API health
 */
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API is healthy:', data);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ API health check failed:', error);
        return false;
    }
}

/**
 * Validate chemistry question
 */
function isChemistryRelated(message) {
    // Basic client-side validation
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
    if (error.message.includes('fetch')) {
        return 'Unable to connect to server. Please check your internet connection.';
    }
    if (error.message.includes('timeout')) {
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
    API_URL
};

console.log('✅ ChemAI API module loaded');
console.log('🔗 API URL:', API_URL);
