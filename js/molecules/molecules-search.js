/**
 * Molecules Search Module (MOBILE OPTIMIZED)
 * Handles search functionality with debouncing
 */

let currentSortMode = 'az';
let searchDebounce = null;

/**
 * Initialize search functionality with mobile optimization
 */
function initMoleculesSearch() {
    const moleculeSearch = document.getElementById('moleculeSearch');
    const sortAZ = document.getElementById('sortAZ');
    const sortScore = document.getElementById('sortScore');

    if (!moleculeSearch) return;

    // OPTIMIZED: Use longer debounce on mobile (300ms vs 180ms)
    const debounceTime = (isMobileDevice && isMobileDevice()) ? 300 : 180;

    moleculeSearch.addEventListener('input', (e) => {
        if (searchDebounce) clearTimeout(searchDebounce);
        
        // Show loading indicator
        const moleculesList = document.getElementById('moleculesList');
        if (moleculesList && e.target.value.trim()) {
            moleculesList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 20px;">
                    <div class="spinner-border spinner-border-sm text-primary"></div>
                    <span style="color: var(--text-secondary); margin-left: 10px;">Searching...</span>
                </div>
            `;
        }
        
        searchDebounce = setTimeout(() => {
            renderMoleculesList(e.target.value);
        }, debounceTime);
    });

    // Sort handlers
    if (sortAZ) {
        sortAZ.addEventListener('click', () => {
            currentSortMode = 'az';
            sortAZ.classList.add('active');
            if (sortScore) sortScore.classList.remove('active');
            renderMoleculesList(moleculeSearch.value);
        });
    }

    if (sortScore) {
        sortScore.addEventListener('click', () => {
            currentSortMode = 'score';
            sortScore.classList.add('active');
            if (sortAZ) sortAZ.classList.remove('active');
            renderMoleculesList(moleculeSearch.value);
        });
    }
    
    console.log('✅ Molecules search initialized (Mobile Optimized)');
}
