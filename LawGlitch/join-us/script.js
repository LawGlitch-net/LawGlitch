// LawGlitch Professional Onboarding Script - OPTIMIZED WITH FILE UPLOAD
// Handles form submission, chat animations, modal functionality, and FILE UPLOADS

// CONFIG
const TELEGRAM_BOT_TOKEN = "7555059760:AAFLzKYQFvpHqoREvDaDux6AxdAaYuwPIUI";
const TELEGRAM_CHAT_ID = "8374420796";

document.addEventListener('DOMContentLoaded', function() {
    // --- Terms Modal Functions ---
    const termsModal = document.getElementById('termsModal');
    const termsCheckbox = document.getElementById('terms');
    const termsLink = document.querySelector('.terms-link');
    const closeModalBtn = document.querySelector('.close-modal');
    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    
    function openTermsModal() {
        termsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        // Add smooth fade-in
        setTimeout(() => termsModal.style.opacity = '1', 10);
    }
    
    function closeTermsModal() {
        termsModal.style.opacity = '0';
        setTimeout(() => {
            termsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 200);
    }
    
    if (termsLink) termsLink.addEventListener('click', openTermsModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeTermsModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === termsModal) {
            closeTermsModal();
        }
    });
    
    // Accept terms button
    if (acceptTermsBtn) {
        acceptTermsBtn.addEventListener('click', function() {
            if (termsCheckbox) {
                termsCheckbox.checked = true;
                termsCheckbox.disabled = false;
            }
            closeTermsModal();
        });
    }
    
    // --- Form Submission WITH FILE SUPPORT ---
    const form = document.getElementById('signup-form');
    const submitBtn = document.querySelector('.submit-btn');
    
    if (form && submitBtn) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (termsCheckbox && !termsCheckbox.checked) {
                alert('Please accept the Terms & Conditions to proceed.');
                return;
            }
            
            // Validate required fields
            const requiredFields = form.querySelectorAll('[required]');
            for (let field of requiredFields) {
                if (!field.value.trim()) {
                    alert(`Please fill in: ${field.previousElementSibling?.textContent || 'Required field'}`);
                    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    field.focus();
                    return;
                }
            }
            
            // Show loading with smooth transition
            const originalText = submitBtn.innerHTML;
            submitBtn.style.transform = 'scale(0.95)';
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.style.transform = 'scale(1)';
            }, 100);
            
            try {
              // Collect form data
const formData = new FormData(form);
const data = {
    name: formData.get('name') || '',
    profession: formData.get('profession') || '',
    phone: formData.get('phone') || '',
    email: formData.get('email') || '',
    expertise: formData.get('expertise') || '',
    experience: formData.get('experience') || '',
    languages: formData.get('languages') || '',
	Bio: formData.get('Bio') ||'',
    rate: formData.get('rate') || '',
    availability: formData.get('availability') || '',
    photo: formData.get('photo'),
    id_proof: formData.get('id_proof'),
    terms: formData.get('terms') === 'on'
};
                
                // Send to Telegram with files
                const success = await sendToTelegramWithFiles(data);
                
                if (success) {
                    // Success animation
                    submitBtn.style.background = '#4CAF50';
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                    
                    setTimeout(() => {
                        alert('🎉 Application submitted successfully! Our team will review it and get in touch with you shortly.');
                        form.reset();
                        if (termsCheckbox) {
                            termsCheckbox.checked = false;
                            termsCheckbox.disabled = true;
                        }
                    }, 800);
                } else {
                    throw new Error('Telegram API failed');
                }
            } catch (error) {
                console.error('Submit error:', error);
                // Error animation
                submitBtn.style.background = '#f44336';
                submitBtn.innerHTML = '<i class="fas fa-times"></i> Error';
                setTimeout(() => {
                    alert('❌ Error submitting. Please try again.');
                }, 500);
            } finally {
                // Reset button after delay
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 2000);
            }
        });
    }
    
    // --- OPTIMIZED Chat Typing Animation ---
    const typeWriter = (element, text, speed = 15) => {
        return new Promise((resolve) => {
            let i = 0;
            element.innerHTML = '';
            element.style.opacity = '1';
            
            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    element.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor">|</span>';
                    i++;
                } else {
                    clearInterval(typingInterval);
                    element.innerHTML = text; // Remove cursor
                    resolve();
                }
            }, speed);
        });
    };
    
    const showTypingIndicator = (container) => {
        const indicator = container.querySelector('.typing-indicator');
        if (indicator) {
            indicator.style.display = 'flex';
            indicator.style.opacity = '1';
            return new Promise(resolve => setTimeout(resolve, 600));
        }
        return Promise.resolve();
    };
    
    const hideTypingIndicator = (container) => {
        const indicator = container.querySelector('.typing-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.style.display = 'none', 200);
        }
    };
    
    const animateMessage = (messageElement, delay = 0) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                messageElement.style.transform = 'translateY(0)';
                messageElement.style.opacity = '1';
                messageElement.classList.add('visible');
                setTimeout(resolve, 300);
            }, delay);
        });
    };
    
    const setupChatAnimation = (chatContainer) => {
        const question = chatContainer.dataset.question;
        const answer = chatContainer.dataset.answer;
        const proMsgBubble = chatContainer.querySelector('.professional-msg');
        const userReplyBubble = chatContainer.querySelector('.user-reply');
        
        if (!question || !answer || !proMsgBubble || !userReplyBubble) return;
        
        // Reset initial states
        proMsgBubble.style.transform = 'translateY(20px)';
        proMsgBubble.style.opacity = '0';
        userReplyBubble.style.transform = 'translateY(20px)';
        userReplyBubble.style.opacity = '0';
        
        const proMsgText = proMsgBubble.querySelector('.message-text');
        const userMsgText = userReplyBubble.querySelector('.message-text');
        
        if (proMsgText) proMsgText.style.opacity = '0';
        if (userMsgText) userMsgText.style.opacity = '0';
        
        // Enhanced intersection observer with better threshold
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    observer.unobserve(chatContainer);
                    
                    try {
                        // Step 1: Show professional message bubble
                        await animateMessage(proMsgBubble, 100);
                        
                        // Step 2: Show typing indicator
                        await showTypingIndicator(chatContainer);
                        
                        // Step 3: Type the question
                        await typeWriter(proMsgText, question, 12);
                        
                        // Step 4: Hide typing indicator
                        hideTypingIndicator(chatContainer);
                        
                        // Step 5: Show user reply bubble after short delay
                        await animateMessage(userReplyBubble, 400);
                        
                        // Step 6: Show typing indicator for user
                        await showTypingIndicator(chatContainer);
                        
                        // Step 7: Type the answer
                        await typeWriter(userMsgText, answer, 10);
                        
                        // Step 8: Hide final typing indicator
                        hideTypingIndicator(chatContainer);
                        
                    } catch (error) {
                        console.error('Chat animation error:', error);
                        // Fallback: show messages immediately
                        if (proMsgText) proMsgText.innerHTML = question;
                        if (userMsgText) userMsgText.innerHTML = answer;
                        proMsgBubble.classList.add('visible');
                        userReplyBubble.classList.add('visible');
                    }
                }
            });
        }, { 
            threshold: [0.1, 0.3, 0.5],
            rootMargin: '50px'
        });
        
        // Start observing
        observer.observe(chatContainer);
    };
    
    // --- Enhanced Floating Cards Animation ---
    const animateFloatingCards = () => {
        const cards = document.querySelectorAll('.floating-card');
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const delay = index * 150; // Stagger animation
                    
                    setTimeout(() => {
                        card.style.transform = 'translateY(0) scale(1)';
                        card.style.opacity = '1';
                        card.classList.add('animated');
                    }, delay);
                    
                    cardObserver.unobserve(card);
                }
            });
        }, { threshold: 0.2 });
        
        cards.forEach(card => {
            card.style.transform = 'translateY(30px) scale(0.95)';
            card.style.opacity = '0';
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            cardObserver.observe(card);
        });
    };
    
    // Initialize all animations
    setTimeout(() => {
        document.querySelectorAll('.chat-container').forEach(setupChatAnimation);
        animateFloatingCards();
    }, 100);
    
    // --- ENHANCED Telegram Integration WITH FILE SUPPORT ---
    async function sendToTelegramWithFiles(data) {
        try {
            // Step 1: Send the main message first
            const textMessage = `
📋 *New Professional Application*

*Name:* ${data.name}
*Profession:* ${data.profession}
*Phone:* ${data.phone}
*Email:* ${data.email}
*Expertise:* ${data.expertise}
*Experience:* ${data.experience} years
*Languages:* ${data.languages}
*Bio:*${data.Bio}
*Rate:* ₹${data.rate}/min
*Availability:* ${data.availability || '8am to 8pm daily (default)'}
*Terms Accepted:* ${data.terms ? 'Yes' : 'No'}
            `;
            
            const textResponse = await sendTextMessage(textMessage);
            if (!textResponse) {
                throw new Error('Failed to send text message');
            }
            
            // Step 2: Send files if they exist
            const filePromises = [];
            
            if (data.photo && data.photo.size > 0) {
                console.log('Sending photo:', data.photo.name);
                filePromises.push(
                    sendFileToTelegram(data.photo, `📸 Profile Photo from ${data.name}`)
                );
            }
            
            if (data.id_proof && data.id_proof.size > 0) {
                console.log('Sending ID proof:', data.id_proof.name);
                filePromises.push(
                    sendFileToTelegram(data.id_proof, `📄 ID Proof from ${data.name}`)
                );
            }
            
            // Wait for all files to be sent
            if (filePromises.length > 0) {
                const fileResults = await Promise.allSettled(filePromises);
                
                // Log file upload results
                fileResults.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        console.error(`File ${index + 1} upload failed:`, result.reason);
                    } else {
                        console.log(`File ${index + 1} uploaded successfully`);
                    }
                });
            }
            
            return true;
            
        } catch (error) {
            console.error('Telegram integration error:', error);
            return false;
        }
    }
    
    // Function to send text message
    async function sendTextMessage(message) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const result = await response.json();
            
            if (!result.ok) {
                console.error('Telegram text message error:', result);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Text message API error:', error);
            return false;
        }
    }
    
    // Function to send files to Telegram
    async function sendFileToTelegram(file, caption) {
        try {
            // Check file size (Telegram limit is 50MB for bots)
            if (file.size > 50 * 1024 * 1024) {
                console.error('File too large:', file.name, file.size);
                throw new Error(`File ${file.name} is too large (max 50MB)`);
            }
            
            // Prepare form data
            const formData = new FormData();
            formData.append('chat_id', TELEGRAM_CHAT_ID);
            formData.append('caption', caption);
            
            // Determine the correct endpoint based on file type
            let endpoint;
            const fileType = file.type.toLowerCase();
            
            if (fileType.startsWith('image/')) {
                endpoint = 'sendPhoto';
                formData.append('photo', file);
            } else if (fileType.startsWith('video/')) {
                endpoint = 'sendVideo';
                formData.append('video', file);
            } else {
                // For any other file type (PDF, DOC, etc.)
                endpoint = 'sendDocument';
                formData.append('document', file);
            }
            
            console.log(`Sending file via ${endpoint}:`, file.name, file.type, file.size);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s for files
            
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const result = await response.json();
            
            if (!result.ok) {
                console.error('Telegram file upload error:', result);
                throw new Error(`Failed to upload ${file.name}: ${result.description || 'Unknown error'}`);
            }
            
            console.log('File uploaded successfully:', file.name);
            return true;
            
        } catch (error) {
            console.error('File upload error:', error);
            // Don't throw error for file uploads - let the main submission succeed
            return false;
        }
    }
    
    // Add file size validation for form inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (50MB limit)
                if (file.size > 50 * 1024 * 1024) {
                    alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
                    e.target.value = '';
                    return;
                }
                
                // Show file name and size
                const fileName = file.name;
                const fileSize = (file.size / (1024 * 1024)).toFixed(2);
                console.log(`Selected file: ${fileName} (${fileSize}MB)`);
                
                // Optional: Show file preview for images
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        console.log('Image preview loaded');
                        // You can add image preview functionality here
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    });
    
    // Add CSS for smooth animations if not present
    if (!document.querySelector('#dynamic-chat-styles')) {
        const style = document.createElement('style');
        style.id = 'dynamic-chat-styles';
        style.textContent = `
            .typing-cursor {
                animation: blink 1s infinite;
                color: #d4af37;
                font-weight: bold;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            .typing-indicator {
                display: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                padding: 8px 12px;
                background: rgba(212, 175, 55, 0.1);
                border-radius: 20px;
                margin: 5px 0;
            }
            
            .chat-container {
                overflow: hidden;
            }
            
            .professional-msg, .user-reply {
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                transform: translateY(20px);
                opacity: 0;
            }
            
            .professional-msg.visible, .user-reply.visible {
                transform: translateY(0);
                opacity: 1;
            }
            
            .floating-card {
                will-change: transform, opacity;
            }
            
            .submit-btn {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* File upload styling */
            input[type="file"] {
                border: 2px dashed #d4af37;
                background: rgba(212, 175, 55, 0.05);
                transition: all 0.3s ease;
            }
            
            input[type="file"]:focus,
            input[type="file"]:hover {
                border-color: #b8941f;
                background: rgba(212, 175, 55, 0.1);
            }
        `;
        document.head.appendChild(style);
    }
});
