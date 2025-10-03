/**
 * Page Toggle Module (FULLY FIXED)
 * Handles switching between Periodic Table, Molecules, and Chemical Reactions pages
 */

/**
 * Initializes the page toggle functionality
 */
function initPageToggle() {
    const togglePeriodic = document.getElementById('togglePeriodic');
    const toggleMolecules = document.getElementById('toggleMolecules');
    const toggleReactions = document.getElementById('toggleReactions');
    
    // Get ONLY the periodic table specific elements (NOT the whole container)
    const periodicTableWrapper = document.querySelector('.periodic-table-wrapper');
    const legend = document.querySelector('.legend');
    const lanthanideSeries = document.querySelector('.lanthanide-series');
    const actinideSeries = document.querySelector('.actinide-series');
    
    // Get other pages
    const moleculesPageEl = document.getElementById('moleculesPage');
    const reactionsPageEl = document.getElementById('reactionsPage');
    
    console.log('🔄 Initializing page toggle...');
    console.log('Elements found:', {
        periodicTableWrapper: !!periodicTableWrapper,
        legend: !!legend,
        moleculesPage: !!moleculesPageEl,
        reactionsPage: !!reactionsPageEl
    });
    
    // Function to hide all pages
    function hideAllPages() {
        // Hide periodic table elements
        if (periodicTableWrapper) {
            periodicTableWrapper.style.display = 'none';
        }
        if (legend) {
            legend.style.display = 'none';
        }
        if (lanthanideSeries) {
            lanthanideSeries.style.display = 'none';
        }
        if (actinideSeries) {
            actinideSeries.style.display = 'none';
        }
        
        // Hide molecules page
        if (moleculesPageEl) {
            moleculesPageEl.style.display = 'none';
            moleculesPageEl.setAttribute('aria-hidden', 'true');
        }
        
        // Hide reactions page
        if (reactionsPageEl) {
            reactionsPageEl.style.display = 'none';
            reactionsPageEl.setAttribute('aria-hidden', 'true');
        }
    }
    
    // Function to update button states
    function updateButtonStates(activeButton) {
        [togglePeriodic, toggleMolecules, toggleReactions].forEach(btn => {
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
            if (legend) {
                legend.style.display = 'flex';
            }
            if (lanthanideSeries) {
                lanthanideSeries.style.display = 'block';
            }
            if (actinideSeries) {
                actinideSeries.style.display = 'block';
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
            
            // Show molecules page
            if (moleculesPageEl) {
                moleculesPageEl.style.display = 'block';
                moleculesPageEl.setAttribute('aria-hidden', 'false');
                console.log('✅ Molecules page shown');
                
                // Render molecules list if empty
                setTimeout(() => {
                    const moleculesList = document.getElementById('moleculesList');
                    if (moleculesList) {
                        if (moleculesList.children.length === 0 || 
                            moleculesList.querySelector('.spinner-border')) {
                            console.log('🔄 Rendering molecules list...');
                            renderMoleculesList();
                        }
                    }
                }, 100);
            } else {
                console.error('❌ Molecules page element not found!');
            }
            
            // Refresh AOS
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        });
    }
    
    // Show Chemical Reactions
    if (toggleReactions) {
        toggleReactions.addEventListener('click', () => {
            console.log('⚗️ Switching to Reactions');
            hideAllPages();
            updateButtonStates(toggleReactions);
            
            // Show reactions page
            if (reactionsPageEl) {
                reactionsPageEl.style.display = 'block';
                reactionsPageEl.setAttribute('aria-hidden', 'false');
                console.log('✅ Reactions page shown');
                
                // Initialize theatre if not already initialized
                setTimeout(() => {
                    if (!theatreRenderer) {
                        console.log('🎬 Initializing theatre...');
                        initTheatre();
                    }
                }, 200);
            } else {
                console.error('❌ Reactions page element not found!');
            }
            
            // Refresh AOS
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
        if (lanthanideSeries) lanthanideSeries.style.display = 'block';
        if (actinideSeries) actinideSeries.style.display = 'block';
    }
    
    console.log('✅ Page toggle initialized successfully');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageToggle);
} else {
    initPageToggle();
}
