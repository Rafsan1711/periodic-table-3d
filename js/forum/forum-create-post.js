/**
 * Forum Post Creation Module
 * Handles post creation with rich text editor and special embeds
 */

let currentReactionData = null;
let currentMoleculeData = null;

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
    
    // Initialize rich text editor
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
    
    // Make contenteditable
    editor.contentEditable = true;
    editor.style.minHeight = '150px';
    
    // Setup toolbar
    setupEditorToolbar();
}

/**
 * Setup editor toolbar
 */
function setupEditorToolbar() {
    // Bold
    document.getElementById('btn-bold')?.addEventListener('click', () => {
        document.execCommand('bold', false, null);
    });
    
    // Italic
    document.getElementById('btn-italic')?.addEventListener('click', () => {
        document.execCommand('italic', false, null);
    });
    
    // Underline
    document.getElementById('btn-underline')?.addEventListener('click', () => {
        document.execCommand('underline', false, null);
    });
    
    // Strikethrough
    document.getElementById('btn-strike')?.addEventListener('click', () => {
        document.execCommand('strikeThrough', false, null);
    });
    
    // Heading
    document.getElementById('btn-heading')?.addEventListener('click', () => {
        document.execCommand('formatBlock', false, '<h3>');
    });
    
    // Bullet list
    document.getElementById('btn-ul')?.addEventListener('click', () => {
        document.execCommand('insertUnorderedList', false, null);
    });
    
    // Numbered list
    document.getElementById('btn-ol')?.addEventListener('click', () => {
        document.execCommand('insertOrderedList', false, null);
    });
    
    // Code block
    document.getElementById('btn-code')?.addEventListener('click', () => {
        const selection = window.getSelection().toString();
        if (selection) {
            document.execCommand('insertHTML', false, `<code>${selection}</code>`);
        }
    });
    
    // Link
    document.getElementById('btn-link')?.addEventListener('click', () => {
        const url = prompt('Enter URL:');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    });
    
    // Special Chemistry Tool
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
 * Select chemistry tool type (Reaction or Molecule)
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
 * Open Reaction Builder Modal (Reuse from reactions page)
 */
function openReactionBuilderModal() {
    const modal = document.getElementById('post-reaction-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    
    // Initialize reaction builder (same as reactions page)
    initPostReactionBuilder();
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
 * Initialize Post Reaction Builder
 */
function initPostReactionBuilder() {
    // Same logic as reactions-builder.js
    const container = document.getElementById('post-reaction-builder');
    if (!container) return;
    
    container.innerHTML = `
        <div class="equation-display" id="post-equation-display">
            <button class="add-reactant-btn" onclick="openPostReactantSelector()">+</button>
        </div>
        <button id="post-react-btn" class="react-btn" disabled>React! →</button>
    `;
}

/**
 * Submit reaction to post
 */
function submitReactionToPost() {
    // Get reaction data from post-reaction-builder
    const reaction = getCurrentReaction();
    if (!reaction) {
        alert('Please create a valid reaction first!');
        return;
    }
    
    currentReactionData = reaction;
    closeReactionBuilderModal();
    
    // Show preview in editor
    showReactionPreview();
}

/**
 * Show reaction preview in editor
 */
function showReactionPreview() {
    const editor = document.getElementById('post-content');
    if (!editor || !currentReactionData) return;
    
    const preview = document.createElement('div');
    preview.className = 'embedded-reaction-preview';
    preview.innerHTML = `
        <div class="preview-header">
            <i class="fas fa-flask"></i> Reaction Preview
            <button onclick="removeReactionEmbed()" class="remove-embed-btn">×</button>
        </div>
        <div class="preview-equation">${formatReactionEquation(currentReactionData)}</div>
    `;
    
    editor.appendChild(preview);
}

/**
 * Remove reaction embed
 */
function removeReactionEmbed() {
    currentReactionData = null;
    const preview = document.querySelector('.embedded-reaction-preview');
    if (preview) preview.remove();
}

/**
 * Open Molecule Picker Modal
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
 * Render molecule picker list
 */
function renderMoleculePicker() {
    const list = document.getElementById('molecule-picker-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    moleculesData.forEach(molecule => {
        const item = document.createElement('div');
        item.className = 'molecule-picker-item';
        item.innerHTML = `
            <div class="molecule-badge">${molecule.formula}</div>
            <div class="molecule-name">${molecule.name}</div>
        `;
        
        item.addEventListener('click', () => selectMolecule(molecule));
        list.appendChild(item);
    });
}

/**
 * Select molecule
 */
function selectMolecule(molecule) {
    currentMoleculeData = molecule;
    closeMoleculePickerModal();
    showMoleculePreview();
}

/**
 * Show molecule preview in editor
 */
function showMoleculePreview() {
    const editor = document.getElementById('post-content');
    if (!editor || !currentMoleculeData) return;
    
    const preview = document.createElement('div');
    preview.className = 'embedded-molecule-preview';
    preview.innerHTML = `
        <div class="preview-header">
            <i class="fas fa-atom"></i> Molecule Preview
            <button onclick="removeMoleculeEmbed()" class="remove-embed-btn">×</button>
        </div>
        <div class="preview-content">
            <strong>${currentMoleculeData.name}</strong>
            <span>${currentMoleculeData.formula}</span>
        </div>
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
    
    // Create post data
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
    
    // Add reaction data if exists
    if (currentReactionData) {
        postData.reactionData = currentReactionData;
    }
    
    // Add molecule data if exists
    if (currentMoleculeData) {
        postData.moleculeData = {
            id: currentMoleculeData.id,
            name: currentMoleculeData.name,
            formula: currentMoleculeData.formula
        };
    }
    
    // Show loading
    const submitBtn = document.getElementById('submit-post-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    
    try {
        await db.ref('forum/posts').push(postData);
        
        // Success
        closeCreatePostModal();
        
        // Show success message
        showNotification('Post created successfully! 🎉', 'success');
        
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
    }
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `notification-toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Global functions
window.openCreatePostModal = openCreatePostModal;
window.closeCreatePostModal = closeCreatePostModal;
window.closeChemistryToolModal = closeChemistryToolModal;
window.selectChemistryTool = selectChemistryTool;
window.closeReactionBuilderModal = closeReactionBuilderModal;
window.submitReactionToPost = submitReactionToPost;
window.removeReactionEmbed = removeReactionEmbed;
window.closeMoleculePickerModal = closeMoleculePickerModal;
window.removeMoleculeEmbed = removeMoleculeEmbed;
window.submitForumPost = submitForumPost;

console.log('✅ Forum create post module loaded');
