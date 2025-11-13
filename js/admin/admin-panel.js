/**
 * ============================================
 * ADMIN PANEL MODULE - COMPLETE FINAL VERSION
 * Only accessible to samiulhaquerafsan@gmail.com
 * ============================================
 */

let isAdmin = false;
let pendingRequestsCount = 0;
let adminCheckInterval = null;

/**
 * CRITICAL FIX: Force show admin button
 */
function forceShowAdminButton() {
    const adminBtn = document.getElementById('admin-panel-btn');
    if (!adminBtn) {
        console.warn('⚠️ Admin button element not found in DOM');
        return false;
    }
    
    // Check if user is logged in and is admin
    if (typeof currentForumUser !== 'undefined' && currentForumUser) {
        const userEmail = currentForumUser.email;
        console.log('🔍 Checking admin status for:', userEmail);
        
        if (userEmail === 'samiulhaquerafsan@gmail.com') {
            isAdmin = true;
            adminBtn.style.display = 'block';
            adminBtn.style.visibility = 'visible';
            adminBtn.style.opacity = '1';
            console.log('✅ ADMIN BUTTON SHOWN FOR:', userEmail);
            
            // Stop checking
            if (adminCheckInterval) {
                clearInterval(adminCheckInterval);
                adminCheckInterval = null;
            }
            
            // Load pending requests
            loadPendingRequestsCount();
            
            // Listen for new requests
            if (typeof db !== 'undefined') {
                db.ref('adminRequests/usernameChanges')
                    .orderByChild('status')
                    .equalTo('pending')
                    .on('value', () => {
                        loadPendingRequestsCount();
                    });
            }
            
            return true;
        } else {
            console.log('❌ User is not admin:', userEmail);
            adminBtn.style.display = 'none';
            return false;
        }
    } else {
        console.log('⏳ currentForumUser not ready yet...');
        return false;
    }
}

/**
 * Start interval to check for admin
 */
function startAdminCheck() {
    console.log('🔄 Starting admin check interval...');
    
    // Check immediately
    if (forceShowAdminButton()) {
        return;
    }
    
    // Check every 500ms until user loads
    let attempts = 0;
    adminCheckInterval = setInterval(() => {
        attempts++;
        console.log(`🔍 Admin check attempt ${attempts}...`);
        
        if (forceShowAdminButton()) {
            clearInterval(adminCheckInterval);
            adminCheckInterval = null;
        }
        
        // Stop after 30 attempts (15 seconds)
        if (attempts >= 30) {
            clearInterval(adminCheckInterval);
            adminCheckInterval = null;
            console.log('⏹️ Stopped admin check - max attempts reached');
        }
    }, 500);
}

/**
 * Check if current user is admin (Legacy function)
 */
function checkAdminStatus() {
    return forceShowAdminButton();
}

/**
 * Load pending requests count
 */
async function loadPendingRequestsCount() {
    if (typeof db === 'undefined') return;
    
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
        
        console.log('📊 Pending requests:', pendingRequestsCount);
        
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
    if (!modal) {
        console.error('❌ Admin panel modal not found in HTML');
        alert('Admin panel modal not found. Please check HTML setup.');
        return;
    }
    
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
    if (!listEl) {
        console.error('❌ Username requests list element not found');
        return;
    }
    
    listEl.innerHTML = '<div style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin" style="font-size:2.5rem;color:var(--accent-blue);"></i><p style="color:var(--text-secondary);margin-top:15px;">Loading requests...</p></div>';
    
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
        
        console.log('✅ Loaded', requests.length, 'pending requests');
        
    } catch (error) {
        console.error('Error loading requests:', error);
        listEl.innerHTML = '<div style="color:var(--accent-red);padding:20px;text-align:center;"><i class="fas fa-exclamation-triangle"></i><p>Error loading requests</p></div>';
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
                    <h4>${escapeHtml(request.currentName)}</h4>
                    <p>${escapeHtml(request.userEmail)}</p>
                </div>
            </div>
            <div class="request-timestamp">
                <i class="fas fa-clock"></i> ${timeAgo}
            </div>
        </div>
        
        <div class="request-body">
            <div class="name-change-display">
                <div class="old-name">${escapeHtml(request.currentName)}</div>
                <div class="arrow-icon">→</div>
                <div class="new-name">${escapeHtml(request.requestedName)}</div>
            </div>
        </div>
        
        <div class="request-actions">
            <button class="decline-btn" onclick="declineUsernameRequest('${request.id}', '${request.userId}')">
                <i class="fas fa-times"></i> Decline
            </button>
            <button class="approve-btn" onclick="approveUsernameRequest('${request.id}', '${request.userId}', '${escapeHtml(request.requestedName)}')">
                <i class="fas fa-check"></i> Approve
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
            fromUserName: 'Admin',
            fromUserPhoto: '',
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
            fromUserName: 'Admin',
            fromUserPhoto: '',
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
    
    listEl.innerHTML = '<div style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin" style="font-size:2.5rem;color:var(--accent-blue);"></i><p style="color:var(--text-secondary);margin-top:15px;">Loading users...</p></div>';
    
    try {
        const snapshot = await db.ref('users').once('value');
        
        if (!snapshot.exists()) {
            listEl.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><h4>No Users</h4></div>';
            return;
        }
        
        listEl.innerHTML = '';
        let userCount = 0;
        
        snapshot.forEach(child => {
            const user = child.val();
            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username || 'User')}" 
                     alt="${user.username || 'User'}" 
                     class="user-card-photo">
                <h4>${user.username || 'User'}</h4>
                <p>${user.email}</p>
                <p style="font-size:0.75rem;margin-top:8px;opacity:0.7;">
                    <i class="fas fa-clock"></i> ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
            `;
            listEl.appendChild(card);
            userCount++;
        });
        
        console.log('✅ Loaded', userCount, 'users');
        
    } catch (error) {
        console.error('Error loading users:', error);
        listEl.innerHTML = '<div style="color:var(--accent-red);padding:20px;text-align:center;"><i class="fas fa-exclamation-triangle"></i><p>Error loading users</p></div>';
    }
}

/**
 * Initialize admin panel
 */
function initAdminPanel() {
    console.log('🛡️ Initializing admin panel...');
    
    // Check if button exists in HTML
    const adminBtn = document.getElementById('admin-panel-btn');
    if (!adminBtn) {
        console.error('❌ CRITICAL: Admin button (#admin-panel-btn) not found in HTML!');
        console.log('💡 Make sure you added the admin button HTML in page toggle section');
        return;
    }
    
    console.log('✅ Admin button found in DOM');
    
    // Add click handler
    adminBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openAdminPanel();
    });
    
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
    } else {
        console.warn('⚠️ Admin panel modal not found in HTML');
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
    
    // Start checking for admin status
    startAdminCheck();
    
    console.log('✅ Admin panel initialized - checking for admin user...');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded - waiting 1 second before init...');
    setTimeout(() => {
        initAdminPanel();
    }, 1000);
});

// CRITICAL: Check when auth state changes
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('🔐 Auth state changed - User logged in:', user.email);
            setTimeout(() => {
                forceShowAdminButton();
            }, 1500);
        } else {
            console.log('🔐 Auth state changed - User logged out');
            isAdmin = false;
            const adminBtn = document.getElementById('admin-panel-btn');
            if (adminBtn) {
                adminBtn.style.display = 'none';
            }
        }
    });
}

// Make functions globally available
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.approveUsernameRequest = approveUsernameRequest;
window.declineUsernameRequest = declineUsernameRequest;
window.checkAdminStatus = checkAdminStatus;
window.forceShowAdminButton = forceShowAdminButton;

console.log('✅ Admin panel module loaded - COMPLETE FINAL VERSION');
console.log('📧 Admin email configured: samiulhaquerafsan@gmail.com');
