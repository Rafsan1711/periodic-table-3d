/**
 * ============================================
 * CHEMAI 3D HELPERS
 * Create inline 3D atom/molecule viewers
 * ============================================
 */

/**
 * Create 3D atom in a specific container
 */
function create3DAtomInContainer(element, container) {
    if (!container || !element) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const atomGroup = new THREE.Group();
    scene.add(atomGroup);

    // Nucleus
    const nucleusGeometry = new THREE.SphereGeometry(0.8, 24, 24);
    const nucleusMaterial = new THREE.MeshPhongMaterial({
        color: 0xff4444,
        emissive: 0x330000,
        shininess: 80
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    atomGroup.add(nucleus);

    // Electron shells
    const shells = calculateElectronShells(element.number);
    const shellColors = [0x00ff00, 0x0099ff, 0xffff00, 0xff9900, 0xff0099, 0x9900ff];

    shells.forEach((electronCount, shellIndex) => {
        if (electronCount > 0) {
            const radius = (shellIndex + 1) * 2.2;
            const color = shellColors[shellIndex % shellColors.length];

            // Orbital ring
            const ringGeometry = new THREE.RingGeometry(radius - 0.08, radius + 0.08, 48);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.25,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            atomGroup.add(ring);

            // Electrons
            for (let i = 0; i < electronCount; i++) {
                const electronGeometry = new THREE.SphereGeometry(0.15, 12, 12);
                const electronMaterial = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.3
                });
                const electron = new THREE.Mesh(electronGeometry, electronMaterial);

                const angle = (i / electronCount) * Math.PI * 2;
                electron.position.set(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    0
                );

                electron.userData = {
                    shellIndex,
                    angle: angle,
                    radius: radius,
                    speed: 0.008 / (shellIndex + 1)
                };

                atomGroup.add(electron);
            }
        }
    });

    // Lights
    scene.add(new THREE.AmbientLight(0x888888, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(8, 8, 5);
    scene.add(directionalLight);

    // Animation
    function animate() {
        if (!renderer || !container.contains(renderer.domElement)) return;
        requestAnimationFrame(animate);

        atomGroup.rotation.y += 0.003;

        atomGroup.children.forEach(child => {
            if (child.userData && child.userData.shellIndex !== undefined) {
                child.userData.angle += child.userData.speed;
                child.position.set(
                    Math.cos(child.userData.angle) * child.userData.radius,
                    Math.sin(child.userData.angle) * child.userData.radius,
                    child.position.z
                );
            }
        });

        renderer.render(scene, camera);
    }
    animate();

    // Store for cleanup
    container._threeScene = { scene, camera, renderer };

    return { scene, camera, renderer };
}

/**
 * Create 3D molecule in a specific container
 */
function create3DMoleculeInContainer(molecule, container) {
    if (!container || !molecule) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Center molecule
    const center = { x: 0, y: 0, z: 0 };
    molecule.atoms.forEach(a => {
        center.x += (a.x || 0);
        center.y += (a.y || 0);
        center.z += (a.z || 0);
    });
    center.x /= molecule.atoms.length;
    center.y /= molecule.atoms.length;
    center.z /= molecule.atoms.length;

    const scale = 3.2;

    // Atom colors and radii
    const colorMap = {
        C: 0x333333, O: 0xff4444, H: 0xffffff, N: 0x3050f8,
        Na: 0xAB5CF2, Cl: 0x1FF01F, S: 0xFFFF66, P: 0xFF8C00,
        K: 0x6A5ACD, Ca: 0xFFA500, Mg: 0x90EE90, Fe: 0xB7410E,
        Si: 0xF0C987, F: 0x9AE8F0, Br: 0x8B4513, I: 0x660066,
        Cu: 0xD97745, Zn: 0xA0A0A0, Ag: 0xC0C0C0, Au: 0xFFD700
    };

    const radiusMap = {
        H: 0.22, C: 0.35, O: 0.32, N: 0.30, Na: 0.45,
        Cl: 0.45, S: 0.38, P: 0.38, K: 0.5, Ca: 0.5,
        Mg: 0.45, Fe: 0.45, Si: 0.42, F: 0.28, Br: 0.45,
        I: 0.5, Cu: 0.40, Zn: 0.40, Ag: 0.42, Au: 0.42
    };

    // Add atoms
    molecule.atoms.forEach(atom => {
        const color = colorMap[atom.el] || 0x888888;
        const radius = radiusMap[atom.el] || 0.35;

        const geometry = new THREE.SphereGeometry(radius * scale, 20, 20);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 70,
            emissive: color,
            emissiveIntensity: 0.2
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
        const cylGeo = new THREE.CylinderGeometry(0.06 * scale, 0.06 * scale, distance, 10);
        const cylMat = new THREE.MeshPhongMaterial({ color: 0x999999 });
        const cyl = new THREE.Mesh(cylGeo, cylMat);

        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        cyl.position.copy(mid);
        cyl.lookAt(end);
        cyl.rotateX(Math.PI / 2);

        group.add(cyl);
    });

    // Lights
    scene.add(new THREE.AmbientLight(0x888888, 0.5));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 5, 5);
    scene.add(dl);

    // Animation
    function animate() {
        if (!renderer || !container.contains(renderer.domElement)) return;
        requestAnimationFrame(animate);
        group.rotation.y += 0.004;
        renderer.render(scene, camera);
    }
    animate();

    container._threeScene = { scene, camera, renderer };

    return { scene, camera, renderer };
}

/**
 * Calculate electron shells (2n² rule)
 */
function calculateElectronShells(atomicNumber) {
    const maxElectronsPerShell = [2, 8, 18, 32, 32, 18, 8];
    const shells = [];
    let remainingElectrons = atomicNumber;

    for (let i = 0; i < maxElectronsPerShell.length && remainingElectrons > 0; i++) {
        const electronsInShell = Math.min(remainingElectrons, maxElectronsPerShell[i]);
        shells.push(electronsInShell);
        remainingElectrons -= electronsInShell;
    }

    return shells;
}

/**
 * Cleanup Three.js resources
 */
function cleanupThreeScene(container) {
    if (!container || !container._threeScene) return;

    const { scene, renderer } = container._threeScene;

    if (scene) {
        scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }

    if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
    }

    delete container._threeScene;
}

// Export
window.create3DAtomInContainer = create3DAtomInContainer;
window.create3DMoleculeInContainer = create3DMoleculeInContainer;
window.cleanupThreeScene = cleanupThreeScene;

console.log('✅ ChemAI 3D Helpers loaded');
