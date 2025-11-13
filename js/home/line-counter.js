/**
 * Line Counter - COMPLETE FIX
 * ✅ Null safety
 * ✅ Default values
 * ✅ Error recovery
 */

const BACKEND_URL = 'https://periodic-table-3d.onrender.com';
const lineCountRef = db.ref('stats/lineCount');

let isCalculating = false;

async function fetchLineCount() {
    const container = document.querySelector('.line-counter-card');
    const subtitleEl = document.querySelector('.counter-subtitle');
    
    try {
        console.log('🚀 Line counter starting...');
        
        // Check cache
        const cached = await lineCountRef.once('value');
        const cachedData = cached.val();
        
        // Use cache if valid and fresh
        if (cachedData && cachedData.total && (Date.now() - cachedData.timestamp < 3600000)) {
            console.log('✅ Using cached data');
            await showCachedAnimation(cachedData);
            return;
        }
        
        console.log('📡 Fetching fresh data...');
        isCalculating = true;
        
        // Stage 1: ZIP
        await showZipAnimation(container, subtitleEl);
        await delay(3000);
        
        // Stage 2: Calculate
        showCalculatingAnimation(container, subtitleEl);
        
        const response = await fetch(`${BACKEND_URL}/api/line-count`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        // Validate and set defaults
        const validData = {
            total: data.total || 0,
            javascript: data.javascript || 0,
            css: data.css || 0,
            html: data.html || 0,
            python: data.python || 0,
            json: data.json || 0,
            markdown: data.markdown || 0,
            timestamp: data.timestamp || Date.now()
        };
        
        await delay(2000);
        
        // Stage 3: Display
        await showResultAnimation(validData, container, subtitleEl);
        
        // Save cache
        await lineCountRef.set(validData);
        console.log('✅ Saved to cache');
        
    } catch (error) {
        console.error('❌ Error:', error);
        
        // Try old cache
        const cached = await lineCountRef.once('value');
        const cachedData = cached.val();
        
        if (cachedData && cachedData.total) {
            console.log('⚠️ Using old cache');
            await showCachedAnimation(cachedData);
            
            if (subtitleEl) {
                subtitleEl.innerHTML = `
                    <div class="cache-info">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Using cached data (${getTimeAgo(cachedData.timestamp)})</span>
                    </div>
                `;
            }
        } else {
            // No data at all
            await showNoDataState(container, subtitleEl);
        }
    } finally {
        isCalculating = false;
    }
}

async function showNoDataState(container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    
    countEl.innerHTML = `
        <div class="no-data-container">
            <div class="no-data-icon">
                <i class="fas fa-code"></i>
            </div>
            <div class="no-data-text">
                <h3>First Time Setup</h3>
                <p>Initializing line counter...</p>
            </div>
        </div>
    `;
    
    if (subtitleEl) {
        subtitleEl.innerHTML = `
            <div class="info-text">
                <i class="fas fa-sync fa-spin"></i>
                <span>Retrying in 5 seconds...</span>
            </div>
        `;
    }
    
    setTimeout(() => fetchLineCount(), 5000);
}

async function showZipAnimation(container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    if (!countEl) return;
    
    countEl.innerHTML = `
        <div class="zip-animation-container">
            <div class="zip-file">
                <div class="zip-icon">
                    <i class="fas fa-file-archive"></i>
                </div>
                <div class="zip-label">repository.zip</div>
            </div>
            <div class="unzip-effect">
                <div class="flying-file" style="--delay: 0.2s"><i class="fab fa-js"></i></div>
                <div class="flying-file" style="--delay: 0.4s"><i class="fab fa-css3"></i></div>
                <div class="flying-file" style="--delay: 0.6s"><i class="fab fa-html5"></i></div>
                <div class="flying-file" style="--delay: 0.8s"><i class="fab fa-python"></i></div>
            </div>
            <div class="unzip-progress-bar">
                <div class="unzip-progress-fill"></div>
            </div>
        </div>
    `;
    
    if (subtitleEl) {
        subtitleEl.innerHTML = `
            <div class="stage-text animated-gradient">
                <i class="fas fa-box-open"></i>
                Extracting repository files...
            </div>
        `;
    }
    
    setTimeout(() => {
        const zipFile = countEl.querySelector('.zip-file');
        if (zipFile) zipFile.style.animation = 'zipBounce 0.6s ease-out';
    }, 100);
    
    setTimeout(() => {
        const effect = countEl.querySelector('.unzip-effect');
        if (effect) effect.style.opacity = '1';
    }, 800);
    
    const fill = countEl.querySelector('.unzip-progress-fill');
    if (fill) {
        let p = 0;
        const int = setInterval(() => {
            p += 3;
            fill.style.width = p + '%';
            if (p >= 100) clearInterval(int);
        }, 60);
    }
}

function showCalculatingAnimation(container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    if (!countEl) return;
    
    countEl.innerHTML = `
        <div class="calculation-container">
            <div class="gear-system">
                <div class="gear big-gear"><i class="fas fa-cog"></i></div>
                <div class="gear medium-gear"><i class="fas fa-cog"></i></div>
                <div class="gear small-gear"><i class="fas fa-cog"></i></div>
            </div>
            <div class="calculation-sparks">
                <div class="spark" style="--angle: 45deg"></div>
                <div class="spark" style="--angle: 135deg"></div>
                <div class="spark" style="--angle: 225deg"></div>
                <div class="spark" style="--angle: 315deg"></div>
            </div>
        </div>
    `;
    
    if (subtitleEl) {
        subtitleEl.innerHTML = `
            <div class="stage-text animated-gradient">
                <i class="fas fa-calculator"></i>
                Analyzing code structure...
            </div>
        `;
    }
}

async function showResultAnimation(data, container, subtitleEl) {
    const countEl = document.getElementById('line-count');
    if (!countEl) return;
    
    // Validate data with defaults
    const total = data.total || 0;
    
    countEl.style.opacity = '0';
    await delay(500);
    
    countEl.innerHTML = '';
    countEl.style.opacity = '1';
    
    const digits = total.toString().split('');
    
    digits.forEach((digit, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'odometer-digit-wrapper';
        
        const digitEl = document.createElement('div');
        digitEl.className = 'odometer-digit';
        digitEl.textContent = '0';
        
        wrapper.appendChild(digitEl);
        countEl.appendChild(wrapper);
        
        const fromRight = digits.length - i - 1;
        if (fromRight > 0 && fromRight % 3 === 0) {
            const comma = document.createElement('span');
            comma.className = 'odometer-comma';
            comma.textContent = ',';
            countEl.appendChild(comma);
        }
        
        setTimeout(() => animateDigit(digitEl, parseInt(digit)), i * 100);
    });
    
    await delay(1000);
    updateBreakdown(data);
    
    if (subtitleEl) {
        subtitleEl.innerHTML = `
            <div class="success-animation">
                <i class="fas fa-check-circle"></i>
                <span>Complete! ${formatNumber(total)} lines analyzed</span>
            </div>
        `;
    }
}

function animateDigit(el, target) {
    if (!el) return;
    let curr = 0;
    const steps = 20;
    const inc = target / steps;
    
    const int = setInterval(() => {
        curr += inc;
        if (curr >= target) {
            el.textContent = target;
            clearInterval(int);
        } else {
            el.textContent = Math.floor(curr);
        }
    }, 50);
}

function updateBreakdown(data) {
    const langs = [
        { id: 'js-lines', value: data.javascript || 0 },
        { id: 'css-lines', value: data.css || 0 },
        { id: 'html-lines', value: data.html || 0 },
        { id: 'python-lines', value: data.python || 0 }
    ];
    
    langs.forEach((lang, i) => {
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
        }, i * 200);
    });
}

async function showCachedAnimation(data) {
    if (!data || !data.total) {
        console.warn('Invalid cache, fetching...');
        await fetchLineCount();
        return;
    }
    
    const countEl = document.getElementById('line-count');
    const subtitleEl = document.querySelector('.counter-subtitle');
    
    if (countEl) {
        countEl.style.opacity = '0';
        await delay(300);
        await showResultAnimation(data, null, subtitleEl);
    }
    
    if (subtitleEl) {
        subtitleEl.innerHTML = `
            <div class="cache-info">
                <i class="fas fa-database"></i>
                <span>Cached • Updated ${getTimeAgo(data.timestamp)}</span>
            </div>
        `;
    }
}

function formatNumber(num) {
    if (typeof num === 'undefined' || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getTimeAgo(ts) {
    if (!ts) return 'unknown';
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// Real-time listener
lineCountRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (!isCalculating && data && data.total) {
        const countEl = document.getElementById('line-count');
        if (countEl && !countEl.querySelector('.odometer-digit-wrapper')) {
            showCachedAnimation(data);
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                fetchLineCount();
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    
    const sec = document.querySelector('.line-counter-section');
    if (sec) obs.observe(sec);
    
    console.log('✅ Line counter initialized');
});
