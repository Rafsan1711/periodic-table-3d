/**
 * Reactions Builder Module (Enhanced)
 * Manages the equation builder UI with proper coefficient display
 */

let selectedReactants = [];
let currentReaction = null;

/**
 * Initialize reactions builder
 */
function initReactionsBuilder() {
    const addReactantBtn = document.getElementById('addReactant1');
    const reactBtn = document.getElementById('reactBtn');
    
    if (addReactantBtn) {
        addReactantBtn.addEventListener('click', () => openReactantSelector());
    }
    
    if (reactBtn) {
        reactBtn.addEventListener('click', handleReaction);
    }
}

/**
 * Add reactant to equation
 * @param {string} formula - Chemical formula
 */
function addReactant(formula) {
    selectedReactants.push(formula);
    renderEquation();
    checkReactionPossible();
}

/**
 * Remove reactant from equation
 * @param {number} index - Index of reactant to remove
 */
function removeReactant(index) {
    selectedReactants.splice(index, 1);
    renderEquation();
    checkReactionPossible();
}

/**
 * Render equation display with proper coefficients
 */
function renderEquation() {
    const equationDisplay = document.getElementById('equationDisplay');
    equationDisplay.innerHTML = '';
    
    // Check if reaction exists to get proper coefficients
    const reaction = findReaction(selectedReactants);
    
    if (reaction && !currentReaction) {
        // Show reactants with coefficients (before clicking React)
        reaction.reactants.forEach((reactant, index) => {
            if (index > 0) {
                const operator = document.createElement('span');
                operator.className = 'equation-operator';
                operator.textContent = '+';
                equationDisplay.appendChild(operator);
            }
            
            const chip = document.createElement('div');
            chip.className = 'reactant-chip';
            const coeff = reaction.coefficients[index];
            chip.innerHTML = `
                <span class="formula">${coeff > 1 ? coeff : ''}${formatFormula(reactant)}</span>
                <button class="remove-btn" data-formula="${reactant}">&times;</button>
            `;
            
            chip.querySelector('.remove-btn').addEventListener('click', (e) => {
                const formula = e.target.getAttribute('data-formula');
                const idx = selectedReactants.indexOf(formula);
                if (idx !== -1) removeReactant(idx);
            });
            
            equationDisplay.appendChild(chip);
        });
    } else {
        // Show selected reactants without coefficients
        selectedReactants.forEach((reactant, index) => {
            if (index > 0) {
                const operator = document.createElement('span');
                operator.className = 'equation-operator';
                operator.textContent = '+';
                equationDisplay.appendChild(operator);
            }
            
            const chip = document.createElement('div');
            chip.className = 'reactant-chip';
            chip.innerHTML = `
                <span class="formula">${formatFormula(reactant)}</span>
                <button class="remove-btn" data-index="${index}">&times;</button>
            `;
            
            chip.querySelector('.remove-btn').addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                removeReactant(idx);
            });
            
            equationDisplay.appendChild(chip);
        });
    }
    
    // Add new reactant button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-reactant-btn';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', () => openReactantSelector());
    equationDisplay.appendChild(addBtn);
    
    // If reaction completed, show arrow and products with coefficients
    if (currentReaction) {
        // Arrow
        const arrow = document.createElement('span');
        arrow.className = 'equation-arrow';
        arrow.textContent = '→';
        equationDisplay.appendChild(arrow);
        
        // Products with coefficients
        currentReaction.products.forEach((product, index) => {
            if (index > 0) {
                const operator = document.createElement('span');
                operator.className = 'equation-operator';
                operator.textContent = '+';
                equationDisplay.appendChild(operator);
            }
            
            const chip = document.createElement('div');
            chip.className = 'product-chip';
            const coeff = currentReaction.productCoefficients[index];
            chip.innerHTML = `
                <span class="formula">${coeff > 1 ? coeff : ''}${formatFormula(product)}</span>
            `;
            equationDisplay.appendChild(chip);
        });
        
        // Show reaction name if available
        if (currentReaction.name) {
            const nameLabel = document.createElement('div');
            nameLabel.style.cssText = 'grid-column: 1/-1; text-align: center; color: var(--accent-blue); font-weight: 600; margin-top: 12px; font-size: 1.1rem;';
            nameLabel.textContent = `⚗️ ${currentReaction.name}`;
            equationDisplay.appendChild(nameLabel);
        }
    }
}

/**
 * Format chemical formula with subscripts
 * @param {string} formula - Chemical formula
 * @returns {string} HTML formatted formula
 */
function formatFormula(formula) {
    return formula.replace(/([₀-₉]+)/g, '$1');
}

/**
 * Check if reaction is possible with current reactants
 */
function checkReactionPossible() {
    const reactBtn = document.getElementById('reactBtn');
    
    if (selectedReactants.length === 0) {
        reactBtn.disabled = true;
        reactBtn.textContent = 'React! →';
        currentReaction = null;
        return;
    }
    
    // Check if reaction exists in database
    const reaction = findReaction(selectedReactants);
    
    if (reaction) {
        reactBtn.disabled = false;
        reactBtn.textContent = `React! → (${reaction.name || 'Unknown'})`;
        currentReaction = null; // Don't show products yet
    } else {
        reactBtn.disabled = true;
        reactBtn.textContent = 'No Reaction Found ❌';
        currentReaction = null;
    }
}

/**
 * Handle React button click
 */
function handleReaction() {
    if (selectedReactants.length === 0) return;
    
    const reaction = findReaction(selectedReactants);
    
    if (reaction) {
        currentReaction = reaction;
        renderEquation();
        
        // Start animation
        startReactionAnimation(reaction);
        
        // Disable button during animation
        const reactBtn = document.getElementById('reactBtn');
        reactBtn.disabled = true;
        reactBtn.textContent = '⚗️ Reacting...';
        
        // Enable reset after animation
        setTimeout(() => {
            reactBtn.disabled = false;
            reactBtn.textContent = '🔄 Reset & Try Another';
            reactBtn.onclick = resetEquation;
        }, 5000);
    }
}

/**
 * Reset equation builder
 */
function resetEquation() {
    selectedReactants = [];
    currentReaction = null;
    
    // Clear theatre scene
    if (theatreScene) {
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
    }
    
    // Kill all animations
    if (typeof gsap !== 'undefined') {
        gsap.killTweensOf("*");
    }
    
    renderEquation();
    checkReactionPossible();
    
    // Reset button
    const reactBtn = document.getElementById('reactBtn');
    reactBtn.onclick = handleReaction;
    reactBtn.textContent = 'React! →';
}
