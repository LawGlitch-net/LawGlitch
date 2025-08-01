// Self-contained featured professionals module with IIFE
(function() {
    // Unique namespace for our features
    const LAWGLITCH_FEATURED_PRO = {
        // Featured professionals data
        featuredProfessionals: [
             {
        id: 0,
        name: "LawGlitch Official",
        profession: "Legal Tech Platform",
        specialization: "Verified Partner",
        description: "Our official representative for premium legal consultations and services.",
        experience: 5,
        rating: 5,
        fee: 0,
        image: "https://via.placeholder.com/150/4a6da7/ffffff?text=LawGlitch",
        verified: true,
        freeSlots: 3
    },
    {
        id: 1,
        name: "Rajesh Sharma",
        profession: "Lawyer",
        specialization: "Corporate Law",
        description: "Expert in corporate legal matters with 100+ successful cases.",
        experience: 12,
        rating: 4.7,
        fee: 2500,
        image: "https://via.placeholder.com/150/4a6da7/ffffff?text=RS",
        verified: false,
        freeSlots: 2
    },
    {
        id: 2,
        name: "Priya Patel",
        profession: "Legal Consultant",
        specialization: "Family Law",
        description: "Specialized in family disputes and marital agreements.",
        experience: 8,
        rating: 4.9,
        fee: 1800,
        image: "https://via.placeholder.com/150/4a6da7/ffffff?text=PP",
        verified: true,
        freeSlots: 1
    },
    {
        id: 3,
        name: "Vikram Reddy",
        profession: "Attorney",
        specialization: "Criminal Defense",
        description: "Former prosecutor now defending your rights in criminal cases.",
        experience: 15,
        rating: 4.8,
        fee: 3500,
        image: "https://via.placeholder.com/150/4a6da7/ffffff?text=VR",
        verified: true,
        freeSlots: 2
    },
    {
        id: 4,
        name: "Amit Joshi",
        profession: "Legal Advisor",
        specialization: "IP Law",
        description: "Protecting your intellectual property rights effectively.",
        experience: 7,
        rating: 4.5,
        fee: 2000,
        image: "https://via.placeholder.com/150/4a6da7/ffffff?text=AJ",
        verified: false,
        freeSlots: 1
    },
    {
        id: 5,
        name: "Neha Gupta",
        profession: "Notary",
        specialization: "Document Verification",
        description: "Certified notary public with quick turnaround times.",
        experience: 6,
        rating: 4.6,
        fee: 1200,
        image: "https://via.placeholder.com/150/4a6da7/ffffff?text=NG",
        verified: true,
        freeSlots: 3
    },
    {
        id: 6,
        name: "Arjun Malhotra",
        profession: "Mediator",
        specialization: "Dispute Resolution",
        description: "Helping parties find mutually beneficial solutions.",
        experience: 10,
        rating: 4.8,
        fee: 2800,
        image: "https://via.placeholder.com/150/4a6da7/ffffff?text=AM",
        verified: true,
        freeSlots: 2
    }
        ],

        // Telegram bot configuration
        telegramBotConfig: {
            apiToken: '8371304977:AAGi6vW65MZHVR1Mi_KwFFVZaBVbiCe_dW4',
            chatId: '8374420796',
            apiUrl: 'https://api.telegram.org/bot'
        },

// Initialize the module
        init: function() {
            this.injectStyles();
            this.displayFeaturedPros();
            this.setupEventListeners();
            this.setupThemeObserver();
        },

        // Inject CSS styles with theme support
        injectStyles: function() {
            const styleId = 'lawglitch-featured-pros-styles';
            
            // Don't inject if already exists
            if (document.getElementById(styleId)) return;
            
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                /* Main container with unique class */
                .lawglitch-featured-pros-container {
                    position: relative;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                /* Professionals grid */
                .lawglitch-featured-pros {
                    display: flex;
                    gap: 25px;
                    padding: 20px 0;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                
                .lawglitch-featured-pros::-webkit-scrollbar {
                    display: none;
                }
                
                /* Professional cards - Theme variables */
                .lawglitch-featured-card {
                    flex: 0 0 300px;
                    background-color: var(--card-bg);
                    border-radius: var(--border-radius);
                    overflow: hidden;
                    box-shadow: var(--box-shadow);
                    transition: transform 0.3s;
                    position: relative;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                }
                
                .lawglitch-featured-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
                }
                
                .lawglitch-featured-card-header {
                    position: relative;
                    height: 180px;
                    overflow: hidden;
                }
                
                .lawglitch-featured-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                
                .lawglitch-featured-card:hover .lawglitch-featured-image {
                    transform: scale(1.05);
                }
                
                .lawglitch-verified-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: var(--accent-gold);
                    color: var(--text-dark);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: bold;
                }
                
                .lawglitch-featured-card h3 {
                    margin: 15px 15px 5px;
                    color: var(--text-light);
                    font-size: 1.2rem;
                }
                
                .lawglitch-pro-specialization {
                    margin: 0 15px 10px;
                    color: var(--accent-gold);
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                
                .lawglitch-rating-stars {
                    margin: 0 15px 10px;
                    color: var(--accent-gold);
                    font-size: 1rem;
                }
                
                .lawglitch-rating-number {
                    color: var(--text-light);
                    opacity: 0.8;
                    font-size: 0.8rem;
                    margin-left: 5px;
                }
                
                .lawglitch-pro-description {
                    margin: 0 15px 15px;
                    color: var(--text-light);
                    opacity: 0.8;
                    font-size: 0.85rem;
                    line-height: 1.4;
                }
                
                .lawglitch-pro-experience {
                    margin: 0 15px 15px;
                    color: var(--accent-gold);
                    font-size: 0.9rem;
                }
                
                .lawglitch-free-slots-banner {
                    background: linear-gradient(90deg, var(--accent-gold), #6a8cc7);
                    color: var(--text-dark);
                    padding: 8px 15px;
                    margin: 0 15px 15px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    animation: lawglitch-pulse 2s infinite;
                }
                
                @keyframes lawglitch-pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
                
                .lawglitch-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 15px 15px;
                    margin-top: auto;
                }
                
                .lawglitch-pro-fee {
                    font-weight: bold;
                    color: var(--text-light);
                    font-size: 1.1rem;
                }
                
                .lawglitch-free-text {
                    color: #27ae60;
                    font-weight: bold;
                }
                
                .lawglitch-book-btn {
                    background: var(--accent-gold);
                    color: var(--text-dark);
                    border: none;
                    padding: 8px 15px;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.3s ease;
                }
                
                .lawglitch-book-btn:hover {
                    background: var(--light-gold);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
                }
                
                /* Navigation buttons */
                .lawglitch-scroll-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 40px;
                    height: 40px;
                    background: var(--card-bg);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: var(--box-shadow);
                    cursor: pointer;
                    z-index: 10;
                    border: none;
                    color: var(--accent-gold);
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                }
                
                .lawglitch-scroll-btn:hover {
                    background: var(--accent-gold);
                    color: var(--text-dark);
                    transform: translateY(-50%) scale(1.1);
                }
                
                .lawglitch-scroll-left {
                    left: 0;
                }
                
                .lawglitch-scroll-right {
                    right: 0;
                }
                
                /* Modal styles with theme support */
                .lawglitch-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    padding: 20px;
                }
                
                .lawglitch-booking-modal {
                    background: var(--card-bg);
                    border-radius: var(--border-radius);
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--box-shadow);
                    transform: translateY(-20px);
                    transition: transform 0.3s ease;
                    position: relative;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                }
                
                .lawglitch-modal-overlay.active {
                    opacity: 1;
                }
                
                .lawglitch-modal-overlay.active .lawglitch-booking-modal {
                    transform: translateY(0);
                }
                
                .lawglitch-modal-header {
                    padding: 20px;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .lawglitch-modal-header h3 {
                    margin: 0;
                    color: var(--text-light);
                }
                
                .lawglitch-close-modal {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-light);
                    opacity: 0.7;
                    transition: color 0.3s ease;
                }
                
                .lawglitch-close-modal:hover {
                    color: var(--accent-gold);
                    opacity: 1;
                }
                
                .lawglitch-modal-body {
                    padding: 20px;
                }
                
                .lawglitch-pro-summary {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                    align-items: center;
                }
                
                .lawglitch-pro-summary img {
                    border-radius: 8px;
                    border: 2px solid rgba(212, 175, 55, 0.3);
                }
                
                .lawglitch-pro-summary h4 {
                    margin: 0 0 5px;
                    color: var(--text-light);
                }
                
                .lawglitch-pro-summary p {
                    margin: 0;
                    color: var(--text-light);
                    opacity: 0.8;
                    font-size: 0.9rem;
                }
                
                .lawglitch-free-badge {
                    background: #27ae60;
                    color: white;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    display: inline-block;
                    margin-top: 5px;
                }
                
                .lawglitch-booking-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .lawglitch-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .lawglitch-form-group label {
                    font-size: 0.9rem;
                    color: var(--text-light);
                    font-weight: 500;
                }
                
                .lawglitch-form-group input,
                .lawglitch-form-group textarea,
                .lawglitch-form-group select {
                    padding: 10px;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    border-radius: var(--border-radius);
                    font-size: 0.9rem;
                    transition: border-color 0.3s ease;
                    background-color: var(--secondary-bg);
                    color: var(--text-light);
                }
                
                .lawglitch-form-group input:focus,
                .lawglitch-form-group textarea:focus,
                .lawglitch-form-group select:focus {
                    outline: none;
                    border-color: var(--accent-gold);
                    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
                }
                
                .lawglitch-form-group textarea {
                    min-height: 100px;
                    resize: vertical;
                }
                
                .lawglitch-submit-booking {
                    background: var(--accent-gold);
                    color: var(--text-dark);
                    border: none;
                    padding: 12px;
                    border-radius: var(--border-radius);
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    margin-top: 10px;
                }
                
                .lawglitch-submit-booking:hover {
                    background: var(--light-gold);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
                }
                
                .lawglitch-modal-footer {
                    padding: 15px 20px;
                    border-top: 1px solid rgba(212, 175, 55, 0.1);
                    text-align: center;
                    font-size: 0.8rem;
                    color: var(--text-light);
                    opacity: 0.7;
                }
                
                .lawglitch-success-message {
                    text-align: center;
                    padding: 30px;
                }
                
                .lawglitch-success-icon {
                    font-size: 4rem;
                    color: #27ae60;
                    margin-bottom: 20px;
                }
                
                .lawglitch-success-message h3 {
                    color: var(--text-light);
                    margin-bottom: 10px;
                }
                
                .lawglitch-success-message p {
                    color: var(--text-light);
                    opacity: 0.8;
                    margin-bottom: 20px;
                }
                
                .lawglitch-free-slot-used {
                    background: rgba(39, 174, 96, 0.2);
                    color: #27ae60;
                    padding: 10px;
                    border-radius: 6px;
                    margin: 15px 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .lawglitch-booking-summary {
                    background: rgba(212, 175, 55, 0.1);
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    text-align: left;
                }
                
                .lawglitch-booking-summary p {
                    margin: 5px 0;
                    color: var(--text-light);
                }
                
                .lawglitch-close-success-modal {
                    background: var(--accent-gold);
                    color: var(--text-dark);
                    border: none;
                    padding: 10px 20px;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                
                .lawglitch-close-success-modal:hover {
                    background: var(--light-gold);
                    transform: translateY(-2px);
                }
                
                .lawglitch-error-message {
                    background: rgba(231, 76, 60, 0.2);
                    color: #e74c3c;
                    padding: 10px;
                    border-radius: 6px;
                    margin-top: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                @media (max-width: 768px) {
                    .lawglitch-featured-card {
                        flex: 0 0 85%;
                    }
                    
                    .lawglitch-scroll-btn {
                        width: 35px;
                        height: 35px;
                        font-size: 1rem;
                    }
                }
            `;
            document.head.appendChild(style);
        },

        // Display featured professionals with theme support
        displayFeaturedPros: function() {
            const containerId = 'lawglitch-featured-pros-container';
            const existingContainer = document.getElementById(containerId);
            
            let container;
            if (existingContainer) {
                container = existingContainer;
                container.innerHTML = ''; // Clear existing content
            } else {
                container = document.createElement('div');
                container.id = containerId;
                container.className = 'lawglitch-featured-pros-container';
                document.body.appendChild(container);
            }
            
            container.innerHTML = `
                <h2 class="section-title">Featured Legal Professionals</h2>
                <button class="lawglitch-scroll-btn lawglitch-scroll-left">&lt;</button>
                <div class="lawglitch-featured-pros"></div>
                <button class="lawglitch-scroll-btn lawglitch-scroll-right">&gt;</button>
            `;
            
            const featuredContainer = container.querySelector('.lawglitch-featured-pros');
            
            if (!this.featuredProfessionals || this.featuredProfessionals.length === 0) {
                featuredContainer.innerHTML = '<p style="color: var(--text-light); opacity: 0.8;">No featured professionals available</p>';
                return;
            }
            
            this.featuredProfessionals.forEach(pro => {
                const stars = '★'.repeat(Math.floor(pro.rating)) + '☆'.repeat(5 - Math.floor(pro.rating));
                const isFreeSlot = pro.freeSlots > 0;
                
                const featuredCard = document.createElement('div');
                featuredCard.className = 'lawglitch-featured-card';
                featuredCard.dataset.proId = pro.id;
                
                featuredCard.innerHTML = `
                    <div class="lawglitch-featured-card-header">
                        <img src="${pro.image}" alt="${pro.name}" class="lawglitch-featured-image">
                        ${pro.verified ? '<span class="lawglitch-verified-badge">✓ Verified</span>' : ''}
                    </div>
                    <h3>${pro.name}</h3>
                    <p class="lawglitch-pro-specialization">${pro.profession} - ${pro.specialization}</p>
                    <div class="lawglitch-rating-stars">${stars} <span class="lawglitch-rating-number">${pro.rating}</span></div>
                    <p class="lawglitch-pro-description">${pro.description}</p>
                    <p class="lawglitch-pro-experience"><strong>${pro.experience}+ years experience</strong></p>
                    
                    ${isFreeSlot ? 
                        `<div class="lawglitch-free-slots-banner">
                            ${pro.freeSlots} FREE consultation${pro.freeSlots > 1 ? 's' : ''} left!
                        </div>` : ''
                    }
                    
                    <div class="lawglitch-card-footer">
                        <span class="lawglitch-pro-fee">${isFreeSlot ? '<span class="lawglitch-free-text">FREE</span>' : '₹' + pro.fee.toLocaleString()}</span>
                        <button class="lawglitch-book-btn" data-pro-id="${pro.id}">
                            ${isFreeSlot ? 'Claim Free Slot' : 'Book Now'}
                        </button>
                    </div>
                `;
                
                featuredContainer.appendChild(featuredCard);
            });
        },

        // Setup event listeners with proper scoping
        setupEventListeners: function() {
            const container = document.getElementById('lawglitch-featured-pros-container');
            if (!container) return;
            
            // Book buttons
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('lawglitch-book-btn')) {
                    const proId = parseInt(e.target.getAttribute('data-pro-id'));
                    this.openBookingModal(proId);
                }
            });
            
            // Scroll buttons
            const scrollLeft = container.querySelector('.lawglitch-scroll-left');
            const scrollRight = container.querySelector('.lawglitch-scroll-right');
            const featuredContainer = container.querySelector('.lawglitch-featured-pros');
            
            if (scrollLeft && scrollRight && featuredContainer) {
                scrollLeft.addEventListener('click', () => {
                    featuredContainer.scrollBy({ left: -300, behavior: 'smooth' });
                });
                
                scrollRight.addEventListener('click', () => {
                    featuredContainer.scrollBy({ left: 300, behavior: 'smooth' });
                });
                
                const checkScroll = () => {
                    scrollLeft.style.display = featuredContainer.scrollLeft <= 10 ? 'none' : 'flex';
                    scrollRight.style.display = featuredContainer.scrollLeft >= featuredContainer.scrollWidth - featuredContainer.clientWidth - 10 ? 'none' : 'flex';
                };
                
                featuredContainer.addEventListener('scroll', checkScroll);
                checkScroll();
            }
        },

        // Setup theme observer to watch for theme changes
        setupThemeObserver: function() {
            // Watch for theme changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'data-theme') {
                        this.updateThemeStyles();
                    }
                });
            });
            
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['data-theme']
            });
        },

        // Update styles when theme changes
        updateThemeStyles: function() {
            // No need to do anything here since we're using CSS variables
            // that automatically update when the theme changes
        },

        // Booking modal with theme support
        openBookingModal: function(proId) {
            const pro = this.featuredProfessionals.find(p => p.id === proId);
            if (!pro) return;
            
            const isFreeSlot = pro.freeSlots > 0;
            
            // Create modal overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'lawglitch-modal-overlay';
            
            // Create modal content
            modalOverlay.innerHTML = `
                <div class="lawglitch-booking-modal">
                    <div class="lawglitch-modal-header">
                        <h3>Book Consultation with ${pro.name}</h3>
                        <button class="lawglitch-close-modal">&times;</button>
                    </div>
                    
                    <div class="lawglitch-modal-body">
                        <div class="lawglitch-pro-summary">
                            <img src="${pro.image}" alt="${pro.name}" width="60">
                            <div>
                                <h4>${pro.profession} - ${pro.specialization}</h4>
                                <p>${pro.experience}+ years experience</p>
                                <p>${isFreeSlot ? '<span class="lawglitch-free-badge">FREE CONSULTATION</span>' : 'Fee: ₹' + pro.fee.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <form class="lawglitch-booking-form">
                            <div class="lawglitch-form-group">
                                <label for="lawglitch-userName">Your Name</label>
                                <input type="text" id="lawglitch-userName" required placeholder="Enter your full name">
                            </div>
                            
                            <div class="lawglitch-form-group">
                                <label for="lawglitch-userContact">Contact Number</label>
                                <input type="tel" id="lawglitch-userContact" required placeholder="Enter phone number">
                            </div>
                            
                            <div class="lawglitch-form-group">
                                <label for="lawglitch-userEmail">Email Address</label>
                                <input type="email" id="lawglitch-userEmail" placeholder="Enter email (optional)">
                            </div>
                            
                            <div class="lawglitch-form-group">
                                <label for="lawglitch-queryDetails">Your Legal Query</label>
                                <textarea id="lawglitch-queryDetails" required placeholder="Describe your legal issue in detail"></textarea>
                            </div>
                            
                            <div class="lawglitch-form-group">
                                <label for="lawglitch-preferredDate">Preferred Date</label>
                                <input type="date" id="lawglitch-preferredDate" required>
                            </div>
                            
                            <button type="submit" class="lawglitch-submit-booking">
                                ${isFreeSlot ? 'Claim Free Consultation' : 'Confirm Booking'}
                            </button>
                        </form>
                    </div>
                    
                    <div class="lawglitch-modal-footer">
                        <p><i class="fas fa-lock"></i> Your information is secure and will only be shared with the professional</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modalOverlay);
            
            // Activate modal with animation
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                modalOverlay.classList.add('active');
            }, 10);
            
            // Close modal functionality
            modalOverlay.querySelector('.lawglitch-close-modal').addEventListener('click', () => {
                modalOverlay.style.opacity = '0';
                modalOverlay.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modalOverlay);
                }, 300);
            });
            
            // Close when clicking outside modal
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.style.opacity = '0';
                    modalOverlay.classList.remove('active');
                    setTimeout(() => {
                        document.body.removeChild(modalOverlay);
                    }, 300);
                }
            });
            
            // Form submission
            const bookingForm = modalOverlay.querySelector('.lawglitch-booking-form');
            bookingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitButton = bookingForm.querySelector('.lawglitch-submit-booking');
                const originalButtonText = submitButton.innerHTML;
                submitButton.innerHTML = 'Processing...';
                submitButton.disabled = true;
                
                try {
                    const bookingData = {
                        professional: pro.name,
                        profession: pro.profession,
                        specialization: pro.specialization,
                        fee: isFreeSlot ? 'FREE' : `₹${pro.fee}`,
                        userName: document.getElementById('lawglitch-userName').value,
                        userContact: document.getElementById('lawglitch-userContact').value,
                        userEmail: document.getElementById('lawglitch-userEmail').value || 'Not provided',
                        queryDetails: document.getElementById('lawglitch-queryDetails').value,
                        preferredDate: document.getElementById('lawglitch-preferredDate').value,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Send to Telegram bot
                    const telegramMessage = `
📞 *New Consultation Request* 📞

*Professional:* ${bookingData.professional}
*Specialization:* ${bookingData.profession} - ${bookingData.specialization}
*Fee:* ${bookingData.fee}

👤 *Client Details:*
• Name: ${bookingData.userName}
• Contact: ${bookingData.userContact}
• Email: ${bookingData.userEmail}

📅 *Preferred Date:* ${bookingData.preferredDate}

❓ *Legal Query:*
${bookingData.queryDetails}

_Received at ${new Date(bookingData.timestamp).toLocaleString()}_
                    `;
                    
                    const response = await fetch(`${this.telegramBotConfig.apiUrl}${this.telegramBotConfig.apiToken}/sendMessage`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: this.telegramBotConfig.chatId,
                            text: telegramMessage,
                            parse_mode: 'Markdown'
                        })
                    });
                    
                    if (!response.ok) throw new Error('Telegram API error');
                    
                    // Show success message
                    modalOverlay.innerHTML = `
                        <div class="lawglitch-booking-modal lawglitch-success-message">
                            <div class="lawglitch-success-icon">
                                ✓
                            </div>
                            <h3>Booking Request Sent!</h3>
                            <p>${pro.name} will contact you shortly to confirm your appointment.</p>
                            
                            ${isFreeSlot ? 
                                `<div class="lawglitch-free-slot-used">
                                    Your free consultation has been reserved!
                                </div>` : ''
                            }
                            
                            <div class="lawglitch-booking-summary">
                                <p><strong>Your contact:</strong> ${bookingData.userContact}</p>
                                <p><strong>Preferred date:</strong> ${bookingData.preferredDate}</p>
                            </div>
                            
                            <button class="lawglitch-close-success-modal">Close</button>
                        </div>
                    `;
                    
                    // Update free slots if this was a free consultation
                    if (isFreeSlot) {
                        const proIndex = this.featuredProfessionals.findIndex(p => p.id === proId);
                        if (proIndex !== -1) {
                            this.featuredProfessionals[proIndex].freeSlots--;
                        }
                    }
                    
                    // Close success modal
                    modalOverlay.querySelector('.lawglitch-close-success-modal').addEventListener('click', () => {
                        modalOverlay.style.opacity = '0';
                        setTimeout(() => {
                            document.body.removeChild(modalOverlay);
                            this.displayFeaturedPros(); // Refresh to show updated free slots
                        }, 300);
                    });
                    
                } catch (error) {
                    console.error('Booking error:', error);
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                    
                    // Show error message
                    const errorElement = document.createElement('div');
                    errorElement.className = 'lawglitch-error-message';
                    errorElement.innerHTML = 'Failed to send booking. Please try again or contact support.';
                    bookingForm.appendChild(errorElement);
                    
                    setTimeout(() => {
                        if (errorElement.parentNode) {
                            bookingForm.removeChild(errorElement);
                        }
                    }, 5000);
                }
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        LAWGLITCH_FEATURED_PRO.init();
    } else {
        document.addEventListener('DOMContentLoaded', () => LAWGLITCH_FEATURED_PRO.init());
    }
})();
