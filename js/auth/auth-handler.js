/**
 * Authentication Handler
 * 100% copied from provided HTML file
 */

// UI Elements
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const resetForm = document.getElementById('reset-form');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const gotoLogin = document.getElementById('goto-login');
const gotoSignup = document.getElementById('goto-signup');
const gotoReset = document.getElementById('goto-reset');
const gotoLogin2 = document.getElementById('goto-login2');
const verifyEmailNotice = document.getElementById('verify-email-notice');
const resendVerificationBtn = document.getElementById('resend-verification');

// Current user
let currentAuthUser = null;

/**
 * Show auth tab (signup/login/reset)
 */
function showAuthTab(tab) {
    signupForm.style.display = tab === 'signup' ? 'flex' : 'none';
    loginForm.style.display = tab === 'login' ? 'flex' : 'none';
    resetForm.style.display = tab === 'reset' ? 'flex' : 'none';
    verifyEmailNotice.style.display = 'none';
    
    // Toggle button highlight
    if (showSignupBtn && showLoginBtn) {
        if (tab === 'signup') {
            showSignupBtn.classList.add('active');
            showLoginBtn.classList.remove('active');
        } else if (tab === 'login') {
            showSignupBtn.classList.remove('active');
            showLoginBtn.classList.add('active');
        }
    }
}

// Event listeners for tab switching
if (showSignupBtn) showSignupBtn.onclick = () => showAuthTab('signup');
if (showLoginBtn) showLoginBtn.onclick = () => showAuthTab('login');
if (g
