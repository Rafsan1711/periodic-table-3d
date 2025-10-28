/**
 * Global Premium Loader System
 * Shows beautiful loader for heavy operations
 */

let loaderTimeout = null;

/**
 * Show premium global loader
 * @param {string} message - Loading message (optional)
 */
function showGlobalLoader(message = 'Loading...') {
    // Prevent multiple loaders
    if (document.getElementById('premium-global-loader')) return;
    
    const loader = document.createElement('div');
    loader.id = 'premium-global-loader';
    loader.className = 'premium-loader-overlay';
    
    loader.innerHTML = `
        <div class="premium-loader-content">
            <div class="premium-atom-loader">
                <div class="premium-nucleus"></div>
                <div class="premium-electron-orbit orbit-1">
                    <div class="premium-electron"></div>
                </div>
                <div class="premium-electron-orbit orbit-2">
                    <div class="premium-electron"></div>
                </div>
                <div class="premium-electron-orbit orbit-3">
                    <div class="premium-electron"></div>
                </div>
            </div>
            <p class="premium-loader-text">${message}</p>
            <div class="premium-loader-bar">
                <div class="premium-loader-progress"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    // Add styles if not exists
    if (!document.getElementById('premium-loader-styles')) {
        const style = document.createElement('style');
        style.id = 'premium-loader-styles';
        style.textContent = `
            .premium-loader-overlay {
                position: fixed;
                inset: 0;
                background: rgba(13, 17, 23, 0.95);
                backdrop-filter: blur(12px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: loaderFadeIn 0.3s ease;
            }
            
            @keyframes loaderFadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            .premium-loader-content {
                text-align: center;
                animation: loaderSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes loaderSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .premium-atom-loader {
                position: relative;
                width: 140px;
                height: 140px;
                margin: 0 auto 30px;
            }
            
            .premium-nucleus {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
                border-radius: 50%;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 30px var(--accent-blue), 0 0 60px var(--accent-purple);
                animation: nucleusPulse 2s ease-in-out infinite;
            }
            
            @keyframes nucleusPulse {
                0%, 100% {
                    transform: translate(-50%, -50%) scale(1);
                    box-shadow: 0 0 30px var(--accent-blue), 0 0 60px var(--accent-purple);
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.3);
                    box-shadow: 0 0 40px var(--accent-blue), 0 0 80px var(--accent-purple);
                }
            }
            
            .premium-electron-orbit {
                position: absolute;
                top: 50%;
                left: 50%;
                border: 2px solid rgba(88, 166, 255, 0.3);
                border-radius: 50%;
                transform: translate(-50%, -50%);
            }
            
            .orbit-1 {
                width: 70px;
                height: 70px;
                animation: orbitRotate 2s linear infinite;
            }
            
            .orbit-2 {
                width: 105px;
                height: 105px;
                animation: orbitRotate 3s linear infinite reverse;
            }
            
            .orbit-3 {
                width: 140px;
                height: 140px;
                animation: orbitRotate 4s linear infinite;
            }
            
            @keyframes orbitRotate {
                from {
                    transform: translate(-50%, -50%) rotate(0deg);
                }
                to {
                    transform: translate(-50%, -50%) rotate(360deg);
                }
            }
            
            .premium-electron {
                position: absolute;
                width: 10px;
                height: 10px;
                background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
                border-radius: 50%;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                box-shadow: 0 0 15px var(--accent-green), 0 0 30px var(--accent-blue);
                animation: electronGlow 1.5s ease-in-out infinite;
            }
            
            @keyframes electronGlow {
                0%, 100% {
                    box-shadow: 0 0 15px var(--accent-green), 0 0 30px var(--accent-blue);
                }
                50% {
                    box-shadow: 0 0 25px var(--accent-green), 0 0 50px var(--accent-blue);
                }
            }
            
            .premium-loader-text {
                color: var(--text-primary);
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 20px;
                animation: textPulse 2s ease-in-out infinite;
                background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            @keyframes textPulse {
                0%, 100% {
                    opacity: 0.7;
                }
                50% {
                    opacity: 1;
                }
            }
            
            .premium-loader-bar {
                width: 200px;
                height: 4px;
                background: rgba(88, 166, 255, 0.2);
                border-radius: 2px;
                margin: 0 auto;
                overflow: hidden;
            }
            
            .premium-loader-progress {
                height: 100%;
                background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple), var(--accent-green));
                background-size: 200% 100%;
                border-radius: 2px;
                animation: progressMove 1.5s ease-in-out infinite;
            }
            
            @keyframes progressMove {
                0% {
                    transform: translateX(-100%);
                    background-position: 0% 50%;
                }
                100% {
                    transform: translateX(100%);
                    background-position: 100% 50%;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fade in
    setTimeout(() => {
        loader.style.opacity = '1';
    }, 10);
    
    // Auto-hide after 10 seconds (safety)
    loaderTimeout = setTimeout(() => {
        hideGlobalLoader();
    }, 10000);
}

/**
 * Hide premium global loader
 */
function hideGlobalLoader() {
    const loader = document.getElementById('premium-global-loader');
    if (!loader) return;
    
    if (loaderTimeout) {
        clearTimeout(loaderTimeout);
        loaderTimeout = null;
    }
    
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.remove();
    }, 300);
}

/**
 * Show loader for heavy operations
 * Use this before any operation that takes > 500ms
 */
function showLoaderFor(operation, message = 'Processing...') {
    showGlobalLoader(message);
    
    // Return promise that auto-hides loader
    return new Promise((resolve, reject) => {
        Promise.resolve(operation)
            .then(result => {
                hideGlobalLoader();
                resolve(result);
            })
            .catch(error => {
                hideGlobalLoader();
                reject(error);
            });
    });
}

// Make globally available
window.showGlobalLoader = showGlobalLoader;
window.hideGlobalLoader = hideGlobalLoader;
window.showLoaderFor = showLoaderFor;

console.log('✅ Premium global loader system initialized');
