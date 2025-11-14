// ============================================
// beaker-effects.js
// ============================================
/**
 * Visual Effects
 */

function createGasEffect(color, container) {
    if (!container) return;
    
    // Use particles.js if available
    if (typeof particlesJS !== 'undefined') {
        container.innerHTML = '<div id="gas-particles"></div>';
        
        particlesJS('gas-particles', {
            particles: {
                number: { value: 50 },
                color: { value: color },
                shape: { type: 'circle' },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: { enable: true, speed: 1, opacity_min: 0.1 }
                },
                size: {
                    value: 3,
                    random: true
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'top',
                    random: true,
                    out_mode: 'out'
                }
            }
        });
    } else {
        // Fallback: Manual particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'gas-particle';
            particle.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                background: ${color};
                opacity: ${Math.random() * 0.5 + 0.3};
            `;
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }
    }
}

function createGasDispersion(color) {
    const wrapper = document.querySelector('.beaker-wrapper');
    if (!wrapper) return;
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'gas-particle';
            const angle = (i / 15) * Math.PI * 2;
            const distance = 100;
            
            particle.style.cssText = `
                position: absolute;
                width: 15px;
                height: 15px;
                background: ${color};
                border-radius: 50%;
                left: 50%;
                top: 30%;
                transform: translate(-50%, -50%);
                animation-delay: ${i * 0.05}s;
            `;
            
            wrapper.appendChild(particle);
            
            setTimeout(() => {
                particle.style.transform = `translate(
                    calc(-50% + ${Math.cos(angle) * distance}px),
                    calc(-50% + ${Math.sin(angle) * distance}px)
                ) scale(0)`;
                particle.style.transition = 'all 1s ease-out';
            }, 50);
            
            setTimeout(() => particle.remove(), 1100);
        }, i * 50);
    }
}

console.log('✅ All beaker modules loaded successfully');
