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
            showNotification('Please log in to use ChemAI', 'error');
            return;
        }

        // Check API health (don't fail if unavailable)
        const isHealthy = await window.ChemAIAPI.checkAPIHealth();
        if (!isHealthy) {
            console.warn('⚠️ Backend API is not reachable - UI will work, but AI responses will be mocked');
            showNotification('Backend not connected. UI is ready, but start backend for AI responses.', 'info');
        } else {
            console.log('✅ Backend connected successfully');
        }

        // Initialize UI
        window.ChemAIUI.init();

        chemaiInitialized = true;
        console.log('✅ ChemAI initialized successfully');

    } catch (error) {
        console.error('❌ ChemAI initialization error:', error);
        showNotification('Failed to initialize ChemAI', 'error');
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
