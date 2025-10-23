/**
 * Molecules List Module (OPTIMIZED - Virtual Scrolling)
 * ✅ Progressive loading - UI কখনো block হবে না
 * ✅ Memory efficient
 * ✅ Smooth scrolling
 */

let displayedMolecules = [];
let allFilteredMolecules = [];
const BATCH_SIZE = 20; // একবারে 20টা render হবে
let currentBatch = 0;
let isRendering = false;
let scrollObserver = null;

/**
 * Initialize Intersection Observer for lazy loading
 */
function initMoleculesLazyLoad() {
    // Create sentinel element
    const sentinel = document.createElement('div');
    sentinel.id = 'molecules-sentinel';
    sentinel.style.cssText = 'height: 1px; width: 100%;';
    
    // Cleanup old observer
    if (scrollObserver) {
        scrollObserver.disconnect();
    }
    
    // Create new observer
    scrollObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isRendering) {
            if (currentBatch * BATCH_SIZE < allFilteredMolecules.length) {
                renderNextBatch();
            }
        }
    }, { 
        rootMargin: '200px',
        threshold: 0.1
    });
    
    return { sentinel, observer: scrollObserver };
}

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
    
    // Reset state
    currentBatch = 0;
    displayedMolecules = [];
    isRendering = false;
    moleculesListEl.innerHTML = '';
    
    // Disconnect old observer
    if (scrollObserver) {
        scrollObserver.disconnect();
    }
    
    // Show loading state briefly
    moleculesListEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 20px;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading molecules...</span>
            </div>
        </div>
    `;
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        renderMoleculesContent(query);
    });
}

/**
 * Render molecules content with filtering and sorting
 */
function renderMoleculesContent(query) {
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

    allFilteredMolecules = filteredItems;

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

    // Setup lazy loading
    const { sentinel, observer } = initMoleculesLazyLoad();
    moleculesListEl.appendChild(sentinel);
    observer.observe(sentinel);
    
    // Render first batch immediately
    renderNextBatch();
    
    console.log(`✅ Prepared ${filteredItems.length} molecules for progressive loading`);
}

/**
 * Render next batch of molecules (Progressive Loading)
 */
function renderNextBatch() {
    if (isRendering) return;
    
    isRendering = true;
    const moleculesListEl = document.getElementById('moleculesList');
    const sentinel = document.getElementById('molecules-sentinel');
    
    if (!moleculesListEl || !sentinel) {
        isRendering = false;
        return;
    }
    
    const start = currentBatch * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, allFilteredMolecules.length);
    const batch = allFilteredMolecules.slice(start, end);
    
    if (batch.length === 0) {
        isRendering = false;
        return;
    }
    
    console.log(`📦 Rendering batch ${currentBatch + 1}: ${start}-${end} of ${allFilteredMolecules.length}`);
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        
        batch.forEach((item, index) => {
            const div = createMoleculeElement(item.m, start + index);
            fragment.appendChild(div);
            displayedMolecules.push(item.m);
        });
        
        // Insert before sentinel
        moleculesListEl.insertBefore(fragment, sentinel);
        
        currentBatch++;
        isRendering = false;
        
        // Initialize tooltips for new elements
        initTooltipsForBatch();
        
        // Refresh AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    });
}

/**
 * Create single molecule element (Reusable & Optimized)
 */
function createMoleculeElement(molecule, index) {
    const div = document.createElement('div');
    div.className = 'molecule-item';
    div.setAttribute('data-aos', 'fade-up');
    div.setAttribute('data-aos-delay', Math.min((index % BATCH_SIZE) * 15, 200));
    
    // Tooltip data
    div.setAttribute('data-tippy-content', `
        <strong>${molecule.name}</strong><br>
        Formula: ${molecule.formula}<br>
        Atoms: ${molecule.atoms.length}<br>
        Bonds: ${molecule.bonds.length}
    `);
    
    div.innerHTML = `
        <div class="molecule-badge">${molecule.formula}</div>
        <div class="molecule-meta">
            <div class="molecule-name">${molecule.name}</div>
            <div class="molecule-formula">${molecule.formula}</div>
        </div>
        <i class="fas fa-chevron-right" style="color: var(--text-secondary); opacity: 0.5; margin-left: auto;"></i>
    `;
    
    // Click handler with optimization
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
    }, { passive: true });
    
    return div;
}

/**
 * Initialize tooltips for new batch (Optimized)
 */
function initTooltipsForBatch() {
    if (typeof tippy === 'undefined') return;
    
    // Only init tooltips for new elements without tooltips
    const newElements = document.querySelectorAll('.molecule-item[data-tippy-content]:not([data-tippy-root])');
    
    if (newElements.length > 0) {
        tippy(newElements, {
            arrow: true,
            animation: 'scale',
            theme: 'dark',
            delay: [200, 0],
            touch: ['hold', 500] // Better mobile experience
        });
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

/**
 * Cleanup function (call when switching pages)
 */
function cleanupMoleculesList() {
    if (scrollObserver) {
        scrollObserver.disconnect();
        scrollObserver = null;
    }
    
    displayedMolecules = [];
    allFilteredMolecules = [];
    currentBatch = 0;
    isRendering = false;
    
    console.log('🧹 Molecules list cleaned up');
}

// Make cleanup available globally
window.cleanupMoleculesList = cleanupMoleculesList;

console.log('✅ Optimized molecules list module loaded with virtual scrolling');
