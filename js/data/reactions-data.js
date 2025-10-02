/**
 * Reactions Data Module
 * Contains predefined chemical reactions with reactants and products
 * Format: reactants (sorted alphabetically) -> products
 */

const reactionsDatabase = [
    // Synthesis Reactions
    {
        reactants: ['H₂', 'O₂'],
        coefficients: [2, 1],
        products: ['H₂O'],
        productCoefficients: [2],
        type: 'synthesis',
        name: 'Water Formation'
    },
    {
        reactants: ['H₂', 'N₂'],
        coefficients: [3, 1],
        products: ['NH₃'],
        productCoefficients: [2],
        type: 'synthesis',
        name: 'Ammonia Synthesis'
    },
    {
        reactants: ['C', 'O₂'],
        coefficients: [1, 1],
        products: ['CO₂'],
        productCoefficients: [1],
        type: 'synthesis',
        name: 'Carbon Dioxide Formation'
    },
    {
        reactants: ['Mg', 'O₂'],
        coefficients: [2, 1],
        products: ['MgO'],
        productCoefficients: [2],
        type: 'synthesis',
        name: 'Magnesium Oxide Formation'
    },
    {
        reactants: ['Fe', 'S'],
        coefficients: [1, 1],
        products: ['FeS'],
        productCoefficients: [1],
        type: 'synthesis',
        name: 'Iron Sulfide Formation'
    },
    {
        reactants: ['Na', 'Cl₂'],
        coefficients: [2, 1],
        products: ['NaCl'],
        productCoefficients: [2],
        type: 'synthesis',
        name: 'Sodium Chloride Formation'
    },
    
    // Decomposition Reactions
    {
        reactants: ['H₂O'],
        coefficients: [2],
        products: ['H₂', 'O₂'],
        productCoefficients: [2, 1],
        type: 'decomposition',
        name: 'Water Electrolysis'
    },
    {
        reactants: ['CaCO₃'],
        coefficients: [1],
        products: ['CaO', 'CO₂'],
        productCoefficients: [1, 1],
        type: 'decomposition',
        name: 'Calcium Carbonate Decomposition'
    },
    {
        reactants: ['H₂O₂'],
        coefficients: [2],
        products: ['H₂O', 'O₂'],
        productCoefficients: [2, 1],
        type: 'decomposition',
        name: 'Hydrogen Peroxide Decomposition'
    },
    
    // Single Displacement Reactions
    {
        reactants: ['CuSO₄', 'Fe'],
        coefficients: [1, 1],
        products: ['Cu', 'FeSO₄'],
        productCoefficients: [1, 1],
        type: 'single_displacement',
        name: 'Copper Displacement'
    },
    {
        reactants: ['AgNO₃', 'Cu'],
        coefficients: [2, 1],
        products: ['Ag', 'Cu(NO₃)₂'],
        productCoefficients: [2, 1],
        type: 'single_displacement',
        name: 'Silver Displacement'
    },
    {
        reactants: ['HCl', 'Zn'],
        coefficients: [2, 1],
        products: ['H₂', 'ZnCl₂'],
        productCoefficients: [1, 1],
        type: 'single_displacement',
        name: 'Hydrogen Gas Formation'
    },
    {
        reactants: ['Cl₂', 'NaBr'],
        coefficients: [1, 2],
        products: ['Br₂', 'NaCl'],
        productCoefficients: [1, 2],
        type: 'single_displacement',
        name: 'Halogen Displacement'
    },
    
    // Combustion Reactions
    {
        reactants: ['CH₄', 'O₂'],
        coefficients: [1, 2],
        products: ['CO₂', 'H₂O'],
        productCoefficients: [1, 2],
        type: 'combustion',
        name: 'Methane Combustion'
    },
    {
        reactants: ['C₂H₆', 'O₂'],
        coefficients: [2, 7],
        products: ['CO₂', 'H₂O'],
        productCoefficients: [4, 6],
        type: 'combustion',
        name: 'Ethane Combustion'
    },
    {
        reactants: ['C₃H₈', 'O₂'],
        coefficients: [1, 5],
        products: ['CO₂', 'H₂O'],
        productCoefficients: [3, 4],
        type: 'combustion',
        name: 'Propane Combustion'
    },
    
    // Neutralization Reactions
    {
        reactants: ['HCl', 'NaOH'],
        coefficients: [1, 1],
        products: ['H₂O', 'NaCl'],
        productCoefficients: [1, 1],
        type: 'neutralization',
        name: 'Acid-Base Neutralization'
    },
    {
        reactants: ['H₂SO₄', 'NaOH'],
        coefficients: [1, 2],
        products: ['H₂O', 'Na₂SO₄'],
        productCoefficients: [2, 1],
        type: 'neutralization',
        name: 'Sulfuric Acid Neutralization'
    },
    {
        reactants: ['HNO₃', 'KOH'],
        coefficients: [1, 1],
        products: ['H₂O', 'KNO₃'],
        productCoefficients: [1, 1],
        type: 'neutralization',
        name: 'Nitric Acid Neutralization'
    },
    
    // More Common Reactions
    {
        reactants: ['Al', 'O₂'],
        coefficients: [4, 3],
        products: ['Al₂O₃'],
        productCoefficients: [2],
        type: 'synthesis',
        name: 'Aluminum Oxide Formation'
    },
    {
        reactants: ['Ca', 'O₂'],
        coefficients: [2, 1],
        products: ['CaO'],
        productCoefficients: [2],
        type: 'synthesis',
        name: 'Calcium Oxide Formation'
    },
    {
        reactants: ['Fe₂O₃', 'H₂'],
        coefficients: [1, 3],
        products: ['Fe', 'H₂O'],
        productCoefficients: [2, 3],
        type: 'single_displacement',
        name: 'Iron Ore Reduction'
    },
    {
        reactants: ['CuO', 'H₂'],
        coefficients: [1, 1],
        products: ['Cu', 'H₂O'],
        productCoefficients: [1, 1],
        type: 'single_displacement',
        name: 'Copper Oxide Reduction'
    },
    {
        reactants: ['AgCl'],
        coefficients: [2],
        products: ['Ag', 'Cl₂'],
        productCoefficients: [2, 1],
        type: 'decomposition',
        name: 'Silver Chloride Decomposition'
    },
    {
        reactants: ['C₂H₅OH', 'O₂'],
        coefficients: [1, 3],
        products: ['CO₂', 'H₂O'],
        productCoefficients: [2, 3],
        type: 'combustion',
        name: 'Ethanol Combustion'
    },
    {
        reactants: ['CO', 'O₂'],
        coefficients: [2, 1],
        products: ['CO₂'],
        productCoefficients: [2],
        type: 'combustion',
        name: 'Carbon Monoxide Combustion'
    },
    {
        reactants: ['N₂', 'O₂'],
        coefficients: [1, 1],
        products: ['NO'],
        productCoefficients: [2],
        type: 'synthesis',
        name: 'Nitric Oxide Formation'
    },
    {
        reactants: ['NO', 'O₂'],
        coefficients: [2, 1],
        products: ['NO₂'],
        productCoefficients: [2],
        type: 'synthesis',
        name: 'Nitrogen Dioxide Formation'
    },
    {
        reactants: ['SO₂', 'O₂'],
        coefficients: [2, 1],
        products: ['SO₃'],
        productCoefficients: [2],
        type: 'synthesis',
        name: 'Sulfur Trioxide Formation'
    }
];

/**
 * Find reaction products based on reactants
 * @param {Array} reactants - Array of reactant formulas
 * @returns {Object|null} Reaction object or null if not found
 */
function findReaction(reactants) {
    // Sort reactants alphabetically for matching
    const sortedReactants = [...reactants].sort();
    
    for (const reaction of reactionsDatabase) {
        const sortedDbReactants = [...reaction.reactants].sort();
        
        if (JSON.stringify(sortedReactants) === JSON.stringify(sortedDbReactants)) {
            return reaction;
        }
    }
    
    return null;
}

/**
 * Get all available reactants from database
 * @returns {Array} Unique sorted array of all reactants
 */
function getAllReactants() {
    const reactantsSet = new Set();
    
    reactionsDatabase.forEach(reaction => {
        reaction.reactants.forEach(r => reactantsSet.add(r));
    });
    
    return Array.from(reactantsSet).sort();
        }
