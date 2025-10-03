/**
 * Page Toggle Module (FIXED - Page switching working)
 * Handles switching between Periodic Table, Molecules, and Chemical Reactions pages
 */

/**
 * Initializes the page toggle functionality
 */
function initPageToggle() {
    const togglePeriodic = document.getElementById('togglePeriodic');
    const toggleMolecules = document.getElementById('toggleMolecules');
    const toggleReactions = document.getElementById('toggleReactions');
    
    // Get all page containers
    const periodicContainer = document.querySelector('.container-fluid');
    const periodicTableWrapper = document.querySelector('.periodic-table-wrapper');
    const lanthanideSeries = document.querySelectorAll('.lanthanide-series, .actinide-series');
    const legend = document.querySelector('.legend');
    
    const moleculesPageEl = document.getElementById('moleculesPage');
    const reactionsPageEl = document.getElementById('reactionsPage');
    
    console.log('🔄 Initializing page toggle...');
    
    // Function to hide all pages
    function hideAllPages() {
        // Hide periodic table elements
        if (periodicTableWrapper) periodicTableWrapper.style.display = 'none';
        if (legend) legend.style.display = 'none';
        lanthanideSeries.forEach(el => el.style.display = 'none');
        
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
                periodicTableWrapper.setAttribute('data-aos', 'fade-up');
            }
            if (legend) {
                legend.style.display = 'flex';
                legend.setAttribute('data-aos', 'fade-down');
            }
            lanthanideSeries.forEach(el => {
                el.style.display = 'block';
            });
            
            // Refresh AOS
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
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
                moleculesPageEl.setAttribute('data-aos', 'fade-up');
                
                // Render molecules list if not already rendered
                const moleculesList = document.getElementById('moleculesList');
                if (moleculesList && moleculesList.children.length === 0) {
                    renderMoleculesList();
                }
            }
            
            // Refresh AOS
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
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
                reactionsPageEl.setAttribute('data-aos', 'fade-up');
                
                // Initialize theatre if not already initialized
                setTimeout(() => {
                    if (!theatreRenderer) {
                        console.log('🎬 Initializing theatre...');
                        initTheatre();
                    }
                }, 100);
            }
            
            // Refresh AOS
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        });
    }
    
    // Initialize with Periodic Table visible (default)
    if (togglePeriodic) {
        togglePeriodic.click();
    }
    
    console.log('✅ Page toggle initialized successfully');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageToggle);
} else {
    initPageToggle();
}
