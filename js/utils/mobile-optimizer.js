/**
 * Mobile Optimizer Module
 * Detects device and applies performance optimizations
 */

const MobileOptimizer = {
    isMobile: false,
    isTablet: false,
    isLowEnd: false,
    
    /**
     * Initialize mobile detection and optimizations
     */
    init() {
        this.detectDevice();
        this.applyOptimizations();
        console.log('📱 Mobile Optimizer:', {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isLowEnd: this.isLowEnd
        });
    },
    
    /**
     * Detect device type and capabilities
     */
    detectDevice() {
        const width = window.innerWidth;
        this.isMobile = width <= 768;
        this.isTablet = width > 768 && width <= 992;
        
        // Detect low-end device
        this.isLowEnd = this.isMobile && (
            navigator.hardwareConcurrency <= 4 ||
            navigator.deviceMemory <= 4
        );
    },
    
    /**
     * Apply performance optimizations
     */
    applyOptimizations() {
        if (this.isMobile) {
            // Disable smooth scrolling on mobile
            document.documentElement.style.scrollBehavior = 'auto';
            
            // Reduce animation complexity
            document.body.classList.add('mobile-device');
            
            if (this.isLowEnd) {
                document.body.classList.add('low-end-device');
            }
        }
        
        // Add resize listener
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.detectDevice();
                this.applyOptimizations();
            }, 250);
        }, { passive: true });
    },
    
    /**
     * Get optimal settings for current device
     */
    getSettings() {
        if (this.isLowEnd) {
            return {
                particleCount: 20,
                animationQuality: 'low',
                renderDistance: 5,
                maxVisibleItems: 20,
                debounceTime: 500,
                enableShadows: false,
                antialias: false
            };
        } else if (this.isMobile) {
            return {
                particleCount: 30,
                animationQuality: 'medium',
                renderDistance: 10,
                maxVisibleItems: 30,
                debounceTime: 300,
                enableShadows: false,
                antialias: true
            };
        } else {
            return {
                particleCount: 50,
                animationQuality: 'high',
                renderDistance: 20,
                maxVisibleItems: 50,
                debounceTime: 180,
                enableShadows: true,
                antialias: true
            };
        }
    },
    
    /**
     * Throttle function execution
     */
    throttle(func, limit) {
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
     * Request idle callback with fallback
     */
    requestIdleCallback(callback) {
        if ('requestIdleCallback' in window) {
            return window.requestIdleCallback(callback);
        } else {
            return setTimeout(callback, 1);
        }
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileOptimizer.init());
} else {
    MobileOptimizer.init();
}

window.MobileOptimizer = MobileOptimizer;
console.log('✅ Mobile optimizer loaded');
