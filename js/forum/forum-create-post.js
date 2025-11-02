/**
 * Forum Post Creation Module - PERFECT UX FIX
 * FIXED: + button closes reaction modal, opens selector modal, then returns back
 */

let currentReactionData = null;
let currentMoleculeData = null;
let postReactants = [];
let postReaction = null;
let isReturningToReactionBuilder = false; // Track if we should return

function openCreatePostModal() {
    const modal = document.getElementById('create-post-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
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

function closeCreatePostModal() {
    const modal = document.getElementById('create-post-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function initRichTextEditor() {
    const editor = document.getElementById('post-content');
    if (!editor) return;
    editor.contentEditable = true;
    setupEditorToolbar();
}

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

function openChemistryToolModal() {
    const modal = document.getElementById('chemistry-tool-modal');
    if (!modal) return;
    modal.classList.add('active');
}

function closeChemistryToolModal() {
    const modal = document.getElementById('chemistry-tool-modal');
    if (!modal) return;
    modal.classList.remove('active');
}

function selectChemistryTool(type) {
    closeChemistryToolModal();
    
    if (type === 'reaction') {
        openReactionBuilderModal();
    } else if (type === 'molecule') {
        openMoleculePickerModal();
    }
}

function openReactionBuilderModal() {
    const modal = document.getElementById('post-reaction-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    postReactants = [];
    postReaction = null;
    isReturningToReactionBuilder = false;
    
    renderPostEquationBuilder();
}

function closeReactionBuilderModal() {
    const modal = document.getElementById('post-reaction-modal');
    if (!modal) return;
    modal.classList.remove('active');
}

/**
 * Render equation builder
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
            <button class="add-reactant-btn" onclick="openPostReactantSelectorModal()">+</button>
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
                    <button class="remove-btn" onclick="removePostReactant('${reactant}')">&times;</button>
                `;
                equationDisplay.appendChild(chip);
            });
            
            const addBtn = document.createElement('button');
            addBtn.className = 'add-reactant-btn';
            addBtn.textContent = '+';
            addBtn.onclick = openPostReactantSelectorModal;
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
                    <button class="remove-btn" onclick="removePostReactant('${reactant}')">&times;</button>
                `;
                equationDisplay.appendChild(chip);
            });
            
            const addBtn = document.createElement('button');
            addBtn.className = 'add-reactant-btn';
            addBtn.textContent = '+';
            addBtn.onclick = openPostReactantSelectorModal;
            equationDisplay.appendChild(addBtn);
            
            if (reactBtn) {
                reactBtn.disabled = true;
                reactBtn.textContent = 'No Reaction Found ❌';
            }
        }
    }
}

/**
 * PERFECT FIX: Modal switch - close reaction builder, open selector
 */
function openPostReactantSelectorModal() {
    console.log('Opening reactant selector - switching modals...');
    
    // Mark that we should return to reaction builder
    isReturningToReactionBuilder = true;
    
    // STEP 1: Close reaction builder modal
    const reactionModal = document.getElementById('post-reaction-modal');
    if (reactionModal) {
        reactionModal.classList.remove('active');
    }
    
    // STEP 2: Open reactant selector modal after small delay
    setTimeout(() => {
        const selectorModal = document.getElementById('reactantModal');
        if (!selectorModal) {
            console.error('Reactant modal not found!');
            return;
        }
        
        selectorModal.classList.add('active');
        
        // Clear and focus search
        const searchInput = document.getElementById('reactantSearch');
        if (searchInput) {
            searchInput.value = '';
            setTimeout(() => searchInput.focus(), 100);
        }
        
        // Render list
        renderPostReactantList('');
    }, 150); // Small delay for smooth transition
}

/**
 * Render reactant list with search in modal
 */
function renderPostReactantList(query = '') {
    const listEl = document.getElementById('reactantList');
    if (!listEl) {
        console.error('Reactant list element not found!');
        return;
    }
    
    listEl.innerHTML = '';
    
    // Combine atoms and molecules
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
    
    // Sort by name
    items.sort((a, b) => a.name.localeCompare(b.name));
    
    // Limit to first 50 for performance
    items.slice(0, 50).forEach(item => {
        const div = document.createElement('div');
        div.className = 'reactant-item';
        div.innerHTML = `
            <span class="reactant-item-name">${item.name}</span>
            <span class="reactant-item-formula">${item.formula}</span>
        `;
        
        div.onclick = () => {
            addPostReactant(item.formula);
            closePostReactantSelectorModalAndReturn(); // FIXED: Return to builder
        };
        
        listEl.appendChild(div);
    });
    
    if (items.length === 0) {
        listEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">No results found</div>';
    }
}

/**
 * PERFECT FIX: Close selector and return to reaction builder
 */
function closePostReactantSelectorModalAndReturn() {
    const selectorModal = document.getElementById('reactantModal');
    if (selectorModal) {
        selectorModal.classList.remove('active');
    }
    
    // If we should return to reaction builder, open it
    if (isReturningToReactionBuilder) {
        setTimeout(() => {
            const reactionModal = document.getElementById('post-reaction-modal');
            if (reactionModal) {
                reactionModal.classList.add('active');
                renderPostEquationBuilder(); // Refresh with new reactant
            }
            isReturningToReactionBuilder = false;
        }, 150);
    }
}

/**
 * Close selector without returning (for X button)
 */
function closePostReactantSelectorModal() {
    isReturningToReactionBuilder = false; // Don't return
    const selectorModal = document.getElementById('reactantModal');
    if (selectorModal) {
        selectorModal.classList.remove('active');
    }
}

function addPostReactant(formula) {
    if (!postReactants.includes(formula)) {
        postReactants.push(formula);
    }
}

function removePostReactant(formula) {
    postReactants = postReactants.filter(r => r !== formula);
    renderPostEquationBuilder();
}

function performPostReaction(reaction) {
    postReaction = reaction;
    currentReactionData = reaction;
    
    closeReactionBuilderModal();
    showReactionPreview();
    
    if (typeof showNotification === 'function') {
        showNotification('Reaction added! It will animate in your post.', 'success');
    }
}

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
            <button onclick="removeReactionEmbed()" class="remove-embed-btn">×</button>
        </div>
        <div class="preview-equation">${formatReactionEquation(currentReactionData)}</div>
        <small style="color: var(--text-secondary);">Will animate when posted</small>
    `;
    
    editor.appendChild(preview);
}

function removeReactionEmbed() {
    currentReactionData = null;
    postReaction = null;
    const preview = document.querySelector('.embedded-reaction-preview');
    if (preview) preview.remove();
}

function openMoleculePickerModal() {
    const modal = document.getElementById('post-molecule-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    renderMoleculePicker();
}

function closeMoleculePickerModal() {
    const modal = document.getElementById('post-molecule-modal');
    if (!modal) return;
    modal.classList.remove('active');
}

function renderMoleculePicker() {
    const list = document.getElementById('molecule-picker-list');
    if (!list) return;
    
    const searchHTML = `
        <div style="margin-bottom:15px;position:sticky;top:0;background:var(--bg-secondary);padding:10px 0;z-index:10;">
            <input type="text" id="molecule-picker-search" placeholder="🔍 Search molecules..." 
                style="width:100%;padding:12px;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:8px;color:var(--text-primary);" />
        </div>
    `;
    
    list.innerHTML = searchHTML + '<div id="molecule-picker-items" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;"></div>';
    
    const itemsContainer = document.getElementById('molecule-picker-items');
    
    renderMoleculePickerItems(moleculesData, itemsContainer);
    
    const searchInput = document.getElementById('molecule-picker-search');
    let searchTimeout;
    
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.toLowerCase();
            const filtered = query ? 
                moleculesData.filter(m => 
                    m.name.toLowerCase().includes(query) || 
                    m.formula.toLowerCase().includes(query)
                ) : moleculesData;
            
            renderMoleculePickerItems(filtered, itemsContainer);
        }, 200);
    });
}

function renderMoleculePickerItems(molecules, container) {
    container.innerHTML = '';
    
    molecules.slice(0, 50).forEach(molecule => {
        const item = document.createElement('div');
        item.className = 'molecule-picker-item';
        item.style.cssText = 'padding:15px;background:var(--bg-tertiary);border:2px solid var(--border-primary);border-radius:10px;text-align:center;cursor:pointer;transition:all 0.3s ease;';
        item.innerHTML = `
            <div style="background:linear-gradient(135deg,var(--accent-green),var(--accent-blue));color:white;padding:8px;border-radius:8px;font-weight:700;margin-bottom:8px;">${molecule.formula}</div>
            <div style="font-size:0.85rem;color:var(--text-secondary);font-weight:600;">${molecule.name}</div>
        `;
        
        item.addEventListener('click', () => selectMolecule(molecule));
        
        item.addEventListener('mouseenter', () => {
            item.style.borderColor = 'var(--accent-blue)';
            item.style.transform = 'translateY(-4px)';
            item.style.boxShadow = '0 6px 16px rgba(88, 166, 255, 0.2)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.borderColor = 'var(--border-primary)';
            item.style.transform = 'translateY(0)';
            item.style.boxShadow = 'none';
        });
        
        container.appendChild(item);
    });
    
    if (molecules.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--text-secondary);">No molecules found</div>';
    }
}

function selectMolecule(molecule) {
    currentMoleculeData = {
        id: molecule.id,
        name: molecule.name,
        formula: molecule.formula
    };
    
    closeMoleculePickerModal();
    showMoleculePreview();
}

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
            <button onclick="removeMoleculeEmbed()" class="remove-embed-btn">×</button>
        </div>
        <div class="preview-content">
            <strong>${currentMoleculeData.name}</strong>
            <span>${currentMoleculeData.formula}</span>
        </div>
        <small style="color: var(--text-secondary);">Will show 3D model when posted</small>
    `;
    
    editor.appendChild(preview);
}

function removeMoleculeEmbed() {
    currentMoleculeData = null;
    const preview = document.querySelector('.embedded-molecule-preview');
    if (preview) preview.remove();
}

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
        if (typeof showNotification === 'function') {
            showNotification('Post created successfully! 🎉', 'success');
        }
        
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

// Setup search handler for reactant modal
document.addEventListener('DOMContentLoaded', () => {
    const reactantSearch = document.getElementById('reactantSearch');
    if (reactantSearch) {
        let searchTimeout;
        reactantSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                renderPostReactantList(e.target.value);
            }, 200);
        });
    }
    
    // Close modal handlers
    const closeReactantBtn = document.getElementById('closeReactantModal');
    if (closeReactantBtn) {
        closeReactantBtn.addEventListener('click', () => {
            isReturningToReactionBuilder = false; // Don't return when clicking X
            closePostReactantSelectorModal();
        });
    }
    
    const reactantModal = document.getElementById('reactantModal');
    if (reactantModal) {
        reactantModal.addEventListener('click', (e) => {
            if (e.target.id === 'reactantModal') {
                isReturningToReactionBuilder = false; // Don't return on outside click
                closePostReactantSelectorModal();
            }
        });
    }
});

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
window.openPostReactantSelectorModal = openPostReactantSelectorModal;
window.closePostReactantSelectorModal = closePostReactantSelectorModal;
window.closePostReactantSelectorModalAndReturn = closePostReactantSelectorModalAndReturn;
window.addPostReactant = addPostReactant;
window.removePostReactant = removePostReactant;

console.log('✅ Forum create post module loaded (PERFECT MODAL SWITCH)');
