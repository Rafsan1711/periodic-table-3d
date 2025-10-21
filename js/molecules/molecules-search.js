/**
 * Molecules Search Module (MOBILE OPTIMIZED)
 * Handles search functionality for molecules with adaptive debouncing
 */

let currentSortMode = 'az'; // 'az' or 'score'
let searchDebounce = null;

/**
 * Initialize search functionality
 */
function initMoleculesSearch() {
    const moleculeSearch = document.getElementById('moleculeSearch');
    const sortAZ = document.getElementById('sortAZ');
    const sortScore = document.getElementById('sortScore');

    // Get optimal debounce time based on device
    const debounceTime = window.MobileOptimizer ? 
        MobileOptimizer.getSettings().debounceTime : 
        180;

    console.log(`🔍 Search debounce time: ${debounceTime}ms`);

    // Search input handler with adaptive debounce
    moleculeSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        
        // Show immediate feedback
        if (searchTerm.length > 0) {
            moleculeSearch.style.borderColor = 'var(--accent-blue)';
        } else {
            moleculeSearch.style.borderColor = '';
        }
        
        if (searchDebounce) clearTimeout(searchDebounce);
        
        searchDebounce = setTimeout(() => {
            renderMoleculesList(searchTerm);
        }, debounceTime);
    });

    // Sort button handlers
    sortAZ.addEventListener('click', () => {
        currentSortMode = 'az';
        sortAZ.classList.add('active');
        sortScore.classList.remove('active');
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(5);
        }
        
        renderMoleculesList(moleculeSearch.value);
    });

    sortScore.addEventListener('click', () => {
        currentSortMode = 'score';
        sortScore.classList.add('active');
        sortAZ.classList.remove('active');
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(5);
        }
        
        renderMoleculesList(moleculeSearch.value);
    });
    
    console.log('✅ Molecules search initialized (MOBILE OPTIMIZED)');
}
