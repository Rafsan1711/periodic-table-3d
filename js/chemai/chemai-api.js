/**
 * ============================================
 * CHEMAI API MODULE
 * Communication with Node.js backend
 * ============================================
 */

// Backend API URL (change for production)
const API_URL = 'https://periodic-table-3d-chemai.onrender.com/api'; // Development
// const API_URL = 'https://your-backend.onrender.com/api'; // Production

/**
 * Send message to AI
 */
async function sendMessage(message, chatHistory = [], model = 'vicuna') {
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
            message: 'Sorry, I encountered an error. Please try again.',
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
