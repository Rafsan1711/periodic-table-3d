/**
 * Element Modal Module (ENHANCED with Reactivity Chart)
 * Manages the element details modal window
 */

let modalOpenTimestamp = 0;

/**
 * Opens modal with element details
 * @param {Object} element - Element data
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
    
    // Update title
    modalTitle.innerHTML = `<i class="fas fa-atom me-2"></i>${element.name} (${element.symbol})`;
    
    // Show modal with animation
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Remove active class from all elements
    document.querySelectorAll('.element').forEach(el => el.classList.remove('active'));
    
    // Add active class to clicked element
    const clickedElement = document.querySelector(`[data-number="${element.number}"]`);
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
    
    // Show loader in viewer
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

    // Create 3D atom visualization with delay
    setTimeout(() => {
        create3DAtom(element);
    }, 150);
    
    // Update atom info
    updateAtomInfo(element);
    
    // Load Wikipedia info
    loadWikipediaInfo(element.name, 'wikiContent');
    
    // Create reactivity chart (NEW)
    setTimeout(() => {
        createReactivityChart(element);
    }, 300);
    
    // Add swipe to close on mobile
    addSwipeToClose(modal);
    
    // Haptic feedback
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
    
    // Clean up Three.js
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
        
        // Clear chart
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
 * Updates the atom information panel (UPDATED with chart section)
 * @param {Object} element - Element data
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
        
        <!-- NEW: Reactivity Chart Section -->
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
 * @param {string} category - Category key
 * @returns {string} Formatted category name
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
 * Add swipe to close functionality for mobile
 */
function addSwipeToClose(modal) {
    let touchStartY = 0;
    let touchEndY = 0;
    
    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) return;
    
    modalContent.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    modalContent.addEventListener('touchmove', (e) => {
        touchEndY = e.touches[0].clientY;
        const diff = touchEndY - touchStartY;
        
        if (diff > 0 && diff < 200) {
            modalContent.style.transform = `translateY(${diff}px)`;
            modalContent.style.transition = 'none';
        }
    }, { passive: true });
    
    modalContent.addEventListener('touchend', () => {
        const diff = touchEndY - touchStartY;
        
        if (diff > 100) {
            closeModal();
        } else {
            modalContent.style.transform = '';
            modalContent.style.transition = 'transform 0.3s ease';
        }
        
        touchStartY = 0;
        touchEndY = 0;
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
    
    console.log('✅ Element modal initialized');
        });
