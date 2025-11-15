/**
 * ============================================
 * CHEMAI MAIN MODULE
 * Main controller and initialization
 * ============================================
 */

let chemaiInitialized = false;

/**
 * Initialize ChemAI
 */
async function initChemAI() {
    if (chemaiInitialized) {
        console.log('ℹ️ ChemAI already initialized');
        return;
    }

    console.log('🚀 Initializing ChemAI...');

    try {
        // Check if user is logged in
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('❌ User not logged in');
            if (typeof showNotification === 'function') {
                showNotification('Please log in to use ChemAI', 'error');
            }
            return;
        }

        // Check API health (don't fail if unavailable)
        if (window.ChemAIAPI && typeof window.ChemAIAPI.checkAPIHealth === 'function') {
            const isHealthy = await window.ChemAIAPI.checkAPIHealth();
            if (!isHealthy) {
                console.warn('⚠️ Backend not connected - Mock responses will be used');
                if (typeof showNotification === 'function') {
                    showNotification('UI ready! Start backend for AI responses.', 'info');
                }
            } else {
                console.log('✅ Backend connected');
            }
        }

        // Initialize UI
        if (window.ChemAIUI && typeof window.ChemAIUI.init === 'function') {
            window.ChemAIUI.init();
        } else {
            console.error('❌ ChemAIUI not loaded');
            return;
        }

        chemaiInitialized = true;
        console.log('✅ ChemAI initialized successfully');

    } catch (error) {
        console.error('❌ ChemAI initialization error:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to initialize ChemAI', 'error');
        }
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

/**
 * Reset ChemAI (for debugging)
 */
function resetChemAI() {
    chemaiInitialized = false;
    console.log('🔄 ChemAI reset');
}

// Auto-initialize when ChemAI page is shown
const chemaiPage = document.getElementById('chemaiPage');
if (chemaiPage) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style') {
                const isVisible = chemaiPage.style.display !== 'none';
                if (isVisible && !chemaiInitialized) {
                    initChemAI();
                }
            }
        });
    });

    observer.observe(chemaiPage, {
        attributes: true,
        attributeFilter: ['style']
    });
}

// Export
window.initChemAI = initChemAI;
window.resetChemAI = resetChemAI;

console.log('✅ ChemAI Main module loaded');
