/**
 * Molecule 3D Visualization Module (NO CACHE)
 * Fallback version if cache system fails
 */

let matterScene, matterCamera, matterRenderer, matterGroup;
let matterAnimationId = null;

/**
 * Creates a 3D visualization of a molecule
 * @param {Object} molecule - Molecule data with atoms and bonds
 */
function create3DMolecule(molecule) {
    const container = document.getElementById('matterViewer');
    if (!container) return;
    
    // Cleanup previous instance
    cleanupMatter3D();
    
    container.innerHTML = '';
    
    // Scene setup
    matterScene = new THREE.Scene();
    matterScene.background = new THREE.Color(0x0d1117);

    // Camera setup
    matterCamera = new THREE.PerspectiveCamera(
        60, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    matterCamera.position.set(0, 0, 10);

    // Renderer setup
    matterRenderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
    });
    matterRenderer.setSize(container.clientWidth, container.clientHeight);
    matterRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(matterRenderer.domElement);

    // Main group
    matterGroup = new THREE.Group();
    matterScene.add(matterGroup);

    // Atom color and radius maps
    const colorMap = { 
        C: 0x222222, O: 0xff4444, H: 0xffffff, N: 0x3050f8, 
        Na: 0xAB5CF2, Cl: 0x1FF01F, S: 0xFFFF66, P: 0xFF8C00, 
        K: 0x6A5ACD, Ca: 0xFFA500, Mg: 0x90EE90, Fe: 0xB7410E, 
        Si: 0xF0C987, F: 0x9AE8F0, Br: 0x8B4513, I: 0x660066 
    };
    const radiusMap = { 
        H: 0.25, C: 0.4, O: 0.38, N: 0.37, Na: 0.55, 
        Cl: 0.55, S: 0.45, P: 0.45, K: 0.6, Ca: 0.6, 
        Mg: 0.55, Fe: 0.55, Si: 0.5, F: 0.35, Br: 0.55, I: 0.6 
    };

    // Calculate center
    const center = { x: 0, y: 0, z: 0 };
    molecule.atoms.forEach(a => { 
        center.x += (a.x || 0); 
        center.y += (a.y || 0); 
        center.z += (a.z || 0); 
    });
    center.x /= Math.max(1, molecule.atoms.length); 
    center.y /= Math.max(1, molecule.atoms.length); 
    center.z /= Math.max(1, molecule.atoms.length);

    // Add atoms (WITHOUT cache)
    molecule.atoms.forEach((a, idx) => {
        const col = colorMap[a.el] || 0x888888;
        const r = radiusMap[a.el] || 0.35;
        
        // Create geometry directly
        const geometry = new THREE.SphereGeometry(r, 24, 24);
        const material = new THREE.MeshPhongMaterial({
            color: col, 
            shininess: 80,
            emissive: col,
            emissiveIntensity: 0.3
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (a.x || 0) - center.x, 
            (a.y || 0) - center.y, 
            (a.z || 0) - center.z
        );
        mesh.castShadow = true;
        matterGroup.add(mesh);

        // Add label
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.font = 'bold 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.el, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true, 
            opacity: 1 
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(0.8, 0.8, 0.8);
        sprite.position.set(
            (a.x || 0) - center.x, 
            (a.y || 0) - center.y, 
            (a.z || 0) - center.z + 0.5
        );
        matterGroup.add(sprite);
    });

    // Add bonds (WITHOUT cache)
    molecule.bonds.forEach(b => {
        const a1 = molecule.atoms[b[0]];
        const a2 = molecule.atoms[b[1]];
        if (!a1 || !a2) return;
        
        const start = new THREE.Vector3(
            (a1.x || 0) - center.x, 
            (a1.y || 0) - center.y, 
            (a1.z || 0) - center.z
        );
        const end = new THREE.Vector3(
            (a2.x || 0) - center.x, 
            (a2.y || 0) - center.y, 
            (a2.z || 0) - center.z
        );
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const dist = start.distanceTo(end);

        const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, dist, 12);
        const cylMat = new THREE.MeshPhongMaterial({ 
            color: 0x999999,
            shininess: 80
        });
        
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        cyl.position.copy(mid);
        cyl.lookAt(end);
        cyl.rotateX(Math.PI / 2);
        matterGroup.add(cyl);
    });

    // Lighting
    matterScene.add(new THREE.AmbientLight(0x888888, 0.6));
    
    const dl = new THREE.DirectionalLight(0xffffff, 0.9); 
    dl.position.set(5, 5, 5); 
    matterScene.add(dl);
    
    matterScene.add(new THREE.PointLight(0xBBBBFF, 0.4, 0));

    // Start animation
    animateMatter();

    // Handle resize
    const resizeHandler = () => {
        if (!matterRenderer || !matterCamera) return;
        matterCamera.aspect = container.clientWidth / container.clientHeight;
        matterCamera.updateProjectionMatrix();
        matterRenderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('optimizedResize', resizeHandler, { passive: true });
}

/**
 * Animation loop
 */
function animateMatter() {
    if (!matterRenderer || !matterScene || !matterCamera) return;
    
    matterAnimationId = requestAnimationFrame(animateMatter);
    
    if (matterGroup) {
        matterGroup.rotation.y += 0.005;
    }
    
    matterRenderer.render(matterScene, matterCamera);
}

/**
 * Cleanup function
 */
function cleanupMatter3D() {
    // Stop animation
    if (matterAnimationId) {
        cancelAnimationFrame(matterAnimationId);
        matterAnimationId = null;
    }
    
    // Dispose scene objects
    if (matterScene) {
        matterScene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => {
                        if (m.map) m.map.dispose();
                        m.dispose();
                    });
                } else {
                    if (object.material.map) object.material.map.dispose();
                    object.material.dispose();
                }
            }
        });
    }
    
    // Dispose renderer
    if (matterRenderer) {
        matterRenderer.dispose();
        matterRenderer = null;
    }
    
    // Clear references
    matterScene = null;
    matterCamera = null;
    matterGroup = null;
}

// Export cleanup function
window.cleanupMatter3D = cleanupMatter3D;

console.log('✅ Molecule 3D module loaded (NO CACHE fallback version)');
