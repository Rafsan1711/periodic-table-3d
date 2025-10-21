/**
 * Molecules List Module (MOBILE OPTIMIZED - VIRTUAL SCROLLING)
 * Renders and manages the molecules list display with performance optimization
 */

let visibleMolecules = [];
let allMoleculesFiltered = [];
let renderBatchSize = 20; // Initial render
let renderIndex = 0;

/**
 * Renders the molecules list based on search query and sort mode
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
    
    // Use requestIdleCallback for smooth rendering
    if (window.MobileOptimizer) {
        MobileOptimizer.requestIdleCallback(() => {
            renderMoleculesContent(query);
        });
    } else {
        setTimeout(() => {
            renderMoleculesContent(query);
        }, 100);
    }
}

/**
 * Render molecules content with virtual scrolling
 */
function renderMoleculesContent(query) {
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) return;
    
    moleculesListEl.innerHTML = '';
    const q = (query || '').trim();

    // Get device settings
    const settings = window.MobileOptimizer ? 
        MobileOptimizer.getSettings() : 
        { maxVisibleItems: 50 };

    // Produce items with score
    const items = moleculesData.map(m => {
        const score = q ? Math.max(
            scoreMatch(q, m.name), 
            scoreMatch(q, m.formula), 
            scoreMatch(q, m.id)
        ) : 0;
        return { m, score };
    });

    // Filter out zero scores if searching
    const filteredItems = q ? items.filter(item => item.score > 0) : items;

    // Sort based on current mode
    if (currentSortMode === 'az' && !q) {
        filteredItems.sort((a, b) => a.m.name.localeCompare(b.m.name));
    } else {
        filteredItems.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.m.name.localeCompare(b.m.name);
        });
    }

    allMoleculesFiltered = filteredItems;
    renderIndex = 0;

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

    // Render initial batch
    renderBatch(moleculesListEl, settings.maxVisibleItems, q);
    
    // Setup infinite scroll for remaining items
    if (filteredItems.length > settings.maxVisibleItems) {
        setupInfiniteScroll(moleculesListEl, q);
    }
    
    console.log(`✅ Initial render: ${Math.min(settings.maxVisibleItems, filteredItems.length)} molecules`);
}

/**
 * Render a batch of molecules
 */
function renderBatch(container, batchSize, query) {
    const fragment = document.createDocumentFragment();
    const endIndex = Math.min(renderIndex + batchSize, allMoleculesFiltered.length);
    
    for (let i = renderIndex; i < endIndex; i++) {
        const item = allMoleculesFiltered[i];
        const div = createMoleculeItem(item.m, query, i);
        fragment.appendChild(div);
    }
    
    container.appendChild(fragment);
    renderIndex = endIndex;
    
    // Initialize tooltips for new elements
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
 * Create molecule item element
 */
function createMoleculeItem(molecule, query, index) {
    const div = document.createElement('div');
    div.className = 'molecule-item';
    
    // Stagger animation only for first batch
    if (index < 20) {
        div.setAttribute('data-aos', 'fade-up');
        div.setAttribute('data-aos-delay', Math.min(index * 30, 300));
    }
    
    // Add tooltip
    div.setAttribute('data-tippy-content', `
        <strong>${molecule.name}</strong><br>
        Formula: ${molecule.formula}<br>
        Atoms: ${molecule.atoms.length}<br>
        Bonds: ${molecule.bonds.length}
    `);
    
    div.innerHTML = `
        <div class="molecule-badge">${molecule.formula}</div>
        <div class="molecule-meta">
            <div class="molecule-name">${highlightMatch(molecule.name, query)}</div>
            <div class="molecule-formula">${molecule.formula}</div>
        </div>
        <i class="fas fa-chevron-right" style="color: var(--text-secondary); opacity: 0.5; margin-left: auto;"></i>
    `;
    
    div.addEventListener('click', () => {
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
        
        // Visual feedback
        div.style.transform = 'scale(0.95)';
        setTimeout(() => {
            div.style.transform = '';
            openMatterModal(molecule);
        }, 100);
    });
    
    return div;
}

/**
 * Setup infinite scroll for lazy loading
 */
function setupInfiniteScroll(container, query) {
    const scrollParent = container.parentElement;
    let isLoading = false;
    
    const loadMore = () => {
        if (isLoading || renderIndex >= allMoleculesFiltered.length) return;
        
        const scrollTop = scrollParent.scrollTop;
        const scrollHeight = scrollParent.scrollHeight;
        const clientHeight = scrollParent.clientHeight;
        
        // Load more when 80% scrolled
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
            isLoading = true;
            
            // Add loading indicator
            const loader = document.createElement('div');
            loader.className = 'molecules-loader';
            loader.innerHTML = `
                <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                <span style="color: var(--text-secondary); margin-left: 10px;">Loading more...</span>
            `;
            loader.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 20px;';
            container.appendChild(loader);
            
            // Load next batch
            setTimeout(() => {
                loader.remove();
                renderBatch(container, 20, query);
                isLoading = false;
            }, 300);
        }
    };
    
    // Throttle scroll event
    const throttledLoadMore = window.MobileOptimizer ? 
        MobileOptimizer.throttle(loadMore, 200) : 
        loadMore;
    
    scrollParent.addEventListener('scroll', throttledLoadMore, { passive: true });
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--accent-blue); color: white; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}
