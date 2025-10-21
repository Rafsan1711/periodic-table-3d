/**
 * Molecules Search Module (MOBILE OPTIMIZED)
 * Handles search functionality with performance optimization
 */

let currentSortMode = 'az';
let searchDebounce = null;
let optimizedSearch = null;

/**
 * Initialize search functionality
 */
function initMoleculesSearch() {
    const moleculeSearch = document.getElementById('moleculeSearch');
    const sortAZ = document.getElementById('sortAZ');
    const sortScore = document.getElementById('sortScore');

    if (!moleculeSearch) return;

    // Create optimized search function (uses web worker if available)
    optimizedSearch = performanceUtils.debounce((e) => {
        const query = e.target.value;
        renderMoleculesListOptimized(query);
    }, 400);

    // Search input handler with heavy debounce
    moleculeSearch.addEventListener('input', optimizedSearch, { passive: true });

    // Sort button handlers
    if (sortAZ) {
        sortAZ.addEventListener('click', () => {
            currentSortMode = 'az';
            sortAZ.classList.add('active');
            sortScore.classList.remove('active');
            renderMoleculesListOptimized(moleculeSearch.value);
        });
    }

    if (sortScore) {
        sortScore.addEventListener('click', () => {
            currentSortMode = 'score';
            sortScore.classList.add('active');
            sortAZ.classList.remove('active');
            renderMoleculesListOptimized(moleculeSearch.value);
        });
    }

    console.log('✅ Molecules Search Initialized (Optimized)');
}

/**
 * OPTIMIZED: Render molecules list with chunked rendering
 * This prevents UI blocking on mobile
 */
function renderMoleculesListOptimized(query = '') {
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) return;

    // Show loading state immediately (non-blocking)
    moleculesListEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 30px;">
            <div class="spinner-border text-primary" role="status" style="width: 40px; height: 40px;">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p style="color: var(--text-secondary); margin-top: 8px; font-size: 0.9rem;">Searching...</p>
        </div>
    `;

    // Do heavy processing in next frame
    requestAnimationFrame(() => {
        renderMoleculesContentOptimized(query);
    });
}

/**
 * OPTIMIZED: Render molecules content with chunked updates
 */
function renderMoleculesContentOptimized(query) {
    const moleculesListEl = document.getElementById('moleculesList');
    if (!moleculesListEl) return;

    const q = (query || '').trim().toLowerCase();

    // Build items array with scores
    const items = [];
    
    if (moleculesData && Array.isArray(moleculesData)) {
        moleculesData.forEach(m => {
            let score = 0;
            if (q) {
                score = Math.max(
                    scoreMatch(q, m.name.toLowerCase()),
                    scoreMatch(q, m.formula.toLowerCase()),
                    scoreMatch(q, m.id ? m.id.toLowerCase() : '')
                );
            }
            items.push({ m, score });
        });
    }

    // Filter if searching
    let filteredItems = q ? items.filter(item => item.score > 0) : items;

    // Sort
    if (currentSortMode === 'az' && !q) {
        filteredItems.sort((a, b) => a.m.name.localeCompare(b.m.name));
    } else if (filteredItems.length > 0) {
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

    // Clear container
    moleculesListEl.innerHTML = '';

    // Render in chunks (20 items at a time)
    const CHUNK_SIZE = 20;
    let chunkIndex = 0;

    const renderChunk = () => {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, filteredItems.length);
        const chunk = filteredItems.slice(start, end);

        chunk.forEach((item, index) => {
            const m = item.m;
            const div = document.createElement('div');
            div.className = 'molecule-item';
            div.setAttribute('data-aos', 'fade-up');
            div.setAttribute('data-aos-delay', Math.min(index * 20, 150));

            // Optimize tooltip
            const tooltipText = `<strong>${m.name}</strong><br>Formula: ${m.formula}<br>Atoms: ${m.atoms.length}<br>Bonds: ${m.bonds.length}`;
            div.setAttribute('data-tippy-content', tooltipText);

            div.innerHTML = `
                <div class="molecule-badge">${m.formula}</div>
                <div class="molecule-meta">
                    <div class="molecule-name">${highlightMatch(m.name, q)}</div>
                    <div class="molecule-formula">${m.formula}</div>
                </div>
                <i class="fas fa-chevron-right" style="color: var(--text-secondary); opacity: 0.5; margin-left: auto;"></i>
            `;

            // Use event delegation for better performance
            div.addEventListener('click', function() {
                // Haptic feedback (non-blocking)
                if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                }

                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                    openMatterModal(m);
                }, 80);
            }, { passive: true });

            moleculesListEl.appendChild(div);
        });

        // Schedule next chunk
        chunkIndex++;
        if (end < filteredItems.length) {
            requestIdleCallback(() => renderChunk(), { timeout: 100 });
        } else {
            // All done - initialize tooltips and animations
            requestAnimationFrame(() => {
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
            });
        }
    };

    renderChunk();
}

/**
 * OLD: Keep for fallback - Original render function
 */
function renderMoleculesList(query = '') {
    // Check if we should use optimized version
    if (window.innerWidth <= 768) {
        // Mobile - use optimized
        renderMoleculesListOptimized(query);
    } else {
        // Desktop - can handle normal rendering
        renderMoleculesContent(query);
    }
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

console.log('✅ Molecules Search Module Loaded (Mobile Optimized)');
