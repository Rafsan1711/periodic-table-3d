/**
 * ============================================
 * PAGE TOGGLE MODULE - COMPLETE WITH CHEMAI
 * Handles navigation between all pages
 * ============================================
 */

function initPageToggle() {
    const togglePeriodic = document.getElementById('togglePeriodic');
    const toggleMolecules = document.getElementById('toggleMolecules');
    const toggleReactions = document.getElementById('toggleReactions');
    const toggleChemAI = document.getElementById('toggleChemAI'); // NEW
    const toggleCommunity = document.getElementById('toggleCommunity');
    
    // Get page elements
    const periodicTableWrapper = document.querySelector('.periodic-table-wrapper');
    const legend = document.querySelector('.legend');
    const seriesRows = document.querySelector('.periodic-table-wrapper')?.parentElement?.querySelector('.row.g-3.mt-3');
    const header = document.querySelector('.header');
    const pageToggleSection = document.querySelector('.page-toggle');
    
    const moleculesPage = document.getElementById('moleculesPage');
    const reactionsPage = document.getElementById('reactionsPage');
    const communityPage = document.getElementById('communityPage');
    const chemaiPage = document.getElementById('chemaiPage'); // NEW
    
    console.log('📄 Initializing page toggle with ChemAI...');
    
    /**
     * Hide all pages
     */
    function hideAllPages() {
        // Hide periodic table elements
        if (periodicTableWrapper) periodicTableWrapper.style.display = 'none';
        if (legend) legend.style.display = 'none';
        if (seriesRows) seriesRows.style.display = 'none';
        
        // Hide other pages
        if (moleculesPage) {
            moleculesPage.style.display = 'none';
            moleculesPage.setAttribute('aria-hidden', 'true');
        }
        if (reactionsPage) {
            reactionsPage.style.display = 'none';
            reactionsPage.setAttribute('aria-hidden', 'true');
        }
        if (communityPage) {
            communityPage.style.display = 'none';
            communityPage.setAttribute('aria-hidden', 'true');
        }
        if (chemaiPage) { // NEW
            chemaiPage.style.display = 'none';
            chemaiPage.setAttribute('aria-hidden', 'true');
        }
    }
    
    /**
     * Update button states
     */
    function updateButtonStates(activeButton) {
        [togglePeriodic, toggleMolecules, toggleReactions, toggleChemAI, toggleCommunity].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        if (activeButton) activeButton.classList.add('active');
    }
    
    /**
     * Show/hide header and toggle section
     */
    function toggleHeaderVisibility(show) {
        if (header) {
            header.style.display = show ? 'block' : 'none';
        }
        if (pageToggleSection) {
            pageToggleSection.style.display = show ? 'flex' : 'none';
        }
    }
    
    /**
     * Show Periodic Table
     */
    if (togglePeriodic) {
        togglePeriodic.addEventListener('click', () => {
            console.log('📊 Switching to Periodic Table');
            hideAllPages();
            updateButtonStates(togglePeriodic);
            toggleHeaderVisibility(true);
            
            // Show periodic table elements
            if (periodicTableWrapper) {
                periodicTableWrapper.style.display = 'block';
                console.log('✅ Periodic table shown');
            }
            if (legend) legend.style.display = 'flex';
            if (seriesRows) seriesRows.style.display = 'block';
            
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        });
    }
    
    /**
     * Show Molecules
     */
    if (toggleMolecules) {
        toggleMolecules.addEventListener('click', () => {
            console.log('🧪 Switching to Molecules');
            hideAllPages();
            updateButtonStates(toggleMolecules);
            toggleHeaderVisibility(true);
            
            if (moleculesPage) {
                moleculesPage.style.display = 'block';
                moleculesPage.setAttribute('aria-hidden', 'false');
                console.log('✅ Molecules page shown');
                
                // Render molecules list
                setTimeout(() => {
                    const moleculesList = document.getElementById('moleculesList');
                    if (moleculesList && typeof renderMoleculesList === 'function') {
                        console.log('🔄 Rendering molecules list...');
                        renderMoleculesList();
                    }
                }, 100);
            }
            
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        });
    }
    
    /**
     * Show Reactions
     */
    if (toggleReactions) {
        toggleReactions.addEventListener('click', () => {
            console.log('⚗️ Switching to Reactions');
            hideAllPages();
            updateButtonStates(toggleReactions);
            toggleHeaderVisibility(true);
            
            if (reactionsPage) {
                reactionsPage.style.display = 'block';
                reactionsPage.setAttribute('aria-hidden', 'false');
                console.log('✅ Reactions page shown');
                
                // Initialize theatre
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
    
    /**
     * Show ChemAI (NEW - Full Screen)
     */
    if (toggleChemAI) {
        toggleChemAI.addEventListener('click', () => {
            console.log('🤖 Switching to ChemAI');
            hideAllPages();
            updateButtonStates(null); // Don't show any toggle as active
            toggleHeaderVisibility(false); // Hide header and toggle buttons
            
            if (chemaiPage) {
                chemaiPage.style.display = 'flex';
                chemaiPage.setAttribute('aria-hidden', 'false');
                console.log('✅ ChemAI page shown');
                
                // Initialize ChemAI if not already initialized
                setTimeout(() => {
                    if (typeof initChemAI === 'function') {
                        console.log('🚀 Initializing ChemAI...');
                        initChemAI();
                    } else {
                        console.warn('⚠️ initChemAI function not found');
                    }
                }, 100);
            } else {
                console.error('❌ ChemAI page element not found');
            }
        });
    }
    
    /**
     * Show Community
     */
    if (toggleCommunity) {
        toggleCommunity.addEventListener('click', () => {
            console.log('💥 Switching to Community');
            hideAllPages();
            updateButtonStates(toggleCommunity);
            toggleHeaderVisibility(true);
            
            if (communityPage) {
                communityPage.style.display = 'block';
                communityPage.setAttribute('aria-hidden', 'false');
                console.log('✅ Community page shown');
                
                // Load forum feed
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
    
    /**
     * ChemAI Back Button Handler
     */
    const chemaiBackBtn = document.getElementById('chemaiBackBtn');
    if (chemaiBackBtn) {
        chemaiBackBtn.addEventListener('click', () => {
            console.log('⬅️ Returning to Periodic Table from ChemAI');
            if (togglePeriodic) {
                togglePeriodic.click();
            }
        });
    }
    
    // Initialize with Periodic Table visible (default)
    hideAllPages();
    if (togglePeriodic) {
        togglePeriodic.classList.add('active');
        if (periodicTableWrapper) periodicTableWrapper.style.display = 'block';
        if (legend) legend.style.display = 'flex';
        if (seriesRows) seriesRows.style.display = 'block';
    }
    toggleHeaderVisibility(true);
    
    console.log('✅ Page toggle initialized successfully (with ChemAI)');
}

/**
 * Helper functions to show specific pages
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

function showChemAIPage() {
    const btn = document.getElementById('toggleChemAI');
    if (btn) btn.click();
}

function showCommunityPage() {
    const btn = document.getElementById('toggleCommunity');
    if (btn) btn.click();
}

// Export functions
window.initPageToggle = initPageToggle;
window.showPeriodicPage = showPeriodicPage;
window.showMoleculesPage = showMoleculesPage;
window.showReactionsPage = showReactionsPage;
window.showChemAIPage = showChemAIPage;
window.showCommunityPage = showCommunityPage;

console.log('✅ Page toggle module loaded (with ChemAI support)');
