// Featured professionals data
const featuredProfessionals = [
    {
        id: 101,
        name: "Dr. Khalid Al-Farsi",
        profession: "Legal Consultant",
        specialization: "International Law",
        experience: 20,
        rating: 5,
        fee: 15000,
        description: "Renowned legal expert with experience in international arbitration and cross-border disputes.",
        image: "https://randomuser.me/api/portraits/men/65.jpg",
        whatsapp: "+966501234567"
    },
    {
        id: 102,
        name: "Sarah Al-Jaberi",
        profession: "Investment Banker",
        specialization: "Mergers & Acquisitions",
        experience: 15,
        rating: 4.9,
        fee: 12000,
        description: "Leading M&A expert with successful deals across the Middle East and Europe.",
        image: "https://randomuser.me/api/portraits/women/72.jpg",
        whatsapp: "+971501234567"
    },
    {
        id: 103,
        name: "Majid Al-Rashid",
        profession: "Tax Attorney",
        specialization: "International Taxation",
        experience: 18,
        rating: 4.8,
        fee: 10000,
        description: "Specialist in international tax planning and compliance for multinational corporations.",
        image: "https://randomuser.me/api/portraits/men/85.jpg",
        whatsapp: "+9647001234567"
    },
    {
        id: 104,
        name: "Aisha Al-Nouri",
        profession: "Corporate Lawyer",
        specialization: "IP Law",
        experience: 12,
        rating: 4.7,
        fee: 9000,
        description: "Expert in intellectual property protection and commercialization strategies.",
        image: "https://randomuser.me/api/portraits/women/88.jpg",
        whatsapp: "+966541234567"
    }
];

// Display featured professionals
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
        
        featuredCard.innerHTML = `
            <img src="${pro.image}" alt="${pro.name}" class="featured-image">
            <h3>${pro.name}</h3>
            <p style="color: var(--accent-gold); margin: 0.5rem 0;">${pro.profession}</p>
            <div style="color: var(--accent-gold); margin: 0.5rem 0;">${stars}</div>
            <p style="font-size: 0.9rem; margin: 0.5rem 0; text-align: center;">${pro.description}</p>
            <p style="margin: 0.5rem 0;"><strong>${pro.experience}+ years experience</strong></p>
            <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 1rem;">
                <span style="font-weight: bold; color: var(--accent-gold);">RS ${pro.fee.toLocaleString()}</span>
                <button class="whatsapp-btn" onclick="window.open('https://wa.me/${pro.whatsapp}', '_blank')">
                    <i class="fab fa-whatsapp"></i> Contact
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
