/**
 * Mobile Performance Optimizer
 * Fixes lag, improves scroll, debounces heavy operations
 */

// Debounce function for search and heavy operations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Lazy load images and heavy content
function lazyLoadContent(selector) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '50px' });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

// Disable animations on low-end devices
function optimizeForDevice() {
    const isLowEnd = navigator.hardwareConcurrency <= 4 || 
                     navigator.deviceMemory <= 4;
    
    if (isLowEnd) {
        document.body.classList.add('reduce-motion');
    }
}

// Virtual scrolling for large lists
class VirtualScroller {
    constructor(container, items, renderItem, itemHeight = 80) {
        this.container = container;
        this.items = items;
        this.renderItem = renderItem;
        this.itemHeight = itemHeight;
        this.visibleItems = 20;
        this.scrollTop = 0;
        
        this.render();
        this.setupScrollListener();
    }

    render() {
        const containerHeight = this.container.clientHeight;
        const totalHeight = this.items.length * this.itemHeight;
        
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.min(
            startIndex + this.visibleItems + 5,
            this.items.length
        );

        this.container.innerHTML = `
            <div style="height: ${totalHeight}px; position: relative;">
                <div style="position: absolute; top: ${startIndex * this.itemHeight}px; width: 100%;">
                    ${this.items.slice(startIndex, endIndex).map(this.renderItem).join('')}
                </div>
            </div>
        `;
    }

    setupScrollListener() {
        const handleScroll = throttle(() => {
            this.scrollTop = this.container.scrollTop;
            this.render();
        }, 50);

        this.container.addEventListener('scroll', handleScroll, { passive: true });
    }
}

// Optimize Three.js rendering
function optimizeThreeJS(renderer, camera, scene) {
    if (!renderer) return;

    // Reduce pixel ratio on mobile
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);

    // Lower shadow quality on mobile
    if (window.innerWidth < 768) {
        renderer.shadowMap.enabled = false;
    }

    // Frustum culling
    camera.updateProjectionMatrix();

    // Dispose unused objects
    scene.traverse(obj => {
        if (obj.geometry) {
            obj.geometry.computeBoundingSphere();
        }
    });
}

// Memory cleanup for modals
function cleanupModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Cleanup Three.js
    const canvas = modal.querySelector('canvas');
    if (canvas) {
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        if (gl) {
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) ext.loseContext();
        }
    }

    // Clear event listeners
    const elements = modal.querySelectorAll('*');
    elements.forEach(el => {
        const clone = el.cloneNode(true);
        el.parentNode?.replaceChild(clone, el);
    });
}

// Export functions
window.mobilePerf = {
    debounce,
    throttle,
    lazyLoadContent,
    optimizeForDevice,
    VirtualScroller,
    optimizeThreeJS,
    cleanupModal
};

console.log('✅ Mobile performance optimizer loaded');
