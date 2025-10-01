/**
 * Reaction Animator Module
 * Handles 3D animation of chemical reactions in the theatre
 */

let theatreScene, theatreCamera, theatreRenderer;
let animationFrameId = null;

/**
 * Initialize theatre canvas
 */
function initTheatre() {
    const container = document.getElementById('theatreCanvas');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Scene setup
    theatreScene = new THREE.Scene();
    theatreScene.background = new THREE.Color(0x0d1117);
    
    // Camera
    theatreCamera = new THREE.PerspectiveCamera(
        60, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    theatreCamera.position.set(0, 5, 25);
    theatreCamera.lookAt(0, 0, 0);
    
    // Renderer
    theatreRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    theatreRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(theatreRenderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    theatreScene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(10, 10, 10);
    theatreScene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-10, -10, -10);
    theatreScene.add(directionalLight2);
    
    // Resize handler
    window.addEventListener('resize', () => {
        if (!theatreRenderer || !theatreCamera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        theatreCamera.aspect = w / h;
        theatreCamera.updateProjectionMatrix();
        theatreRenderer.setSize(w, h);
    }, { passive: true });
    
    // Start rendering loop
    renderTheatre();
}

/**
 * Render loop for theatre
 */
function renderTheatre() {
    if (!theatreRenderer || !theatreScene || !theatreCamera) return;
    
    animationFrameId = requestAnimationFrame(renderTheatre);
    theatreRenderer.render(theatreScene, theatreCamera);
}

/**
 * Start reaction animation
 * @param {Object} reaction - Reaction data
 */
function startReactionAnimation(reaction) {
    if (!theatreScene) return;
    
    // Clear previous objects
    while (theatreScene.children.length > 3) {
        theatreScene.remove(theatreScene.children[3]);
    }
    
    // Create reactant molecules/atoms
    const reactantGroups = [];
    const startPositions = [-15, -8]; // Left positions for 2 reactants
    
    reaction.reactants.forEach((reactant, index) => {
        const coeff = reaction.coefficients[index];
        
        for (let i = 0; i < coeff; i++) {
            const group = createMoleculeGroup(reactant);
            if (group) {
                const xPos = startPositions[index] || -15;
                const yOffset = (i - (coeff - 1) / 2) * 3;
                group.position.set(xPos, yOffset, 0);
                theatreScene.add(group);
                reactantGroups.push({
                    group: group,
                    targetX: 0,
                    targetY: yOffset,
                    speed: 0.15
                });
            }
        }
    });
    
    // Animation sequence
    animateCollision(reactantGroups, reaction);
}

/**
 * Animate collision and product formation
 * @param {Array} reactantGroups - Array of reactant group objects
 * @param {Object} reaction - Reaction data
 */
function animateCollision(reactantGroups, reaction) {
    let animationStep = 0;
    let collisionTimer = 0;
    
    const animate = () => {
        if (animationStep === 0) {
            // Move reactants towards center
            let allReached = true;
            reactantGroups.forEach(item => {
                const dx = item.targetX - item.group.position.x;
                if (Math.abs(dx) > 0.5) {
                    item.group.position.x += dx * item.speed;
                    item.group.rotation.y += 0.05;
                    allReached = false;
                }
            });
            
            if (allReached) {
                animationStep = 1;
                collisionTimer = 0;
            }
        } else if (animationStep === 1) {
            // Collision effect
            collisionTimer++;
            
            reactantGroups.forEach(item => {
                item.group.rotation.y += 0.2;
                const scale = 1 + Math.sin(collisionTimer * 0.3) * 0.1;
                item.group.scale.set(scale, scale, scale);
            });
            
            if (collisionTimer > 20) {
                // Remove reactants
                reactantGroups.forEach(item => {
                    theatreScene.remove(item.group);
                });
                
                // Create products
                createProducts(reaction);
                animationStep = 2;
            }
        } else if (animationStep === 2) {
            // Products moving apart
            const products = theatreScene.children.filter(c => c.userData.isProduct);
            let allDone = true;
            
            products.forEach(product => {
                if (product.userData.targetX !== undefined) {
                    const dx = product.userData.targetX - product.position.x;
                    if (Math.abs(dx) > 0.1) {
                        product.position.x += dx * 0.1;
                        product.rotation.y += 0.03;
                        allDone = false;
                    }
                }
            });
            
            if (allDone) {
                return; // Animation complete
            }
        }
        
        if (animationStep < 2 || animationStep === 2) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

/**
 * Create products and position them
 * @param {Object} reaction - Reaction data
 */
function createProducts(reaction) {
    const productPositions = [8, 15]; // Right positions for products
    
    reaction.products.forEach((product, index) => {
        const coeff = reaction.productCoefficients[index];
        
        for (let i = 0; i < coeff; i++) {
            const group = createMoleculeGroup(product);
            if (group) {
                const xPos = productPositions[index] || 8;
                const yOffset = (i - (coeff - 1) / 2) * 3;
                group.position.set(0, yOffset, 0);
                group.userData.isProduct = true;
                group.userData.targetX = xPos;
                theatreScene.add(group);
            }
        }
    });
}

/**
 * Create 3D molecule/atom group
 * @param {string} formula - Chemical formula
 * @returns {THREE.Group} 3D group
 */
function createMoleculeGroup(formula) {
    const group = new THREE.Group();
    
    // Try to find in molecules data
    const molecule = moleculesData.find(m => m.formula === formula);
    if (molecule && molecule.atoms && molecule.bonds) {
        // Create molecule structure
        const scale = 0.8;
        
        // Add atoms
        molecule.atoms.forEach(atom => {
            const color = getAtomColor(atom.el);
            const radius = getAtomRadius(atom.el) * scale;
            
            const geometry = new THREE.SphereGeometry(radius, 16, 16);
            const material = new THREE.MeshPhongMaterial({ color: color, shininess: 60 });
            const sphere = new THREE.Mesh(geometry, material);
            
            sphere.position.set(
                (atom.x || 0) * scale, 
                (atom.y || 0) * scale, 
                (atom.z || 0) * scale
            );
            
            group.add(sphere);
        });
        
        // Add bonds
        molecule.bonds.forEach(bond => {
            const a1 = molecule.atoms[bond[0]];
            const a2 = molecule.atoms[bond[1]];
            if (!a1 || !a2) return;
            
            const start = new THREE.Vector3(
                (a1.x || 0) * scale, 
                (a1.y || 0) * scale, 
                (a1.z || 0) * scale
            );
            const end = new THREE.Vector3(
                (a2.x || 0) * scale, 
                (a2.y || 0) * scale, 
                (a2.z || 0) * scale
            );
            
            const distance = start.distanceTo(end);
            const geometry = new THREE.CylinderGeometry(0.06, 0.06, distance, 8);
            const material = new THREE.MeshPhongMaterial({ color: 0x999999 });
            const cylinder = new THREE.Mesh(geometry, material);
            
            const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            cylinder.position.copy(midpoint);
            cylinder.lookAt(end);
            cylinder.rotateX(Math.PI / 2);
            
            group.add(cylinder);
        });
    } else {
        // Create single atom
        const element = elementsData.find(e => e.symbol === formula);
        if (element) {
            const color = getCategoryColor(element.category);
            const geometry = new THREE.SphereGeometry(1.2, 20, 20);
            const material = new THREE.MeshPhongMaterial({ color: color, shininess: 80 });
            const sphere = new THREE.Mesh(geometry, material);
            group.add(sphere);
        } else {
            // Default sphere
            const geometry = new THREE.SphereGeometry(1, 16, 16);
            const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
            const sphere = new THREE.Mesh(geometry, material);
            group.add(sphere);
        }
    }
    
    return group;
}

/**
 * Get atom color by element symbol
 */
function getAtomColor(symbol) {
    const colors = {
        H: 0xffffff, C: 0x222222, O: 0xff4444, N: 0x3050f8,
        S: 0xffff66, P: 0xff8c00, Cl: 0x1ff01f, Na: 0xab5cf2,
        Fe: 0xb7410e, Cu: 0xd97745, Mg: 0x90ee90, Ca: 0xffa500,
        K: 0x6a5acd, Ag: 0xc0c0c0, Zn: 0x7f8c8d
    };
    return colors[symbol] || 0x888888;
}

/**
 * Get atom radius by element symbol
 */
function getAtomRadius(symbol) {
    const radii = {
        H: 0.25, C: 0.4, O: 0.38, N: 0.37, S: 0.45, P: 0.45,
        Cl: 0.5, Na: 0.55, Fe: 0.5, Cu: 0.5, Mg: 0.5, Ca: 0.55
    };
    return radii[symbol] || 0.4;
}

/**
 * Get color by element category
 */
function getCategoryColor(category) {
    const colors = {
        nonmetal: 0x3182ce,
        noblegas: 0x8b5cf6,
        alkalimetal: 0xed8936,
        alkearthmetal: 0x38b2ac,
        transitionmetal: 0xa0aec0,
        metalloid: 0xb794f6,
        halogen: 0xf6e05e,
        'post-transitionmetal': 0xfc8181,
        lanthanide: 0xf687b3,
        actinide: 0x718096,
        unknown: 0x4a5568
    };
    return colors[category] || 0x888888;
}

/**
 * Cleanup theatre
 */
function cleanupTheatre() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    if (theatreRenderer) {
        theatreRenderer.dispose();
        theatreRenderer = null;
    }
    
    if (theatreScene) {
        theatreScene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        theatreScene = null;
    }
    
    theatreCamera = null;
                                              }
