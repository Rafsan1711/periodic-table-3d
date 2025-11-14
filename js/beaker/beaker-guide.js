
// ============================================
// beaker-guide.js
// ============================================
/**
 * Guide Modal
 */

function initBeakerGuide() {
    const guide = document.getElementById('beaker-guide');
    if (!guide) return;
    
    console.log('✅ Guide initialized');
}

function showBeakerGuide() {
    const guide = document.getElementById('beaker-guide');
    if (guide) {
        guide.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeBeakerGuide() {
    const guide = document.getElementById('beaker-guide');
    if (guide) {
        guide.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function startBeakerLab() {
    localStorage.setItem('beaker_guide_seen', 'true');
    closeBeakerGuide();
}

window.showBeakerGuide = showBeakerGuide;
window.closeBeakerGuide = closeBeakerGuide;
window.startBeakerLab = startBeakerLab;
