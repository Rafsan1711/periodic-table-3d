/**
 * Periodic Table Renderer Module (ENHANCED - Mobile Optimized)
 * Handles rendering of the periodic table grid and series
 */

let isMobile = false;
let isTablet = false;

/**
 * Detect device type
 */
function detectDevice() {
    const width = window.innerWidth;
    isMobile = width <= 768;
    isTablet = width > 768 && width <= 992;
    return { isMobile, isTablet };
}

/**
 * Initializes and renders the complete periodic table
 */
function initPeriodicTable() {
    const table = document.getElementById('periodicTable');
    const lanthanideElements = document.getElementById('lanthanideElements');
    const actinideElements = document.getElementById('actinideElements');
    
    if (!table) {
        console.error('Periodic table element not found');
        return;
    }
    
    detectDevice();
    
    // Clear existing content
    table.innerHTML = '';
    lanthanideElements.innerHTML = '';
    actinideElements.innerHTML = '';
    
    // Create main periodic table (7 rows x 18 columns)
    let renderedCount = 0;
    for (let row = 1; row <= 7; row++) {
        for (let col = 1; col <= 18; col++) {
            const element = findElementByPosition(row, col);
            if (element) {
                const elementDiv = createElementDiv(element);
                elementDiv.style.gridRow = row;
                elementDiv.style.gridColumn = col;
                table.appendChild(elementDiv);
                renderedCount++;
                
                // Add stagger animation
                elementDiv.style.animationDelay = `${renderedCount * 0.01}s`;
            } else {
                const emptyDiv = document.createElement('div');
                emptyDiv.style.gridRow = row;
                emptyDiv.style.gridColumn = col;
                emptyDiv.classList.add('empty-cell');
                table.appendChild(emptyDiv);
            }
        }
    }
    
    // Create lanthanide series (elements 57-71)
    for (let i = 57; i <= 71; i++) {
        const element = elementsData.find(el => el.number === i);
        if (element) {
            const elementDiv = createElementDiv(element);
            elementDiv.style.animationDelay = `${(i - 57) * 0.02}s`;
            lanthanideElements.appendChild(elementDiv);
        }
    }
    
    // Create actinide series (elements 89-103)
    for (let i = 89; i <= 103; i++) {
        const element = elementsData.find(el => el.number === i);
        if (element) {
            const elementDiv = createElementDiv(element);
            elementDiv.style.animationDelay = `${(i - 89) * 0.02}s`;
            actinideElements.appendChild(elementDiv);
        }
    }
    
    // Add fade-in animation
    addTableAnimation();
    
    console.log(`✅ Periodic table rendered with ${renderedCount} elements`);
    
    // Re-render on window resize
    let resizeTimeout;
    window.addEventListener('optimizedResize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            detectDevice();
            updateTableLayout();
        }, 300);
    }, { passive: true });
}

/**
 * Add animation to table
 */
function addTableAnimation() {
    const elements = document.querySelectorAll('.element');
    elements.forEach(el => {
        el.classList.add('fade-in-element');
    });
    
    // Add CSS if not exists
    if (!document.getElementById('table-animations')) {
        const style = document.createElement('style');
        style.id = 'table-animations';
        style.textContent = `
            .fade-in-element {
                opacity: 0;
                animation: fadeInUp 0.5s ease forwards;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .element-glow {
                box-shadow: 0 0 20px currentColor;
                animation: glowPulse 2s ease-in-out infinite;
            }
            
            @keyframes glowPulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Update table layout based on device
 */
function updateTableLayout() {
    const table = document.getElementById('periodicTable');
    if (!table) return;
    
    if (isMobile) {
        table.style.fontSize = '0.6rem';
    } else if (isTablet) {
        table.style.fontSize = '0.7rem';
    } else {
        table.style.fontSize = '0.75rem';
    }
}

/**
 * Finds element by grid position
 * @param {number} row - Grid row (1-7)
 * @param {number} col - Grid column (1-18)
 * @returns {Object|null} Element data or null
 */
function findElementByPosition(row, col) {
    return elementsData.find(element => {
        const pos = elementPositions[element.number];
        return pos && pos[0] === row && pos[1] === col;
    });
}

/**
 * Creates HTML element for a single periodic table cell
 * @param {Object} element - Element data
 * @returns {HTMLElement} Element div
 */
function createElementDiv(element) {
    const div = document.createElement('div');
    div.className = `element ${element.category}`;
    div.setAttribute('data-number', element.number);
    div.setAttribute('data-symbol', element.symbol);
    div.setAttribute('data-weight', element.weight);
    div.setAttribute('data-category', element.category);
    div.setAttribute('title', element.name);
    
    // Add tooltip data
    div.setAttribute('data-tippy-content', `
        <strong>${element.name}</strong><br>
        Symbol: ${element.symbol}<br>
        Atomic #: ${element.number}<br>
        Weight: ${element.weight} u
    `);
    
    // Determine if weight should be shown (only on larger screens)
    const showWeight = !isMobile;
    
    div.innerHTML = `
        ${showWeight ? `<div class="element-header"><span class="weight">${element.weight}</span></div>` : ''}
        <span class="symbol">${element.symbol}</span>
        <span class="number">${element.number}</span>
    `;
    
    // Add click handler with haptic feedback
    div.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
        
        // Visual feedback
        div.classList.add('element-clicked');
        setTimeout(() => div.classList.remove('element-clicked'), 300);
        
        // Open modal
        openElementModal(element);
    });
    
    // Add long-press for mobile info
    if (isMobile) {
        let pressTimer;
        div.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                if ('vibrate' in navigator) {
                    navigator.vibrate([10, 50, 10]);
                }
                showQuickInfo(element, e.touches[0]);
            }, 500);
        });
        
        div.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        div.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    }
    
    return div;
}

/**
 * Show quick info tooltip on long press (mobile)
 */
function showQuickInfo(element, touch) {
    // Remove existing quick info
    const existing = document.querySelector('.quick-info');
    if (existing) existing.remove();
    
    const quickInfo = document.createElement('div');
    quickInfo.className = 'quick-info';
    quickInfo.innerHTML = `
        <div class="quick-info-header">${element.name}</div>
        <div class="quick-info-body">
            <div><strong>Symbol:</strong> ${element.symbol}</div>
            <div><strong>Atomic #:</strong> ${element.number}</div>
            <div><strong>Weight:</strong> ${element.weight} u</div>
            <div><strong>Category:</strong> ${formatCategoryName(element.category)}</div>
        </div>
    `;
    
    quickInfo.style.cssText = `
        position: fixed;
        left: ${touch.clientX}px;
        top: ${touch.clientY - 100}px;
        background: var(--bg-tertiary);
        border: 1px solid var(--accent-blue);
        border-radius: 8px;
        padding: 12px;
        z-index: 9999;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        min-width: 200px;
        animation: quickInfoFadeIn 0.2s ease;
    `;
    
    document.body.appendChild(quickInfo);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (quickInfo.parentNode) {
            quickInfo.style.opacity = '0';
            setTimeout(() => quickInfo.remove(), 300);
        }
    }, 3000);
    
    // Add CSS for animation
    if (!document.getElementById('quick-info-styles')) {
        const style = document.createElement('style');
        style.id = 'quick-info-styles';
        style.textContent = `
            @keyframes quickInfoFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .quick-info {
                transition: opacity 0.3s ease;
            }
            
            .quick-info-header {
                font-weight: 700;
                font-size: 1.1rem;
                color: var(--accent-blue);
                margin-bottom: 8px;
                border-bottom: 1px solid var(--border-primary);
                padding-bottom: 6px;
            }
            
            .quick-info-body {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }
            
            .quick-info-body div {
                margin: 4px 0;
            }
            
            .element-clicked {
                transform: scale(0.95);
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Format category name for display
 */
function formatCategoryName(category) {
    const categoryMap = {
        'nonmetal': 'Non Metal',
        'noblegas': 'Noble Gas',
        'alkalimetal': 'Alkali Metal',
        'alkearthmetal': 'Alkaline Earth Metal',
        'transitionmetal': 'Transition Metal',
        'post-transitionmetal': 'Post-Transition Metal',
        'metalloid': 'Metalloid',
        'halogen': 'Halogen',
        'lanthanide': 'Lanthanide',
        'actinide': 'Actinide',
        'unknown': 'Unknown'
    };
    return categoryMap[category] || category;
}

/**
 * Highlight elements by category
 */
function highlightCategory(category) {
    const elements = document.querySelectorAll('.element');
    elements.forEach(el => {
        if (el.getAttribute('data-category') === category) {
            el.classList.add('element-glow');
        } else {
            el.style.opacity = '0.3';
        }
    });
}

/**
 * Clear category highlights
 */
function clearHighlights() {
    const elements = document.querySelectorAll('.element');
    elements.forEach(el => {
        el.classList.remove('element-glow');
        el.style.opacity = '1';
    });
}

// Add legend item click handlers for highlighting
document.addEventListener('DOMContentLoaded', () => {
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
        const colorDiv = item.querySelector('.legend-color');
        if (colorDiv) {
            const category = Array.from(colorDiv.classList).find(c => c !== 'legend-color');
            if (category) {
                item.addEventListener('click', () => {
                    if (item.classList.contains('active')) {
                        item.classList.remove('active');
                        clearHighlights();
                    } else {
                        legendItems.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        highlightCategory(category);
                    }
                });
            }
        }
    });
});
