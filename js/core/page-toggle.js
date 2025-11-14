/**
 * ============================================
 * PAGE-TOGGLE.JS UPDATE - Add Beaker Support
 * Replace the existing initPageToggle function with this
 * ============================================
 */

function initPageToggle() {
    const togglePeriodic = document.getElementById('togglePeriodic');
    const toggleMolecules = document.getElementById('toggleMolecules');
    const toggleReactions = document.getElementById('toggleReactions');
    const toggleBeaker = document.getElementById('toggleBeaker'); // NEW
    const toggleCommunity = document.getElementById('toggleCommunity');
    
    // Get page elements
    const periodicTableWrapper = document.querySelector('.periodic-table-wrapper');
    const legend = document.querySelector('.legend');
    const seriesRows = document.querySelector('.periodic-table-wrapper')?.parentElement?.querySelector('.row.g-3.mt-3');
    const moleculesPage = document.getElementById('moleculesPage');
    const reactionsPage = document.getElementById('reactionsPage');
    const beakerPage = document.getElementById('beakerPage'); // NEW
    const communityPage = document.getElementById('communityPage');
    
    console.log('🔄 Initializing page toggle with Beaker...');
    
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
        if (beakerPage) { // NEW
            beakerPage.style.display = 'none';
            beakerPage.setAttribute('aria-hidden', 'true');
        }
        if (communityPage) {
            communityPage.style.display = 'none';
            communityPage.setAttribute('aria-hidden', 'true');
        }
    }
    
    function updateButtonStates(activeButton) {
        [togglePeriodic, toggleMolecules, toggleReactions, toggleBeaker, toggleCommunity].forEach(btn => {
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
            
            if (periodicTableWrapper) periodicTableWrapper.style.display = 'block';
            if (legend) legend.style.display = 'flex';
            if (seriesRows) seriesRows.style.display = 'block';
            
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
                moleculesPage.setAttribute('aria-hidden', 'false');
                
                setTimeout(() => {
                    if (typeof renderMoleculesList === 'function') {
                        renderMoleculesList();
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
                reactionsPage.setAttribute('aria-hidden', 'false');
                
                setTimeout(() => {
                    if (typeof theatreRenderer === 'undefined' || !theatreRenderer) {
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
    
    // Show Beaker (NEW)
    if (toggleBeaker) {
        toggleBeaker.addEventListener('click', () => {
            console.log('🧪 Switching to Virtual Lab');
            hideAllPages();
            updateButtonStates(toggleBeaker);
            
            if (beakerPage) {
                beakerPage.style.display = 'block';
                beakerPage.setAttribute('aria-hidden', 'false');
                console.log('✅ Beaker page shown');
                
                // Initialize beaker on first show
                setTimeout(() => {
                    if (typeof initBeakerLab === 'function') {
                        initBeakerLab();
                    }
                }, 100);
            }
            
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        });
    }
    
    // Show Community
    if (toggleCommunity) {
        toggleCommunity.addEventListener('click', () => {
            console.log('💥 Switching to Community');
            hideAllPages();
            updateButtonStates(toggleCommunity);
            
            if (communityPage) {
                communityPage.style.display = 'block';
                communityPage.setAttribute('aria-hidden', 'false');
                
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
        if (periodicTableWrapper) periodicTableWrapper.style.display = 'block';
        if (legend) legend.style.display = 'flex';
        if (seriesRows) seriesRows.style.display = 'block';
    }
    
    console.log('✅ Page toggle initialized with Beaker support');
}

// Helper functions
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

function showBeakerPage() { // NEW
    const btn = document.getElementById('toggleBeaker');
    if (btn) btn.click();
}

function showCommunityPage() {
    const btn = document.getElementById('toggleCommunity');
    if (btn) btn.click();
}

// Export
window.initPageToggle = initPageToggle;
window.showPeriodicPage = showPeriodicPage;
window.showMoleculesPage = showMoleculesPage;
window.showReactionsPage = showReactionsPage;
window.showBeakerPage = showBeakerPage; // NEW
window.showCommunityPage = showCommunityPage;
