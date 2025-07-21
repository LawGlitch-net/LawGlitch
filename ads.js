// Advertisement data
const advertisements = [
    {
        id: 1,
        image: "https://via.placeholder.com/1200x400/1E1E1E/D4AF37?text=Premium+Legal+Services",
        link: "https://example.com/legal-services"
    },
    {
        id: 2,
        image: "image-ads/ads-1",
        link: "https://example.com/financial-offer"
    },
    {
        id: 3,
        image: "https://via.placeholder.com/1200x400/1E1E1E/D4AF37?text=Tax+Season+Special",
        link: "https://example.com/tax-special"
    },
    {
        id: 4,
        image: "https://via.placeholder.com/1200x400/1E1E1E/D4AF37?text=New+Business+Package",
        link: null // No link for this ad
    }
];

// Initialize ads carousel
let currentAdIndex = 0;

function showAd(index) {
    const adsCarousel = document.getElementById('adsCarousel');
    adsCarousel.innerHTML = '';
    
    const ad = advertisements[index];
    const adItem = document.createElement('div');
    adItem.className = 'ad-item';
    
    if (ad.link) {
        adItem.innerHTML = `<a href="${ad.link}" target="_blank"><img src="${ad.image}" alt="Advertisement ${ad.id}"></a>`;
    } else {
        adItem.innerHTML = `<img src="${ad.image}" alt="Advertisement ${ad.id}">`;
    }
    
    adsCarousel.appendChild(adItem);
}

function nextAd() {
    currentAdIndex = (currentAdIndex + 1) % advertisements.length;
    showAd(currentAdIndex);
}

function prevAd() {
    currentAdIndex = (currentAdIndex - 1 + advertisements.length) % advertisements.length;
    showAd(currentAdIndex);
}

// Auto-rotate ads every 5 seconds
let adInterval;

function startAdRotation() {
    adInterval = setInterval(nextAd, 10000);
}

// Initialize ads
document.addEventListener('DOMContentLoaded', () => {
    showAd(currentAdIndex);
    startAdRotation();
    
    // Button event listeners
    document.getElementById('nextAd').addEventListener('click', () => {
        clearInterval(adInterval);
        nextAd();
        startAdRotation();
    });
    
    document.getElementById('prevAd').addEventListener('click', () => {
        clearInterval(adInterval);
        prevAd();
        startAdRotation();
    });
    
    // Pause rotation on hover
    const adsContainer = document.querySelector('.ads-container');
    adsContainer.addEventListener('mouseenter', () => {
        clearInterval(adInterval);
    });
    
    adsContainer.addEventListener('mouseleave', () => {
        startAdRotation();
    });
});
// Perfect Ad Image Fitting Solution
function fitAdImages() {
    const adsContainer = document.querySelector('.ads-container');
    const adItems = document.querySelectorAll('.ad-item');
    
    if (!adsContainer || adItems.length === 0) return;
    
    // Set fixed container height (adjust 200px to your preferred height)
    const containerHeight = Math.min(window.innerWidth * 0.3, 200);
    adsContainer.style.height = `${containerHeight}px`;
    
    // Process each ad image
    adItems.forEach(item => {
        const img = item.querySelector('img');
        if (!img) return;
        
        // Reset any previous styling
        img.style.maxWidth = 'none';
        img.style.maxHeight = 'none';
        img.style.width = 'auto';
        img.style.height = 'auto';
        
        // Use contain instead of cover to show full image
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center';
        img.style.width = '100%';
        img.style.height = '100%';
        
        // Background color for letterboxing (matches your theme)
        img.style.backgroundColor = '#1E1E1E';
    });
}

// Run when page loads and on resize
window.addEventListener('load', fitAdImages);
window.addEventListener('resize', fitAdImages);

// Also run after ads load (if loaded dynamically)
new MutationObserver(fitAdImages).observe(document.body, {
    childList: true,
    subtree: true
});

// Initial execution
setTimeout(fitAdImages, 100);
