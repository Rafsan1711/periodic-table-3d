/**
 * Forum/Community Discussion Module
 * Manages posts, interactions, and community features
 */

// Firebase references
let postsRef = null;
let currentForumUser = null;
let allPosts = [];

/**
 * Initialize Forum System
 */
function initForum() {
    if (!firebase.apps.length) {
        console.error('Firebase not initialized');
        return;
    }
    
    postsRef = db.ref('forum/posts');
    
    // Listen to auth state
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentForumUser = user;
            loadForumFeed();
            setupForumEventListeners();
        }
    });
    
    console.log('✅ Forum module initialized');
}

/**
 * Setup event listeners for forum
 */
function setupForumEventListeners() {
    // Create post button
    const createPostBtn = document.getElementById('create-post-btn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', openCreatePostModal);
    }
    
    // Topic filter buttons
    const topicFilters = document.querySelectorAll('.topic-filter-btn');
    topicFilters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const topic = e.target.dataset.topic;
            filterPostsByTopic(topic);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('forum-search');
    if (searchInput) {
        let searchDebounce;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                searchPosts(e.target.value);
            }, 300);
        });
    }
}

/**
 * Load forum feed from Firebase
 */
function loadForumFeed(filter = null) {
    if (!postsRef) return;
    
    const feedContainer = document.getElementById('forum-feed');
    if (!feedContainer) return;
    
    // Show loader
    feedContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="spinner-border text-primary" role="status"></div>
            <p style="color: var(--text-secondary); margin-top: 10px;">Loading posts...</p>
        </div>
    `;
    
    postsRef.orderByChild('timestamp').limitToLast(50).on('value', snapshot => {
        allPosts = [];
        
        if (!snapshot.exists()) {
            feedContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-comments" style="font-size: 4rem; color: var(--text-secondary); opacity: 0.3;"></i>
                    <h3 style="color: var(--text-secondary); margin-top: 20px;">No posts yet</h3>
                    <p style="color: var(--text-secondary); opacity: 0.7;">Be the first to start a discussion!</p>
                </div>
            `;
            return;
        }
        
        snapshot.forEach(childSnapshot => {
            const post = childSnapshot.val();
            post.id = childSnapshot.key;
            allPosts.unshift(post); // Newest first
        });
        
        renderPosts(allPosts, filter);
    });
}

/**
 * Render posts in feed
 */
function renderPosts(posts, filter = null) {
    const feedContainer = document.getElementById('forum-feed');
    if (!feedContainer) return;
    
    let filteredPosts = posts;
    if (filter && filter !== 'all') {
        filteredPosts = posts.filter(p => p.topic === filter);
    }
    
    if (filteredPosts.length === 0) {
        feedContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-filter" style="font-size: 4rem; color: var(--text-secondary); opacity: 0.3;"></i>
                <h3 style="color: var(--text-secondary); margin-top: 20px;">No posts found</h3>
                <p style="color: var(--text-secondary); opacity: 0.7;">Try a different filter</p>
            </div>
        `;
        return;
    }
    
    feedContainer.innerHTML = '';
    
    filteredPosts.forEach((post, index) => {
        const postCard = createPostCard(post, index);
        feedContainer.appendChild(postCard);
    });
    
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

/**
 * Create post card element
 */
function createPostCard(post, index) {
    const card = document.createElement('div');
    card.className = 'forum-post-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', Math.min(index * 50, 300));
    card.setAttribute('data-post-id', post.id);
    
    const timeAgo = getTimeAgo(post.timestamp);
    const topicBadge = getTopicBadge(post.topic);
    const isExpanded = false;
    
    // Truncate description
    const maxLength = 200;
    const shortDesc = post.description.length > maxLength 
        ? post.description.substring(0, maxLength) + '...' 
        : post.description;
    
    card.innerHTML = `
        <div class="post-header">
            <img src="${post.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.authorName)}" 
                 alt="${post.authorName}" class="post-author-pic" />
            <div class="post-author-info">
                <div class="post-author-name">${post.authorName}</div>
                <div class="post-meta">
                    ${topicBadge}
                    <span class="post-time">${timeAgo}</span>
                </div>
            </div>
        </div>
        
        <div class="post-title">${post.title}</div>
        
        <div class="post-description ${!isExpanded ? 'collapsed' : ''}" id="desc-${post.id}">
            ${shortDesc}
        </div>
        ${post.description.length > maxLength ? `
            <button class="see-more-btn" onclick="toggleDescription('${post.id}')">
                See more
            </button>
        ` : ''}
        
        ${post.reactionData ? createReactionEmbed(post.reactionData) : ''}
        ${post.moleculeData ? createMoleculeEmbed(post.moleculeData) : ''}
        
        <div class="post-actions">
            <button class="post-action-btn ${post.likes && post.likes[currentForumUser?.uid] ? 'liked' : ''}" 
                    onclick="toggleLike('${post.id}')">
                <i class="fas fa-thumbs-up"></i>
                <span id="like-count-${post.id}">${Object.keys(post.likes || {}).length}</span>
            </button>
            <button class="post-action-btn" onclick="toggleComments('${post.id}')">
                <i class="fas fa-comment"></i>
                <span>${Object.keys(post.comments || {}).length}</span>
            </button>
        </div>
        
        <div class="post-comments" id="comments-${post.id}" style="display: none;">
            <div class="comments-list" id="comments-list-${post.id}"></div>
            <div class="comment-input-wrapper">
                <input type="text" 
                       class="comment-input" 
                       id="comment-input-${post.id}"
                       placeholder="Write a comment..." />
                <button onclick="submitComment('${post.id}')" class="submit-comment-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Create reaction embed (theatre + equation)
 */
function createReactionEmbed(reactionData) {
    return `
        <div class="reaction-embed" id="reaction-${Date.now()}">
            <div class="reaction-theatre" id="theatre-${Date.now()}"></div>
            <div class="reaction-equation">
                ${formatReactionEquation(reactionData)}
            </div>
        </div>
    `;
}

/**
 * Create molecule 3D embed
 */
function createMoleculeEmbed(moleculeData) {
    return `
        <div class="molecule-embed" id="molecule-${Date.now()}">
            <div class="molecule-3d-viewer" id="viewer-${Date.now()}"></div>
            <div class="molecule-info">
                <strong>${moleculeData.name}</strong>
                <span>${moleculeData.formula}</span>
            </div>
        </div>
    `;
}

/**
 * Format reaction equation with coefficients
 */
function formatReactionEquation(reactionData) {
    let equation = '';
    
    // Reactants
    reactionData.reactants.forEach((reactant, i) => {
        if (i > 0) equation += ' + ';
        const coeff = reactionData.coefficients[i];
        equation += `${coeff > 1 ? coeff : ''}${reactant}`;
    });
    
    equation += ' → ';
    
    // Products
    reactionData.products.forEach((product, i) => {
        if (i > 0) equation += ' + ';
        const coeff = reactionData.productCoefficients[i];
        equation += `${coeff > 1 ? coeff : ''}${product}`;
    });
    
    return `<span class="equation-text">${equation}</span>`;
}

/**
 * Get topic badge HTML
 */
function getTopicBadge(topic) {
    const badges = {
        'elements': '<span class="topic-badge badge-elements">⚛️ Elements</span>',
        'molecules': '<span class="topic-badge badge-molecules">🧪 Molecules</span>',
        'reactions': '<span class="topic-badge badge-reactions">⚗️ Reactions</span>',
        'general': '<span class="topic-badge badge-general">💬 General</span>',
        'help': '<span class="topic-badge badge-help">❓ Help</span>',
        'showcase': '<span class="topic-badge badge-showcase">🌟 Showcase</span>'
    };
    return badges[topic] || badges['general'];
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
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

/**
 * Toggle description expand/collapse
 */
function toggleDescription(postId) {
    const descEl = document.getElementById('desc-' + postId);
    const btn = event.target;
    
    if (descEl.classList.contains('collapsed')) {
        // Find full description from allPosts
        const post = allPosts.find(p => p.id === postId);
        if (post) {
            descEl.textContent = post.description;
            descEl.classList.remove('collapsed');
            btn.textContent = 'See less';
        }
    } else {
        const post = allPosts.find(p => p.id === postId);
        if (post) {
            const shortDesc = post.description.substring(0, 200) + '...';
            descEl.textContent = shortDesc;
            descEl.classList.add('collapsed');
            btn.textContent = 'See more';
        }
    }
}

/**
 * Toggle like on post
 */
async function toggleLike(postId) {
    if (!currentForumUser) return;
    
    const postRef = db.ref(`forum/posts/${postId}/likes/${currentForumUser.uid}`);
    const snapshot = await postRef.once('value');
    
    if (snapshot.exists()) {
        // Unlike
        await postRef.remove();
    } else {
        // Like
        await postRef.set(true);
    }
    
    // Update UI
    updateLikeButton(postId);
}

/**
 * Update like button UI
 */
async function updateLikeButton(postId) {
    const postRef = db.ref(`forum/posts/${postId}/likes`);
    const snapshot = await postRef.once('value');
    const likes = snapshot.val() || {};
    
    const likeCountEl = document.getElementById('like-count-' + postId);
    if (likeCountEl) {
        likeCountEl.textContent = Object.keys(likes).length;
    }
    
    const btn = document.querySelector(`[onclick="toggleLike('${postId}')"]`);
    if (btn) {
        if (likes[currentForumUser?.uid]) {
            btn.classList.add('liked');
        } else {
            btn.classList.remove('liked');
        }
    }
}

/**
 * Toggle comments section
 */
function toggleComments(postId) {
    const commentsEl = document.getElementById('comments-' + postId);
    if (!commentsEl) return;
    
    if (commentsEl.style.display === 'none') {
        commentsEl.style.display = 'block';
        loadComments(postId);
    } else {
        commentsEl.style.display = 'none';
    }
}

/**
 * Load comments for a post
 */
async function loadComments(postId) {
    const commentsRef = db.ref(`forum/posts/${postId}/comments`);
    const snapshot = await commentsRef.once('value');
    
    const commentsList = document.getElementById('comments-list-' + postId);
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    if (!snapshot.exists()) {
        commentsList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">No comments yet</p>';
        return;
    }
    
    const comments = [];
    snapshot.forEach(child => {
        comments.push({id: child.key, ...child.val()});
    });
    
    comments.sort((a, b) => a.timestamp - b.timestamp);
    
    comments.forEach(comment => {
        const commentEl = createCommentElement(comment);
        commentsList.appendChild(commentEl);
    });
}

/**
 * Create comment element
 */
function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    
    div.innerHTML = `
        <img src="${comment.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.authorName)}" 
             alt="${comment.authorName}" class="comment-author-pic" />
        <div class="comment-content">
            <div class="comment-author">${comment.authorName}</div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-time">${getTimeAgo(comment.timestamp)}</div>
        </div>
    `;
    
    return div;
}

/**
 * Submit comment
 */
async function submitComment(postId) {
    if (!currentForumUser) return;
    
    const input = document.getElementById('comment-input-' + postId);
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    const commentData = {
        authorId: currentForumUser.uid,
        authorName: currentForumUser.displayName || 'Anonymous',
        authorPhoto: currentForumUser.photoURL || '',
        text: text,
        timestamp: Date.now()
    };
    
    await db.ref(`forum/posts/${postId}/comments`).push(commentData);
    
    input.value = '';
    loadComments(postId);
}

/**
 * Filter posts by topic
 */
function filterPostsByTopic(topic) {
    // Update active button
    document.querySelectorAll('.topic-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderPosts(allPosts, topic);
}

/**
 * Search posts
 */
function searchPosts(query) {
    if (!query) {
        renderPosts(allPosts);
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = allPosts.filter(post => {
        return post.title.toLowerCase().includes(lowerQuery) ||
               post.description.toLowerCase().includes(lowerQuery) ||
               post.authorName.toLowerCase().includes(lowerQuery);
    });
    
    renderPosts(filtered);
}

// Global functions for inline onclick handlers
window.toggleDescription = toggleDescription;
window.toggleLike = toggleLike;
window.toggleComments = toggleComments;
window.submitComment = submitComment;

console.log('✅ Forum main module loaded');
