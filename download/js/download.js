/**
 * Download Page Script - 100% Real-Time
 * No fake data, all numbers from Firebase RTDB
 */

// Firebase Configuration (same as main app)
const firebaseConfig = {
    apiKey: "AIzaSyBW6jjj-SYrPBBoP7HtDFZrh1IfchI8XMg",
    authDomain: "periodic-table-4f7de.firebaseapp.com",
    databaseURL: "https://periodic-table-4f7de-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "periodic-table-4f7de",
    storageBucket: "periodic-table-4f7de.firebasestorage.app",
    messagingSenderId: "835795684207",
    appId: "1:835795684207:web:1f164c847fbc46a637f69a"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

// APK Path from assets folder
const APK_PATH = 'assets/periodic-table-3d_v1.0.0.apk';

/**
 * Load ALL real-time statistics from Firebase
 */
async function loadRealTimeStats() {
    try {
        // Listen to downloads count (real-time)
        db.ref('downloads/total').on('value', (snapshot) => {
            const total = snapshot.val() || 0;
            animateCounter('totalDownloads', total);
        });
        
        // Listen to average rating (real-time)
        db.ref('ratings/average').on('value', (snapshot) => {
            const avg = snapshot.val() || 0;
            const ratingEl = document.getElementById('averageRating');
            ratingEl.textContent = avg > 0 ? avg.toFixed(1) : 'N/A';
        });
        
        // Listen to active users count (real-time)
        db.ref('users/total').on('value', (snapshot) => {
            const users = snapshot.val() || 0;
            const usersEl = document.getElementById('activeUsers');
            usersEl.textContent = formatNumber(users);
        });
        
    } catch (error) {
        console.error('Error loading stats:', error);
        // Show error state
        document.getElementById('totalDownloads').textContent = 'Error';
        document.getElementById('averageRating').textContent = 'Error';
        document.getElementById('activeUsers').textContent = 'Error';
    }
}

/**
 * Animate counter with smooth transition
 */
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const currentText = element.textContent.trim();
    
    // Skip if loading spinner is still there
    if (currentText === '' || element.querySelector('.loading-spinner')) {
        element.textContent = formatNumber(targetValue);
        return;
    }
    
    // Parse current value
    let currentValue = 0;
    if (currentText !== 'N/A' && currentText !== 'Error') {
        currentValue = parseFormattedNumber(currentText);
    }
    
    // Animate from current to target
    const duration = 1000;
    const steps = 30;
    const increment = (targetValue - currentValue) / steps;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        currentValue += increment;
        
        if (step >= steps) {
            element.textContent = formatNumber(targetValue);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(currentValue));
        }
    }, duration / steps);
}

/**
 * Parse formatted number (1.5K, 2.3M) back to number
 */
function parseFormattedNumber(str) {
    str = str.toString().toUpperCase();
    if (str.endsWith('K')) {
        return parseFloat(str) * 1000;
    }
    if (str.endsWith('M')) {
        return parseFloat(str) * 1000000;
    }
    return parseFloat(str) || 0;
}

/**
 * Format number with K/M suffix
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Download app for specific platform
 */
async function downloadApp(platform) {
    if (platform !== 'android') {
        showNotification('This platform is coming soon!', 'info');
        return;
    }
    
    // Show download modal
    showDownloadModal();
    
    try {
        // Increment download count in Firebase
        await incrementDownloadCount(platform);
        
        // Simulate download progress
        simulateDownload();
        
        // Start actual download after 2 seconds
        setTimeout(() => {
            // Create download link
            const link = document.createElement('a');
            link.href = APK_PATH;
            link.download = 'periodic-table-3d_v1.0.0.apk';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Close modal after download starts
            setTimeout(() => {
                closeDownloadModal();
                showThankYouMessage();
            }, 1000);
        }, 2000);
        
    } catch (error) {
        console.error('Download error:', error);
        closeDownloadModal();
        showNotification('Download failed. Please try again.', 'error');
    }
}

/**
 * Increment download count in Firebase RTDB (Real-time)
 */
async function incrementDownloadCount(platform) {
    const timestamp = Date.now();
    
    // Use transaction for atomic increment
    await db.ref('downloads/total').transaction((current) => {
        return (current || 0) + 1;
    });
    
    // Increment platform-specific count
    await db.ref(`downloads/platforms/${platform}`).transaction((current) => {
        return (current || 0) + 1;
    });
    
    // Add download log
    await db.ref(`downloads/logs/${timestamp}`).set({
        platform: platform,
        timestamp: timestamp,
        userAgent: navigator.userAgent,
        country: 'Unknown' // You can add geo-location later
    });
    
    console.log('✅ Download tracked successfully');
}

/**
 * Show download modal
 */
function showDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close download modal
 */
function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset progress
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').textContent = 'Preparing download...';
}

/**
 * Simulate download progress
 */
function simulateDownload() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            progressText.textContent = 'Download starting...';
        }
        
        progressBar.style.width = progress + '%';
        progressText.textContent = `Preparing download... ${Math.floor(progress)}%`;
    }, 200);
}

/**
 * Show thank you message
 */
function showThankYouMessage() {
    const toast = document.createElement('div');
    toast.className = 'thank-you-toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div>
            <strong>Download Started!</strong>
            <p>Thank you for downloading Periodic Table 3D</p>
        </div>
    `;
    
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        animation: slideInRight 0.5s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
    
    // Add CSS animations if not exists
    if (!document.getElementById('toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(400px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(400px);
                }
            }
            
            .thank-you-toast i {
                font-size: 2rem;
            }
            
            .thank-you-toast strong {
                font-size: 1.1rem;
                display: block;
                margin-bottom: 5px;
            }
            
            .thank-you-toast p {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.9;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const colors = {
        success: 'var(--accent-green)',
        error: 'var(--accent-red)',
        info: 'var(--accent-blue)'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

/**
 * Detect user's platform and highlight
 */
function detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) {
        highlightPlatform('android');
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
        highlightPlatform('ios');
    } else if (/windows/.test(userAgent)) {
        highlightPlatform('windows');
    } else if (/mac/.test(userAgent)) {
        highlightPlatform('macos');
    } else if (/linux/.test(userAgent)) {
        highlightPlatform('linux');
    }
}

/**
 * Highlight user's platform card
 */
function highlightPlatform(platform) {
    const card = document.querySelector(`[data-platform="${platform}"]`);
    if (card) {
        card.style.border = '2px solid var(--accent-blue)';
        card.style.boxShadow = '0 0 20px rgba(88, 166, 255, 0.3)';
        
        // Add "Recommended for you" badge
        const badge = document.createElement('div');
        badge.className = 'recommended-badge';
        badge.innerHTML = '<i class="fas fa-star"></i> Recommended for you';
        badge.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: linear-gradient(135deg, var(--accent-orange), var(--accent-red));
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        card.appendChild(badge);
    }
}

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
    // Load real-time statistics
    loadRealTimeStats();
    
    // Detect and highlight user's platform
    detectPlatform();
    
    // Add click handlers to FAQ items
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isOpen = answer.style.display === 'block';
            
            // Close all other answers
            document.querySelectorAll('.faq-answer').forEach(a => {
                a.style.display = 'none';
            });
            
            // Toggle current answer
            answer.style.display = isOpen ? 'none' : 'block';
        });
    });
    
    // Close modal on outside click
    const modal = document.getElementById('downloadModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDownloadModal();
        }
    });
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDownloadModal();
        }
    });
    
    console.log('✅ Download page initialized with real-time stats');
});

// Make functions global
window.downloadApp = downloadApp;
window.closeDownloadModal = closeDownloadModal;
