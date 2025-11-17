/**
 * ============================================
 * CHEMAI UI - PROFESSIONAL OUTPUT
 * Wikipedia + 3D Models + Context-based Emojis
 * ============================================
 */

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

function initChemAIUI() {
    console.log('🎨 Initializing ChemAI UI...');

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

    console.log('✅ ChemAI UI initialized');
}

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

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && chemaiSidebar.classList.contains('active')) {
            if (!chemaiSidebar.contains(e.target) && !chemaiMenuBtn.contains(e.target)) {
                toggleSidebar();
            }
        }
    });
}

function handleInputChange() {
    const value = chemaiInput.value.trim();
    sendBtn.disabled = value.length === 0;
    chemaiInput.style.height = 'auto';
    chemaiInput.style.height = Math.min(chemaiInput.scrollHeight, 150) + 'px';
}

function handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
            handleSendMessage();
        }
    }
}

/**
 * Handle send message - PROFESSIONAL OUTPUT
 */
async function handleSendMessage() {
    const message = chemaiInput.value.trim();
    if (!message) return;

    if (isSending) {
        console.log('⏳ Message already being sent...');
        return;
    }
    
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

        addMessage(message, 'user');
        chemaiInput.value = '';
        handleInputChange();

        const typingId = addTypingIndicator();
        const model = window.ChemAIModels ? window.ChemAIModels.currentModel : 'vicuna';

        if (!window.ChemAIAPI) {
            console.error('❌ ChemAIAPI not loaded');
            removeTypingIndicator(typingId);
            addMessage('Error: API module not loaded. Please refresh the page.', 'ai', model, true);
            return;
        }

        const response = await window.ChemAIAPI.sendMessage(
            message,
            window.ChemAIAPI.formatChatHistory(currentMessages),
            model
        );

        removeTypingIndicator(typingId);

        if (response.success) {
            // PROFESSIONAL OUTPUT WITH WIKIPEDIA + 3D
            await addProfessionalMessage(response.message, response.model, message);
        } else {
            addMessage(response.message, 'ai', model, true);
        }

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
 * Add professional message with Wikipedia and 3D models
 */
async function addProfessionalMessage(content, model, userQuestion) {
    const messageData = {
        content,
        role: 'ai',
        model,
        timestamp: Date.now()
    };

    currentMessages.push(messageData);

    // Detect chemistry entities in user question
    const entities = detectChemistryEntities(userQuestion);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message professional-message';
    
    let messageHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble professional-bubble">
                ${formatProfessionalContent(content)}
            </div>
    `;

    // Add Wikipedia section if relevant entity found
    if (entities.element || entities.molecule) {
        messageHTML += await generateWikipediaSection(entities);
    }

    // Add 3D model if relevant
    if (entities.element || entities.molecule) {
        messageHTML += generate3DModelSection(entities);
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
    
    // Initialize 3D models after DOM insertion
    if (entities.element || entities.molecule) {
        setTimeout(() => initialize3DModels(messageDiv, entities), 100);
    }
    
    scrollToBottom();
}

/**
 * Detect chemistry entities (elements/molecules)
 */
function detectChemistryEntities(text) {
    const entities = {
        element: null,
        molecule: null
    };

    const lowerText = text.toLowerCase();

    // Check for elements
    if (typeof elementsData !== 'undefined') {
        for (const element of elementsData) {
            if (lowerText.includes(element.name.toLowerCase()) || 
                lowerText.includes(element.symbol.toLowerCase())) {
                entities.element = element;
                break;
            }
        }
    }

    // Check for molecules
    if (typeof moleculesData !== 'undefined') {
        for (const molecule of moleculesData) {
            if (lowerText.includes(molecule.name.toLowerCase()) ||
                lowerText.includes(molecule.formula.toLowerCase().replace(/[₀-₉]/g, m => String.fromCharCode(m.charCodeAt(0) - 8272)))) {
                entities.molecule = molecule;
                break;
            }
        }
    }

    return entities;
}

/**
 * Format content professionally with emojis
 */
function formatProfessionalContent(content) {
    let formatted = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Add context-based emojis
    formatted = formatted
        .replace(/\b(water|H2O|H₂O)\b/gi, '💧 $1')
        .replace(/\b(carbon|C)\b/gi, '⚫ $1')
        .replace(/\b(oxygen|O2|O₂)\b/gi, '🫁 $1')
        .replace(/\b(hydrogen|H2|H₂)\b/gi, '🎈 $1')
        .replace(/\b(gold|Au)\b/gi, '🥇 $1')
        .replace(/\b(silver|Ag)\b/gi, '🥈 $1')
        .replace(/\b(iron|Fe)\b/gi, '🔩 $1')
        .replace(/\b(reaction|chemical reaction)\b/gi, '⚗️ $1')
        .replace(/\b(molecule|molecular)\b/gi, '🧬 $1')
        .replace(/\b(atom|atomic)\b/gi, '⚛️ $1')
        .replace(/\b(bond|bonding)\b/gi, '🔗 $1')
        .replace(/\b(electron)\b/gi, '⚡ $1')
        .replace(/\b(temperature|heat)\b/gi, '🌡️ $1')
        .replace(/\b(gas|gases)\b/gi, '💨 $1')
        .replace(/\b(liquid)\b/gi, '💧 $1')
        .replace(/\b(solid)\b/gi, '🧊 $1');

    // Convert line breaks
    formatted = formatted.replace(/\n\n/g, '</p><p class="ai-paragraph">');
    formatted = formatted.replace(/\n/g, '<br>');

    // Bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="ai-highlight">$1</strong>');

    // Italic
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code
    formatted = formatted.replace(/`(.+?)`/g, '<code class="ai-code">$1</code>');

    // Wrap in paragraph
    formatted = `<p class="ai-paragraph">${formatted}</p>`;

    return formatted;
}

/**
 * Generate Wikipedia section
 */
async function generateWikipediaSection(entities) {
    let wikiHTML = '<div class="wiki-section-inline">';
    
    try {
        const entity = entities.element || entities.molecule;
        const wikiTitle = entity.wikiTitle || entity.name;
        
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.extract) {
                wikiHTML += `
                    <div class="wiki-header">
                        <i class="fab fa-wikipedia-w"></i>
                        <span>Wikipedia Extract</span>
                    </div>
                    <div class="wiki-text">${data.extract}</div>
                    <div class="wiki-footer">
                        <small>Source: <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}" target="_blank">Wikipedia</a></small>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.warn('Wikipedia fetch failed:', error);
    }
    
    wikiHTML += '</div>';
    return wikiHTML;
}

/**
 * Generate 3D model section
 */
function generate3DModelSection(entities) {
    if (entities.element) {
        return `
            <div class="model-3d-inline" data-type="element" data-number="${entities.element.number}">
                <div class="model-3d-header">
                    <i class="fas fa-atom"></i>
                    <span>3D Atom Structure: ${entities.element.name}</span>
                </div>
                <div class="model-3d-viewer" id="inline-atom-${entities.element.number}"></div>
            </div>
        `;
    } else if (entities.molecule) {
        return `
            <div class="model-3d-inline" data-type="molecule" data-id="${entities.molecule.id}">
                <div class="model-3d-header">
                    <i class="fas fa-flask"></i>
                    <span>3D Molecular Structure: ${entities.molecule.name}</span>
                </div>
                <div class="model-3d-viewer" id="inline-molecule-${entities.molecule.id}"></div>
            </div>
        `;
    }
    
    return '';
}

/**
 * Initialize 3D models in chat
 */
function initialize3DModels(messageDiv, entities) {
    if (entities.element) {
        const container = messageDiv.querySelector(`#inline-atom-${entities.element.number}`);
        if (container && typeof create3DAtom === 'function') {
            create3DAtomInline(entities.element, container);
        }
    } else if (entities.molecule) {
        const container = messageDiv.querySelector(`#inline-molecule-${entities.molecule.id}`);
        if (container && typeof create3DMolecule === 'function') {
            create3DMoleculeInline(entities.molecule, container);
        }
    }
}

/**
 * Create inline 3D atom (simplified)
 */
function create3DAtomInline(element, container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161b22);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / 300, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, 300);
    container.appendChild(renderer.domElement);

    const atomGroup = new THREE.Group();
    scene.add(atomGroup);

    // Nucleus
    const nucleusGeo = new THREE.SphereGeometry(0.8, 24, 24);
    const nucleusMat = new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0x330000 });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    atomGroup.add(nucleus);

    // Electrons
    const shells = calculateElectronShells(element.number);
    shells.forEach((count, shellIndex) => {
        const radius = (shellIndex + 1) * 2.5;
        const color = [0x00ff00, 0x0099ff, 0xffff00, 0xff9900][shellIndex] || 0x00ff00;
        
        for (let i = 0; i < count; i++) {
            const electronGeo = new THREE.SphereGeometry(0.15, 12, 12);
            const electronMat = new THREE.MeshPhongMaterial({ color: color });
            const electron = new THREE.Mesh(electronGeo, electronMat);
            
            const angle = (i / count) * Math.PI * 2;
            electron.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
            atomGroup.add(electron);
        }
    });

    // Lights
    scene.add(new THREE.AmbientLight(0x888888, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 5, 5);
    scene.add(dl);

    function animate() {
        requestAnimationFrame(animate);
        atomGroup.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate();
}

/**
 * Create inline 3D molecule (simplified)
 */
function create3DMoleculeInline(molecule, container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161b22);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / 300, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, 300);
    container.appendChild(renderer.domElement);

    const molGroup = new THREE.Group();
    scene.add(molGroup);

    const colorMap = { C: 0x222222, O: 0xff4444, H: 0xffffff, N: 0x3050f8 };
    const radiusMap = { H: 0.25, C: 0.4, O: 0.38, N: 0.37 };

    // Add atoms
    molecule.atoms.forEach(a => {
        const col = colorMap[a.el] || 0x888888;
        const r = radiusMap[a.el] || 0.35;
        const geo = new THREE.SphereGeometry(r, 16, 16);
        const mat = new THREE.MeshPhongMaterial({ color: col });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(a.x || 0, a.y || 0, a.z || 0);
        molGroup.add(mesh);
    });

    // Add bonds
    molecule.bonds.forEach(b => {
        const a1 = molecule.atoms[b[0]];
        const a2 = molecule.atoms[b[1]];
        if (!a1 || !a2) return;
        
        const start = new THREE.Vector3(a1.x || 0, a1.y || 0, a1.z || 0);
        const end = new THREE.Vector3(a2.x || 0, a2.y || 0, a2.z || 0);
        const dist = start.distanceTo(end);
        
        const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, dist, 8);
        const cylMat = new THREE.MeshPhongMaterial({ color: 0x999999 });
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        
        cyl.position.copy(new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5));
        cyl.lookAt(end);
        cyl.rotateX(Math.PI / 2);
        molGroup.add(cyl);
    });

    // Lights
    scene.add(new THREE.AmbientLight(0x888888, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 5, 5);
    scene.add(dl);

    function animate() {
        requestAnimationFrame(animate);
        molGroup.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate();
}

/**
 * Calculate electron shells (helper function)
 */
function calculateElectronShells(atomicNumber) {
    const maxElectronsPerShell = [2, 8, 18, 32];
    const shells = [];
    let remaining = atomicNumber;

    for (let i = 0; i < maxElectronsPerShell.length && remaining > 0; i++) {
        const electronsInShell = Math.min(remaining, maxElectronsPerShell[i]);
        shells.push(electronsInShell);
        remaining -= electronsInShell;
    }

    return shells;
}

// ... (keep all other existing functions: addMessage, addTypingIndicator, etc.)

function addMessage(content, role, model = null, isError = false) {
    const messageData = { content, role, model, timestamp: Date.now() };
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

function formatMessageContent(content) {
    let formatted = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    formatted = formatted.replace(/\n/g, '<br>');
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
    return formatted;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    const typingId = 'typing-' + Date.now();
    typingDiv.id = typingId;
    typingDiv.className = 'message ai-message';
    typingDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
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

function removeTypingIndicator(typingId) {
    const typingDiv = document.getElementById(typingId);
    if (typingDiv) typingDiv.remove();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function toggleSidebar() {
    chemaiSidebar.classList.toggle('active');
    let overlay = document.getElementById('chemaiOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'chemaiOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999;display:none;';
        overlay.addEventListener('click', toggleSidebar);
        document.body.appendChild(overlay);
    }
    overlay.style.display = chemaiSidebar.classList.contains('active') ? 'block' : 'none';
}

function selectModel(modelId) {
    if (!window.ChemAIModels) return;
    window.ChemAIModels.setCurrentModel(modelId);
    modelBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.model === modelId));
}

function createNewChat() {
    currentChatId = null;
    currentMessages = [];
    messagesContainer.innerHTML = '';
    messagesContainer.style.display = 'none';
    emptyState.style.display = 'flex';
    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    if (window.innerWidth <= 768) toggleSidebar();
}

async function saveChatToFirebase() {
    if (currentMessages.length === 0) return;
    if (!currentChatId) currentChatId = 'chat_' + Date.now();
    
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

async function loadChatHistory() {
    if (!window.ChemAIFirebase) return;
    const chats = await window.ChemAIFirebase.loadUserChats();
    chatHistoryList.innerHTML = '';
    
    if (chats.length === 0) {
        chatHistoryList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-secondary)"><i class="fas fa-comments" style="font-size:2rem;opacity:0.3"></i><p style="margin-top:0.5rem">No chats yet</p></div>';
        return;
    }
    
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat.id;
        if (chat.id === currentChatId) chatItem.classList.add('active');
        chatItem.innerHTML = `<i class="fas fa-comment-dots"></i><div class="chat-item-content"><div class="chat-item-title">${chat.title || 'Untitled'}</div><div class="chat-item-preview">${formatTime(chat.updatedAt)}</div></div>`;
        chatItem.addEventListener('click', () => loadSpecificChat(chat.id));
        chatHistoryList.appendChild(chatItem);
    });
}

async function loadSpecificChat(chatId) {
    const chat = await window.ChemAIFirebase.loadChat(chatId);
    if (!chat) return;
    currentChatId = chatId;
    currentMessages = chat.messages || [];
    messagesContainer.innerHTML = '';
    messagesContainer.style.display = 'flex';
    emptyState.style.display = 'none';
    currentMessages.forEach(msg => addMessageToUI(msg));
    document.querySelectorAll('.chat-item').forEach(item => item.classList.toggle('active', item.dataset.chatId === chatId));
    if (window.innerWidth <= 768) toggleSidebar();
}

function addMessageToUI(messageData) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${messageData.role}-message`;
    messageDiv.innerHTML = `<div class="message-avatar"><i class="fas ${messageData.role === 'user' ? 'fa-user' : 'fa-robot'}"></i></div><div class="message-content"><div class="message-bubble">${formatMessageContent(messageData.content)}</div><div class="message-time">${formatTime(messageData.timestamp)}${messageData.model ? ` • ${window.ChemAIModels.getModelDisplayName(messageData.model)}` : ''}</div></div>`;
    messagesContainer.appendChild(messageDiv);
}

function openSettings() {
    settingsModal.classList.add('active');
    defaultModelSelect.value = userSettings.defaultModel || '';
}

function closeSettings() {
    settingsModal.classList.remove('active');
}

async function saveUserSettings() {
    const defaultModel = defaultModelSelect.value;
    userSettings.defaultModel = defaultModel || null;
    if (defaultModel) {
        modelSelector.style.display = 'none';
        if (window.ChemAIModels) window.ChemAIModels.setCurrentModel(defaultModel);
    } else {
        modelSelector.style.display = 'flex';
    }
    if (window.ChemAIFirebase) await window.ChemAIFirebase.saveSettings(userSettings);
    closeSettings();
}

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
        if (window.ChemAIModels) window.ChemAIModels.setCurrentModel(settings.defaultModel);
        selectModel(settings.defaultModel);
    } else {
        if (modelSelector) modelSelector.style.display = 'flex';
        selectModel('vicuna');
    }
}

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

window.ChemAIUI = { init: initChemAIUI, createNewChat, loadSpecificChat };
console.log('✅ ChemAI UI module loaded');
