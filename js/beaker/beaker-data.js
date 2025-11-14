/**
 * ============================================
 * BEAKER-DATA.JS - Element & Reaction Database
 * ============================================
 */

// Element Properties
const elementProperties = {
    // Solids
    Na: {
        name: 'Sodium',
        type: 'solid',
        color: '#FFA657',
        density: 0.97,
        reactive: true,
        mass: 10
    },
    Ca: {
        name: 'Calcium',
        type: 'solid',
        color: '#A0AEC0',
        density: 1.55,
        reactive: true,
        mass: 12
    },
    Fe: {
        name: 'Iron',
        type: 'solid',
        color: '#718096',
        density: 7.87,
        reactive: false,
        mass: 15
    },
    Mg: {
        name: 'Magnesium',
        type: 'solid',
        color: '#81E6D9',
        density: 1.74,
        reactive: true,
        mass: 11
    },
    Zn: {
        name: 'Zinc',
        type: 'solid',
        color: '#A0AEC0',
        density: 7.14,
        reactive: true,
        mass: 14
    },
    Al: {
        name: 'Aluminum',
        type: 'solid',
        color: '#CBD5E0',
        density: 2.70,
        reactive: false,
        mass: 12
    },
    
    // Liquids
    H2O: {
        name: 'Water',
        type: 'liquid',
        color: '#4facfe',
        volume: 100,
        reactive: false
    },
    HCl: {
        name: 'Hydrochloric Acid',
        type: 'liquid',
        color: '#ff6b6b',
        volume: 100,
        reactive: true
    },
    H2SO4: {
        name: 'Sulfuric Acid',
        type: 'liquid',
        color: '#ffd93d',
        volume: 100,
        reactive: true
    },
    Ethanol: {
        name: 'Ethanol',
        type: 'liquid',
        color: '#a8edea',
        volume: 100,
        reactive: false
    },
    
    // Gases
    O2: {
        name: 'Oxygen',
        type: 'gas',
        color: '#58a6ff',
        reactive: true
    },
    H2: {
        name: 'Hydrogen',
        type: 'gas',
        color: '#f0f6fc',
        reactive: true
    },
    Cl2: {
        name: 'Chlorine',
        type: 'gas',
        color: '#7ce38b',
        reactive: true
    },
    N2: {
        name: 'Nitrogen',
        type: 'gas',
        color: '#bc8cff',
        reactive: false
    },
    CO2: {
        name: 'Carbon Dioxide',
        type: 'gas',
        color: '#ffa657',
        reactive: false
    }
};

// Chemical Reactions Database
const reactionDatabase = [
    // Sodium + Water
    {
        reactants: ['Na', 'H2O'],
        products: {
            liquid: 'NaOH',
            gas: 'H2'
        },
        equation: '2Na + 2H₂O → 2NaOH + H₂',
        effect: 'vigorous',
        liquidColor: '#ff9d76',
        gasEffect: true,
        bubbles: true,
        heat: true
    },
    
    // Magnesium + Hydrochloric Acid
    {
        reactants: ['Mg', 'HCl'],
        products: {
            liquid: 'MgCl2',
            gas: 'H2'
        },
        equation: 'Mg + 2HCl → MgCl₂ + H₂',
        effect: 'moderate',
        liquidColor: '#c2f5e9',
        gasEffect: true,
        bubbles: true,
        heat: false
    },
    
    // Hydrogen + Oxygen -> Water
    {
        reactants: ['H2', 'O2'],
        products: {
            liquid: 'H2O'
        },
        equation: '2H₂ + O₂ → 2H₂O',
        effect: 'explosive',
        liquidColor: '#4facfe',
        gasEffect: true,
        bubbles: false,
        heat: true,
        flash: true
    },
    
    // Sodium + Chlorine
    {
        reactants: ['Na', 'Cl2'],
        products: {
            solid: 'NaCl'
        },
        equation: '2Na + Cl₂ → 2NaCl',
        effect: 'vigorous',
        liquidColor: '#ffffff',
        gasEffect: true,
        heat: true,
        light: true
    },
    
    // Calcium + Water
    {
        reactants: ['Ca', 'H2O'],
        products: {
            liquid: 'CaOH2',
            gas: 'H2'
        },
        equation: 'Ca + 2H₂O → Ca(OH)₂ + H₂',
        effect: 'vigorous',
        liquidColor: '#e8f5e9',
        gasEffect: true,
        bubbles: true,
        heat: true
    },
    
    // Iron + Oxygen (Rust)
    {
        reactants: ['Fe', 'O2'],
        products: {
            solid: 'Fe2O3'
        },
        equation: '4Fe + 3O₂ → 2Fe₂O₃',
        effect: 'slow',
        liquidColor: '#d7826e',
        gasEffect: false,
        heat: false
    },
    
    // Zinc + Hydrochloric Acid
    {
        reactants: ['Zn', 'HCl'],
        products: {
            liquid: 'ZnCl2',
            gas: 'H2'
        },
        equation: 'Zn + 2HCl → ZnCl₂ + H₂',
        effect: 'moderate',
        liquidColor: '#e3f2fd',
        gasEffect: true,
        bubbles: true,
        heat: false
    },
    
    // Aluminum + Sulfuric Acid
    {
        reactants: ['Al', 'H2SO4'],
        products: {
            liquid: 'Al2SO43',
            gas: 'H2'
        },
        equation: '2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂',
        effect: 'vigorous',
        liquidColor: '#fff9c4',
        gasEffect: true,
        bubbles: true,
        heat: true
    }
];

/**
 * Find reaction between elements
 * @param {Array} elements - Array of element symbols in beaker
 * @returns {Object|null} Reaction data or null
 */
function findReaction(elements) {
    // Sort elements for consistent matching
    const sortedElements = [...elements].sort();
    
    for (const reaction of reactionDatabase) {
        const sortedReactants = [...reaction.reactants].sort();
        
        // Check if arrays match
        if (JSON.stringify(sortedElements) === JSON.stringify(sortedReactants)) {
            return reaction;
        }
        
        // Check if elements contain the reactants
        if (sortedReactants.every(r => sortedElements.includes(r))) {
            return reaction;
        }
    }
    
    return null;
}

/**
 * Check if element can react
 * @param {String} element - Element symbol
 * @returns {Boolean}
 */
function isReactive(element) {
    return elementProperties[element]?.reactive || false;
}

/**
 * Get element property
 * @param {String} element - Element symbol
 * @param {String} property - Property name
 * @returns {Any}
 */
function getElementProperty(element, property) {
    return elementProperties[element]?.[property];
}

console.log('✅ Beaker data loaded:', Object.keys(elementProperties).length, 'elements');
console.log('✅ Reactions loaded:', reactionDatabase.length, 'reactions');
