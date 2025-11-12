/**
 * Advanced Real-Time Line Counter with Beautiful Animations
 * Features: Unzip animation, calculating effects, gear rotation
 */

const BACKEND_URL = 'https://periodic-table-3d.onrender.com';

const lineCountRef = db.ref('stats/lineCount');

let currentCount = 0;
let targetCount = 0;
let isCalculating = false;
let animationStage = 0; // 0: idle, 1: unzipping, 2: calculating, 3: complete

/**
 * Fetch line count with beautiful animation stages
 */
async function fetchLineCount() {
    const countEl = document.getElementById('line-count');
    const subtitleEl = document.querySelector('.counter-subtitle');
    
    try {
        // Check cache first
        const cachedSnapshot = await lineCountRef.once('value');
        const cachedData = cachedSnapshot.val();
        
        if (cachedData && (Date.now() - cachedData.timestamp < 3600000)) {
            console.log('✅ Using cached line count');
            displayLineCount(cachedData);
            return;
        }
        
        // Start animation sequence
        isCalculating = true;
        
        // Stage 1: Unzipping files
        showUnzipAnimation(subtitleEl);
        await delay(2000);
        
        // Stage 2: Calculating
        showCalculatingAnimation(subtitleEl);
        
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
        
        // Stage 3: Display result
        await delay(1000);
        displayLineCount(data);
        
    } catch (error) {
        console.error('❌ Error fetching line count:', error);
        
        // Fallback
        const cachedSnapshot = await lineCountRef.once('value');
        const cachedData = cachedSnapshot.val();
        
        if (cachedData) {
            console.log('⚠️ Using cached data (fallback)');
            displayLineCount(cachedData);
            subtitleEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Using cached data';
        } else {
            showErrorState(countEl, subtitleEl);
        }
    } finally {
        isCalculating = false;
    }
}

/**
 * Stage 1: Unzip Animation
 */
function showUnzipAnimation(subtitleEl) {
    subtitleEl.innerHTML = `
        <div class="stage-animation">
            <div class="unzip-icon">
                <i class="fas fa-file-archive"></i>
                <div class="unzip-progress"></div>
            </div>
            <span class="stage-text">Extracting files...</span>
        </div>
    `;
    
    // Animate unzip progress
    const progress = subtitleEl.querySelector('.unzip-progress');
    let width = 0;
    const interval = setInterval(() => {
        width += 5;
        if (progress) progress.style.width = width + '%';
        if (width >= 100) clearInterval(interval);
    }, 100);
}

/**
 * Stage 2: Calculating Animation
 */
function showCalculatingAnimation(subtitleEl) {
    subtitleEl.innerHTML = `
        <div class="stage-animation">
            <div class="calc-container">
                <div class="gear gear-1">
                    <i class="fas fa-cog"></i>
                </div>
                <div class="gear gear-2">
                    <i class="fas fa-cog"></i>
                </div>
                <div class="gear gear-3">
                    <i class="fas fa-cog"></i>
                </div>
            </div>
            <span class="stage-text">Analyzing code structure...</span>
        </div>
    `;
}

/**
 * Display line count with odometer animation
 */
function displayLineCount(data) {
    const countEl = document.getElementById('line-count');
    const subtitleEl = document.querySelector('.counter-subtitle');
    
    // Update breakdown with slide-in animation
    updateBreakdown('js-lines', data.javascript || 0);
    updateBreakdown('css-lines', data.css || 0);
    updateBreakdown('html-lines', data.html || 0);
    updateBreakdown('python-lines', data.python || 0);
    
    // Additional languages
    if (data.json) updateBreakdown('json-lines', data.json);
    if (data.markdown) updateBreakdown('md-lines', data.markdown);
    
    // Animate total count
    targetCount = data.total || 0;
    animateOdometer(countEl, targetCount);
    
    // Show success message
    subtitleEl.innerHTML = `
        <div class="success-animation">
            <i class="fas fa-check-circle"></i>
            <span>Analysis complete! Updated ${getTimeAgo(data.timestamp || Date.now())}</span>
        </div>
    `;
}

/**
 * Odometer-style counter animation
 */
function animateOdometer(element, target) {
    const digits = target.toString().split('');
    const digitElements = [];
    
    element.innerHTML = '';
    
    digits.forEach((digit, index) => {
        const digitContainer = document.createElement('div');
        digitContainer.className = 'odometer-digit';
        
        const digitRoller = document.createElement('div');
        digitRoller.className = 'digit-roller';
        
        // Create rolling numbers 0-9
        for (let i = 0; i <= parseInt(digit); i++) {
            const num = document.createElement('span');
            num.textContent = i;
            digitRoller.appendChild(num);
        }
        
        digitContainer.appendChild(digitRoller);
        element.appendChild(digitContainer);
        
        // Add comma after every 3rd digit from right
        if ((digits.length - index - 1) % 3 === 0 && index < digits.length - 1) {
            const comma = document.createElement('span');
            comma.className = 'odometer-comma';
            comma.textContent = ',';
            element.appendChild(comma);
        }
        
        // Animate roll
        setTimeout(() => {
            const rollHeight = parseInt(digit) * 60; // 60px per digit
            digitRoller.style.transform = `translateY(-${rollHeight}px)`;
        }, index * 100);
    });
}

/**
 * Update breakdown with animation
 */
function updateBreakdown(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        el.textContent = formatNumber(value);
        el.style.transition = 'all 0.5s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
    }, 300);
}

/**
 * Show error state
 */
function showErrorState(countEl, subtitleEl) {
    countEl.innerHTML = `
        <div style="font-size: 2rem; color: var(--accent-red);">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
    `;
    subtitleEl.innerHTML = `
        <div class="error-animation">
            <i class="fas fa-times-circle"></i>
            <span>Unable to calculate. Please refresh.</span>
        </div>
    `;
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
 * Delay helper
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Listen for real-time updates
 */
lineCountRef.on('value', (snapshot) => {
    if (!isCalculating) {
        const data = snapshot.val();
        if (data) {
            displayLineCount(data);
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
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
