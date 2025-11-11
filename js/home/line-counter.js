/**
 * Real-Time Line Counter
 * Fetches and displays total lines of code from backend
 */

const BACKEND_URL = 'https://your-render-backend.onrender.com'; // Replace with actual Render URL

// Firebase reference for caching
const lineCountRef = db.ref('stats/lineCount');

let currentCount = 0;
let targetCount = 0;
let isCalculating = false;

/**
 * Fetch line count from backend
 */
async function fetchLineCount() {
    const countEl = document.getElementById('line-count');
    const subtitleEl = document.querySelector('.counter-subtitle');
    
    try {
        // Show calculating state
        isCalculating = true;
        subtitleEl.textContent = 'Calculating in real-time...';
        
        // Try to get from Firebase cache first
        const cachedSnapshot = await lineCountRef.once('value');
        const cachedData = cachedSnapshot.val();
        
        if (cachedData && (Date.now() - cachedData.timestamp < 3600000)) { // 1 hour cache
            console.log('✅ Using cached line count');
            displayLineCount(cachedData);
            return;
        }
        
        // Fetch from backend
        console.log('📡 Fetching line count from backend...');
        const response = await fetch(`${BACKEND_URL}/api/line-count`);
        
        if (!response.ok) {
            throw new Error('Backend request failed');
        }
        
        const data = await response.json();
        
        // Update Firebase cache
        await lineCountRef.set({
            ...data,
            timestamp: Date.now()
        });
        
        console.log('✅ Line count fetched:', data);
        displayLineCount(data);
        
    } catch (error) {
        console.error('❌ Error fetching line count:', error);
        
        // Fallback to cached data if available
        const cachedSnapshot = await lineCountRef.once('value');
        const cachedData = cachedSnapshot.val();
        
        if (cachedData) {
            console.log('⚠️ Using cached data (fallback)');
            displayLineCount(cachedData);
            subtitleEl.textContent = 'Last updated: ' + getTimeAgo(cachedData.timestamp);
        } else {
            subtitleEl.textContent = 'Unable to calculate. Please refresh.';
            countEl.innerHTML = '<span style="font-size: 2rem; color: var(--accent-red);">Error</span>';
        }
    } finally {
        isCalculating = false;
    }
}

/**
 * Display line count with animation
 */
function displayLineCount(data) {
    const countEl = document.getElementById('line-count');
    const subtitleEl = document.querySelector('.counter-subtitle');
    
    // Update breakdown
    document.getElementById('js-lines').textContent = formatNumber(data.javascript || 0);
    document.getElementById('css-lines').textContent = formatNumber(data.css || 0);
    document.getElementById('html-lines').textContent = formatNumber(data.html || 0);
    document.getElementById('python-lines').textContent = formatNumber(data.python || 0);
    
    // Animate total count
    targetCount = data.total || 0;
    animateCount(countEl, targetCount);
    
    // Update subtitle
    subtitleEl.textContent = `Updated ${getTimeAgo(data.timestamp || Date.now())}`;
}

/**
 * Animate counting from current to target
 */
function animateCount(element, target) {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = (target - currentCount) / steps;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        currentCount += increment;
        
        if (step >= steps) {
            currentCount = target;
            element.innerHTML = `<span class="digit">${formatNumber(Math.floor(currentCount))}</span>`;
            clearInterval(timer);
        } else {
            element.innerHTML = `<span class="digit">${formatNumber(Math.floor(currentCount))}</span>`;
        }
    }, duration / steps);
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
    return `${days}d ago`;
}

/**
 * Listen for real-time updates from Firebase
 */
lineCountRef.on('value', (snapshot) => {
    if (!isCalculating) {
        const data = snapshot.val();
        if (data) {
            displayLineCount(data);
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for element to be visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fetchLineCount();
                observer.unobserve(entry.target);
            }
        });
    });
    
    const lineCountSection = document.querySelector('.line-counter-section');
    if (lineCountSection) {
        observer.observe(lineCountSection);
    }
    
    console.log('✅ Line counter initialized');
});
