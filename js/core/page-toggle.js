/**
 * Page Toggle Module - WITH THREE.JS CLEANUP
 */

function initPageToggle() {
    const togglePeriodic = document.getElementById('togglePeriodic');
    const toggleMolecules = document.getElementById('toggleMolecules');
    const toggleReactions = document.getElementById('toggleReactions');
    const toggleCommunity = document.getElementById('toggleCommunity');
    
    const periodicTableWrapper = document.querySelector('.periodic-table-wrapper');
    const legend = document.querySelector('.legend');
    const seriesRows = document.querySelector('.periodic-table-wrapper')?.parentElement?.querySelector('.row.g-3.mt-3');
    
    const moleculesPage = document.getElementById('moleculesPage');
    const reactionsPage = document.getElementById('reactionsPage');
    const communityPage = document.getElementById('communityPage');
    
    console.log('🔄 Initializing page toggle...');
    
    function hideAllPages() {
        if (periodicTableWrapper) periodicTableWrapper.style.display = 'none';
        if (legend) legend.style.display = 'none';
        if (seriesRows) seriesRows.style.display = 'none';
        
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
            
            // CRITICAL: Cleanup Three.js when leaving community page
            if (typeof cleanupAllThreeJSContexts === 'function') {
                cleanupAllThreeJSContexts();
            }
        }
    }
    
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
    
    // Show Molecules
    if (toggleMolecules) {
        toggleMolecules.addEventListener('click', () => {
            console.log('🧪 Switching to Molecules');
            hideAllPages();
            updateButtonStates(toggleMolecules);
            
            if (moleculesPage) {
                moleculesPage.style.display = 'block';
                moleculesPage.setAttribute('aria-hidden', 'false');
                console.log('✅ Molecules page shown');
                
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
    
    // Show Reactions
    if (toggleReactions) {
        toggleReactions.addEventListener('click', () => {
            console.log('⚗️ Switching to Reactions');
            hideAllPages();
            updateButtonStates(toggleReactions);
            
            if (reactionsPage) {
                reactionsPage.style.display = 'block';
                reactionsPage.setAttribute('aria-hidden', 'false');
                console.log('✅ Reactions page shown');
                
                // FIXED: Cleanup old theatre and init new one
                setTimeout(() => {
                    if (typeof cleanupTheatre === 'function') {
                        cleanupTheatre();
                    }
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
    
    // Show Community
    if (toggleCommunity) {
        toggleCommunity.addEventListener('click', () => {
            console.log('👥 Switching to Community');
            hideAllPages();
            updateButtonStates(toggleCommunity);
            
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
    
    // Initialize with Periodic Table visible (default)
    hideAllPages();
    if (togglePeriodic) {
        togglePeriodic.classList.add('active');
        if (periodicTableWrapper) periodicTableWrapper.style.display = 'block';
        if (legend) legend.style.display = 'flex';
        if (seriesRows) seriesRows.style.display = 'block';
    }
    
    console.log('✅ Page toggle initialized successfully');
}

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

window.initPageToggle = initPageToggle;
window.showPeriodicPage = showPeriodicPage;
window.showMoleculesPage = showMoleculesPage;
window.showReactionsPage = showReactionsPage;
window.showCommunityPage = showCommunityPage;
