/**
 * Forum Like Fix - No Refresh on Like
 * Updates UI instantly without reloading posts
 */

/**
 * FIXED: Toggle like without refreshing all posts
 */
async function toggleLike(postId) {
    if (!currentForumUser) return;
    
    const likeBtn = document.querySelector(`[onclick="toggleLike('${postId}')"]`);
    const likeCountEl = document.getElementById('like-count-' + postId);
    
    if (!likeBtn || !likeCountEl) return;
    
    // Optimistic UI update
    const isLiked = likeBtn.classList.contains('liked');
    const currentCount = parseInt(likeCountEl.textContent) || 0;
    
    // Update UI immediately
    if (isLiked) {
        likeBtn.classList.remove('liked');
        likeCountEl.textContent = Math.max(0, currentCount - 1);
    } else {
        likeBtn.classList.add('liked');
        likeCountEl.textContent = currentCount + 1;
    }
    
    // Disable button temporarily
    likeBtn.disabled = true;
    
    try {
        // Update Firebase
        const postRef = db.ref(`forum/posts/${postId}/likes/${currentForumUser.uid}`);
        
        if (isLiked) {
            await postRef.remove();
        } else {
            await postRef.set(true);
            
            // Send notification (only if liking)
            const post = allPosts.find(p => p.id === postId);
            if (post && post.authorId !== currentForumUser.uid) {
                await sendNotification(post.authorId, 'like', {
                    postId: postId,
                    postTitle: post.title
                });
            }
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        
        // Revert UI on error
        if (isLiked) {
            likeBtn.classList.add('liked');
            likeCountEl.textContent = currentCount;
        } else {
            likeBtn.classList.remove('liked');
            likeCountEl.textContent = Math.max(0, currentCount - 1);
        }
    } finally {
        likeBtn.disabled = false;
    }
}

/**
 * FIXED: Like comment without refreshing
 */
async function likeComment(postId, commentId) {
    if (!currentForumUser) return;
    
    try {
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
        
        // Only reload comments, not entire feed
        loadComments(postId);
    } catch (error) {
        console.error('Error liking comment:', error);
    }
}

// Export functions
window.toggleLike = toggleLike;
window.likeComment = likeComment;

console.log('✅ Forum like fix loaded (no refresh)');
