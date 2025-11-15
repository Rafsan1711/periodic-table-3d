/**
 * ============================================
 * CHEMAI API MODULE - FIXED
 * ============================================
 */

// Backend API URL
const API_URL = (() => {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    
    // Production - YOUR BACKEND URL HERE
    // TODO: Replace with your actual Render.com backend URL
    return 'https://periodic-table-3d-chemai.onrender.com/api';
})();

// Backend status
let backendAvailable = false;
let healthCheckDone = false;

/**
 * Check API health with better error handling
 */
async function checkAPIHealth() {
    if (healthCheckDone) {
        return backendAvailable;
    }

    try {
        console.log('🔍 Checking backend health at:', API_URL);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
            mode: 'cors',
            cache: 'no-cache'
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connected:', data);
            backendAvailable = true;
            healthCheckDone = true;
            return true;
        } else {
            console.warn('⚠️ Backend returned:', response.status);
            backendAvailable = false;
            healthCheckDone = true;
            return false;
        }
    } catch (error) {
        console.warn('⚠️ Backend health check failed:', error.name);
        if (error.name === 'AbortError') {
            console.warn('   Timeout - Backend too slow or not responding');
        } else if (error.message.includes('Failed to fetch')) {
            console.warn('   Network error - Check backend URL and CORS');
        }
        backendAvailable = false;
        healthCheckDone = true;
        return false;
    }
}

/**
 * Send message to AI - NO MORE DOUBLE MESSAGES
 */
async function sendMessage(message, chatHistory = [], model = 'vicuna') {
    // Re-check backend if not done yet
    if (!healthCheckDone) {
        await checkAPIHealth();
    }

    // If backend not available, return mock response
    if (!backendAvailable) {
        console.log('📝 Using mock response');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
            success: true,
            message: `🧪 **ChemAI Mock Response**\n\nI received your question: "${message}"\n\n⚠️ **Backend not connected**\n\nTo get real AI responses:\n1. Check your backend URL in \`chemai-api.js\`\n2. Make sure backend is running on Render.com\n3. Check browser console for errors\n\nCurrent backend URL: \`${API_URL}\``,
            model: model,
            timestamp: Date.now()
        };
    }

    try {
        console.log('📤 Sending to backend:', { message, model, historyLength: chatHistory.length });

        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                model: model,
                history: chatHistory
            }),
            mode: 'cors'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Backend returned ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ AI response received');

        return {
            success: true,
            message: data.response,
            model: data.model || model,
            timestamp: Date.now()
        };

    } catch (error) {
        console.error('❌ Backend error:', error.message);
        
        return {
            success: false,
            error: error.message,
            message: `❌ **Connection Error**\n\nCannot reach AI service.\n\n**Error:** ${error.message}\n\n**Backend URL:** ${API_URL}\n\nPlease check:\n1. Backend is running\n2. CORS is configured\n3. URL is correct`,
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
        'mole', 'molarity', 'mass', 'weight', 'valence', 'orbital', 'shell',
        'h2o', 'co2', 'nacl', 'o2', 'h2', 'n2', 'water', 'oxygen', 'hydrogen'
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
 * Get backend status
 */
function getBackendStatus() {
    return {
        url: API_URL,
        available: backendAvailable,
        checked: healthCheckDone
    };
}

// Export
window.ChemAIAPI = {
    sendMessage,
    checkAPIHealth,
    isChemistryRelated,
    formatChatHistory,
    getBackendStatus,
    API_URL,
    get backendAvailable() {
        return backendAvailable;
    }
};

console.log('✅ ChemAI API module loaded');
console.log('🔗 Backend URL:', API_URL);
console.log('💡 Tip: Open Console to see backend connection status');
