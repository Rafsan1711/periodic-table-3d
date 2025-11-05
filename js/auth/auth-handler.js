/**
 * SECURE Authentication Handler with Email Verification
 * File: js/auth/auth-handler.js (REPLACE FULL FILE)
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
const gotoLogin3 = document.getElementById('goto-login3');
const verifyEmailNotice = document.getElementById('verify-email-notice');
const resendVerificationBtn = document.getElementById('resend-verification');
const checkVerificationBtn = document.getElementById('check-verification');

let currentAuthUser = null;
let verificationCheckInterval = null;

// Tab Switching
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
    
    clearErrors();
}

// Clear all error messages
function clearErrors() {
    document.getElementById('signup-error').textContent = '';
    document.getElementById('login-error').textContent = '';
    document.getElementById('reset-error').textContent = '';
    document.getElementById('reset-success').textContent = '';
}

// Event Listeners for Tab Switching
if (showSignupBtn) showSignupBtn.onclick = () => showAuthTab('signup');
if (showLoginBtn) showLoginBtn.onclick = () => showAuthTab('login');
if (gotoLogin) gotoLogin.onclick = () => showAuthTab('login');
if (gotoSignup) gotoSignup.onclick = () => showAuthTab('signup');
if (gotoReset) gotoReset.onclick = () => showAuthTab('reset');
if (gotoLogin2) gotoLogin2.onclick = () => showAuthTab('login');
if (gotoLogin3) gotoLogin3.onclick = () => showAuthTab('login');

// Initialize default tab
showAuthTab('signup');

/**
 * PASSWORD STRENGTH CHECKER
 */
const passwordInput = document.getElementById('signup-password');
const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');

if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        
        strengthFill.className = 'strength-fill';
        
        if (password.length === 0) {
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Password strength';
            return;
        }
        
        if (strength.score < 3) {
            strengthFill.classList.add('weak');
            strengthText.textContent = '❌ Weak password';
            strengthText.style.color = 'var(--accent-red)';
        } else if (strength.score < 5) {
            strengthFill.classList.add('medium');
            strengthText.textContent = '⚠️ Medium strength';
            strengthText.style.color = 'var(--accent-orange)';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = '✅ Strong password';
            strengthText.style.color = 'var(--accent-green)';
        }
    });
}

function checkPasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    return { score };
}

/**
 * PASSWORD VISIBILITY TOGGLE
 */
const toggleSignupPassword = document.getElementById('toggle-signup-password');
const toggleLoginPassword = document.getElementById('toggle-login-password');

if (toggleSignupPassword) {
    toggleSignupPassword.addEventListener('click', function() {
        const input = document.getElementById('signup-password');
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
            this.classList.add('active');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
            this.classList.remove('active');
        }
    });
}

if (toggleLoginPassword) {
    toggleLoginPassword.addEventListener('click', function() {
        const input = document.getElementById('login-password');
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
            this.classList.add('active');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
            this.classList.remove('active');
        }
    });
}

/**
 * SIGN UP with Email Verification
 */
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const acceptTerms = document.getElementById('accept-terms').checked;
    const errorDiv = document.getElementById('signup-error');
    
    errorDiv.textContent = '';
    
    // Validation
    if (!name || !email || !password) {
        errorDiv.textContent = '❌ Please fill in all fields.';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = '❌ Password must be at least 6 characters.';
        return;
    }
    
    if (!acceptTerms) {
        errorDiv.textContent = '❌ Please accept the Terms & Conditions.';
        return;
    }
    
    // Show loading
    const submitBtn = signupForm.querySelector('.auth-submit-btn');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    
    try {
        // Create user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update display name
        await user.updateProfile({
            displayName: name
        });
        
        // Save user data to database
        await db.ref('users/' + user.uid).set({
            username: name,
            email: email,
            photoURL: user.photoURL || '',
            createdAt: Date.now(),
            emailVerified: false
        });
        
        // Send verification email with custom template
        await sendVerificationEmail(user);
        
        // Show verification notice
        document.getElementById('verify-email-address').textContent = email;
        signupForm.style.display = 'none';
        verifyEmailNotice.style.display = 'block';
        
        // Start checking verification status
        startVerificationCheck(user);
        
        console.log('✅ Account created, verification email sent');
        
    } catch(err) {
        console.error('Signup error:', err);
        let message = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '').trim();
        
        if (err.code === 'auth/email-already-in-use') {
            message = '❌ This email is already registered. Please login instead.';
        } else if (err.code === 'auth/invalid-email') {
            message = '❌ Please enter a valid email address.';
        } else if (err.code === 'auth/weak-password') {
            message = '❌ Password is too weak. Use at least 6 characters.';
        }
        
        errorDiv.textContent = message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});

/**
 * SEND VERIFICATION EMAIL with Firebase Template
 */
async function sendVerificationEmail(user) {
    const actionCodeSettings = {
        url: window.location.origin + '?verified=true',
        handleCodeInApp: true
    };
    
    try {
        await user.sendEmailVerification(actionCodeSettings);
        console.log('📧 Verification email sent to:', user.email);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
}

/**
 * START VERIFICATION CHECK (Auto-refresh)
 */
function startVerificationCheck(user) {
    if (verificationCheckInterval) {
        clearInterval(verificationCheckInterval);
    }
    
    verificationCheckInterval = setInterval(async () => {
        try {
            await user.reload();
            
            if (user.emailVerified) {
                clearInterval(verificationCheckInterval);
                
                // Update database
                await db.ref('users/' + user.uid).update({
                    emailVerified: true,
                    verifiedAt: Date.now()
                });
                
                // Show success and redirect
                showNotification('✅ Email verified successfully! Welcome!', 'success');
                
                // Wait a bit then show main app
                setTimeout(() => {
                    verifyEmailNotice.style.display = 'none';
                    authScreen.style.display = 'none';
                    mainApp.style.display = 'block';
                    initializeApp();
                }, 1500);
            }
        } catch (error) {
            console.error('Error checking verification:', error);
        }
    }, 3000); // Check every 3 seconds
}

/**
 * RESEND VERIFICATION EMAIL
 */
if (resendVerificationBtn) {
    resendVerificationBtn.addEventListener('click', async function() {
        const user = auth.currentUser;
        
        if (!user) {
            showNotification('❌ No user found. Please sign up again.', 'error');
            return;
        }
        
        this.disabled = true;
        const originalHTML = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            await sendVerificationEmail(user);
            showNotification('✅ Verification email sent! Check your inbox.', 'success');
            
            // Show countdown
            let countdown = 60;
            this.innerHTML = `<i class="fas fa-clock"></i> Wait ${countdown}s`;
            
            const countdownInterval = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    this.disabled = false;
                    this.innerHTML = originalHTML;
                } else {
                    this.innerHTML = `<i class="fas fa-clock"></i> Wait ${countdown}s`;
                }
            }, 1000);
            
        } catch (error) {
            console.error('Resend error:', error);
            showNotification('❌ Failed to send email. Try again later.', 'error');
            this.disabled = false;
            this.innerHTML = originalHTML;
        }
    });
}

/**
 * CHECK VERIFICATION MANUALLY
 */
if (checkVerificationBtn) {
    checkVerificationBtn.addEventListener('click', async function() {
        const user = auth.currentUser;
        
        if (!user) {
            showNotification('❌ No user found.', 'error');
            return;
        }
        
        this.disabled = true;
        const originalHTML = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        
        try {
            await user.reload();
            
            if (user.emailVerified) {
                // Update database
                await db.ref('users/' + user.uid).update({
                    emailVerified: true,
                    verifiedAt: Date.now()
                });
                
                clearInterval(verificationCheckInterval);
                showNotification('✅ Email verified! Welcome!', 'success');
                
                setTimeout(() => {
                    verifyEmailNotice.style.display = 'none';
                    authScreen.style.display = 'none';
                    mainApp.style.display = 'block';
                    initializeApp();
                }, 1500);
            } else {
                showNotification('⚠️ Email not verified yet. Check your inbox.', 'info');
            }
        } catch (error) {
            console.error('Check verification error:', error);
            showNotification('❌ Error checking verification.', 'error');
        } finally {
            this.disabled = false;
            this.innerHTML = originalHTML;
        }
    });
}

/**
 * LOGIN with Email Verification Check
 */
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.textContent = '';
    
    if (!email || !password) {
        errorDiv.textContent = '❌ Please enter email and password.';
        return;
    }
    
    const submitBtn = loginForm.querySelector('.auth-submit-btn');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging In...';
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check email verification
        if (!user.emailVerified) {
            await auth.signOut();
            
            // Show verification notice
            document.getElementById('verify-email-address').textContent = email;
            loginForm.style.display = 'none';
            verifyEmailNotice.style.display = 'block';
            
            errorDiv.textContent = '';
            
            showNotification('⚠️ Please verify your email first.', 'info');
            return;
        }
        
        // Login successful
        console.log('✅ Login successful:', user.email);
        
    } catch(err) {
        console.error('Login error:', err);
        let message = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '').trim();
        
        if (err.code === 'auth/user-not-found') {
            message = '❌ No account found with this email.';
        } else if (err.code === 'auth/wrong-password') {
            message = '❌ Incorrect password.';
        } else if (err.code === 'auth/invalid-email') {
            message = '❌ Invalid email address.';
        } else if (err.code === 'auth/too-many-requests') {
            message = '❌ Too many attempts. Please try again later.';
        }
        
        errorDiv.textContent = message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});

/**
 * RESET PASSWORD
 */
resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value.trim();
    const errorDiv = document.getElementById('reset-error');
    const successDiv = document.getElementById('reset-success');
    
    errorDiv.textContent = '';
    successDiv.textContent = '';
    
    if (!email) {
        errorDiv.textContent = '❌ Please enter your email address.';
        return;
    }
    
    const submitBtn = resetForm.querySelector('.auth-submit-btn');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
        await auth.sendPasswordResetEmail(email);
        successDiv.textContent = '✅ Password reset link sent to your email!';
        
        setTimeout(() => {
            showAuthTab('login');
        }, 3000);
        
    } catch(err) {
        console.error('Reset error:', err);
        let message = err.message.replace('Firebase:', '').replace(/\(auth.*\)/, '').trim();
        
        if (err.code === 'auth/user-not-found') {
            message = '❌ No account found with this email.';
        } else if (err.code === 'auth/invalid-email') {
            message = '❌ Invalid email address.';
        }
        
        errorDiv.textContent = message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});

/**
 * GOOGLE SIGN IN
 */
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then(async (result) => {
            const user = result.user;
            
            // Google accounts are auto-verified
            await db.ref('users/' + user.uid).set({
                username: user.displayName || 'User',
                email: user.email,
                photoURL: user.photoURL || '',
                createdAt: Date.now(),
                emailVerified: true,
                provider: 'google'
            });
            
            console.log('✅ Google sign in successful');
        })
        .catch(err => {
            console.error('Google sign in error:', err);
            showNotification('❌ Google sign in failed', 'error');
        });
}

/**
 * SIGN OUT
 */
function signOut() {
    auth.signOut().then(() => {
        if (verificationCheckInterval) {
            clearInterval(verificationCheckInterval);
        }
        console.log('✅ User signed out');
        showNotification('👋 Signed out successfully', 'success');
    }).catch(err => {
        console.error('Sign out error:', err);
    });
}

/**
 * AUTH STATE OBSERVER
 */
auth.onAuthStateChanged(async user => {
    if (user && user.emailVerified) {
        currentAuthUser = user;
        currentForumUser = user;
        
        authScreen.style.display = 'none';
        mainApp.style.display = 'block';
        
        console.log('✅ User authenticated:', user.email);
        await initializeApp();
        
    } else if (user && !user.emailVerified) {
        // User logged in but not verified
        document.getElementById('verify-email-address').textContent = user.email;
        signupForm.style.display = 'none';
        loginForm.style.display = 'none';
        verifyEmailNotice.style.display = 'block';
        
        startVerificationCheck(user);
        
    } else {
        // No user
        currentAuthUser = null;
        currentForumUser = null;
        mainApp.style.display = 'none';
        authScreen.style.display = 'flex';
        showAuthTab('signup');
        
        if (verificationCheckInterval) {
            clearInterval(verificationCheckInterval);
        }
    }
});

/**
 * INITIALIZE APP
 */
async function initializeApp() {
    try {
        if (typeof initPeriodicTable === 'function') {
            console.log('📊 Initializing periodic table...');
            initPeriodicTable();
        }
        
        await delay(100);
        
        if (typeof renderMoleculesList === 'function') {
            console.log('🧪 Initializing molecules list...');
            renderMoleculesList();
        }
        if (typeof initMoleculesSearch === 'function') {
            console.log('🔍 Initializing molecules search...');
            initMoleculesSearch();
        }
        
        await delay(100);
        
        if (typeof initReactionsBuilder === 'function') {
            console.log('⚗️ Initializing reactions builder...');
            initReactionsBuilder();
        }
        if (typeof initReactantSelector === 'function') {
            console.log('🔬 Initializing reactant selector...');
            initReactantSelector();
        }
        
        await delay(100);
        
        if (typeof initForum === 'function') {
            console.log('💥 Initializing forum...');
            initForum();
        }
        if (typeof initNotifications === 'function') {
            console.log('🔔 Initializing notifications...');
            initNotifications();
        }
        
        await delay(100);
        
        if (typeof initPageToggle === 'function') {
            console.log('🔄 Initializing page toggle...');
            initPageToggle();
        }
        
        console.log('✅ All modules initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing modules:', error);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Make functions global
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;

console.log('✅ Secure Auth handler loaded with Email Verification');
