/**
 * ============================================
 * CHEMAI UI MODULE - PROFESSIONAL OUTPUT
 * Features: 3D Models, Wikipedia, Reactions
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
            // Process and enhance the message
            await addEnhancedMessage(response.message, 'ai', response.model);
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
 * ✨ ENHANCED MESSAGE WITH 3D MODELS + WIKIPEDIA
 */
async function addEnhancedMessage(content, role, model = null) {
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
            <div class="message-bubble">
                <div id="msg-${messageData.timestamp}"></div>
            </div>
            <div class="message-time">
                ${formatTime(messageData.timestamp)}
                ${model ? `• ${window.ChemAIModels.getModelDisplayName(model)}` : ''}
            </div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();

    // Parse and enhance content
    const contentContainer = document.getElementById(`msg-${messageData.timestamp}`);
    await parseAndRenderEnhancedContent(content, contentContainer);

    return messageData;
}

/**
 * 🎯 PARSE AND RENDER ENHANCED CONTENT
 */
async function parseAndRenderEnhancedContent(content, container) {
    // Extract all special tags
    const elementMatches = [...content.matchAll(/\[ELEMENT:([^\]]+)\]/g)];
    const moleculeMatches = [...content.matchAll(/\[MOLECULE:([^\]]+)\]/g)];
    const wikiMatches = [...content.matchAll(/\[WIKI:([^\]]+)\]/g)];
    const reactionMatches = [...content.matchAll(/\[REACTION:([^\]]+)\]/g)];

    // Remove tags from content
    let cleanContent = content
        .replace(/\[ELEMENT:[^\]]+\]/g, '')
        .replace(/\[MOLECULE:[^\]]+\]/g, '')
        .replace(/\[WIKI:[^\]]+\]/g, '')
        .replace(/\[REACTION:[^\]]+\]/g, '');

    // Format content with markdown and emojis
    const formattedContent = formatMessageContent(cleanContent);
    container.innerHTML = formattedContent;

    // Add 3D atom viewers
    if (elementMatches.length > 0) {
        const elementsContainer = document.createElement('div');
        elementsContainer.className = 'ai-elements-container';
        elementsContainer.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;margin-top:20px;';

        for (const match of elementMatches.slice(0, 3)) { // Max 3
            const elementName = match[1].trim();
            const element = findElement(elementName);
            if (element) {
                const card = await create3DElementCard(element);
                elementsContainer.appendChild(card);
            }
        }

        if (elementsContainer.children.length > 0) {
            container.appendChild(elementsContainer);
        }
    }

    // Add 3D molecule viewers
    if (moleculeMatches.length > 0) {
        const moleculesContainer = document.createElement('div');
        moleculesContainer.className = 'ai-molecules-container';
        moleculesContainer.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:15px;margin-top:20px;';

        for (const match of moleculeMatches.slice(0, 2)) { // Max 2
            const moleculeId = match[1].trim().toLowerCase();
            const molecule = moleculesData.find(m => m.id === moleculeId || m.name.toLowerCase().includes(moleculeId));
            if (molecule) {
                const card = await create3DMoleculeCard(molecule);
                moleculesContainer.appendChild(card);
            }
        }

        if (moleculesContainer.children.length > 0) {
            container.appendChild(moleculesContainer);
        }
    }

    // Add Wikipedia info
    if (wikiMatches.length > 0) {
        for (const match of wikiMatches.slice(0, 1)) { // Only 1 wiki
            const topic = match[1].trim();
            const wikiCard = await createWikipediaCard(topic);
            if (wikiCard) {
                container.appendChild(wikiCard);
            }
        }
    }

    // Add reaction viewers
    if (reactionMatches.length > 0) {
        const reactionsContainer = document.createElement('div');
        reactionsContainer.style.cssText = 'margin-top:20px;';

        for (const match of reactionMatches.slice(0, 1)) { // Only 1 reaction
            const reactionStr = match[1].trim();
            const card = createReactionCard(reactionStr);
            if (card) {
                reactionsContainer.appendChild(card);
            }
        }

        if (reactionsContainer.children.length > 0) {
            container.appendChild(reactionsContainer);
        }
    }
}

/**
 * 🔬 CREATE 3D ELEMENT CARD
 */
async function create3DElementCard(element) {
    const card = document.createElement('div');
    card.className = 'ai-element-card';
    card.style.cssText = `
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: 12px;
        padding: 15px;
        transition: all 0.3s ease;
    `;

    const viewerId = `ai-element-${element.number}-${Date.now()}`;
    
    card.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div style="width:50px;height:50px;border-radius:8px;background:linear-gradient(135deg,var(--accent-blue),var(--accent-purple));display:flex;align-items:center;justify-content:center;color:white;font-size:1.4rem;font-weight:700;">
                ${element.symbol}
            </div>
            <div>
                <div style="font-weight:700;font-size:1.05rem;color:var(--text-primary);">⚛️ ${element.name}</div>
                <div style="font-size:0.85rem;color:var(--text-secondary);">Atomic #${element.number}</div>
            </div>
        </div>
        <div id="${viewerId}" style="height:180px;background:var(--bg-primary);border-radius:8px;overflow:hidden;"></div>
        <div style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary);text-align:center;">
            💫 Interactive 3D Model
        </div>
    `;

    // Create 3D atom
    setTimeout(() => {
        const container = document.getElementById(viewerId);
        if (container) {
            create3DAtomInContainer(element, container);
        }
    }, 100);

    return card;
}

/**
 * 🧬 CREATE 3D MOLECULE CARD
 */
async function create3DMoleculeCard(molecule) {
    const card = document.createElement('div');
    card.className = 'ai-molecule-card';
    card.style.cssText = `
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: 12px;
        padding: 15px;
        transition: all 0.3s ease;
    `;

    const viewerId = `ai-molecule-${molecule.id}-${Date.now()}`;
    
    card.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div style="width:55px;height:55px;border-radius:8px;background:linear-gradient(135deg,var(--accent-green),var(--accent-blue));display:flex;align-items:center;justify-content:center;color:white;font-size:0.95rem;font-weight:700;text-align:center;padding:4px;">
                ${molecule.formula}
            </div>
            <div>
                <div style="font-weight:700;font-size:1.05rem;color:var(--text-primary);">🧪 ${molecule.name}</div>
                <div style="font-size:0.85rem;color:var(--text-secondary);">${molecule.atoms.length} atoms</div>
            </div>
        </div>
        <div id="${viewerId}" style="height:200px;background:var(--bg-primary);border-radius:8px;overflow:hidden;"></div>
        <div style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary);text-align:center;">
            🔬 3D Molecular Structure
        </div>
    `;

    setTimeout(() => {
        const container = document.getElementById(viewerId);
        if (container) {
            create3DMoleculeInContainer(molecule, container);
        }
    }, 100);

    return card;
}

/**
 * 📚 CREATE WIKIPEDIA CARD
 */
async function createWikipediaCard(topic) {
    const card = document.createElement('div');
    card.className = 'ai-wikipedia-card';
    card.style.cssText = `
        background: linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(124, 227, 139, 0.1));
        border: 1px solid var(--accent-blue);
        border-radius: 12px;
        padding: 18px;
        margin-top: 20px;
    `;

    card.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <i class="fab fa-wikipedia-w" style="font-size:1.8rem;color:var(--accent-blue);"></i>
            <div>
                <div style="font-weight:700;font-size:1.1rem;color:var(--text-primary);">📖 ${topic}</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);opacity:0.7;">From Wikipedia</div>
            </div>
        </div>
        <div id="wiki-loading-${Date.now()}" style="text-align:center;padding:20px;color:var(--text-secondary);">
            <div class="spinner-border spinner-border-sm" role="status"></div>
            <span style="margin-left:8px;font-size:0.85rem;">Loading...</span>
        </div>
    `;

    const loadingDiv = card.querySelector('[id^="wiki-loading"]');

    try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
        const data = await response.json();

        if (data.extract) {
            loadingDiv.outerHTML = `
                <div style="color:var(--text-secondary);line-height:1.6;font-size:0.95rem;margin-bottom:12px;">
                    ${data.extract}
                </div>
                <a href="${data.content_urls.desktop.page}" target="_blank" 
                   style="display:inline-flex;align-items:center;gap:6px;color:var(--accent-blue);text-decoration:none;font-weight:600;font-size:0.9rem;padding:8px 12px;background:rgba(88,166,255,0.1);border-radius:6px;transition:all 0.3s ease;">
                    <i class="fas fa-external-link-alt"></i>
                    Read more on Wikipedia
                </a>
            `;
        } else {
            loadingDiv.textContent = 'No Wikipedia article found.';
        }
    } catch (error) {
        loadingDiv.textContent = 'Failed to load Wikipedia info.';
    }

    return card;
}

/**
 * ⚗️ CREATE REACTION CARD
 */
function createReactionCard(reactionStr) {
    const card = document.createElement('div');
    card.className = 'ai-reaction-card';
    card.style.cssText = `
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: 12px;
        padding: 18px;
        text-align: center;
    `;

    card.innerHTML = `
        <div style="font-weight:700;font-size:1.1rem;color:var(--text-primary);margin-bottom:15px;">
            🔥 Chemical Reaction
        </div>
        <div style="font-size:1.15rem;font-weight:600;color:var(--accent-orange);font-family:monospace;padding:15px;background:var(--bg-primary);border-radius:8px;">
            ${reactionStr}
        </div>
        <div style="margin-top:12px;font-size:0.8rem;color:var(--text-secondary);">
            ⚡ Balanced Chemical Equation
        </div>
    `;

    return card;
}

// Helper functions
function findElement(nameOrNumberOrSymbol) {
    const search = nameOrNumberOrSymbol.toString().toLowerCase();
    return elementsData.find(e => 
        e.name.toLowerCase() === search || 
        e.symbol.toLowerCase() === search ||
        e.number.toString() === search
    );
}

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

function formatMessageContent(content) {
    let formatted = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Headers
    formatted = formatted.replace(/^### (.+)$/gm, '<h4 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin:12px 0 8px 0;">$1</h4>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h3 style="font-size:1.25rem;font-weight:700;color:var(--text-primary);margin:15px 0 10px 0;">$1</h3>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);margin:18px 0 12px 0;">$1</h2>');

    formatted = formatted.replace(/\n/g, '<br>');
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`(.+?)`/g, '<code style="background:var(--bg-tertiary);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;">$1</code>');

    // Bullet lists
    formatted = formatted.replace(/^- (.+)$/gm, '<li style="margin-left:20px;margin-bottom:4px;">$1</li>');

    return formatted;
}

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

function removeTypingIndicator(typingId) {
    const typingDiv = document.getElementById(typingId);
    if (typingDiv) {
        typingDiv.remove();
    }
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
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: none;
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

function selectModel(modelId) {
    if (!window.ChemAIModels) {
        console.warn('⚠️ ChemAIModels not loaded yet');
        return;
    }

    window.ChemAIModels.setCurrentModel(modelId);

    modelBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.model === modelId);
    });

    console.log('✅ Model selected:', modelId);
}

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

    console.log('✅ Chat loaded:', chatId);
}

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

async function loadChatHistory() {
    if (!window.ChemAIFirebase) {
        console.warn('⚠️ ChemAIFirebase not loaded yet');
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

    console.log('✅ Settings saved:', userSettings);
}

async function loadUserSettings() {
    if (!window.ChemAIFirebase) {
        console.warn('⚠️ ChemAIFirebase not loaded yet');
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

    console.log('✅ Settings loaded:', settings);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
        return 'Just now';
    }

    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    }

    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }

    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }

    return date.toLocaleDateString();
}

window.ChemAIUI = {
    init: initChemAIUI,
    createNewChat,
    loadSpecificChat
};

console.log('✅ ChemAI UI module loaded (ENHANCED)');
