/**
 * Reaction Animator Module (Enhanced with GSAP)
 * Professional 3D animation of chemical reactions
 */

let theatreScene, theatreCamera, theatreRenderer;
let animationFrameId = null;
let particleSystem = null;

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
    theatreScene.fog = new THREE.Fog(0x0d1117, 30, 50);
    
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
    theatreRenderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    theatreRenderer.setSize(container.clientWidth, container.clientHeight);
    theatreRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(theatreRenderer.domElement);
    
    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    theatreScene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(10, 10, 10);
    theatreScene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0x4488ff, 0.6);
    directionalLight2.position.set(-10, -5, -5);
    theatreScene.add(directionalLight2);
    
    const pointLight = new THREE.PointLight(0xff6644, 0.5, 50);
    pointLight.position.set(0, 0, 0);
    theatreScene.add(pointLight);
    
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
    
    // Update particle system if exists
    if (particleSystem) {
        particleSystem.rotation.y += 0.001;
    }
    
    theatreRenderer.render(theatreScene, theatreCamera);
}

/**
 * Calculate scale based on total number of reactants
 */
function calculateScale(totalCount) {
    if (totalCount <= 2) return 5.0;      // অনেক অনেক বড়
    if (totalCount === 3) return 4.2;     // বড়
    if (totalCount === 4) return 3.5;     // মাঝারি
    if (totalCount <= 6) return 3.0;      // একটু ছোট
    return 2.5;                            // ছোট
}

/**
 * Get starting positions based on number of unique reactant types
 */
function getStartPositions(count) {
    switch(count) {
        case 1:
            return [{x: -20, y: 0, z: 0}];
        case 2:
            return [
                {x: 20, y: 0, z: 0},
                {x: -20, y: 0, z: 0}
            ];
        case 3:
            return [
                {x: 20, y: 4, z: 0},
                {x: -20, y: 4, z: 0},
                {x: 0, y: -20, z: 0}
            ];
        case 4:
            return [
                {x: 20, y: 0, z: 0},
                {x: -20, y: 0, z: 0},
                {x: 0, y: -20, z: 0},
                {x: 0, y: 20, z: 0}
            ];
        default:
            const positions = [];
            const radius = 22;
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
 * Create particle explosion effect
 */
function createParticleExplosion(position) {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = position.x;
        positions[i3 + 1] = position.y;
        positions[i3 + 2] = position.z;
        
        colors[i3] = Math.random() * 0.5 + 0.5;
        colors[i3 + 1] = Math.random() * 0.3 + 0.3;
        colors[i3 + 2] = Math.random() * 0.8 + 0.2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(geometry, material);
    theatreScene.add(particleSystem);
    
    // Animate particles outward
    const positionsArray = particleSystem.geometry.attributes.position.array;
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        velocities.push({
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 0.5
        });
    }
    
    gsap.to(particleSystem.material, {
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: function() {
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positionsArray[i3] += velocities[i].x;
                positionsArray[i3 + 1] += velocities[i].y;
                positionsArray[i3 + 2] += velocities[i].z;
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
        },
        onComplete: function() {
            theatreScene.remove(particleSystem);
            particleSystem = null;
        }
    });
}

/**
 * Start reaction animation with proper coefficients
 */
function startReactionAnimation(reaction) {
    if (!theatreScene) return;
    
    // Clear previous objects
    while (theatreScene.children.length > 4) {
        const child = theatreScene.children[4];
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
            } else {
                child.material.dispose();
            }
        }
        theatreScene.remove(child);
    }
    
    // Calculate total molecules
    let totalMolecules = 0;
    reaction.reactants.forEach((reactant, index) => {
        totalMolecules += reaction.coefficients[index];
    });
    
    const globalScale = calculateScale(totalMolecules);
    
    // Create reactant groups with proper coefficients
    const reactantGroups = [];
    const startPositions = getStartPositions(reaction.reactants.length);
    
    reaction.reactants.forEach((reactant, reactantIndex) => {
        const coefficient = reaction.coefficients[reactantIndex];
        const startPos = startPositions[reactantIndex];
        
        // Create multiple copies based on coefficient
        for (let i = 0; i < coefficient; i++) {
            const group = createMoleculeGroup(reactant, globalScale);
            if (group) {
                // Arrange multiple molecules of same type
                const offset = (i - (coefficient - 1) / 2) * (globalScale * 1.5);
                const offsetX = startPos.y !== 0 ? offset : 0;
                const offsetY = startPos.x !== 0 ? offset : 0;
                
                group.position.set(
                    startPos.x + offsetX,
                    startPos.y + offsetY,
                    startPos.z
                );
                
                // Add trail effect
                const trailGeometry = new THREE.SphereGeometry(globalScale * 0.3, 8, 8);
                const trailMaterial = new THREE.MeshBasicMaterial({
                    color: 0x4488ff,
                    transparent: true,
                    opacity: 0.3
                });
                const trail = new THREE.Mesh(trailGeometry, trailMaterial);
                trail.position.copy(group.position);
                theatreScene.add(trail);
                
                theatreScene.add(group);
                reactantGroups.push({
                    group: group,
                    trail: trail,
                    startPos: {x: group.position.x, y: group.position.y}
                });
            }
        }
    });
    
    // Start animation with GSAP
    animateCollisionGSAP(reactantGroups, reaction, globalScale);
}

/**
 * Animate collision using GSAP
 */
function animateCollisionGSAP(reactantGroups, reaction, globalScale) {
    const timeline = gsap.timeline();
    
    // Phase 1: Move to center with trails
    reactantGroups.forEach((item, index) => {
        timeline.to(item.group.position, {
            x: 0,
            y: 0,
            z: 0,
            duration: 2,
            ease: "power2.inOut",
            delay: index * 0.1,
            onUpdate: function() {
                // Update trail
                item.trail.position.lerp(item.group.position, 0.1);
            }
        }, 0);
        
        timeline.to(item.group.rotation, {
            y: Math.PI * 4,
            duration: 2,
            ease: "power1.inOut"
        }, 0);
        
        // Fade out trail
        timeline.to(item.trail.material, {
            opacity: 0,
            duration: 1.5
        }, 0.5);
    });
    
    // Phase 2: Collision effect
    timeline.call(() => {
        // Create particle explosion
        createParticleExplosion({x: 0, y: 0, z: 0});
        
        // Pulsing effect on reactants
        reactantGroups.forEach(item => {
            gsap.to(item.group.scale, {
                x: 1.3,
                y: 1.3,
                z: 1.3,
                duration: 0.3,
                yoyo: true,
                repeat: 3,
                ease: "power2.inOut"
            });
        });
    });
    
    timeline.to({}, {duration: 1.2}); // Wait for collision
    
    // Phase 3: Remove reactants and create products
    timeline.call(() => {
        // Remove reactants with fade
        reactantGroups.forEach(item => {
            gsap.to(item.group.material, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    theatreScene.remove(item.group);
                    theatreScene.remove(item.trail);
                }
            });
        });
    });
    
    timeline.to({}, {duration: 0.5}); // Wait for fade
    
    // Phase 4: Create products with animation
    timeline.call(() => {
        createProductsAnimated(reaction, globalScale);
    });
}

/**
 * Create products with entrance animation
 */
function createProductsAnimated(reaction, globalScale) {
    let totalProducts = 0;
    reaction.products.forEach((product, index) => {
        totalProducts += reaction.productCoefficients[index];
    });
    
    let productIndex = 0;
    
    reaction.products.forEach((product, prodIndex) => {
        const coefficient = reaction.productCoefficients[prodIndex];
        
        for (let i = 0; i < coefficient; i++) {
            const group = createMoleculeGroup(product, globalScale);
            if (group) {
                // Calculate position
                let xPos = 0, yPos = 0;
                
                if (totalProducts === 1) {
                    xPos = 0; yPos = 0;
                } else if (totalProducts === 2) {
                    yPos = (productIndex - 0.5) * (globalScale * 2);
                } else if (totalProducts === 3) {
                    const angles = [Math.PI/2, Math.PI*7/6, Math.PI*11/6];
                    const radius = globalScale * 1.5;
                    xPos = Math.cos(angles[productIndex]) * radius;
                    yPos = Math.sin(angles[productIndex]) * radius;
                } else {
                    const angle = (productIndex / totalProducts) * Math.PI * 2;
                    const radius = globalScale * 1.8;
                    xPos = Math.cos(angle) * radius;
                    yPos = Math.sin(angle) * radius;
                }
                
                // Start from center
                group.position.set(0, 0, 0);
                group.scale.set(0.1, 0.1, 0.1);
                group.userData.isProduct = true;
                
                theatreScene.add(group);
                
                // Animate entrance
                gsap.to(group.position, {
                    x: xPos,
                    y: yPos,
                    duration: 1,
                    ease: "back.out(1.7)",
                    delay: productIndex * 0.15
                });
                
                gsap.to(group.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 1,
                    ease: "elastic.out(1, 0.5)",
                    delay: productIndex * 0.15
                });
                
                // Continuous rotation
                gsap.to(group.rotation, {
                    y: Math.PI * 2,
                    duration: 4,
                    repeat: -1,
                    ease: "none"
                });
                
                // Gentle floating animation
                gsap.to(group.position, {
                    z: 0.5,
                    duration: 2,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut",
                    delay: productIndex * 0.2
                });
                
                // Subtle pulsing
                gsap.to(group.scale, {
                    x: 1.05,
                    y: 1.05,
                    z: 1.05,
                    duration: 2.5,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut",
                    delay: productIndex * 0.25
                });
                
                productIndex++;
            }
        }
    });
}

/**
 * Create 3D molecule/atom group with enhanced visuals
 */
function createMoleculeGroup(formula, globalScale = 3.5) {
    const group = new THREE.Group();
    
    // Try to find in molecules data
    const molecule = moleculesData.find(m => m.formula === formula);
    if (molecule && molecule.atoms && molecule.bonds) {
        const scale = globalScale * 1.0;
        
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
        
        // Add atoms with glow
        molecule.atoms.forEach(atom => {
            const color = getAtomColor(atom.el);
            const radius = getAtomRadius(atom.el) * scale;
            
            // Main sphere
            const geometry = new THREE.SphereGeometry(radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color: color, 
                shininess: 100,
                emissive: color,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.95
            });
            const sphere = new THREE.Mesh(geometry, material);
            
            sphere.position.set(
                ((atom.x || 0) - centerX) * scale, 
                ((atom.y || 0) - centerY) * scale, 
                ((atom.z || 0) - centerZ) * scale
            );
            
            group.add(sphere);
            
            // Outer glow
            const glowGeometry = new THREE.SphereGeometry(radius * 1.3, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.15,
                side: THREE.BackSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.copy(sphere.position);
            group.add(glow);
            
            // Element label
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
                opacity: 1
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(scale * 0.8, scale * 0.8, scale * 0.8);
            sprite.position.set(
                ((atom.x || 0) - centerX) * scale, 
                ((atom.y || 0) - centerY) * scale, 
                ((atom.z || 0) - centerZ) * scale + scale * 0.6
            );
            group.add(sprite);
        });
        
        // Add bonds with glow
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
            
            // Main bond
            const geometry = new THREE.CylinderGeometry(
                scale * 0.1, 
                scale * 0.1, 
                distance, 
                16
            );
            const material = new THREE.MeshPhongMaterial({ 
                color: 0xaaaaaa,
                shininess: 80
            });
            const cylinder = new THREE.Mesh(geometry, material);
            
            const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            cylinder.position.copy(midpoint);
            cylinder.lookAt(end);
            cylinder.rotateX(Math.PI / 2);
            
            group.add(cylinder);
            
            // Bond glow
            const glowGeometry = new THREE.CylinderGeometry(
                scale * 0.15, 
                scale * 0.15, 
                distance, 
                8
            );
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.1
            });
            const glowCylinder = new THREE.Mesh(glowGeometry, glowMaterial);
            glowCylinder.position.copy(midpoint);
            glowCylinder.lookAt(end);
            glowCylinder.rotateX(Math.PI / 2);
            group.add(glowCylinder);
        });
    } else {
        // Create single atom with enhanced visuals
        const element = elementsData.find(e => e.symbol === formula);
        if (element) {
            const color = getCategoryColor(element.category);
            const radius = globalScale * 1.5;
            
            // Main sphere
            const geometry = new THREE.SphereGeometry(radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color: color, 
                shininess: 100,
                emissive: color,
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.95
            });
            const sphere = new THREE.Mesh(geometry, material);
            group.add(sphere);
            
            // Multi-layer glow effect
            for (let i = 1; i <= 3; i++) {
                const glowGeometry = new THREE.SphereGeometry(radius * (1 + i * 0.15), 16, 16);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.15 / i,
                    side: THREE.BackSide
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                group.add(glow);
            }
            
            // Element symbol
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // Add shadow for better readability
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            ctx.fillStyle = 'rgba(255,255,255,0.98)';
            ctx.font = 'bold 140px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(element.symbol, 128, 128);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture, 
                transparent: true, 
                opacity: 1
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(globalScale * 1.8, globalScale * 1.8, globalScale * 1.8);
            sprite.position.set(0, 0, globalScale * 2);
            group.add(sprite);
        } else {
            // Default sphere with glow
            const radius = globalScale * 1.2;
            const geometry = new THREE.SphereGeometry(radius, 24, 24);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0x888888,
                emissive: 0x444444,
                emissiveIntensity: 0.3,
                shininess: 80
            });
            const sphere = new THREE.Mesh(geometry, material);
            group.add(sphere);
            
            // Glow
            const glowGeometry = new THREE.SphereGeometry(radius * 1.3, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x888888,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            group.add(glow);
        }
    }
    
    return group;
}

/**
 * Get atom color by element symbol
 */
function getAtomColor(symbol) {
    const colors = {
        H: 0xffffff, C: 0x333333, O: 0xff4444, N: 0x3050f8,
        S: 0xffff66, P: 0xff8c00, Cl: 0x1ff01f, Na: 0xab5cf2,
        Fe: 0xb7410e, Cu: 0xd97745, Mg: 0x90ee90, Ca: 0xffa500,
        K: 0x6a5acd, Ag: 0xc0c0c0, Zn: 0x7f8c8d, Al: 0xa0b0c0,
        Si: 0xdaa520, Br: 0xa52a2a, I: 0x9400d3, F: 0x00ced1
    };
    return colors[symbol] || 0x888888;
}

/**
 * Get atom radius by element symbol
 */
function getAtomRadius(symbol) {
    const radii = {
        H: 0.3, C: 0.5, O: 0.45, N: 0.42, S: 0.52, P: 0.52,
        Cl: 0.58, Na: 0.62, Fe: 0.58, Cu: 0.58, Mg: 0.58, 
        Ca: 0.62, K: 0.65, Ag: 0.6, Zn: 0.55, Al: 0.55,
        Si: 0.52, Br: 0.6, I: 0.65, F: 0.4
    };
    return radii[symbol] || 0.5;
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
    // Kill all GSAP animations
    gsap.killTweensOf("*");
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    if (particleSystem) {
        theatreScene.remove(particleSystem);
        particleSystem = null;
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
