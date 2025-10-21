/**
 * Element Modal Module (MOBILE OPTIMIZED)
 * Manages the element details modal window with proper swipe handling
 */

let modalOpenTimestamp = 0;
let modalTouchStartY = 0;
let modalTouchCurrentY = 0;
let modalIsScrolling = false;

/**
 * Opens modal with element details
 */
function openElementModal(element) {
    console.log('🔬 Opening modal for:', element.name);
    
    modalOpenTimestamp = Date.now();
    
    const modal = document.getElementById('elementModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal || !modalTitle) {
        console.error('Modal elements not found');
        return;
    }
    
    modalTitle.innerHTML = `<i class="fas fa-atom me-2"></i>${element.name} (${element.symbol})`;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    document.querySelectorAll('.element').forEach(el => el.classList.remove('active'));
    
    const clickedElement = document.querySelector(`[data-number="${element.number}"]`);
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
    
    const atomViewer = document.getElementById('atomViewer');
    if (atomViewer) {
        atomViewer.innerHTML = `
            <div class="viewer-loader">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading 3D model...</span>
                </div>
                <p style="color: var(--text-secondary); margin-top: 10px; font-size: 0.9rem;">
                    Loading 3D atom...
                </p>
            </div>
        `;
    }

    // Lazy load 3D on mobile
    const load3D = typeof lazyLoad3D !== 'undefined' ? lazyLoad3D(create3DAtom, 300) : create3DAtom;
    setTimeout(() => load3D(element), 150);
    
    updateAtomInfo(element);
    loadWikipediaInfo(element.name, 'wikiContent');
    
    setTimeout(() => createReactivityChart(element), 300);
    
    addSwipeToClose(modal);
    
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }
}

/**
 * Closes the element modal
 */
function closeModal() {
    if (Date.now() - modalOpenTimestamp < 300) {
        return;
    }
    
    console.log('❌ Closing element modal');
    
    const modal = document.getElementById('elementModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    document.querySelectorAll('.element').forEach(el => el.classList.remove('active'));
    
    setTimeout(() => {
        if (renderer) {
            const container = document.getElementById('atomViewer');
            if (container && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            try {
                renderer.dispose();
            } catch (e) {
                console.warn('Renderer disposal warning:', e);
            }
            renderer = null;
        }
        if (scene) {
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            scene = null;
        }
        camera = null;
        currentAtom = null;
        
        const chartContainer = document.getElementById('reactivityChart');
        if (chartContainer) {
            chartContainer.innerHTML = '';
        }
    }, 300);
    
    if ('vibrate' in navigator) {
        navigator.vibrate(5);
    }
}

/**
 * Updates the atom information panel
 */
function updateAtomInfo(element) {
    const shells = calculateElectronShells(element.number);
    const totalElectrons = shells.reduce((sum, electrons) => sum + electrons, 0);
    
    const atomInfo = document.getElementById('atomInfo');
    if (!atomInfo) return;

    atomInfo.innerHTML = `
        <div class="info-section" data-aos="fade-left" data-aos-delay="100">
            <h3><i class="fas fa-info-circle me-2"></i>Basic Properties</h3>
            <div class="property">
                <span class="property-label"><i class="fas fa-hashtag me-1"></i>Atomic Number:</span>
                <span class="property-value">${element.number}</span>
            </div>
            <div class="property">
                <span class="property-label"><i class="fas fa-weight me-1"></i>Atomic Weight:</span>
                <span class="property-value">${element.weight} u</span>
            </div>
            <div class="property">
                <span class="property-label"><i class="fas fa-tag me-1"></i>Category:</span>
                <span class="property-value">${formatCategory(element.category)}</span>
            </div>
        </div>
        <div class="info-section" data-aos="fade-left" data-aos-delay="200">
            <h3><i class="fas fa-atom me-2"></i>Electron Configuration</h3>
            <div class="property">
                <span class="property-label"><i class="fas fa-layer-group me-1"></i>Shell Distribution:</span>
                <span class="property-value">${shells.join(', ')}</span>
            </div>
            <div class="property">
                <span class="property-label"><i class="fas fa-circle-notch me-1"></i>Total Electrons:</span>
                <span class="property-value">${totalElectrons}</span>
            </div>
            <div class="property">
                <span class="property-label"><i class="fas fa-shapes me-1"></i>Electron Shells:</span>
                <span class="property-value">${shells.length}</span>
            </div>
        </div>
        
        <div class="info-section reactivity-section" data-aos="fade-left" data-aos-delay="300" style="grid-column: 1/-1;">
            <h3><i class="fas fa-chart-line me-2"></i>Chemical Reactivity Pattern</h3>
            <div id="reactivityChart" class="reactivity-chart-container"></div>
        </div>
    `;
    
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

/**
 * Formats category name for display
 */
function formatCategory(category) {
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
 * FIXED: Add swipe to close with proper scroll detection
 */
function addSwipeToClose(modal) {
    const modalContent = modal.querySelector('.modal-content');
    const modalBody = modal.querySelector('.modal-body');
    if (!modalContent || !modalBody) return;
    
    // Reset variables
    modalTouchStartY = 0;
    modalTouchCurrentY = 0;
    modalIsScrolling = false;
    
    modalContent.addEventListener('touchstart', (e) => {
        modalTouchStartY = e.touches[0].clientY;
        modalTouchCurrentY = modalTouchStartY;
        
        // Check if user is at top of scroll
        const isAtTop = modalBody.scrollTop <= 0;
        modalIsScrolling = !isAtTop;
    }, { passive: true });
    
    modalContent.addEventListener('touchmove', (e) => {
        modalTouchCurrentY = e.touches[0].clientY;
        const diff = modalTouchCurrentY - modalTouchStartY;
        
        // Only allow swipe-to-close if at top AND swiping down
        if (!modalIsScrolling && diff > 0 && modalBody.scrollTop <= 0) {
            if (diff < 200) {
                modalContent.style.transform = `translateY(${diff}px)`;
                modalContent.style.transition = 'none';
            }
        }
    }, { passive: true });
    
    modalContent.addEventListener('touchend', () => {
        const diff = modalTouchCurrentY - modalTouchStartY;
        
        // Close only if swiped down more than 100px from top
        if (!modalIsScrolling && diff > 100 && modalBody.scrollTop <= 0) {
            closeModal();
        } else {
            modalContent.style.transform = '';
            modalContent.style.transition = 'transform 0.3s ease';
        }
        
        modalTouchStartY = 0;
        modalTouchCurrentY = 0;
        modalIsScrolling = false;
    }, { passive: true });
}

// Event listeners for modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('elementModal');
    const closeBtn = modal?.querySelector('.close-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'elementModal') {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const elementModal = document.getElementById('elementModal');
            if (elementModal && elementModal.classList.contains('active')) {
                closeModal();
            }
        }
    });

    window.addEventListener('optimizedResize', () => {
        if (renderer && camera) {
            const container = document.getElementById('atomViewer');
            if (container) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        }
    }, { passive: true });
    
    console.log('✅ Element modal initialized (Mobile Optimized)');
});
