/**
 * 🎨 Professional Line Counter - FIXED
 * ✅ Handles missing/null data
 * ✅ Creates cache if doesn't exist
 * ✅ CORS handling
 */

const BACKEND_URL = 'https://periodic-table-3d.onrender.com';
const lineCountRef = db.ref('stats/lineCount');

let isCalculating = false;

/**
 * Main fetch with complete error handling
 */
async function fetchLineCount() {
    const container = document.querySelector('.line-counter-card');
    const subtitleEl = document.querySelector('.counter-subtitle');
    
    try {
        console.log('🚀 Starting line counter...');
        
        // Check cache first
        const cached = await lineCountRef.once('value');
        const cachedData = cached.val();
        
        // If cache exists and is fresh, use it
        if (cachedData && cachedData.total && (Date.now() - cachedData.timestamp < 3600000)) {
            console.log('✅ Using cached data:', cachedData.total);
            await showCachedAnimation(cachedData);
            return;
        }
        
        console.log('📡 Cache expired or missing, fetching fresh data...');
        
        // Start animation sequence
        isCalculating = true;
        
        // Stage 1: ZIP Animation
        await showZipAnimation(container, subtitleEl);
        await delay(3000);
        
        // Stage 2: Calculation Animation
        showCalculatingAnimation(container, subtitleEl);
        
        console.log('📡 Fetching from backend:', BACKEND_URL);
        
        const response = await fetch(`${BACKEND_URL}/api/line-count`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        // Validate data
        if (!data || typeof data.total === 'undefined') {
            throw new Error('Invalid data structure');
        }
        
        await delay(2000);
        
        // Stage 3: Display results
        await showResultAnimation(data, container, subtitleEl);
        
        // Save to cache
        console.log('💾 Saving to cache...');
        await lineCountRef.set({
            ...data,
            timestamp: Date.now()
        });
        
        console.log('✅ Complete!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        
        // Try cache as fallback
        const cached = await lineCountRef.once('value');
        const cachedData = cached.val();
        
        if (cachedData && cachedData.total) {
            console.log('⚠️ Using old cache as fallback');
            await showCachedAnimation(cachedData);
            
            const subtitleEl = document.querySelector('.counter-subtitle');
            if (subtitleEl) {
                subtitleEl.innerHTML = `
                    <div class="cache-info">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Showing cached data • Last updated ${getTimeAgo(cachedData.timestamp)}</span>
                    </div>
                `;
            }
        } else {
            // No cache available, show friendly error
            await showNoDataState(container, subtitleEl);
        }
    } finally {
        isCalculating = false;
    }
}

/**
 * Show state when no data available
 */
async function showNoDataState(container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    
    countEl.innerHTML = `
        <div class="no-data-container">
            <div class="no-data-icon">
                <i class="fas fa-code"></i>
            </div>
            <div class="no-data-text">
                <h3>Initializing Line Counter</h3>
                <p>First-time setup in progress...</p>
            </div>
        </div>
    `;
    
    subtitleEl.innerHTML = `
        <div class="info-text">
            <i class="fas fa-info-circle"></i>
            <span>Please wait while we analyze the repository</span>
        </div>
    `;
    
    // Retry after 5 seconds
    setTimeout(() => {
        console.log('🔄 Retrying...');
        fetchLineCount();
    }, 5000);
}

/**
 * 🎬 STAGE 1: ZIP ANIMATION
 */
async function showZipAnimation(container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    
    countEl.innerHTML = '';
    
    const zipContainer = document.createElement('div');
    zipContainer.className = 'zip-animation-container';
    zipContainer.innerHTML = `
        <div class="zip-file">
            <div class="zip-icon">
                <i class="fas fa-file-archive"></i>
            </div>
            <div class="zip-label">repository.zip</div>
        </div>
        <div class="unzip-effect">
            <div class="flying-file" style="--delay: 0.2s">
                <i class="fab fa-js"></i>
            </div>
            <div class="flying-file" style="--delay: 0.4s">
                <i class="fab fa-css3"></i>
            </div>
            <div class="flying-file" style="--delay: 0.6s">
                <i class="fab fa-html5"></i>
            </div>
            <div class="flying-file" style="--delay: 0.8s">
                <i class="fab fa-python"></i>
            </div>
        </div>
        <div class="unzip-progress-bar">
            <div class="unzip-progress-fill"></div>
        </div>
    `;
    
    countEl.appendChild(zipContainer);
    
    subtitleEl.innerHTML = `
        <div class="stage-text animated-gradient">
            <i class="fas fa-box-open"></i>
            Extracting files from repository...
        </div>
    `;
    
    setTimeout(() => {
        const zipFile = zipContainer.querySelector('.zip-file');
        if (zipFile) zipFile.style.animation = 'zipBounce 0.6s ease-out';
    }, 100);
    
    setTimeout(() => {
        const unzipEffect = zipContainer.querySelector('.unzip-effect');
        if (unzipEffect) unzipEffect.style.opacity = '1';
    }, 800);
    
    const progressFill = zipContainer.querySelector('.unzip-progress-fill');
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 3;
        if (progressFill) progressFill.style.width = progress + '%';
        if (progress >= 100) clearInterval(progressInterval);
    }, 60);
}

/**
 * ⚙️ STAGE 2: CALCULATING ANIMATION
 */
function showCalculatingAnimation(container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    
    countEl.innerHTML = `
        <div class="calculation-container">
            <div class="gear-system">
                <div class="gear big-gear">
                    <i class="fas fa-cog"></i>
                </div>
                <div class="gear medium-gear">
                    <i class="fas fa-cog"></i>
                </div>
                <div class="gear small-gear">
                    <i class="fas fa-cog"></i>
                </div>
            </div>
            <div class="calculation-sparks">
                <div class="spark" style="--angle: 45deg"></div>
                <div class="spark" style="--angle: 135deg"></div>
                <div class="spark" style="--angle: 225deg"></div>
                <div class="spark" style="--angle: 315deg"></div>
            </div>
        </div>
    `;
    
    subtitleEl.innerHTML = `
        <div class="stage-text animated-gradient">
            <i class="fas fa-calculator"></i>
            Analyzing code structure...
        </div>
    `;
}

/**
 * 🎯 STAGE 3: RESULT DISPLAY
 */
async function showResultAnimation(data, container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    
    // Validate data
    if (!data || typeof data.total === 'undefined' || data.total === null) {
        console.error('Invalid data:', data);
        throw new Error('Invalid data structure');
    }
    
    // Fade out
    countEl.style.opacity = '0';
    await delay(500);
    
    // Create odometer
    countEl.innerHTML = '';
    countEl.style.opacity = '1';
    
    const totalStr = data.total.toString();
    const digits = totalStr.split('');
    
    digits.forEach((digit, index) => {
        const digitWrapper = document.createElement('div');
        digitWrapper.className = 'odometer-digit-wrapper';
        
        const digitEl = document.createElement('div');
        digitEl.className = 'odometer-digit';
        digitEl.textContent = '0';
        
        digitWrapper.appendChild(digitEl);
        countEl.appendChild(digitWrapper);
        
        // Add commas
        const fromRight = digits.length - index - 1;
        if (fromRight > 0 && fromRight % 3 === 0) {
            const comma = document.createElement('span');
            comma.className = 'odometer-comma';
            comma.textContent = ',';
            countEl.appendChild(comma);
        }
        
        // Animate
        setTimeout(() => {
            animateDigit(digitEl, parseInt(digit));
        }, index * 100);
    });
    
    // Update breakdown
    await delay(1000);
    updateBreakdown(data);
    
    // Success message
    if (subtitleEl) {
        subtitleEl.innerHTML = `
            <div class="success-animation">
                <i class="fas fa-check-circle"></i>
                <span>Analysis complete! ${formatNumber(data.total)} lines of code</span>
            </div>
        `;
    }
}

/**
 * Animate digit
 */
function animateDigit(element, targetDigit) {
    if (!element) return;
    
    let current = 0;
    const duration = 1000;
    const steps = 20;
    const increment = targetDigit / steps;
    
    const interval = setInterval(() => {
        current += increment;
        if (current >= targetDigit) {
            element.textContent = targetDigit;
            clearInterval(interval);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

/**
 * Update breakdown with validation
 */
function updateBreakdown(data) {
    if (!data) return;
    
    const languages = [
        { id: 'js-lines', value: data.javascript || 0 },
        { id: 'css-lines', value: data.css || 0 },
        { id: 'html-lines', value: data.html || 0 },
        { id: 'python-lines', value: data.python || 0 }
    ];
    
    languages.forEach((lang, index) => {
        setTimeout(() => {
            const el = document.getElementById(lang.id);
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateX(-30px)';
                
                setTimeout(() => {
                    el.textContent = formatNumber(lang.value);
                    el.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    el.style.opacity = '1';
                    el.style.transform = 'translateX(0)';
                }, 100);
            }
        }, index * 200);
    });
}

/**
 * Show cached data quickly
 */
async function showCachedAnimation(data) {
    // Validate
    if (!data || typeof data.total === 'undefined') {
        console.warn('Invalid cached data, fetching fresh...');
        await fetchLineCount();
        return;
    }
    
    const countEl = document.getElementById('line-count');
    const subtitleEl = document.querySelector('.counter-subtitle');
    
    countEl.style.opacity = '0';
    await delay(300);
    
    await showResultAnimation(data, null, subtitleEl);
    
    if (subtitleEl) {
        subtitleEl.innerHTML = `
            <div class="cache-info">
                <i class="fas fa-database"></i>
                <span>Cached data • Updated ${getTimeAgo(data.timestamp)}</span>
            </div>
        `;
    }
}

/**
 * Format number
 */
function formatNumber(num) {
    if (typeof num === 'undefined' || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get time ago
 */
function getTimeAgo(timestamp) {
    if (!timestamp) return 'unknown';
    
    const diff = Date.now() - timestamp;
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
 * Real-time listener
 */
lineCountRef.on('value', (snapshot) => {
    const data = snapshot.val();
    
    if (!isCalculating && data && data.total) {
        const countEl = document.getElementById('line-count');
        if (countEl && !countEl.querySelector('.odometer-digit-wrapper')) {
            console.log('🔄 Real-time update detected');
            showCachedAnimation(data);
        }
    }
});

/**
 * Initialize on scroll
 */
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('👁️ Line counter visible, starting...');
                fetchLineCount();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    const section = document.querySelector('.line-counter-section');
    if (section) {
        observer.observe(section);
    }
    
    console.log('✅ Line counter initialized');
});
