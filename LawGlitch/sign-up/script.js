<script>
// Global variables
let currentForm = 'login';
let otpTimer = 60;
let timerInterval;

// Form switching functions
function showLogin() {
    hideAllForms();
    document.getElementById('loginForm').classList.remove('hidden');
    currentForm = 'login';
}

function showSignup() {
    hideAllForms();
    document.getElementById('signupForm').classList.remove('hidden');
    currentForm = 'signup';
}

function showOTP(phoneNumber) {
    hideAllForms();
    document.getElementById('otpForm').classList.remove('hidden');
    document.getElementById('otpPhoneNumber').textContent = `+91 ${phoneNumber}`;
    startOTPTimer();
    currentForm = 'otp';
}

function showForgotPassword() {
    hideAllForms();
    document.getElementById('forgotForm').classList.remove('hidden');
    currentForm = 'forgot';
}

function showResetPassword() {
    hideAllForms();
    document.getElementById('resetForm').classList.remove('hidden');
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

function resendOTP() {
    // Simulate OTP resend
    showSuccess('OTP sent successfully!', 'A new OTP has been sent to your phone number.');
    startOTPTimer();
    document.querySelector('.otp-timer p').classList.remove('hidden');
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

// Form submission handlers
function handleLogin(e) {
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
    
    // Simulate login process
    showSuccess('Login Successful!', 'Welcome back to LawGlitch!');
}

function handleSignup(e) {
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
    
    // Show OTP form
    showOTP(phone);
}

function handleOTP(e) {
    e.preventDefault();
    
    if (!validateOTP()) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }
    
    // Simulate OTP verification
    showSuccess('Account Created Successfully!', 'Welcome to LawGlitch! Your account has been created and verified.');
    setTimeout(() => {
        closeSuccess();
        showLogin();
    }, 2000);
}

function handleForgotPassword(e) {
    e.preventDefault();
    const phone = document.getElementById('forgotPhone').value;
    
    if (!validatePhone(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    // Simulate sending reset OTP
    showSuccess('OTP Sent!', 'Password reset OTP has been sent to your phone number.');
    setTimeout(() => {
        closeSuccess();
        showResetPassword();
    }, 1500);
}

function handleResetPassword(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!validatePassword(newPassword)) {
        alert('Password must be at least 8 characters with uppercase, lowercase, and number');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Simulate password reset
    showSuccess('Password Updated!', 'Your password has been successfully updated.');
    setTimeout(() => {
        closeSuccess();
        showLogin();
    }, 2000);
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
    document.getElementById('loginForm').querySelector('form').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').querySelector('form').addEventListener('submit', handleSignup);
    document.getElementById('otpForm').querySelector('form').addEventListener('submit', handleOTP);
    document.getElementById('forgotForm').querySelector('form').addEventListener('submit', handleForgotPassword);
    document.getElementById('resetForm').querySelector('form').addEventListener('submit', handleResetPassword);
    
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

// Utility functions for future backend integration
const API = {
    // These functions can be easily replaced with actual API calls
    login: async (phone, password) => {
        // return await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
        return Promise.resolve({ success: true });
    },
    
    signup: async (userData) => {
        // return await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(userData) });
        return Promise