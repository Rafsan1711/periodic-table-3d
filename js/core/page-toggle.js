/**
 * Page Toggle Module (UPDATED with Community)
 * Handles switching between Periodic Table, Molecules, Reactions, and Community pages
 */

/**
 * Initialize page toggle
 */
function initPageToggle() {
    const togglePeriodic = document.getElementById('togglePeriodic');
    const toggleMolecules = document.getElementById('toggleMolecules');
    const toggleReactions = document.getElementById('toggleReactions');
    const toggleCommunity = document.getElementById('toggleCommunity');
    
    // Get page elements
    const periodicPage = document.getElementById('periodic-page');
    const moleculesPage = document.getElementById('moleculesPage');
    const reactionsPage = document.getElementById('reactionsPage');
    const communityPage = document.getElementById('communityPage');
    
    console.log('🔄 Initializing page toggle...');
    
    // Hide all pages
    function hideAllPages() {
        if (periodicPage) periodicPage.style.display = 'none';
        if (moleculesPage) moleculesPage.style.display = 'none';
        if (reactionsPage) reactionsPage.style.display = 'none';
        if (communityPage) communityPage.style.display = 'none';
    }
    
    // Update button states
    function updateButtonStates(activeButton) {
        [togglePeriodic, toggleMolecules, toggleReactions, toggleCommunity].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        if (activeButton) activeButton.classList.add('active');
    }
    
    // Show Periodic Table
    if (togglePeriodic) {
        togglePeriodic.addEventListener('click', () => {
            console.log('📊 Switching to Periodic Table');
            hideAllPages();
            updateButtonStates(togglePeriodic);
            
            if (periodicPage) {
                periodicPage.style.display = 'block';
                console.log('✅ Periodic table shown');
            }
            
            // Refresh AOS
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        });
    }
    
    // Show Molecules
    if (toggleMolecules) {
        toggleMolecules.addEventListener('click', () => {
            console.log('🧪 Switching to Molecules');
            hideAllPages();
            updateButtonStates(toggleMolecules);
            
            if (moleculesPage) {
                moleculesPage.style.display = 'block';
                console.log('✅ Molecules page shown');
                
                // Render molecules list if empty
                setTimeout(() => {
                    const moleculesList = document.getElementById('moleculesList');
                    if (moleculesList && moleculesList.children.length === 0) {
                        console.log('🔄 Rendering molecules list...');
                        if (typeof renderMoleculesList === 'function') {
                            renderMoleculesList();
                        }
                    }
                }, 100);
            }
            
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        });
    }
    
    // Show Reactions
    if (toggleReactions) {
        toggleReactions.addEventListener('click', () => {
            console.log('⚗️ Switching to Reactions');
            hideAllPages();
            updateButtonStates(toggleReactions);
            
            if (reactionsPage) {
                reactionsPage.style.display = 'block';
                console.log('✅ Reactions page shown');
                
                // Initialize theatre if not already initialized
                setTimeout(() => {
                    if (typeof theatreRenderer === 'undefined' || !theatreRenderer) {
                        console.log('🎬 Initializing theatre...');
                        if (typeof initTheatre === 'function') {
                            initTheatre();
                        }
                    }
                }, 200);
            }
            
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        });
    }
    
    // Show Community (NEW)
    if (toggleCommunity) {
        toggleCommunity.addEventListener('click', () => {
            console.log('👥 Switching to Community');
            hideAllPages();
            updateButtonStates(toggleCommunity);
            
            if (communityPage) {
                communityPage.style.display = 'block';
                console.log('✅ Community page shown');
                
                // Load forum feed if not already loaded
                setTimeout(() => {
                    if (typeof loadForumFeed === 'function') {
                        loadForumFeed();
                    }
                }, 100);
            }
            
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        });
    }
    
    // Initialize with Periodic Table visible (default)
    hideAllPages();
    if (togglePeriodic) {
        togglePeriodic.classList.add('active');
        if (periodicPage) periodicPage.style.display = 'block';
    }
    
    console.log('✅ Page toggle initialized successfully');
}

/**
 * Show specific page programmatically
 */
function showPeriodicPage() {
    const btn = document.getElementById('togglePeriodic');
    if (btn) btn.click();
}

function showMoleculesPage() {
    const btn = document.getElementById('toggleMolecules');
    if (btn) btn.click();
}

function showReactionsPage() {
    const btn = document.getElementById('toggleReactions');
    if (btn) btn.click();
}

function showCommunityPage() {
    const btn = document.getElementById('toggleCommunity');
    if (btn) btn.click();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageToggle);
} else {
    initPageToggle();
}

// Global functions
window.showPeriodicPage = showPeriodicPage;
window.showMoleculesPage = showMoleculesPage;
window.showReactionsPage = showReactionsPage;
window.showCommunityPage = showCommunityPage;
