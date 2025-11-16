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

        // Initialize UI first (don't wait for backend)
        if (window.ChemAIUI && typeof window.ChemAIUI.init === 'function') {
            window.ChemAIUI.init();
        } else {
            console.error('❌ ChemAIUI not loaded');
            return;
        }

        chemaiInitialized = true;
        console.log('✅ ChemAI UI initialized');

        // Check backend health in background (non-blocking)
        if (window.ChemAIAPI && typeof window.ChemAIAPI.checkAPIHealth === 'function') {
            console.log('⏳ Checking backend in background...');
            window.ChemAIAPI.checkAPIHealth().then(isHealthy => {
                if (isHealthy) {
                    console.log('✅ Backend is ready!');
                    if (typeof showNotification === 'function') {
                        showNotification('ChemAI connected! 🎉', 'success');
                    }
                } else {
                    console.warn('⚠️ Backend not responding (may be sleeping)');
                    console.log('💡 Send a message to wake it up!');
                }
            });
        }

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
