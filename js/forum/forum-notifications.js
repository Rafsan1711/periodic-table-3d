/**
 * Forum Notifications Module
 * Handles real-time notifications for likes, comments, etc.
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
        }
    });
    
    // Load existing notifications
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
        notifications.unshift(notif); // Newest first
        if (!notif.read) unreadCount++;
    });
    
    updateNotificationBadge();
    
    notifications.forEach(notif => {
        const notifEl = createNotificationElement(notif);
        notificationsList.appendChild(notifEl);
    });
}

/**
 * Create notification element
 */
function createNotificationElement(notif) {
    const div = document.createElement('div');
    div.className = `notification-item ${notif.read ? 'read' : 'unread'}`;
    
    let icon = '🔔';
    let action = '';
    
    switch(notif.type) {
        case 'like':
            icon = '👍';
            action = 'liked your post';
            break;
        case 'comment':
            icon = '💬';
            action = 'commented on your post';
            break;
        case 'reply':
            icon = '↩️';
            action = 'replied to your comment';
            break;
        case 'mention':
            icon = '@';
            action = 'mentioned you';
            break;
    }
    
    div.innerHTML = `
        <div class="notif-icon">${icon}</div>
        <div class="notif-content">
            <div class="notif-text">
                <strong>${notif.fromUserName}</strong> ${action}
                ${notif.postTitle ? `<br><span class="notif-post-title">"${notif.postTitle}"</span>` : ''}
            </div>
            <div class="notif-time">${getTimeAgo(notif.timestamp)}</div>
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

console.log('✅ Forum notifications module loaded');
