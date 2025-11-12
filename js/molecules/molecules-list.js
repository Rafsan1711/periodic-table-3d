/**
 * Molecules List Module - PERFECT MOBILE-FRIENDLY VERSION
 * Infinite scroll + 3-4s shimmer + batch loading + responsive
 */

let allFilteredMolecules = [];
const ITEMS_PER_BATCH = 20; // 20 molecules per batch
let currentBatch = 0;
let isLoadingMore = false;
let currentViewMode = 'grid';
let scrollObserver = null;

/**
 * Main render function with 3-4 second shimmer effect
 */
function renderMoleculesList(query = '') {
    const moleculesListEl = document.getElementById('moleculesList');
    const moleculeCount = document.getElementById('moleculeCount');
    const loadingStatus = document.getElementById('loadingStatus');
    
    if (!moleculesListEl) {
        console.error('Molecules list element not found');
        return;
    }
    
    console.log('🧪 Rendering molecules with shimmer, query:', query);
    
    // Update loading status
    if (loadingStatus) {
        loadingStatus.textContent = 'Loading...';
        loadingStatus.style.color = 'var(--accent-orange)';
    }
    
    // Reset state
    moleculesListEl.innerHTML = '';
    currentBatch = 0;
    isLoadingMore = false;
    
    // Disconnect old observer
    if (scrollObserver) {
        scrollObserver.disconnect();
        scrollObserver = null;
    }
    
    // Show 20 shimmer skeletons immediately
    showShimmerSkeletons(moleculesListEl, 20);
    
    // Wait 3-4 seconds before showing real data
    const shimmerDelay = 3000 + Math.random() * 1000; // 3-4 seconds
    
    setTimeout(() => {
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

        // Update count
        if (moleculeCount) {
            const count = allFilteredMolecules.length;
            moleculeCount.textContent = `${count} molecule${count !== 1 ? 's' : ''}`;
        }

        // Clear skeletons
        moleculesListEl.innerHTML = '';

        // Empty state
        if (allFilteredMolecules.length === 0) {
            moleculesListEl.innerHTML = `
                <div class="molecules-empty">
                    <i class="fas fa-flask"></i>
                    <h3>No molecules found</h3>
                    <p>${q ? 'Try a different search term' : 'No molecules available'}</p>
                </div>
            `;
            if (loadingStatus) {
                loadingStatus.textContent = 'No results';
                loadingStatus.style.color = 'var(--text-secondary)';
            }
            return;
        }

        // Load first batch (20 molecules)
        loadMoreMolecules();

        // Setup infinite scroll with Intersection Observer
        setupInfiniteScrollObserver();

        // Update status
        if (loadingStatus) {
            loadingStatus.textContent = 'Ready';
            loadingStatus.style.color = 'var(--accent-green)';
        }
    }, shimmerDelay);
}

/**
 * Show YouTube-style shimmer skeletons
 */
function showShimmerSkeletons(container, count) {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'molecule-item skeleton';
        skeleton.style.animationDelay = `${i * 0.05}s`;
        
        skeleton.innerHTML = `
            <div class="molecule-badge skeleton-badge"></div>
            <div class="molecule-meta">
                <div class="molecule-name skeleton-text"></div>
                <div class="molecule-formula skeleton-text"></div>
            </div>
        `;
        
        fragment.appendChild(skeleton);
    }
    
    container.appendChild(fragment);
}

/**
 * Load next batch of 20 molecules with stagger animation
 */
function loadMoreMolecules() {
    if (isLoadingMore) return;
    
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) return;
    
    const startIdx = currentBatch * ITEMS_PER_BATCH;
    const endIdx = Math.min(startIdx + ITEMS_PER_BATCH, allFilteredMolecules.length);
    
    if (startIdx >= allFilteredMolecules.length) {
        console.log('✅ All molecules loaded');
        return;
    }
    
    isLoadingMore = true;
    
    console.log(`📦 Loading batch ${currentBatch + 1}: ${startIdx} to ${endIdx}`);
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        
        for (let i = startIdx; i < endIdx; i++) {
            const item = allFilteredMolecules[i];
            const div = createMoleculeItem(item.m, i - startIdx);
            fragment.appendChild(div);
        }
        
        moleculesListEl.appendChild(fragment);
        
        currentBatch++;
        isLoadingMore = false;
        
        // Re-observe for next batch
        if (endIdx < allFilteredMolecules.length) {
            observeLastItem();
        }
        
        // Initialize tooltips
        if (typeof tippy !== 'undefined') {
            setTimeout(() => {
                tippy('[data-tippy-content]', {
                    arrow: true,
                    animation: 'scale',
                    theme: 'dark',
                    delay: [200, 0]
                });
            }, 100);
        }
    });
}

/**
 * Create molecule item with enhanced mobile-friendly design
 */
function createMoleculeItem(molecule, batchIndex) {
    const div = document.createElement('div');
    div.className = 'molecule-item';
    div.setAttribute('data-molecule-id', molecule.id);
    
    // Stagger animation
    div.style.animationDelay = `${batchIndex * 0.05}s`;
    
    div.setAttribute('data-tippy-content', `
        <strong>${molecule.name}</strong><br>
        ${molecule.formula}<br>
        ${molecule.atoms.length} atoms
    `);
    
    div.innerHTML = `
        <div class="molecule-badge">${molecule.formula}</div>
        <div class="molecule-meta">
            <div class="molecule-name">${molecule.name}</div>
            <div class="molecule-formula">${molecule.formula}</div>
        </div>
        <i class="fas fa-chevron-right molecule-arrow"></i>
    `;
    
    // Click handler with haptic feedback
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
 * Setup Intersection Observer for infinite scroll
 */
function setupInfiniteScrollObserver() {
    if (scrollObserver) {
        scrollObserver.disconnect();
    }
    
    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoadingMore) {
                console.log('🔄 Loading more molecules...');
                loadMoreMolecules();
            }
        });
    }, {
        root: document.querySelector('.molecules-list-wrapper'),
        rootMargin: '200px',
        threshold: 0.1
    });
    
    observeLastItem();
}

/**
 * Observe the last item for infinite scroll trigger
 */
function observeLastItem() {
    if (!scrollObserver) return;
    
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) return;
    
    const items = moleculesListEl.querySelectorAll('.molecule-item:not(.skeleton)');
    if (items.length === 0) return;
    
    const lastItem = items[items.length - 1];
    scrollObserver.observe(lastItem);
}

/**
 * Toggle view mode (grid/list)
 */
function setViewMode(mode) {
    const moleculesList = document.getElementById('moleculesList');
    const viewGridBtn = document.getElementById('viewGrid');
    const viewListBtn = document.getElementById('viewList');
    
    if (!moleculesList) return;
    
    currentViewMode = mode;
    
    if (mode === 'grid') {
        moleculesList.classList.remove('list-view');
        moleculesList.classList.add('grid-view');
        viewGridBtn?.classList.add('active');
        viewListBtn?.classList.remove('active');
    } else {
        moleculesList.classList.remove('grid-view');
        moleculesList.classList.add('list-view');
        viewListBtn?.classList.add('active');
        viewGridBtn?.classList.remove('active');
    }
    
    localStorage.setItem('moleculeViewMode', mode);
}

/**
 * Show search suggestions
 */
function showSearchSuggestions(query) {
    const suggestionsEl = document.getElementById('searchSuggestions');
    if (!suggestionsEl || !query || query.length < 2) {
        if (suggestionsEl) suggestionsEl.classList.remove('active');
        return;
    }
    
    const matches = moleculesData
        .map(m => ({
            ...m,
            score: Math.max(scoreMatch(query, m.name), scoreMatch(query, m.formula))
        }))
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
    
    if (matches.length === 0) {
        suggestionsEl.classList.remove('active');
        return;
    }
    
    suggestionsEl.innerHTML = matches.map(m => `
        <div class="suggestion-item" data-formula="${m.formula}">
            <div class="suggestion-badge">${m.formula}</div>
            <div class="suggestion-info">
                <div class="suggestion-name">${m.name}</div>
                <div class="suggestion-atoms">${m.atoms.length} atoms</div>
            </div>
        </div>
    `).join('');
    
    suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const formula = item.getAttribute('data-formula');
            const molecule = moleculesData.find(m => m.formula === formula);
            if (molecule) {
                openMatterModal(molecule);
            }
            suggestionsEl.classList.remove('active');
        });
    });
    
    suggestionsEl.classList.add('active');
}

/**
 * Initialize molecules search
 */
function initMoleculesSearch() {
    const moleculeSearch = document.getElementById('moleculeSearch');
    const sortAZ = document.getElementById('sortAZ');
    const sortScore = document.getElementById('sortScore');
    const viewGrid = document.getElementById('viewGrid');
    const viewList = document.getElementById('viewList');

    let searchDebounce = null;
    
    // Search with suggestions
    moleculeSearch?.addEventListener('input', (e) => {
        const query = e.target.value;
        
        // Show suggestions immediately
        showSearchSuggestions(query);
        
        // Debounce main search
        if (searchDebounce) clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            renderMoleculesList(query);
        }, 400);
    });

    // Close suggestions on blur
    moleculeSearch?.addEventListener('blur', () => {
        setTimeout(() => {
            const suggestionsEl = document.getElementById('searchSuggestions');
            if (suggestionsEl) suggestionsEl.classList.remove('active');
        }, 200);
    });

    // Sort buttons
    sortAZ?.addEventListener('click', () => {
        currentSortMode = 'az';
        sortAZ.classList.add('active');
        sortScore?.classList.remove('active');
        renderMoleculesList(moleculeSearch?.value || '');
    });

    sortScore?.addEventListener('click', () => {
        currentSortMode = 'score';
        sortScore?.classList.add('active');
        sortAZ?.classList.remove('active');
        renderMoleculesList(moleculeSearch?.value || '');
    });

    // View mode buttons
    viewGrid?.addEventListener('click', () => setViewMode('grid'));
    viewList?.addEventListener('click', () => setViewMode('list'));

    // Load saved view mode
    const savedMode = localStorage.getItem('moleculeViewMode');
    if (savedMode) {
        setViewMode(savedMode);
    }

    console.log('✅ Molecules search initialized');
}

console.log('✅ Molecules list module loaded (Perfect Mobile Version)');
