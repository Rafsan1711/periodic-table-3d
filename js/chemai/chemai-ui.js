/**
 * ============================================
 * CHEMAI UI MODULE - ENHANCED
 * ✅ Professional formatting
 * ✅ Context-appropriate emojis
 * ✅ Wikipedia integration
 * ✅ 3D atom/molecule models
 * ============================================
 */

// DOM Elements
let chemaiInput, sendBtn, messagesContainer, emptyState;
let chemaiSidebar, chemaiMenuBtn, closeSidebarBtn;
let chatHistoryList, newChatBtn, settingsBtn;
let modelSelector, modelBtns;
let settingsModal, closeSettingsBtn, saveSettingsBtn;
let defaultModelSelect;
let currentChatId = null;
let currentMessages = [];
let userSettings = { defaultModel: null, theme: 'dark' };
let isSending = false;

/**
 * Initialize UI
 */
function initChemAIUI() {
    console.log('🎨 Initializing ChemAI UI (Enhanced)...');

    // Get DOM elements
    chemaiInput = document.getElementById('chemaiInput');
    sendBtn = document.getElementById('sendBtn');
    messagesContainer = document.getElementById('messagesContainer');
    emptyState = document.getElementById('emptyState');
    chemaiSidebar = document.getElementById('chemaiSidebar');
    chemaiMenuBtn = document.getElementById('chemaiMenuBtn');
    closeSidebarBtn = document.getElementById('closeSidebarBtn');
    chatHistoryList = document.getElementById('chatHistoryList');
    newChatBtn = document.getElementById('newChatBtn');
    settingsBtn = document.getElementById('settingsBtn');
    modelSelector = document.getElementById('modelSelector');
    modelBtns = document.querySelectorAll('.model-btn');
    settingsModal = document.getElementById('chemaiSettingsModal');
    closeSettingsBtn = document.getElementById('closeSettingsBtn');
    saveSettingsBtn = document.getElementById('saveSettingsBtn');
    defaultModelSelect = document.getElementById('defaultModelSelect');

    setupEventListeners();
    loadUserSettings();
    loadChatHistory();

    console.log('✅ ChemAI UI initialized (Enhanced)');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    chemaiInput.addEventListener('input', handleInputChange);
    chemaiInput.addEventListener('keydown', handleInputKeydown);
    sendBtn.addEventListener('click', handleSendMessage);

    chemaiMenuBtn?.addEventListener('click', toggleSidebar);
    closeSidebarBtn?.addEventListener('click', toggleSidebar);
    newChatBtn?.addEventListener('click', createNewChat);
    settingsBtn?.addEventListener('click', openSettings);

    modelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const model = btn.dataset.model;
            selectModel(model);
        });
    });

    closeSettingsBtn?.addEventListener('click', closeSettings);
    saveSettingsBtn?.addEventListener('click', saveUserSettings);

    document.querySelectorAll('.example-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.dataset.question;
            chemaiInput.value = question;
            handleInputChange();
            handleSendMessage();
        });
    });

    const backBtn = document.getElementById('chemaiBackBtn');
    backBtn?.addEventListener('click', () => {
        const toggleBtn = document.getElementById('togglePeriodic');
        if (toggleBtn) toggleBtn.click();
    });
}

/**
 * Handle input change
 */
function handleInputChange() {
    const value = chemaiInput.value.trim();
    sendBtn.disabled = value.length === 0;

    chemaiInput.style.height = 'auto';
    chemaiInput.style.height = Math.min(chemaiInput.scrollHeight, 150) + 'px';
}

/**
 * Handle input keydown
 */
function handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
            handleSendMessage();
        }
    }
}

/**
 * ✅ Handle send message - ENHANCED
 */
async function handleSendMessage() {
    const message = chemaiInput.value.trim();
    if (!message || isSending) return;
    
    isSending = true;
    chemaiInput.disabled = true;
    sendBtn.disabled = true;

    try {
        if (emptyState && emptyState.style.display !== 'none') {
            emptyState.style.display = 'none';
            if (messagesContainer) {
                messagesContainer.style.display = 'flex';
            }
        }

        // Add user message
        addMessage(message, 'user');

        // Clear input
        chemaiInput.value = '';
        handleInputChange();

        // Show typing indicator
        const typingId = addTypingIndicator();

        // Get current model
        const model = window.ChemAIModels ? window.ChemAIModels.currentModel : 'vicuna';

        if (!window.ChemAIAPI) {
            console.error('❌ ChemAIAPI not loaded');
            removeTypingIndicator(typingId);
            addMessage('Error: API module not loaded. Please refresh.', 'ai', model, true);
            return;
        }

        // Send to API
        const response = await window.ChemAIAPI.sendMessage(
            message,
            window.ChemAIAPI.formatChatHistory(currentMessages),
            model
        );

        removeTypingIndicator(typingId);

        // ✅ Add AI response (ENHANCED)
        if (response.success) {
            // Show fallback warning if applicable
            if (response.fallback && response.fallbackMessage) {
                addMessage(response.fallbackMessage, 'ai', 'system', false);
            }
            
            // Add main response with enhancements
            await addEnhancedMessage(response.message, message, response.model);
        } else {
            addMessage(response.message, 'ai', model, true);
        }

        // Save chat
        await saveChatToFirebase();

    } catch (error) {
        console.error('❌ Error in handleSendMessage:', error);
        removeTypingIndicator('typing-indicator');
        addMessage('An error occurred. Please try again.', 'ai', 'vicuna', true);
    } finally {
        isSending = false;
        chemaiInput.disabled = false;
        sendBtn.disabled = false;
        chemaiInput.focus();
    }
}

/**
 * ✅ Add enhanced message (WITH WIKIPEDIA + 3D MODELS)
 */
async function addEnhancedMessage(aiResponse, userQuestion, model) {
    // Detect chemistry entities (atoms, molecules)
    const entities = detectChemistryEntities(userQuestion + ' ' + aiResponse);
    
    // Format AI response with emojis
    const formattedResponse = formatWithEmojis(aiResponse);
    
    // Create message container
    const messageData = {
        content: formattedResponse,
        role: 'ai',
        model: model,
        timestamp: Date.now()
    };
    currentMessages.push(messageData);

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message enhanced-message';
    
    let messageHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble">
                ${formatMessageContent(formattedResponse)}
            </div>
    `;

    // ✅ Add Wikipedia info if entity found
    if (entities.length > 0) {
        for (const entity of entities.slice(0, 2)) { // Max 2 entities
            const wikiInfo = await fetchWikipediaSnippet(entity.name);
            if (wikiInfo) {
                messageHTML += `
                    <div class="wiki-snippet">
                        <div class="wiki-header">
                            <i class="fab fa-wikipedia-w"></i>
                            <span>${entity.name}</span>
                        </div>
                        <div class="wiki-text">${wikiInfo}</div>
                        <div class="wiki-source">Source: Wikipedia</div>
                    </div>
                `;
            }
        }
    }

    // ✅ Add 3D models if applicable
    if (entities.length > 0) {
        messageHTML += `<div class="models-container">`;
        
        for (const entity of entities.slice(0, 2)) {
            if (entity.type === 'atom') {
                messageHTML += create3DAtomPreview(entity.data);
            } else if (entity.type === 'molecule') {
                messageHTML += create3DMoleculePreview(entity.data);
            }
        }
        
        messageHTML += `</div>`;
    }

    messageHTML += `
            <div class="message-time">
                ${formatTime(messageData.timestamp)}
                • ${window.ChemAIModels.getModelDisplayName(model)}
            </div>
        </div>
    `;

    messageDiv.innerHTML = messageHTML;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();

    // Animate 3D models
    animateModels(messageDiv);
}

/**
 * ✅ Detect chemistry entities (atoms, molecules)
 */
function detectChemistryEntities(text) {
    const entities = [];
    
    // Check for elements
    if (typeof elementsData !== 'undefined') {
        elementsData.forEach(element => {
            const regex = new RegExp(`\\b${element.name}\\b`, 'gi');
            if (regex.test(text)) {
                entities.push({
                    type: 'atom',
                    name: element.name,
                    data: element
                });
            }
        });
    }
    
    // Check for molecules
    if (typeof moleculesData !== 'undefined') {
        moleculesData.forEach(molecule => {
            const regex = new RegExp(`\\b${molecule.name}\\b`, 'gi');
            if (regex.test(text)) {
                entities.push({
                    type: 'molecule',
                    name: molecule.name,
                    data: molecule
                });
            }
        });
    }
    
    return entities;
}

/**
 * ✅ Format text with context-appropriate emojis
 */
function formatWithEmojis(text) {
    // Context-based emoji mapping
    const emojiMap = {
        'water': '💧',
        'oxygen': '🫁',
        'hydrogen': '💨',
        'carbon': '⚫',
        'nitrogen': '🌫️',
        'fire': '🔥',
        'explosion': '💥',
        'reaction': '⚗️',
        'molecule': '🧬',
        'atom': '⚛️',
        'bond': '🔗',
        'structure': '🏗️',
        'electron': '⚡',
        'proton': '➕',
        'neutron': '⚪',
        'energy': '⚡',
        'gas': '💨',
        'liquid': '💧',
        'solid': '🧊',
        'temperature': '🌡️',
        'pressure': '🔘',
        'important': '⚠️',
        'note': '📝',
        'example': '💡',
        'tip': '💡',
        'warning': '⚠️'
    };

    let formatted = text;
    
    // Add emojis based on context
    Object.keys(emojiMap).forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, `${keyword} ${emojiMap[keyword]}`);
    });

    return formatted;
}

/**
 * ✅ Fetch Wikipedia snippet
 */
async function fetchWikipediaSnippet(title) {
    try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.extract ? data.extract.substring(0, 200) + '...' : null;
    } catch (error) {
        console.warn('Failed to fetch Wikipedia:', error);
        return null;
    }
}

/**
 * ✅ Create 3D atom preview
 */
function create3DAtomPreview(element) {
    const uniqueId = 'atom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    return `
        <div class="model-preview atom-preview">
            <div class="model-header">
                <i class="fas fa-atom"></i>
                <span>${element.name} (${element.symbol})</span>
            </div>
            <div class="model-canvas" id="${uniqueId}" data-element='${JSON.stringify(element)}'></div>
            <div class="model-info">
                <span>Atomic #: ${element.number}</span>
                <span>Weight: ${element.weight} u</span>
            </div>
        </div>
    `;
}

/**
 * ✅ Create 3D molecule preview
 */
function create3DMoleculePreview(molecule) {
    const uniqueId = 'mol-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    return `
        <div class="model-preview molecule-preview">
            <div class="model-header">
                <i class="fas fa-flask"></i>
                <span>${molecule.name}</span>
            </div>
            <div class="model-canvas" id="${uniqueId}" data-molecule='${JSON.stringify(molecule)}'></div>
            <div class="model-info">
                <span>Formula: ${molecule.formula}</span>
                <span>Atoms: ${molecule.atoms.length}</span>
            </div>
        </div>
    `;
}

/**
 * ✅ Animate 3D models in message
 */
function animateModels(messageDiv) {
    const modelCanvases = messageDiv.querySelectorAll('.model-canvas');
    
    modelCanvases.forEach(canvas => {
        const elementData = canvas.getAttribute('data-element');
        const moleculeData = canvas.getAttribute('data-molecule');
        
        if (elementData) {
            const element = JSON.parse(elementData);
            renderMini3DAtom(canvas, element);
        } else if (moleculeData) {
            const molecule = JSON.parse(moleculeData);
            renderMini3DMolecule(canvas, molecule);
        }
    });
}

/**
 * ✅ Render mini 3D atom
 */
function renderMini3DAtom(container, element) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(200, 200);
    container.appendChild(renderer.domElement);

    // Nucleus
    const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 24, 24),
        new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0x330000 })
    );
    scene.add(nucleus);

    // Electron shells
    const shells = calculateElectronShells(element.number);
    const shellColors = [0x00ff00, 0x0099ff, 0xffff00];
    
    shells.forEach((count, shellIndex) => {
        const radius = (shellIndex + 1) * 1.5;
        
        for (let i = 0; i < count; i++) {
            const electron = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 16, 16),
                new THREE.MeshPhongMaterial({ 
                    color: shellColors[shellIndex % 3],
                    emissive: shellColors[shellIndex % 3]
                })
            );
            
            const angle = (i / count) * Math.PI * 2;
            electron.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );
            
            scene.add(electron);
        }
    });

    // Lights
    scene.add(new THREE.AmbientLight(0x404040, 0.8));
    scene.add(new THREE.DirectionalLight(0xffffff, 1));

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        nucleus.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

/**
 * ✅ Render mini 3D molecule
 */
function renderMini3DMolecule(container, molecule) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(200, 200);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    
    // Center calculation
    let centerX = 0, centerY = 0, centerZ = 0;
    molecule.atoms.forEach(a => {
        centerX += (a.x || 0);
        centerY += (a.y || 0);
        centerZ += (a.z || 0);
    });
    centerX /= molecule.atoms.length;
    centerY /= molecule.atoms.length;
    centerZ /= molecule.atoms.length;

    // Add atoms
    molecule.atoms.forEach(atom => {
        const color = getAtomColor(atom.el);
        const radius = 0.3;
        
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 16, 16),
            new THREE.MeshPhongMaterial({ color: color, shininess: 80 })
        );
        
        sphere.position.set(
            ((atom.x || 0) - centerX) * 1.5,
            ((atom.y || 0) - centerY) * 1.5,
            ((atom.z || 0) - centerZ) * 1.5
        );
        
        group.add(sphere);
    });

    // Add bonds
    molecule.bonds.forEach(bond => {
        const a1 = molecule.atoms[bond[0]];
        const a2 = molecule.atoms[bond[1]];
        if (!a1 || !a2) return;
        
        const start = new THREE.Vector3(
            ((a1.x || 0) - centerX) * 1.5,
            ((a1.y || 0) - centerY) * 1.5,
            ((a1.z || 0) - centerZ) * 1.5
        );
        const end = new THREE.Vector3(
            ((a2.x || 0) - centerX) * 1.5,
            ((a2.y || 0) - centerY) * 1.5,
            ((a2.z || 0) - centerZ) * 1.5
        );
        
        const distance = start.distanceTo(end);
        
        const cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, distance, 8),
            new THREE.MeshPhongMaterial({ color: 0x999999 })
        );
        
        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        cylinder.position.copy(midpoint);
        cylinder.lookAt(end);
        cylinder.rotateX(Math.PI / 2);
        
        group.add(cylinder);
    });

    scene.add(group);

    // Lights
    scene.add(new THREE.AmbientLight(0x808080, 0.6));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.8));

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        group.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

/**
 * Get atom color
 */
function getAtomColor(symbol) {
    const colors = {
        H: 0xffffff, C: 0x333333, O: 0xff4444, N: 0x3050f8,
        S: 0xffff66, P: 0xff8c00, Cl: 0x1ff01f
    };
    return colors[symbol] || 0x888888;
}

/**
 * Calculate electron shells (existing function)
 */
function calculateElectronShells(atomicNumber) {
    const maxElectronsPerShell = [2, 8, 18, 32, 32, 18, 8];
    const shells = [];
    let remainingElectrons = atomicNumber;

    for (let i = 0; i < maxElectronsPerShell.length && remainingElectrons > 0; i++) {
        const electronsInShell = Math.min(remainingElectrons, maxElectronsPerShell[i]);
        shells.push(electronsInShell);
        remainingElectrons -= electronsInShell;
    }

    return shells;
}

/**
 * Add message (basic version)
 */
function addMessage(content, role, model = null, isError = false) {
    const messageData = {
        content,
        role,
        model,
        timestamp: Date.now()
    };

    currentMessages.push(messageData);

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble ${isError ? 'error-message' : ''}">
                ${formatMessageContent(content)}
            </div>
            <div class="message-time">
                ${formatTime(messageData.timestamp)}
                ${model ? `• ${window.ChemAIModels.getModelDisplayName(model)}` : ''}
            </div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();

    return messageData;
}

/**
 * Format message content
 */
function formatMessageContent(content) {
    let formatted = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    formatted = formatted.replace(/\n/g, '<br>');
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');

    return formatted;
}

/**
 * Add typing indicator
 */
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    const typingId = 'typing-' + Date.now();
    typingDiv.id = typingId;
    typingDiv.className = 'message ai-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;

    messagesContainer.appendChild(typingDiv);
    scrollToBottom();

    return typingId;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator(typingId) {
    const typingDiv = document.getElementById(typingId);
    if (typingDiv) {
        typingDiv.remove();
    }
}

/**
 * Scroll to bottom
 */
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Toggle sidebar
 */
function toggleSidebar() {
    chemaiSidebar.classList.toggle('active');
    
    let overlay = document.getElementById('chemaiOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'chemaiOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.5); z-index: 999; display: none;
        `;
        overlay.addEventListener('click', toggleSidebar);
        document.body.appendChild(overlay);
    }
    
    if (chemaiSidebar.classList.contains('active')) {
        overlay.style.display = 'block';
    } else {
        overlay.style.display = 'none';
    }
}

/**
 * Select model
 */
function selectModel(modelId) {
    if (!window.ChemAIModels) return;
    window.ChemAIModels.setCurrentModel(modelId);

    modelBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.model === modelId);
    });
}

/**
 * Create new chat
 */
function createNewChat() {
    currentChatId = null;
    currentMessages = [];

    messagesContainer.innerHTML = '';
    messagesContainer.style.display = 'none';
    emptyState.style.display = 'flex';

    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });

    if (window.innerWidth <= 768) {
        toggleSidebar();
    }

    console.log('✅ New chat created');
}

/**
 * Load chat
 */
async function loadSpecificChat(chatId) {
    const chat = await window.ChemAIFirebase.loadChat(chatId);
    if (!chat) return;

    currentChatId = chatId;
    currentMessages = chat.messages || [];

    messagesContainer.innerHTML = '';
    messagesContainer.style.display = 'flex';
    emptyState.style.display = 'none';

    currentMessages.forEach(msg => {
        addMessageToUI(msg);
    });

    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.toggle('active', item.dataset.chatId === chatId);
    });

    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

/**
 * Add message to UI (without saving)
 */
function addMessageToUI(messageData) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${messageData.role}-message`;
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${messageData.role === 'user' ? 'fa-user' : 'fa-robot'}"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble">
                ${formatMessageContent(messageData.content)}
            </div>
            <div class="message-time">
                ${formatTime(messageData.timestamp)}
                ${messageData.model ? `• ${window.ChemAIModels.getModelDisplayName(messageData.model)}` : ''}
            </div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
}

/**
 * Save chat to Firebase
 */
async function saveChatToFirebase() {
    if (currentMessages.length === 0) return;

    if (!currentChatId) {
        currentChatId = 'chat_' + Date.now();
    }

    const firstUserMsg = currentMessages.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.substring(0, 50) : 'New Chat';

    const chatData = {
        title,
        messages: currentMessages,
        model: window.ChemAIModels.currentModel,
        createdAt: currentMessages[0].timestamp,
        updatedAt: Date.now()
    };

    await window.ChemAIFirebase.saveChat(currentChatId, chatData);
    await loadChatHistory();
}

/**
 * Load chat history
 */
async function loadChatHistory() {
    if (!window.ChemAIFirebase) {
        chatHistoryList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-comments" style="font-size: 2rem; opacity: 0.3;"></i>
                <p style="margin-top: 0.5rem;">Loading chats...</p>
            </div>
        `;
        return;
    }

    const chats = await window.ChemAIFirebase.loadUserChats();

    chatHistoryList.innerHTML = '';

    if (chats.length === 0) {
        chatHistoryList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-comments" style="font-size: 2rem; opacity: 0.3;"></i>
                <p style="margin-top: 0.5rem;">No chats yet</p>
            </div>
        `;
        return;
    }

    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat.id;
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }

        chatItem.innerHTML = `
            <i class="fas fa-comment-dots"></i>
            <div class="chat-item-content">
                <div class="chat-item-title">${chat.title || 'Untitled Chat'}</div>
                <div class="chat-item-preview">${formatTime(chat.updatedAt)}</div>
            </div>
        `;

        chatItem.addEventListener('click', () => {
            loadSpecificChat(chat.id);
        });

        chatHistoryList.appendChild(chatItem);
    });
}

/**
 * Open settings
 */
function openSettings() {
    settingsModal.classList.add('active');
    defaultModelSelect.value = userSettings.defaultModel || '';
}

/**
 * Close settings
 */
function closeSettings() {
    settingsModal.classList.remove('active');
}

/**
 * Save user settings
 */
async function saveUserSettings() {
    const defaultModel = defaultModelSelect.value;
    userSettings.defaultModel = defaultModel || null;

    if (defaultModel) {
        modelSelector.style.display = 'none';
        if (window.ChemAIModels) {
            window.ChemAIModels.setCurrentModel(defaultModel);
        }
    } else {
        modelSelector.style.display = 'flex';
    }

    if (window.ChemAIFirebase) {
        await window.ChemAIFirebase.saveSettings(userSettings);
    }

    closeSettings();
}

/**
 * Load user settings
 */
async function loadUserSettings() {
    if (!window.ChemAIFirebase) {
        userSettings = { defaultModel: null, theme: 'dark' };
        if (modelSelector) modelSelector.style.display = 'flex';
        selectModel('vicuna');
        return;
    }

    const settings = await window.ChemAIFirebase.loadSettings();
    userSettings = settings;

    if (settings.defaultModel) {
        if (modelSelector) modelSelector.style.display = 'none';
        if (window.ChemAIModels) {
            window.ChemAIModels.setCurrentModel(settings.defaultModel);
        }
        selectModel(settings.defaultModel);
    } else {
        if (modelSelector) modelSelector.style.display = 'flex';
        selectModel('vicuna');
    }
}

/**
 * Format time
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
}

// Export
window.ChemAIUI = {
    init: initChemAIUI,
    createNewChat,
    loadSpecificChat
};

console.log('✅ ChemAI UI module loaded (Enhanced)');
