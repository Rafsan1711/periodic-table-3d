/**
 * Authentication Handler - WITH PREMIUM LOADER
 */

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

let currentAuthUser = null;

function showAuthTab(tab) {
    signupForm.style.display = tab === 'signup' ? 'flex' : 'none';
    loginForm.style.display = tab === 'login' ? 'flex' : 'none';
    resetForm.style.display = tab === 'reset' ? 'flex' : 'none';
    verifyEmailNotice.style.display = 'none';
    
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

if (showSignupBtn) showSignupBtn.onclick = () => showAuthTab('signup');
if (showLoginBtn) showLoginBtn.onclick = () => showAuthTab('login');
if (gotoLogin) gotoLogin.onclick = () => showAuthTab('login');
if (gotoSignup) gotoSignup.onclick = () => showAuthTab('signup');
if (gotoReset) gotoReset.onclick = () => showAuthTab('reset');
if (gotoLogin2) gotoLogin2.onclick = () => showAuthTab('login');

showAuthTab('signup');

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
    
    // SHOW LOADER
    showGlobalLoader('Creating account...');
    
    try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        
        if (cred.user) {
            let username = cred.user.displayName || email.split('@')[0] || 'Anonymous';
            await cred.user.updateProfile({displayName: username});
            
            await db.ref('users/' + cred.user.uid).set({
                username: username,
                email: email,
                photoURL: '',
                createdAt: Date.now()
            });
            
            await cred.user.sendEmailVerification();
            verifyEmailNotice.style.display = 'block';
            signupForm.style.display = 'none';
            errorDiv.textContent = '';
        }
    } catch(err) {
        errorDiv.textContent = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '');
    } finally {
        hideGlobalLoader();
    }
});

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = '';
    
    // SHOW LOADER
    showGlobalLoader('Signing in...');
    
    try {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        
        if (cred.user && !cred.user.emailVerified) {
            errorDiv.textContent = '';
            loginForm.style.display = 'none';
            verifyEmailNotice.style.display = 'block';
            await auth.signOut();
            hideGlobalLoader();
            return;
        }
    } catch(err) {
        errorDiv.textContent = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '');
    } finally {
        hideGlobalLoader();
    }
});

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
    
    showGlobalLoader('Sending reset link...');
    
    try {
        await auth.sendPasswordResetEmail(email);
        successDiv.textContent = 'A reset link has been sent to your email.';
    } catch(err) {
        errorDiv.textContent = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '');
    } finally {
        hideGlobalLoader();
    }
});

if (resendVerificationBtn) {
    resendVerificationBtn.onclick = async function() {
        if (auth.currentUser) {
            showGlobalLoader('Sending verification email...');
            try {
                await auth.currentUser.sendEmailVerification();
                resendVerificationBtn.textContent = "Sent!";
                setTimeout(() => {
                    resendVerificationBtn.textContent = "Resend Verification Email";
                }, 3000);
            } catch (err) {
                resendVerificationBtn.textContent = "Error!";
            } finally {
                hideGlobalLoader();
            }
        }
    };
}

function signInWithGoogle() {
    showGlobalLoader('Signing in with Google...');
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => {
        console.error('Google sign in error:', err);
        alert('Failed to sign in with Google');
        hideGlobalLoader();
    });
}

function signOut() {
    showGlobalLoader('Signing out...');
    auth.signOut().then(() => {
        console.log('User signed out');
        hideGlobalLoader();
    }).catch(err => {
        console.error('Sign out error:', err);
        hideGlobalLoader();
    });
}

/**
 * Auth State Observer - WITH LOADER
 */
auth.onAuthStateChanged(async user => {
    if (user) {
        if (user.providerData[0].providerId === 'password' && !user.emailVerified) {
            await auth.signOut();
            showAuthTab('login');
            if (verifyEmailNotice) verifyEmailNotice.style.display = 'block';
            return;
        }
        
        currentAuthUser = user;
        currentForumUser = user;
        
        authScreen.style.display = 'none';
        mainApp.style.display = 'block';
        
        // SHOW LOADER DURING INITIALIZATION
        showGlobalLoader('Initializing app...');
        
        console.log('Initializing app for user:', currentAuthUser.displayName);
        await initializeApp();
        
        hideGlobalLoader();
        
    } else {
        currentAuthUser = null;
        currentForumUser = null;
        mainApp.style.display = 'none';
        authScreen.style.display = 'flex';
        showAuthTab('signup');
    }
});

/**
 * Initialize app with loader for each module
 */
async function initializeApp() {
    try {
        // 1. Initialize Periodic Table
        if (typeof initPeriodicTable === 'function') {
            console.log('📊 Initializing periodic table...');
            initPeriodicTable();
        }
        
        await delay(100);
        
        // 2. Initialize Molecules
        if (typeof renderMoleculesList === 'function') {
            console.log('🧪 Initializing molecules list...');
            renderMoleculesList();
        }
        if (typeof initMoleculesSearch === 'function') {
            console.log('🔍 Initializing molecules search...');
            initMoleculesSearch();
        }
        
        await delay(100);
        
        // 3. Initialize Reactions
        if (typeof initReactionsBuilder === 'function') {
            console.log('⚗️ Initializing reactions builder...');
            initReactionsBuilder();
        }
        if (typeof initReactantSelector === 'function') {
            console.log('🔬 Initializing reactant selector...');
            initReactantSelector();
        }
        
        await delay(100);
        
        // 4. Initialize Forum
        if (typeof initForum === 'function') {
            console.log('👥 Initializing forum...');
            initForum();
        }
        if (typeof initNotifications === 'function') {
            console.log('🔔 Initializing notifications...');
            initNotifications();
        }
        
        await delay(100);
        
        // 5. Initialize Page Toggle (LAST)
        if (typeof initPageToggle === 'function') {
            console.log('🔄 Initializing page toggle...');
            initPageToggle();
        }
        
        console.log('✅ All modules initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing modules:', error);
        hideGlobalLoader();
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;

console.log('✅ Auth handler loaded (WITH LOADER)');
