/**
 * Atom Visualization Module (MOBILE OPTIMIZED)
 * Creates 3D atomic models using Three.js with performance optimization
 */

let currentAtom = null;
let scene, camera, renderer;

/**
 * Creates a 3D visualization of an atom
 * @param {Object} element - Element data
 */
function create3DAtom(element) {
    const container = document.getElementById('atomViewer');
    container.innerHTML = '';

    // Get device settings
    const settings = window.MobileOptimizer ? 
        MobileOptimizer.getSettings() : 
        { enableShadows: true, antialias: true };

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);

    // Renderer setup with optimized settings
    renderer = new THREE.WebGLRenderer({ 
        antialias: settings.antialias,
        powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    
    if (settings.enableShadows) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    container.appendChild(renderer.domElement);

    // Atom group
    currentAtom = new THREE.Group();
    scene.add(currentAtom);

    // Create nucleus with reduced segments on mobile
    const nucleusSegments = settings.antialias ? 32 : 16;
    const nucleusGeometry = new THREE.SphereGeometry(1, nucleusSegments, nucleusSegments);
    const nucleusMaterial = new THREE.MeshPhongMaterial({
        color: 0xff4444,
        emissive: 0x330000,
        shininess: 100
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    
    if (settings.enableShadows) {
        nucleus.castShadow = true;
    }
    
    currentAtom.add(nucleus);

    // Create electron shells
    const shells = calculateElectronShells(element.number);
    createElectronShells(shells, settings);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    
    if (settings.enableShadows) {
        directionalLight.castShadow = true;
    }
    
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4444ff, 0.5);
    pointLight.position.set(-10, -10, 10);
    scene.add(pointLight);

    // Start animation
    animateAtom();
}

/**
 * Calculates electron distribution across shells using 2n² rule
 * @param {number} atomicNumber - Number of electrons
 * @returns {Array} Electrons per shell
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
 * Creates visual electron shells and electrons (OPTIMIZED)
 * @param {Array} shells - Electrons per shell
 * @param {Object} settings - Device settings
 */
function createElectronShells(shells, settings) {
    const shellColors = [0x00ff00, 0x0099ff, 0xffff00, 0xff9900, 0xff0099, 0x9900ff, 0xff0000];
    const ringSegments = settings.antialias ? 64 : 32;
    const electronSegments = settings.antialias ? 16 : 8;

    shells.forEach((electronCount, shellIndex) => {
        if (electronCount > 0) {
            const radius = (shellIndex + 1) * 3;
            const color = shellColors[shellIndex % shellColors.length];

            // Create orbital ring
            const ringGeometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, ringSegments);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            currentAtom.add(ring);

            // Create electrons
            for (let i = 0; i < electronCount; i++) {
                const electronGeometry = new THREE.SphereGeometry(0.2, electronSegments, electronSegments);
                const electronMaterial = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.3
                });
                const electron = new THREE.Mesh(electronGeometry, electronMaterial);
                
                if (settings.enableShadows) {
                    electron.castShadow = true;
                }

                const angle = (i / electronCount) * Math.PI * 2;
                electron.position.set(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    (Math.random() - 0.5) * 0.5
                );

                electron.userData = {
                    shellIndex,
                    angle: angle,
                    radius: radius,
                    speed: 0.01 / (shellIndex + 1)
                };

                currentAtom.add(electron);
            }
        }
    });
}

/**
 * Animation loop for atom visualization (OPTIMIZED)
 */
function animateAtom() {
    if (!renderer || !scene || !camera) return;

    requestAnimationFrame(animateAtom);

    if (currentAtom) {
        currentAtom.rotation.y += 0.005;

        currentAtom.children.forEach(child => {
            if (child.userData && child.userData.shellIndex !== undefined) {
                child.userData.angle += child.userData.speed;
                child.position.set(
                    Math.cos(child.userData.angle) * child.userData.radius,
                    Math.sin(child.userData.angle) * child.userData.radius,
                    child.position.z
                );
            }
        });
    }

    renderer.render(scene, camera);
}

console.log('✅ Atom visualization loaded (MOBILE OPTIMIZED)');
