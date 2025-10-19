/**
 * App Initialization Module - COMPLETE FIXED
 * Fixes all initialization and missing function errors
 */

// Show loader
function showLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
    }
}

// Hide loader
function hideLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 800);
    }
}

/**
 * FIXED: Show notification toast (was missing)
 */
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `notification-toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 9999;
        max-width: 350px;
    `;
    
    if (type === 'success') {
        toast.style.background = '#7ce38b';
    } else if (type === 'error') {
        toast.style.background = '#ff7b72';
    } else {
        toast.style.background = '#58a6ff';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make it globally available
window.showNotification = showNotification;

// Check authentication
function checkAuth() {
    return new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        });
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    showLoader();
    
    try {
        const user = await checkAuth();
        
        if (user) {
            console.log('✅ User authenticated:', user.email);
            
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            
            // CRITICAL FIX: Don't initialize modules here
            // Let auth-handler.js handle it
            
        } else {
            console.log('ℹ️ No user authenticated, showing login screen');
            document.getElementById('main-app').style.display = 'none';
            document.getElementById('auth-screen').style.display = 'flex';
        }
        
        initTooltips();
        addClickEffects();
        initKeyboardShortcuts();
        
        console.log('✅ Interactive Periodic Table with Community App Initialized');
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
    } finally {
        hideLoader();
    }
});

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

function addClickEffects() {
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
                to { transform: scale(4); opacity: 0; }
            }
            button, .toggle-btn, .element, .molecule-item, .reactant-item, .forum-post-card {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }
    
    const interactiveElements = document.querySelectorAll(
        'button, .toggle-btn, .element, .molecule-item, .reactant-item, .close-btn'
    );
    
    interactiveElements.forEach(element => {
        element.addEventListener('click', createRipple);
    });
    
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
    
    observer.observe(document.body, { childList: true, subtree: true });
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const elementModal = document.getElementById('elementModal');
            const matterModal = document.getElementById('matterModal');
            const reactantModal = document.getElementById('reactantModal');
            const createPostModal = document.getElementById('create-post-modal');
            const notificationModal = document.getElementById('notification-modal');
            
            if (elementModal && elementModal.classList.contains('active')) {
                if (typeof closeModal === 'function') closeModal();
            } else if (matterModal && matterModal.classList.contains('active')) {
                if (typeof closeMatterModal === 'function') closeMatterModal();
            } else if (reactantModal && reactantModal.classList.contains('active')) {
                if (typeof closeReactantSelector === 'function') closeReactantSelector();
            } else if (createPostModal && createPostModal.classList.contains('active')) {
                if (typeof closeCreatePostModal === 'function') closeCreatePostModal();
            } else if (notificationModal && notificationModal.classList.contains('active')) {
                if (typeof closeNotificationModal === 'function') closeNotificationModal();
            }
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const moleculeSearch = document.getElementById('moleculeSearch');
            const reactantSearch = document.getElementById('reactantSearch');
            const forumSearch = document.getElementById('forum-search');
            
            if (moleculeSearch && moleculeSearch.offsetParent !== null) {
                moleculeSearch.focus();
            } else if (reactantSearch && reactantSearch.offsetParent !== null) {
                reactantSearch.focus();
            } else if (forumSearch && forumSearch.offsetParent !== null) {
                forumSearch.focus();
            }
        }
        
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
        if (e.key === '4' && !e.ctrlKey && !e.metaKey) {
            const target = document.activeElement;
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                document.getElementById('toggleCommunity')?.click();
            }
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            const communityPage = document.getElementById('communityPage');
            if (communityPage && communityPage.style.display !== 'none') {
                e.preventDefault();
                if (typeof openCreatePostModal === 'function') {
                    openCreatePostModal();
                }
            }
        }
    });
    
    console.log('⌨️ Keyboard shortcuts enabled:');
    console.log('  ESC - Close modals');
    console.log('  Ctrl/Cmd + K - Focus search');
    console.log('  1/2/3/4 - Switch between pages');
    console.log('  Ctrl/Cmd + N - Create new post');
}

function addSmoothScroll() {
    document.documentElement.style.scrollBehavior = 'smooth';
}

function optimizePerformance() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            window.dispatchEvent(new Event('optimizedResize'));
        }, 250);
    }, { passive: true });
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '50px' });
        
        document.querySelectorAll('[data-aos]').forEach(el => {
            observer.observe(el);
        });
    }
}

window.addEventListener('load', () => {
    addSmoothScroll();
    optimizePerformance();
    
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic'
        });
    }
    
    document.body.classList.add('loaded');
    console.log('🎨 UI enhancements loaded');
});

window.addEventListener('online', () => {
    console.log('🌐 Connection restored');
    showNotification('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    console.log('🔵 Connection lost');
    showNotification('Connection lost', 'error');
});

window.addEventListener('error', (e) => {
    console.error('❌ Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Unhandled promise rejection:', e.reason);
});

console.log('%c⚛️ Interactive Periodic Table with Community', 'font-size: 24px; font-weight: bold; color: #58a6ff;');
console.log('%cBuilt with Three.js, GSAP, Firebase, and modern web technologies', 'color: #8b949e;');
console.log('%c🧪 Explore elements, molecules, reactions, and join the community!', 'color: #7ce38b;');
