/**
 * Molecules List Module - OPTIMIZED
 * Fixed UI blocking with batch rendering
 */

/**
 * Renders molecules list - OPTIMIZED for mobile
 * @param {string} query - Search query (optional)
 */
function renderMoleculesList(query = '') {
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) {
        console.error('Molecules list element not found');
        return;
    }
    
    console.log('🧪 Rendering molecules list, query:', query);
    
    // Show loading state
    moleculesListEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading molecules...</span>
            </div>
            <p style="color: var(--text-secondary); margin-top: 10px;">Loading molecules...</p>
        </div>
    `;
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        renderMoleculesContent(query);
    });
}

/**
 * Render molecules content - BATCH RENDERING
 */
function renderMoleculesContent(query) {
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) return;
    
    moleculesListEl.innerHTML = '';
    const q = (query || '').trim();

    // Calculate scores
    const items = moleculesData.map(m => {
        const score = q ? Math.max(
            scoreMatch(q, m.name), 
            scoreMatch(q, m.formula), 
            scoreMatch(q, m.id)
        ) : 0;
        return { m, score };
    });

    // Filter and sort
    const filteredItems = q ? items.filter(item => item.score > 0) : items;

    if (currentSortMode === 'az' && !q) {
        filteredItems.sort((a, b) => a.m.name.localeCompare(b.m.name));
    } else {
        filteredItems.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.m.name.localeCompare(b.m.name);
        });
    }

    // Empty state
    if (filteredItems.length === 0) {
        moleculesListEl.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-secondary); opacity: 0.5;"></i>
                <p style="color: var(--text-secondary); margin-top: 16px; font-size: 1.1rem;">
                    No molecules found
                </p>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 8px;">
                    Try searching with different terms
                </p>
            </div>
        `;
        return;
    }

    // BATCH RENDERING - render 20 items at a time
    const batchSize = 20;
    let currentIndex = 0;

    function renderBatch() {
        const endIndex = Math.min(currentIndex + batchSize, filteredItems.length);
        const fragment = document.createDocumentFragment();

        for (let i = currentIndex; i < endIndex; i++) {
            const item = filteredItems[i];
            const div = createMoleculeItem(item, i, q);
            fragment.appendChild(div);
        }

        moleculesListEl.appendChild(fragment);
        currentIndex = endIndex;

        // Continue rendering if more items
        if (currentIndex < filteredItems.length) {
            requestAnimationFrame(renderBatch);
        } else {
            // Initialize tooltips after all rendered
            if (typeof tippy !== 'undefined') {
                tippy('[data-tippy-content]', {
                    arrow: true,
                    animation: 'scale',
                    theme: 'dark',
                    delay: [200, 0]
                });
            }
            
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
            
            console.log(`✅ Rendered ${filteredItems.length} molecules`);
        }
    }

    renderBatch();
}

/**
 * Create single molecule item element
 */
function createMoleculeItem(item, index, query) {
    const m = item.m;
    const div = document.createElement('div');
    div.className = 'molecule-item';
    div.setAttribute('data-aos', 'fade-up');
    div.setAttribute('data-aos-delay', Math.min(index * 30, 300));
    
    div.setAttribute('data-tippy-content', `
        <strong>${m.name}</strong><br>
        Formula: ${m.formula}<br>
        Atoms: ${m.atoms.length}<br>
        Bonds: ${m.bonds.length}
    `);
    
    div.innerHTML = `
        <div class="molecule-badge">${m.formula}</div>
        <div class="molecule-meta">
            <div class="molecule-name">${highlightMatch(m.name, query)}</div>
            <div class="molecule-formula">${m.formula}</div>
        </div>
        <i class="fas fa-chevron-right" style="color: var(--text-secondary); opacity: 0.5; margin-left: auto;"></i>
    `;
    
    div.addEventListener('click', () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
        
        div.style.transform = 'scale(0.95)';
        setTimeout(() => {
            div.style.transform = '';
            openMatterModal(m);
        }, 100);
    }, { passive: false });
    
    return div;
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--accent-blue); color: white; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}

window.renderMoleculesList = renderMoleculesList;
