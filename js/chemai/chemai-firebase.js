/**
 * ============================================
 * CHEMAI FIREBASE MODULE
 * Separate Firebase for ChemAI chats
 * ============================================
 */

// ChemAI Firebase Config (তুমি এখানে তোমার config paste করবে)
const chemaiFirebaseConfig = {
  apiKey: "AIzaSyD9QkbeIywF3HN1bS0A0g2uIRVXOC6q1wM",
  authDomain: "aiva-9abbb.firebaseapp.com",
  databaseURL: "https://aiva-9abbb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aiva-9abbb",
  storageBucket: "aiva-9abbb.firebasestorage.app",
  messagingSenderId: "565052629821",
  appId: "1:565052629821:web:4a0083611ff11011da1b54"
};

// Initialize ChemAI Firebase (separate instance)
let chemaiApp;
let chemaiDb;
let chemaiAuth;

try {
    chemaiApp = firebase.initializeApp(chemaiFirebaseConfig, 'chemaiApp');
    chemaiDb = chemaiApp.database();
    chemaiAuth = chemaiApp.auth();
    console.log('✅ ChemAI Firebase initialized');
} catch (error) {
    console.error('❌ ChemAI Firebase initialization error:', error);
}

/**
 * Get current user ID
 */
function getChemAIUserId() {
    // Use main auth user ID (from existing auth)
    const mainUser = firebase.auth().currentUser;
    return mainUser ? mainUser.uid : null;
}

/**
 * Save chat to Firebase
 */
async function saveChat(chatId, chatData) {
    const userId = getChemAIUserId();
    if (!userId) {
        console.error('❌ No user logged in');
        return null;
    }

    try {
        await chemaiDb.ref(`users/${userId}/chats/${chatId}`).set({
            ...chatData,
            userId: userId,
            updatedAt: Date.now()
        });
        console.log('✅ Chat saved:', chatId);
        return chatId;
    } catch (error) {
        console.error('❌ Error saving chat:', error);
        return null;
    }
}

/**
 * Load all user chats
 */
async function loadUserChats() {
    const userId = getChemAIUserId();
    if (!userId) return [];

    try {
        const snapshot = await chemaiDb.ref(`users/${userId}/chats`)
            .orderByChild('updatedAt')
            .limitToLast(50)
            .once('value');

        const chats = [];
        snapshot.forEach(child => {
            chats.unshift({
                id: child.key,
                ...child.val()
            });
        });

        console.log('✅ Loaded chats:', chats.length);
        return chats;
    } catch (error) {
        console.error('❌ Error loading chats:', error);
        return [];
    }
}

/**
 * Load specific chat
 */
async function loadChat(chatId) {
    const userId = getChemAIUserId();
    if (!userId) return null;

    try {
        const snapshot = await chemaiDb.ref(`users/${userId}/chats/${chatId}`).once('value');
        const chat = snapshot.val();
        
        if (chat) {
            console.log('✅ Chat loaded:', chatId);
            return { id: chatId, ...chat };
        }
        return null;
    } catch (error) {
        console.error('❌ Error loading chat:', error);
        return null;
    }
}

/**
 * Delete chat
 */
async function deleteChat(chatId) {
    const userId = getChemAIUserId();
    if (!userId) return false;

    try {
        await chemaiDb.ref(`users/${userId}/chats/${chatId}`).remove();
        console.log('✅ Chat deleted:', chatId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting chat:', error);
        return false;
    }
}

/**
 * Save user settings
 */
async function saveSettings(settings) {
    const userId = getChemAIUserId();
    if (!userId) return false;

    try {
        await chemaiDb.ref(`users/${userId}/settings`).set({
            ...settings,
            updatedAt: Date.now()
        });
        console.log('✅ Settings saved');
        return true;
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        return false;
    }
}

/**
 * Load user settings
 */
async function loadSettings() {
    const userId = getChemAIUserId();
    if (!userId) return null;

    try {
        const snapshot = await chemaiDb.ref(`users/${userId}/settings`).once('value');
        const settings = snapshot.val();
        console.log('✅ Settings loaded:', settings);
        return settings || { defaultModel: null, theme: 'dark' };
    } catch (error) {
        console.error('❌ Error loading settings:', error);
        return { defaultModel: null, theme: 'dark' };
    }
}

// Export functions
window.ChemAIFirebase = {
    saveChat,
    loadUserChats,
    loadChat,
    deleteChat,
    saveSettings,
    loadSettings,
    getChemAIUserId
};

console.log('✅ ChemAI Firebase module loaded');
