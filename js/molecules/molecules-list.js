/**
 * Molecules List Module - PROFESSIONAL ENHANCED VERSION
 * YouTube-style shimmer loading + smooth animations + perfect UX
 */

let virtualScrollContainer = null;
let visibleMolecules = [];
let allFilteredMolecules = [];
const ITEMS_PER_BATCH = 24; // Load 24 at a time for smooth experience
let currentBatch = 0;
let isLoadingMore = false;
let currentViewMode = 'grid'; // 'grid' or 'list'

/**
 * Renders the molecules list with shimmer loading effect
 */
function renderMoleculesList(query = '') {
    const moleculesListEl = document.getElementById('moleculesList');
    const moleculeCount = document.getElementById('moleculeCount');
    const loadingStatus = document.getElementById('loadingStatus');
    
    if (!moleculesListEl) {
        console.error('Molecules list element not found');
        return;
    }
    
    console.log('🧪 Rendering molecules list (Enhanced with Shimmer), query:', query);
    
    // Show loading status
    if (loadingStatus) {
        loadingStatus.textContent = 'Loading...';
        loadingStatus.style.color = 'var(--accent-orange)';
    }
    
    // Clear previous content
    moleculesListEl.innerHTML = '';
    currentBatch = 0;
    isLoadingMore = false;
    
    // Show shimmer skeletons immediately
    showShimmerSkeletons(moleculesListEl, 12);
    
    // Simulate network delay for realistic loading experience
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
                <div class="molecules-empty" style="grid-column: 1/-1;">
                    <i class="fas fa-search"></i>
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

        // Create virtual scroll container
        virtualScrollContainer = moleculesListEl;

        // Load first batch
        loadMoreMolecules();

        // Setup infinite scroll
        setupInfiniteScroll();

        // Update loading status
        if (loadingStatus) {
            loadingStatus.textContent = 'Ready';
            loadingStatus.style.color = 'var(--accent-green)';
        }
    }, 300); // 300ms delay for realistic feel
}

/**
 * Show shimmer skeleton loaders (YouTube style)
 */
function showShimmerSkeletons(container, count) {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'molecule-item skeleton';
        skeleton.style.animationDelay = `${i * 0.05}s`;
        
        skeleton.innerHTML = `
            <div class="molecule-badge"></div>
            <div class="molecule-meta">
                <div class="molecule-name"></div>
                <div class="molecule-formula"></div>
            </div>
        `;
        
        fragment.appendChild(skeleton);
    }
    
    container.appendChild(fragment);
}

/**
 * Load more molecules (batch loading with stagger animation)
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
            const div = createMoleculeItem(item.m, i - startIdx);
            fragment.appendChild(div);
        }
        
        virtualScrollContainer.appendChild(fragment);
        
        currentBatch++;
        isLoadingMore = false;
        
        // Initialize tooltips for new batch
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
 * Create single molecule item with enhanced design
 */
function createMoleculeItem(molecule, batchIndex) {
    const div = document.createElement('div');
    div.className = 'molecule-item';
    
    // Stagger animation delay
    div.style.animationDelay = `${batchIndex * 0.05}s`;
    
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
        <i class="fas fa-chevron-right molecule-arrow"></i>
    `;
    
    // Enhanced click handler with haptic feedback
    div.addEventListener('click', () => {
        // Haptic feedback
        if ('vibrate' in navigator) navigator.vibrate(10);
        
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
 * Setup infinite scroll with Intersection Observer
 */
function setupInfiniteScroll() {
    const wrapper = document.querySelector('.molecules-list-wrapper');
    if (!wrapper) return;
    
    // Remove old observer if exists
    if (window.moleculeScrollObserver) {
        window.moleculeScrollObserver.disconnect();
    }
    
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
    
    // Save preference
    localStorage.setItem('moleculeViewMode', mode);
}

/**
 * Show search suggestions as user types
 */
function showSearchSuggestions(query) {
    const suggestionsEl = document.getElementById('searchSuggestions');
    if (!suggestionsEl || !query) {
        if (suggestionsEl) suggestionsEl.classList.remove('active');
        return;
    }
    
    // Filter top 5 matches
    const matches = moleculesData
        .map(m => ({
            ...m,
            score: Math.max(scoreMatch(query, m.name), scoreMatch(query, m.formula))
        }))
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    
    if (matches.length === 0) {
        suggestionsEl.classList.remove('active');
        return;
    }
    
    suggestionsEl.innerHTML = matches.map(m => `
        <div class="suggestion-item" data-formula="${m.formula}">
            <span class="suggestion-formula">${m.formula}</span>
            <span class="suggestion-name">${m.name}</span>
        </div>
    `).join('');
    
    // Add click handlers
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
 * Initialize molecules search with enhanced features
 */
function initMoleculesSearch() {
    const moleculeSearch = document.getElementById('moleculeSearch');
    const sortAZ = document.getElementById('sortAZ');
    const sortScore = document.getElementById('sortScore');
    const viewGrid = document.getElementById('viewGrid');
    const viewList = document.getElementById('viewList');

    // Search input handler with debounce and suggestions
    let searchDebounce = null;
    moleculeSearch?.addEventListener('input', (e) => {
        const query = e.target.value;
        
        // Show suggestions
        showSearchSuggestions(query);
        
        // Debounce main search
        if (searchDebounce) clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            renderMoleculesList(query);
        }, 300);
    });

    // Close suggestions on blur
    moleculeSearch?.addEventListener('blur', () => {
        setTimeout(() => {
            const suggestionsEl = document.getElementById('searchSuggestions');
            if (suggestionsEl) suggestionsEl.classList.remove('active');
        }, 200);
    });

    // Sort button handlers
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
    viewGrid?.addEventListener('click', () => {
        setViewMode('grid');
    });

    viewList?.addEventListener('click', () => {
        setViewMode('list');
    });

    // Load saved view mode
    const savedMode = localStorage.getItem('moleculeViewMode');
    if (savedMode) {
        setViewMode(savedMode);
    }

    console.log('✅ Enhanced molecules search initialized');
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--accent-blue); color: white; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}

// Auto-initialize when molecules page is shown
console.log('✅ Enhanced molecules list module loaded');
