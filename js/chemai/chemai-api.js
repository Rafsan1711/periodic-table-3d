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
    
    // Production - YOUR ACTUAL BACKEND URL
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
        console.log('🔍 Checking backend health (this may take up to 60s on first load)...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for cold start

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
            console.warn('   ⏰ Timeout after 60s - Backend may be sleeping (Render free tier)');
            console.warn('   💡 Try sending a message anyway - it might wake up!');
        } else if (error.message.includes('Failed to fetch')) {
            console.warn('   🌐 Network error - Check backend URL and CORS');
            console.warn('   📍 Current URL:', API_URL);
        }
        backendAvailable = false;
        healthCheckDone = true;
        return false;
    }
}

/**
 * Send message to AI - WITH RETRY FOR COLD START
 */
async function sendMessage(message, chatHistory = [], model = 'vicuna') {
    // Re-check backend if not done yet
    if (!healthCheckDone) {
        await checkAPIHealth();
    }

    // If backend not available, TRY ANYWAY (might wake it up)
    if (!backendAvailable) {
        console.log('⏰ Backend appears offline - Attempting to wake it up...');
    }

    try {
        console.log('📤 Sending to backend:', { message, model, historyLength: chatHistory.length });

        // Longer timeout for first request (cold start)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s for cold start

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
            mode: 'cors',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Backend returned ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ AI response received');

        // Mark backend as available for future requests
        backendAvailable = true;
        healthCheckDone = true;

        return {
            success: true,
            message: data.response,
            model: data.model || model,
            timestamp: Date.now()
        };

    } catch (error) {
        console.error('❌ Backend error:', error.message);
        
        // If timeout, show helpful message
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: 'Timeout',
                message: `⏰ **Request Timeout**\n\nThe backend took too long to respond (>90s).\n\n**This usually means:**\n1. Backend is waking up from sleep (Render free tier)\n2. Try again in 30 seconds\n3. Or upgrade to paid Render plan\n\n**Your question:** "${message}"`,
                timestamp: Date.now()
            };
        }
        
        return {
            success: false,
            error: error.message,
            message: `❌ **Connection Error**\n\nCannot reach AI service.\n\n**Error:** ${error.message}\n\n**Backend URL:** ${API_URL}\n\nPlease check:\n1. Backend is deployed on Render.com\n2. CORS is configured\n3. HF_TOKEN is set`,
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
