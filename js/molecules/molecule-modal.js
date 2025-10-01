/**
 * Molecule Modal Module
 * Manages the molecule details modal window
 */

/**
 * Opens modal with molecule details
 * @param {Object} molecule - Molecule data
 */
function openMatterModal(molecule) {
    document.getElementById('matterModal').classList.add('active');
    document.getElementById('matterModalTitle').textContent = `${molecule.name} — ${molecule.formula}`;

    // Update info
    document.getElementById('matterInfo').innerHTML = `
        <div class="info-section">
            <h3>Properties</h3>
            <div class="property">
                <span class="property-label">Name:</span>
                <span class="property-value">${molecule.name}</span>
            </div>
            <div class="property">
                <span class="property-label">Formula:</span>
                <span class="property-value">${molecule.formula}</span>
            </div>
            <div class="property">
                <span class="property-label">Atoms:</span>
                <span class="property-value">${molecule.atoms.length}</span>
            </div>
            <div class="property">
                <span class="property-label">Bonds:</span>
                <span class="property-value">${molecule.bonds.length}</span>
            </div>
        </div>
    `;

    loadMatterWiki(molecule.wikiTitle);
    create3DMolecule(molecule);
    draw2DMolecule(molecule);
}

/**
 * Closes the molecule modal
 */
function closeMatterModal() {
    const modal = document.getElementById('matterModal');
    modal.classList.remove('active');
    
    // Cleanup Three.js
    if (matterRenderer) {
        const c = document.getElementById('matterViewer');
        if (c.contains(matterRenderer.domElement)) {
            c.removeChild(matterRenderer.domElement);
        }
        try { 
            matterRenderer.dispose(); 
        } catch (e) {}
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
}

// Event listeners for molecule modal
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('closeMatterModal').addEventListener('click', closeMatterModal);
    
    document.getElementById('matterModal').addEventListener('click', (e) => {
        if (e.target.id === 'matterModal') {
            closeMatterModal();
        }
    });
    
    document.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape') {
            closeMatterModal();
        }
    });
});
