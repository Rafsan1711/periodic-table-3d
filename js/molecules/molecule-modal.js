/**
 * Molecule Modal Module (OPTIMIZED FOR MOBILE)
 * Fixed swipe detection to not conflict with scrolling
 */

let matterModalOpenTimestamp = 0;

/**
 * Opens modal with molecule details
 */
function openMatterModal(molecule) {
    console.log('🧬 Opening molecule modal:', molecule.name);

    matterModalOpenTimestamp = Date.now();

    const modal = document.getElementById('matterModal');
    const modalTitle = document.getElementById('matterModalTitle');

    if (!modal || !modalTitle) {
        console.error('Matter modal elements not found');
        return;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    modalTitle.innerHTML = `<i class="fas fa-flask me-2"></i>${molecule.name} – ${molecule.formula}`;

    // Show loaders
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

    // Update info
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

    // Load Wikipedia
    loadMatterWiki(molecule.wikiTitle);

    // Create 3D molecule with delay
    setTimeout(() => {
        create3DMolecule(molecule);
    }, 150);

    // Draw 2D structure
    setTimeout(() => {
        draw2DMolecule(molecule);
    }, 300);

    // Add improved swipe detection
    addMatterSwipeToCloseOptimized(modal);

    // Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }

    // Refresh AOS
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
}

/**
 * Closes the molecule modal
 */
function closeMatterModal() {
    // Prevent rapid close
    if (Date.now() - matterModalOpenTimestamp < 300) {
        return;
    }

    console.log('✖ Closing molecule modal');

    const modal = document.getElementById('matterModal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Cleanup Three.js with delay
    setTimeout(() => {
        if (typeof matterRenderer !== 'undefined' && matterRenderer) {
            const c = document.getElementById('matterViewer');
            if (c && c.contains(matterRenderer.domElement)) {
                c.removeChild(matterRenderer.domElement);
            }
            try {
                matterRenderer.dispose();
            } catch (e) {
                console.warn('Matter renderer disposal warning:', e);
            }
            window.matterRenderer = null;
        }
        if (typeof matterScene !== 'undefined' && matterScene) {
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
            window.matterScene = null;
        }
        window.matterCamera = null;
        window.matterGroup = null;
    }, 300);

    // Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate(5);
    }
}

/**
 * FIXED: Improved swipe detection that doesn't interfere with scrolling
 * CRITICAL: Only close on deliberate downward drag from top
 */
function addMatterSwipeToCloseOptimized(modal) {
    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) return;

    let touchStartY = 0;
    let touchStartX = 0;
    let touchCurrentY = 0;
    let touchStartTime = 0;
    let isDraggingDown = false;

    modalContent.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
        isDraggingDown = false;
    }, { passive: true });

    modalContent.addEventListener('touchmove', (e) => {
        if (!e.touches.length) return;

        touchCurrentY = e.touches[0].clientY;
        const touchCurrentX = e.touches[0].clientX;
        const deltaY = touchCurrentY - touchStartY;
        const deltaX = touchCurrentX - touchStartX;

        // CRITICAL: Check if horizontal scroll (don't interfere)
        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
            isDraggingDown = false;
            return;
        }

        // Only process downward drags from near top
        if (deltaY > 0 && touchStartY < 100 && deltaY > 15) {
            isDraggingDown = true;
            const opacity = Math.max(0.85, 1 - (deltaY / 300));
            modalContent.style.opacity = opacity;
            modalContent.style.transform = `translateY(${deltaY * 0.5}px)`;
        } else {
            isDraggingDown = false;
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }
    }, { passive: true });

    modalContent.addEventListener('touchend', (e) => {
        const deltaY = touchCurrentY - touchStartY;
        const timeDiff = Date.now() - touchStartTime;

        // Reset styling
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
        modalContent.style.transition = 'all 0.3s ease';

        // CRITICAL: Only close on significant downward drag from top
        if (isDraggingDown && deltaY > 80 && timeDiff < 800 && touchStartY < 100) {
            setTimeout(() => closeMatterModal(), 100);
        }

        // Remove transition after animation
        setTimeout(() => {
            modalContent.style.transition = '';
        }, 300);
    }, { passive: true });
}

// Event listeners for molecule modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('matterModal');
    const closeBtn = document.getElementById('closeMatterModal');

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMatterModal();
        });
    }

    // Outside click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'matterModal') {
                closeMatterModal();
            }
        });
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const matterModal = document.getElementById('matterModal');
            if (matterModal && matterModal.classList.contains('active')) {
                closeMatterModal();
            }
        }
    });

    // Window resize
    window.addEventListener('optimizedResize', () => {
        if (typeof matterRenderer !== 'undefined' && matterRenderer && typeof matterCamera !== 'undefined' && matterCamera) {
            const container = document.getElementById('matterViewer');
            if (container) {
                matterCamera.aspect = container.clientWidth / container.clientHeight;
                matterCamera.updateProjectionMatrix();
                matterRenderer.setSize(container.clientWidth, container.clientHeight);
            }
        }
    }, { passive: true });

    console.log('✅ Molecule modal initialized (Optimized for Mobile)');
});

// Export functions
window.openMatterModal = openMatterModal;
window.closeMatterModal = closeMatterModal;
