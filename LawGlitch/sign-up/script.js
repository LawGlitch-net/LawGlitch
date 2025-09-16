// Global variables
let currentForm = 'login';
let otpTimer = 60;
let timerInterval;

// Utility functions
function redirectToHome() {
    window.location.href = '../home/index.html';
}

// Form switching functions
function showLogin() {
    hideAllForms();
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('googleSignin').classList.remove('hidden');
    currentForm = 'login';
}

function showSignup() {
    hideAllForms();
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('googleSignin').classList.remove('hidden');
    currentForm = 'signup';
}

function showOTP(phoneNumber) {
    hideAllForms();
    document.getElementById('otpForm').classList.remove('hidden');
    document.getElementById('googleSignin').classList.add('hidden');
    document.getElementById('otpPhoneNumber').textContent = `+91 ${phoneNumber}`;
    startOTPTimer();
    currentForm = 'otp';
}

function showForgotPassword() {
    hideAllForms();
    document.getElementById('forgotForm').classList.remove('hidden');
    document.getElementById('googleSignin').classList.add('hidden');
    currentForm = 'forgot';
}

function showResetPassword() {
    hideAllForms();
    document.getElementById('resetForm').classList.remove('hidden');
    document.getElementById('googleSignin').classList.add('hidden');
    currentForm = 'reset';
}

function hideAllForms() {
    const forms = ['loginForm', 'signupForm', 'otpForm', 'forgotForm', 'resetForm'];
    forms.forEach(formId => {
        document.getElementById(formId).classList.add('hidden');
    });
}

// OTP functionality
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-digit');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Only allow numbers
            if (!/^\d*$/.test(value)) {
                e.target.value = '';
                return;
            }
            
            // Move to next input
            if (value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            // Move to previous input on backspace
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
        
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = e.clipboardData.getData('text');
            const digits = paste.replace(/\D/g, '').slice(0, 6);
            
            digits.split('').forEach((digit, i) => {
                if (otpInputs[i]) {
                    otpInputs[i].value = digit;
                }
            });
            
            if (digits.length > 0) {
                const lastIndex = Math.min(digits.length - 1, otpInputs.length - 1);
                otpInputs[lastIndex].focus();
            }
        });
    });
}

function startOTPTimer() {
    otpTimer = 60;
    const timerElement = document.getElementById('timer');
    const resendButton = document.getElementById('resendOtp');
    
    resendButton.classList.add('hidden');
    
    timerInterval = setInterval(() => {
        timerElement.textContent = otpTimer;
        otpTimer--;
        
        if (otpTimer < 0) {
            clearInterval(timerInterval);
            document.querySelector('.otp-timer p').classList.add('hidden');
            resendButton.classList.remove('hidden');
        }
    }, 1000);
}

// Form validation
function validatePhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
}

function validatePassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

function validateOTP() {
    const otpInputs = document.querySelectorAll('.otp-digit');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    return otp.length === 6 && /^\d{6}$/.test(otp);
}

// Success message functions
function showSuccess(title, message) {
    document.getElementById('successText').textContent = message || title;
    document.getElementById('successMessage').classList.remove('hidden');
}

function closeSuccess() {
    document.getElementById('successMessage').classList.add('hidden');
}

// Backend API Functions (Placeholder for future implementation)
const AuthAPI = {
    // Login with phone and password
    login: async (phone, password) => {
        try {
            // TODO: Replace with actual Supabase/Firebase auth call
            console.log('Login attempt:', { phone, password });
            
            // Placeholder response - replace with actual API call
            const response = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({ 
                        success: true, 
                        user: { id: 'user123', phone: phone } 
                    });
                }, 1000);
            });
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Sign up with user data
    signup: async (userData) => {
        try {
            // TODO: Replace with actual Supabase/Firebase auth call
            console.log('Signup attempt:', userData);
            
            // Placeholder response - replace with actual API call
            const response = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({ 
                        success: true, 
                        message: 'OTP sent successfully' 
                    });
                }, 1000);
            });
            
            return response;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    },

    // Verify OTP
    verifyOTP: async (phone, otp) => {
        try {
            // TODO: Replace with actual Supabase/Firebase OTP verification
            console.log('OTP verification:', { phone, otp });
            
            // Placeholder response - replace with actual API call
            const response = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({ 
                        success: true, 
                        user: { id: 'user123', phone: phone } 
                    });
                }, 1000);
            });
            
            return response;
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    },

    // Send reset password OTP
    forgotPassword: async (phone) => {
        try {
            // TODO: Replace with actual password reset flow
            console.log('Forgot password for:', phone);
            
            // Placeholder response - replace with actual API call
            const response = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({ 
                        success: true, 
                        message: 'Reset OTP sent successfully' 
                    });
                }, 1000);
            });
            
            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    // Reset password
    resetPassword: async (phone, newPassword, otp) => {
        try {
            // TODO: Replace with actual password reset
            console.log('Password reset for:', { phone, newPassword, otp });
            
            // Placeholder response - replace with actual API call
            const response = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({ 
                        success: true, 
                        message: 'Password updated successfully' 
                    });
                }, 1000);
            });
            
            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },

    // Google Sign In
    signInWithGoogle: async () => {
        try {
            // TODO: Replace with actual Google Auth implementation
            console.log('Google sign in initiated');
            
            // Placeholder response - replace with actual API call
            const response = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({ 
                        success: true, 
                        user: { id: 'google123', email: 'user@gmail.com' } 
                    });
                }, 1000);
            });
            
            return response;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    }
};

// Form submission handlers
async function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!validatePhone(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    if (!password) {
        alert('Please enter your password');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        // Call backend API
        const response = await AuthAPI.login(phone, password);
        
        if (response.success) {
            showSuccess('Login Successful!', 'Welcome back to LawGlitch!');
            // Redirect after 2 seconds
            setTimeout(redirectToHome, 2000);
        } else {
            alert(response.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        alert('Login failed. Please check your credentials and try again.');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('.submit-btn');
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value;
    const state = document.getElementById('signupState').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name) {
        alert('Please enter your full name');
        return;
    }
    
    if (!validatePhone(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    if (!state) {
        alert('Please select your state');
        return;
    }
    
    if (!validatePassword(password)) {
        alert('Password must be at least 8 characters with uppercase, lowercase, and number');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending OTP...';
        submitBtn.disabled = true;
        
        // Call backend API
        const userData = { name, phone, state, password };
        const response = await AuthAPI.signup(userData);
        
        if (response.success) {
            // Show OTP form
            showOTP(phone);
        } else {
            alert(response.message || 'Signup failed. Please try again.');
        }
    } catch (error) {
        alert('Signup failed. Please try again.');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('.submit-btn');
        submitBtn.textContent = 'Send OTP';
        submitBtn.disabled = false;
    }
}

async function handleOTP(e) {
    e.preventDefault();
    
    if (!validateOTP()) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }
    
    const otpInputs = document.querySelectorAll('.otp-digit');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    const phone = document.getElementById('signupPhone').value;
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;
        
        // Call backend API
        const response = await AuthAPI.verifyOTP(phone, otp);
        
        if (response.success) {
            showSuccess('Account Created Successfully!', 'Welcome to LawGlitch! Your account has been created and verified.');
            // Redirect after 2 seconds
            setTimeout(redirectToHome, 2000);
        } else {
            alert(response.message || 'OTP verification failed. Please try again.');
        }
    } catch (error) {
        alert('OTP verification failed. Please try again.');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('.submit-btn');
        submitBtn.textContent = 'Verify & Sign Up';
        submitBtn.disabled = false;
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const phone = document.getElementById('forgotPhone').value;
    
    if (!validatePhone(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending OTP...';
        submitBtn.disabled = true;
        
        // Call backend API
        const response = await AuthAPI.forgotPassword(phone);
        
        if (response.success) {
            showSuccess('OTP Sent!', 'Password reset OTP has been sent to your phone number.');
            setTimeout(() => {
                closeSuccess();
                showResetPassword();
            }, 1500);
        } else {
            alert(response.message || 'Failed to send OTP. Please try again.');
        }
    } catch (error) {
        alert('Failed to send OTP. Please try again.');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('.submit-btn');
        submitBtn.textContent = 'Send OTP';
        submitBtn.disabled = false;
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const phone = document.getElementById('forgotPhone').value;
    
    if (!validatePassword(newPassword)) {
        alert('Password must be at least 8 characters with uppercase, lowercase, and number');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;
        
        // In real implementation, you'd also need the OTP from a separate form
        const response = await AuthAPI.resetPassword(phone, newPassword, '123456');
        
        if (response.success) {
            showSuccess('Password Updated!', 'Your password has been successfully updated.');
            setTimeout(() => {
                closeSuccess();
                showLogin();
            }, 2000);
        } else {
            alert(response.message || 'Failed to update password. Please try again.');
        }
    } catch (error) {
        alert('Failed to update password. Please try again.');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('.submit-btn');
        submitBtn.textContent = 'Update Password';
        submitBtn.disabled = false;
    }
}

async function handleGoogleSignIn() {
    try {
        // Show loading state
        const googleBtn = document.getElementById('googleSigninBtn');
        const originalText = googleBtn.innerHTML;
        googleBtn.innerHTML = 'Signing in...';
        googleBtn.disabled = true;
        
        // Call backend API
        const response = await AuthAPI.signInWithGoogle();
        
        if (response.success) {
            showSuccess('Google Sign In Successful!', 'Welcome to LawGlitch!');
            // Redirect after 2 seconds
            setTimeout(redirectToHome, 2000);
        } else {
            alert(response.message || 'Google sign in failed. Please try again.');
        }
    } catch (error) {
        alert('Google sign in failed. Please try again.');
    } finally {
        // Reset button state
        const googleBtn = document.getElementById('googleSigninBtn');
        googleBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google`;
        googleBtn.disabled = false;
    }
}

async function resendOTP() {
    const phone = document.getElementById('signupPhone').value;
    
    try {
        // Call backend API to resend OTP
        const response = await AuthAPI.signup({ 
            phone: phone,
            resend: true 
        });
        
        if (response.success) {
            showSuccess('OTP Resent!', 'A new OTP has been sent to your phone number.');
            startOTPTimer();
            document.querySelector('.otp-timer p').classList.remove('hidden');
        } else {
            alert(response.message || 'Failed to resend OTP. Please try again.');
        }
    } catch (error) {
        alert('Failed to resend OTP. Please try again.');
    }
}

// Phone number input formatting
function setupPhoneInputs() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            e.target.value = value;
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Setup OTP inputs
    setupOTPInputs();
    
    // Setup phone inputs
    setupPhoneInputs();
    
    // Setup form submissions
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('signupFormElement').addEventListener('submit', handleSignup);
    document.getElementById('otpFormElement').addEventListener('submit', handleOTP);
    document.getElementById('forgotFormElement').addEventListener('submit', handleForgotPassword);
    document.getElementById('resetFormElement').addEventListener('submit', handleResetPassword);
    
    // Setup Google Sign In button
    document.getElementById('googleSigninBtn').addEventListener('click', handleGoogleSignIn);
    
    // Setup resend OTP button
    document.getElementById('resendOtp').addEventListener('click', resendOTP);
    
    // Setup success message close
    document.getElementById('successMessage').addEventListener('click', (e) => {
        if (e.target.id === 'successMessage') {
            closeSuccess();
        }
    });
    
    // Show login form by default
    showLogin();
});

// Export functions for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthAPI,
        validatePhone,
        validatePassword,
        redirectToHome
    };
}
