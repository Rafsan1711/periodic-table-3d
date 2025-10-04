/**
 * App Initialization Module (ENHANCED with Loader & Effects)
 * Main entry point - initializes all features on page load
 */

// Show loader initially
function showLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
    }
}

// Hide loader with smooth animation
function hideLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 800); // Show loader for at least 800ms
    }
}

// Initialize app with smooth loader transition
document.addEventListener('DOMContentLoaded', async () => {
    showLoader();
    
    try {
        // Initialize Periodic Table with delay for smooth rendering
        await new Promise(resolve => {
            setTimeout(() => {
                initPeriodicTable();
                resolve();
            }, 100);
        });
        
        // Initialize Molecules features
        await new Promise(resolve => {
            setTimeout(() => {
                renderMoleculesList();
                initMoleculesSearch();
                resolve();
            }, 200);
        });
        
        // Initialize Chemical Reactions features
        await new Promise(resolve => {
            setTimeout(() => {
                initReactionsBuilder();
                initReactantSelector();
                resolve();
            }, 300);
        });
        
        // Initialize Page Toggle
        initPageToggle();
        
        // Initialize tooltips
        initTooltips();
        
        // Add click sound effect
        addClickEffects();
        
        // Add keyboard shortcuts
        initKeyboardShortcuts();
        
        console.log('✅ Interactive Periodic Table, Molecules & Chemical Reactions App Initialized');
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
    } finally {
        hideLoader();
    }
});

/**
 * Initialize Tippy tooltips
 */
function initTooltips() {
    if (typeof tippy !== 'undefined') {
        tippy('[data-tippy-content]', {
            arrow: true,
            animation: 'scale',
            theme: 'dark',
            delay: [200, 0],
            duration: [200, 150],
            inertia: true
        });
    }
}

/**
 * Add click effects to interactive elements
 */
function addClickEffects() {
    // Ripple effect function
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    // Add ripple CSS
    if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                pointer-events: none;
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            button, .toggle-btn, .element, .molecule-item, .reactant-item {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add click effect to all interactive elements
    const interactiveElements = document.querySelectorAll(
        'button, .toggle-btn, .element, .molecule-item, .reactant-item, .close-btn'
    );
    
    interactiveElements.forEach(element => {
        element.addEventListener('click', createRipple);
    });
    
    // Add effect to dynamically created elements
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    const interactives = node.querySelectorAll 
                        ? node.querySelectorAll('button, .toggle-btn, .element, .molecule-item, .reactant-item')
                        : [];
                    
                    if (node.matches && node.matches('button, .toggle-btn, .element, .molecule-item, .reactant-item')) {
                        node.addEventListener('click', createRipple);
                    }
                    
                    interactives.forEach(el => {
                        el.addEventListener('click', createRipple);
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * Initialize keyboard shortcuts
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // ESC to close modals
        if (e.key === 'Escape') {
            const elementModal = document.getElementById('elementModal');
            const matterModal = document.getElementById('matterModal');
            const reactantModal = document.getElementById('reactantModal');
            
            if (elementModal && elementModal.classList.contains('active')) {
                closeModal();
            } else if (matterModal && matterModal.classList.contains('active')) {
                closeMatterModal();
            } else if (reactantModal && reactantModal.classList.contains('active')) {
                closeReactantSelector();
            }
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const moleculeSearch = document.getElementById('moleculeSearch');
            const reactantSearch = document.getElementById('reactantSearch');
            
            if (moleculeSearch && moleculeSearch.offsetParent !== null) {
                moleculeSearch.focus();
            } else if (reactantSearch && reactantSearch.offsetParent !== null) {
                reactantSearch.focus();
            }
        }
        
        // Tab navigation between pages (1, 2, 3)
        if (e.key === '1' && !e.ctrlKey && !e.metaKey) {
            const target = document.activeElement;
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                document.getElementById('togglePeriodic')?.click();
            }
        }
        if (e.key === '2' && !e.ctrlKey && !e.metaKey) {
            const target = document.activeElement;
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                document.getElementById('toggleMolecules')?.click();
            }
        }
        if (e.key === '3' && !e.ctrlKey && !e.metaKey) {
            const target = document.activeElement;
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                document.getElementById('toggleReactions')?.click();
            }
        }
    });
    
    console.log('⌨️ Keyboard shortcuts enabled:');
    console.log('  ESC - Close modals');
    console.log('  Ctrl/Cmd + K - Focus search');
    console.log('  1/2/3 - Switch between pages');
}

/**
 * Add smooth scroll behavior
 */
function addSmoothScroll() {
    document.documentElement.style.scrollBehavior = 'smooth';
}

/**
 * Performance optimization - Lazy load elements
 */
function optimizePerformance() {
    // Throttle resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Trigger resize handlers
            window.dispatchEvent(new Event('optimizedResize'));
        }, 250);
    }, { passive: true });
    
    // Use Intersection Observer for animations
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observe elements with fade-in effect
        document.querySelectorAll('[data-aos]').forEach(el => {
            observer.observe(el);
        });
    }
}

/**
 * Initialize on page load
 */
window.addEventListener('load', () => {
    addSmoothScroll();
    optimizePerformance();
    
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic'
        });
    }
    
    // Add loaded class to body
    document.body.classList.add('loaded');
    
    console.log('🎨 UI enhancements loaded');
});

/**
 * Handle online/offline status
 */
window.addEventListener('online', () => {
    console.log('🌐 Connection restored');
    // Show toast notification if you have one
});

window.addEventListener('offline', () => {
    console.log('📵 Connection lost');
    // Show toast notification if you have one
});

/**
 * Error handling
 */
window.addEventListener('error', (e) => {
    console.error('❌ Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Unhandled promise rejection:', e.reason);
});

/**
 * Service Worker Registration (Optional - for PWA)
 */
if ('serviceWorker' in navigator) {
    // Uncomment to enable PWA features
    // navigator.serviceWorker.register('/sw.js')
    //     .then(reg => console.log('✅ Service Worker registered'))
    //     .catch(err => console.log('❌ Service Worker registration failed:', err));
}

/**
 * Console welcome message
 */
console.log('%c⚛️ Interactive Periodic Table', 'font-size: 24px; font-weight: bold; color: #58a6ff;');
console.log('%cBuilt with Three.js, GSAP, and modern web technologies', 'color: #8b949e;');
console.log('%c🧪 Explore 118 elements, molecules, and chemical reactions!', 'color: #7ce38b;');
