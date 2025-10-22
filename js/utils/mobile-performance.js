/**
 * Mobile Performance Optimization Module
 * Handles all mobile-specific optimizations
 */

// Detect mobile device
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
};

// Debounce helper
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

// Throttle helper
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

// Virtual scroll for large lists
class VirtualScroller {
    constructor(container, items, renderItem, itemHeight = 60) {
        this.container = container;
        this.items = items;
        this.renderItem = renderItem;
        this.itemHeight = itemHeight;
        this.visibleItems = Math.ceil(window.innerHeight / itemHeight) + 5;
        this.scrollTop = 0;
        this.init();
    }
    
    init() {
        this.container.style.position = 'relative';
        this.container.style.height = `${this.items.length * this.itemHeight}px`;
        
        const viewport = document.createElement('div');
        viewport.style.position = 'absolute';
        viewport.style.top = '0';
        viewport.style.left = '0';
        viewport.style.right = '0';
        this.viewport = viewport;
        this.container.appendChild(viewport);
        
        this.container.addEventListener('scroll', throttle(() => {
            this.scrollTop = this.container.scrollTop;
            this.render();
        }, 50), { passive: true });
        
        this.render();
    }
    
    render() {
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.min(startIndex + this.visibleItems, this.items.length);
        
        this.viewport.innerHTML = '';
        this.viewport.style.transform = `translateY(${startIndex * this.itemHeight}px)`;
        
        for (let i = startIndex; i < endIndex; i++) {
            const item = this.renderItem(this.items[i], i);
            this.viewport.appendChild(item);
        }
    }
}

// Lazy load 3D models
function lazyLoad3D(callback, delay = 200) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            callback.apply(this, args);
        }, delay);
    };
}

// Optimize touch events
function optimizeTouchEvents() {
    const touchElements = document.querySelectorAll('.element, .molecule-item, .forum-post-card');
    
    touchElements.forEach(el => {
        el.addEventListener('touchstart', function() {
            this.style.opacity = '0.7';
        }, { passive: true });
        
        el.addEventListener('touchend', function() {
            this.style.opacity = '1';
        }, { passive: true });
    });
}

// Reduce animations on mobile
function optimizeAnimations() {
    if (isMobileDevice()) {
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.2s !important;
                transition-duration: 0.2s !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize performance optimizations
function initMobilePerformance() {
    if (!isMobileDevice()) return;
    
    console.log('📱 Mobile performance optimizations enabled');
    
    optimizeAnimations();
    optimizeTouchEvents();
    
    // Disable hover effects on mobile
    document.body.classList.add('mobile-device');
}

// Export functions
window.isMobileDevice = isMobileDevice;
window.debounce = debounce;
window.throttle = throttle;
window.VirtualScroller = VirtualScroller;
window.lazyLoad3D = lazyLoad3D;
window.initMobilePerformance = initMobilePerformance;

console.log('✅ Mobile performance module loaded');
