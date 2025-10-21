/**
 * Molecules List Module (MOBILE OPTIMIZED)
 * Renders and manages the molecules list display with virtual scrolling
 */

let virtualScroller = null;
let currentMoleculeItems = [];

/**
 * Renders the molecules list based on search query and sort mode
 */
function renderMoleculesList(query = '') {
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) {
        console.error('Molecules list element not found');
        return;
    }
    
    console.log('🧪 Rendering molecules list, query:', query);
    
    moleculesListEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading molecules...</span>
            </div>
            <p style="color: var(--text-secondary); margin-top: 10px;">Loading molecules...</p>
        </div>
    `;
    
    // Use RAF for smooth rendering
    requestAnimationFrame(() => {
        renderMoleculesContent(query);
    });
}

/**
 * Render molecules content with optimization
 */
function renderMoleculesContent(query) {
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) return;
    
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

    // Filter
    const filteredItems = q ? items.filter(item => item.score > 0) : items;

    // Sort
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

    currentMoleculeItems = filteredItems;
    
    // MOBILE OPTIMIZATION: Use batch rendering
    if (isMobileDevice && isMobileDevice()) {
        renderMoleculesInBatches(filteredItems, q);
    } else {
        renderMoleculesNormal(filteredItems, q);
    }
}

/**
 * OPTIMIZED: Render in batches for mobile
 */
function renderMoleculesInBatches(items, query) {
    const moleculesListEl = document.getElementById('moleculesList');
    moleculesListEl.innerHTML = '';
    
    const BATCH_SIZE = 20;
    let currentBatch = 0;
    
    function renderBatch() {
        const start = currentBatch * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, items.length);
        
        const fragment = document.createDocumentFragment();
        
        for (let i = start; i < end; i++) {
            const item = items[i];
            const div = createMoleculeItem(item.m, query, i);
            fragment.appendChild(div);
        }
        
        moleculesListEl.appendChild(fragment);
        
        currentBatch++;
        
        if (end < items.length) {
            requestAnimationFrame(renderBatch);
        } else {
            initMoleculeTooltips();
            refreshAOS();
            console.log(`✅ Rendered ${items.length} molecules (batched)`);
        }
    }
    
    renderBatch();
}

/**
 * Normal rendering for desktop
 */
function renderMoleculesNormal(items, query) {
    const moleculesListEl = document.getElementById('moleculesList');
    moleculesListEl.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    
    items.forEach((item, index) => {
        const div = createMoleculeItem(item.m, query, index);
        fragment.appendChild(div);
    });
    
    moleculesListEl.appendChild(fragment);
    
    initMoleculeTooltips();
    refreshAOS();
    
    console.log(`✅ Rendered ${items.length} molecules`);
}

/**
 * Create single molecule item
 */
function createMoleculeItem(m, query, index) {
    const div = document.createElement('div');
    div.className = 'molecule-item';
    div.setAttribute('data-aos', 'fade-up');
    div.setAttribute('data-aos-delay', Math.min(index * 20, 300));
    
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
    });
    
    return div;
}

/**
 * Initialize tooltips
 */
function initMoleculeTooltips() {
    if (typeof tippy !== 'undefined') {
        tippy('[data-tippy-content]', {
            arrow: true,
            animation: 'scale',
            theme: 'dark',
            delay: [200, 0]
        });
    }
}

/**
 * Refresh AOS
 */
function refreshAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--accent-blue); color: white; padding: 2px 4px; border-radius: 3px;">$1</mark>');
                           }
