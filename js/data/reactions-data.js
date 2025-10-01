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
        type: 'synthesis'
    },
    {
        reactants: ['H₂', 'N₂'],
        coefficients: [3, 1],
        products: ['NH₃'],
        productCoefficients: [2],
        type: 'synthesis'
    },
    {
        reactants: ['C', 'O₂'],
        coefficients: [1, 1],
        products: ['CO₂'],
        productCoefficients: [1],
        type: 'synthesis'
    },
    {
        reactants: ['Mg', 'O₂'],
        coefficients: [2, 1],
        products: ['MgO'],
        productCoefficients: [2],
        type: 'synthesis'
    },
    {
        reactants: ['Fe', 'S'],
        coefficients: [1, 1],
        products: ['FeS'],
        productCoefficients: [1],
        type: 'synthesis'
    },
    {
        reactants: ['Na', 'Cl₂'],
        coefficients: [2, 1],
        products: ['NaCl'],
        productCoefficients: [2],
        type: 'synthesis'
    },
    
    // Decomposition Reactions
    {
        reactants: ['H₂O'],
        coefficients: [2],
        products: ['H₂', 'O₂'],
        productCoefficients: [2, 1],
        type: 'decomposition'
    },
    {
        reactants: ['CaCO₃'],
        coefficients: [1],
        products: ['CaO', 'CO₂'],
        productCoefficients: [1, 1],
        type: 'decomposition'
    },
    {
        reactants: ['H₂O₂'],
        coefficients: [2],
        products: ['H₂O', 'O₂'],
        productCoefficients: [2, 1],
        type: 'decomposition'
    },
    
    // Single Displacement Reactions
    {
        reactants: ['CuSO₄', 'Fe'],
        coefficients: [1, 1],
        products: ['Cu', 'FeSO₄'],
        productCoefficients: [1, 1],
        type: 'single_displacement'
    },
    {
        reactants: ['AgNO₃', 'Cu'],
        coefficients: [2, 1],
        products: ['Ag', 'Cu(NO₃)₂'],
        productCoefficients: [2, 1],
        type: 'single_displacement'
    },
    {
        reactants: ['HCl', 'Zn'],
        coefficients: [2, 1],
        products: ['H₂', 'ZnCl₂'],
        productCoefficients: [1, 1],
        type: 'single_displacement'
    },
    {
        reactants: ['Cl₂', 'NaBr'],
        coefficients: [1, 2],
        products: ['Br₂', 'NaCl'],
        productCoefficients: [1, 2],
        type: 'single_displacement'
    },
    
    // Combustion Reactions
    {
        reactants: ['CH₄', 'O₂'],
        coefficients: [1, 2],
        products: ['CO₂', 'H₂O'],
        productCoefficients: [1, 2],
        type: 'combustion'
    },
    {
        reactants: ['C₂H₆', 'O₂'],
        coefficients: [2, 7],
        products: ['CO₂', 'H₂O'],
        productCoefficients: [4, 6],
        type: 'combustion'
    },
    {
        reactants: ['C₃H₈', 'O₂'],
        coefficients: [1, 5],
        products: ['CO₂', 'H₂O'],
        productCoefficients: [3, 4],
        type: 'combustion'
    },
    
    // Neutralization Reactions
    {
        reactants: ['HCl', 'NaOH'],
        coefficients: [1, 1],
        products: ['H₂O', 'NaCl'],
        productCoefficients: [1, 1],
        type: 'neutralization'
    },
    {
        reactants: ['H₂SO₄', 'NaOH'],
        coefficients: [1, 2],
        products: ['H₂O', 'Na₂SO₄'],
        productCoefficients: [2, 1],
        type: 'neutralization'
    },
    {
        reactants: ['HNO₃', 'KOH'],
        coefficients: [1, 1],
        products: ['H₂O', 'KNO₃'],
        productCoefficients: [1, 1],
        type: 'neutralization'
    },
    
    // More Common Reactions
    {
        reactants: ['Al', 'O₂'],
        coefficients: [4, 3],
        products: ['Al₂O₃'],
        productCoefficients: [2],
        type: 'synthesis'
    },
    {
        reactants: ['Ca', 'O₂'],
        coefficients: [2, 1],
        products: ['CaO'],
        productCoefficients: [2],
        type: 'synthesis'
    },
    {
        reactants: ['Fe₂O₃', 'H₂'],
        coefficients: [1, 3],
        products: ['Fe', 'H₂O'],
        productCoefficients: [2, 3],
        type: 'single_displacement'
    },
    {
        reactants: ['CuO', 'H₂'],
        coefficients: [1, 1],
        products: ['Cu', 'H₂O'],
        productCoefficients: [1, 1],
        type: 'single_displacement'
    },
    {
        reactants: ['AgCl'],
        coefficients: [2],
        products: ['Ag', 'Cl₂'],
        productCoefficients: [2, 1],
        type: 'decomposition'
    },
    {
        reactants: ['C₂H₅OH', 'O₂'],
        coefficients: [1, 3],
        products: ['CO₂', 'H₂O'],
        productCoefficients: [2, 3],
        type: 'combustion'
    },
    {
        reactants: ['CO', 'O₂'],
        coefficients: [2, 1],
        products: ['CO₂'],
        productCoefficients: [2],
        type: 'combustion'
    },
    {
        reactants: ['N₂', 'O₂'],
        coefficients: [1, 1],
        products: ['NO'],
        productCoefficients: [2],
        type: 'synthesis'
    },
    {
        reactants: ['NO', 'O₂'],
        coefficients: [2, 1],
        products: ['NO₂'],
        productCoefficients: [2],
        type: 'synthesis'
    },
    {
        reactants: ['SO₂', 'O₂'],
        coefficients: [2, 1],
        products: ['SO₃'],
        productCoefficients: [2],
        type: 'synthesis'
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
