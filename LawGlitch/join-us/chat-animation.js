let currentTimeout = null;
let isPaused = false;
let isAnimating = false;

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.querySelector('.chat-container');
    if (!chatContainer) return;

    try {
        const messages = JSON.parse(chatContainer.getAttribute('data-messages'));
        const proMsgBubble = chatContainer.querySelector('.professional-msg');
        const userReplyBubble = chatContainer.querySelector('.user-reply');
        const proMsgText = proMsgBubble.querySelector('.message-text');
        const userMsgText = userReplyBubble.querySelector('.message-text');

        // Add navigation buttons
        const navigationDiv = document.createElement('div');
        navigationDiv.className = 'navigation-buttons';
        navigationDiv.innerHTML = `
            <button class="nav-btn prev-btn" aria-label="Previous" disabled><i class="fas fa-chevron-left"></i></button>
            <button class="nav-btn next-btn" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
        `;
        chatContainer.appendChild(navigationDiv);

        const prevBtn = chatContainer.querySelector('.prev-btn');
        const nextBtn = chatContainer.querySelector('.next-btn');

        let currentIndex = 0;

        const updateNavigationButtons = () => {
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === messages.length - 1;
        };

        // Simple typing animation
    const typeMessage = async (element, text, speed = 30) => {
        if (!text) {
            element.textContent = '';
            return;
        }

        // Show immediately if paused
        if (isPaused) {
            element.textContent = text;
            return;
        }

        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            if (isPaused) {
                element.textContent = text;
                break;
            }
            element.textContent = text.substring(0, i + 1);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    };

    const displayMessage = async (index) => {
            if (isAnimating) return;
            isAnimating = true;

            // Clear any scheduled autoplay
            if (currentTimeout) {
                clearTimeout(currentTimeout);
                currentTimeout = null;
            }

            const message = messages[index];
            
            // Reset display
            proMsgText.textContent = '';
            userMsgText.textContent = '';
            proMsgBubble.classList.remove('visible');
            userReplyBubble.classList.remove('visible');

            // Display messages
            proMsgBubble.classList.add('visible');
            await typeMessage(proMsgText, message.question, 20);
            
            if (!isPaused) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            userReplyBubble.classList.add('visible');
            await typeMessage(userMsgText, message.answer, 20);

            updateNavigationButtons();
            isAnimating = false;

            // Schedule next message if not paused and not at the end
            if (!isPaused && currentIndex < messages.length - 1) {
                currentTimeout = setTimeout(() => {
                    currentIndex++;
                    displayMessage(currentIndex);
                }, 2000);
            }
        };

        // Navigation buttons
        prevBtn.addEventListener('click', () => {
            isPaused = true;  // Pause autoplay on manual navigation
            if (currentIndex > 0) {
                currentIndex--;
                displayMessage(currentIndex);
            }
        });

        nextBtn.addEventListener('click', () => {
            isPaused = true;  // Pause autoplay on manual navigation
            if (currentIndex < messages.length - 1) {
                currentIndex++;
                displayMessage(currentIndex);
            }
        });

        // Pause when out of view, resume when back in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    if (currentTimeout) {
                        clearTimeout(currentTimeout);
                        currentTimeout = null;
                    }
                } else if (!isPaused) {
                    displayMessage(currentIndex);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(chatContainer);

        // Click to toggle pause/play
        chatContainer.addEventListener('click', (e) => {
            if (e.target.closest('.nav-btn')) return;
            
            isPaused = !isPaused;
            if (!isPaused) {
                displayMessage(currentIndex);
            }
        });

        // Start the initial display
        displayMessage(currentIndex);

    } catch (error) {
        console.error('Chat display error:', error);
    }
});