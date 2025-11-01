/**
 * Molecule Modal Module - MOBILE OPTIMIZED
 * Fixed scroll vs swipe conflict
 */

let matterModalOpenTimestamp = 0;
let touchStartY = 0;
let touchCurrentY = 0;
let isScrolling = false;
let modalContent = null;

function openMatterModal(molecule) {
    console.log('ðŸ§¬ Opening molecule modal:', molecule.name);
    
    matterModalOpenTimestamp = Date.now();
    
    const modal = document.getElementById('matterModal');
    const modalTitle = document.getElementById('matterModalTitle');
    
    if (!modal || !modalTitle) {
        console.error('Matter modal elements not found');
        return;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    modalTitle.innerHTML = `<i class="fas fa-flask me-2"></i>${molecule.name} â€" ${molecule.formula}`;

    const matterViewer = document.getElementById('matterViewer');
    if (matterViewer) {
        matterViewer.innerHTML = `
            <div class="viewer-loader">
                <div class="spinner-border text-primary" role="status"></div>
                <p style="color: var(--text-secondary); margin-top: 10px; font-size: 0.9rem;">
                    Loading 3D molecule...
                </p>
            </div>
        `;
    }
    
    const matterInfo = document.getElementById('matterInfo');
    if (matterInfo) {
        matterInfo.innerHTML = `
            <div class="info-section" data-aos="fade-left">
                <h3><i class="fas fa-info-circle me-2"></i>Properties</h3>
                <div class="property">
                    <span class="property-label"><i class="fas fa-tag me-1"></i>Name:</span>
                    <span class="property-value">${molecule.name}</span>
                </div>
                <div class="property">
                    <span class="property-label"><i class="fas fa-flask me-1"></i>Formula:</span>
                    <span class="property-value">${molecule.formula}</span>
                </div>
                <div class="property">
                    <span class="property-label"><i class="fas fa-circle me-1"></i>Atoms:</span>
                    <span class="property-value">${molecule.atoms.length}</span>
                </div>
                <div class="property">
                    <span class="property-label"><i class="fas fa-project-diagram me-1"></i>Bonds:</span>
                    <span class="property-value">${molecule.bonds.length}</span>
                </div>
            </div>
        `;
    }

    loadMatterWiki(molecule.wikiTitle);
    
    setTimeout(() => create3DMolecule(molecule), 150);
    setTimeout(() => draw2DMolecule(molecule), 300);
    
    // FIXED: Better touch handling
    addImprovedMatterSwipeToClose(modal);
    
    if ('vibrate' in navigator) navigator.vibrate(10);
    
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
}

function closeMatterModal() {
    if (Date.now() - matterModalOpenTimestamp < 300) return;
    
    console.log('âŒ Closing molecule modal');
    
    const modal = document.getElementById('matterModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    setTimeout(() => {
        if (matterRenderer) {
            const c = document.getElementById('matterViewer');
            if (c && c.contains(matterRenderer.domElement)) {
                c.removeChild(matterRenderer.domElement);
            }
            try { 
                matterRenderer.dispose(); 
            } catch (e) {
                console.warn('Matter renderer disposal warning:', e);
            }
            matterRenderer = null;
        }
        if (matterScene) {
            matterScene.traverse(o => {
                if (o.geometry) o.geometry.dispose();
                if (o.material) {
                    if (Array.isArray(o.material)) {
                        o.material.forEach(m => m.dispose());
                    } else {
                        o.material.dispose();
                    }
                }
            });
            matterScene = null;
        }
        matterCamera = null;
        matterGroup = null;
    }, 300);
    
    if ('vibrate' in navigator) navigator.vibrate(5);
}

/**
 * IMPROVED: Swipe to close with scroll detection
 */
function addImprovedMatterSwipeToClose(modal) {
    modalContent = modal.querySelector('.modal-body');
    if (!modalContent) return;
    
    let startY = 0;
    let startScrollTop = 0;
    let isDragging = false;
    
    modalContent.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startScrollTop = modalContent.scrollTop;
        isDragging = false;
        isScrolling = false;
    }, { passive: true });
    
    modalContent.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const diffY = currentY - startY;
        const currentScrollTop = modalContent.scrollTop;
        
        // Detect if user is scrolling content
        if (Math.abs(currentScrollTop - startScrollTop) > 5) {
            isScrolling = true;
            return;
        }
        
        // Only allow swipe-down when at top of scroll
        if (currentScrollTop === 0 && diffY > 0 && !isScrolling) {
            isDragging = true;
            
            // Apply transform for visual feedback
            if (diffY < 200) {
                modal.querySelector('.modal-content').style.transform = `translateY(${diffY}px)`;
                modal.querySelector('.modal-content').style.transition = 'none';
            }
        }
    }, { passive: true });
    
    modalContent.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        const diffY = endY - startY;
        
        const modalContentEl = modal.querySelector('.modal-content');
        
        // Close if dragged down more than 100px and at top
        if (isDragging && diffY > 100 && modalContent.scrollTop === 0) {
            closeMatterModal();
        } else {
            // Reset position
            modalContentEl.style.transform = '';
            modalContentEl.style.transition = 'transform 0.3s ease';
        }
        
        isDragging = false;
        isScrolling = false;
    }, { passive: true });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('matterModal');
    const closeBtn = document.getElementById('closeMatterModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMatterModal();
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'matterModal') {
                closeMatterModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape') {
            const matterModal = document.getElementById('matterModal');
            if (matterModal && matterModal.classList.contains('active')) {
                closeMatterModal();
            }
        }
    });
    
    window.addEventListener('optimizedResize', () => {
        if (matterRenderer && matterCamera) {
            const container = document.getElementById('matterViewer');
            if (container) {
                matterCamera.aspect = container.clientWidth / container.clientHeight;
                matterCamera.updateProjectionMatrix();
                matterRenderer.setSize(container.clientWidth, container.clientHeight);
            }
        }
    }, { passive: true });
    
    console.log('âœ… Molecule modal initialized');
});
