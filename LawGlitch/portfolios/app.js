import { createSupabaseClient } from '../join-us/config.js';
import { initializeEditor } from './editor.js';

const supabase = createSupabaseClient();
window.supabase = supabase;

// Global State
let currentUser = null;
let currentPortfolio = null;
let currentUsername = null;
let isLoadingData = false;
let portfolioEditor = null; // Add PortfolioEditor instance
let isInitialized = false; // Flag to prevent double initialization
let editorInitialized = false; // Flag to track if editor has been initialized

// DOM Elements
const elements = {
    authLoading: document.getElementById('auth-loading'),
    authRequired: document.getElementById('auth-required'),
    authMessage: document.getElementById('auth-message'),
    dashboard: document.getElementById('dashboard'),
    googleSignIn: document.getElementById('google-signin'),
    meetingsTab: document.getElementById('meetings-tab'),
    activeMeetingsTab: document.getElementById('active-meetings-tab'),
    editorTab: document.getElementById('editor-tab'),
    meetingsSection: document.getElementById('meetings-section'),
    activeMeetingsSection: document.getElementById('active-meetings-section'),
    editorSection: document.getElementById('editor-section'),
    meetingsFrame: document.getElementById('meetings-frame'),
    profileBtn: document.getElementById('profile-btn'),
    profileMenu: document.getElementById('profile-menu'),
    profilePic: document.getElementById('profile-pic'),
    profileUsername: document.getElementById('profile-username'),
    profileEmail: document.getElementById('profile-email'),
    signOut: document.getElementById('sign-out')
};

// Utility Functions
const showElement = (el) => el?.classList.remove('hidden');
const hideElement = (el) => el?.classList.add('hidden');
const toggleElement = (el) => el?.classList.toggle('hidden');

const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.querySelector('.toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 5);
};

// Auth Functions

function showAuthRequired(message = "Please sign in to access your dashboard") {
    hideElement(elements.authLoading);
    hideElement(elements.dashboard);
    showElement(elements.authRequired);
    elements.authMessage.textContent = message;
}

async function handleGoogleSignIn() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.href
            }
        });
        if (error) throw error;
    } catch (error) {
        console.error('Google sign in error:', error);
        showToast('Failed to initiate sign in. Please try again.', 'error');
    }
}

async function handleSignOut() {
    try {
        currentUser = null;
        currentPortfolio = null;
        isInitialized = false;
        sessionStorage.removeItem('auth_initialized'); // Clear session flag
        hideElement(elements.profileMenu);
        hideElement(elements.dashboard);
        showElement(elements.authRequired);
        await supabase.auth.signOut();
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Sign out error:', error);
        window.location.href = '../index.html';
    }
}

// Data Loading Functions
async function loadProfessionalData() {
    console.log('Loading professional data for user:', currentUser.id);
    try {
        console.log('Attempting to fetch professional data for user ID:', currentUser.id);
        const { data: pro, error } = await supabase
            .from('professionals')
            .select('user_id, username, portfolio, wallet_balance')
            .eq('user_id', currentUser.id);

        console.log('Professional data query result:', { pro, error });

        if (error) {
            console.log('Error code:', error.code);
            if (error.code === 'PGRST116') { // Row not found
                console.log('No professional record found, showing auth required.');
                showAuthRequired("No professional profile found. Please create one.");
                return;
            }
            throw error;
        }

        // If data is an empty array, it means no record was found
        if (!pro || pro.length === 0) {
            console.log('No professional record found (empty array), showing auth required.');
            showAuthRequired("No professional profile found. Please create one.");
            return;
        }

        // If pro is an array, get the first element
        const professionalData = Array.isArray(pro) ? pro[0] : pro;

        if (!professionalData || !professionalData.username) {
            console.log('Professional record incomplete, showing auth required.');
            showAuthRequired("Your professional profile is incomplete. Please update it.");
            return;
        }

        currentUsername = professionalData.username;
        localStorage.setItem('username', currentUsername);

        if (typeof professionalData.portfolio === 'string') {
            currentPortfolio = { html: professionalData.portfolio };
        } else if (professionalData.portfolio?.html) {
            currentPortfolio = { html: professionalData.portfolio.html };
        } else {
            currentPortfolio = { html: '<div><!-- No portfolio --></div>' };
        }
        console.log('Portfolio loaded, initializing dashboard');
        initializeDashboard(professionalData);
        
        try {
        } catch (error) {
            console.error('Data loading error:', error);
            if (error.message?.includes('not found') || error.code === 'PGRST116') {
                console.log('Redirecting to join-us due to error');
                window.location.href = '../join-us/index.html';
            } else {
                console.log('Showing auth required due to error');
                showAuthRequired("Failed to load professional data. Please try again.");
            }
        }
    } catch (error) {
        console.error('Data loading error:', error);
        if (error.message?.includes('not found') || error.code === 'PGRST116') {
            console.log('Redirecting to join-us due to error');
            window.location.href = '../join-us/index.html';
        } else {
            console.log('Showing auth required due to error');
            showAuthRequired("Failed to load professional data. Please try again.");
        }
    }
}

// UI Functions
function initializeDashboard(pro) {
    // Update profile info
    elements.profileEmail.textContent = currentUser.email;
    elements.profileUsername.textContent = pro.username;
    currentUsername = pro.username;

    // Update wallet balance
    const walletBalance = pro.wallet_balance || 0;
    document.getElementById('wallet-balance').textContent = '$' + walletBalance;
    document.getElementById('modal-wallet-balance').textContent = '$' + walletBalance;
    
    // Set profile picture
    const defaultProfilePic = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2NjYyIvPjwvc3ZnPg==';

    // Try to fetch profile picture from Supabase storage portfolio-images/user_id/username/profile.jpeg or .png
    async function fetchProfilePic() {
        const bucket = 'portfolio-images';
        const userId = currentUser.id;
        const username = currentUsername;

        // Try jpeg first
        let path = `${userId}/${username}/profile.jpeg`;
        let { data, error } = await supabase.storage.from(bucket).getPublicUrl(path);
        if (error || !data?.publicUrl) {
            // Try png
            path = `${userId}/${username}/profile.png`;
            ({ data, error } = await supabase.storage.from(bucket).getPublicUrl(path));
        }
        if (!error && data?.publicUrl) {
            return data.publicUrl;
        }
        return defaultProfilePic;
    }

    fetchProfilePic().then(url => {
        elements.profilePic.src = url;
    }).catch(() => {
        elements.profilePic.src = defaultProfilePic;
    });
    
    // Set meetings iframe source with user ID parameter
    elements.meetingsFrame.setAttribute('title', 'Meeting Room');
    elements.meetingsFrame.src = `../booking/pro.html?pro_id=${currentUser.id}`;

    // Set global portfolio for simple editor
    window.portfolio = currentPortfolio;
    window.savePortfolio = async (portfolio) => {
        try {
            const updatedPortfolio = {
                html: portfolio.html,
                userData: portfolioEditor ? portfolioEditor.userData : null
            };

            const { error } = await supabase
                .from('professionals')
                .update({ portfolio: updatedPortfolio })
                .eq('user_id', currentUser.id);

            if (error) throw error;

            currentPortfolio = updatedPortfolio;
            showToast('Portfolio saved successfully');
        } catch (error) {
            console.error('Save error:', error);
            showToast(error.message, 'error');
        }
    };

    // Show dashboard
    hideElement(elements.authLoading);
    hideElement(elements.authRequired);
    showElement(elements.dashboard);

    // Populate payments fields when dashboard is shown
    loadPaymentFields();

    // Load active booking if any
    loadActiveBooking();
}

// Load payment fields from Supabase for current user (top-level so it can be reused)
async function loadPaymentFields() {
    try {
        if (!currentUser) return;
    // IDs in the HTML are payment-email and payment-link
    const paymentEmailInput = document.getElementById('payment-email');
    const paymentLinkInput = document.getElementById('payment-link');

        const { data: pro, error } = await supabase
            .from('professionals')
            .select('email, payment_link')
            .eq('user_id', currentUser.id)
            .single();
        if (error) throw error;

        if (paymentEmailInput) paymentEmailInput.value = pro?.email ?? currentUser.email ?? '';
        if (paymentLinkInput) paymentLinkInput.value = pro?.payment_link ?? '';
    } catch (err) {
        console.error('Failed to load payment fields', err);
    }
}

function switchTab(targetTab) {
    const tabs = {
        meetings: [elements.meetingsTab, elements.meetingsSection],
        activeMeetings: [elements.activeMeetingsTab, elements.activeMeetingsSection],
        editor: [elements.editorTab, elements.editorSection]
    };

    Object.entries(tabs).forEach(([tab, [btn, section]]) => {
        if (tab === targetTab) {
            btn.classList.add('active');
            showElement(section);
        } else {
            btn.classList.remove('active');
            hideElement(section);
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Show loading state immediately
    showElement(elements.authLoading);
    hideElement(elements.authRequired);
    hideElement(elements.dashboard);

    // Simple auth initialization - only check once per browser session
    const initAuth = async () => {
        // Check if we've already initialized auth in this browser session
        const authInitialized = sessionStorage.getItem('auth_initialized');

        if (authInitialized === 'true' && currentUser) {
            // Already initialized, just show dashboard
            showElement(elements.dashboard);
            hideElement(elements.authLoading);
            return;
        }

        try {
            // First time in this session - check for existing session
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Session check error:', error);
                throw error;
            }

            if (session?.user) {
                // User is logged in
                currentUser = session.user;
                isInitialized = true;
                sessionStorage.setItem('auth_initialized', 'true');
                await loadProfessionalData();
            } else {
                // No session found
                hideElement(elements.authLoading);
                showElement(elements.authRequired);
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            hideElement(elements.authLoading);
            showElement(elements.authRequired);
        }
    };

    // Initialize auth
    await initAuth();

    if (elements.googleSignIn) {
        elements.googleSignIn.addEventListener('click', (e) => {
            e?.preventDefault?.();
            handleGoogleSignIn();
        });
    }

    if (elements.signOut) {
        elements.signOut.addEventListener('click', (e) => {
            e?.preventDefault?.();
            e?.stopPropagation?.();
            handleSignOut();
        });
    }

    // Navigation (guarded)
    if (elements.meetingsTab) {
        elements.meetingsTab.addEventListener('click', () => switchTab('meetings'));
    }
    if (elements.activeMeetingsTab) {
        elements.activeMeetingsTab.addEventListener('click', () => {
            switchTab('activeMeetings');
            loadActiveBooking();
        });
    }
    if (elements.editorTab) {
        elements.editorTab.addEventListener('click', () => {
            switchTab('editor');
            // Initialize editor on first click
            if (!editorInitialized) {
                portfolioEditor = initializeEditor();
                editorInitialized = true;
            }
        });
    }

    // Profile dropdown (guarded)
    if (elements.profileBtn) {
        elements.profileBtn.addEventListener('click', () => {
            toggleElement(elements.profileMenu);
            // Close menu when clicking outside
            const closeMenu = (e) => {
                if (!elements.profileBtn.contains(e.target)) {
                    hideElement(elements.profileMenu);
                    document.removeEventListener('click', closeMenu);
                }
            };
            setTimeout(() => document.addEventListener('click', closeMenu), 0);
        });
    }

    // View portfolio button
    const viewPortfolioBtn = document.getElementById('view-portfolio');
    if (viewPortfolioBtn) {
        viewPortfolioBtn.addEventListener('click', () => {
            // Open portfolio in new tab using profiles viewer
            const portfolioUrl = `./profiles/professional.html?username=${currentUsername}`;
            window.open(portfolioUrl, '_blank');
        });
    }

    // Payments actions
    const paymentEmailInput = document.getElementById('payment-email');
    const paymentLinkInput = document.getElementById('payment-link');
    const savePaymentBtn = document.getElementById('save-payment-link');
    const resetPaymentBtn = document.getElementById('reset-payment-link');

    if (savePaymentBtn) {
        savePaymentBtn.addEventListener('click', async () => {
            if (!currentUser) return showToast('Please sign in first', 'error');
            const newLink = paymentLinkInput?.value?.trim() || '';
            try {
                const { error } = await supabase
                    .from('professionals')
                    .update({ payment_link: newLink })
                    .eq('user_id', currentUser.id);
                if (error) throw error;
                showToast('Payment link updated');
            } catch (err) {
                console.error('Failed to save payment link', err);
                showToast('Failed to save payment link', 'error');
            }
        });
    }

    if (resetPaymentBtn) {
        resetPaymentBtn.addEventListener('click', () => {
            loadPaymentFields();
            showToast('Payment link reset');
        });
    }

    // When dashboard loads with a user, populate payment fields
    // initializeDashboard will call loadPaymentFields when the user is set, but ensure
    // payments tab also triggers a load when clicked
    const paymentsTabBtn = document.getElementById('payments-tab');
    const paymentsSection = document.getElementById('payments-section');
    if (paymentsTabBtn && paymentsSection) {
        paymentsTabBtn.addEventListener('click', () => {
            // Set nav active states
            if (elements.meetingsTab) elements.meetingsTab.classList.remove('active');
            if (elements.activeMeetingsTab) elements.activeMeetingsTab.classList.remove('active');
            if (elements.editorTab) elements.editorTab.classList.remove('active');
            paymentsTabBtn.classList.add('active');

            // Hide other sections and show payments
            if (elements.meetingsSection) hideElement(elements.meetingsSection);
            if (elements.activeMeetingsSection) hideElement(elements.activeMeetingsSection);
            if (elements.editorSection) hideElement(elements.editorSection);
            showElement(paymentsSection);

            // Load fresh data from Supabase
            loadPaymentFields();
        });
    }

    // Wallet modal
    const walletSection = document.getElementById('wallet-section');
    const walletModal = document.getElementById('wallet-modal');
    const closeWalletModal = document.getElementById('close-wallet-modal');
    const topup5 = document.getElementById('topup-5');
    const withdraw5 = document.getElementById('withdraw-5');

    if (walletSection) {
        walletSection.addEventListener('click', () => {
            walletModal.classList.remove('hidden');
        });
    }

    if (closeWalletModal) {
        closeWalletModal.addEventListener('click', () => {
            walletModal.classList.add('hidden');
        });
    }

    if (topup5) {
        topup5.addEventListener('click', () => {
            window.open('https://example.com/topup?amount=5', '_blank');
        });
    }

    if (withdraw5) {
        withdraw5.addEventListener('click', () => {
            window.open('https://example.com/withdraw?amount=5', '_blank');
        });
    }

    // Setup save portfolio button
    const savePortfolioBtn = document.getElementById('save-portfolio');
    if (savePortfolioBtn) {
        savePortfolioBtn.addEventListener('click', async () => {
            if (!currentUser) return showToast('Please sign in first', 'error');
            if (!window.savePortfolio) return showToast('Save function not available', 'error');

            try {
                await window.savePortfolio(currentPortfolio);
            } catch (error) {
                console.error('Save error:', error);
                showToast('Failed to save portfolio', 'error');
            }
        });
    }
});



// Function to convert old block-based portfolio to HTML
function convertBlocksToHtml(blocks) {
    if (!Array.isArray(blocks)) return '';

    return blocks.map(block => {
        switch (block.type) {
            case 'text':
                return `<p>${block.content || ''}</p>`;
            case 'heading':
                return `<h2>${block.content || ''}</h2>`;
            case 'image':
                return `<img src="${block.content?.url || ''}" alt="${block.content?.alt || ''}" style="max-width: 100%;">`;
            case 'profile':
                return `<div class="profile-section">
                    <img src="${block.content?.url || ''}" alt="Profile" style="width: 150px; height: 150px; border-radius: 50%;">
                    <h1>${block.content?.name || ''}</h1>
                    <p>${block.content?.bio || ''}</p>
                </div>`;
            default:
                return `<div>${JSON.stringify(block.content || '')}</div>`;
        }
    }).join('\n');
}

// Removed auth state change listener - handling auth manually in initAuth()

// Message listener for iframe communication
window.addEventListener('message', (event) => {
    if (event.data.action === 'accept_booking') {
        const booking = event.data.booking;
        // Save to localStorage
        localStorage.setItem('activeBooking', JSON.stringify(booking));
        // Switch to active meetings tab
        switchTab('activeMeetings');
        // Fill the inputs
        fillActiveMeetingInputs(booking);
        // Update the iframe with the new booking ID
        if (typeof updateMeetingFrame === 'function') {
            updateMeetingFrame();
        } else {
            // Retry after a brief delay if function not yet available
            setTimeout(() => {
                if (typeof updateMeetingFrame === 'function') {
                    console.log('🔄 Calling updateMeetingFrame after delay (message listener)');
                    updateMeetingFrame();
                }
            }, 100);
        }
    }
});

// Global modal state
let notifyModal = null;
let currentNotifyBooking = null;

// Function to fill active meeting inputs
function fillActiveMeetingInputs(booking) {
    if (booking) {
        const bookingIdInput = document.getElementById('booking-id');
        const clientNameInput = document.getElementById('client-name');
        const clientEmailInput = document.getElementById('client-email');

        if (bookingIdInput) {
            bookingIdInput.value = booking.id || '';
            bookingIdInput.readOnly = true;
        }
        if (clientNameInput) {
            clientNameInput.value = booking.client_name || '';
            clientNameInput.readOnly = true;
        }
        if (clientEmailInput) {
            clientEmailInput.value = booking.client_email || '';
            clientEmailInput.readOnly = true;

            // Add notification button if not already added
            let notifyBtn = document.getElementById('notify-client-btn');
            if (!notifyBtn) {
                notifyBtn = document.createElement('button');
                notifyBtn.id = 'notify-client-btn';
                notifyBtn.innerHTML = '<i class="fas fa-bell"></i> Notify Client';
                notifyBtn.className = 'btn btn-primary';
                notifyBtn.style.marginLeft = '10px';
                notifyBtn.onclick = () => {
                    openNotifyModal(booking);
                };
                clientEmailInput.insertAdjacentElement('afterend', notifyBtn);
            }
        }
    }
}

// Function to load active booking on page load
function loadActiveBooking() {
    const savedBooking = localStorage.getItem('activeBooking');
    if (savedBooking) {
        const booking = JSON.parse(savedBooking);
        fillActiveMeetingInputs(booking);
        
        // Update the iframe with the loaded booking ID
        // Try immediately, and retry after a small delay if not available yet
        if (typeof updateMeetingFrame === 'function') {
            updateMeetingFrame();
        } else {
            // Retry after a brief delay for inline script to load
            setTimeout(() => {
                if (typeof updateMeetingFrame === 'function') {
                    console.log('🔄 Calling updateMeetingFrame after delay');
                    updateMeetingFrame();
                }
            }, 100);
        }
    }
}

function openNotifyModal(booking) {
    currentNotifyBooking = booking;

    // Create modal if not exists
    if (!notifyModal) {
        notifyModal = document.createElement('div');
        notifyModal.id = 'notify-modal';
        notifyModal.className = 'modal';
        notifyModal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" id="close-notify-modal" title="Close">
                    <i class="fas fa-times"></i>
                </button>
                <h2>Notify Client Joined - ${booking.client_name}</h2>
                <p>Send a notification email to inform the client that you have joined the meeting.</p>
                <textarea id="notify-message" rows="10" style="width: 100%; margin: 10px 0; padding: 10px; border: 1px solid var(--light-gray); border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; box-sizing: border-box;" placeholder="Enter your message..."></textarea>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
                    <button id="send-notify-btn" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease;">Send Notification</button>
                    <button id="cancel-notify-btn" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease;">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(notifyModal);

        // Event listeners
        document.getElementById('close-notify-modal').onclick = () => closeNotifyModal();
        document.getElementById('cancel-notify-btn').onclick = () => closeNotifyModal();
        document.getElementById('send-notify-btn').onclick = () => sendNotifyEmail();

        // Close on outside click
        notifyModal.addEventListener('click', (e) => {
            if (e.target === notifyModal) {
                closeNotifyModal();
            }
        });
    }

    // Set template
    const meetingLink = `${window.location.origin}/chatroom/index.html?room_id=${booking.id}&type=client&auto_join=true`;
    const template = `Hi ${booking.client_name || 'Client'},

I have joined the meeting room and am ready for our consultation.

Please join me using this link:
${meetingLink}

Looking forward to our session!

Best regards,`;

    document.getElementById('notify-message').value = template;

    // Show modal
    notifyModal.style.display = 'flex';
}

// Function to close notify modal
function closeNotifyModal() {
    if (notifyModal) {
        notifyModal.style.display = 'none';
    }
}

// Function to send notify email
function sendNotifyEmail() {
    const message = document.getElementById('notify-message').value.trim();
    if (!message) {
        showToast('Please enter a message before sending.', 'error');
        return;
    }

    const subject = 'Meeting Ready - I Have Joined';
    const body = encodeURIComponent(message);
    const mailTo = currentNotifyBooking.client_email;

    // For mobile devices, open Gmail app
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${mailTo}&su=${encodeURIComponent(subject)}&body=${body}`, '_blank');
    } else {
        window.location.href = `mailto:${mailTo}?subject=${encodeURIComponent(subject)}&body=${body}`;
    }

    closeNotifyModal();
    showToast('Email client opened with notification message.');
}