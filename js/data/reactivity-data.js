/**
 * Reactivity Data Module
 * Contains reactivity patterns for each element
 * Data shows which elements commonly react together (visual levels only)
 */

const reactivityData = {
    // Group 1 - Alkali Metals
    1: { // Hydrogen
        partners: [
            {symbol: 'O', level: 95},
            {symbol: 'C', level: 85},
            {symbol: 'N', level: 75},
            {symbol: 'Cl', level: 90},
            {symbol: 'S', level: 65},
            {symbol: 'F', level: 88}
        ]
    },
    3: { // Lithium
        partners: [
            {symbol: 'O', level: 92},
            {symbol: 'Cl', level: 88},
            {symbol: 'N', level: 70},
            {symbol: 'S', level: 65},
            {symbol: 'F', level: 90}
        ]
    },
    11: { // Sodium
        partners: [
            {symbol: 'Cl', level: 95},
            {symbol: 'O', level: 90},
            {symbol: 'S', level: 70},
            {symbol: 'H', level: 75},
            {symbol: 'N', level: 60},
            {symbol: 'Br', level: 85}
        ]
    },
    19: { // Potassium
        partners: [
            {symbol: 'O', level: 92},
            {symbol: 'Cl', level: 90},
            {symbol: 'Br', level: 85},
            {symbol: 'S', level: 72},
            {symbol: 'N', level: 65}
        ]
    },
    
    // Group 2 - Alkaline Earth Metals
    4: { // Beryllium
        partners: [
            {symbol: 'O', level: 85},
            {symbol: 'Cl', level: 75},
            {symbol: 'F', level: 82},
            {symbol: 'S', level: 60}
        ]
    },
    12: { // Magnesium
        partners: [
            {symbol: 'O', level: 95},
            {symbol: 'Cl', level: 80},
            {symbol: 'S', level: 75},
            {symbol: 'N', level: 70},
            {symbol: 'C', level: 65}
        ]
    },
    20: { // Calcium
        partners: [
            {symbol: 'O', level: 93},
            {symbol: 'C', level: 85},
            {symbol: 'Cl', level: 78},
            {symbol: 'S', level: 72},
            {symbol: 'N', level: 68},
            {symbol: 'P', level: 75}
        ]
    },
    
    // Non-metals
    6: { // Carbon
        partners: [
            {symbol: 'H', level: 95},
            {symbol: 'O', level: 98},
            {symbol: 'N', level: 80},
            {symbol: 'Cl', level: 70},
            {symbol: 'S', level: 75},
            {symbol: 'F', level: 72}
        ]
    },
    7: { // Nitrogen
        partners: [
            {symbol: 'H', level: 90},
            {symbol: 'O', level: 95},
            {symbol: 'C', level: 85},
            {symbol: 'S', level: 70},
            {symbol: 'Cl', level: 65}
        ]
    },
    8: { // Oxygen
        partners: [
            {symbol: 'H', level: 98},
            {symbol: 'C', level: 95},
            {symbol: 'N', level: 85},
            {symbol: 'S', level: 88},
            {symbol: 'Fe', level: 82},
            {symbol: 'Ca', level: 80},
            {symbol: 'Mg', level: 78},
            {symbol: 'Al', level: 75}
        ]
    },
    15: { // Phosphorus
        partners: [
            {symbol: 'O', level: 92},
            {symbol: 'Cl', level: 80},
            {symbol: 'H', level: 75},
            {symbol: 'S', level: 70},
            {symbol: 'C', level: 65}
        ]
    },
    16: { // Sulfur
        partners: [
            {symbol: 'O', level: 90},
            {symbol: 'H', level: 85},
            {symbol: 'C', level: 78},
            {symbol: 'Fe', level: 75},
            {symbol: 'N', level: 68},
            {symbol: 'Cl', level: 72}
        ]
    },
    
    // Halogens
    9: { // Fluorine
        partners: [
            {symbol: 'H', level: 95},
            {symbol: 'C', level: 88},
            {symbol: 'Si', level: 82},
            {symbol: 'O', level: 78},
            {symbol: 'Na', level: 90}
        ]
    },
    17: { // Chlorine
        partners: [
            {symbol: 'H', level: 92},
            {symbol: 'Na', level: 95},
            {symbol: 'C', level: 78},
            {symbol: 'O', level: 75},
            {symbol: 'Fe', level: 80},
            {symbol: 'Ag', level: 88}
        ]
    },
    35: { // Bromine
        partners: [
            {symbol: 'H', level: 85},
            {symbol: 'Na', level: 88},
            {symbol: 'C', level: 75},
            {symbol: 'Mg', level: 70},
            {symbol: 'Al', level: 65}
        ]
    },
    53: { // Iodine
        partners: [
            {symbol: 'H', level: 80},
            {symbol: 'Na', level: 82},
            {symbol: 'K', level: 78},
            {symbol: 'C', level: 70},
            {symbol: 'Ag', level: 75}
        ]
    },
    
    // Transition Metals
    26: { // Iron
        partners: [
            {symbol: 'O', level: 95},
            {symbol: 'S', level: 88},
            {symbol: 'Cl', level: 82},
            {symbol: 'C', level: 75},
            {symbol: 'N', level: 70}
        ]
    },
    29: { // Copper
        partners: [
            {symbol: 'O', level: 90},
            {symbol: 'S', level: 88},
            {symbol: 'Cl', level: 80},
            {symbol: 'N', level: 72},
            {symbol: 'Ag', level: 68}
        ]
    },
    30: { // Zinc
        partners: [
            {symbol: 'O', level: 85},
            {symbol: 'S', level: 82},
            {symbol: 'Cl', level: 78},
            {symbol: 'H', level: 75}
        ]
    },
    47: { // Silver
        partners: [
            {symbol: 'O', level: 82},
            {symbol: 'S', level: 85},
            {symbol: 'Cl', level: 90},
            {symbol: 'N', level: 75},
            {symbol: 'Br', level: 80}
        ]
    },
    79: { // Gold
        partners: [
            {symbol: 'Cl', level: 75},
            {symbol: 'S', level: 70},
            {symbol: 'O', level: 65},
            {symbol: 'Br', level: 68}
        ]
    },
    
    // Post-transition metals
    13: { // Aluminum
        partners: [
            {symbol: 'O', level: 95},
            {symbol: 'Cl', level: 85},
            {symbol: 'S', level: 75},
            {symbol: 'N', level: 68},
            {symbol: 'C', level: 70}
        ]
    },
    
    // Metalloids
    14: { // Silicon
        partners: [
            {symbol: 'O', level: 95},
            {symbol: 'C', level: 80},
            {symbol: 'Cl', level: 75},
            {symbol: 'F', level: 85},
            {symbol: 'H', level: 70}
        ]
    },
    
    // Noble Gases (minimal reactivity)
    2: { // Helium
        partners: []
    },
    10: { // Neon
        partners: []
    },
    18: { // Argon
        partners: []
    },
    36: { // Krypton
        partners: [
            {symbol: 'F', level: 45}
        ]
    },
    54: { // Xenon
        partners: [
            {symbol: 'F', level: 60},
            {symbol: 'O', level: 50}
        ]
    }
};

/**
 * Get reactivity data for an element
 * @param {number} atomicNumber - Atomic number
 * @returns {Object} Object with partners array
 */
function getReactivityData(atomicNumber) {
    return reactivityData[atomicNumber] || { partners: [] };
}

/**
 * Check if element has reactivity data
 * @param {number} atomicNumber - Atomic number
 * @returns {boolean}
 */
function hasReactivityData(atomicNumber) {
    return reactivityData[atomicNumber] && reactivityData[atomicNumber].partners.length > 0;
}

console.log('✅ Reactivity data loaded for', Object.keys(reactivityData).length, 'elements');
