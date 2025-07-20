// Advertisement data
const advertisements = [
    {
        id: 1,
        image: "https://via.placeholder.com/1200x400/1E1E1E/D4AF37?text=Premium+Legal+Services",
        link: "https://example.com/legal-services"
    },
    {
        id: 2,
        image: "data:image/jpeg;base64,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",
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