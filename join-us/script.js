import { supabase } from './config.js';
import { createGitHubProfileRepo } from './repo.js';

// Redirect URL after signup
const DASHBOARD_URL = '/portfolios/index.html';

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = "7555059760:AAFLzKYQFvpHqoREvDaDux6AxdAaYuwPIUI";
const TELEGRAM_CHAT_ID = "8374420796";

// Send plan selection notification to Telegram
async function notifyTelegramAboutPlan(data) {
    try {
        const notificationMessage = `
🔔 *New ${data.plan} Plan Application*
            
*Name:* ${data.name}
*Email:* ${data.email}
*Profession:* ${data.profession}
*Location:* ${data.location}${data.enterpriseMessage ? `\n\n*Custom Requirements:*\n${data.enterpriseMessage}` : ''}`;

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: notificationMessage,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send Telegram notification');
        }
        return true;
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return false;
    }
}

// Auth State Management
let currentUser = null;
let hasCheckedProfile = false;
let loadingStartTime = Date.now();
const MINIMUM_LOADING_TIME = 3000; // 3 seconds minimum loading time

document.addEventListener('DOMContentLoaded', async () => {
    // Terms & Conditions handling
    const termsModal = document.getElementById('termsModal');
    const termsLink = document.querySelector('.terms-link');
    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    const termsCheckbox = document.getElementById('terms');
    const modalClose = document.querySelector('.modal-close');

    // Terms Modal Event Listeners
    termsLink?.addEventListener('click', (e) => {
        e.preventDefault();
        termsModal.style.display = 'flex';
    });

    modalClose?.addEventListener('click', () => termsModal.style.display = 'none');

    termsModal?.addEventListener('click', (e) => {
        if (e.target === termsModal) termsModal.style.display = 'none';
    });

    acceptTermsBtn?.addEventListener('click', () => {
        if (termsCheckbox) {
            termsCheckbox.checked = true;
            termsCheckbox.disabled = false;
        }
        termsModal.style.display = 'none';
    });
    // Core Elements
    const mainContent = document.getElementById('main-content');
    const authSection = document.getElementById('auth-section');
    const googleSignInBtn = document.getElementById('google-signin');
    const loadingOverlay = document.getElementById('loading');
    const form = document.getElementById('signup-form');
    const successModal = document.getElementById('success-modal');
    const closeSuccessModalBtn = document.getElementById('close-success-modal');

    // UI Helper Functions
    const showLoading = () => loadingOverlay?.classList.add('show');
    const hideLoading = () => loadingOverlay?.classList.remove('show');
    const showSuccess = () => successModal?.classList.add('show');
    const hideSuccess = () => successModal?.classList.remove('show');

    // Google Sign In
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async () => {
            showLoading();
            try {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.href }
                });
                if (error) throw error;
            } catch (error) {
                console.error('Sign-in error:', error);
                hideLoading();
                alert('Failed to sign in with Google. Please try again.');
            }
        });
    }

    // Success Modal Close
    closeSuccessModalBtn?.addEventListener('click', hideSuccess);

    // Auth State Change Handler
    const showMainContent = () => {
        if (authSection) authSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
    };

    const showAuthSection = () => {
        if (authSection) authSection.style.display = 'flex';
        if (mainContent) mainContent.style.display = 'none';
    };

    const prefillEmail = (email) => {
        const emailInput = document.getElementById('email');
        if (emailInput && email) {
            emailInput.value = email;
            emailInput.readOnly = true;
        }
    };

    supabase.auth.onAuthStateChange((event, session) => {
        const user = session?.user;
        
        if (user && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
            currentUser = user;
            showMainContent();
            prefillEmail(user.email);
        } else if (event === 'SIGNED_OUT' || !user) {
            currentUser = null;
            showAuthSection();
        }
        
        hideLoading();
    });

    // Check for existing profile
    async function checkExistingProfile(user) {
        console.log('checkExistingProfile called with user:', user.id, user.email);
        try {
            console.log('Querying professionals table...');
            
            // First try to get by user_id
            const { data: dataById, error: errorById } = await supabase
                .from('professionals')
                .select('username, user_id, email')
                .eq('user_id', user.id)
                .maybeSingle();

            console.log('Query by user_id completed. Data:', dataById, 'Error:', errorById);

            if (errorById && errorById.code !== 'PGRST116') {
                console.error('Error checking for existing profile by user_id:', errorById);
            }

            if (dataById) {
                console.log('Found profile by user_id:', dataById);
                return dataById;
            }

            // If not found by user_id, try by email
            console.log('No profile found by user_id, checking by email...');
            const { data: dataByEmail, error: errorByEmail } = await supabase
                .from('professionals')
                .select('username, user_id, email')
                .eq('email', user.email)
                .maybeSingle();

            console.log('Query by email completed. Data:', dataByEmail, 'Error:', errorByEmail);

            if (errorByEmail && errorByEmail.code !== 'PGRST116') {
                console.error('Error checking for existing profile by email:', errorByEmail);
            }

            console.log('Returning data:', dataByEmail);
            return dataByEmail;
        } catch (error) {
            console.error('Error in checkExistingProfile:', error);
            return null;
        }
    }

    // Username validation
    const usernameInput = document.getElementById('username');
    const usernameFeedback = document.getElementById('username-feedback');
    let usernameCheckTimeout;
    
    if (usernameInput && usernameFeedback) {
        usernameInput.addEventListener('input', (e) => {
            clearTimeout(usernameCheckTimeout);
            const username = e.target.value.toLowerCase().trim();
            
            usernameFeedback.textContent = 'Checking availability...';
            usernameFeedback.className = 'feedback-text';
            
            usernameCheckTimeout = setTimeout(async () => {
                // Basic validation
                if (username.length < 3) {
                    usernameFeedback.textContent = 'Username must be at least 3 characters';
                    usernameFeedback.className = 'feedback-text error';
                    return;
                }

                if (!/^[a-z0-9._-]+$/.test(username)) {
                    usernameFeedback.textContent = 'Only letters, numbers, dots, underscores, and hyphens allowed';
                    usernameFeedback.className = 'feedback-text error';
                    return;
                }

                try {
                    const { data, error } = await supabase
                        .from('professionals')
                        .select('username')
                        .eq('username', username)
                        .maybeSingle();
                        
                    if (error) throw error;
                    
                    if (data) {
                        usernameFeedback.textContent = 'Username is already taken';
                        usernameFeedback.className = 'feedback-text error';
                    } else {
                        usernameFeedback.textContent = '✓ Username available';
                        usernameFeedback.className = 'feedback-text success';
                    }
                } catch (error) {
                    console.error('Username check error:', error);
                    usernameFeedback.textContent = 'Error checking username';
                    usernameFeedback.className = 'feedback-text error';
                }
            }, 500);
        });
    }

    // Photo validation
    const photoInput = document.getElementById('photo');
    const photoFeedback = document.getElementById('photo-feedback');
    const fileUploadLabel = document.querySelector('.file-upload-label');
    
    if (photoInput && photoFeedback) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            
            if (!file) {
                photoFeedback.textContent = '';
                const _span = fileUploadLabel?.querySelector('span');
                if (_span) _span.textContent = 'Click to upload or drag and drop';
                return;
            }

            const isValidSize = file.size <= 358400; // 350KB
            const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
            
            if (!isValidSize || !isValidType) {
                photoFeedback.textContent = !isValidSize ? 
                    'File size must be less than 350KB' : 
                    'Only JPG and PNG files are allowed';
                photoFeedback.className = 'feedback-text error';
                photoInput.value = '';
                const _spanErr = fileUploadLabel?.querySelector('span');
                if (_spanErr) _spanErr.textContent = 'Click to upload or drag and drop';
                return;
            }

            const _spanSel = fileUploadLabel?.querySelector('span');
            if (_spanSel) _spanSel.textContent = `Selected: ${file.name}`;
            photoFeedback.textContent = '✓ Photo looks good';
            photoFeedback.className = 'feedback-text success';
        });
    }

    // Enterprise form toggle
    const enterpriseContactBtn = document.getElementById('enterprise-contact-btn');
    const enterpriseContactForm = document.getElementById('enterprise-contact-form');
    
    enterpriseContactBtn?.addEventListener('click', () => {
        if (enterpriseContactForm) {
            const isVisible = enterpriseContactForm.style.display === 'block';
            enterpriseContactForm.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) document.getElementById('enterprise-message')?.focus();
        }
    });

    // Form Submission Handler
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert('Please sign in first');
            showAuthSection();
            return;
        }

        showLoading();

        try {
            const formData = {
                name: document.getElementById('name').value.trim(),
                profession: document.getElementById('profession').value.trim(),
                email: document.getElementById('email').value.trim().toLowerCase(),
                username: document.getElementById('username').value.trim().toLowerCase(),
                location: document.getElementById('location').value.trim(),
                about: document.getElementById('about').value.trim(),
                paymentLink: document.getElementById('payment-link').value.trim() || null,
                photoFile: document.getElementById('photo').files[0]
            };

            // Upload photo if provided
            let photoUrl = 'https://pxwbumtpnzbbqzqhnsow.supabase.co/storage/v1/object/public/portfolio-images/default/profile.jpeg';
            
            if (formData.photoFile) {
                const filePath = `${currentUser.id}/${formData.username}/profile.jpeg`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('portfolio-images')
                    .upload(filePath, formData.photoFile, {
                        cacheControl: '3600',
                        upsert: true,
                    });

                if (!uploadError) {
                    const { data: publicUrlData } = supabase.storage
                        .from('portfolio-images')
                        .getPublicUrl(filePath);
                    
                    if (publicUrlData) {
                        photoUrl = publicUrlData.publicUrl;
                    }
                }
            }

            // Create portfolio data
            const portfolioData = [{
                name: formData.name,
                about: formData.about,
                location: formData.location,
                photo_url: photoUrl,
                profession: formData.profession
            }];

            // Insert profile
            // Get selected plan
            const selectedPlan = document.querySelector('input[name="plan"]:checked').value;

            console.log('Attempting insert with data:', {
                user_id: currentUser.id,
                email: formData.email,
                username: formData.username,
                portfolio: portfolioData,
                payment_link: formData.paymentLink
            });

            // Get fresh session token
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Current session:', session?.user?.id);

            // Direct insert into professionals (no RPCs, no DB-side http calls)
            const { data, error } = await supabase
                .from('professionals')
                .insert([{
                    user_id: currentUser.id,
                    email: formData.email,
                    username: formData.username,
                    portfolio: portfolioData,
                    payment_link: formData.paymentLink,
                    is_active: true,
                    verified: false
                }])
                .select()
                .single();

            if (error) {
                console.error('Insert error details:', error);
                // PostgREST / Supabase error codes differ; handle common cases
                if (error.code === '23505' || error.code === 'PGRST116' || error.code === 'PGRST205') {
                    throw new Error('This username or email is already registered or insert conflict.');
                }
                throw new Error(error.message || 'Insert failed');
            }

            console.log('Insert successful:', data);

            // Fire-and-forget: create GitHub repo via Supabase Edge Function
            // We intentionally don't await this to keep the UX snappy and prevent failures
            // from blocking the profile creation workflow.
            (async () => {
                try {
                    const username = formData.username;
                    const email = formData.email;
                    console.log('Triggering createGitHubProfileRepo for', username);
                    const result = await createGitHubProfileRepo(username, email);
                    console.log('createGitHubProfileRepo result:', result);
                } catch (err) {
                    // Keep silent—log only
                    console.error('createGitHubProfileRepo error (non-blocking):', err);
                }
            })();

            // If it's Premium or Enterprise plan, notify via Telegram
            if (selectedPlan !== 'Free') {
                await notifyTelegramAboutPlan({
                    plan: selectedPlan,
                    name: formData.name,
                    email: formData.email,
                    profession: formData.profession,
                    location: formData.location,
                    enterpriseMessage: selectedPlan === 'Enterprise' ? 
                        document.getElementById('enterprise-message')?.value.trim() : null
                });
            }

            hideLoading();
            showSuccess();

            // Handle post-submission actions based on plan
            let message = '';
            if (selectedPlan === 'Premium') {
                message = '✅ Application sent! We will email you the payment details shortly.';
            } else if (selectedPlan === 'Enterprise') {
                message = '✅ Application received! Our team will contact you shortly to discuss your requirements.';
            } else {
                message = '✅ Profile created successfully!';
            }

            setTimeout(() => {
                alert(message);
                window.location.href = DASHBOARD_URL;
            }, 800);

        } catch (error) {
            console.error('Form submission error:', error);
            hideLoading();
            alert(error.message || 'An error occurred. Please try again.');
        }
    });
});