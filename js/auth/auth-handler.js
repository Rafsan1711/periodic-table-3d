/**
 * ============================================
 * SECURE AUTHENTICATION HANDLER
 * Email Verification Required Before Account Creation
 * ============================================
 */

// DOM Elements
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
const verificationSuccess = document.getElementById('verification-success');
const resendVerificationBtn = document.getElementById('resend-verification');
const changeEmailBtn = document.getElementById('change-email-btn');
const continueToAppBtn = document.getElementById('continue-to-app');
const verifyEmailDisplay = document.getElementById('verifyEmailDisplay');
const verifyTimer = document.getElementById('verify-timer');
const timerCount = document.getElementById('timerCount');

// Global Variables
let currentAuthUser = null;
let pendingCredentials = null;
let resendTimer = null;

/**
 * Show Auth Tab (Signup, Login, Reset)
 */
function showAuthTab(tab) {
    // Hide all forms and notices
    signupForm.style.display = 'none';
    loginForm.style.display = 'none';
    resetForm.style.display = 'none';
    verifyEmailNotice.style.display = 'none';
    verificationSuccess.style.display = 'none';
    
    // Clear errors
    document.getElementById('signup-error').textContent = '';
    document.getElementById('login-error').textContent = '';
    document.getElementById('reset-error').textContent = '';
    document.getElementById('reset-success').textContent = '';
    
    // Show selected form
    if (tab === 'signup') {
        signupForm.style.display = 'flex';
        showSignupBtn?.classList.add('active');
        showLoginBtn?.classList.remove('active');
    } else if (tab === 'login') {
        loginForm.style.display = 'flex';
        showSignupBtn?.classList.remove('active');
        showLoginBtn?.classList.add('active');
    } else if (tab === 'reset') {
        resetForm.style.display = 'flex';
        showSignupBtn?.classList.remove('active');
        showLoginBtn?.classList.remove('active');
    } else if (tab === 'verify') {
        verifyEmailNotice.style.display = 'block';
    } else if (tab === 'success') {
        verificationSuccess.style.display = 'block';
    }
}

// Tab Navigation Events
showSignupBtn?.addEventListener('click', () => showAuthTab('signup'));
showLoginBtn?.addEventListener('click', () => showAuthTab('login'));
gotoLogin?.addEventListener('click', () => showAuthTab('login'));
gotoSignup?.addEventListener('click', () => showAuthTab('signup'));
gotoReset?.addEventListener('click', () => showAuthTab('reset'));
gotoLogin2?.addEventListener('click', () => showAuthTab('login'));

// Initialize with signup tab
showAuthTab('signup');

/**
 * Password Strength Indicator
 */
const passwordInput = document.getElementById('signup-password');
const strengthIndicator = document.getElementById('passwordStrength');

passwordInput?.addEventListener('input', function() {
    const password = this.value;
    let strength = '';
    
    if (password.length === 0) {
        strengthIndicator.className = 'password-strength';
        return;
    }
    
    if (password.length < 6) {
        strength = 'weak';
    } else if (password.length < 10) {
        strength = 'medium';
    } else {
        strength = 'strong';
    }
    
    strengthIndicator.className = `password-strength ${strength}`;
});

/**
 * SIGN UP - Step 1: Send Verification Email
 */
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const errorDiv = document.getElementById('signup-error');
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    
    errorDiv.textContent = '';
    
    // Validation
    if (!email || !password) {
        errorDiv.textContent = 'Please enter email and password.';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters.';
        return;
    }
    
    // Show loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Store credentials temporarily (will create account after verification)
        pendingCredentials = { email, password };
        
        // Send verification email using action code settings
        const actionCodeSettings = {
            url: window.location.href, // Return to same page after verification
            handleCodeInApp: true
        };
        
        // Create temporary user to send verification
        const tempUser = await auth.createUserWithEmailAndPassword(email, password);
        
        // Send verification email
        await tempUser.user.sendEmailVerification(actionCodeSettings);
        
        // Delete temporary user (will recreate after verification)
        await tempUser.user.delete();
        
        // Show verification notice
        verifyEmailDisplay.textContent = email;
        showAuthTab('verify');
        startResendTimer();
        
    } catch(err) {
        console.error('Signup error:', err);
        
        if (err.code === 'auth/email-already-in-use') {
            errorDiv.textContent = 'This email is already registered. Please log in.';
        } else if (err.code === 'auth/invalid-email') {
            errorDiv.textContent = 'Invalid email address.';
        } else if (err.code === 'auth/weak-password') {
            errorDiv.textContent = 'Password is too weak.';
        } else {
            errorDiv.textContent = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '');
        }
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

/**
 * LOGIN - With Email Verification Check
 */
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    
    errorDiv.textContent = '';
    
    if (!email || !password) {
        errorDiv.textContent = 'Please enter email and password.';
        return;
    }
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Check if email is verified
        if (!userCredential.user.emailVerified) {
            errorDiv.textContent = 'Please verify your email first.';
            verifyEmailDisplay.textContent = email;
            pendingCredentials = { email, password };
            showAuthTab('verify');
            await auth.signOut();
            return;
        }
        
        // Success - auth state observer will handle navigation
        
    } catch(err) {
        console.error('Login error:', err);
        
        if (err.code === 'auth/user-not-found') {
            errorDiv.textContent = 'No account found with this email.';
        } else if (err.code === 'auth/wrong-password') {
            errorDiv.textContent = 'Incorrect password.';
        } else if (err.code === 'auth/invalid-email') {
            errorDiv.textContent = 'Invalid email address.';
        } else if (err.code === 'auth/too-many-requests') {
            errorDiv.textContent = 'Too many failed attempts. Try again later.';
        } else {
            errorDiv.textContent = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '');
        }
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

/**
 * PASSWORD RESET
 */
resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value.trim();
    const errorDiv = document.getElementById('reset-error');
    const successDiv = document.getElementById('reset-success');
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    
    errorDiv.textContent = '';
    successDiv.textContent = '';
    
    if (!email) {
        errorDiv.textContent = 'Please enter your email.';
        return;
    }
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        await auth.sendPasswordResetEmail(email);
        successDiv.textContent = '✓ Password reset link sent to your email!';
        document.getElementById('reset-email').value = '';
        
        setTimeout(() => {
            showAuthTab('login');
        }, 3000);
        
    } catch(err) {
        console.error('Reset error:', err);
        
        if (err.code === 'auth/user-not-found') {
            errorDiv.textContent = 'No account found with this email.';
        } else if (err.code === 'auth/invalid-email') {
            errorDiv.textContent = 'Invalid email address.';
        } else {
            errorDiv.textContent = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '');
        }
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

/**
 * RESEND VERIFICATION EMAIL
 */
resendVerificationBtn?.addEventListener('click', async function() {
    if (!pendingCredentials) {
        alert('Session expired. Please sign up again.');
        showAuthTab('signup');
        return;
    }
    
    const { email, password } = pendingCredentials;
    
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
    
    try {
        // Create temporary user again
        const tempUser = await auth.createUserWithEmailAndPassword(email, password);
        
        // Send verification
        await tempUser.user.sendEmailVerification();
        
        // Delete temporary user
        await tempUser.user.delete();
        
        this.innerHTML = '<i class="fas fa-check"></i> Sent!';
        startResendTimer();
        
    } catch(err) {
        console.error('Resend error:', err);
        this.innerHTML = '<i class="fas fa-times"></i> Error!';
        
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-redo"></i> Resend Email';
            this.disabled = false;
        }, 2000);
    }
});

/**
 * CHANGE EMAIL BUTTON
 */
changeEmailBtn?.addEventListener('click', function() {
    pendingCredentials = null;
    showAuthTab('signup');
});

/**
 * CONTINUE TO APP BUTTON (After Verification)
 */
continueToAppBtn?.addEventListener('click', async function() {
    if (!pendingCredentials) {
        showAuthTab('login');
        return;
    }
    
    const { email, password } = pendingCredentials;
    
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Loading...';
    
    try {
        // Create the actual account now
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Set display name
        const username = email.split('@')[0];
        await userCredential.user.updateProfile({ displayName: username });
        
        // Save to database
        await db.ref('users/' + userCredential.user.uid).set({
            username: username,
            email: email,
            photoURL: userCredential.user.photoURL || '',
            createdAt: Date.now(),
            emailVerified: true
        });
        
        // Clear pending credentials
        pendingCredentials = null;
        
        // Auth state observer will handle navigation to app
        
    } catch(err) {
        console.error('Account creation error:', err);
        
        if (err.code === 'auth/email-already-in-use') {
            // Email already exists, just log in
            try {
                await auth.signInWithEmailAndPassword(email, password);
            } catch(loginErr) {
                alert('Error logging in. Please try again.');
                showAuthTab('login');
            }
        } else {
            alert('Error creating account. Please try again.');
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-arrow-right"></i> Continue to Chemistry Lab';
        }
    }
});

/**
 * RESEND TIMER (60 seconds cooldown)
 */
function startResendTimer() {
    let seconds = 60;
    resendVerificationBtn.disabled = true;
    verifyTimer.style.display = 'block';
    timerCount.textContent = seconds;
    
    if (resendTimer) clearInterval(resendTimer);
    
    resendTimer = setInterval(() => {
        seconds--;
        timerCount.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(resendTimer);
            verifyTimer.style.display = 'none';
            resendVerificationBtn.disabled = false;
            resendVerificationBtn.innerHTML = '<i class="fas fa-redo"></i> Resend Email';
        }
    }, 1000);
}

/**
 * GOOGLE SIGN IN
 */
async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
        const result = await auth.signInWithPopup(provider);
        
        // Save user data if new user
        const userRef = db.ref('users/' + result.user.uid);
        const snapshot = await userRef.once('value');
        
        if (!snapshot.exists()) {
            await userRef.set({
                username: result.user.displayName || 'User',
                email: result.user.email,
                photoURL: result.user.photoURL || '',
                createdAt: Date.now(),
                emailVerified: true
            });
        }
        
    } catch(err) {
        console.error('Google sign in error:', err);
        alert('Failed to sign in with Google. Please try again.');
    }
}

/**
 * SIGN OUT
 */
function signOut() {
    auth.signOut().then(() => {
        console.log('User signed out');
        currentAuthUser = null;
        if (typeof currentForumUser !== 'undefined') {
            currentForumUser = null;
        }
    }).catch(err => {
        console.error('Sign out error:', err);
    });
}

/**
 * CHECK IF EMAIL VERIFICATION LINK WAS CLICKED
 */
function checkEmailVerificationLink() {
    // Check if user came from email verification link
    if (auth.isSignInWithEmailLink(window.location.href)) {
        const email = window.localStorage.getItem('emailForSignIn');
        
        if (email) {
            // Show success screen
            showAuthTab('success');
            
            // Clean up
            window.localStorage.removeItem('emailForSignIn');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

/**
 * AUTH STATE OBSERVER
 * Handles user login/logout state changes
 */
auth.onAuthStateChanged(async user => {
    console.log('Auth state changed:', user ? user.email : 'No user');
    
    if (user) {
        // Check email verification for password users
        if (user.providerData[0]?.providerId === 'password' && !user.emailVerified) {
            console.log('Email not verified, signing out');
            await auth.signOut();
            verifyEmailDisplay.textContent = user.email;
            showAuthTab('verify');
            return;
        }
        
        // User is authenticated and verified
        currentAuthUser = user;
        if (typeof currentForumUser !== 'undefined') {
            currentForumUser = user;
        }
        
        // Hide auth screen, show main app
        authScreen.style.display = 'none';
        mainApp.style.display = 'block';
        
        // Initialize app modules
        console.log('✅ User authenticated:', user.displayName || user.email);
        await initializeApp();
        
    } else {
        // User is signed out
        currentAuthUser = null;
        if (typeof currentForumUser !== 'undefined') {
            currentForumUser = null;
        }
        
        mainApp.style.display = 'none';
        authScreen.style.display = 'flex';
        showAuthTab('signup');
    }
});

/**
 * INITIALIZE APP MODULES
 * Properly load all modules after authentication
 */
async function initializeApp() {
    try {
        console.log('🚀 Initializing app modules...');
        
        // 1. Initialize Periodic Table
        if (typeof initPeriodicTable === 'function') {
            console.log('📊 Loading periodic table...');
            initPeriodicTable();
        }
        
        await delay(100);
        
        // 2. Initialize Molecules
        if (typeof renderMoleculesList === 'function') {
            console.log('🧪 Loading molecules...');
            renderMoleculesList();
        }
        if (typeof initMoleculesSearch === 'function') {
            initMoleculesSearch();
        }
        
        await delay(100);
        
        // 3. Initialize Reactions
        if (typeof initReactionsBuilder === 'function') {
            console.log('⚗️ Loading reactions...');
            initReactionsBuilder();
        }
        if (typeof initReactantSelector === 'function') {
            initReactantSelector();
        }
        
        await delay(100);
        
        // 4. Initialize Forum
        if (typeof initForum === 'function') {
            console.log('💬 Loading forum...');
            initForum();
        }
        if (typeof initNotifications === 'function') {
            console.log('🔔 Loading notifications...');
            initNotifications();
        }
        
        await delay(100);
        
        // 5. Initialize Page Toggle (LAST)
        if (typeof initPageToggle === 'function') {
            console.log('📄 Loading page toggle...');
            initPageToggle();
        }
        
        console.log('✅ All modules loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing modules:', error);
    }
}

/**
 * UTILITY: Delay Function
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * INITIALIZE ON PAGE LOAD
 */
window.addEventListener('load', () => {
    // Check if user came from email verification link
    checkEmailVerificationLink();
    
    console.log('✅ Auth handler initialized');
});

// Export functions to window
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;

console.log('✅ Auth handler loaded');
