/**
 * Forum Notifications Module - COMPLETE
 * FEATURE 6: Detailed notifications with user actions (like "Username Right👍 3hrs ago")
 */

let notificationsRef = null;
let unreadCount = 0;

/**
 * Initialize notifications system
 */
function initNotifications() {
    if (!currentForumUser) return;
    
    notificationsRef = db.ref(`notifications/${currentForumUser.uid}`);
    
    // Listen for new notifications
    notificationsRef.on('child_added', (snapshot) => {
        const notification = snapshot.val();
        if (!notification.read) {
            unreadCount++;
            updateNotificationBadge();
            
            // Show toast for new notification
            if (notification.timestamp > (Date.now() - 5000)) {
                showNotificationToast(notification);
            }
        }
    });
    
    // Listen for changes
    notificationsRef.on('child_changed', () => {
        loadNotifications();
    });
    
    loadNotifications();
    
    console.log('✅ Notifications initialized');
}

/**
 * Update notification badge
 */
function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

/**
 * Load all notifications
 */
async function loadNotifications() {
    if (!notificationsRef) return;
    
    const snapshot = await notificationsRef.orderByChild('timestamp').limitToLast(50).once('value');
    const notificationsList = document.getElementById('notification-list');
    
    if (!notificationsList) return;
    
    notificationsList.innerHTML = '';
    unreadCount = 0;
    
    if (!snapshot.exists()) {
        notificationsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-bell-slash" style="font-size: 3rem; opacity: 0.3;"></i>
                <p style="margin-top: 15px;">No notifications yet</p>
            </div>
        `;
        return;
    }
    
    const notifications = [];
    snapshot.forEach(child => {
        const notif = child.val();
        notif.id = child.key;
        notifications.unshift(notif);
        if (!notif.read) unreadCount++;
    });
    
    updateNotificationBadge();
    
    notifications.forEach(notif => {
        const notifEl = createNotificationElement(notif);
        notificationsList.appendChild(notifEl);
    });
}

/**
 * FEATURE 6: Create detailed notification element
 * Format: "Username Right👍 3hrs ago"
 */
function createNotificationElement(notif) {
    const div = document.createElement('div');
    div.className = `notification-item ${notif.read ? 'read' : 'unread'}`;
    
    let icon = '🔔';
    let actionText = '';
    let emoji = '';
    
    switch(notif.type) {
        case 'like':
            icon = '👍';
            emoji = '👍';
            actionText = 'liked your post';
            break;
        case 'comment':
            icon = '💬';
            emoji = '💬';
            actionText = 'commented on your post';
            break;
        case 'reply':
            icon = '↩️';
            emoji = '↩️';
            actionText = 'replied to your comment';
            break;
        case 'commentLike':
            icon = '👍';
            emoji = '👍';
            actionText = 'liked your comment';
            break;
        case 'mention':
            icon = '@';
            emoji = '@';
            actionText = 'mentioned you';
            break;
    }
    
    // FEATURE 6: Detailed format with action emoji and time
    const timeAgo = getTimeAgo(notif.timestamp);
    
    div.innerHTML = `
        <img src="${notif.fromUserPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(notif.fromUserName)}" 
             alt="${notif.fromUserName}" class="notif-user-pic" />
        <div class="notif-content">
            <div class="notif-text">
                <strong class="notif-username">${notif.fromUserName}</strong>
                <span class="notif-action">${actionText}</span>
                <span class="notif-emoji">${emoji}</span>
                <span class="notif-time-inline">${timeAgo}</span>
            </div>
            ${notif.postTitle ? `
                <div class="notif-post-title">"${notif.postTitle}"</div>
            ` : ''}
        </div>
        ${!notif.read ? '<div class="unread-dot"></div>' : ''}
    `;
    
    // Click to open post and mark as read
    div.addEventListener('click', () => {
        markNotificationAsRead(notif.id);
        if (notif.postId) {
            openPostFromNotification(notif.postId);
        }
    });
    
    return div;
}

/**
 * Show notification toast for new notifications
 */
function showNotificationToast(notif) {
    let actionText = '';
    let emoji = '';
    
    switch(notif.type) {
        case 'like':
            emoji = '👍';
            actionText = 'liked your post';
            break;
        case 'comment':
            emoji = '💬';
            actionText = 'commented on your post';
            break;
        case 'reply':
            emoji = '↩️';
            actionText = 'replied to your comment';
            break;
        case 'commentLike':
            emoji = '👍';
            actionText = 'liked your comment';
            break;
    }
    
    const toast = document.createElement('div');
    toast.className = 'notification-toast-popup';
    toast.innerHTML = `
        <img src="${notif.fromUserPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(notif.fromUserName)}" 
             alt="${notif.fromUserName}" class="toast-user-pic" />
        <div class="toast-content">
            <strong>${notif.fromUserName}</strong> ${actionText} ${emoji}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
    
    // Click to open notification modal
    toast.addEventListener('click', () => {
        openNotificationModal();
        toast.remove();
    });
}

/**
 * Mark notification as read
 */
async function markNotificationAsRead(notifId) {
    if (!notificationsRef) return;
    
    await notificationsRef.child(notifId).update({ read: true });
    unreadCount = Math.max(0, unreadCount - 1);
    updateNotificationBadge();
}

/**
 * Open post from notification
 */
function openPostFromNotification(postId) {
    closeNotificationModal();
    
    // Switch to community page
    const toggleBtn = document.getElementById('toggleCommunity');
    if (toggleBtn) toggleBtn.click();
    
    // Scroll to post
    setTimeout(() => {
        const postCard = document.querySelector(`[data-post-id="${postId}"]`);
        if (postCard) {
            postCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            postCard.style.animation = 'highlight-pulse 2s ease';
            
            // Add temporary highlight
            postCard.style.border = '2px solid var(--accent-blue)';
            setTimeout(() => {
                postCard.style.border = '';
            }, 3000);
        }
    }, 500);
}

/**
 * Send notification to user
 */
async function sendNotification(toUserId, type, data) {
    if (!currentForumUser || toUserId === currentForumUser.uid) return;
    
    const notificationData = {
        type: type,
        fromUserId: currentForumUser.uid,
        fromUserName: currentForumUser.displayName || 'Anonymous',
        fromUserPhoto: currentForumUser.photoURL || '',
        postId: data.postId || null,
        postTitle: data.postTitle || null,
        commentId: data.commentId || null,
        timestamp: Date.now(),
        read: false
    };
    
    await db.ref(`notifications/${toUserId}`).push(notificationData);
}

/**
 * Open notification modal
 */
function openNotificationModal() {
    const modal = document.getElementById('notification-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    loadNotifications();
}

/**
 * Close notification modal
 */
function closeNotificationModal() {
    const modal = document.getElementById('notification-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Mark all as read
 */
async function markAllAsRead() {
    if (!notificationsRef) return;
    
    const snapshot = await notificationsRef.once('value');
    const updates = {};
    
    snapshot.forEach(child => {
        const notif = child.val();
        if (!notif.read) {
            updates[`${child.key}/read`] = true;
        }
    });
    
    if (Object.keys(updates).length > 0) {
        await notificationsRef.update(updates);
        unreadCount = 0;
        updateNotificationBadge();
        loadNotifications();
    }
}

/**
 * Get time ago string
 */
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

// Setup notification bell click handler
document.addEventListener('DOMContentLoaded', () => {
    const bell = document.getElementById('notification-bell');
    if (bell) {
        bell.addEventListener('click', openNotificationModal);
    }
});

// Global functions
window.openNotificationModal = openNotificationModal;
window.closeNotificationModal = closeNotificationModal;
window.initNotifications = initNotifications;
window.sendNotification = sendNotification;
window.markAllAsRead = markAllAsRead;

console.log('✅ Forum notifications module loaded (COMPLETE with Feature 6)');
