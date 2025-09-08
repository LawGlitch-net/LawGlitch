document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const searchInput = document.getElementById('search-input');
    const filterToggle = document.getElementById('filterToggle');
    const filterOptions = document.getElementById('filterOptions');
    const professionFilter = document.getElementById('professionFilter');
    const locationFilter = document.getElementById('locationFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const priceFilter = document.getElementById('priceFilter');
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsHeader = document.getElementById('resultsHeader');

    let allProfessionals = []; // This will hold the original data from pros.js

    // --- INITIALIZE THE APPLICATION ---
    function initializeApp() {
        if (typeof professionalsData !== 'undefined') {
            allProfessionals = professionalsData;
            populateFilterDropdowns();
            addEventListeners();
            render(); // Initial render of all professionals
        } else {
            console.error("Data not found. Make sure pros.js is loaded correctly.");
            resultsGrid.innerHTML = `<p class="no-results">Could not load professional data.</p>`;
        }
    }

    // --- SET UP EVENT LISTENERS ---
    function addEventListeners() {
        // When user types in search bar
        searchInput.addEventListener('input', render);
        
        // When user changes a filter dropdown
        professionFilter.addEventListener('change', render);
        locationFilter.addEventListener('change', render);
        experienceFilter.addEventListener('change', render);
        ratingFilter.addEventListener('change', render);
        priceFilter.addEventListener('change', render);
        
        // To show/hide the filter section
        filterToggle.addEventListener('click', () => {
            const isVisible = filterOptions.style.display === 'flex';
            filterOptions.style.display = isVisible ? 'none' : 'flex';
        });
        
        // Disable autocomplete and autofill
        searchInput.setAttribute('autocomplete', 'off');
        searchInput.setAttribute('autocorrect', 'off');
        searchInput.setAttribute('autocapitalize', 'off');
        searchInput.setAttribute('spellcheck', 'false');
    }

    // --- POPULATE FILTER DROPDOWNS ---
    function populateFilterDropdowns() {
        const professions = [...new Set(allProfessionals.map(p => p.profession))];
        const locations = [...new Set(allProfessionals.map(p => p.location))];

        professions.forEach(prof => {
            const option = document.createElement('option');
            option.value = prof;
            option.textContent = prof;
            professionFilter.appendChild(option);
        });

        locations.forEach(loc => {
            const option = document.createElement('option');
            option.value = loc;
            option.textContent = loc;
            locationFilter.appendChild(option);
        });
    }

    // --- NATURAL LANGUAGE PROCESSING FOR SEARCH ---
    function parseNaturalQuery(query) {
        const queryLower = query.toLowerCase().trim();
        const criteria = {
            profession: null,
            location: null,
            maxFee: null,
            minExperience: null,
            minRating: null,
            specialization: null
        };

        // Profession keywords
        const professionKeywords = {
            'lawyer': ['lawyer', 'attorney', 'advocate', 'legal', 'counsel', 'barrister', 'solicitor', 'law'],
            'chartered accountant': ['chartered accountant', 'ca', 'accountant', 'accounting', 'cpa', 'bookkeeper'],
            'financial advisor': ['financial advisor', 'finance', 'investment', 'wealth', 'advisor', 'planner', 'financial planner']
        };

        // Location detection
        const locationKeywords = {
            'Delhi': ['delhi', 'new delhi'],
            'Mumbai': ['mumbai', 'bombay'],
            'Bangalore': ['bangalore', 'bengaluru'],
            'Hyderabad': ['hyderabad'],
            'Pune': ['pune'],
            'Chennai': ['chennai', 'madras']
        };

        // Parse profession
        for (const [profession, keywords] of Object.entries(professionKeywords)) {
            if (keywords.some(keyword => queryLower.includes(keyword))) {
                criteria.profession = profession;
                break;
            }
        }

        // Parse location
        for (const [location, keywords] of Object.entries(locationKeywords)) {
            if (keywords.some(keyword => queryLower.includes(keyword))) {
                criteria.location = location;
                break;
            }
        }

        // Parse price constraints
        const feePatterns = [
            /under\s+(\d+)k?/i,
            /below\s+(\d+)k?/i,
            /less\s+than\s+(\d+)k?/i,
            /maximum\s+(\d+)k?/i,
            /max\s+(\d+)k?/i,
            /budget\s+(\d+)k?/i
        ];

        for (const pattern of feePatterns) {
            const match = queryLower.match(pattern);
            if (match) {
                let amount = parseInt(match[1]);
                if (match[0].includes('k')) {
                    amount *= 1000;
                }
                criteria.maxFee = amount;
                break;
            }
        }

        // Parse experience
        const experiencePatterns = [
            /(\d+)\+?\s+years?\s+experience/i,
            /(\d+)\+?\s+years?\s+exp/i,
            /minimum\s+(\d+)\+?\s+years?/i
        ];

        for (const pattern of experiencePatterns) {
            const match = queryLower.match(pattern);
            if (match) {
                criteria.minExperience = parseInt(match[1]);
                break;
            }
        }

        // Parse rating
        const ratingPatterns = [
            /(\d+(?:\.\d+)?)\+?\s+stars?/i,
            /(\d+(?:\.\d+)?)\+?\s+rating/i,
            /rating\s+(\d+(?:\.\d+)?)\+?/i
        ];

        for (const pattern of ratingPatterns) {
            const match = queryLower.match(pattern);
            if (match) {
                criteria.minRating = parseFloat(match[1]);
                break;
            }
        }

        return criteria;
    }

    // --- MAIN RENDER FUNCTION (SEARCH, FILTER, DISPLAY) ---
    function render() {
        const query = searchInput.value.toLowerCase().trim();
        const selectedProfession = professionFilter.value;
        const selectedLocation = locationFilter.value;
        const selectedExperience = experienceFilter.value;
        const selectedRating = ratingFilter.value;
        const selectedPrice = priceFilter.value;
        
        // Parse natural language query
        const criteria = parseNaturalQuery(query);

        // Start with all professionals and filter them down
        let filteredList = allProfessionals.filter(pro => {
            // Filter by search query
            const matchesQuery = query === '' || 
                `${pro.name} ${pro.profession} ${pro.location} ${pro.specialization} ${pro.description}`.toLowerCase().includes(query);
            
            // Filter by profession dropdown
            const matchesProfession = selectedProfession === '' || pro.profession === selectedProfession;
            
            // Filter by location dropdown
            const matchesLocation = selectedLocation === '' || pro.location === selectedLocation;
            
            // Filter by experience dropdown
            const matchesExperience = selectedExperience === '' || pro.experience >= parseInt(selectedExperience);
            
            // Filter by rating dropdown
            const matchesRating = selectedRating === '' || pro.rating >= parseFloat(selectedRating);
            
            // Filter by price dropdown
            const matchesPrice = selectedPrice === '' || pro.fee <= parseInt(selectedPrice);
            
            // Filter by natural language criteria
            const matchesNLPProfession = !criteria.profession || pro.profession.toLowerCase().includes(criteria.profession.toLowerCase());
            const matchesNLPLocation = !criteria.location || pro.location === criteria.location;
            const matchesNLPFee = !criteria.maxFee || pro.fee <= criteria.maxFee;
            const matchesNLPExperience = !criteria.minExperience || pro.experience >= criteria.minExperience;
            const matchesNLPRating = !criteria.minRating || pro.rating >= criteria.minRating;

            return matchesQuery && matchesProfession && matchesLocation && 
                   matchesExperience && matchesRating && matchesPrice &&
                   matchesNLPProfession && matchesNLPLocation && matchesNLPFee && 
                   matchesNLPExperience && matchesNLPRating;
        });

        displayProfessionals(filteredList, criteria);
    }
    
    // --- DISPLAY PROFESSIONALS ON THE PAGE ---
    function displayProfessionals(listToDisplay, criteria = {}) {
        resultsGrid.innerHTML = ''; // Clear previous results

        // Create search criteria display
        let criteriaText = '';
        if (criteria.profession) criteriaText += `Profession: ${criteria.profession} • `;
        if (criteria.location) criteriaText += `Location: ${criteria.location} • `;
        if (criteria.maxFee) criteriaText += `Max Fee: ₹${criteria.maxFee.toLocaleString()} • `;
        if (criteria.minExperience) criteriaText += `Min Experience: ${criteria.minExperience}+ years • `;
        if (criteria.minRating) criteriaText += `Min Rating: ${criteria.minRating}+ stars • `;
        
        criteriaText = criteriaText.replace(/ • $/, '');

        resultsHeader.innerHTML = `
            <h2>Showing ${listToDisplay.length} professional(s)</h2>
            ${criteriaText ? `<div class="search-criteria">Search criteria: ${criteriaText}</div>` : ''}
        `;

        if (listToDisplay.length === 0) {
            resultsGrid.innerHTML = `<div class="no-results"><i class="fas fa-search"></i><h3>No professionals found</h3></div>`;
            return;
        }

        listToDisplay.forEach(pro => {
            const proCard = createProfessionalCard(pro);
            resultsGrid.appendChild(proCard);
        });
    }

   // --- CREATE THE HTML FOR EACH PROFESSIONAL (GOLDEN THEME) ---
function createProfessionalCard(pro) {
    const card = document.createElement('div');
    card.className = 'pro-card';

    // Create star rating with Font Awesome icons
    const fullStars = Math.floor(pro.rating);
    const hasHalfStar = pro.rating % 1 >= 0.5;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }

    // Profession-specific icons
    let professionIcon = '';
    if (pro.profession.toLowerCase().includes('lawyer') || 
        pro.profession.toLowerCase().includes('attorney') ||
        pro.profession.toLowerCase().includes('advocate')) {
        professionIcon = '<i class="fas fa-gavel profession-icon"></i>';
    } else if (pro.profession.toLowerCase().includes('accountant') || 
               pro.profession.toLowerCase().includes('ca') ||
               pro.profession.toLowerCase().includes('chartered')) {
        professionIcon = '<i class="fas fa-calculator profession-icon"></i>';
    } else if (pro.profession.toLowerCase().includes('financial') || 
               pro.profession.toLowerCase().includes('advisor') ||
               pro.profession.toLowerCase().includes('investment')) {
        professionIcon = '<i class="fas fa-chart-line profession-icon"></i>';
    } else {
        professionIcon = '<i class="fas fa-briefcase profession-icon"></i>';
    }

    card.innerHTML = `
        <div class="pro-left">
            <img src="${pro.image}" alt="${pro.name}" class="pro-image">
            <div class="pro-rating" title="${pro.rating}/5">
                ${starsHTML}
                <span class="rating-number">${pro.rating}</span>
            </div>
        </div>
        <div class="pro-center">
            <h3 class="pro-name">
                ${pro.name}
                <i class="fas fa-check-circle verified-badge" title="Verified Professional"></i>
            </h3>
            <p class="pro-profession">
                ${professionIcon}
                ${pro.profession} • ${pro.specialization}
            </p>
            <div class="pro-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${pro.location}</span>
                <span><i class="fas fa-chart-line"></i> ${pro.experience} years experience</span>
            </div>
            <p class="pro-description">${pro.description}</p>
        </div>
        <div class="pro-right">
            <button class="book-btn" data-fee="${pro.fee}" onclick="window.location.href='../booking/index.html?proId=${pro.id}'">
                <i class="fas fa-calendar-check"></i>
                Book Now
            </button>
        </div>
    `;
    return card;
}

    // --- START THE APP ---
    initializeApp();
});