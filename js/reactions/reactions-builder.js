/**
 * Reactions Builder Module
 * Manages the equation builder UI and logic
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
 * Render equation display
 */
function renderEquation() {
    const equationDisplay = document.getElementById('equationDisplay');
    equationDisplay.innerHTML = '';
    
    // Add reactants
    selectedReactants.forEach((reactant, index) => {
        // Add operator if not first
        if (index > 0) {
            const operator = document.createElement('span');
            operator.className = 'equation-operator';
            operator.textContent = '+';
            equationDisplay.appendChild(operator);
        }
        
        // Add reactant chip
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
    
    // Add new reactant button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-reactant-btn';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', () => openReactantSelector());
    equationDisplay.appendChild(addBtn);
    
    // If reaction found, show arrow and products
    if (currentReaction) {
        // Arrow
        const arrow = document.createElement('span');
        arrow.className = 'equation-arrow';
        arrow.textContent = '→';
        equationDisplay.appendChild(arrow);
        
        // Products
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
    }
}

/**
 * Format chemical formula with subscripts
 * @param {string} formula - Chemical formula
 * @returns {string} HTML formatted formula
 */
function formatFormula(formula) {
    return formula.replace(/(\d+)/g, '<sub>$1</sub>');
}

/**
 * Check if reaction is possible with current reactants
 */
function checkReactionPossible() {
    const reactBtn = document.getElementById('reactBtn');
    
    if (selectedReactants.length === 0) {
        reactBtn.disabled = true;
        currentReaction = null;
        return;
    }
    
    // Check if reaction exists in database
    const reaction = findReaction(selectedReactants);
    
    if (reaction) {
        reactBtn.disabled = false;
        currentReaction = null; // Don't show products yet
    } else {
        reactBtn.disabled = true;
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
        setTimeout(() => {
            reactBtn.disabled = false;
        }, 5000); // Enable after animation
    }
}

/**
 * Reset equation builder
 */
function resetEquation() {
    selectedReactants = [];
    currentReaction = null;
    renderEquation();
    checkReactionPossible();
}
