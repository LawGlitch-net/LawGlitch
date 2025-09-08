// script.js - JavaScript for LawGlitch landing page
// Contains animations, interactions, and dynamic functionality

document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (navToggle && navList) {
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
    
    // Timer functionality for consultation demo
    const timerElement = document.getElementById('timer');
    let minutes = 4;
    let seconds = 35;
    
    if (timerElement) {
        const timerInterval = setInterval(() => {
            seconds--;
            
            if (seconds < 0) {
                seconds = 59;
                minutes--;
            }
            
            if (minutes < 0) {
                clearInterval(timerInterval);
                timerElement.textContent = "00:00";
                return;
            }
            
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    // Chat message animation
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    
    if (chatMessages && typingIndicator) {
        const messages = chatMessages.querySelectorAll('.message');
        
        // Initially hide typing indicator
        typingIndicator.style.display = 'none';
        
        messages.forEach((message, index) => {
            const delay = parseInt(message.getAttribute('data-delay')) || 0;
            
            setTimeout(() => {
                message.style.opacity = '1';
                message.style.transform = 'translateY(0)';
                
                // Show typing indicator before the last lawyer message
                if (message.classList.contains('lawyer') && index === messages.length - 2) {
                    typingIndicator.style.display = 'flex';
                    
                    setTimeout(() => {
                        typingIndicator.style.display = 'none';
                    }, 2000);
                }
            }, delay);
        });
    }
    
    // Animate benefit cards on scroll
    const benefitCards = document.querySelectorAll('.benefit-card');
    
    function checkIfInView() {
        benefitCards.forEach(card => {
            const position = card.getBoundingClientRect();
            
            // If card is in viewport
            if(position.top < window.innerHeight && position.bottom >= 0) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Initially set cards to be hidden
    benefitCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Check on load and scroll
    window.addEventListener('load', checkIfInView);
    window.addEventListener('scroll', checkIfInView);
    
   
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Parallax effect for hero background elements
    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;
        const floatingElements = document.querySelectorAll('.floating-element');
        
        floatingElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrollPosition * speed}px)`;
        });
    });
});