/**
 * Forum Main Module - COMPLETE WITH ALL FEATURES
 * 1. Reaction Builder Integration
 * 2. Reaction Animation Loop in Posts  
 * 3. 3D Molecule Viewer in Posts
 * 4. Reply System (Nested Comments)
 * 6. Detailed Notifications with User Actions
 * 8. Post Edit/Delete
 */

let postsRef = null;
let currentForumUser = null;
let allPosts = [];
let postTheatres = {}; // Store theatre instances per post
let postMoleculeViewers = {}; // Store 3D viewers per post

/**
 * Initialize Forum System
 */
function initForum() {
    if (!firebase.apps.length) {
        console.error('Firebase not initialized');
        return;
    }
    
    postsRef = db.ref('forum/posts');
    
    // ✅ FIXED: Don't set currentForumUser here
    // auth-handler.js already sets it properly with displayName & photoURL
    
    // Just load the forum feed
    if (currentForumUser) {
        console.log('✅ Forum initialized for:', currentForumUser.displayName || currentForumUser.email);
        loadForumFeed();
        setupForumEventListeners();
    } else {
        console.warn('⚠️ Forum initialized but no user yet');
    }
    
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
 * Render posts with all features
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
            </div>
        `;
        return;
    }
    
    feedContainer.innerHTML = '';
    
    filteredPosts.forEach((post, index) => {
        const postCard = createPostCard(post, index);
        feedContainer.appendChild(postCard);
        
        // Initialize reaction animation if exists
        if (post.reactionData) {
            setTimeout(() => initPostReactionAnimation(post), 500);
        }
        
        // Initialize 3D molecule viewer if exists
        if (post.moleculeData) {
            setTimeout(() => initPostMoleculeViewer(post), 500);
        }
    });
    
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

/**
 * Create post card with ALL features
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
 * FEATURE 2: Create reaction embed with looping animation
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
 * FEATURE 2: Initialize reaction animation with loop
 */
function initPostReactionAnimation(post) {
    const theatreId = 'theatre-' + post.id;
    const container = document.getElementById(theatreId);
    if (!container || !post.reactionData) return;
    
    // Create Three.js scene for this post
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);
    
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 25);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
    
    postTheatres[post.id] = { scene, camera, renderer, container };
    
    // Start looping animation
    animateReactionLoop(post.id, post.reactionData);
    
    // Render loop
    function render() {
        if (!postTheatres[post.id]) return;
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();
}

/**
 * FEATURE 2: Reaction animation with pause and loop
 */
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
        
        // Create reactants
        const totalMolecules = reactionData.coefficients.reduce((a, b) => a + b, 0);
        const globalScale = calculateScale(totalMolecules);
        const startPositions = getStartPositions(reactionData.reactants.length);
        
        const reactantGroups = [];
        reactionData.reactants.forEach((reactant, rIdx) => {
            const coefficient = reactionData.coefficients[rIdx];
            const startPos = startPositions[rIdx];
            
            for (let i = 0; i < coefficient; i++) {
                const group = createMoleculeGroup(reactant, globalScale);
                if (group) {
                    const offset = (i - (coefficient - 1) / 2) * (globalScale * 1.5);
                    const offsetX = startPos.y !== 0 ? offset : 0;
                    const offsetY = startPos.x !== 0 ? offset : 0;
                    
                    group.position.set(startPos.x + offsetX, startPos.y + offsetY, startPos.z);
                    theatre.scene.add(group);
                    reactantGroups.push(group);
                }
            }
        });
        
        // Animate to center
        const timeline = gsap.timeline();
        reactantGroups.forEach((group, idx) => {
            timeline.to(group.position, {
                x: 0, y: 0, z: 0,
                duration: 2,
                ease: "power2.inOut",
                delay: idx * 0.1
            }, 0);
            
            timeline.to(group.rotation, {
                y: Math.PI * 4,
                duration: 2
            }, 0);
        });
        
        // Collision
        timeline.call(() => {
            reactantGroups.forEach(group => {
                gsap.to(group.scale, {
                    x: 1.3, y: 1.3, z: 1.3,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 3
                });
                
                setTimeout(() => {
                    group.traverse(child => {
                        if (child.material) {
                            gsap.to(child.material, { opacity: 0, duration: 0.5 });
                        }
                    });
                    setTimeout(() => theatre.scene.remove(group), 500);
                }, 1200);
            });
        });
        
        timeline.to({}, { duration: 1.8 });
        
        // Create products
        timeline.call(() => {
            const totalProducts = reactionData.productCoefficients.reduce((a, b) => a + b, 0);
            let productIndex = 0;
            
            reactionData.products.forEach((product, pIdx) => {
                const coefficient = reactionData.productCoefficients[pIdx];
                
                for (let i = 0; i < coefficient; i++) {
                    const group = createMoleculeGroup(product, globalScale);
                    if (group) {
                        let xPos = 0, yPos = 0;
                        
                        if (totalProducts === 1) {
                            xPos = yPos = 0;
                        } else if (totalProducts === 2) {
                            yPos = (productIndex === 0) ? (globalScale * 1.2) : -(globalScale * 1.2);
                        } else {
                            const angle = (productIndex / totalProducts) * Math.PI * 2;
                            const radius = globalScale * 1.8;
                            xPos = Math.cos(angle) * radius;
                            yPos = Math.sin(angle) * radius;
                        }
                        
                        group.position.set(0, 0, 0);
                        group.scale.set(0.1, 0.1, 0.1);
                        theatre.scene.add(group);
                        
                        gsap.to(group.position, {
                            x: xPos, y: yPos, z: 0,
                            duration: 1,
                            ease: "back.out(1.7)",
                            delay: productIndex * 0.15
                        });
                        
                        gsap.to(group.scale, {
                            x: 1, y: 1, z: 1,
                            duration: 1,
                            ease: "elastic.out(1, 0.5)",
                            delay: productIndex * 0.15
                        });
                        
                        // Continuous rotation
                        gsap.to(group.rotation, {
                            y: "+=6.28318",
                            duration: 4,
                            repeat: -1,
                            ease: "none"
                        });
                        
                        productIndex++;
                    }
                }
            });
        });
        
        // Wait 5 seconds then repeat
        timeline.call(() => {
            setTimeout(() => runAnimation(), 5000);
        });
    }
    
    runAnimation();
}

/**
 * FEATURE 3: Create molecule embed
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
 * FEATURE 3: Initialize 3D molecule viewer in post
 */
function initPostMoleculeViewer(post) {
    const viewerId = 'molecule-viewer-' + post.id;
    const container = document.getElementById(viewerId);
    if (!container || !post.moleculeData) return;
    
    const molecule = moleculesData.find(m => m.id === post.moleculeData.id);
    if (!molecule) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);
    
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    const group = new THREE.Group();
    scene.add(group);
    
    // Add lights
    scene.add(new THREE.AmbientLight(0x888888, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(5, 5, 5);
    scene.add(dl);
    
    // Create molecule structure
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
        
        const geometry = new THREE.SphereGeometry(radius, 24, 24);
        const material = new THREE.MeshPhongMaterial({ 
            color: color, 
            shininess: 80,
            emissive: color,
            emissiveIntensity: 0.3
        });
        const sphere = new THREE.Mesh(geometry, material);
        
        sphere.position.set(
            ((atom.x || 0) - center.x) * scale,
            ((atom.y || 0) - center.y) * scale,
            ((atom.z || 0) - center.z) * scale
        );
        
        group.add(sphere);
    });
    
    // Add bonds
    molecule.bonds.forEach(bond => {
        const a1 = molecule.atoms[bond[0]];
        const a2 = molecule.atoms[bond[1]];
        if (!a1 || !a2) return;
        
        const start = new THREE.Vector3(
            ((a1.x || 0) - center.x) * scale,
            ((a1.y || 0) - center.y) * scale,
            ((a1.z || 0) - center.z) * scale
        );
        const end = new THREE.Vector3(
            ((a2.x || 0) - center.x) * scale,
            ((a2.y || 0) - center.y) * scale,
            ((a2.z || 0) - center.z) * scale
        );
        
        const distance = start.distanceTo(end);
        const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, distance, 12);
        const cylMat = new THREE.MeshPhongMaterial({ color: 0x999999 });
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        cyl.position.copy(mid);
        cyl.lookAt(end);
        cyl.rotateX(Math.PI / 2);
        
        group.add(cyl);
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

/**
 * FEATURE 4: Count total comments including replies
 */
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

/**
 * FEATURE 4: Toggle comments with replies
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
 * FEATURE 4: Load comments with nested replies
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
        const commentEl = createCommentElement(comment, postId);
        commentsList.appendChild(commentEl);
    });
}

/**
 * FEATURE 4 & 6: Create comment element with replies and detailed info
 */
function createCommentElement(comment, postId) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    
    const hasReplies = comment.replies && Object.keys(comment.replies).length > 0;
    const replyCount = hasReplies ? Object.keys(comment.replies).length : 0;
    
    // FEATURE 6: Show like status (who liked with name and time)
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

/**
 * FEATURE 4: Toggle reply input
 */
function toggleReplyInput(postId, commentId) {
    const replyInput = document.getElementById('reply-input-' + commentId);
    if (!replyInput) return;
    
    replyInput.style.display = replyInput.style.display === 'none' ? 'flex' : 'none';
    if (replyInput.style.display === 'flex') {
        document.getElementById('reply-text-' + commentId)?.focus();
    }
}

/**
 * FEATURE 4: Submit reply to comment
 */
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
    
    // FEATURE 6: Send notification
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

/**
 * FEATURE 4: Toggle replies visibility
 */
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

/**
 * FEATURE 4: Load and display replies
 */
async function loadReplies(commentId, container) {
    // Find the post and comment
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

/**
 * FEATURE 6: Like comment with notification
 */
async function likeComment(postId, commentId) {
    if (!currentForumUser) return;
    
    const likeRef = db.ref(`forum/posts/${postId}/comments/${commentId}/likes/${currentForumUser.uid}`);
    const snapshot = await likeRef.once('value');
    
    if (snapshot.exists()) {
        await likeRef.remove();
    } else {
        await likeRef.set(true);
        
        // Send notification
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

/**
 * Submit comment with notification
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
        timestamp: Date.now(),
        likes: {}
    };
    
    await db.ref(`forum/posts/${postId}/comments`).push(commentData);
    
    // FEATURE 6: Send notification to post author
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

/**
 * Toggle like with notification
 */
async function toggleLike(postId) {
    if (!currentForumUser) return;
    
    const postRef = db.ref(`forum/posts/${postId}/likes/${currentForumUser.uid}`);
    const snapshot = await postRef.once('value');
    
    if (snapshot.exists()) {
        await postRef.remove();
    } else {
        await postRef.set(true);
        
        // FEATURE 6: Send notification to post author
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
 * FEATURE 8: Toggle post menu
 */
function togglePostMenu(postId) {
    const menu = document.getElementById('menu-' + postId);
    if (!menu) return;
    
    // Close all other menus
    document.querySelectorAll('.post-menu-dropdown').forEach(m => {
        if (m.id !== 'menu-' + postId) m.style.display = 'none';
    });
    
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

/**
 * FEATURE 8: Edit post
 */
async function editPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post || post.authorId !== currentForumUser.uid) return;
    
    // Open create post modal with existing data
    openCreatePostModal();
    
    // Fill in existing data
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-description').value = post.description;
    document.getElementById('post-topic').value = post.topic;
    document.getElementById('post-content').innerHTML = post.content || '';
    
    // Set edit mode
    const submitBtn = document.getElementById('submit-post-btn');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Post';
    submitBtn.onclick = () => updatePost(postId);
    
    togglePostMenu(postId);
}

/**
 * FEATURE 8: Update post
 */
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

/**
 * FEATURE 8: Delete post with confirmation
 */
async function deletePost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post || post.authorId !== currentForumUser.uid) return;
    
    const confirmed = confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
        // Cleanup Three.js instances
        if (postTheatres[postId]) {
            const theatre = postTheatres[postId];
            if (theatre.renderer) theatre.renderer.dispose();
            delete postTheatres[postId];
        }
        if (postMoleculeViewers[postId]) {
            const viewer = postMoleculeViewers[postId];
            if (viewer.renderer) viewer.renderer.dispose();
            delete postMoleculeViewers[postId];
        }
        
        await db.ref(`forum/posts/${postId}`).remove();
        showNotification('Post deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
    }
}

/**
 * Toggle description expand/collapse
 */
function toggleDescription(postId) {
    const descEl = document.getElementById('desc-' + postId);
    const btn = event.target;
    
    if (descEl.classList.contains('collapsed')) {
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
 * Filter posts by topic
 */
function filterPostsByTopic(topic) {
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

/**
 * Format reaction equation
 */
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

// Helper functions from reaction-animator.js
function calculateScale(totalCount) {
    if (totalCount <= 2) return 5.0;
    if (totalCount === 3) return 4.2;
    if (totalCount === 4) return 3.5;
    if (totalCount <= 6) return 3.0;
    return 2.5;
}

function getStartPositions(count) {
    switch(count) {
        case 1: return [{x: -20, y: 0, z: 0}];
        case 2: return [{x: 20, y: 0, z: 0}, {x: -20, y: 0, z: 0}];
        case 3: return [{x: 20, y: 4, z: 0}, {x: -20, y: 4, z: 0}, {x: 0, y: -20, z: 0}];
        case 4: return [{x: 20, y: 0, z: 0}, {x: -20, y: 0, z: 0}, {x: 0, y: -20, z: 0}, {x: 0, y: 20, z: 0}];
        default:
            const positions = [];
            const radius = 22;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                positions.push({x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: 0});
            }
            return positions;
    }
}

function getAtomColor(symbol) {
    const colors = {
        H: 0xffffff, C: 0x333333, O: 0xff4444, N: 0x3050f8,
        S: 0xffff66, P: 0xff8c00, Cl: 0x1ff01f, Na: 0xab5cf2,
        Fe: 0xb7410e, Cu: 0xd97745, Mg: 0x90ee90, Ca: 0xffa500
    };
    return colors[symbol] || 0x888888;
}

function getAtomRadius(symbol) {
    const radii = {
        H: 0.3, C: 0.5, O: 0.45, N: 0.42, S: 0.52, P: 0.52,
        Cl: 0.58, Na: 0.62, Fe: 0.58, Cu: 0.58, Mg: 0.58, Ca: 0.62
    };
    return radii[symbol] || 0.5;
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

console.log('✅ Forum main module loaded (COMPLETE)');
