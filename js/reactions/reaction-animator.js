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
 * Get starting positions based on number of reactants
 * @param {number} count - Number of reactants
 * @returns {Array} Array of {x, y, z} positions
 */
function getStartPositions(count) {
    switch(count) {
        case 1:
            return [{x: -18, y: 0, z: 0}];
        case 2:
            // ডান ও বাম দিক থেকে
            return [
                {x: 18, y: 0, z: 0},   // ডান দিক
                {x: -18, y: 0, z: 0}   // বাম দিক
            ];
        case 3:
            // ডান, বাম ও নিচ দিক থেকে
            return [
                {x: 18, y: 3, z: 0},   // ডান দিক
                {x: -18, y: 3, z: 0},  // বাম দিক
                {x: 0, y: -18, z: 0}   // নিচ দিক
            ];
        case 4:
            // ডান, বাম, নিচ ও উপর দিক থেকে
            return [
                {x: 18, y: 0, z: 0},   // ডান দিক
                {x: -18, y: 0, z: 0},  // বাম দিক
                {x: 0, y: -18, z: 0},  // নিচ দিক
                {x: 0, y: 18, z: 0}    // উপর দিক
            ];
        default:
            // 4+ reactants এর জন্য circle pattern
            const positions = [];
            const radius = 20;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                positions.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    z: 0
                });
            }
            return positions;
    }
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
    const totalReactants = reaction.reactants.length;
    const startPositions = getStartPositions(totalReactants);
    
    let posIndex = 0;
    reaction.reactants.forEach((reactant, index) => {
        const coeff = reaction.coefficients[index];
        
        for (let i = 0; i < coeff; i++) {
            const group = createMoleculeGroup(reactant);
            if (group) {
                const startPos = startPositions[posIndex % startPositions.length];
                
                // Multiple coefficient এর ক্ষেত্রে একটু offset দিয়ে দিচ্ছি
                const offset = (i - (coeff - 1) / 2) * 2;
                group.position.set(
                    startPos.x + (startPos.y !== 0 ? offset : 0),
                    startPos.y + (startPos.x !== 0 ? offset : 0),
                    startPos.z
                );
                
                theatreScene.add(group);
                reactantGroups.push({
                    group: group,
                    targetX: 0,
                    targetY: 0,
                    speed: 0.08  // আগের চেয়ে ধীর (0.15 থেকে 0.08)
                });
                
                posIndex++;
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
            // Move reactants towards center (ধীরগতিতে)
            let allReached = true;
            reactantGroups.forEach(item => {
                const dx = item.targetX - item.group.position.x;
                const dy = item.targetY - item.group.position.y;
                
                if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
                    item.group.position.x += dx * item.speed;
                    item.group.position.y += dy * item.speed;
                    item.group.rotation.y += 0.03; // ধীর rotation
                    allReached = false;
                }
            });
            
            if (allReached) {
                animationStep = 1;
                collisionTimer = 0;
            }
        } else if (animationStep === 1) {
            // Collision effect (আরো লম্বা সময়)
            collisionTimer++;
            
            reactantGroups.forEach(item => {
                item.group.rotation.y += 0.15;
                const scale = 1 + Math.sin(collisionTimer * 0.2) * 0.15;
                item.group.scale.set(scale, scale, scale);
            });
            
            if (collisionTimer > 40) { // আগের চেয়ে বেশি সময় (20 থেকে 40)
                // Remove reactants
                reactantGroups.forEach(item => {
                    theatreScene.remove(item.group);
                });
                
                // Create products
                createProducts(reaction);
                animationStep = 2;
            }
        } else if (animationStep === 2) {
            // Products moving apart (ধীরগতিতে)
            const products = theatreScene.children.filter(c => c.userData.isProduct);
            let allDone = true;
            
            products.forEach(product => {
                if (product.userData.targetX !== undefined) {
                    const dx = product.userData.targetX - product.position.x;
                    const dy = product.userData.targetY - product.position.y;
                    
                    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                        product.position.x += dx * 0.06; // ধীর (0.1 থেকে 0.06)
                        product.position.y += dy * 0.06;
                        product.rotation.y += 0.02; // ধীর rotation
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
    const totalProducts = reaction.products.length;
    const productPositions = getProductPositions(totalProducts);
    
    let posIndex = 0;
    reaction.products.forEach((product, index) => {
        const coeff = reaction.productCoefficients[index];
        
        for (let i = 0; i < coeff; i++) {
            const group = createMoleculeGroup(product);
            if (group) {
                const targetPos = productPositions[posIndex % productPositions.length];
                
                // Multiple coefficient এর ক্ষেত্রে একটু offset
                const offset = (i - (coeff - 1) / 2) * 2;
                
                group.position.set(0, 0, 0); // Center থেকে শুরু
                group.userData.isProduct = true;
                group.userData.targetX = targetPos.x + (targetPos.y !== 0 ? offset : 0);
                group.userData.targetY = targetPos.y + (targetPos.x !== 0 ? offset : 0);
                
                theatreScene.add(group);
                posIndex++;
            }
        }
    });
}

/**
 * Get product positions based on number of products
 * @param {number} count - Number of products
 * @returns {Array} Array of {x, y} positions
 */
function getProductPositions(count) {
    switch(count) {
        case 1:
            return [{x: 12, y: 0}];
        case 2:
            return [
                {x: 12, y: 3},
                {x: 12, y: -3}
            ];
        case 3:
            return [
                {x: 12, y: 4},
                {x: 12, y: 0},
                {x: 12, y: -4}
            ];
        default:
            const positions = [];
            const spacing = 3;
            for (let i = 0; i < count; i++) {
                positions.push({
                    x: 12,
                    y: (i - (count - 1) / 2) * spacing
                });
            }
            return positions;
    }
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
        // Create molecule structure (বড় সাইজ - molecules page এর মতো)
        const scale = 1.8; // আগে 0.8 ছিল, এখন 1.8
        
        // Center calculation
        let centerX = 0, centerY = 0, centerZ = 0;
        molecule.atoms.forEach(a => {
            centerX += (a.x || 0);
            centerY += (a.y || 0);
            centerZ += (a.z || 0);
        });
        centerX /= molecule.atoms.length;
        centerY /= molecule.atoms.length;
        centerZ /= molecule.atoms.length;
        
        // Add atoms
        molecule.atoms.forEach(atom => {
            const color = getAtomColor(atom.el);
            const radius = getAtomRadius(atom.el) * scale;
            
            const geometry = new THREE.SphereGeometry(radius, 24, 24);
            const material = new THREE.MeshPhongMaterial({ 
                color: color, 
                shininess: 80,
                emissive: color,
                emissiveIntensity: 0.2
            });
            const sphere = new THREE.Mesh(geometry, material);
            
            sphere.position.set(
                ((atom.x || 0) - centerX) * scale, 
                ((atom.y || 0) - centerY) * scale, 
                ((atom.z || 0) - centerZ) * scale
            );
            
            group.add(sphere);
            
            // Add element label
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.font = 'bold 64px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(atom.el, 64, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture, 
                transparent: true, 
                opacity: 0.9 
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(1.2, 1.2, 1.2);
            sprite.position.set(
                ((atom.x || 0) - centerX) * scale, 
                ((atom.y || 0) - centerY) * scale, 
                ((atom.z || 0) - centerZ) * scale + 0.8
            );
            group.add(sprite);
        });
        
        // Add bonds
        molecule.bonds.forEach(bond => {
            const a1 = molecule.atoms[bond[0]];
            const a2 = molecule.atoms[bond[1]];
            if (!a1 || !a2) return;
            
            const start = new THREE.Vector3(
                ((a1.x || 0) - centerX) * scale, 
                ((a1.y || 0) - centerY) * scale, 
                ((a1.z || 0) - centerZ) * scale
            );
            const end = new THREE.Vector3(
                ((a2.x || 0) - centerX) * scale, 
                ((a2.y || 0) - centerY) * scale, 
                ((a2.z || 0) - centerZ) * scale
            );
            
            const distance = start.distanceTo(end);
            const geometry = new THREE.CylinderGeometry(0.15, 0.15, distance, 12);
            const material = new THREE.MeshPhongMaterial({ color: 0x999999 });
            const cylinder = new THREE.Mesh(geometry, material);
            
            const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            cylinder.position.copy(midpoint);
            cylinder.lookAt(end);
            cylinder.rotateX(Math.PI / 2);
            
            group.add(cylinder);
        });
    } else {
        // Create single atom (বড় সাইজ)
        const element = elementsData.find(e => e.symbol === formula);
        if (element) {
            const color = getCategoryColor(element.category);
            const geometry = new THREE.SphereGeometry(2.5, 24, 24); // আগে 1.2 ছিল
            const material = new THREE.MeshPhongMaterial({ 
                color: color, 
                shininess: 90,
                emissive: color,
                emissiveIntensity: 0.3
            });
            const sphere = new THREE.Mesh(geometry, material);
            group.add(sphere);
            
            // Add element symbol
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.font = 'bold 120px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(element.symbol, 128, 128);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture, 
                transparent: true, 
                opacity: 0.9 
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(2.5, 2.5, 2.5);
            sprite.position.set(0, 0, 3);
            group.add(sprite);
        } else {
            // Default sphere (বড় সাইজ)
            const geometry = new THREE.SphereGeometry(2, 20, 20); // আগে 1 ছিল
            const material = new THREE.MeshPhongMaterial({ 
                color: 0x888888,
                emissive: 0x444444,
                emissiveIntensity: 0.2
            });
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
