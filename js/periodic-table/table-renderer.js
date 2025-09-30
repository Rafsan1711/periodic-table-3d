/**
 * Periodic Table Renderer Module
 * Handles rendering of the periodic table grid and series
 */

/**
 * Initializes and renders the complete periodic table
 */
function initPeriodicTable() {
    const table = document.getElementById('periodicTable');
    const lanthanideElements = document.getElementById('lanthanideElements');
    const actinideElements = document.getElementById('actinideElements');

    // Create main periodic table (7 rows x 18 columns)
    for (let row = 1; row <= 7; row++) {
        for (let col = 1; col <= 18; col++) {
            const element = findElementByPosition(row, col);
            if (element) {
                const elementDiv = createElementDiv(element);
                elementDiv.style.gridRow = row;
                elementDiv.style.gridColumn = col;
                table.appendChild(elementDiv);
            } else {
                const emptyDiv = document.createElement('div');
                emptyDiv.style.gridRow = row;
                emptyDiv.style.gridColumn = col;
                table.appendChild(emptyDiv);
            }
        }
    }

    // Create lanthanide series (elements 58-71)
    for (let i = 58; i <= 71; i++) {
        const element = elementsData.find(el => el.number === i);
        if (element) {
            const elementDiv = createElementDiv(element);
            lanthanideElements.appendChild(elementDiv);
        }
    }

    // Create actinide series (elements 90-103)
    for (let i = 90; i <= 103; i++) {
        const element = elementsData.find(el => el.number === i);
        if (element) {
            const elementDiv = createElementDiv(element);
            actinideElements.appendChild(elementDiv);
        }
    }
}

/**
 * Finds element by grid position
 * @param {number} row - Grid row (1-7)
 * @param {number} col - Grid column (1-18)
 * @returns {Object|null} Element data or null
 */
function findElementByPosition(row, col) {
    return elementsData.find(element => {
        const pos = elementPositions[element.number];
        return pos && pos[0] === row && pos[1] === col;
    });
}

/**
 * Creates HTML element for a single periodic table cell
 * @param {Object} element - Element data
 * @returns {HTMLElement} Element div
 */
function createElementDiv(element) {
    const div = document.createElement('div');
    div.className = `element ${element.category}`;
    div.setAttribute('data-number', element.number);
    div.setAttribute('data-symbol', element.symbol);
    div.setAttribute('data-weight', element.weight);
    div.setAttribute('title', element.name);

    div.innerHTML = `
        <div class="element-header">
            <span class="weight">${element.weight}</span>
        </div>
        <span class="symbol">${element.symbol}</span>
        <span class="number">${element.number}</span>
    `;

    div.addEventListener('click', () => openElementModal(element));
    
    return div;
}
