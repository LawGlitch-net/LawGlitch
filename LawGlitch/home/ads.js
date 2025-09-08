// COMPLETE REPLACEMENT for your ads.js file - Copy this entire code

document.addEventListener('DOMContentLoaded', function() {
    const adContainer = document.getElementById('adContainer');
    
    // Sample ad data - in a real application, this would come from a server
    const ads = [
        {
            imageUrl: "assets/ads/free-10min.png",
            linkUrl: "../search/index.html",
            altText: "Special Offer - free 10 min consultation"
        },
        {
            imageUrl: "assets/ads/privacy.png",
            linkUrl: "",
            altText: "we respect your privacy"
        },
        {
            imageUrl: "assets/ads/Join-us.png",
            linkUrl: "../join-us/index.html",
            altText: "Join now to get the best offers limited time only"
        }
    ];
    
    let currentAdIndex = 0;
    let autoSlideInterval;
    let track = null;
    
    // Function to initialize carousel
    function initCarousel() {
        if (!adContainer) {
            console.error('Ad container not found');
            return;
        }
        
        if (ads.length === 0) {
            adContainer.style.display = 'none';
            return;
        }
        
        // Clear any existing content
        adContainer.innerHTML = '';
        
        // Create carousel container
        const carousel = document.createElement('div');
        carousel.className = 'ad-carousel';
        
        // Create track for ads
        track = document.createElement('div');
        track.className = 'ad-track';
        
        // Create indicators
        const indicators = document.createElement('div');
        indicators.className = 'ad-indicators';
        
        // Add ads to track
        ads.forEach((ad, index) => {
            const adElement = document.createElement('a');
            adElement.href = ad.linkUrl || '#';
            adElement.className = 'ad-slide';
            
            const imgElement = document.createElement('img');
            imgElement.src = ad.imageUrl;
            imgElement.alt = ad.altText;
            imgElement.className = 'ad-image';
            
            // Add error handling for images
            imgElement.onerror = function() {
                console.log('Failed to load image:', ad.imageUrl);
                this.src = 'data:image/svg+xml,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300">
                        <rect width="100%" height="100%" fill="#f0f0f0"/>
                        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#999" text-anchor="middle" dominant-baseline="middle">
                            ${ad.altText || 'Image not available'}
                        </text>
                    </svg>
                `);
            };
            
            adElement.appendChild(imgElement);
            track.appendChild(adElement);
            
            // Create indicator
            const indicator = document.createElement('button');
            indicator.className = 'ad-indicator';
            indicator.type = 'button';
            indicator.setAttribute('data-slide', index);
            indicators.appendChild(indicator);
        });
        
        // Add navigation arrows
        if (ads.length > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'ad-nav ad-prev';
            prevBtn.type = 'button';
            prevBtn.setAttribute('aria-label', 'Previous slide');
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'ad-nav ad-next';
            nextBtn.type = 'button';
            nextBtn.setAttribute('aria-label', 'Next slide');
            
            carousel.appendChild(prevBtn);
            carousel.appendChild(nextBtn);
        }
        
        // Assemble carousel
        carousel.appendChild(track);
        if (ads.length > 1) {
            carousel.appendChild(indicators);
        }
        
        adContainer.appendChild(carousel);
        
        // Add event listeners AFTER elements are added to DOM
        setupEventListeners();
        
        // Set initial state
        currentAdIndex = 0;
        updateCarousel();
        updateIndicators();
        
        // Start auto slide
        if (ads.length > 1) {
            startAutoSlide();
            
            // Pause on hover
            carousel.addEventListener('mouseenter', pauseAutoSlide);
            carousel.addEventListener('mouseleave', startAutoSlide);
        }
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Navigation buttons
        const prevBtn = document.querySelector('.ad-prev');
        const nextBtn = document.querySelector('.ad-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Previous button clicked'); // Debug log
                navigate(-1);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Next button clicked'); // Debug log
                navigate(1);
            });
        }
        
        // Indicator buttons
        const indicators = document.querySelectorAll('.ad-indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Indicator clicked:', index); // Debug log
                goToSlide(index);
            });
        });
    }
    
    // Navigate to specific slide
    function goToSlide(index) {
        console.log('Going to slide:', index); // Debug log
        if (index >= 0 && index < ads.length) {
            currentAdIndex = index;
            updateCarousel();
            updateIndicators();
        }
    }
    
    // Navigate forward or backward
    function navigate(direction) {
        console.log('Navigating:', direction); // Debug log
        pauseAutoSlide();
        currentAdIndex = (currentAdIndex + direction + ads.length) % ads.length;
        console.log('New index:', currentAdIndex); // Debug log
        updateCarousel();
        updateIndicators();
        setTimeout(startAutoSlide, 1000);
    }
    
    // Update carousel display
    function updateCarousel() {
        if (!track) {
            console.error('Track not found');
            return;
        }
        
        const translateX = -currentAdIndex * 100;
        track.style.transform = `translateX(${translateX}%)`;
        console.log('Updated carousel transform:', translateX + '%'); // Debug log
    }
    
    // Update indicator states
    function updateIndicators() {
        const indicators = document.querySelectorAll('.ad-indicator');
        indicators.forEach((indicator, index) => {
            if (index === currentAdIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Start auto slide
    function startAutoSlide() {
        if (ads.length <= 1) return;
        
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            navigate(1);
        }, 5000); // Change slide every 5 seconds
    }
    
    // Pause auto slide
    function pauseAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    // Initialize carousel with a small delay to ensure DOM is ready
    setTimeout(() => {
        initCarousel();
    }, 100);
});
