/**
 * Element Click Loader
 * Shows beautiful loader while modal opens
 */

let currentElementLoader = null;

/**
 * Show element loading overlay
 */
function showElementLoader(elementName) {
    // Remove existing loader
    hideElementLoader();
    
    const overlay = document.createElement('div');
    overlay.className = 'element-loading-overlay';
    overlay.innerHTML = `
        <div style="text-align: center;">
            <div class="element-loader">
                <div class="element-loader-nucleus"></div>
                <div class="element-loader-orbit">
                    <div class="element-loader-electron"></div>
                </div>
                <div class="element-loader-orbit">
                    <div class="element-loader-electron"></div>
                </div>
                <div class="element-loader-orbit">
                    <div class="element-loader-electron"></div>
                </div>
            </div>
            <div class="element-loader-text">Loading ${elementName}...</div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    currentElementLoader = overlay;
    
    // Auto-hide after 3 seconds (safety)
    setTimeout(() => {
        hideElementLoader();
    }, 3000);
}

/**
 * Hide element loader
 */
function hideElementLoader() {
    if (currentElementLoader) {
        currentElementLoader.classList.add('fade-out');
        setTimeout(() => {
            if (currentElementLoader && currentElementLoader.parentNode) {
                currentElementLoader.remove();
            }
            currentElementLoader = null;
        }, 200);
    }
}

/**
 * Show molecule loading overlay
 */
function showMoleculeLoader(moleculeName) {
    showElementLoader(moleculeName);
}

/**
 * Hide molecule loader
 */
function hideMoleculeLoader() {
    hideElementLoader();
}

// Export functions
window.showElementLoader = showElementLoader;
window.hideElementLoader = hideElementLoader;
window.showMoleculeLoader = showMoleculeLoader;
window.hideMoleculeLoader = hideMoleculeLoader;

console.log('✅ Element loader initialized');
