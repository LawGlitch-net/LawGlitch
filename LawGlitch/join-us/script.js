// Professional Onboarding Script - v2.1 (T&C Fix)
// Handles plan selection, form submission, pre-submission modal, payment redirect, and chat animations.

// CONFIG
const TELEGRAM_BOT_TOKEN = "7555059760:AAFLzKYQFvpHqoREvDaDux6AxdAaYuwPIUI";
const TELEGRAM_CHAT_ID = "8374420796";
const PRO_PLAN_PAYMENT_URL = "https://your-payment-gateway.com/pro-plan-checkout"; // Placeholder URL

document.addEventListener('DOMContentLoaded', function() {
    
    // --- Modal Functions (Generic) ---
    const termsModal = document.getElementById('termsModal');
    const submissionInfoModal = document.getElementById('submissionInfoModal');
    const termsCheckbox = document.getElementById('terms');
    
    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.classList.add('show');
        }, 10);
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.style.opacity = '0';
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // --- Terms Modal Specific Logic ---
    const termsLink = document.querySelector('.terms-link');
    if (termsLink) termsLink.addEventListener('click', () => openModal(termsModal));
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(termsModal);
            closeModal(submissionInfoModal);
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === termsModal) closeModal(termsModal);
        if (event.target === submissionInfoModal) closeModal(submissionInfoModal);
    });

    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    if (acceptTermsBtn) {
        acceptTermsBtn.addEventListener('click', function() {
            if (termsCheckbox) {
                termsCheckbox.checked = true;
                // ✅ FIX: Enable the checkbox so it's interactive and its value can be read by the form.
                termsCheckbox.disabled = false; 
            }
            closeModal(termsModal);
        });
    }

    // --- Form Submission with Pre-Submission Modal & Payment Redirect ---
    const form = document.getElementById('signup-form');
    const submitBtn = document.querySelector('.submit-btn');

    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // ✅ FIX: This validation now works correctly because the checkbox is no longer disabled.
            if (!termsCheckbox.checked) {
                alert('Please accept the Terms & Conditions to proceed.');
                openModal(termsModal); // Re-open the modal as a helpful cue.
                return;
            }

            // Validate other required fields
            const requiredFields = form.querySelectorAll('[required]');
            for (let field of requiredFields) {
                if ((field.type === 'file' && field.files.length === 0) || (field.type !== 'file' && !field.value.trim())) {
                    alert(`Please fill in: ${field.previousElementSibling?.textContent || 'a required field'}`);
                    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    field.focus();
                    return;
                }
            }
            
            // Open the pre-submission info modal instead of submitting directly
            openModal(submissionInfoModal);
        });
    }
    
    // Handle the final submission from the info modal's "Proceed" button
    const proceedSubmitBtn = document.getElementById('proceedSubmitBtn');
    if (proceedSubmitBtn) {
        proceedSubmitBtn.addEventListener('click', handleFinalSubmit);
    }

    async function handleFinalSubmit() {
        closeModal(submissionInfoModal);
        
        const originalText = submitBtn.innerHTML;
        submitBtn.style.transform = 'scale(0.95)';
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        setTimeout(() => submitBtn.style.transform = 'scale(1)', 100);

        try {
            const formData = new FormData(form);
            const selectedPlan = document.querySelector('input[name="plan"]:checked').value;

            const data = {
                plan: selectedPlan,
                name: formData.get('name') || '',
                profession: formData.get('profession') || '',
                phone: formData.get('phone') || '',
                email: formData.get('email') || '',
                location: formData.get('location') || '',
                experience: formData.get('experience') || '',
                rate: formData.get('rate') || '',
                bank_account: formData.get('bank_account') || '',
                photo: formData.get('photo'),
                id_proof: formData.get('id_proof'),
                cert_proof: formData.get('cert_proof'),
                bank_proof: formData.get('bank_proof'),
                // ✅ FIX: This now correctly reads the 'on' value from the enabled checkbox.
                terms: formData.get('terms') === 'on' 
            };

            const success = await sendToTelegramWithFiles(data);

            if (success) {
                submitBtn.style.background = '#4CAF50';
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';

                setTimeout(() => {
                    if (selectedPlan === 'Pro') {
                        alert('✅ Application sent! Redirecting you to complete the payment for the Pro plan.');
                        window.location.href = PRO_PLAN_PAYMENT_URL;
                    } else {
                        alert('🎉 Application submitted successfully! Our team will review it and get in touch with you shortly.');
                        form.reset();
                        termsCheckbox.checked = false;
                        termsCheckbox.disabled = true; // Re-disable after successful submission
                    }
                }, 800);
            } else {
                throw new Error('Telegram API failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            submitBtn.style.background = '#f44336';
            submitBtn.innerHTML = '<i class="fas fa-times"></i> Error';
            setTimeout(() => alert('❌ Error submitting. Please try again.'), 500);
        } finally {
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }
    }
    
    // --- Animations (Unchanged) ---
    const typeWriter = (element, text, speed = 15) => { return new Promise((resolve) => { let i = 0; element.innerHTML = ''; element.style.opacity = '1'; const typingInterval = setInterval(() => { if (i < text.length) { element.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor">|</span>'; i++; } else { clearInterval(typingInterval); element.innerHTML = text; resolve(); } }, speed); }); };
    const showTypingIndicator = (container) => { const indicator = container.querySelector('.typing-indicator'); if (indicator) { indicator.style.display = 'flex'; indicator.style.opacity = '1'; return new Promise(resolve => setTimeout(resolve, 600)); } return Promise.resolve(); };
    const hideTypingIndicator = (container) => { const indicator = container.querySelector('.typing-indicator'); if (indicator) { indicator.style.opacity = '0'; setTimeout(() => indicator.style.display = 'none', 200); } };
    const animateMessage = (messageElement, delay = 0) => { return new Promise((resolve) => { setTimeout(() => { messageElement.style.transform = 'translateY(0)'; messageElement.style.opacity = '1'; messageElement.classList.add('visible'); setTimeout(resolve, 300); }, delay); }); };
    const setupChatAnimation = (chatContainer) => { const question = chatContainer.dataset.question; const answer = chatContainer.dataset.answer; const proMsgBubble = chatContainer.querySelector('.professional-msg'); const userReplyBubble = chatContainer.querySelector('.user-reply'); if (!question || !answer || !proMsgBubble || !userReplyBubble) return; proMsgBubble.style.transform = 'translateY(20px)'; proMsgBubble.style.opacity = '0'; userReplyBubble.style.transform = 'translateY(20px)'; userReplyBubble.style.opacity = '0'; const proMsgText = proMsgBubble.querySelector('.message-text'); const userMsgText = userReplyBubble.querySelector('.message-text'); if (proMsgText) proMsgText.style.opacity = '0'; if (userMsgText) userMsgText.style.opacity = '0'; const observer = new IntersectionObserver((entries) => { entries.forEach(async (entry) => { if (entry.isIntersecting && entry.intersectionRatio > 0.3) { observer.unobserve(chatContainer); try { await animateMessage(proMsgBubble, 100); await typeWriter(proMsgText, question, 12); await animateMessage(userReplyBubble, 400); await typeWriter(userMsgText, answer, 10); } catch (error) { console.error('Chat animation error:', error); if (proMsgText) proMsgText.innerHTML = question; if (userMsgText) userMsgText.innerHTML = answer; proMsgBubble.classList.add('visible'); userReplyBubble.classList.add('visible'); } } }); }, { threshold: [0.1, 0.3, 0.5], rootMargin: '50px' }); observer.observe(chatContainer); };
    const animateFloatingCards = () => { const cards = document.querySelectorAll('.floating-card'); const cardObserver = new IntersectionObserver((entries) => { entries.forEach((entry, index) => { if (entry.isIntersecting) { const card = entry.target; const delay = index * 150; setTimeout(() => { card.style.transform = 'translateY(0) scale(1)'; card.style.opacity = '1'; card.classList.add('animated'); }, delay); cardObserver.unobserve(card); } }); }, { threshold: 0.2 }); cards.forEach(card => { card.style.transform = 'translateY(30px) scale(0.95)'; card.style.opacity = '0'; card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'; cardObserver.observe(card); }); };
    
    // Initialize all animations
    setTimeout(() => {
        document.querySelectorAll('.chat-container').forEach(setupChatAnimation);
        animateFloatingCards();
    }, 100);

    // --- ENHANCED Telegram Integration with All New Fields ---
    async function sendToTelegramWithFiles(data) {
        try {
            const textMessage = `
📋 *New Professional Application*

*Plan Selected:* ${data.plan}
*Name:* ${data.name}
*Profession:* ${data.profession}
*Phone:* ${data.phone}
*Email:* ${data.email}
*Location:* ${data.location}
*Experience:* ${data.experience} years
*Rate:* ₹${data.rate}/min
*Bank Acc No:* ${data.bank_account}
*Terms Accepted:* ${data.terms ? 'Yes' : 'No'}
            `;
            
            const textResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: textMessage, parse_mode: 'Markdown' })
            });
            if (!textResponse.ok) throw new Error('Failed to send text message');

            const filePromises = [];
            const sendFile = (file, caption) => {
                if (file && file.size > 0) {
                    const formData = new FormData();
                    formData.append('chat_id', TELEGRAM_CHAT_ID);
                    formData.append('caption', caption);
                    formData.append(file.type.startsWith('image/') ? 'photo' : 'document', file);
                    const endpoint = file.type.startsWith('image/') ? 'sendPhoto' : 'sendDocument';
                    return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`, { method: 'POST', body: formData });
                }
                return Promise.resolve();
            };

            filePromises.push(sendFile(data.photo, `📸 Profile Photo from ${data.name}`));
            filePromises.push(sendFile(data.id_proof, `🆔 National ID from ${data.name}`));
            filePromises.push(sendFile(data.cert_proof, `🎓 Certification from ${data.name}`));
            filePromises.push(sendFile(data.bank_proof, `🏦 Bank Proof from ${data.name}`));

            await Promise.allSettled(filePromises);
            
            return true;
        } catch (error) {
            console.error('Telegram integration error:', error);
            return false;
        }
    }
});
