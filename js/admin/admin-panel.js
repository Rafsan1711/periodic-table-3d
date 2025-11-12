/**
 * Admin Panel Module - Complete Username Approval System
 * Only accessible to admin@gmail.com
 */

let isAdmin = false;
let pendingRequestsCount = 0;

/**
 * Check if current user is admin
 */
function checkAdminStatus() {
    if (!currentForumUser) return false;
    
    const adminEmail = 'samiulhaquerafsan@gmail.com';
    isAdmin = currentForumUser.email === adminEmail;
    
    // Show/hide admin button
    const adminBtn = document.getElementById('admin-panel-btn');
    if (adminBtn) {
        adminBtn.style.display = isAdmin ? 'block' : 'none';
    }
    
    if (isAdmin) {
        console.log('🛡️ Admin privileges granted');
        loadPendingRequestsCount();
        
        // Listen for new requests
        db.ref('adminRequests/usernameChanges')
            .orderByChild('status')
            .equalTo('pending')
            .on('value', () => {
                loadPendingRequestsCount();
            });
    }
    
    return isAdmin;
}

/**
 * Load pending requests count
 */
async function loadPendingRequestsCount() {
    try {
        const snapshot = await db.ref('adminRequests/usernameChanges')
            .orderByChild('status')
            .equalTo('pending')
            .once('value');
        
        pendingRequestsCount = snapshot.numChildren();
        
        // Update badges
        const adminBadge = document.getElementById('admin-badge');
        const requestCountBadge = document.getElementById('username-request-count');
        
        if (adminBadge) {
            if (pendingRequestsCount > 0) {
                adminBadge.textContent = pendingRequestsCount;
                adminBadge.style.display = 'block';
            } else {
                adminBadge.style.display = 'none';
            }
        }
        
        if (requestCountBadge) {
            requestCountBadge.textContent = pendingRequestsCount;
        }
        
    } catch (error) {
        console.error('Error loading requests count:', error);
    }
}

/**
 * Open admin panel
 */
function openAdminPanel() {
    if (!isAdmin) {
        alert('Access denied. Admin privileges required.');
        return;
    }
    
    const modal = document.getElementById('admin-panel-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load username requests
    loadUsernameRequests();
    
    console.log('🛡️ Admin panel opened');
}

/**
 * Close admin panel
 */
function closeAdminPanel() {
    const modal = document.getElementById('admin-panel-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Load username change requests
 */
async function loadUsernameRequests() {
    const listEl = document.getElementById('username-requests-list');
    if (!listEl) return;
    
    listEl.innerHTML = '<div style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--accent-blue);"></i></div>';
    
    try {
        const snapshot = await db.ref('adminRequests/usernameChanges')
            .orderByChild('timestamp')
            .once('value');
        
        if (!snapshot.exists()) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h4>No Requests</h4>
                    <p>All username change requests have been processed</p>
                </div>
            `;
            return;
        }
        
        const requests = [];
        snapshot.forEach(child => {
            const request = child.val();
            if (request.status === 'pending') {
                requests.push({
                    id: child.key,
                    ...request
                });
            }
        });
        
        // Sort by newest first
        requests.sort((a, b) => b.timestamp - a.timestamp);
        
        if (requests.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h4>All Caught Up!</h4>
                    <p>No pending username change requests</p>
                </div>
            `;
            return;
        }
        
        listEl.innerHTML = '';
        requests.forEach(request => {
            const card = createRequestCard(request);
            listEl.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading requests:', error);
        listEl.innerHTML = '<div style="color:var(--accent-red);padding:20px;text-align:center;">Error loading requests</div>';
    }
}

/**
 * Create request card element
 */
function createRequestCard(request) {
    const card = document.createElement('div');
    card.className = 'request-card';
    
    const timeAgo = getTimeAgo(request.timestamp);
    
    card.innerHTML = `
        <div class="request-header">
            <div class="request-user-info">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(request.currentName)}&size=100" 
                     alt="${request.currentName}" 
                     class="request-user-photo">
                <div class="request-user-details">
                    <h4>${request.currentName}</h4>
                    <p>${request.userEmail}</p>
                </div>
            </div>
            <div class="request-timestamp">
                <i class="fas fa-clock"></i> ${timeAgo}
            </div>
        </div>
        
        <div class="request-body">
            <div class="name-change-display">
                <div class="old-name">${request.currentName}</div>
                <div class="arrow-icon">→</div>
                <div class="new-name">${request.requestedName}</div>
            </div>
        </div>
        
        <div class="request-actions">
            <button class="decline-btn" onclick="declineUsernameRequest('${request.id}', '${request.userId}')">
                <i class="fas fa-times"></i> Decline
            </button>
            <button class="approve-btn" onclick="approveUsernameRequest('${request.id}', '${request.userId}', '${request.requestedName}')">
                <i class="fas fa-check"></i> Approve
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Approve username change request
 */
async function approveUsernameRequest(requestId, userId, newName) {
    const confirmed = confirm(`Approve username change to "${newName}"?`);
    if (!confirmed) return;
    
    try {
        // Update user's display name in database
        await db.ref(`users/${userId}`).update({
            username: newName
        });
        
        // Update request status
        await db.ref(`adminRequests/usernameChanges/${requestId}`).update({
            status: 'approved',
            approvedAt: Date.now(),
            approvedBy: currentForumUser.uid
        });
        
        // Send notification to user
        await db.ref(`notifications/${userId}`).push({
            type: 'usernameApproved',
            newName: newName,
            timestamp: Date.now(),
            read: false
        });
        
        if (typeof showNotification === 'function') {
            showNotification('✅ Username change approved!', 'success');
        } else {
            alert('✅ Username change approved!');
        }
        
        // Reload requests
        loadUsernameRequests();
        
        console.log('✅ Username approved:', newName);
        
    } catch (error) {
        console.error('Error approving request:', error);
        alert('Failed to approve request: ' + error.message);
    }
}

/**
 * Decline username change request
 */
async function declineUsernameRequest(requestId, userId) {
    const reason = prompt('Reason for declining (optional):');
    
    try {
        // Update request status
        await db.ref(`adminRequests/usernameChanges/${requestId}`).update({
            status: 'declined',
            declinedAt: Date.now(),
            declinedBy: currentForumUser.uid,
            reason: reason || 'No reason provided'
        });
        
        // Send notification to user
        await db.ref(`notifications/${userId}`).push({
            type: 'usernameDeclined',
            reason: reason || 'No reason provided',
            timestamp: Date.now(),
            read: false
        });
        
        if (typeof showNotification === 'function') {
            showNotification('❌ Username change declined', 'info');
        } else {
            alert('❌ Username change declined');
        }
        
        // Reload requests
        loadUsernameRequests();
        
        console.log('❌ Username request declined');
        
    } catch (error) {
        console.error('Error declining request:', error);
        alert('Failed to decline request: ' + error.message);
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

/**
 * Load all users (for admin panel)
 */
async function loadAllUsers() {
    const listEl = document.getElementById('users-list');
    if (!listEl) return;
    
    listEl.innerHTML = '<div style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--accent-blue);"></i></div>';
    
    try {
        const snapshot = await db.ref('users').once('value');
        
        if (!snapshot.exists()) {
            listEl.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><h4>No Users</h4></div>';
            return;
        }
        
        listEl.innerHTML = '';
        snapshot.forEach(child => {
            const user = child.val();
            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username)}" 
                     alt="${user.username}" 
                     class="user-card-photo">
                <h4>${user.username || 'User'}</h4>
                <p>${user.email}</p>
                <p style="font-size:0.75rem;margin-top:8px;opacity:0.7;">
                    <i class="fas fa-clock"></i> Joined ${new Date(user.createdAt).toLocaleDateString()}
                </p>
            `;
            listEl.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        listEl.innerHTML = '<div style="color:var(--accent-red);padding:20px;text-align:center;">Error loading users</div>';
    }
}

/**
 * Initialize admin panel
 */
function initAdminPanel() {
    console.log('🛡️ Initializing admin panel...');
    
    // Admin button click handler
    const adminBtn = document.getElementById('admin-panel-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', openAdminPanel);
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Hide all content
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show target content
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Load content based on tab
                if (targetTab === 'username-requests') {
                    loadUsernameRequests();
                } else if (targetTab === 'users') {
                    loadAllUsers();
                }
            }
        });
    });
    
    // Close on outside click
    const modal = document.getElementById('admin-panel-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'admin-panel-modal') {
                closeAdminPanel();
            }
        });
    }
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const adminModal = document.getElementById('admin-panel-modal');
            if (adminModal && adminModal.classList.contains('active')) {
                closeAdminPanel();
            }
        }
    });
    
    console.log('✅ Admin panel initialized');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initAdminPanel();
    }, 1000);
});

// Check admin status when user logs in
if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged(user => {
        if (user) {
            setTimeout(() => {
                checkAdminStatus();
            }, 1500);
        }
    });
}

// Make functions globally available
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.approveUsernameRequest = approveUsernameRequest;
window.declineUsernameRequest = declineUsernameRequest;
window.checkAdminStatus = checkAdminStatus;

console.log('✅ Admin panel module loaded');
