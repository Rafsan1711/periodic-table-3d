/**
 * Forum Post Creation Module - FIXED
 * Reaction Builder + button working properly
 */

let currentReactionData = null;
let currentMoleculeData = null;
let postReactants = [];
let postReaction = null;

/**
 * Open create post modal
 */
function openCreatePostModal() {
    const modal = document.getElementById('create-post-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    document.getElementById('post-title').value = '';
    document.getElementById('post-description').value = '';
    document.getElementById('post-topic').value = 'general';
    document.getElementById('post-content').innerHTML = '';
    currentReactionData = null;
    currentMoleculeData = null;
    postReactants = [];
    postReaction = null;
    
    const submitBtn = document.getElementById('submit-post-btn');
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
    submitBtn.onclick = submitForumPost;
    
    initRichTextEditor();
}

/**
 * Close create post modal
 */
function closeCreatePostModal() {
    const modal = document.getElementById('create-post-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Initialize rich text editor
 */
function initRichTextEditor() {
    const editor = document.getElementById('post-content');
    if (!editor) return;
    
    editor.contentEditable = true;
    setupEditorToolbar();
}

/**
 * Setup editor toolbar
 */
function setupEditorToolbar() {
    document.getElementById('btn-bold')?.addEventListener('click', () => {
        document.execCommand('bold', false, null);
    });
    
    document.getElementById('btn-italic')?.addEventListener('click', () => {
        document.execCommand('italic', false, null);
    });
    
    document.getElementById('btn-underline')?.addEventListener('click', () => {
        document.execCommand('underline', false, null);
    });
    
    document.getElementById('btn-strike')?.addEventListener('click', () => {
        document.execCommand('strikeThrough', false, null);
    });
    
    document.getElementById('btn-heading')?.addEventListener('click', () => {
        document.execCommand('formatBlock', false, '<h3>');
    });
    
    document.getElementById('btn-ul')?.addEventListener('click', () => {
        document.execCommand('insertUnorderedList', false, null);
    });
    
    document.getElementById('btn-ol')?.addEventListener('click', () => {
        document.execCommand('insertOrderedList', false, null);
    });
    
    document.getElementById('btn-code')?.addEventListener('click', () => {
        const selection = window.getSelection().toString();
        if (selection) {
            document.execCommand('insertHTML', false, `<code>${selection}</code>`);
        }
    });
    
    document.getElementById('btn-link')?.addEventListener('click', () => {
        const url = prompt('Enter URL:');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    });
    
    document.getElementById('btn-chemistry')?.addEventListener('click', openChemistryToolModal);
}

/**
 * Open Chemistry Tool Modal
 */
function openChemistryToolModal() {
    const modal = document.getElementById('chemistry-tool-modal');
    if (!modal) return;
    modal.classList.add('active');
}

/**
 * Close Chemistry Tool Modal
 */
function closeChemistryToolModal() {
    const modal = document.getElementById('chemistry-tool-modal');
    if (!modal) return;
    modal.classList.remove('active');
}

/**
 * Select chemistry tool type
 */
function selectChemistryTool(type) {
    closeChemistryToolModal();
    
    if (type === 'reaction') {
        openReactionBuilderModal();
    } else if (type === 'molecule') {
        openMoleculePickerModal();
    }
}

/**
 * FIXED: Open Reaction Builder Modal
 */
function openReactionBuilderModal() {
    const modal = document.getElementById('post-reaction-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    postReactants = [];
    postReaction = null;
    
    renderPostEquationBuilder();
}

/**
 * Close Reaction Builder Modal
 */
function closeReactionBuilderModal() {
    const modal = document.getElementById('post-reaction-modal');
    if (!modal) return;
    modal.classList.remove('active');
}

/**
 * FIXED: Render equation builder
 */
function renderPostEquationBuilder() {
    const container = document.getElementById('post-reaction-builder');
    if (!container) return;
    
    const reactBtn = document.getElementById('post-react-btn');
    
    container.innerHTML = `
        <div class="equation-display" id="post-equation-display"></div>
    `;
    
    const equationDisplay = document.getElementById('post-equation-display');
    
    if (postReactants.length === 0) {
        equationDisplay.innerHTML = `
            <button class="add-reactant-btn" onclick="openPostReactantSelector()" type="button">+</button>
        `;
        if (reactBtn) {
            reactBtn.disabled = true;
            reactBtn.textContent = 'Add reactants to continue';
        }
    } else {
        const reaction = findReaction(postReactants);
        
        if (reaction) {
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
                    <span class="formula">${coeff > 1 ? coeff : ''}${reactant}</span>
                    <button class="remove-btn" onclick="removePostReactant('${reactant}')" type="button">&times;</button>
                `;
                equationDisplay.appendChild(chip);
            });
            
            const addBtn = document.createElement('button');
            addBtn.className = 'add-reactant-btn';
            addBtn.textContent = '+';
            addBtn.type = 'button';
            addBtn.onclick = openPostReactantSelector;
            equationDisplay.appendChild(addBtn);
            
            if (reactBtn) {
                reactBtn.disabled = false;
                reactBtn.innerHTML = `<i class="fas fa-fire me-2"></i>React! → (${reaction.name || 'Unknown'})`;
                reactBtn.onclick = () => performPostReaction(reaction);
            }
        } else {
            postReactants.forEach((reactant, index) => {
                if (index > 0) {
                    const operator = document.createElement('span');
                    operator.className = 'equation-operator';
                    operator.textContent = '+';
                    equationDisplay.appendChild(operator);
                }
                
                const chip = document.createElement('div');
                chip.className = 'reactant-chip';
                chip.innerHTML = `
                    <span class="formula">${reactant}</span>
                    <button class="remove-btn" onclick="removePostReactant('${reactant}')" type="button">&times;</button>
                `;
                equationDisplay.appendChild(chip);
            });
            
            const addBtn = document.createElement('button');
            addBtn.className = 'add-reactant-btn';
            addBtn.textContent = '+';
            addBtn.type = 'button';
            addBtn.onclick = openPostReactantSelector;
            equationDisplay.appendChild(addBtn);
            
            if (reactBtn) {
                reactBtn.disabled = true;
                reactBtn.textContent = 'No Reaction Found ✖';
            }
        }
    }
}

/**
 * FIXED: Open reactant selector with proper modal
 */
function openPostReactantSelector() {
    showInlineReactantSelector();
}

/**
 * FIXED: Show inline reactant selector
 */
function showInlineReactantSelector() {
    const container = document.getElementById('post-reaction-builder');
    if (!container) return;
    
    // Remove existing selector
    const existing = document.getElementById('inline-selector');
    if (existing) existing.remove();
    
    const selectorHTML = `
        <div class="inline-selector" id="inline-selector">
            <div class="inline-selector-header">
                <h4>Select Reactant</h4>
                <button onclick="closeInlineSelector()" class="close-btn" type="button">×</button>
            </div>
            <input type="text" id="inline-search" placeholder="Search atoms or molecules..." class="form-control mb-2" />
            <div class="reactant-list" id="inline-reactant-list"></div>
        </div>
    `;
    
    container.insertAdjacentHTML('afterend', selectorHTML);
    
    renderInlineReactantList();
    
    const searchInput = document.getElementById('inline-search');
    if (searchInput) {
        searchInput.focus();
        searchInput.addEventListener('input', (e) => {
            renderInlineReactantList(e.target.value);
        });
    }
}

/**
 * FIXED: Render inline reactant list with search
 */
function renderInlineReactantList(query = '') {
    const listEl = document.getElementById('inline-reactant-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    const allItems = [];
    
    elementsData.forEach(element => {
        allItems.push({
            name: element.name,
            formula: element.symbol,
            type: 'atom'
        });
    });
    
    moleculesData.forEach(molecule => {
        allItems.push({
            name: molecule.name,
            formula: molecule.formula,
            type: 'molecule'
        });
    });
    
    let items = allItems;
    
    if (query) {
        const q = query.toLowerCase();
        items = allItems.filter(item => 
            item.name.toLowerCase().includes(q) ||
            item.formula.toLowerCase().includes(q)
        );
    }
    
    if (items.length === 0) {
        listEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary)">No results found</div>';
        return;
    }
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'reactant-item';
        div.innerHTML = `
            <span class="reactant-item-name">${item.name}</span>
            <span class="reactant-item-formula">${item.formula}</span>
        `;
        div.onclick = () => {
            addPostReactant(item.formula);
            closeInlineSelector();
        };
        listEl.appendChild(div);
    });
}

/**
 * Close inline selector
 */
function closeInlineSelector() {
    const selector = document.getElementById('inline-selector');
    if (selector) selector.remove();
}

/**
 * Add reactant to post equation
 */
function addPostReactant(formula) {
    if (!postReactants.includes(formula)) {
        postReactants.push(formula);
    }
    renderPostEquationBuilder();
}

/**
 * Remove reactant from post equation
 */
function removePostReactant(formula) {
    postReactants = postReactants.filter(r => r !== formula);
    renderPostEquationBuilder();
}

/**
 * Perform reaction and save
 */
function performPostReaction(reaction) {
    postReaction = reaction;
    currentReactionData = reaction;
    
    closeReactionBuilderModal();
    showReactionPreview();
    
    showNotification('Reaction added! It will animate in your post.', 'success');
}

/**
 * Show reaction preview in editor
 */
function showReactionPreview() {
    const editor = document.getElementById('post-content');
    if (!editor || !currentReactionData) return;
    
    const oldPreview = editor.querySelector('.embedded-reaction-preview');
    if (oldPreview) oldPreview.remove();
    
    const preview = document.createElement('div');
    preview.className = 'embedded-reaction-preview';
    preview.innerHTML = `
        <div class="preview-header">
            <i class="fas fa-flask"></i> Chemical Reaction
            <button onclick="removeReactionEmbed()" class="remove-embed-btn" type="button">×</button>
        </div>
        <div class="preview-equation">${formatReactionEquation(currentReactionData)}</div>
        <small style="color: var(--text-secondary);">Will animate when posted</small>
    `;
    
    editor.appendChild(preview);
}

/**
 * Remove reaction embed
 */
function removeReactionEmbed() {
    currentReactionData = null;
    postReaction = null;
    const preview = document.querySelector('.embedded-reaction-preview');
    if (preview) preview.remove();
}

/**
 * FIXED: Open Molecule Picker Modal with search
 */
function openMoleculePickerModal() {
    const modal = document.getElementById('post-molecule-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    renderMoleculePicker();
}

/**
 * Close Molecule Picker Modal
 */
function closeMoleculePickerModal() {
    const modal = document.getElementById('post-molecule-modal');
    if (!modal) return;
    modal.classList.remove('active');
}

/**
 * FIXED: Render molecule picker with search
 */
function renderMoleculePicker() {
    const list = document.getElementById('molecule-picker-list');
    if (!list) return;
    
    // Add search bar
    const searchHTML = `
        <input type="text" 
               id="molecule-picker-search" 
               placeholder="Search molecules..." 
               class="form-control mb-3"
               style="width: 100%; padding: 10px 15px; background: var(--bg-tertiary); border: 1px solid var(--border-primary); border-radius: 8px; color: var(--text-primary);" />
    `;
    
    list.innerHTML = searchHTML + '<div id="molecule-picker-items"></div>';
    
    const searchInput = document.getElementById('molecule-picker-search');
    const itemsContainer = document.getElementById('molecule-picker-items');
    
    function renderMolecules(query = '') {
        itemsContainer.innerHTML = '';
        
        let filteredMolecules = moleculesData;
        
        if (query) {
            const q = query.toLowerCase();
            filteredMolecules = moleculesData.filter(m => 
                m.name.toLowerCase().includes(q) ||
                m.formula.toLowerCase().includes(q)
            );
        }
        
        if (filteredMolecules.length === 0) {
            itemsContainer.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary)">No molecules found</div>';
            return;
        }
        
        filteredMolecules.forEach(molecule => {
            const item = document.createElement('div');
            item.className = 'molecule-picker-item';
            item.innerHTML = `
                <div class="molecule-badge">${molecule.formula}</div>
                <div class="molecule-name">${molecule.name}</div>
            `;
            
            item.addEventListener('click', () => selectMolecule(molecule));
            itemsContainer.appendChild(item);
        });
    }
    
    renderMolecules();
    
    if (searchInput) {
        searchInput.focus();
        searchInput.addEventListener('input', (e) => {
            renderMolecules(e.target.value);
        });
    }
}

/**
 * Select molecule
 */
function selectMolecule(molecule) {
    currentMoleculeData = {
        id: molecule.id,
        name: molecule.name,
        formula: molecule.formula
    };
    
    closeMoleculePickerModal();
    showMoleculePreview();
}

/**
 * Show molecule preview in editor
 */
function showMoleculePreview() {
    const editor = document.getElementById('post-content');
    if (!editor || !currentMoleculeData) return;
    
    const oldPreview = editor.querySelector('.embedded-molecule-preview');
    if (oldPreview) oldPreview.remove();
    
    const preview = document.createElement('div');
    preview.className = 'embedded-molecule-preview';
    preview.innerHTML = `
        <div class="preview-header">
            <i class="fas fa-atom"></i> 3D Molecule
            <button onclick="removeMoleculeEmbed()" class="remove-embed-btn" type="button">×</button>
        </div>
        <div class="preview-content">
            <strong>${currentMoleculeData.name}</strong>
            <span>${currentMoleculeData.formula}</span>
        </div>
        <small style="color: var(--text-secondary);">Will show 3D model when posted</small>
    `;
    
    editor.appendChild(preview);
}

/**
 * Remove molecule embed
 */
function removeMoleculeEmbed() {
    currentMoleculeData = null;
    const preview = document.querySelector('.embedded-molecule-preview');
    if (preview) preview.remove();
}

/**
 * Submit post to Firebase
 */
async function submitForumPost() {
    if (!currentForumUser) {
        alert('Please sign in first!');
        return;
    }
    
    const title = document.getElementById('post-title').value.trim();
    const description = document.getElementById('post-description').value.trim();
    const topic = document.getElementById('post-topic').value;
    const content = document.getElementById('post-content').innerHTML;
    
    if (!title || !description) {
        alert('Please fill in title and description!');
        return;
    }
    
    const postData = {
        authorId: currentForumUser.uid,
        authorName: currentForumUser.displayName || 'Anonymous',
        authorPhoto: currentForumUser.photoURL || '',
        title: title,
        description: description,
        content: content,
        topic: topic,
        timestamp: Date.now(),
        likes: {},
        comments: {}
    };
    
    if (currentReactionData) {
        postData.reactionData = currentReactionData;
    }
    
    if (currentMoleculeData) {
        postData.moleculeData = currentMoleculeData;
    }
    
    const submitBtn = document.getElementById('submit-post-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    
    try {
        await db.ref('forum/posts').push(postData);
        
        closeCreatePostModal();
        showNotification('Post created successfully! 🎉', 'success');
        
        const toggleBtn = document.getElementById('toggleCommunity');
        if (toggleBtn) toggleBtn.click();
        
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
    }
}

/**
 * Format reaction equation
 */
function formatReactionEquation(reactionData) {
    let equation = '';
    
    reactionData.reactants.forEach((reactant, i) => {
        if (i > 0) equation += ' + ';
        const coeff = reactionData.coefficients[i];
        equation += `${coeff > 1 ? coeff : ''}${reactant}`;
    });
    
    equation += ' → ';
    
    reactionData.products.forEach((product, i) => {
        if (i > 0) equation += ' + ';
        const coeff = reactionData.productCoefficients[i];
        equation += `${coeff > 1 ? coeff : ''}${product}`;
    });
    
    return equation;
}

// Global functions
window.openCreatePostModal = openCreatePostModal;
window.closeCreatePostModal = closeCreatePostModal;
window.closeChemistryToolModal = closeChemistryToolModal;
window.selectChemistryTool = selectChemistryTool;
window.closeReactionBuilderModal = closeReactionBuilderModal;
window.removeReactionEmbed = removeReactionEmbed;
window.closeMoleculePickerModal = closeMoleculePickerModal;
window.removeMoleculeEmbed = removeMoleculeEmbed;
window.submitForumPost = submitForumPost;
window.openPostReactantSelector = openPostReactantSelector;
window.addPostReactant = addPostReactant;
window.removePostReactant = removePostReactant;
window.closeInlineSelector = closeInlineSelector;

console.log('✅ Forum create post module loaded (FIXED)');
