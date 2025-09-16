// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navList.classList.toggle('active');
        });
    }
    
    // Close mobile nav when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Consultation time selection
    const timeOptions = document.querySelectorAll('.time-option');
    const selectedTimeElement = document.getElementById('selected-time');
    const consultationTimer = document.getElementById('consultation-timer');
    
    timeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            timeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Update selected time text
            const time = this.getAttribute('data-time');
            selectedTimeElement.textContent = `${time}-minute`;
            
            // Update consultation timer display
            consultationTimer.textContent = `${time}:00`;
            
            // Update price based on time (example logic)
            const priceElement = document.querySelector('.price');
            const basePrice = 99;
            const timeMultiplier = parseInt(time) / 15;
            const newPrice = basePrice * timeMultiplier;
            priceElement.textContent = `$${newPrice}`;
        });
    });
    

    
    // Animate elements on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.step-card, .feature-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Initialize animation styles
    const animatedElements = document.querySelectorAll('.step-card, .feature-card');
    animatedElements.forEach(element => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
    
    // Trigger once on load in case elements are already in view
    animateOnScroll();
    
    // Professional card hover effect
    const professionalCards = document.querySelectorAll('.professional-card');
    professionalCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateX(5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateX(0)';
        });
    });
    
 
    
    // Chat input functionality
    const chatInput = document.querySelector('.chat-input input');
    const chatSendButton = document.querySelector('.chat-input button');
    
    if (chatInput && chatSendButton) {
        chatSendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        function sendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                // In a real implementation, this would send the message to the server
                // For demo purposes, we'll just clear the input
                chatInput.value = '';
            }
        }
    }
});
