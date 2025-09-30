/**
 * Molecules List Module
 * Renders and manages the molecules list display
 */

/**
 * Renders the molecules list based on search query and sort mode
 * @param {string} query - Search query (optional)
 */
function renderMoleculesList(query = '') {
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) return;
    
    moleculesListEl.innerHTML = '';
    const q = (query || '').trim();

    // Produce items with score
    const items = moleculesData.map(m => {
        const score = q ? Math.max(
            scoreMatch(q, m.name), 
            scoreMatch(q, m.formula), 
            scoreMatch(q, m.id)
        ) : 0;
        return { m, score };
    });

    // Sort based on current mode
    if (currentSortMode === 'az' && !q) {
        items.sort((a, b) => a.m.name.localeCompare(b.m.name));
    } else {
        // Sort by score desc then name
        items.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.m.name.localeCompare(b.m.name);
        });
    }

    // Render items
    items.forEach(item => {
        const m = item.m;
        const div = document.createElement('div');
        div.className = 'molecule-item';
        div.innerHTML = `
            <div class="molecule-badge">${m.formula}</div>
            <div class="molecule-meta">
                <div class="molecule-name">${m.name}</div>
                <div class="molecule-formula">${m.formula}</div>
            </div>
        `;
        div.addEventListener('click', () => openMatterModal(m));
        moleculesListEl.appendChild(div);
    });

    // Show empty state
    if (items.length === 0) {
        moleculesListEl.innerHTML = '<div style="color:var(--text-secondary);padding:12px">No molecules found</div>';
    }
}
