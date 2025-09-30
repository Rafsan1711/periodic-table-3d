/**
 * Molecule 3D Visualization Module
 * Creates 3D molecular models using Three.js
 */

let matterScene, matterCamera, matterRenderer, matterGroup;

/**
 * Creates a 3D visualization of a molecule
 * @param {Object} molecule - Molecule data with atoms and bonds
 */
function create3DMolecule(molecule) {
    const container = document.getElementById('matterViewer');
    container.innerHTML = '';
    
    matterScene = new THREE.Scene();
    matterScene.background = new THREE.Color(0x0d1117);

    matterCamera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    matterCamera.position.set(0, 0, 10);

    matterRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    matterRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(matterRenderer.domElement);

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

    // Center molecule
    const center = { x: 0, y: 0, z: 0 };
    molecule.atoms.forEach(a => { 
        center.x += (a.x || 0); 
        center.y += (a.y || 0); 
        center.z += (a.z || 0); 
    });
    center.x /= Math.max(1, molecule.atoms.length); 
    center.y /= Math.max(1, molecule.atoms.length); 
    center.z /= Math.max(1, molecule.atoms.length);

    // Add atoms
    molecule.atoms.forEach((a, idx) => {
        const col = colorMap[a.el] || 0x888888;
        const r = radiusMap[a.el] || 0.35;
        const g = new THREE.SphereGeometry(r, 24, 24);
        const m = new THREE.MeshPhongMaterial({ color: col, shininess: 80 });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set((a.x || 0) - center.x, (a.y || 0) - center.y, (a.z || 0) - center.z);
        matterGroup.add(mesh);

        // Add label
        const canvas = document.createElement('canvas');
        canvas.width = 128; 
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.font = '64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.el, 64, 64);
        const tex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 1 });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(0.8, 0.8, 0.8);
        sprite.position.set((a.x || 0) - center.x, (a.y || 0) - center.y, (a.z || 0) - center.z + 0.5);
        matterGroup.add(sprite);
    });

    // Add bonds as cylinders
    molecule.bonds.forEach(b => {
        const a1 = molecule.atoms[b[0]];
        const a2 = molecule.atoms[b[1]];
        if (!a1 || !a2) return;
        
        const start = new THREE.Vector3((a1.x || 0) - center.x, (a1.y || 0) - center.y, (a1.z || 0) - center.z);
        const end = new THREE.Vector3((a2.x || 0) - center.x, (a2.y || 0) - center.y, (a2.z || 0) - center.z);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const dist = start.distanceTo(end);

        const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, dist, 12);
        const cylMat = new THREE.MeshPhongMaterial({ color: 0x999999 });
        const cyl = new THREE.Mesh(cylGeo, cylMat);

        cyl.position.copy(mid);
        cyl.lookAt(end);
        cyl.rotateX(Math.PI / 2);
        matterGroup.add(cyl);
    });

    // Lights
    matterScene.add(new THREE.AmbientLight(0x888888, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9); 
    dl.position.set(5, 5, 5); 
    matterScene.add(dl);
    matterScene.add(new THREE.PointLight(0xBBBBFF, 0.4, 0));

    // Animation
    function animateM() {
        requestAnimationFrame(animateM);
        matterGroup.rotation.y += 0.005;
        matterRenderer.render(matterScene, matterCamera);
    }
    animateM();

    // Handle resize
    window.addEventListener('resize', () => {
        if (!matterRenderer) return;
        matterCamera.aspect = container.clientWidth / container.clientHeight;
        matterCamera.updateProjectionMatrix();
        matterRenderer.setSize(container.clientWidth, container.clientHeight);
    }, { passive: true });
}
