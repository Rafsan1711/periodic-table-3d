/**
 * ============================================
 * CHEMAI UI - COMPLETE FINAL VERSION
 * ChatGPT-style rendering + Mobile Fixed
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

/**
 * Initialize UI
 */
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
 * Handle send message
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
            // Detect 3D model requirement
            const entity = detectChemistryEntity(message);
            addProfessionalMessage(response.message, response.model, entity);
        } else {
            addMessage(response.message, 'ai', model, true);
        }

        await saveChatToFirebase();

    } catch (error) {
        console.error('❌ Error:', error);
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
 * Detect chemistry entity for 3D model
 */
function detectChemistryEntity(text) {
    const lowerText = text.toLowerCase();
    let entity = { element: null, molecule: null };

    // Check elements
    if (typeof elementsData !== 'undefined') {
        for (const element of elementsData) {
            if (lowerText.includes(element.name.toLowerCase()) || 
                lowerText.includes(element.symbol.toLowerCase())) {
                entity.element = element;
                break;
            }
        }
    }

    // Check molecules
    if (typeof moleculesData !== 'undefined') {
        for (const molecule of moleculesData) {
            if (lowerText.includes(molecule.name.toLowerCase())) {
                entity.molecule = molecule;
                break;
            }
        }
    }

    return entity;
}

/**
 * Add professional message with markdown rendering
 */
function addProfessionalMessage(content, model, entity) {
    const messageData = {
        content,
        role: 'ai',
        model,
        entity: entity, // Store entity for persistence
        timestamp: Date.now()
    };

    currentMessages.push(messageData);

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message professional-message';
    
    let messageHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble professional-bubble">
                ${renderMarkdown(content)}
            </div>
    `;

    // Add 3D model if entity detected
    if (entity && (entity.element || entity.molecule)) {
        messageHTML += generate3DModelSection(entity);
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
    
    // Initialize 3D model
    if (entity && (entity.element || entity.molecule)) {
        setTimeout(() => initialize3DModels(messageDiv, entity), 100);
    }
    
    scrollToBottom();
}

/**
 * Render Markdown (ChatGPT-style)
 */
function renderMarkdown(text) {
    // Escape HTML first
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Headings (## Heading)
    html = html.replace(/^## (.+)$/gm, '<h2 class="ai-heading-2">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="ai-heading-3">$1</h3>');

    // Bold (**text**)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="ai-bold">$1</strong>');

    // Italic (*text*)
    html = html.replace(/\*(.+?)\*/g, '<em class="ai-italic">$1</em>');

    // Code (`code`)
    html = html.replace(/`(.+?)`/g, '<code class="ai-code">$1</code>');

    // Lists
    html = html.replace(/^- (.+)$/gm, '<li class="ai-list-item">$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ai-list-item-numbered">$2</li>');

    // Wrap lists
    html = html.replace(/(<li class="ai-list-item">.*?<\/li>)/gs, '<ul class="ai-list">$1</ul>');
    html = html.replace(/(<li class="ai-list-item-numbered">.*?<\/li>)/gs, '<ol class="ai-list-ordered">$1</ol>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="ai-divider">');

    // Paragraphs (double newline)
    html = html.replace(/\n\n/g, '</p><p class="ai-paragraph">');
    
    // Single newlines to <br>
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph
    html = `<div class="ai-content"><p class="ai-paragraph">${html}</p></div>`;

    // Add context emojis
    html = addContextEmojis(html);

    return html;
}

/**
 * Add context-based emojis
 */
function addContextEmojis(html) {
    const emojiMap = {
        'water|H₂O|h2o': '💧',
        'oxygen|O₂|o2': '🫁',
        'hydrogen|H₂|h2': '🎈',
        'carbon': '⚫',
        'gold': '🥇',
        'silver': '🥈',
        'iron': '🔩',
        'atom|atomic': '⚛️',
        'molecule|molecular': '🧬',
        'reaction': '⚗️',
        'bond|bonding': '🔗',
        'electron': '⚡',
        'temperature|heat': '🌡️',
        'gas': '💨',
        'liquid': '💧',
        'solid': '🧊'
    };

    for (const [keywords, emoji] of Object.entries(emojiMap)) {
        const patterns = keywords.split('|');
        patterns.forEach(pattern => {
            const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');
            // Only add emoji once per word
            html = html.replace(regex, (match) => {
                if (!match.includes(emoji)) {
                    return `${emoji} ${match}`;
                }
                return match;
            });
        });
    }

    return html;
}

/**
 * Generate 3D model section
 */
function generate3DModelSection(entity) {
    if (entity.element) {
        return `
            <div class="model-3d-inline" data-type="element" data-number="${entity.element.number}">
                <div class="model-3d-header">
                    <i class="fas fa-atom"></i>
                    <span>3D Structure: ${entity.element.name}</span>
                </div>
                <div class="model-3d-viewer" id="inline-atom-${entity.element.number}-${Date.now()}"></div>
            </div>
        `;
    } else if (entity.molecule) {
        return `
            <div class="model-3d-inline" data-type="molecule" data-id="${entity.molecule.id}">
                <div class="model-3d-header">
                    <i class="fas fa-flask"></i>
                    <span>3D Structure: ${entity.molecule.name}</span>
                </div>
                <div class="model-3d-viewer" id="inline-molecule-${entity.molecule.id}-${Date.now()}"></div>
            </div>
        `;
    }
    return '';
}

/**
 * Initialize 3D models
 */
function initialize3DModels(messageDiv, entity) {
    if (!entity) return;
    
    if (entity.element) {
        const containers = messageDiv.querySelectorAll(`[data-type="element"][data-number="${entity.element.number}"] .model-3d-viewer`);
        containers.forEach(container => {
            if (container && typeof THREE !== 'undefined' && !container.querySelector('canvas')) {
                create3DAtomInline(entity.element, container);
            }
        });
    } else if (entity.molecule) {
        const containers = messageDiv.querySelectorAll(`[data-type="molecule"][data-id="${entity.molecule.id}"] .model-3d-viewer`);
        containers.forEach(container => {
            if (container && typeof THREE !== 'undefined' && !container.querySelector('canvas')) {
                create3DMoleculeInline(entity.molecule, container);
            }
        });
    }
}

/**
 * Create 3D atom inline
 */
function create3DAtomInline(element, container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / 250, 0.1, 1000);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, 250);
    container.appendChild(renderer.domElement);

    const atomGroup = new THREE.Group();
    scene.add(atomGroup);

    // Nucleus
    const nucleusGeo = new THREE.SphereGeometry(0.6, 20, 20);
    const nucleusMat = new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0x330000 });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    atomGroup.add(nucleus);

    // Electrons
    const shells = calculateElectronShells(element.number);
    shells.forEach((count, idx) => {
        const radius = (idx + 1) * 2;
        const color = [0x00ff00, 0x0099ff, 0xffff00][idx] || 0x00ff00;
        
        for (let i = 0; i < count; i++) {
            const eGeo = new THREE.SphereGeometry(0.12, 10, 10);
            const eMat = new THREE.MeshPhongMaterial({ color });
            const electron = new THREE.Mesh(eGeo, eMat);
            const angle = (i / count) * Math.PI * 2;
            electron.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
            atomGroup.add(electron);
        }
    });

    scene.add(new THREE.AmbientLight(0x888888, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.7);
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
 * Create 3D molecule inline
 */
function create3DMoleculeInline(molecule, container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / 250, 0.1, 1000);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, 250);
    container.appendChild(renderer.domElement);

    const molGroup = new THREE.Group();
    scene.add(molGroup);

    const colorMap = { C: 0x222222, O: 0xff4444, H: 0xffffff, N: 0x3050f8 };
    const radiusMap = { H: 0.2, C: 0.35, O: 0.33, N: 0.32 };

    molecule.atoms.forEach(a => {
        const geo = new THREE.SphereGeometry(radiusMap[a.el] || 0.3, 14, 14);
        const mat = new THREE.MeshPhongMaterial({ color: colorMap[a.el] || 0x888888 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(a.x || 0, a.y || 0, a.z || 0);
        molGroup.add(mesh);
    });

    molecule.bonds.forEach(b => {
        const a1 = molecule.atoms[b[0]];
        const a2 = molecule.atoms[b[1]];
        if (!a1 || !a2) return;
        
        const start = new THREE.Vector3(a1.x || 0, a1.y || 0, a1.z || 0);
        const end = new THREE.Vector3(a2.x || 0, a2.y || 0, a2.z || 0);
        const dist = start.distanceTo(end);
        
        const cylGeo = new THREE.CylinderGeometry(0.06, 0.06, dist, 8);
        const cylMat = new THREE.MeshPhongMaterial({ color: 0x999999 });
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        
        cyl.position.copy(new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5));
        cyl.lookAt(end);
        cyl.rotateX(Math.PI / 2);
        molGroup.add(cyl);
    });

    scene.add(new THREE.AmbientLight(0x888888, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.7);
    dl.position.set(5, 5, 5);
    scene.add(dl);

    function animate() {
        requestAnimationFrame(animate);
        molGroup.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate();
}

function calculateElectronShells(atomicNumber) {
    const max = [2, 8, 18, 32];
    const shells = [];
    let remaining = atomicNumber;
    for (let i = 0; i < max.length && remaining > 0; i++) {
        const e = Math.min(remaining, max[i]);
        shells.push(e);
        remaining -= e;
    }
    return shells;
}

/**
 * Add simple message
 */
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
                ${escapeHtml(content).replace(/\n/g, '<br>')}
            </div>
            <div class="message-time">
                ${formatTime(messageData.timestamp)}
                ${model ? `• ${window.ChemAIModels.getModelDisplayName(model)}` : ''}
            </div>
        </div>
    `;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
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
    const firstMsg = currentMessages.find(m => m.role === 'user');
    const title = firstMsg ? firstMsg.content.substring(0, 50) : 'New Chat';
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
    if (!window.ChemAIFirebase) {
        chatHistoryList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-secondary)"><i class="fas fa-comments" style="font-size:2rem;opacity:0.3"></i><p>Loading...</p></div>';
        return;
    }
    const chats = await window.ChemAIFirebase.loadUserChats();
    chatHistoryList.innerHTML = '';
    if (chats.length === 0) {
        chatHistoryList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-secondary)"><i class="fas fa-comments" style="font-size:2rem;opacity:0.3"></i><p>No chats yet</p></div>';
        return;
    }
    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        item.dataset.chatId = chat.id;
        if (chat.id === currentChatId) item.classList.add('active');
        item.innerHTML = `<i class="fas fa-comment-dots"></i><div class="chat-item-content"><div class="chat-item-title">${chat.title || 'Untitled'}</div><div class="chat-item-preview">${formatTime(chat.updatedAt)}</div></div>`;
        item.addEventListener('click', () => loadSpecificChat(chat.id));
        chatHistoryList.appendChild(item);
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
    
    // Restore messages with 3D models
    currentMessages.forEach(msg => {
        if (msg.role === 'ai' && msg.entity) {
            addProfessionalMessage(msg.content, msg.model, msg.entity);
        } else {
            addMessage(msg.content, msg.role, msg.model);
        }
    });
    
    document.querySelectorAll('.chat-item').forEach(item => item.classList.toggle('active', item.dataset.chatId === chatId));
    if (window.innerWidth <= 768) toggleSidebar();
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
console.log('✅ ChemAI UI loaded (FINAL)');
