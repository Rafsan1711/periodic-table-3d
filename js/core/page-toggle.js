/**
 * Page Toggle Module (UPDATED)
 * Handles switching between Periodic Table, Molecules, and Chemical Reactions pages
 */

/**
 * Initializes the page toggle functionality
 */
function initPageToggle() {
    const togglePeriodic = document.getElementById('togglePeriodic');
    const toggleMolecules = document.getElementById('toggleMolecules');
    const toggleReactions = document.getElementById('toggleReactions');
    
    const periodicPageEl = document.querySelector('.container');
    const moleculesPageEl = document.getElementById('moleculesPage');
    const reactionsPageEl = document.getElementById('reactionsPage');
    
    // Show Periodic Table
    if (togglePeriodic) {
        togglePeriodic.addEventListener('click', () => {
            // Update active states
            togglePeriodic.classList.add('active');
            toggleMolecules.classList.remove('active');
            toggleReactions.classList.remove('active');
            
            // Show/hide pages
            if (periodicPageEl) periodicPageEl.style.display = '';
            if (moleculesPageEl) {
                moleculesPageEl.style.display = 'none';
                moleculesPageEl.setAttribute('aria-hidden', 'true');
            }
            if (reactionsPageEl) {
                reactionsPageEl.style.display = 'none';
                reactionsPageEl.setAttribute('aria-hidden', 'true');
            }
        });
    }
    
    // Show Molecules
    if (toggleMolecules) {
        toggleMolecules.addEventListener('click', () => {
            // Update active states
            togglePeriodic.classList.remove('active');
            toggleMolecules.classList.add('active');
            toggleReactions.classList.remove('active');
            
            // Show/hide pages
            if (periodicPageEl) periodicPageEl.style.display = 'none';
            if (moleculesPageEl) {
                moleculesPageEl.style.display = 'block';
                moleculesPageEl.setAttribute('aria-hidden', 'false');
            }
            if (reactionsPageEl) {
                reactionsPageEl.style.display = 'none';
                reactionsPageEl.setAttribute('aria-hidden', 'true');
            }
        });
    }
    
    // Show Chemical Reactions
    if (toggleReactions) {
        toggleReactions.addEventListener('click', () => {
            // Update active states
            togglePeriodic.classList.remove('active');
            toggleMolecules.classList.remove('active');
            toggleReactions.classList.add('active');
            
            // Show/hide pages
            if (periodicPageEl) periodicPageEl.style.display = 'none';
            if (moleculesPageEl) {
                moleculesPageEl.style.display = 'none';
                moleculesPageEl.setAttribute('aria-hidden', 'true');
            }
            if (reactionsPageEl) {
                reactionsPageEl.style.display = 'block';
                reactionsPageEl.setAttribute('aria-hidden', 'false');
                
                // Initialize theatre if not already initialized
                if (!theatreRenderer) {
                    initTheatre();
                }
            }
        });
    }
                                         }
