/**
 * 🎨 Professional Line Counter with Stunning Animations
 * Stage 1: ZIP Logo appears and unzips
 * Stage 2: Gears rotate while calculating
 * Stage 3: Numbers count up with odometer effect
 */

const BACKEND_URL = 'https://periodic-table-3d.onrender.com';
const lineCountRef = db.ref('stats/lineCount');

let isCalculating = false;

/**
 * Main fetch function with animation pipeline
 */
async function fetchLineCount() {
    const container = document.querySelector('.line-counter-card');
    const subtitleEl = document.querySelector('.counter-subtitle');
    
    try {
        // Check cache first
        const cached = await lineCountRef.once('value');
        const cachedData = cached.val();
        
        if (cachedData && (Date.now() - cachedData.timestamp < 3600000)) {
            console.log('✅ Using cached data');
            await showCachedAnimation(cachedData);
            return;
        }
        
        // Start full animation sequence
        isCalculating = true;
        
        // Stage 1: ZIP Animation (3 seconds)
        await showZipAnimation(container, subtitleEl);
        await delay(3000);
        
        // Stage 2: Calculation Animation (fetch during this)
        showCalculatingAnimation(container, subtitleEl);
        
        console.log('📡 Fetching from backend...');
        const response = await fetch(`${BACKEND_URL}/api/line-count`);
        
        if (!response.ok) throw new Error('Backend failed');
        
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        await delay(2000); // Let gears spin
        
        // Stage 3: Display results with odometer
        await showResultAnimation(data, container, subtitleEl);
        
        // Cache result
        await lineCountRef.set({
            ...data,
            timestamp: Date.now()
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        await showErrorAnimation(container, subtitleEl);
        
        // Try cache as fallback
        const cached = await lineCountRef.once('value');
        if (cached.val()) {
            await delay(1000);
            await showCachedAnimation(cached.val());
        }
    } finally {
        isCalculating = false;
    }
}

/**
 * 🎬 STAGE 1: ZIP UNZIPPING ANIMATION
 */
async function showZipAnimation(container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    
    // Clear existing content
    countEl.innerHTML = '';
    
    // Create ZIP container
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
    
    // Trigger animations
    setTimeout(() => {
        const zipFile = zipContainer.querySelector('.zip-file');
        zipFile.style.animation = 'zipBounce 0.6s ease-out';
    }, 100);
    
    setTimeout(() => {
        const unzipEffect = zipContainer.querySelector('.unzip-effect');
        unzipEffect.style.opacity = '1';
    }, 800);
    
    // Animate progress bar
    const progressFill = zipContainer.querySelector('.unzip-progress-fill');
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 3;
        progressFill.style.width = progress + '%';
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
 * 🎯 STAGE 3: RESULT DISPLAY WITH ODOMETER
 */
async function showResultAnimation(data, container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    
    // Fade out calculation
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
        
        // Add comma separators
        const fromRight = digits.length - index - 1;
        if (fromRight > 0 && fromRight % 3 === 0) {
            const comma = document.createElement('span');
            comma.className = 'odometer-comma';
            comma.textContent = ',';
            countEl.appendChild(comma);
        }
        
        // Animate each digit
        setTimeout(() => {
            animateDigit(digitEl, parseInt(digit));
        }, index * 100);
    });
    
    // Update breakdown
    await delay(1000);
    updateBreakdown(data);
    
    // Success message
    subtitleEl.innerHTML = `
        <div class="success-animation">
            <i class="fas fa-check-circle"></i>
            <span>Analysis complete! ${formatNumber(data.total)} lines processed</span>
        </div>
    `;
}

/**
 * Animate single digit with rolling effect
 */
function animateDigit(element, targetDigit) {
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
 * Update language breakdown with slide-in
 */
function updateBreakdown(data) {
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
 * Show cached data with quick animation
 */
async function showCachedAnimation(data) {
    const countEl = document.getElementById('line-count');
    const subtitleEl = document.querySelector('.counter-subtitle');
    
    countEl.style.opacity = '0';
    await delay(300);
    
    await showResultAnimation(data, null, subtitleEl);
    
    subtitleEl.innerHTML = `
        <div class="cache-info">
            <i class="fas fa-database"></i>
            <span>Cached data • Last updated ${getTimeAgo(data.timestamp)}</span>
        </div>
    `;
}

/**
 * Show error state
 */
async function showErrorAnimation(container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    
    countEl.innerHTML = `
        <div class="error-container">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
        </div>
    `;
    
    subtitleEl.innerHTML = `
        <div class="error-text">
            <i class="fas fa-times-circle"></i>
            <span>Unable to fetch data. Trying cache...</span>
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
 * Get time ago
 */
function getTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Delay helper
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Real-time listener
lineCountRef.on('value', (snapshot) => {
    if (!isCalculating && snapshot.val()) {
        const data = snapshot.val();
        const countEl = document.getElementById('line-count');
        if (countEl && !countEl.querySelector('.odometer-digit-wrapper')) {
            showCachedAnimation(data);
        }
    }
});

// Initialize on scroll into view
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fetchLineCount();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    const section = document.querySelector('.line-counter-section');
    if (section) observer.observe(section);
    
    console.log('✅ Line counter initialized');
});
