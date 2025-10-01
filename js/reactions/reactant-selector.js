/**
 * Reactant Selector Module
 * Manages the modal for selecting atoms and molecules as reactants
 */

let reactantSearchDebounce = null;

/**
 * Open reactant selector modal
 */
function openReactantSelector() {
    const modal = document.getElementById('reactantModal');
    modal.classList.add('active');
    
    // Render all available reactants
    renderReactantList('');
    
    // Focus search input
    document.getElementById('reactantSearch').value = '';
    document.getElementById('reactantSearch').focus();
}

/**
 * Close reactant selector modal
 */
function closeReactantSelector() {
    const modal = document.getElementById('reactantModal');
    modal.classList.remove('active');
}

/**
 * Initialize reactant selector
 */
function initReactantSelector() {
    const closeBtn = document.getElementById('closeReactantModal');
    const searchInput = document.getElementById('reactantSearch');
    const modal = document.getElementById('reactantModal');
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeReactantSelector);
    }
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (reactantSearchDebounce) clearTimeout(reactantSearchDebounce);
            reactantSearchDebounce = setTimeout(() => {
                renderReactantList(e.target.value);
            }, 200);
        });
    }
    
    // Close on outside click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'reactantModal') {
                closeReactantSelector();
            }
        });
    }
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeReactantSelector();
        }
    });
}

/**
 * Render reactant list with search
 * @param {string} query - Search query
 */
function renderReactantList(query) {
    const listEl = document.getElementById('reactantList');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    // Combine atoms and molecules
    const allItems = [];
    
    // Add elements (atoms)
    elementsData.forEach(element => {
        allItems.push({
            name: element.name,
            formula: element.symbol,
            type: 'atom'
        });
    });
    
    // Add molecules
    moleculesData.forEach(molecule => {
        allItems.push({
            name: molecule.name,
            formula: molecule.formula,
            type: 'molecule'
        });
    });
    
    // Filter and sort
    const q = (query || '').trim();
    let items = allItems;
    
    if (q) {
        items = allItems.map(item => {
            const score = Math.max(
                scoreMatch(q, item.name),
                scoreMatch(q, item.formula)
            );
            return { ...item, score };
        }).filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score);
    } else {
        items = allItems.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Render items
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'reactant-item';
        div.innerHTML = `
            <span class="reactant-item-name">${item.name}</span>
            <span class="reactant-item-formula">${item.formula}</span>
        `;
        
        div.addEventListener('click', () => {
            addReactant(item.formula);
            closeReactantSelector();
        });
        
        listEl.appendChild(div);
    });
    
    // Empty state
    if (items.length === 0) {
        listEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary)">No results found</div>';
    }
}
