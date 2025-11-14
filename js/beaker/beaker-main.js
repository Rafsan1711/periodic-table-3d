/**
 * ============================================
 * BEAKER-MAIN.JS - Main Beaker Initialization
 * ============================================
 */

let beakerInitialized = false;
let currentBeakerElements = [];
let beakerLiquidHeight = 0;

/**
 * Initialize Beaker Lab
 */
function initBeakerLab() {
    if (beakerInitialized) {
        console.log('ℹ️ Beaker already initialized');
        return;
    }
    
    console.log('🧪 Initializing Virtual Chemistry Lab...');
    
    // Initialize all modules
    initBeakerPhysics();
    initBeakerSidebar();
    initBeakerMotion();
    initBeakerGuide();
    
    // Setup controls
    setupBeakerControls();
    
    // Show guide on first load
    const hasSeenGuide = localStorage.getItem('beaker_guide_seen');
    if (!hasSeenGuide) {
        showBeakerGuide();
    }
    
    beakerInitialized = true;
    console.log('✅ Virtual Chemistry Lab initialized');
}

/**
 * Setup control buttons
 */
function setupBeakerControls() {
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const resetBeaker = document.getElementById('reset-beaker');
    const beakerInfo = document.getElementById('beaker-info');
    
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', () => {
            const sidebar = document.getElementById('beaker-sidebar');
            sidebar.classList.toggle('active');
            
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        });
    }
    
    if (resetBeaker) {
        resetBeaker.addEventListener('click', () => {
            resetBeakerLab();
            
            if ('vibrate' in navigator) {
                navigator.vibrate([10, 50, 10]);
            }
        });
    }
    
    if (beakerInfo) {
        beakerInfo.addEventListener('click', () => {
            showBeakerGuide();
        });
    }
}

/**
 * Reset beaker to initial state
 */
function resetBeakerLab() {
    console.log('🔄 Resetting beaker...');
    
    // Clear physics bodies
    if (typeof clearBeakerPhysics === 'function') {
        clearBeakerPhysics();
    }
    
    // Reset liquid
    const liquid = document.getElementById('beakerLiquid');
    if (liquid) {
        liquid.style.height = '0';
        liquid.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
    }
    
    // Clear gas effects
    const gasContainer = document.getElementById('beakerGas');
    if (gasContainer) {
        gasContainer.innerHTML = '';
    }
    
    // Hide equation
    const equation = document.getElementById('beaker-equation');
    if (equation) {
        equation.style.display = 'none';
    }
    
    // Reset glass
    const glass = document.querySelector('.beaker-glass');
    if (glass) {
        glass.classList.remove('reacting');
    }
    
    // Clear current elements
    currentBeakerElements = [];
    beakerLiquidHeight = 0;
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('Beaker reset successfully', 'success');
    }
    
    console.log('✅ Beaker reset complete');
}

/**
 * Add element to beaker
 * @param {String} element - Element symbol
 * @param {Object} position - {x, y} position
 */
function addElementToBeaker(element, position) {
    console.log('➕ Adding element to beaker:', element);
    
    const prop = elementProperties[element];
    if (!prop) {
        console.error('❌ Unknown element:', element);
        return;
    }
    
    currentBeakerElements.push(element);
    
    // Handle based on type
    if (prop.type === 'solid') {
        addSolidElement(element, position);
    } else if (prop.type === 'liquid') {
        addLiquidElement(element);
    } else if (prop.type === 'gas') {
        addGasElement(element);
    }
    
    // Check for reactions
    setTimeout(() => {
        checkForReactions();
    }, 500);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate(15);
    }
}

/**
 * Add solid element
 */
function addSolidElement(element, position) {
    if (typeof addPhysicsBody === 'function') {
        addPhysicsBody(element, position);
    }
}

/**
 * Add liquid element
 */
function addLiquidElement(element) {
    const prop = elementProperties[element];
    const liquid = document.getElementById('beakerLiquid');
    
    if (!liquid) return;
    
    // Increase liquid height
    beakerLiquidHeight += prop.volume || 50;
    beakerLiquidHeight = Math.min(beakerLiquidHeight, 400); // Max height
    
    liquid.style.height = beakerLiquidHeight + 'px';
    liquid.style.background = `linear-gradient(135deg, ${prop.color}, ${adjustColor(prop.color, -20)})`;
    liquid.classList.add('rising');
    
    setTimeout(() => {
        liquid.classList.remove('rising');
    }, 1500);
    
    // Add ripple effect
    createRippleEffect();
}

/**
 * Add gas element
 */
function addGasElement(element) {
    const prop = elementProperties[element];
    const gasContainer = document.getElementById('beakerGas');
    
    if (!gasContainer) return;
    
    // Create gas particles
    createGasEffect(prop.color, gasContainer);
    
    // Show gas dispersion animation
    setTimeout(() => {
        if (typeof createGasDispersion === 'function') {
            createGasDispersion(prop.color);
        }
    }, 100);
}

/**
 * Check for chemical reactions
 */
function checkForReactions() {
    if (currentBeakerElements.length < 2) return;
    
    const reaction = findReaction(currentBeakerElements);
    
    if (reaction) {
        console.log('⚗️ Reaction found!', reaction.equation);
        executeReaction(reaction);
    }
}

/**
 * Execute chemical reaction
 */
function executeReaction(reaction) {
    // Show equation
    showReactionEquation(reaction.equation);
    
    // Apply visual effects
    const glass = document.querySelector('.beaker-glass');
    if (glass) {
        glass.classList.add('reacting');
        setTimeout(() => {
            glass.classList.remove('reacting');
        }, 3000);
    }
    
    // Change liquid color
    const liquid = document.getElementById('beakerLiquid');
    if (liquid && reaction.liquidColor) {
        liquid.style.background = `linear-gradient(135deg, ${reaction.liquidColor}, ${adjustColor(reaction.liquidColor, -20)})`;
        liquid.classList.add('changing');
        setTimeout(() => {
            liquid.classList.remove('changing');
        }, 3000);
    }
    
    // Create bubbles
    if (reaction.bubbles) {
        createBubbles();
    }
    
    // Gas effect
    if (reaction.gasEffect) {
        const gasColor = reaction.products.gas ? '#f0f6fc' : '#58a6ff';
        setTimeout(() => {
            createGasEffect(gasColor, document.getElementById('beakerGas'));
        }, 500);
    }
    
    // Heat effect
    if (reaction.heat) {
        createHeatWave();
    }
    
    // Flash effect
    if (reaction.flash) {
        createFlash();
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate([20, 50, 20, 50, 20]);
    }
}

/**
 * Show reaction equation
 */
function showReactionEquation(equation) {
    const eqDisplay = document.getElementById('beaker-equation');
    const eqText = document.getElementById('equation-text');
    
    if (!eqDisplay || !eqText) return;
    
    eqText.textContent = equation;
    eqDisplay.style.display = 'block';
    
    setTimeout(() => {
        eqDisplay.style.display = 'none';
    }, 5000);
}

/**
 * Utility: Adjust color brightness
 */
function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/**
 * Create ripple effect
 */
function createRippleEffect() {
    const liquid = document.getElementById('beakerLiquid');
    if (!liquid) return;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
        width: 50px;
        height: 50px;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
    `;
    
    liquid.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 1000);
}

/**
 * Create bubbles
 */
function createBubbles() {
    const liquid = document.getElementById('beakerLiquid');
    if (!liquid) return;
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            const size = Math.random() * 10 + 5;
            bubble.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${Math.random() * 80 + 10}%;
                bottom: 0;
            `;
            
            liquid.appendChild(bubble);
            
            setTimeout(() => {
                bubble.remove();
            }, 2000);
        }, i * 200);
    }
}

/**
 * Create heat wave effect
 */
function createHeatWave() {
    const glass = document.querySelector('.beaker-glass');
    if (!glass) return;
    
    glass.classList.add('heat-wave');
    setTimeout(() => {
        glass.classList.remove('heat-wave');
    }, 2000);
}

/**
 * Create flash effect
 */
function createFlash() {
    const wrapper = document.querySelector('.beaker-wrapper');
    if (!wrapper) return;
    
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: absolute;
        inset: 0;
        background: white;
        z-index: 100;
        pointer-events: none;
        animation: flash 0.3s ease-in-out 2;
    `;
    
    wrapper.appendChild(flash);
    
    setTimeout(() => {
        flash.remove();
    }, 1000);
}

// Export functions
window.initBeakerLab = initBeakerLab;
window.resetBeakerLab = resetBeakerLab;
window.addElementToBeaker = addElementToBeaker;

console.log('✅ Beaker main module loaded');
