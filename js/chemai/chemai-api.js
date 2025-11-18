/**
 * ============================================
 * CHEMAI API MODULE - FIXED
 * ✅ Auto fallback: Vicuna → GPT-OSS 20B
 * ✅ Better error handling
 * ============================================
 */

// Backend API URL
const API_URL = (() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    return 'https://periodic-table-3d-chemai.onrender.com/api';
})();

let backendAvailable = false;
let healthCheckDone = false;

/**
 * Check API health
 */
async function checkAPIHealth() {
    if (healthCheckDone) return backendAvailable;

    try {
        console.log('🔍 Checking backend health...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
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
        console.warn('⚠️ Backend health check failed');
        backendAvailable = false;
        healthCheckDone = true;
        return false;
    }
}

/**
 * ✅ Send message with AUTO FALLBACK
 */
async function sendMessage(message, chatHistory = [], model = 'vicuna') {
    if (!healthCheckDone) {
        await checkAPIHealth();
    }

    try {
        console.log(`📤 Sending to backend (${model}):`, message);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                model: model,
                history: chatHistory
            }),
            mode: 'cors',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // ✅ CRITICAL: If Vicuna fails (404/500), try GPT-OSS 20B
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // If Vicuna failed and we haven't tried fallback yet
            if (model === 'vicuna' && (response.status === 404 || response.status === 500)) {
                console.warn('⚠️ Vicuna failed, trying GPT-OSS 20B...');
                
                // Retry with GPT-OSS 20B
                const fallbackResponse = await fetch(`${API_URL}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: message,
                        model: 'gpt-20b',
                        history: chatHistory
                    }),
                    mode: 'cors'
                });

                if (fallbackResponse.ok) {
                    const data = await fallbackResponse.json();
                    console.log('✅ Fallback successful (GPT-OSS 20B)');
                    
                    backendAvailable = true;
                    healthCheckDone = true;

                    return {
                        success: true,
                        message: data.response,
                        model: 'gpt-20b',
                        timestamp: Date.now(),
                        fallback: true, // ✅ Indicator
                        fallbackMessage: '⚠️ Vicuna মডেল কাজ করছে না, GPT-OSS 20B ব্যবহার করা হয়েছে।'
                    };
                }
            }
            
            throw new Error(errorData.error || `Backend returned ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ AI response received');

        backendAvailable = true;
        healthCheckDone = true;

        return {
            success: true,
            message: data.response,
            model: data.model || model,
            timestamp: Date.now(),
            fallback: false
        };

    } catch (error) {
        console.error('❌ Backend error:', error.message);
        
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: 'Timeout',
                message: `⏰ **Request Timeout**\n\nBackend took too long (>90s).\n\n**Try:**\n1. Wait 30 seconds\n2. Try again\n\n**Your question:** "${message}"`,
                timestamp: Date.now()
            };
        }
        
        return {
            success: false,
            error: error.message,
            message: `❌ **Connection Error**\n\nCannot reach AI service.\n\n**Error:** ${error.message}\n\n**Backend:** ${API_URL}\n\nCheck:\n1. Backend deployed on Render\n2. CORS configured\n3. HF_TOKEN set`,
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
 * Format chat history
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

console.log('✅ ChemAI API module loaded (with auto fallback)');
console.log('🔗 Backend URL:', API_URL);
