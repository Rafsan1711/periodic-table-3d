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
if (gotoLogin) gotoLogin.onclick = () => showAuthTab('login');
if (gotoSignup) gotoSignup.onclick = () => showAuthTab('signup');
if (gotoReset) gotoReset.onclick = () => showAuthTab('reset');
if (gotoLogin2) gotoLogin2.onclick = () => showAuthTab('login');

// Default: show signup
showAuthTab('signup');

/**
 * Sign Up with Email/Password
 */
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const errorDiv = document.getElementById('signup-error');
    errorDiv.textContent = '';
    
    if (!email || !password) {
        errorDiv.textContent = 'Please enter email & password.';
        return;
    }
    
    try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        
        if (cred.user) {
            let username = cred.user.displayName || email.split('@')[0] || 'Anonymous';
            await cred.user.updateProfile({displayName: username});
            
            // Create user entry in database
            await db.ref('users/' + cred.user.uid).set({
                username: username,
                email: email,
                photoURL: '',
                createdAt: Date.now()
            });
            
            // Send verification email
            await cred.user.sendEmailVerification();
            verifyEmailNotice.style.display = 'block';
            signupForm.style.display = 'none';
            errorDiv.textContent = '';
        }
    } catch(err) {
        errorDiv.textContent = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '');
    }
});

/**
 * Log In with Email/Password
 */
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = '';
    
    try {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        
        if (cred.user && !cred.user.emailVerified) {
            errorDiv.textContent = '';
            loginForm.style.display = 'none';
            verifyEmailNotice.style.display = 'block';
            await auth.signOut();
            return;
        }
        // Success: handled by onAuthStateChanged
    } catch(err) {
        errorDiv.textContent = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '');
    }
});

/**
 * Password Reset
 */
resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('reset-email').value.trim();
    const errorDiv = document.getElementById('reset-error');
    const successDiv = document.getElementById('reset-success');
    errorDiv.textContent = '';
    successDiv.textContent = '';
    
    if (!email) {
        errorDiv.textContent = 'Please enter your email.';
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        successDiv.textContent = 'A reset link has been sent to your email.';
    } catch(err) {
        errorDiv.textContent = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '');
    }
});

/**
 * Resend verification email
 */
if (resendVerificationBtn) {
    resendVerificationBtn.onclick = async function() {
        if (auth.currentUser) {
            try {
                await auth.currentUser.sendEmailVerification();
                resendVerificationBtn.textContent = "Sent!";
                setTimeout(() => {
                    resendVerificationBtn.textContent = "Resend Verification Email";
                }, 3000);
            } catch (err) {
                resendVerificationBtn.textContent = "Error!";
            }
        }
    };
}

/**
 * Sign In with Google
 */
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => {
        console.error('Google sign in error:', err);
        alert('Failed to sign in with Google');
    });
}

/**
 * Sign Out
 */
function signOut() {
    auth.signOut().then(() => {
        console.log('User signed out');
    }).catch(err => {
        console.error('Sign out error:', err);
    });
}

/**
 * Auth State Observer
 */
auth.onAuthStateChanged(async user => {
    if (user) {
        // Email/password user - check verification
        if (user.providerData[0].providerId === 'password' && !user.emailVerified) {
            await auth.signOut();
            showAuthTab('login');
            if (verifyEmailNotice) verifyEmailNotice.style.display = 'block';
            return;
        }
        
        // User is authenticated
        currentAuthUser = user;
        currentForumUser = user; // For forum module
        
        // Hide auth screen, show main app
        authScreen.style.display = 'none';
        mainApp.style.display = 'block';
        
        // Initialize app features
        initializeApp();
        
    } else {
        // No user signed in
        currentAuthUser = null;
        currentForumUser = null;
        mainApp.style.display = 'none';
        authScreen.style.display = 'flex';
        showAuthTab('signup');
    }
});

/**
 * Initialize app after authentication
 */
function initializeApp() {
    console.log('Initializing app for user:', currentAuthUser.displayName);
    
    // Initialize all modules
    if (typeof initForum === 'function') {
        initForum();
    }
    
    // Show periodic table by default
    showPeriodicPage();
}

// Global functions
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;

console.log('✅ Auth handler loaded');
