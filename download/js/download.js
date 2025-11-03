/**
 * Download Page Script - Real-Time Firebase Integration
 * All data is fetched from Firebase Realtime Database
 */

// Firebase Configuration
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

/**
 * Load ALL statistics from Firebase in real-time
 */
async function loadAllStats() {
    try {
        // Load total downloads
        db.ref('downloads/total').on('value', (snapshot) => {
            const total = snapshot.val() || 0;
            document.getElementById('totalDownloads').textContent = formatNumber(total);
        });

        // Load average rating
        db.ref('ratings').once('value', (snapshot) => {
            const ratings = snapshot.val();
            if (ratings) {
                const ratingArray = Object.values(ratings);
                const avgRating = ratingArray.reduce((a, b) => a + b, 0) / ratingArray.length;
                document.getElementById('avgRating').textContent = avgRating.toFixed(1);
            } else {
                // No ratings yet
                document.getElementById('avgRating').textContent = '—';
            }
        });

        // Load total users (real user count from Firebase Authentication or custom counter)
        db.ref('users/count').on('value', (snapshot) => {
            const userCount = snapshot.val() || 0;
            document.getElementById('totalUsers').textContent = formatNumber(userCount);
        });

    } catch (error) {
        console.error('Error loading stats:', error);
        // Show error state
        document.getElementById('totalDownloads').textContent = '—';
        document.getElementById('avgRating').textContent = '—';
        document.getElementById('totalUsers').textContent = '—';
    }
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
        alert('This platform is coming soon!');
        return;
    }
    
    // Get APK URL from Firebase
    try {
        const apkSnapshot = await db.ref('app/apk_url').once('value');
        const APK_URL = apkSnapshot.val();
        
        if (!APK_URL) {
            alert('APK not available yet. Please check back later.');
            return;
        }
        
        // Show download modal
        showDownloadModal();
        
        // Increment download count in Firebase
        await incrementDownloadCount(platform);
        
        // Simulate download progress
        simulateDownload();
        
        // Start actual download after 2 seconds
        setTimeout(() => {
            window.location.href = APK_URL;
            
            // Close modal after download starts
            setTimeout(() => {
                closeDownloadModal();
                showThankYouMessage();
            }, 1000);
        }, 2000);
        
    } catch (error) {
        console.error('Download error:', error);
        closeDownloadModal();
        alert('Download failed. Please try again.');
    }
}

/**
 * Increment download count in Firebase RTDB
 */
async function incrementDownloadCount(platform) {
    const updates = {};
    
    // Increment total downloads
    const totalRef = db.ref('downloads/total');
    const totalSnapshot = await totalRef.once('value');
    const currentTotal = totalSnapshot.val() || 0;
    updates['downloads/total'] = currentTotal + 1;
    
    // Increment platform-specific downloads
    const platformRef = db.ref(`downloads/platforms/${platform}`);
    const platformSnapshot = await platformRef.once('value');
    const currentPlatform = platformSnapshot.val() || 0;
    updates[`downloads/platforms/${platform}`] = currentPlatform + 1;
    
    // Add download log with timestamp
    const timestamp = Date.now();
    updates[`downloads/logs/${timestamp}`] = {
        platform: platform,
        timestamp: timestamp,
        date: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
    
    // Apply all updates
    await db.ref().update(updates);
    
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
    // Create toast notification
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
 * Detect user's platform
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
 * Track page view
 */
async function trackPageView() {
    try {
        const timestamp = Date.now();
        await db.ref(`analytics/pageviews/${timestamp}`).set({
            timestamp: timestamp,
            date: new Date().toISOString(),
            page: 'download',
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error('Error tracking page view:', error);
    }
}

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
    // Load all real-time statistics
    loadAllStats();
    
    // Track page view
    trackPageView();
    
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
    
    console.log('✅ Download page initialized with real-time data');
});

// Make functions global
window.downloadApp = downloadApp;
window.closeDownloadModal = closeDownloadModal;
