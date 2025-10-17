// script.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://jcrgmwpcvjicpwbwrjci.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impjcmdtd3BjdmppY3B3YndyamNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE0ODQyMzYsImV4cCI6MjAzNzA2MDIzNn0.oHw02n2y3RcqY32-bU2g1J2pnp_3V42x2_2brCjJ1pE';
const supabase = createClient(supabaseUrl, supabaseKey);

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
            if (navList.classList.contains('active')) {
                navList.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Animate pricing card features on scroll
    const pricingCards = document.querySelectorAll('.pricing-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const features = entry.target.querySelectorAll('.pricing-features li');
                features.forEach((feature, index) => {
                    feature.style.animationDelay = `${index * 0.1}s`;
                    feature.classList.add('visible'); // You can add a class to trigger animation if needed
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    pricingCards.forEach(card => {
        observer.observe(card);
    });
    
    // Animate elements on scroll (general)
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .floating-card, .policy-card');
        
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
    const animatedElements = document.querySelectorAll('.feature-card, .floating-card, .policy-card');
    animatedElements.forEach(element => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
    // Trigger once on load in case elements are already in view
    animateOnScroll();
    
    // Smart Form submission alert
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Booking submitted successfully!');
            bookingForm.reset();
        });
    }
    
    // AI Assistant Animation
    const aiWindow = document.querySelector('.ai-animation-window');
    if (aiWindow) {
        const slides = document.querySelectorAll('.ai-slide');
        const summaryResponse = document.getElementById('ai-summary-response');
        let currentSlide = 0;

        const summaryText = "Okay, I've summarized the key points from 'contract_review.pdf' for you.";

        function runAiAnimation() {
            // Reset
            slides.forEach(slide => slide.classList.remove('active'));
            if(summaryResponse.querySelector('p')) {
                summaryResponse.removeChild(summaryResponse.querySelector('p'));
            }
            summaryResponse.querySelector('.typing-indicator').style.display = 'flex';

            // Start Slide 1
            slides[0].classList.add('active');
            setTimeout(() => {
                const indicator = summaryResponse.querySelector('.typing-indicator');
                indicator.style.display = 'none';
                
                let p = document.createElement('p');
                summaryResponse.appendChild(p);

                let charIndex = 0;
        p.textContent = summaryText;
        // Move to Slide 2
        setTimeout(() => {
            slides[0].classList.remove('active');
            slides[1].classList.add('active');

            // Move to Slide 3
             setTimeout(() => {
                slides[1].classList.remove('active');
                slides[2].classList.add('active');

                // Loop animation
                setTimeout(runAiAnimation, 5000);

            }, 4000);

        }, 2000);

            }, 2000); // Typing indicator duration
        }
        
        // Start animation when it comes into view
        const aiObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runAiAnimation();
                    aiObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        aiObserver.observe(aiWindow);
    }

    async function fetchWalletBalance() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('wallet_balance')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching wallet balance:', error);
            } else if (data) {
                const walletBalance = document.getElementById('wallet-balance');
                if (walletBalance) {
                    walletBalance.textContent = data.wallet_balance;
                }
            }
        }
    }

    fetchWalletBalance();
});