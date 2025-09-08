// LawGlitch Home Screen JavaScript - Handles interactions and API calls

// CONFIG
const SEARCH_PAGE = "../search/index.html";
const TELEGRAM_BOT_TOKEN = "8371304977:AAGi6vW65MZHVR1Mi_KwFFVZaBVbiCe_dW4"; 
const TELEGRAM_CHAT_ID = "8374420796";

// DOM Elements
const searchInput = document.getElementById('searchInput');
const profileBtn = document.getElementById('profileBtn');
const supportBtn = document.getElementById('supportBtn');
const supportQuickBtn = document.getElementById('supportQuickBtn');
const profilePopup = document.getElementById('profilePopup');
const supportPopup = document.getElementById('supportPopup');
const overlay = document.getElementById('overlay');
const closeBtns = document.querySelectorAll('.close-btn');
const signOutBtn = document.getElementById('signOutBtn');
const ceoForm = document.getElementById('ceoForm');
const supportForm = document.getElementById('supportForm');

// Open popup function
function openPopup(popup) {
    if (!popup) return;
    
    // Close any open popups first
    document.querySelectorAll('.popup').forEach(p => {
        p.setAttribute('aria-hidden', 'true');
    });
    
    // Open requested popup
    popup.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    
    // Trap focus inside popup
    const focusableElements = popup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length) {
        focusableElements[0].focus();
    }
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

// Close popup function
function closePopups() {
    document.querySelectorAll('.popup').forEach(popup => {
        popup.setAttribute('aria-hidden', 'true');
    });
    overlay.setAttribute('aria-hidden', 'true');
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
}

// Test Telegram connection
async function testTelegramConnection() {
    console.log("Testing Telegram connection...");
    const testUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
    
    try {
        const response = await fetch(testUrl);
        const data = await response.json();
        console.log("Telegram bot info:", data);
        return data.ok;
    } catch (error) {
        console.error('Error testing Telegram connection:', error);
        return false;
    }
}

// Send message to Telegram
async function sendToTelegram(message, isHTML = true) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error("Telegram bot token or chat ID not configured");
        return {success: false, error: "Configuration missing"};
    }
    
    // Test connection first
    const connectionTest = await testTelegramConnection();
    if (!connectionTest) {
        console.error("Telegram connection test failed");
        return {success: false, error: "Connection test failed"};
    }
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
        const requestBody = {
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        };
        
        // Only add parse_mode if we're sending HTML
        if (isHTML) {
            requestBody.parse_mode = 'HTML';
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        console.log("Telegram API response:", data);
        
        if (data.ok) {
            return {success: true, data: data};
        } else {
            return {success: false, error: data.description, data: data};
        }
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
        return {success: false, error: error.message};
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Test Telegram connection on page load
    testTelegramConnection().then(isConnected => {
        if (isConnected) {
            console.log("Telegram connection successful");
        } else {
            console.error("Telegram connection failed");
            // You might want to show a notification to the user
        }
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.location.href = SEARCH_PAGE;
            }
        });
        
        searchInput.addEventListener('click', function() {
            window.location.href = SEARCH_PAGE;
        });
    }
    
    // Profile button
    if (profileBtn && profilePopup) {
        profileBtn.addEventListener('click', function() {
            openPopup(profilePopup);
        });
    }
    
    // Support buttons
    if (supportBtn && supportPopup) {
        supportBtn.addEventListener('click', function() {
            openPopup(supportPopup);
        });
    }
    
    if (supportQuickBtn && supportPopup) {
        supportQuickBtn.addEventListener('click', function() {
            openPopup(supportPopup);
        });
    }
    
    // Close buttons
    if (closeBtns.length) {
        closeBtns.forEach(btn => {
            btn.addEventListener('click', closePopups);
        });
    }
    
    // Overlay click to close
    if (overlay) {
        overlay.addEventListener('click', closePopups);
    }
    
    // Sign out button
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function() {
            console.log("Sign out clicked");
            closePopups();
            // In a real application, this would redirect to logout endpoint
        });
    }
    
    // CEO message form
    if (ceoForm) {
        ceoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const message = document.getElementById('ceoMessage').value;
            if (!message.trim()) {
                alert('Please enter a message');
                return;
            }
            
            const telegramMessage = `
📩 <b>Message to CEO</b>

${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            `;
            
            const submitBtn = ceoForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Sending...";
            submitBtn.disabled = true;
            
            const result = await sendToTelegram(telegramMessage);
            
            if (result.success) {
                alert('Message sent successfully!');
                ceoForm.reset();
            } else {
                console.error('Failed to send message:', result.error);
                alert('Failed to send message. Please try again later. Error: ' + result.error);
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
    
    // Support form
    if (supportForm) {
        supportForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('supportName').value;
            const email = document.getElementById('supportEmail').value;
            const issue = document.getElementById('supportIssue').value;
            
            if (!name || !email || !issue) {
                alert('Please fill all required fields');
                return;
            }
            
            const telegramMessage = `
🆘 <b>Customer Support Request</b>

<b>Name:</b> ${name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
<b>Email:</b> ${email.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
<b>Issue:</b> ${issue.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            `;
            
            const submitBtn = supportForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Sending...";
            submitBtn.disabled = true;
            
            const result = await sendToTelegram(telegramMessage);
            
            if (result.success) {
                alert('Support request submitted successfully!');
                supportForm.reset();
                closePopups();
            } else {
                console.error('Failed to submit support request:', result.error);
                alert('Failed to submit support request. Please try again later. Error: ' + result.error);
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
    
    // Keyboard accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePopups();
        }
    });
});