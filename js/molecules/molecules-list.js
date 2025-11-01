/**
 * Molecules List Module - MOBILE OPTIMIZED
 * Virtual scrolling + batch rendering for smooth performance
 */

let virtualScrollContainer = null;
let visibleMolecules = [];
let allFilteredMolecules = [];
const ITEMS_PER_BATCH = 20; // Load 20 at a time
let currentBatch = 0;
let isLoadingMore = false;

/**
 * Renders the molecules list with virtual scrolling
 */
function renderMoleculesList(query = '') {
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) {
        console.error('Molecules list element not found');
        return;
    }
    
    console.log('ðŸ§ª Rendering molecules list (Virtual Scroll), query:', query);
    
    // Clear previous content
    moleculesListEl.innerHTML = '';
    currentBatch = 0;
    isLoadingMore = false;
    
    // Filter molecules
    const q = (query || '').trim();
    const items = moleculesData.map(m => {
        const score = q ? Math.max(
            scoreMatch(q, m.name), 
            scoreMatch(q, m.formula), 
            scoreMatch(q, m.id)
        ) : 0;
        return { m, score };
    });

    allFilteredMolecules = q ? items.filter(item => item.score > 0) : items;

    // Sort
    if (currentSortMode === 'az' && !q) {
        allFilteredMolecules.sort((a, b) => a.m.name.localeCompare(b.m.name));
    } else {
        allFilteredMolecules.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.m.name.localeCompare(b.m.name);
        });
    }

    // Empty state
    if (allFilteredMolecules.length === 0) {
        moleculesListEl.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-secondary); opacity: 0.5;"></i>
                <p style="color: var(--text-secondary); margin-top: 16px; font-size: 1.1rem;">
                    No molecules found
                </p>
            </div>
        `;
        return;
    }

    // Create virtual scroll container
    virtualScrollContainer = document.createElement('div');
    virtualScrollContainer.className = 'virtual-scroll-container';
    virtualScrollContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.75rem;
        min-height: 200px;
    `;
    moleculesListEl.appendChild(virtualScrollContainer);

    // Load first batch
    loadMoreMolecules();

    // Setup infinite scroll
    setupInfiniteScroll();
}

/**
 * Load more molecules (batch loading)
 */
function loadMoreMolecules() {
    if (isLoadingMore) return;
    
    const startIdx = currentBatch * ITEMS_PER_BATCH;
    const endIdx = Math.min(startIdx + ITEMS_PER_BATCH, allFilteredMolecules.length);
    
    if (startIdx >= allFilteredMolecules.length) return;
    
    isLoadingMore = true;
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        
        for (let i = startIdx; i < endIdx; i++) {
            const item = allFilteredMolecules[i];
            const div = createMoleculeItem(item.m, i);
            fragment.appendChild(div);
        }
        
        virtualScrollContainer.appendChild(fragment);
        
        currentBatch++;
        isLoadingMore = false;
        
        // Initialize tooltips for new batch
        if (typeof tippy !== 'undefined') {
            tippy('[data-tippy-content]', {
                arrow: true,
                animation: 'scale',
                theme: 'dark',
                delay: [200, 0]
            });
        }
    });
}

/**
 * Create single molecule item (optimized)
 */
function createMoleculeItem(molecule, index) {
    const div = document.createElement('div');
    div.className = 'molecule-item';
    div.setAttribute('data-aos', 'fade-up');
    div.setAttribute('data-aos-delay', Math.min((index % ITEMS_PER_BATCH) * 30, 300));
    
    div.setAttribute('data-tippy-content', `
        <strong>${molecule.name}</strong><br>
        Formula: ${molecule.formula}<br>
        Atoms: ${molecule.atoms.length}
    `);
    
    div.innerHTML = `
        <div class="molecule-badge">${molecule.formula}</div>
        <div class="molecule-meta">
            <div class="molecule-name">${molecule.name}</div>
            <div class="molecule-formula">${molecule.formula}</div>
        </div>
        <i class="fas fa-chevron-right" style="color: var(--text-secondary); opacity: 0.5; margin-left: auto;"></i>
    `;
    
    // Passive event listener for better scroll performance
    div.addEventListener('click', () => {
        if ('vibrate' in navigator) navigator.vibrate(10);
        div.style.transform = 'scale(0.95)';
        setTimeout(() => {
            div.style.transform = '';
            openMatterModal(molecule);
        }, 100);
    }, { passive: true });
    
    return div;
}

/**
 * Setup infinite scroll
 */
function setupInfiniteScroll() {
    const wrapper = document.querySelector('.molecules-list-wrapper');
    if (!wrapper) return;
    
    let scrollTimeout;
    
    wrapper.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            const scrollTop = wrapper.scrollTop;
            const scrollHeight = wrapper.scrollHeight;
            const clientHeight = wrapper.clientHeight;
            
            // Load more when 80% scrolled
            if (scrollTop + clientHeight >= scrollHeight * 0.8) {
                loadMoreMolecules();
            }
        }, 100);
    }, { passive: true });
}

/**
 * Highlight matching text
 */
function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--accent-blue); color: white; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}
