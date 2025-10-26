/**
 * Modal Swipe Handler - FIXED
 * Proper touch handling to prevent accidental closes
 */

class ModalSwipeHandler {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        if (!this.modal) return;

        this.modalContent = this.modal.querySelector('.modal-content');
        if (!this.modalContent) return;

        this.startY = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.isScrolling = false;

        this.setupTouchHandlers();
    }

    setupTouchHandlers() {
        // Touch start
        this.modalContent.addEventListener('touchstart', (e) => {
            // Only track if touch starts from top area (header)
            const target = e.target;
            const header = this.modal.querySelector('.modal-header');
            
            // If touching scrollable content, don't track swipe
            const scrollableArea = target.closest('.atom-info, .wiki-content, .modal-body, .molecules-list, .reactant-list, .forum-feed, .comments-list');
            
            if (scrollableArea) {
                this.isScrolling = true;
                return;
            }

            // Only allow swipe from header
            if (!header?.contains(target)) {
                return;
            }

            this.startY = e.touches[0].clientY;
            this.isDragging = false;
            this.isScrolling = false;
        }, { passive: true });

        // Touch move
        this.modalContent.addEventListener('touchmove', (e) => {
            if (this.isScrolling) return;

            this.currentY = e.touches[0].clientY;
            const diff = this.currentY - this.startY;

            // Only allow downward swipe
            if (diff > 10) {
                this.isDragging = true;
                
                // Apply transform (max 200px)
                const translateY = Math.min(diff, 200);
                this.modalContent.style.transform = `translateY(${translateY}px)`;
                this.modalContent.style.transition = 'none';
            }
        }, { passive: true });

        // Touch end
        this.modalContent.addEventListener('touchend', () => {
            if (this.isScrolling) {
                this.isScrolling = false;
                return;
            }

            const diff = this.currentY - this.startY;

            // Close if swiped down more than 100px
            if (this.isDragging && diff > 100) {
                this.closeModal();
            } else {
                // Reset position
                this.modalContent.style.transform = '';
                this.modalContent.style.transition = 'transform 0.3s ease';
            }

            this.isDragging = false;
            this.startY = 0;
            this.currentY = 0;
        }, { passive: true });
    }

    closeModal() {
        // Call appropriate close function
        if (this.modal.id === 'elementModal' && typeof closeModal === 'function') {
            closeModal();
        } else if (this.modal.id === 'matterModal' && typeof closeMatterModal === 'function') {
            closeMatterModal();
        } else if (this.modal.id === 'reactantModal' && typeof closeReactantSelector === 'function') {
            closeReactantSelector();
        } else if (this.modal.id === 'create-post-modal' && typeof closeCreatePostModal === 'function') {
            closeCreatePostModal();
        } else if (this.modal.id === 'notification-modal' && typeof closeNotificationModal === 'function') {
            closeNotificationModal();
        }
    }
}

// Initialize modal handlers
function initModalSwipeHandlers() {
    const modals = [
        'elementModal',
        'matterModal',
        'reactantModal',
        'create-post-modal',
        'notification-modal',
        'chemistry-tool-modal',
        'post-reaction-modal',
        'post-molecule-modal'
    ];

    modals.forEach(modalId => {
        new ModalSwipeHandler(modalId);
    });

    console.log('✅ Modal swipe handlers initialized');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalSwipeHandlers);
} else {
    initModalSwipeHandlers();
}

window.initModalSwipeHandlers = initModalSwipeHandlers;
