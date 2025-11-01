/**
 * Molecule Modal Module - FIXED
 * Proper cleanup to prevent memory leaks and errors
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
    
    modalTitle.innerHTML = `<i class="fas fa-flask me-2"></i>${molecule.name} — ${molecule.formula}`;

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
 * FIXED: Closes the molecule modal with proper cleanup
 */
function closeMatterModal() {
    // Prevent rapid close
    if (Date.now() - matterModalOpenTimestamp < 300) {
        return;
    }
    
    console.log('❌ Closing molecule modal');
    
    const modal = document.getElementById('matterModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // CRITICAL: Cleanup Three.js immediately
    if (typeof cleanupMatterViewer === 'function') {
        cleanupMatterViewer();
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate(5);
    }
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
        if (matterRenderer && matterCamera) {
            const container = document.getElementById('matterViewer');
            if (container) {
                matterCamera.aspect = container.clientWidth / container.clientHeight;
                matterCamera.updateProjectionMatrix();
                matterRenderer.setSize(container.clientWidth, container.clientHeight);
            }
        }
    }, { passive: true });
    
    console.log('✅ Molecule modal initialized');
});

window.closeMatterModal = closeMatterModal;
window.openMatterModal = openMatterModal;
