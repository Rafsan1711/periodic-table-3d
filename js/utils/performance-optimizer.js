/**
 * Performance Optimizer Module
 * Mobile optimization, rendering efficiency, memory management
 */

// 1. DEBOUNCE & THROTTLE UTILITIES
const performanceUtils = {
    /**
     * Throttle function - Execute at most once every X ms
     */
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Debounce function - Execute after X ms of inactivity
     */
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    /**
     * RequestAnimationFrame debounce
     */
    rafDebounce: function(func) {
        let frameId = null;
        return function(...args) {
            if (frameId) cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                func.apply(this, args);
                frameId = null;
            });
        };
    }
};

// 2. VIRTUAL SCROLLING FOR LISTS
class VirtualList {
    constructor(container, items, itemHeight, renderItem) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.init();
    }

    init() {
        this.container.style.overflow = 'auto';
        this.container.style.height = '400px';
        this.updateVisibleRange();
        this.container.addEventListener('scroll', () => this.onScroll());
    }

    updateVisibleRange() {
        const scrollTop = this.container.scrollTop;
        this.visibleStart = Math.floor(scrollTop / this.itemHeight);
        this.visibleEnd = Math.ceil((scrollTop + this.container.clientHeight) / this.itemHeight);
    }

    onScroll() {
        this.updateVisibleRange();
        this.render();
    }

    render() {
        const html = this.items.slice(this.visibleStart, this.visibleEnd)
            .map((item, i) => this.renderItem(item, this.visibleStart + i))
            .join('');
        
        this.container.innerHTML = `
            <div style="height: ${this.visibleStart * this.itemHeight}px;"></div>
            ${html}
            <div style="height: ${(this.items.length - this.visibleEnd) * this.itemHeight}px;"></div>
        `;
    }
}

// 3. IMAGE LAZY LOADING
const lazyLoadManager = {
    init: function() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '50px' });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
};

// 4. CSS ANIMATION OPTIMIZATION
const animationOptimizer = {
    /**
     * Detect if animations should be reduced
     */
    prefersReducedMotion: function() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /**
     * Use GPU acceleration
     */
    enableGPUAccel: function(element) {
        if (!this.prefersReducedMotion()) {
            element.style.transform = 'translateZ(0)';
            element.style.willChange = 'transform';
        }
    },

    /**
     * Disable GPU for cleanup
     */
    disableGPUAccel: function(element) {
        element.style.willChange = 'auto';
    }
};

// 5. WORKER THREAD FOR HEAVY COMPUTATION
const workerManager = {
    /**
     * Heavy search in web worker
     */
    searchInWorker: function(items, query) {
        return new Promise((resolve) => {
            if (typeof Worker !== 'undefined') {
                const worker = new Worker('data:text/javascript;base64,' + btoa(`
                    self.onmessage = function(e) {
                        const { items, query } = e.data;
                        const q = query.toLowerCase();
                        const results = items.filter(item =>
                            item.name.toLowerCase().includes(q) ||
                            item.formula.toLowerCase().includes(q)
                        );
                        self.postMessage(results);
                    };
                `));
                
                worker.onmessage = (e) => {
                    resolve(e.data);
                    worker.terminate();
                };
                
                worker.postMessage({ items, query });
            } else {
                // Fallback
                const results = items.filter(item =>
                    item.name.toLowerCase().includes(query.toLowerCase()) ||
                    item.formula.toLowerCase().includes(query.toLowerCase())
                );
                resolve(results);
            }
        });
    }
};

// 6. MEMORY MANAGEMENT
const memoryManager = {
    /**
     * Clear unused objects
     */
    cleanup: function() {
        // Clear three.js resources
        if (typeof scene !== 'undefined' && scene) {
            scene.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        }
    },

    /**
     * Monitor memory usage
     */
    monitorMemory: function() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize / 1048576; // MB
            const limit = performance.memory.jsHeapSizeLimit / 1048576;
            console.log(`Memory: ${used.toFixed(2)}MB / ${limit.toFixed(2)}MB`);
            
            if (used > limit * 0.9) {
                console.warn('⚠️ High memory usage detected');
                this.cleanup();
            }
        }
    }
};

// 7. BATCH DOM UPDATES
const domBatcher = {
    /**
     * Batch multiple DOM updates
     */
    batch: function(updates) {
        const fragment = document.createDocumentFragment();
        
        updates.forEach(({ selector, content }) => {
            const el = document.querySelector(selector);
            if (el) {
                if (typeof content === 'string') {
                    const temp = document.createElement('div');
                    temp.innerHTML = content;
                    fragment.appendChild(temp.firstChild);
                } else {
                    fragment.appendChild(content);
                }
            }
        });
        
        document.body.appendChild(fragment);
    }
};

// 8. SWIPE DETECTION FIX (MAIN ISSUE #1)
const swipeManager = {
    SWIPE_THRESHOLD: 50,
    SWIPE_RESTRICT_TIME: 500,

    /**
     * Better swipe detection that doesn't conflict with scrolling
     */
    initSwipeDetection: function(element, onSwipeDown) {
        let touchStartY = 0;
        let touchStartX = 0;
        let touchEndY = 0;
        let touchStartTime = 0;
        let isScrolling = false;

        element.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
            touchStartTime = Date.now();
            isScrolling = false;
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            touchEndY = e.touches[0].clientY;
            const touchEndX = e.touches[0].clientX;
            const deltaY = touchEndY - touchStartY;
            const deltaX = touchEndX - touchStartX;

            // Check if it's a horizontal scroll (don't treat as swipe)
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                isScrolling = true;
                return;
            }

            // Only process vertical swipes
            if (Math.abs(deltaY) > 20) {
                isScrolling = true;
                
                // Only transform if dragging DOWN and not scrolled up
                if (deltaY > 0 && element.scrollTop === 0) {
                    const opacity = Math.max(0.85, 1 - (deltaY / 300));
                    element.style.opacity = opacity;
                }
            }
        }, { passive: true });

        element.addEventListener('touchend', () => {
            const timeDiff = Date.now() - touchStartTime;
            const deltaY = touchEndY - touchStartY;

            element.style.opacity = '1';

            // Only trigger close on significant DOWN swipe
            if (deltaY > this.SWIPE_THRESHOLD && 
                timeDiff < this.SWIPE_RESTRICT_TIME &&
                !isScrolling) {
                onSwipeDown();
            }
        }, { passive: true });
    }
};

// 9. EFFICIENT RENDERING FOR MOLECULES SEARCH (ISSUE #3)
const searchOptimizer = {
    /**
     * Debounced search with worker thread
     */
    createOptimizedSearch: function(renderFunction) {
        let pendingRender = null;

        return performanceUtils.debounce(async function(query) {
            // Show loading state immediately
            const container = document.getElementById('moleculesList');
            if (container) {
                container.innerHTML = '<div class="loading-spinner"></div>';
            }

            // Do heavy search in next frame to avoid blocking UI
            requestAnimationFrame(async () => {
                try {
                    // Combine elements and molecules
                    const allItems = [];
                    
                    if (elementsData) {
                        elementsData.forEach(element => {
                            allItems.push({
                                name: element.name,
                                formula: element.symbol,
                                type: 'atom'
                            });
                        });
                    }
                    
                    if (moleculesData) {
                        moleculesData.forEach(molecule => {
                            allItems.push({
                                name: molecule.name,
                                formula: molecule.formula,
                                type: 'molecule'
                            });
                        });
                    }

                    // Use worker for search if available
                    let results;
                    if (query) {
                        results = await workerManager.searchInWorker(allItems, query);
                    } else {
                        results = allItems;
                    }

                    // Batch render in chunks
                    this.renderInChunks(results, renderFunction, 10);
                } catch (error) {
                    console.error('Search error:', error);
                }
            });
        }, 300);
    },

    /**
     * Render results in chunks (prevents UI freeze)
     */
    renderInChunks: function(items, renderFunction, chunkSize = 20) {
        const container = document.getElementById('moleculesList');
        if (!container) return;

        container.innerHTML = '';
        let currentIndex = 0;

        const renderChunk = () => {
            const chunk = items.slice(currentIndex, currentIndex + chunkSize);
            
            chunk.forEach(item => {
                const el = renderFunction(item);
                if (el) container.appendChild(el);
            });

            currentIndex += chunkSize;

            if (currentIndex < items.length) {
                requestIdleCallback(renderChunk, { timeout: 100 });
            }
        };

        renderChunk();
    }
};

// 10. INITIALIZE ALL OPTIMIZATIONS
function initPerformanceOptimizations() {
    console.log('🚀 Initializing Performance Optimizations...');

    // Monitor memory periodically
    setInterval(() => memoryManager.monitorMemory(), 5000);

    // Lazy load images
    lazyLoadManager.init();

    // Reduced motion support
    if (animationOptimizer.prefersReducedMotion()) {
        console.log('⚙️ Reduced motion enabled');
        document.body.classList.add('reduce-motion');
    }

    // Initialize swipe detection properly for modals
    const elementModal = document.getElementById('elementModal');
    if (elementModal) {
        const modalContent = elementModal.querySelector('.modal-content');
        if (modalContent) {
            swipeManager.initSwipeDetection(modalContent, () => {
                if (typeof closeModal === 'function') closeModal();
            });
        }
    }

    const matterModal = document.getElementById('matterModal');
    if (matterModal) {
        const modalContent = matterModal.querySelector('.modal-content');
        if (modalContent) {
            swipeManager.initSwipeDetection(modalContent, () => {
                if (typeof closeMatterModal === 'function') closeMatterModal();
            });
        }
    }

    console.log('✅ Performance Optimizations Initialized');
}

// Global exports
window.performanceUtils = performanceUtils;
window.swipeManager = swipeManager;
window.searchOptimizer = searchOptimizer;
window.memoryManager = memoryManager;
window.animationOptimizer = animationOptimizer;
window.initPerformanceOptimizations = initPerformanceOptimizations;
window.VirtualList = VirtualList;

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof initPerformanceOptimizations === 'function') {
            initPerformanceOptimizations();
        }
    }, 500);
});

console.log('✅ Performance Optimizer Module Loaded');
