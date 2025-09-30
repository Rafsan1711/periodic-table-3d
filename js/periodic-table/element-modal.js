/**
 * Element Modal Module
 * Manages the element details modal window
 */

/**
 * Opens modal with element details
 * @param {Object} element - Element data
 */
function openElementModal(element) {
    document.getElementById('modalTitle').textContent = `${element.name} (${element.symbol})`;
    document.getElementById('elementModal').classList.add('active');
    
    // Remove active class from all elements
    document.querySelectorAll('.element').forEach(el => el.classList.remove('active'));
    
    // Add active class to clicked element
    document.querySelector(`[data-number="${element.number}"]`).classList.add('active');

    // Create 3D atom visualization
    create3DAtom(element);
    
    // Update atom info
    updateAtomInfo(element);
    
    // Load Wikipedia info
    loadWikipediaInfo(element.name);
}

/**
 * Closes the element modal
 */
function closeModal() {
    document.getElementById('elementModal').classList.remove('active');
    document.querySelectorAll('.element').forEach(el => el.classList.remove('active'));
    
    // Clean up Three.js
    if (renderer) {
        const container = document.getElementById('atomViewer');
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
        renderer.dispose();
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
}

/**
 * Updates the atom information panel
 * @param {Object} element - Element data
 */
function updateAtomInfo(element) {
    const shells = calculateElectronShells(element.number);
    const totalElectrons = shells.reduce((sum, electrons) => sum + electrons, 0);

    document.getElementById('atomInfo').innerHTML = `
        <div class="info-section">
            <h3>Basic Properties</h3>
            <div class="property">
                <span class="property-label">Atomic Number:</span>
                <span class="property-value">${element.number}</span>
            </div>
            <div class="property">
                <span class="property-label">Atomic Weight:</span>
                <span class="property-value">${element.weight} u</span>
            </div>
            <div class="property">
                <span class="property-label">Category:</span>
                <span class="property-value">${formatCategory(element.category)}</span>
            </div>
        </div>
        <div class="info-section">
            <h3>Electron Configuration</h3>
            <div class="property">
                <span class="property-label">Shell Distribution:</span>
                <span class="property-value">${shells.join(', ')}</span>
            </div>
            <div class="property">
                <span class="property-label">Total Electrons:</span>
                <span class="property-value">${totalElectrons}</span>
            </div>
        </div>
    `;
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

// Event listeners for modal
document.addEventListener('DOMContentLoaded', () => {
    // Close modal on outside click
    document.getElementById('elementModal').addEventListener('click', (e) => {
        if (e.target.id === 'elementModal') {
            closeModal();
        }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Handle window resize for Three.js
    window.addEventListener('resize', () => {
        if (renderer && camera) {
            const container = document.getElementById('atomViewer');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
});
