/**
 * Home Screen Initialization
 * Handles navigation, authentication routing, and UI interactions
 */

// Firebase Config
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

const auth = firebase.auth();
const db = firebase.database();

// Check authentication status
auth.onAuthStateChanged(user => {
    const authBtn = document.getElementById('auth-btn');
    const mobileAuthBtn = document.getElementById('mobile-auth-btn');
    
    if (user) {
        // User is logged in - show "Launch App" button
        if (authBtn) {
            authBtn.innerHTML = '<i class="fas fa-rocket"></i> Launch App';
            authBtn.onclick = () => window.location.href = 'app.html';
        }
        if (mobileAuthBtn) {
            mobileAuthBtn.innerHTML = '<i class="fas fa-rocket"></i> Launch App';
            mobileAuthBtn.onclick = () => window.location.href = 'app.html';
        }
    } else {
        // User not logged in - show "Get Started" button
        if (authBtn) {
            authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Get Started';
            authBtn.onclick = () => window.location.href = 'app.html';
        }
        if (mobileAuthBtn) {
            mobileAuthBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Get Started';
            mobileAuthBtn.onclick = () => window.location.href = 'app.html';
        }
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenuBtn = document.getElementById('close-menu-btn');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });
}

if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
}

// Close mobile menu when clicking links
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
}, { passive: true });

// Hero buttons
const heroGetStarted = document.getElementById('hero-get-started');
const ctaGetStarted = document.getElementById('cta-get-started');

if (heroGetStarted) {
    heroGetStarted.addEventListener('click', () => {
        window.location.href = 'app.html';
    });
}

if (ctaGetStarted) {
    ctaGetStarted.addEventListener('click', () => {
        window.location.href = 'app.html';
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and other elements
document.querySelectorAll('.feature-card, .tech-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

console.log('✅ Home screen initialized');
