/**
 * Molecules Search Module - PERFORMANCE OPTIMIZED
 * Fixed lag on mobile with debouncing and virtual scrolling
 */

let currentSortMode = 'az'; // 'az' or 'score'
let searchDebounce = null;

/**
 * Initialize search functionality with optimizations
 */
function initMoleculesSearch() {
    const moleculeSearch = document.getElementById('moleculeSearch');
    const sortAZ = document.getElementById('sortAZ');
    const sortScore = document.getElementById('sortScore');

    if (!moleculeSearch) return;

    // Optimized search with debounce (300ms for mobile)
    const debouncedSearch = window.mobilePerf ? 
        window.mobilePerf.debounce((query) => {
            renderMoleculesList(query);
        }, 300) :
        (query) => {
            if (searchDebounce) clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                renderMoleculesList(query);
            }, 300);
        };

    moleculeSearch.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    }, { passive: true });

    // Sort button handlers
    if (sortAZ) {
        sortAZ.addEventListener('click', () => {
            currentSortMode = 'az';
            sortAZ.classList.add('active');
            sortScore.classList.remove('active');
            renderMoleculesList(moleculeSearch.value);
        });
    }

    if (sortScore) {
        sortScore.addEventListener('click', () => {
            currentSortMode = 'score';
            sortScore.classList.add('active');
            sortAZ.classList.remove('active');
            renderMoleculesList(moleculeSearch.value);
        });
    }

    console.log('✅ Molecules search initialized (optimized)');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMoleculesSearch);
} else {
    setTimeout(initMoleculesSearch, 100);
}

window.initMoleculesSearch = initMoleculesSearch;
