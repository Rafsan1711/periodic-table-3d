/**
 * ============================================
 * SECURE AUTHENTICATION HANDLER - WITH ROUTING
 * ✅ Reads displayName & photoURL from DATABASE
 * ✅ Home Screen Integration
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
let verificationCheckInterval = null;
let resendTimer = null;

/**
 * Check if we're on home page or app page
 */
function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path === '/index.html' || path.endsWith('/');
}

/**
 * Show Auth Tab (Signup, Login, Reset)
 */
function showAuthTab(tab) {
    // Only show tabs if we have the elements (app page only)
    if (!signupForm || !loginForm) return;
    
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

// Initialize with signup tab (if on app page)
if (!isHomePage()) {
    showAuthTab('signup');
}

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
 * SIGN UP
 */
signupForm?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const errorDiv = document.getElementById('signup-error');
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    
    errorDiv.textContent = '';
    
    if (!email || !password) {
        errorDiv.textContent = 'Please enter email and password.';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters.';
        return;
    }
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        const username = email.split('@')[0];
        await user.updateProfile({ displayName: username });
        
        await db.ref('users/' + user.uid).set({
            username: username,
            email: email,
            photoURL: '',
            createdAt: Date.now(),
            emailVerified: false
        });
        
        await user.sendEmailVerification({
            url: window.location.origin + '/app.html',
            handleCodeInApp: false
        });
        
        window.localStorage.setItem('verificationEmail', email);
        window.localStorage.setItem('verificationPassword', password);
        
        await auth.signOut();
        
        if (verifyEmailDisplay) {
            verifyEmailDisplay.textContent = email;
        }
        showAuthTab('verify');
        startResendTimer();
        startVerificationCheck(email, password);
        
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
 * START VERIFICATION CHECK
 */
function startVerificationCheck(email, password) {
    if (verificationCheckInterval) {
        clearInterval(verificationCheckInterval);
    }
    
    console.log('🔍 Starting verification check...');
    
    verificationCheckInterval = setInterval(async () => {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            await userCredential.user.reload();
            
            if (userCredential.user.emailVerified) {
                console.log('✅ Email verified!');
                clearInterval(verificationCheckInterval);
                
                await db.ref('users/' + userCredential.user.uid).update({
                    emailVerified: true
                });
                
                window.localStorage.removeItem('verificationEmail');
                window.localStorage.removeItem('verificationPassword');
                
                showAuthTab('success');
                
                setTimeout(() => {
                    // Auth state observer will handle navigation
                }, 2000);
            } else {
                await auth.signOut();
            }
        } catch (err) {
            console.log('Verification check error:', err.code);
        }
    }, 3000);
}

/**
 * LOGIN
 */
loginForm?.addEventListener('submit', async function(e) {
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
        await userCredential.user.reload();
        
        if (!userCredential.user.emailVerified) {
            errorDiv.textContent = 'Please verify your email first.';
            if (verifyEmailDisplay) {
                verifyEmailDisplay.textContent = email;
            }
            
            window.localStorage.setItem('verificationEmail', email);
            window.localStorage.setItem('verificationPassword', password);
            
            showAuthTab('verify');
            startResendTimer();
            startVerificationCheck(email, password);
            await auth.signOut();
            return;
        }
        
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
resetForm?.addEventListener('submit', async function(e) {
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
    const email = window.localStorage.getItem('verificationEmail');
    const password = window.localStorage.getItem('verificationPassword');
    
    if (!email || !password) {
        alert('Session expired. Please sign up again.');
        showAuthTab('signup');
        return;
    }
    
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        await userCredential.user.sendEmailVerification();
        await auth.signOut();
        
        this.innerHTML = '<i class="fas fa-check"></i> Sent!';
        startResendTimer();
        
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-redo"></i> Resend Email';
        }, 2000);
        
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
    window.localStorage.removeItem('verificationEmail');
    window.localStorage.removeItem('verificationPassword');
    
    if (verificationCheckInterval) {
        clearInterval(verificationCheckInterval);
    }
    
    showAuthTab('signup');
});

/**
 * CONTINUE TO APP BUTTON
 */
continueToAppBtn?.addEventListener('click', async function() {
    verificationSuccess.style.display = 'none';
});

/**
 * RESEND TIMER
 */
function startResendTimer() {
    if (!verifyTimer || !timerCount || !resendVerificationBtn) return;
    
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
        const user = result.user;
        
        console.log('✅ Google Sign In - Raw Data:');
        console.log('  displayName:', user.displayName);
        console.log('  photoURL:', user.photoURL);
        console.log('  email:', user.email);
        
        const googleDisplayName = user.displayName || user.email.split('@')[0] || 'User';
        const googlePhotoURL = user.photoURL || '';
        
        await user.updateProfile({
            displayName: googleDisplayName,
            photoURL: googlePhotoURL
        });
        
        const userRef = db.ref('users/' + user.uid);
        const snapshot = await userRef.once('value');
        
        const userData = {
            username: googleDisplayName,
            email: user.email,
            photoURL: googlePhotoURL,
            emailVerified: true
        };
        
        if (!snapshot.exists()) {
            userData.createdAt = Date.now();
            await userRef.set(userData);
            console.log('✅ New Google user created:', userData);
        } else {
            await userRef.update(userData);
            console.log('✅ Google user updated:', userData);
        }
        
        console.log('✅ Google Sign In Complete!');
        
    } catch(err) {
        console.error('Google sign in error:', err);
        
        if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
            return;
        }
        
        alert('Failed to sign in with Google. Please try again.');
    }
}

/**
 * SIGN OUT
 */
function signOut() {
    if (verificationCheckInterval) {
        clearInterval(verificationCheckInterval);
    }
    
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
 * ✅ AUTH STATE OBSERVER - WITH HOME PAGE ROUTING
 */
auth.onAuthStateChanged(async user => {
    console.log('🔍 Auth state changed:', user ? user.email : 'No user');
    
    if (user) {
        await user.reload();
        
        // Check email verification for password users
        if (user.providerData[0]?.providerId === 'password' && !user.emailVerified) {
            console.log('⚠️ Email not verified, waiting...');
            await auth.signOut();
            
            const storedEmail = window.localStorage.getItem('verificationEmail');
            if (storedEmail && !isHomePage()) {
                if (verifyEmailDisplay) {
                    verifyEmailDisplay.textContent = storedEmail;
                }
                showAuthTab('verify');
                
                const storedPassword = window.localStorage.getItem('verificationPassword');
                if (storedPassword) {
                    startVerificationCheck(storedEmail, storedPassword);
                }
            } else {
                if (!isHomePage()) {
                    showAuthTab('login');
                }
            }
            return;
        }
        
        // ✅ Read from DATABASE
        try {
            const userRef = db.ref('users/' + user.uid);
            const snapshot = await userRef.once('value');
            const userData = snapshot.val();
            
            console.log('📦 User data from database:', userData);
            
            if (userData) {
                currentAuthUser = user;
                
                if (typeof currentForumUser !== 'undefined') {
                    currentForumUser = {
                        uid: user.uid,
                        displayName: userData.username || user.displayName || user.email.split('@')[0],
                        photoURL: userData.photoURL || user.photoURL || '',
                        email: user.email
                    };
                    
                    console.log('✅ currentForumUser set from DATABASE:', currentForumUser);
                }
            } else {
                console.warn('⚠️ No database entry, using Firebase Auth data');
                currentAuthUser = user;
                
                if (typeof currentForumUser !== 'undefined') {
                    currentForumUser = {
                        uid: user.uid,
                        displayName: user.displayName || user.email.split('@')[0],
                        photoURL: user.photoURL || '',
                        email: user.email
                    };
                }
            }
        } catch (dbError) {
            console.error('❌ Database read error:', dbError);
            currentAuthUser = user;
            if (typeof currentForumUser !== 'undefined') {
                currentForumUser = {
                    uid: user.uid,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || '',
                    email: user.email
                };
            }
        }
        
        window.localStorage.removeItem('verificationEmail');
        window.localStorage.removeItem('verificationPassword');
        
        if (verificationCheckInterval) {
            clearInterval(verificationCheckInterval);
        }
        
        // ✅ ROUTING LOGIC
        if (isHomePage()) {
            // On home page - update button to "Launch App"
            console.log('✅ User on home page - showing Launch App button');
            // Button update handled by home-init.js
        } else {
            // On app page - show main app
            console.log('✅ User on app page - showing main app');
            if (authScreen) authScreen.style.display = 'none';
            if (mainApp) mainApp.style.display = 'block';
            
            await initializeApp();
        }
        
    } else {
        // User signed out
        currentAuthUser = null;
        if (typeof currentForumUser !== 'undefined') {
            currentForumUser = null;
        }
        
        if (isHomePage()) {
            // On home page - stay on home
            console.log('✅ Guest on home page');
        } else {
            // On app page - show auth screen
            console.log('✅ Guest on app page - showing auth');
            if (mainApp) mainApp.style.display = 'none';
            if (authScreen) authScreen.style.display = 'flex';
            
            const storedEmail = window.localStorage.getItem('verificationEmail');
            if (storedEmail) {
                if (verifyEmailDisplay) {
                    verifyEmailDisplay.textContent = storedEmail;
                }
                showAuthTab('verify');
            } else {
                showAuthTab('signup');
            }
        }
    }
});

/**
 * INITIALIZE APP MODULES
 */
async function initializeApp() {
    try {
        console.log('🚀 Initializing app modules...');
        
        if (typeof initPeriodicTable === 'function') {
            console.log('📊 Loading periodic table...');
            initPeriodicTable();
        }
        
        await delay(100);
        
        if (typeof renderMoleculesList === 'function') {
            console.log('🧪 Loading molecules...');
            renderMoleculesList();
        }
        if (typeof initMoleculesSearch === 'function') {
            initMoleculesSearch();
        }
        
        await delay(100);
        
        if (typeof initReactionsBuilder === 'function') {
            console.log('⚗️ Loading reactions...');
            initReactionsBuilder();
        }
        if (typeof initReactantSelector === 'function') {
            initReactantSelector();
        }
        
        await delay(100);
        
        if (typeof initForum === 'function') {
            console.log('💬 Loading forum...');
            initForum();
        }
        if (typeof initNotifications === 'function') {
            console.log('🔔 Loading notifications...');
            initNotifications();
        }
        
        await delay(100);
        
        if (typeof initPageToggle === 'function') {
            console.log('🔄 Loading page toggle...');
            initPageToggle();
        }
        
        console.log('✅ All modules loaded!');
        
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
 * CHECK ON PAGE LOAD
 */
window.addEventListener('load', () => {
    const storedEmail = window.localStorage.getItem('verificationEmail');
    const storedPassword = window.localStorage.getItem('verificationPassword');
    
    if (storedEmail && storedPassword && !isHomePage()) {
        console.log('🔍 Found stored credentials, checking verification...');
        startVerificationCheck(storedEmail, storedPassword);
    }
    
    console.log('✅ Auth handler initialized');
});

// Export functions
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;

console.log('✅ Auth handler loaded');
