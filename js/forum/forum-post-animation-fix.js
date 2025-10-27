/**
 * Forum Post Animation Fix
 * Prevents white screen after animation
 */

// Track active animations
const activePostAnimations = new Map();

/**
 * FIXED: Initialize reaction animation with proper cleanup
 */
function initPostReactionAnimation(post) {
    const theatreId = 'theatre-' + post.id;
    const container = document.getElementById(theatreId);
    if (!container || !post.reactionData) return;
    
    // Clear existing animation
    if (activePostAnimations.has(post.id)) {
        const existing = activePostAnimations.get(post.id);
        if (existing.renderer) {
            existing.renderer.dispose();
        }
        activePostAnimations.delete(post.id);
    }
    
    // Create Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);
    
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 25);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Clear container
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
    
    // Store reference
    activePostAnimations.set(post.id, { scene, camera, renderer, container });
    
    // Start animation loop
    animateReactionLoop(post.id, post.reactionData);
    
    // Continuous render loop
    function render() {
        if (!activePostAnimations.has(post.id)) return;
        const anim = activePostAnimations.get(post.id);
        if (anim && anim.renderer && anim.scene && anim.camera) {
            requestAnimationFrame(render);
            anim.renderer.render(anim.scene, anim.camera);
        }
    }
    render();
}

/**
 * FIXED: Molecule viewer with proper background
 */
function initPostMoleculeViewer(post) {
    const viewerId = 'molecule-viewer-' + post.id;
    const container = document.getElementById(viewerId);
    if (!container || !post.moleculeData) return;
    
    const molecule = moleculesData.find(m => m.id === post.moleculeData.id);
    if (!molecule) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117); // Prevent white background
    
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Clear container
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    const group = new THREE.Group();
    scene.add(group);
    
    // Add lights
    scene.add(new THREE.AmbientLight(0x888888, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(5, 5, 5);
    scene.add(dl);
    
    // Create molecule structure
    const center = {x: 0, y: 0, z: 0};
    molecule.atoms.forEach(a => {
        center.x += (a.x || 0);
        center.y += (a.y || 0);
        center.z += (a.z || 0);
    });
    center.x /= molecule.atoms.length;
    center.y /= molecule.atoms.length;
    center.z /= molecule.atoms.length;
    
    const scale = 3.5;
    
    molecule.atoms.forEach(atom => {
        const color = getAtomColor(atom.el);
        const radius = getAtomRadius(atom.el) * scale;
        
        const geometry = new THREE.SphereGeometry(radius, 24, 24);
        const material = new THREE.MeshPhongMaterial({ 
            color: color, 
            shininess: 80,
            emissive: color,
            emissiveIntensity: 0.3
        });
        const sphere = new THREE.Mesh(geometry, material);
        
        sphere.position.set(
            ((atom.x || 0) - center.x) * scale,
            ((atom.y || 0) - center.y) * scale,
            ((atom.z || 0) - center.z) * scale
        );
        
        group.add(sphere);
    });
    
    // Add bonds
    molecule.bonds.forEach(bond => {
        const a1 = molecule.atoms[bond[0]];
        const a2 = molecule.atoms[bond[1]];
        if (!a1 || !a2) return;
        
        const start = new THREE.Vector3(
            ((a1.x || 0) - center.x) * scale,
            ((a1.y || 0) - center.y) * scale,
            ((a1.z || 0) - center.z) * scale
        );
        const end = new THREE.Vector3(
            ((a2.x || 0) - center.x) * scale,
            ((a2.y || 0) - center.y) * scale,
            ((a2.z || 0) - center.z) * scale
        );
        
        const distance = start.distanceTo(end);
        const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, distance, 12);
        const cylMat = new THREE.MeshPhongMaterial({ color: 0x999999 });
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        cyl.position.copy(mid);
        cyl.lookAt(end);
        cyl.rotateX(Math.PI / 2);
        
        group.add(cyl);
    });
    
    postMoleculeViewers[post.id] = { scene, camera, renderer, group };
    
    // Animation
    function animate() {
        if (!postMoleculeViewers[post.id]) return;
        requestAnimationFrame(animate);
        group.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate();
}

/**
 * Cleanup post animations on page change
 */
function cleanupPostAnimations() {
    activePostAnimations.forEach((anim, postId) => {
        if (anim.renderer) {
            anim.renderer.dispose();
        }
    });
    activePostAnimations.clear();
    
    Object.keys(postMoleculeViewers).forEach(postId => {
        const viewer = postMoleculeViewers[postId];
        if (viewer.renderer) {
            viewer.renderer.dispose();
        }
        delete postMoleculeViewers[postId];
    });
}

// Export functions
window.initPostReactionAnimation = initPostReactionAnimation;
window.initPostMoleculeViewer = initPostMoleculeViewer;
window.cleanupPostAnimations = cleanupPostAnimations;

console.log('✅ Post animation fix loaded (no white screen)');
