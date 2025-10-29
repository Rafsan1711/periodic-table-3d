/**
 * Global Loader System
 * Shows premium loader for heavy operations
 */

let globalLoaderInstance = null;
let loaderTimeout = null;

/**
 * Show global loader with custom message
 */
function showGlobalLoader(message = 'Loading...') {
    // Remove existing
    hideGlobalLoader();
    
    const loader = document.createElement('div');
    loader.className = 'global-loader-overlay';
    loader.innerHTML = `
        <div class="global-loader-content">
            <div class="global-loader-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-core"></div>
            </div>
            <div class="global-loader-text">${message}</div>
            <div class="global-loader-progress">
                <div class="progress-bar"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loader);
    globalLoaderInstance = loader;
    
    // Fade in
    requestAnimationFrame(() => {
        loader.classList.add('active');
    });
    
    // Auto-hide after 10 seconds (safety)
    loaderTimeout = setTimeout(() => {
        hideGlobalLoader();
    }, 10000);
}

/**
 * Hide global loader
 */
function hideGlobalLoader() {
    if (loaderTimeout) {
        clearTimeout(loaderTimeout);
        loaderTimeout = null;
    }
    
    if (globalLoaderInstance) {
        globalLoaderInstance.classList.remove('active');
        globalLoaderInstance.classList.add('fade-out');
        
        setTimeout(() => {
            if (globalLoaderInstance && globalLoaderInstance.parentNode) {
                globalLoaderInstance.remove();
            }
            globalLoaderInstance = null;
        }, 300);
    }
}

/**
 * Update loader message
 */
function updateLoaderMessage(message) {
    if (globalLoaderInstance) {
        const textEl = globalLoaderInstance.querySelector('.global-loader-text');
        if (textEl) {
            textEl.textContent = message;
        }
    }
}

/**
 * Show loader for async operation
 */
async function withLoader(asyncFunc, message = 'Loading...') {
    showGlobalLoader(message);
    try {
        const result = await asyncFunc();
        return result;
    } finally {
        hideGlobalLoader();
    }
}

// Auto-show loader for page navigation
let navigationTimeout = null;

window.addEventListener('beforeunload', () => {
    showGlobalLoader('Loading...');
});

// Monitor heavy DOM operations
const observer = new MutationObserver((mutations) => {
    const heavyMutation = mutations.length > 50;
    if (heavyMutation) {
        if (navigationTimeout) clearTimeout(navigationTimeout);
        navigationTimeout = setTimeout(() => {
            // Heavy operation detected
        }, 100);
    }
});

// Export functions
window.showGlobalLoader = showGlobalLoader;
window.hideGlobalLoader = hideGlobalLoader;
window.updateLoaderMessage = updateLoaderMessage;
window.withLoader = withLoader;

console.log('✅ Global loader system initialized');
