// featured.js - Handles displaying featured professionals
document.addEventListener('DOMContentLoaded', function() {
    const professionalsGrid = document.querySelector('.professionals-grid');
    
    // Clear the placeholder
    professionalsGrid.innerHTML = '';
    
    // IDs of professionals to display (you can modify this array)
    const featuredProfessionalIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // Function to fetch professional data from pros.js
    function fetchProfessionals() {
        // Check if professionalsData is available from pros.js
        if (typeof professionalsData === 'undefined') {
            console.error('pros.js not loaded. Professionals data is not available.');
            professionalsGrid.innerHTML = '<div class="no-results"><p>Unable to load professionals. Please try again later.</p></div>';
            return;
        }
        
        const featuredPros = professionalsData.filter(pro => 
            featuredProfessionalIds.includes(pro.id)
        );
        
        if (featuredPros.length === 0) {
            professionalsGrid.innerHTML = '<div class="no-results"><p>No featured professionals found.</p></div>';
            return;
        }
        
        displayProfessionals(featuredPros);
    }
    
    // Function to display professionals in list layout (Astrotalk style)
    function displayProfessionals(professionals) {
        professionalsGrid.innerHTML = '';
        
        professionals.forEach(professional => {
            const proCard = document.createElement('div');
            proCard.className = 'pro-card'; // Using list style instead of grid
            
            // Generate star rating HTML
            const fullStars = Math.floor(professional.rating);
            const hasHalfStar = professional.rating % 1 >= 0.5;
            let starsHTML = '';
            
            for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                    starsHTML += '<i class="fas fa-star"></i>';
                } else if (i === fullStars && hasHalfStar) {
                    starsHTML += '<i class="fas fa-star-half-alt"></i>';
                } else {
                    starsHTML += '<i class="far fa-star"></i>';
                }
            }
            
            // Update the book button HTML to use a data attribute for the professional ID
            proCard.innerHTML = `
                <div class="pro-card-content">
                    <div class="pro-card-top">
                        <div class="pro-left">
                            <img src="${professional.image}" alt="${professional.name}" class="pro-image">
                            <div class="pro-rating">
                                ${starsHTML}
                                <span class="rating-number">${professional.rating}</span>
                            </div>
                        </div>
                        <div class="pro-center">
                            <h3 class="pro-name">${professional.name}</h3>
                            <p class="pro-profession">${professional.profession} • ${professional.specialization}</p>
                            <div class="pro-meta">
                                <span><i class="fas fa-briefcase"></i> ${professional.experience} years exp.</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${professional.location}</span>
                            </div>
                        </div>
                    </div>
                    <p class="pro-description">${professional.description}</p>
                    <div class="pro-right">
                        <button class="book-btn" data-pro-id="${professional.id}" data-fee="${professional.fee.toLocaleString('en-IN')}">
                            Book Now
                        </button>
                    </div>
                </div>
            `;
            
            professionalsGrid.appendChild(proCard);
        });
        
        // Add event listeners to all Book Now buttons
        addBookButtonListeners();
    }
    
    // Function to add event listeners to Book Now buttons
    function addBookButtonListeners() {
        const bookButtons = document.querySelectorAll('.book-btn');
        
        bookButtons.forEach(button => {
            button.addEventListener('click', function() {
                const proId = this.getAttribute('data-pro-id');
                // Redirect to booking page with professional ID
                window.location.href = `../booking/index.html?proId=${proId}`;
            });
        });
    }
    
    // Initialize professionals display
    fetchProfessionals();
});