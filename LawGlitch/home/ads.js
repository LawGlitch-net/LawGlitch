// ads.js - Handles dynamic ad carousel
document.addEventListener('DOMContentLoaded', function() {
    const adContainer = document.getElementById('adContainer');
    
    // Sample ad data - in a real application, this would come from a server
    const ads = [
        {
            imageUrl: "https://via.placeholder.com/1200x300/3498db/ffffff?text=Special+Offer+-+20%25+Off+First+Consultation",
            linkUrl: "offers.html",
            altText: "Special Offer - 20% Off First Consultation"
        },
        {
            imageUrl: "https://via.placeholder.com/1200x300/e74c3c/ffffff?text=New+Legal+Services+Available",
            linkUrl: "services.html",
            altText: "New Legal Services Available"
        },
        {
            imageUrl: "https://via.placeholder.com/1200x300/2ecc71/ffffff?text=Expert+Legal+Advice+24/7",
            linkUrl: "consultation.html",
            altText: "Expert Legal Advice 24/7"
        }
    ];
    
    let currentAdIndex = 0;
    let autoSlideInterval;
    
    // Function to initialize carousel
    function initCarousel() {
        if (ads.length === 0) {
            adContainer.style.display = 'none';
            return;
        }
        
        // Create carousel container
        const carousel = document.createElement('div');
        carousel.className = 'ad-carousel';
        
        // Create track for ads
        const track = document.createElement('div');
        track.className = 'ad-track';
        
        // Create indicators
        const indicators = document.createElement('div');
        indicators.className = 'ad-indicators';
        
        // Add ads to track
        ads.forEach((ad, index) => {
            const adElement = document.createElement('a');
            adElement.href = ad.linkUrl;
            adElement.className = 'ad-slide';
            adElement.style.transform = `translateX(${index * 100}%)`;
            
            const imgElement = document.createElement('img');
            imgElement.src = ad.imageUrl;
            imgElement.alt = ad.altText;
            imgElement.className = 'ad-image';
            
            adElement.appendChild(imgElement);
            track.appendChild(adElement);
            
            // Create indicator
            const indicator = document.createElement('button');
            indicator.className = 'ad-indicator';
            indicator.addEventListener('click', () => goToSlide(index));
            indicators.appendChild(indicator);
        });
        
        // Add navigation arrows
        const prevBtn = document.createElement('button');
        prevBtn.className = 'ad-nav ad-prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.addEventListener('click', () => navigate(-1));
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'ad-nav ad-next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', () => navigate(1));
        
        // Assemble carousel
        carousel.appendChild(track);
        carousel.appendChild(prevBtn);
        carousel.appendChild(nextBtn);
        carousel.appendChild(indicators);
        
        adContainer.appendChild(carousel);
        
        // Set active indicator
        updateIndicators();
        
        // Start auto slide
        startAutoSlide();
        
        // Pause on hover
        carousel.addEventListener('mouseenter', pauseAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
    }
    
    // Navigate to specific slide
    function goToSlide(index) {
        currentAdIndex = index;
        updateCarousel();
    }
    
    // Navigate forward or backward
    function navigate(direction) {
        currentAdIndex = (currentAdIndex + direction + ads.length) % ads.length;
        updateCarousel();
    }
    
    // Update carousel display
    function updateCarousel() {
        const track = document.querySelector('.ad-track');
        track.style.transform = `translateX(-${currentAdIndex * 100}%)`;
        updateIndicators();
    }
    
    // Update indicator states
    function updateIndicators() {
        const indicators = document.querySelectorAll('.ad-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentAdIndex);
        });
    }
    
    // Start auto slide
    function startAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            navigate(1);
        }, 5000); // Change slide every 5 seconds
    }
    
    // Pause auto slide
    function pauseAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    // Initialize carousel
    initCarousel();
});