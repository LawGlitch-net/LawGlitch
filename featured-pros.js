// Featured professionals data - Now using IDs from pros.js database
const featuredProfessionals = [
    professionals.find(pro => pro.id === 1),  // Rajesh Sharma
    professionals.find(pro => pro.id === 2),  // Priya Patel
    professionals.find(pro => pro.id === 5),  // Vikram Reddy
    professionals.find(pro => pro.id === 7)   // Amit Joshi
].filter(pro => pro); // Filter out any undefined entries

// Display featured professionals with booking functionality
function displayFeaturedPros() {
    const featuredContainer = document.getElementById('featuredPros');
    
    // Check if container exists
    if (!featuredContainer) {
        console.error('Featured professionals container not found');
        return;
    }
    
    // Clear existing content
    featuredContainer.innerHTML = '';
    
    // Check if data exists
    if (!featuredProfessionals || featuredProfessionals.length === 0) {
        featuredContainer.innerHTML = '<p>No featured professionals available</p>';
        return;
    }
    
    // Create and append featured cards
    featuredProfessionals.forEach(pro => {
        const stars = '★'.repeat(Math.floor(pro.rating)) + '☆'.repeat(5 - Math.floor(pro.rating));
        
        const featuredCard = document.createElement('div');
        featuredCard.className = 'featured-card';
        featuredCard.dataset.proId = pro.id;
        
        featuredCard.innerHTML = `
            <img src="${pro.image}" alt="${pro.name}" class="featured-image">
            <h3>${pro.name}</h3>
            <p style="color: var(--accent-gold); margin: 0.5rem 0;">${pro.profession} - ${pro.specialization}</p>
            <div style="color: var(--accent-gold); margin: 0.5rem 0;">${stars}</div>
            <p style="font-size: 0.9rem; margin: 0.5rem 0; text-align: center;">${pro.description}</p>
            <p style="margin: 0.5rem 0;"><strong>${pro.experience}+ years experience</strong></p>
            <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 1rem;">
                <span style="font-weight: bold; color: var(--accent-gold);">₹${pro.fee.toLocaleString()}</span>
                <button class="book-btn" onclick="openBookingModal(${pro.id})">
                    <i class="fas fa-calendar-alt"></i> Book Now
                </button>
            </div>
        `;
        
        featuredContainer.appendChild(featuredCard);
    });
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing featured professionals');
    displayFeaturedPros();
});

// Alternative initialization for older browsers
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(displayFeaturedPros, 1);
} else {
    document.addEventListener('DOMContentLoaded', displayFeaturedPros);
}
