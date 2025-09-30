/**
 * Molecules Search Module
 * Handles search functionality for molecules
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

    // Search input handler with debounce
    moleculeSearch.addEventListener('input', (e) => {
        if (searchDebounce) clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            renderMoleculesList(e.target.value);
        }, 180);
    });

    // Sort button handlers
    sortAZ.addEventListener('click', () => {
        currentSortMode = 'az';
        sortAZ.classList.add('active');
        sortScore.classList.remove('active');
        renderMoleculesList(moleculeSearch.value);
    });

    sortScore.addEventListener('click', () => {
        currentSortMode = 'score';
        sortScore.classList.add('active');
        sortAZ.classList.remove('active');
        renderMoleculesList(moleculeSearch.value);
    });
}
