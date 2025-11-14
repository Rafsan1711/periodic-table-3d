
// ============================================
// beaker-motion.js
// ============================================
/**
 * Device Motion Detection
 */

let motionPermissionGranted = false;

function initBeakerMotion() {
    if (typeof DeviceMotionEvent === 'undefined') {
        console.log('ℹ️ Device motion not supported');
        return;
    }
    
    // Request permission (iOS 13+)
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    motionPermissionGranted = true;
                    setupMotionListener();
                }
            })
            .catch(console.error);
    } else {
        motionPermissionGranted = true;
        setupMotionListener();
    }
    
    console.log('✅ Motion detection initialized');
}

function setupMotionListener() {
    let lastShakeTime = 0;
    const shakeThreshold = 15;
    
    window.addEventListener('devicemotion', (e) => {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;
        
        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;
        
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const currentTime = Date.now();
        
        if (acceleration > shakeThreshold && currentTime - lastShakeTime > 1000) {
            lastShakeTime = currentTime;
            onBeakerShake();
        }
    });
}

function onBeakerShake() {
    console.log('📳 Beaker shaken!');
    
    const wrapper = document.querySelector('.beaker-wrapper');
    if (wrapper) {
        wrapper.classList.add('shaking');
        setTimeout(() => {
            wrapper.classList.remove('shaking');
        }, 500);
    }
    
    // Apply impulse to physics bodies
    if (physicsBodies.length > 0) {
        physicsBodies.forEach(body => {
            const force = {
                x: (Math.random() - 0.5) * 0.05,
                y: -0.02
            };
            Matter.Body.applyForce(body, body.position, force);
        });
    }
    
    // Shake liquid
    const liquid = document.getElementById('beakerLiquid');
    if (liquid) {
        liquid.style.transform = 'translateX(-50%) scale(1.05)';
        setTimeout(() => {
            liquid.style.transform = 'translateX(-50%) scale(1)';
        }, 200);
    }
    
    // Vibration feedback
    if ('vibrate' in navigator) {
        navigator.vibrate([10, 30, 10]);
    }
}
