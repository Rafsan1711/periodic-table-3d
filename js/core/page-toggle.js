/**
 * ============================================
 * PAGE-TOGGLE.JS - COMPLETE FILE WITH BEAKER
 * js/core/page-toggle.js
 * ============================================
 */

function initPageToggle() {
    const togglePeriodic = document.getElementById('togglePeriodic');
    const toggleMolecules = document.getElementById('toggleMolecules');
    const toggleReactions = document.getElementById('toggleReactions');
    const toggleBeaker = document.getElementById('toggleBeaker');
    const toggleCommunity = document.getElementById('toggleCommunity');
    
    // FIXED: Get correct page elements
    const periodicPage = document.querySelector('.periodic-table-wrapper')?.parentElement || document.getElementById('periodic-page');
    const moleculesPage = document.getElementById('moleculesPage');
    const reactionsPage = document.getElementById('reactionsPage');
    const beakerPage = document.getElementById('beakerPage');
    const communityPage = document.getElementById('communityPage');
    
    // Also get individual periodic table elements
    const periodicTableWrapper = document.querySelector('.periodic-table-wrapper');
    const legend = document.querySelector('.legend');
    const seriesRows = document.querySelector('.periodic-table-wrapper')?.parentElement?.querySelector('.row.g-3.mt-3');
    
    console.log('🔄 Initializing page toggle with Beaker...');
    console.log('✅ Buttons found:', {
        periodic: !!togglePeriodic,
        molecules: !!toggleMolecules,
        reactions: !!toggleReactions,
        beaker: !!toggleBeaker,
        community: !!toggleCommunity
    });
    console.log('✅ Pages found:', {
        periodic: !!periodicTableWrapper,
        molecules: !!moleculesPage,
        reactions: !!reactionsPage,
        beaker: !!beakerPage,
        community: !!communityPage
    });
    
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
        if (beakerPage) {
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
                
                // FIXED: Render molecules list properly
                setTimeout(() => {
                    const moleculesList = document.getElementById('moleculesList');
                    if (moleculesList && typeof renderMoleculesList === 'function') {
                        // Always render to ensure content shows
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
                
                // FIXED: Initialize theatre properly
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
    
    // Show Beaker (Virtual Lab)
    if (toggleBeaker) {
        toggleBeaker.addEventListener('click', () => {
            console.log('🧪 Switching to Virtual Lab (Beaker)');
            hideAllPages();
            updateButtonStates(toggleBeaker);
            
            if (beakerPage) {
                beakerPage.style.display = 'block';
                beakerPage.setAttribute('aria-hidden', 'false');
                console.log('✅ Beaker page shown');
                
                // Initialize beaker lab
                setTimeout(() => {
                    if (typeof initBeakerLab === 'function') {
                        console.log('🧪 Initializing beaker lab...');
                        initBeakerLab();
                    } else {
                        console.error('❌ initBeakerLab function not found!');
                        console.log('💡 Make sure beaker-main.js is loaded');
                    }
                }, 150);
            } else {
                console.error('❌ Beaker page not found!');
                console.log('💡 Add <div id="beakerPage"> to index.html');
            }
            
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        });
    } else {
        console.warn('⚠️ Beaker toggle button not found!');
        console.log('💡 Add <button id="toggleBeaker"> to page-toggle section');
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
    
    console.log('✅ Page toggle initialized successfully with 5 pages');
}

/**
 * Helper function to show specific page
 */
function showPeriodicPage() {
    const btn = document.getElementById('togglePeriodic');
    if (btn) {
        btn.click();
    } else {
        console.error('Periodic button not found');
    }
}

function showMoleculesPage() {
    const btn = document.getElementById('toggleMolecules');
    if (btn) {
        btn.click();
    } else {
        console.error('Molecules button not found');
    }
}

function showReactionsPage() {
    const btn = document.getElementById('toggleReactions');
    if (btn) {
        btn.click();
    } else {
        console.error('Reactions button not found');
    }
}

function showBeakerPage() {
    const btn = document.getElementById('toggleBeaker');
    if (btn) {
        btn.click();
        console.log('✅ Beaker page activated');
    } else {
        console.error('❌ Beaker button not found!');
        console.log('💡 Check if button exists in HTML:');
        console.log('   <button id="toggleBeaker" class="toggle-btn">');
    }
}

function showCommunityPage() {
    const btn = document.getElementById('toggleCommunity');
    if (btn) {
        btn.click();
    } else {
        console.error('Community button not found');
    }
}

// Export functions globally
window.initPageToggle = initPageToggle;
window.showPeriodicPage = showPeriodicPage;
window.showMoleculesPage = showMoleculesPage;
window.showReactionsPage = showReactionsPage;
window.showBeakerPage = showBeakerPage;
window.showCommunityPage = showCommunityPage;

// Debug helper
window.debugPageToggle = function() {
    console.log('🔍 Page Toggle Debug Info:');
    console.log('Buttons:', {
        periodic: document.getElementById('togglePeriodic'),
        molecules: document.getElementById('toggleMolecules'),
        reactions: document.getElementById('toggleReactions'),
        beaker: document.getElementById('toggleBeaker'),
        community: document.getElementById('toggleCommunity')
    });
    console.log('Pages:', {
        periodic: document.querySelector('.periodic-table-wrapper'),
        molecules: document.getElementById('moleculesPage'),
        reactions: document.getElementById('reactionsPage'),
        beaker: document.getElementById('beakerPage'),
        community: document.getElementById('communityPage')
    });
};

console.log('✅ Page toggle module loaded');
console.log('💡 Run debugPageToggle() to check setup');
