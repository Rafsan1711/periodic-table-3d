/**
 * ============================================
 * CHEMAI UI MODULE
 * Complete UI management and interactions
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

/**
 * Initialize UI
 */
function initChemAIUI() {
    console.log('🎨 Initializing ChemAI UI...');

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

    // Setup event listeners
    setupEventListeners();

    // Load settings and chats
    loadUserSettings();
    loadChatHistory();

    console.log('✅ ChemAI UI initialized');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Input events
    chemaiInput.addEventListener('input', handleInputChange);
    chemaiInput.addEventListener('keydown', handleInputKeydown);
    sendBtn.addEventListener('click', handleSendMessage);

    // Sidebar events
    chemaiMenuBtn?.addEventListener('click', toggleSidebar);
    closeSidebarBtn?.addEventListener('click', toggleSidebar);
    newChatBtn?.addEventListener('click', createNewChat);
    settingsBtn?.addEventListener('click', openSettings);

    // Model selector
    modelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const model = btn.dataset.model;
            selectModel(model);
        });
    });

    // Settings modal
    closeSettingsBtn?.addEventListener('click', closeSettings);
    saveSettingsBtn?.addEventListener('click', saveUserSettings);

    // Example questions
    document.querySelectorAll('.example-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.dataset.question;
            chemaiInput.value = question;
            handleInputChange();
            handleSendMessage();
        });
    });

    // Back button
    const backBtn = document.getElementById('chemaiBackBtn');
    backBtn?.addEventListener('click', () => {
        const toggleBtn = document.getElementById('togglePeriodic');
        if (toggleBtn) toggleBtn.click();
    });

    // Click outside sidebar to close (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && chemaiSidebar.classList.contains('active')) {
            if (!chemaiSidebar.contains(e.target) && !chemaiMenuBtn.contains(e.target)) {
                toggleSidebar();
            }
        }
    });
}

/**
 * Handle input change
 */
function handleInputChange() {
    const value = chemaiInput.value.trim();
    sendBtn.disabled = value.length === 0;

    // Auto-resize textarea
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
 * Handle send message
 */
async function handleSendMessage() {
    const message = chemaiInput.value.trim();
    if (!message) return;

    // Disable input
    chemaiInput.disabled = true;
    sendBtn.disabled = true;

    // Hide empty state, show messages
    if (emptyState.style.display !== 'none') {
        emptyState.style.display = 'none';
        messagesContainer.style.display = 'flex';
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

    // Send to API
    const response = await window.ChemAIAPI.sendMessage(
        message,
        window.ChemAIAPI.formatChatHistory(currentMessages),
        model
    );

    // Remove typing indicator
    removeTypingIndicator(typingId);

    // Add AI response
    if (response.success) {
        addMessage(response.message, 'ai', response.model);
    } else {
        addMessage(response.message, 'ai', model, true);
    }

    // Save chat
    await saveChatToFirebase();

    // Re-enable input
    chemaiInput.disabled = false;
    chemaiInput.focus();
}

/**
 * Add message to UI
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
 * Format message content (support markdown-like formatting)
 */
function formatMessageContent(content) {
    // Escape HTML
    let formatted = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    // Bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code
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
 * Toggle sidebar (mobile)
 */
function toggleSidebar() {
    chemaiSidebar.classList.toggle('active');
}

/**
 * Select model
 */
function selectModel(modelId) {
    // Check if Models module is loaded
    if (!window.ChemAIModels) {
        console.warn('⚠️ ChemAIModels not loaded yet');
        return;
    }

    window.ChemAIModels.setCurrentModel(modelId);

    // Update UI
    modelBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.model === modelId);
    });

    console.log('✅ Model selected:', modelId);
}

/**
 * Create new chat
 */
function createNewChat() {
    currentChatId = null;
    currentMessages = [];

    // Clear messages
    messagesContainer.innerHTML = '';
    messagesContainer.style.display = 'none';
    emptyState.style.display = 'flex';

    // Update chat history UI
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });

    // Close sidebar on mobile
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

    // Clear and show messages
    messagesContainer.innerHTML = '';
    messagesContainer.style.display = 'flex';
    emptyState.style.display = 'none';

    // Add messages
    currentMessages.forEach(msg => {
        addMessageToUI(msg);
    });

    // Update active chat
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.toggle('active', item.dataset.chatId === chatId);
    });

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }

    console.log('✅ Chat loaded:', chatId);
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

    // Generate chat ID if new
    if (!currentChatId) {
        currentChatId = 'chat_' + Date.now();
    }

    // Get chat title (first user message)
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

    // Reload chat history
    await loadChatHistory();
}

/**
 * Load chat history
 */
async function loadChatHistory() {
    // Check if Firebase module is loaded
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

    // Update model selector visibility
    if (defaultModel) {
        modelSelector.style.display = 'none';
        if (window.ChemAIModels) {
            window.ChemAIModels.setCurrentModel(defaultModel);
        }
    } else {
        modelSelector.style.display = 'flex';
    }

    // Save to Firebase
    if (window.ChemAIFirebase) {
        await window.ChemAIFirebase.saveSettings(userSettings);
    }

    // Close modal
    closeSettings();

    console.log('✅ Settings saved:', userSettings);
}

/**
 * Load user settings
 */
async function loadUserSettings() {
    // Check if Firebase module is loaded
    if (!window.ChemAIFirebase) {
        console.warn('⚠️ ChemAIFirebase not loaded yet');
        userSettings = { defaultModel: null, theme: 'dark' };
        modelSelector.style.display = 'flex';
        selectModel('vicuna');
        return;
    }

    const settings = await window.ChemAIFirebase.loadSettings();
    userSettings = settings;

    // Apply settings
    if (settings.defaultModel) {
        modelSelector.style.display = 'none';
        if (window.ChemAIModels) {
            window.ChemAIModels.setCurrentModel(settings.defaultModel);
        }
        selectModel(settings.defaultModel);
    } else {
        modelSelector.style.display = 'flex';
        selectModel('vicuna'); // Default
    }

    console.log('✅ Settings loaded:', settings);
}

/**
 * Format time
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) {
        return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }

    // Less than 7 days
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }

    // More than 7 days
    return date.toLocaleDateString();
}

// Export
window.ChemAIUI = {
    init: initChemAIUI,
    createNewChat,
    loadSpecificChat
};

console.log('✅ ChemAI UI module loaded');
