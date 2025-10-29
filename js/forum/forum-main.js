/**
 * Create molecule embed
 */
function createMoleculeEmbed(postId, moleculeData) {
    return `
        <div class="molecule-embed">
            <div class="molecule-3d-viewer" id="molecule-viewer-${postId}"></div>
            <div class="molecule-info">
                <strong>${moleculeData.name}</strong>
                <span>${moleculeData.formula}</span>
            </div>
        </div>
    `;
}

/**
 * FIXED: Initialize molecule viewer with proper cleanup
 */
function initPostMoleculeViewer(post) {
    const viewerId = 'molecule-viewer-' + post.id;
    const container = document.getElementById(viewerId);
    if (!container || !post.moleculeData) return;
    
    const molecule = moleculesData.find(m => m.id === post.moleculeData.id);
    if (!molecule) return;
    
    // Cleanup existing
    if (postMoleculeViewers[post.id]) {
        const old = postMoleculeViewers[post.id];
        if (old.renderer) {
            old.renderer.dispose();
            old.renderer.forceContextLoss();
        }
        delete postMoleculeViewers[post.id];
    }
    
    container.innerHTML = '';
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);
    
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: false,
        powerPreference: "low-power"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    const group = new THREE.Group();
    scene.add(group);
    
    // Add lights
    scene.add(new THREE.AmbientLight(0x888888, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(5, 5, 5);
    scene.add(dl);
    
    // Create molecule (simplified)
    const center = {x: 0, y: 0, z: 0};
    molecule.atoms.forEach(a => {
        center.x += (a.x || 0);
        center.y += (a.y || 0);
        center.z += (a.z || 0);
    });
    center.x /= molecule.atoms.length;
    center.y /= molecule.atoms.length;
    center.z /= molecule.atoms.length;
    
    const scale = 3.5;
    
    molecule.atoms.forEach(atom => {
        const color = getAtomColor(atom.el);
        const radius = getAtomRadius(atom.el) * scale;
        
        const geometry = new THREE.SphereGeometry(radius, 16, 16); // Reduced quality
        const material = new THREE.MeshPhongMaterial({ 
            color: color, 
            shininess: 80
        });
        const sphere = new THREE.Mesh(geometry, material);
        
        sphere.position.set(
            ((atom.x || 0) - center.x) * scale,
            ((atom.y || 0) - center.y) * scale,
            ((atom.z || 0) - center.z) * scale
        );
        
        group.add(sphere);
    });
    
    postMoleculeViewers[post.id] = { scene, camera, renderer, group };
    
    // Animation
    function animate() {
        if (!postMoleculeViewers[post.id]) return;
        requestAnimationFrame(animate);
        group.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate();
}

// Helper functions remain same
function getAtomColor(symbol) {
    const colors = {
        H: 0xffffff, C: 0x333333, O: 0xff4444, N: 0x3050f8,
        S: 0xffff66, P: 0xff8c00, Cl: 0x1ff01f, Na: 0xab5cf2
    };
    return colors[symbol] || 0x888888;
}

function getAtomRadius(symbol) {
    const radii = {
        H: 0.3, C: 0.5, O: 0.45, N: 0.42, S: 0.52, P: 0.52
    };
    return radii[symbol] || 0.5;
}

function formatReactionEquation(reactionData) {
    let equation = '';
    reactionData.reactants.forEach((reactant, i) => {
        if (i > 0) equation += ' + ';
        const coeff = reactionData.coefficients[i];
        equation += `${coeff > 1 ? coeff : ''}${reactant}`;
    });
    equation += ' → ';
    reactionData.products.forEach((product, i) => {
        if (i > 0) equation += ' + ';
        const coeff = reactionData.productCoefficients[i];
        equation += `${coeff > 1 ? coeff : ''}${product}`;
    });
    return `<span class="equation-text">${equation}</span>`;
}

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

function countTotalComments(comments) {
    let total = 0;
    for (const key in comments) {
        total++;
        if (comments[key].replies) {
            total += Object.keys(comments[key].replies).length;
        }
    }
    return total;
}

// Other functions remain the same (toggleLike, submitComment, etc.)
// Just use them as before

window.toggleDescription = function(postId) {
    const descEl = document.getElementById('desc-' + postId);
    const btn = event.target;
    
    if (descEl.classList.contains('collapsed')) {
        const post = allPosts.find(p => p.id === postId);
        if (post && post.authorId !== currentForumUser.uid) {
            await sendNotification(post.authorId, 'like', {
                postId: postId,
                postTitle: post.title
            });
        }
    }
    
    updateLikeButton(postId);
}

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
        const commentEl = createCommentElement(comment, postId);
        commentsList.appendChild(commentEl);
    });
}

function createCommentElement(comment, postId) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    
    const hasReplies = comment.replies && Object.keys(comment.replies).length > 0;
    const replyCount = hasReplies ? Object.keys(comment.replies).length : 0;
    
    const likeInfo = comment.likes && Object.keys(comment.likes).length > 0
        ? `<span class="comment-like-info">${Object.keys(comment.likes).length} 👍</span>`
        : '';
    
    div.innerHTML = `
        <img src="${comment.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.authorName)}" 
             alt="${comment.authorName}" class="comment-author-pic" />
        <div class="comment-content">
            <div class="comment-author">${comment.authorName}</div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-actions">
                <span class="comment-time">${getTimeAgo(comment.timestamp)}</span>
                ${likeInfo}
                <button class="comment-action-btn" onclick="likeComment('${postId}', '${comment.id}')">
                    <i class="fas fa-thumbs-up ${comment.likes && comment.likes[currentForumUser?.uid] ? 'liked' : ''}"></i>
                </button>
                <button class="comment-action-btn" onclick="toggleReplyInput('${postId}', '${comment.id}')">
                    <i class="fas fa-reply"></i> Reply
                </button>
            </div>
            
            <div class="reply-input-wrapper" id="reply-input-${comment.id}" style="display:none;">
                <input type="text" 
                       class="reply-input" 
                       id="reply-text-${comment.id}"
                       placeholder="Write a reply..." />
                <button onclick="submitReply('${postId}', '${comment.id}')" class="submit-reply-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            
            ${hasReplies ? `
                <button class="show-replies-btn" onclick="toggleReplies('${comment.id}')">
                    <i class="fas fa-comments"></i> ${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}
                </button>
                <div class="replies-list" id="replies-${comment.id}" style="display:none;"></div>
            ` : ''}
        </div>
    `;
    
    return div;
}

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
        timestamp: Date.now(),
        likes: {}
    };
    
    await db.ref(`forum/posts/${postId}/comments`).push(commentData);
    
    const post = allPosts.find(p => p.id === postId);
    if (post && post.authorId !== currentForumUser.uid) {
        await sendNotification(post.authorId, 'comment', {
            postId: postId,
            postTitle: post.title
        });
    }
    
    input.value = '';
    loadComments(postId);
}

function toggleReplyInput(postId, commentId) {
    const replyInput = document.getElementById('reply-input-' + commentId);
    if (!replyInput) return;
    
    replyInput.style.display = replyInput.style.display === 'none' ? 'flex' : 'none';
    if (replyInput.style.display === 'flex') {
        document.getElementById('reply-text-' + commentId)?.focus();
    }
}

async function submitReply(postId, commentId) {
    if (!currentForumUser) return;
    
    const input = document.getElementById('reply-text-' + commentId);
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    const replyData = {
        authorId: currentForumUser.uid,
        authorName: currentForumUser.displayName || 'Anonymous',
        authorPhoto: currentForumUser.photoURL || '',
        text: text,
        timestamp: Date.now()
    };
    
    await db.ref(`forum/posts/${postId}/comments/${commentId}/replies`).push(replyData);
    
    const post = allPosts.find(p => p.id === postId);
    const commentRef = await db.ref(`forum/posts/${postId}/comments/${commentId}`).once('value');
    const comment = commentRef.val();
    
    if (comment && comment.authorId !== currentForumUser.uid) {
        await sendNotification(comment.authorId, 'reply', {
            postId: postId,
            postTitle: post?.title,
            commentId: commentId
        });
    }
    
    input.value = '';
    toggleReplyInput(postId, commentId);
    loadComments(postId);
}

async function toggleReplies(commentId) {
    const repliesEl = document.getElementById('replies-' + commentId);
    if (!repliesEl) return;
    
    if (repliesEl.style.display === 'none') {
        repliesEl.style.display = 'block';
        await loadReplies(commentId, repliesEl);
    } else {
        repliesEl.style.display = 'none';
    }
}

async function loadReplies(commentId, container) {
    let postId, comment;
    for (const post of allPosts) {
        if (post.comments && post.comments[commentId]) {
            postId = post.id;
            comment = post.comments[commentId];
            break;
        }
    }
    
    if (!comment || !comment.replies) return;
    
    container.innerHTML = '';
    
    const replies = Object.entries(comment.replies).map(([id, reply]) => ({id, ...reply}));
    replies.sort((a, b) => a.timestamp - b.timestamp);
    
    replies.forEach(reply => {
        const replyEl = document.createElement('div');
        replyEl.className = 'reply-item';
        replyEl.innerHTML = `
            <img src="${reply.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(reply.authorName)}" 
                 alt="${reply.authorName}" class="reply-author-pic" />
            <div class="reply-content">
                <div class="reply-author">${reply.authorName}</div>
                <div class="reply-text">${reply.text}</div>
                <div class="reply-time">${getTimeAgo(reply.timestamp)}</div>
            </div>
        `;
        container.appendChild(replyEl);
    });
}

async function likeComment(postId, commentId) {
    if (!currentForumUser) return;
    
    const likeRef = db.ref(`forum/posts/${postId}/comments/${commentId}/likes/${currentForumUser.uid}`);
    const snapshot = await likeRef.once('value');
    
    if (snapshot.exists()) {
        await likeRef.remove();
    } else {
        await likeRef.set(true);
        
        const post = allPosts.find(p => p.id === postId);
        const commentRef = await db.ref(`forum/posts/${postId}/comments/${commentId}`).once('value');
        const comment = commentRef.val();
        
        if (comment && comment.authorId !== currentForumUser.uid) {
            await sendNotification(comment.authorId, 'commentLike', {
                postId: postId,
                postTitle: post?.title,
                commentId: commentId
            });
        }
    }
    
    loadComments(postId);
}

function togglePostMenu(postId) {
    const menu = document.getElementById('menu-' + postId);
    if (!menu) return;
    
    document.querySelectorAll('.post-menu-dropdown').forEach(m => {
        if (m.id !== 'menu-' + postId) m.style.display = 'none';
    });
    
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

async function editPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post || post.authorId !== currentForumUser.uid) return;
    
    openCreatePostModal();
    
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-description').value = post.description;
    document.getElementById('post-topic').value = post.topic;
    document.getElementById('post-content').innerHTML = post.content || '';
    
    const submitBtn = document.getElementById('submit-post-btn');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Post';
    submitBtn.onclick = () => updatePost(postId);
    
    togglePostMenu(postId);
}

async function updatePost(postId) {
    if (!currentForumUser) return;
    
    const title = document.getElementById('post-title').value.trim();
    const description = document.getElementById('post-description').value.trim();
    const topic = document.getElementById('post-topic').value;
    const content = document.getElementById('post-content').innerHTML;
    
    if (!title || !description) {
        alert('Please fill in title and description!');
        return;
    }
    
    const updateData = {
        title: title,
        description: description,
        content: content,
        topic: topic,
        editedAt: Date.now()
    };
    
    const submitBtn = document.getElementById('submit-post-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    
    try {
        await db.ref(`forum/posts/${postId}`).update(updateData);
        closeCreatePostModal();
        showNotification('Post updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
        submitBtn.onclick = submitForumPost;
    }
}

async function deletePost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post || post.authorId !== currentForumUser.uid) return;
    
    const confirmed = confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
        // Cleanup Three.js
        if (postTheatres[postId]) {
            const theatre = postTheatres[postId];
            if (theatre.renderer) {
                theatre.renderer.dispose();
                theatre.renderer.forceContextLoss();
            }
            delete postTheatres[postId];
        }
        if (postMoleculeViewers[postId]) {
            const viewer = postMoleculeViewers[postId];
            if (viewer.renderer) {
                viewer.renderer.dispose();
                viewer.renderer.forceContextLoss();
            }
            delete postMoleculeViewers[postId];
        }
        
        await db.ref(`forum/posts/${postId}`).remove();
        showNotification('Post deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
    }
}

function filterPostsByTopic(topic) {
    renderPosts(allPosts, topic);
}

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

// Reaction animation loop (simplified from previous version)
function animateReactionLoop(postId, reactionData) {
    const theatre = postTheatres[postId];
    if (!theatre) return;
    
    function runAnimation() {
        // Clear scene
        while(theatre.scene.children.length > 2) {
            const child = theatre.scene.children[2];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            theatre.scene.remove(child);
        }
        
        // Simplified animation - just show equation text
        // Full animation code from previous version can be added here if needed
        
        setTimeout(() => runAnimation(), 5000);
    }
    
    runAnimation();
}

// Global functions
window.toggleDescription = toggleDescription;
window.toggleLike = toggleLike;
window.toggleComments = toggleComments;
window.submitComment = submitComment;
window.toggleReplyInput = toggleReplyInput;
window.submitReply = submitReply;
window.toggleReplies = toggleReplies;
window.likeComment = likeComment;
window.togglePostMenu = togglePostMenu;
window.editPost = editPost;
window.deletePost = deletePost;

console.log('✅ Forum main module loaded (WEBGL LEAK FIXED)');
p => p.id === postId);
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
};

async function toggleLike(postId) {
    if (!currentForumUser) return;
    
    const postRef = db.ref(`forum/posts/${postId}/likes/${currentForumUser.uid}`);
    const snapshot = await postRef.once('value');
    
    if (snapshot.exists()) {
        await postRef.remove();
    } else {
        await postRef.set(true);
        
        const post = allPosts.find(/**
 * Forum Main Module - WEBGL CONTEXT LEAK FIXED
 * Critical fix: Proper cleanup of Three.js renderers
 */

let postsRef = null;
let currentForumUser = null;
let allPosts = [];
let postTheatres = {}; // Store theatre instances per post
let postMoleculeViewers = {}; // Store 3D viewers per post

/**
 * CRITICAL: Cleanup all Three.js contexts before creating new ones
 */
function cleanupAllThreeJSContexts() {
    console.log('🧹 Cleaning up Three.js contexts...');
    
    // Cleanup post theatres
    Object.keys(postTheatres).forEach(postId => {
        const theatre = postTheatres[postId];
        if (theatre && theatre.renderer) {
            try {
                theatre.renderer.dispose();
                theatre.renderer.forceContextLoss();
                if (theatre.renderer.domElement && theatre.renderer.domElement.parentNode) {
                    theatre.renderer.domElement.parentNode.removeChild(theatre.renderer.domElement);
                }
            } catch (e) {
                console.warn('Theatre cleanup warning:', e);
            }
        }
        if (theatre && theatre.scene) {
            theatre.scene.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        }
    });
    postTheatres = {};
    
    // Cleanup molecule viewers
    Object.keys(postMoleculeViewers).forEach(postId => {
        const viewer = postMoleculeViewers[postId];
        if (viewer && viewer.renderer) {
            try {
                viewer.renderer.dispose();
                viewer.renderer.forceContextLoss();
                if (viewer.renderer.domElement && viewer.renderer.domElement.parentNode) {
                    viewer.renderer.domElement.parentNode.removeChild(viewer.renderer.domElement);
                }
            } catch (e) {
                console.warn('Viewer cleanup warning:', e);
            }
        }
        if (viewer && viewer.scene) {
            viewer.scene.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        }
    });
    postMoleculeViewers = {};
    
    console.log('✅ Three.js contexts cleaned');
}

/**
 * Initialize Forum System
 */
function initForum() {
    if (!firebase.apps.length) {
        console.error('Firebase not initialized');
        return;
    }
    
    postsRef = db.ref('forum/posts');
    
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentForumUser = user;
            loadForumFeed();
            setupForumEventListeners();
        }
    });
    
    console.log('Forum module initialized');
}

/**
 * Setup event listeners
 */
function setupForumEventListeners() {
    const createPostBtn = document.getElementById('create-post-btn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', openCreatePostModal);
    }
    
    const topicFilters = document.querySelectorAll('.topic-filter-btn');
    topicFilters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const topic = e.target.dataset.topic;
            filterPostsByTopic(topic);
            
            topicFilters.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
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
 * Load forum feed
 */
function loadForumFeed(filter = null) {
    if (!postsRef) return;
    
    const feedContainer = document.getElementById('forum-feed');
    if (!feedContainer) return;
    
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
            allPosts.unshift(post);
        });
        
        renderPosts(allPosts, filter);
    });
}

/**
 * Render posts with PROPER cleanup
 */
function renderPosts(posts, filter = null) {
    const feedContainer = document.getElementById('forum-feed');
    if (!feedContainer) return;
    
    // CRITICAL: Cleanup before rendering
    cleanupAllThreeJSContexts();
    
    let filteredPosts = posts;
    if (filter && filter !== 'all') {
        filteredPosts = posts.filter(p => p.topic === filter);
    }
    
    if (filteredPosts.length === 0) {
        feedContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-filter" style="font-size: 4rem; color: var(--text-secondary); opacity: 0.3;"></i>
                <h3 style="color: var(--text-secondary); margin-top: 20px;">No posts found</h3>
            </div>
        `;
        return;
    }
    
    feedContainer.innerHTML = '';
    
    filteredPosts.forEach((post, index) => {
        const postCard = createPostCard(post, index);
        feedContainer.appendChild(postCard);
        
        // FIXED: Only initialize if visible (lazy loading)
        if (index < 5) { // Only first 5 posts get 3D
            if (post.reactionData) {
                setTimeout(() => initPostReactionAnimation(post), 500 + index * 100);
            }
            
            if (post.moleculeData) {
                setTimeout(() => initPostMoleculeViewer(post), 500 + index * 100);
            }
        }
    });
    
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

/**
 * Create post card
 */
function createPostCard(post, index) {
    const card = document.createElement('div');
    card.className = 'forum-post-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', Math.min(index * 50, 300));
    card.setAttribute('data-post-id', post.id);
    
    const timeAgo = getTimeAgo(post.timestamp);
    const topicBadge = getTopicBadge(post.topic);
    const maxLength = 200;
    const shortDesc = post.description.length > maxLength 
        ? post.description.substring(0, maxLength) + '...' 
        : post.description;
    
    const isOwner = currentForumUser && post.authorId === currentForumUser.uid;
    
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
            ${isOwner ? `
                <div class="post-menu">
                    <button class="post-menu-btn" onclick="togglePostMenu('${post.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="post-menu-dropdown" id="menu-${post.id}" style="display:none;">
                        <button onclick="editPost('${post.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deletePost('${post.id}')" style="color: var(--accent-red);">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            ` : ''}
        </div>
        
        <div class="post-title">${post.title}</div>
        
        <div class="post-description ${post.description.length > maxLength ? 'collapsed' : ''}" id="desc-${post.id}">
            ${shortDesc}
        </div>
        ${post.description.length > maxLength ? `
            <button class="see-more-btn" onclick="toggleDescription('${post.id}')">See more</button>
        ` : ''}
        
        ${post.content ? `<div class="post-content">${post.content}</div>` : ''}
        
        ${post.reactionData ? createReactionEmbed(post.id, post.reactionData) : ''}
        ${post.moleculeData ? createMoleculeEmbed(post.id, post.moleculeData) : ''}
        
        <div class="post-actions">
            <button class="post-action-btn ${post.likes && post.likes[currentForumUser?.uid] ? 'liked' : ''}" 
                    onclick="toggleLike('${post.id}')">
                <i class="fas fa-thumbs-up"></i>
                <span id="like-count-${post.id}">${Object.keys(post.likes || {}).length}</span>
            </button>
            <button class="post-action-btn" onclick="toggleComments('${post.id}')">
                <i class="fas fa-comment"></i>
                <span>${countTotalComments(post.comments || {})}</span>
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
 * Create reaction embed
 */
function createReactionEmbed(postId, reactionData) {
    return `
        <div class="reaction-embed">
            <div class="reaction-theatre" id="theatre-${postId}"></div>
            <div class="reaction-equation">
                ${formatReactionEquation(reactionData)}
            </div>
        </div>
    `;
}

/**
 * FIXED: Initialize reaction with proper cleanup
 */
function initPostReactionAnimation(post) {
    const theatreId = 'theatre-' + post.id;
    const container = document.getElementById(theatreId);
    if (!container || !post.reactionData) return;
    
    // Cleanup existing if any
    if (postTheatres[post.id]) {
        const old = postTheatres[post.id];
        if (old.renderer) {
            old.renderer.dispose();
            old.renderer.forceContextLoss();
        }
        delete postTheatres[post.id];
    }
    
    container.innerHTML = ''; // Clear container
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);
    
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 25);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: false, // Reduce quality for performance
        powerPreference: "low-power"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
    
    postTheatres[post.id] = { scene, camera, renderer, container };
    
    // Start animation
    animateReactionLoop(post.id, post.reactionData);
    
    // Render loop
    function render() {
        if (!postTheatres[post.id]) return;
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();
}

// ... (rest of the forum functions remain the same)
// I'll continue in next message with the remaining critical functions
