// Hardcoded database of professionals with India-based geolocation data
const professionals = [
    {
        id: 1,
        name: "Rajesh Sharma",
        profession: "Lawyer",
        specialization: "Corporate Law",
        location: "Mumbai",
        coordinates: { lat: 19.0760, lng: 72.8777 },
        experience: 8,
        rating: 4.7,
        fee: 15000,
        description: "Specialized in corporate law with extensive experience in mergers and acquisitions. Expert in company formation and compliance.",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        whatsapp: "+919876543210"
    },
    {
        id: 2,
        name: "Priya Patel",
        profession: "Financial Advisor",
        specialization: "Investment Planning",
        location: "Delhi",
        coordinates: { lat: 28.6139, lng: 77.2090 },
        experience: 12,
        rating: 4.9,
        fee: 25000,
        description: "Certified financial planner helping clients grow their wealth through strategic investment planning and mutual funds.",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        whatsapp: "+919876543211"
    },
    {
        id: 3,
        name: "Arjun Gupta",
        profession: "Accountant",
        specialization: "Tax Consulting",
        location: "Bangalore",
        coordinates: { lat: 12.9716, lng: 77.5946 },
        experience: 6,
        rating: 4.5,
        fee: 12000,
        description: "Expert in GST, income tax, and financial reporting for small and medium businesses. CA qualified.",
        image: "https://randomuser.me/api/portraits/men/75.jpg",
        whatsapp: "+919876543212"
    },
    {
        id: 4,
        name: "Anita Singh",
        profession: "Lawyer",
        specialization: "Family Law",
        location: "Delhi",
        coordinates: { lat: 28.6139, lng: 77.2090 },
        experience: 5,
        rating: 4.3,
        fee: 18000,
        description: "Compassionate family law attorney with expertise in divorce, child custody, and matrimonial disputes.",
        image: "https://randomuser.me/api/portraits/women/63.jpg",
        whatsapp: "+919876543213"
    },
    {
        id: 5,
        name: "Vikram Reddy",
        profession: "Financial Advisor",
        specialization: "Retirement Planning",
        location: "Hyderabad",
        coordinates: { lat: 17.3850, lng: 78.4867 },
        experience: 15,
        rating: 4.8,
        fee: 30000,
        description: "Helping clients plan for secure retirement with personalized financial strategies and pension planning.",
        image: "https://randomuser.me/api/portraits/men/81.jpg",
        whatsapp: "+919876543214"
    },
    {
        id: 6,
        name: "Kavya Menon",
        profession: "Accountant",
        specialization: "Auditing",
        location: "Chennai",
        coordinates: { lat: 13.0827, lng: 80.2707 },
        experience: 7,
        rating: 4.6,
        fee: 16000,
        description: "Chartered accountant with expertise in financial auditing, compliance, and statutory reporting.",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        whatsapp: "+919876543215"
    },
    {
        id: 7,
        name: "Amit Joshi",
        profession: "Lawyer",
        specialization: "Criminal Law",
        location: "Pune",
        coordinates: { lat: 18.5204, lng: 73.8567 },
        experience: 10,
        rating: 4.6,
        fee: 22000,
        description: "Expert criminal defense attorney with a strong track record in complex criminal cases and bail applications.",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        whatsapp: "+919876543216"
    },
    {
        id: 8,
        name: "Sneha Agarwal",
        profession: "Accountant",
        specialization: "Financial Analysis",
        location: "Kolkata",
        coordinates: { lat: 22.5726, lng: 88.3639 },
        experience: 9,
        rating: 4.4,
        fee: 14000,
        description: "Skilled financial analyst helping businesses optimize their financial performance and cash flow management.",
        image: "https://randomuser.me/api/portraits/women/32.jpg",
        whatsapp: "+919876543217"
    },
    {
        id: 9,
        name: "Rohit Kumar",
        profession: "Lawyer",
        specialization: "Property Law",
        location: "Gurgaon",
        coordinates: { lat: 28.4595, lng: 77.0266 },
        experience: 11,
        rating: 4.7,
        fee: 20000,
        description: "Specialist in property law, real estate transactions, and property disputes. Expert in RERA compliance.",
        image: "https://randomuser.me/api/portraits/men/28.jpg",
        whatsapp: "+919876543218"
    },
    {
        id: 10,
        name: "Meera Nair",
        profession: "Financial Advisor",
        specialization: "Insurance Planning",
        location: "Mumbai",
        coordinates: { lat: 19.0760, lng: 72.8777 },
        experience: 8,
        rating: 4.5,
        fee: 18000,
        description: "Certified insurance advisor specializing in life, health, and general insurance planning for individuals and families.",
        image: "https://randomuser.me/api/portraits/women/56.jpg",
        whatsapp: "+919876543219"
    },
    {
        id: 11,
        name: "Deepak Chopra",
        profession: "Accountant",
        specialization: "GST Consulting",
        location: "Noida",
        coordinates: { lat: 28.5355, lng: 77.3910 },
        experience: 6,
        rating: 4.3,
        fee: 13000,
        description: "GST expert with comprehensive knowledge of indirect tax compliance, returns filing, and GST audits.",
        image: "https://randomuser.me/api/portraits/men/65.jpg",
        whatsapp: "+919876543220"
    },
    {
        id: 12,
        name: "Sushma Rao",
        profession: "Lawyer",
        specialization: "Labour Law",
        location: "Bangalore",
        coordinates: { lat: 12.9716, lng: 77.5946 },
        experience: 9,
        rating: 4.6,
        fee: 17000,
        description: "Labour law specialist handling employment disputes, industrial relations, and HR compliance matters.",
        image: "https://randomuser.me/api/portraits/women/41.jpg",
        whatsapp: "+919876543221"
    }
];

// Enhanced India-based location mapping with coordinates
const locationMap = {
    'mumbai': { 
        aliases: ['mumbai', 'bombay', 'maharashtra mumbai', 'mumbai city'],
        coordinates: { lat: 19.0760, lng: 72.8777 },
        standard: 'Mumbai'
    },
    'delhi': { 
        aliases: ['delhi', 'new delhi', 'ncr', 'national capital region', 'delhi ncr'],
        coordinates: { lat: 28.6139, lng: 77.2090 },
        standard: 'Delhi'
    },
    'bangalore': { 
        aliases: ['bangalore', 'bengaluru', 'karnataka bangalore', 'silicon valley of india'],
        coordinates: { lat: 12.9716, lng: 77.5946 },
        standard: 'Bangalore'
    },
    'hyderabad': { 
        aliases: ['hyderabad', 'cyberabad', 'telangana hyderabad', 'hyd'],
        coordinates: { lat: 17.3850, lng: 78.4867 },
        standard: 'Hyderabad'
    },
    'chennai': { 
        aliases: ['chennai', 'madras', 'tamil nadu chennai', 'chennai city'],
        coordinates: { lat: 13.0827, lng: 80.2707 },
        standard: 'Chennai'
    },
    'pune': { 
        aliases: ['pune', 'poona', 'maharashtra pune', 'pune city'],
        coordinates: { lat: 18.5204, lng: 73.8567 },
        standard: 'Pune'
    },
    'kolkata': { 
        aliases: ['kolkata', 'calcutta', 'west bengal kolkata', 'city of joy'],
        coordinates: { lat: 22.5726, lng: 88.3639 },
        standard: 'Kolkata'
    },
    'gurgaon': { 
        aliases: ['gurgaon', 'gurugram', 'haryana gurgaon', 'millennium city'],
        coordinates: { lat: 28.4595, lng: 77.0266 },
        standard: 'Gurgaon'
    },
    'noida': { 
        aliases: ['noida', 'new okhla', 'uttar pradesh noida', 'greater noida'],
        coordinates: { lat: 28.5355, lng: 77.3910 },
        standard: 'Noida'
    }
};

// Enhanced keywords mapping for Indian context
const searchKeywords = {
    professions: {
        'lawyer': ['lawyer', 'attorney', 'advocate', 'legal', 'counsel', 'barrister', 'solicitor', 'law', 'lawyers'],
        'financial advisor': ['financial advisor', 'finance', 'investment', 'wealth', 'advisor', 'planner', 'financial planner', 'advisors', 'financial consultant'],
        'accountant': ['accountant', 'accounting', 'ca', 'chartered accountant', 'cpa', 'bookkeeper', 'tax', 'audit', 'auditor', 'accountants']
    },
    specializations: {
        'corporate law': ['corporate', 'business', 'merger', 'acquisition', 'commercial', 'company law'],
        'family law': ['family', 'divorce', 'custody', 'marriage', 'child', 'matrimonial'],
        'criminal law': ['criminal', 'defense', 'prosecution', 'court', 'bail'],
        'property law': ['property', 'real estate', 'land', 'rera', 'property disputes'],
        'labour law': ['labour', 'employment', 'hr', 'industrial relations', 'workers'],
        'investment planning': ['investment', 'portfolio', 'wealth', 'growth', 'mutual funds'],
        'retirement planning': ['retirement', 'pension', 'senior', 'elderly', 'pf', 'provident fund'],
        'insurance planning': ['insurance', 'life insurance', 'health insurance', 'general insurance'],
        'tax consulting': ['tax', 'taxation', 'filing', 'returns', 'income tax'],
        'auditing': ['audit', 'compliance', 'review', 'examination', 'statutory audit'],
        'financial analysis': ['analysis', 'analyst', 'financial analysis', 'cash flow'],
        'gst consulting': ['gst', 'goods and services tax', 'indirect tax', 'gst returns']
    }
};

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Parse natural language query to extract criteria
function parseNaturalQuery(query) {
    const queryLower = query.toLowerCase();
    const criteria = {
        profession: null,
        location: null,
        maxFee: null,
        minExperience: null,
        minRating: null,
        specialization: null
    };

    // Extract profession
    for (const [profession, keywords] of Object.entries(searchKeywords.professions)) {
        if (keywords.some(keyword => queryLower.includes(keyword))) {
            criteria.profession = profession;
            break;
        }
    }

    // Extract location with improved matching
    for (const [location, data] of Object.entries(locationMap)) {
        if (data.aliases.some(alias => queryLower.includes(alias))) {
            criteria.location = data.standard;
            break;
        }
    }

    // Extract specialization
    for (const [specialization, keywords] of Object.entries(searchKeywords.specializations)) {
        if (keywords.some(keyword => queryLower.includes(keyword))) {
            criteria.specialization = specialization;
            break;
        }
    }

    // Extract fee/price patterns (Indian currency context)
    const feePatterns = [
        /under\s+(\d+)k?/i,
        /below\s+(\d+)k?/i,
        /less\s+than\s+(\d+)k?/i,
        /maximum\s+(\d+)k?/i,
        /max\s+(\d+)k?/i,
        /budget\s+(\d+)k?/i,
        /(\d+)k?\s+max/i,
        /(\d+)k?\s+budget/i,
        /under\s+rs\s+(\d+)k?/i,
        /below\s+rs\s+(\d+)k?/i,
        /rs\s+(\d+)k?\s+max/i,
        /rupees\s+(\d+)k?/i
    ];

    for (const pattern of feePatterns) {
        const match = queryLower.match(pattern);
        if (match) {
            let amount = parseInt(match[1]);
            // Handle 'k' suffix (e.g., "20k" = 20000)
            if (match[0].includes('k')) {
                amount *= 1000;
            }
            criteria.maxFee = amount;
            break;
        }
    }

    // Extract experience patterns
    const experiencePatterns = [
        /(\d+)\+?\s+years?\s+experience/i,
        /(\d+)\+?\s+years?\s+exp/i,
        /experience\s+(\d+)\+?\s+years?/i,
        /minimum\s+(\d+)\+?\s+years?/i,
        /min\s+(\d+)\+?\s+years?/i,
        /at\s+least\s+(\d+)\+?\s+years?/i,
        /(\d+)\+?\s+years?/i
    ];

    for (const pattern of experiencePatterns) {
        const match = queryLower.match(pattern);
        if (match) {
            criteria.minExperience = parseInt(match[1]);
            break;
        }
    }

    // Extract rating patterns
    const ratingPatterns = [
        /(\d+(?:\.\d+)?)\+?\s+stars?/i,
        /(\d+(?:\.\d+)?)\+?\s+rating/i,
        /rating\s+(\d+(?:\.\d+)?)\+?/i,
        /minimum\s+(\d+(?:\.\d+)?)\+?\s+stars?/i,
        /at\s+least\s+(\d+(?:\.\d+)?)\+?\s+stars?/i
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

// Enhanced search function with natural language processing
function searchProfessionals(query) {
    if (!query || query.trim() === '') return professionals;
    
    const criteria = parseNaturalQuery(query);
    const queryLower = query.toLowerCase().trim();
    
    // Filter professionals based on extracted criteria
    let results = professionals.filter(pro => {
        // Profession match
        if (criteria.profession && pro.profession.toLowerCase() !== criteria.profession) {
            return false;
        }
        
        // Location match (if specified)
        if (criteria.location && pro.location !== criteria.location) {
            return false;
        }
        
        // Fee constraint
        if (criteria.maxFee && pro.fee > criteria.maxFee) {
            return false;
        }
        
        // Experience constraint
        if (criteria.minExperience && pro.experience < criteria.minExperience) {
            return false;
        }
        
        // Rating constraint
        if (criteria.minRating && pro.rating < criteria.minRating) {
            return false;
        }
        
        // Specialization match
        if (criteria.specialization && pro.specialization.toLowerCase() !== criteria.specialization) {
            return false;
        }
        
        return true;
    });
    
    // If no specific location was mentioned, perform general search
    if (!criteria.location) {
        const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 0);
        results = results.filter(pro => {
            const searchFields = [
                pro.name.toLowerCase(),
                pro.profession.toLowerCase(),
                pro.specialization.toLowerCase(),
                pro.location.toLowerCase(),
                pro.description.toLowerCase()
            ].join(' ');
            
            return queryTerms.some(term => searchFields.includes(term));
        });
    }
    
    // Sort results by location proximity if a location was specified
    if (criteria.location) {
        const targetLocation = Object.values(locationMap).find(loc => loc.standard === criteria.location);
        if (targetLocation) {
            results.sort((a, b) => {
                // Exact location match first
                if (a.location === criteria.location && b.location !== criteria.location) return -1;
                if (b.location === criteria.location && a.location !== criteria.location) return 1;
                
                // Then sort by distance
                const distanceA = calculateDistance(
                    targetLocation.coordinates.lat, 
                    targetLocation.coordinates.lng,
                    a.coordinates.lat, 
                    a.coordinates.lng
                );
                const distanceB = calculateDistance(
                    targetLocation.coordinates.lat, 
                    targetLocation.coordinates.lng,
                    b.coordinates.lat, 
                    b.coordinates.lng
                );
                
                return distanceA - distanceB;
            });
        }
    }
    
    return results;
}

// Filter professionals based on active filters
function filterProfessionals(pros) {
    const professionFilter = document.getElementById('professionFilter')?.value || '';
    const locationFilter = document.getElementById('locationFilter')?.value || '';
    const experienceFilter = document.getElementById('experienceFilter')?.value || '';
    const priceFilter = document.getElementById('priceFilter')?.value || '';
    
    return pros.filter(pro => {
        const matchesProfession = !professionFilter || pro.profession.toLowerCase() === professionFilter.toLowerCase();
        const matchesLocation = !locationFilter || pro.location.toLowerCase() === locationFilter.toLowerCase();
        const matchesExperience = !experienceFilter || pro.experience >= parseInt(experienceFilter);
        const matchesPrice = !priceFilter || pro.fee <= parseInt(priceFilter);
        
        return matchesProfession && matchesLocation && matchesExperience && matchesPrice;
    });
}

// Display professionals with location indicators
function displayProfessionals(pros) {
    const prosGrid = document.getElementById('prosGrid');
    if (!prosGrid) return;
    
    prosGrid.innerHTML = '';
    
    if (pros.length === 0) {
        prosGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No professionals found matching your criteria.</p>';
        return;
    }
    
    pros.forEach((pro, index) => {
        const proCard = document.createElement('div');
        proCard.className = 'pro-card';
        
        // Add priority indicator for exact location matches
        const isExactLocationMatch = index === 0 || (index > 0 && pros[index-1].location === pro.location);
        const locationBadge = isExactLocationMatch ? '<span class="exact-match">📍 Exact Match</span>' : '';
        
        const stars = '★'.repeat(Math.floor(pro.rating)) + '☆'.repeat(5 - Math.floor(pro.rating));
        
        proCard.innerHTML = `
            <img src="${pro.image}" alt="${pro.name}" class="pro-image">
            <div class="pro-details">
                ${locationBadge}
                <h3 class="pro-name">${pro.name}</h3>
                <span class="pro-profession">${pro.profession}</span>
                <div class="pro-rating" title="${pro.rating.toFixed(1)}/5">${stars}</div>
                <p class="pro-experience">${pro.experience}+ years experience</p>
                <p class="pro-location">📍 ${pro.location}</p>
                <p class="pro-specialization">${pro.specialization}</p>
                <p class="pro-description">${pro.description}</p>
                <div class="pro-footer">
                    <span class="pro-price">₹${pro.fee.toLocaleString()}</span>
                    <button class="whatsapp-btn" onclick="window.open('https://wa.me/${pro.whatsapp}', '_blank')">
                        <i class="fab fa-whatsapp"></i> Contact
                    </button>
                </div>
            </div>
        `;
        
        prosGrid.appendChild(proCard);
    });
}

// Toggle filter visibility
function toggleFilters() {
    const filterOptions = document.getElementById('filterOptions');
    const filterToggle = document.getElementById('filterToggle');
    
    if (!filterOptions || !filterToggle) return;
    
    if (filterOptions.style.display === 'none' || !filterOptions.style.display) {
        filterOptions.style.display = 'flex';
        filterToggle.innerHTML = '<i class="fas fa-times"></i> Close Filters';
    } else {
        filterOptions.style.display = 'none';
        filterToggle.innerHTML = '<i class="fas fa-sliders-h"></i> Filters';
    }
}

// Enhanced search and filter function
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    // Apply natural language search first, then manual filters
    const searchedPros = searchProfessionals(query);
    const filteredPros = filterProfessionals(searchedPros);
    
    // Hide all other sections
    document.querySelectorAll('.container > section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show search results container
    const resultsContainer = document.getElementById('searchResultsContainer');
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
        
        // Update results count and show parsed query info
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const criteria = parseNaturalQuery(query);
            let criteriaText = '';
            
            if (criteria.profession) criteriaText += `Profession: ${criteria.profession.charAt(0).toUpperCase() + criteria.profession.slice(1)} • `;
            if (criteria.location) criteriaText += `Location: ${criteria.location} • `;
            if (criteria.maxFee) criteriaText += `Max Fee: ₹${criteria.maxFee.toLocaleString()} • `;
            if (criteria.minExperience) criteriaText += `Min Experience: ${criteria.minExperience}+ years • `;
            if (criteria.minRating) criteriaText += `Min Rating: ${criteria.minRating}+ stars • `;
            
            criteriaText = criteriaText.replace(/ • $/, '');
            
            resultsCount.innerHTML = `
                <div>${filteredPros.length} professional${filteredPros.length !== 1 ? 's' : ''} found</div>
                ${criteriaText ? `<div style="font-size: 0.9em; color: var(--text-light); margin-top: 5px;">Search criteria: ${criteriaText}</div>` : ''}
            `;
        }
    }
    
    // Display professionals
    displayProfessionals(filteredPros);
    
    // Add back button if it doesn't exist
    if (!document.querySelector('.back-to-home') && resultsContainer) {
        const backButton = document.createElement('button');
        backButton.className = 'back-to-home';
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Home';
        backButton.onclick = () => {
            resultsContainer.style.display = 'none';
            document.querySelectorAll('.container > section').forEach(section => {
                section.style.display = 'block';
            });
            if (searchInput) searchInput.value = '';
            resetFilters();
        };
        resultsContainer.prepend(backButton);
    }
}

// Reset all filters
function resetFilters() {
    const filters = ['professionFilter', 'locationFilter', 'experienceFilter', 'priceFilter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.value = '';
        }
    });
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
    // Hide filters by default
    const filterOptions = document.getElementById('filterOptions');
    if (filterOptions) {
        filterOptions.style.display = 'none';
    }
    
    // Set up filter toggle
    const filterToggle = document.getElementById('filterToggle');
    if (filterToggle) {
        filterToggle.addEventListener('click', toggleFilters);
    }
    
    // Search button click handler
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // Search on Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        
        // Add placeholder with Indian context example
        searchInput.placeholder = 'e.g., "lawyers in Mumbai under 20k with 5+ years experience and 4+ star rating"';
    }
    
    // Filter change handlers
    const filterIds = ['professionFilter', 'locationFilter', 'experienceFilter', 'priceFilter'];
    filterIds.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', () => {
                const resultsContainer = document.getElementById('searchResultsContainer');
                if (resultsContainer && resultsContainer.style.display === 'block') {
                    performSearch();
                }
            });
        }
    });
});

// Export functions for external use
window.searchProfessionals = searchProfessionals;
window.filterProfessionals = filterProfessionals;
window.performSearch = performSearch;
window.parseNaturalQuery = parseNaturalQuery;
// Enhanced search functionality with better natural language processing and fallback results
function enhancedSearchProfessionals(query) {
    if (!query || query.trim() === '') return professionals;
    
    const criteria = parseNaturalQuery(query);
    const queryLower = query.toLowerCase().trim();
    
    // First, try exact matches
    let exactResults = professionals.filter(pro => {
        // Profession match
        if (criteria.profession && pro.profession.toLowerCase() !== criteria.profession) {
            return false;
        }
        
        // Location match (if specified)
        if (criteria.location && pro.location !== criteria.location) {
            return false;
        }
        
        // Fee constraint
        if (criteria.maxFee && pro.fee > criteria.maxFee) {
            return false;
        }
        
        // Experience constraint
        if (criteria.minExperience && pro.experience < criteria.minExperience) {
            return false;
        }
        
        // Rating constraint
        if (criteria.minRating && pro.rating < criteria.minRating) {
            return false;
        }
        
        // Specialization match
        if (criteria.specialization && pro.specialization.toLowerCase() !== criteria.specialization) {
            return false;
        }
        
        return true;
    });
    
    // If we have exact matches, return them first
    if (exactResults.length > 0) {
        // Sort exact matches by relevance
        exactResults = sortByRelevance(exactResults, criteria);
        return exactResults;
    }
    
    // If no exact matches, try partial/fuzzy matches
    let partialResults = professionals.filter(pro => {
        // Check if any criteria partially matches
        let matches = 0;
        let totalCriteria = 0;
        
        // Profession partial match
        if (criteria.profession) {
            totalCriteria++;
            if (pro.profession.toLowerCase().includes(criteria.profession)) matches++;
        }
        
        // Location partial match
        if (criteria.location) {
            totalCriteria++;
            if (pro.location.toLowerCase().includes(criteria.location.toLowerCase())) matches++;
        }
        
        // Fee partial match (within 20% of max fee)
        if (criteria.maxFee) {
            totalCriteria++;
            if (pro.fee <= criteria.maxFee * 1.2) matches++;
        }
        
        // Experience partial match (within 2 years of min experience)
        if (criteria.minExperience) {
            totalCriteria++;
            if (pro.experience >= criteria.minExperience - 2) matches++;
        }
        
        // Rating partial match (within 0.5 of min rating)
        if (criteria.minRating) {
            totalCriteria++;
            if (pro.rating >= criteria.minRating - 0.5) matches++;
        }
        
        // Specialization partial match
        if (criteria.specialization) {
            totalCriteria++;
            if (pro.specialization.toLowerCase().includes(criteria.specialization)) matches++;
        }
        
        // Consider it a partial match if at least half the criteria match
        return matches > 0 && matches >= Math.ceil(totalCriteria / 2);
    });
    
    // If we have partial matches, return them sorted by relevance
    if (partialResults.length > 0) {
        partialResults = sortByRelevance(partialResults, criteria);
        return partialResults;
    }
    
    // If still no results, try keyword matching without strict criteria
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2); // ignore short words
    
    let keywordResults = professionals.filter(pro => {
        const searchFields = [
            pro.name.toLowerCase(),
            pro.profession.toLowerCase(),
            pro.specialization.toLowerCase(),
            pro.location.toLowerCase(),
            pro.description.toLowerCase()
        ].join(' ');
        
        return queryTerms.some(term => searchFields.includes(term));
    });
    
    // Sort keyword results by relevance
    keywordResults = sortByRelevance(keywordResults, criteria);
    
    return keywordResults;
}

// Sort professionals by relevance to search criteria
function sortByRelevance(pros, criteria) {
    return pros.sort((a, b) => {
        // Score each professional based on how well they match the criteria
        const scoreA = calculateRelevanceScore(a, criteria);
        const scoreB = calculateRelevanceScore(b, criteria);
        
        // Higher score first
        return scoreB - scoreA;
    });
}

// Calculate relevance score for a professional based on search criteria
function calculateRelevanceScore(pro, criteria) {
    let score = 0;
    
    // Profession match
    if (criteria.profession) {
        if (pro.profession.toLowerCase() === criteria.profession) score += 30;
        else if (pro.profession.toLowerCase().includes(criteria.profession)) score += 15;
    }
    
    // Location match
    if (criteria.location) {
        if (pro.location === criteria.location) score += 25;
        else if (pro.location.toLowerCase().includes(criteria.location.toLowerCase())) score += 10;
    }
    
    // Fee match (closer to max fee is better)
    if (criteria.maxFee) {
        if (pro.fee <= criteria.maxFee) score += 20;
        else if (pro.fee <= criteria.maxFee * 1.2) score += 10;
    }
    
    // Experience match (more experience is better)
    if (criteria.minExperience) {
        if (pro.experience >= criteria.minExperience) {
            const extraYears = pro.experience - criteria.minExperience;
            score += 15 + Math.min(extraYears, 5); // bonus for extra experience up to 5 years
        } else if (pro.experience >= criteria.minExperience - 2) {
            score += 5;
        }
    }
    
    // Rating match (higher rating is better)
    if (criteria.minRating) {
        if (pro.rating >= criteria.minRating) {
            const extraRating = pro.rating - criteria.minRating;
            score += 10 + extraRating * 5; // bonus for higher rating
        } else if (pro.rating >= criteria.minRating - 0.5) {
            score += 5;
        }
    }
    
    // Specialization match
    if (criteria.specialization) {
        if (pro.specialization.toLowerCase() === criteria.specialization) score += 20;
        else if (pro.specialization.toLowerCase().includes(criteria.specialization)) score += 10;
    }
    
    // Boost score for exact matches in description
    if (criteria.profession && pro.description.toLowerCase().includes(criteria.profession)) {
        score += 5;
    }
    if (criteria.specialization && pro.description.toLowerCase().includes(criteria.specialization)) {
        score += 5;
    }
    
    return score;
}

// Enhanced filter functionality that works with the new search
function enhancedFilterProfessionals(pros) {
    const professionFilter = document.getElementById('professionFilter')?.value || '';
    const locationFilter = document.getElementById('locationFilter')?.value || '';
    const experienceFilter = document.getElementById('experienceFilter')?.value || '';
    const priceFilter = document.getElementById('priceFilter')?.value || '';
    
    // If no filters are applied, return all professionals
    if (!professionFilter && !locationFilter && !experienceFilter && !priceFilter) {
        return pros;
    }
    
    // First, try exact matches
    let exactResults = pros.filter(pro => {
        const matchesProfession = !professionFilter || pro.profession.toLowerCase() === professionFilter.toLowerCase();
        const matchesLocation = !locationFilter || pro.location.toLowerCase() === locationFilter.toLowerCase();
        const matchesExperience = !experienceFilter || pro.experience >= parseInt(experienceFilter);
        const matchesPrice = !priceFilter || pro.fee <= parseInt(priceFilter);
        
        return matchesProfession && matchesLocation && matchesExperience && matchesPrice;
    });
    
    // If we have exact matches, return them first
    if (exactResults.length > 0) {
        return exactResults;
    }
    
    // If no exact matches, try partial matches
    let partialResults = pros.filter(pro => {
        let matches = 0;
        let totalFilters = 0;
        
        if (professionFilter) {
            totalFilters++;
            if (pro.profession.toLowerCase().includes(professionFilter.toLowerCase())) matches++;
        }
        
        if (locationFilter) {
            totalFilters++;
            if (pro.location.toLowerCase().includes(locationFilter.toLowerCase())) matches++;
        }
        
        if (experienceFilter) {
            totalFilters++;
            if (pro.experience >= parseInt(experienceFilter) - 2) matches++;
        }
        
        if (priceFilter) {
            totalFilters++;
            if (pro.fee <= parseInt(priceFilter) * 1.2) matches++;
        }
        
        return matches > 0 && matches >= Math.ceil(totalFilters / 2);
    });
    
    return partialResults;
}

// Enhanced display function that shows relevance information
function enhancedDisplayProfessionals(pros) {
    const prosGrid = document.getElementById('prosGrid');
    if (!prosGrid) return;
    
    prosGrid.innerHTML = '';
    
    if (pros.length === 0) {
        prosGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No professionals found matching your criteria. Try broadening your search.</p>';
        return;
    }
    
    // Group by exact and partial matches
    const exactMatches = [];
    const partialMatches = [];
    
    pros.forEach(pro => {
        // This is a simplified version - you might want to implement more sophisticated grouping
        if (isExactMatch(pro)) {
            exactMatches.push(pro);
        } else {
            partialMatches.push(pro);
        }
    });
    
    // Display exact matches first
    if (exactMatches.length > 0) {
        const exactHeader = document.createElement('h3');
        exactHeader.className = 'results-header';
        exactHeader.textContent = 'Exact Matches';
        prosGrid.appendChild(exactHeader);
        
        exactMatches.forEach(pro => {
            prosGrid.appendChild(createProCard(pro, true));
        });
    }
    
    // Display partial matches if there are any
    if (partialMatches.length > 0) {
        const partialHeader = document.createElement('h3');
        partialHeader.className = 'results-header';
        partialHeader.textContent = 'Related Professionals';
        prosGrid.appendChild(partialHeader);
        
        partialMatches.forEach(pro => {
            prosGrid.appendChild(createProCard(pro, false));
        });
    }
}

// Helper function to check if a professional is an exact match
function isExactMatch(pro) {
    // This should be implemented based on your criteria
    // For now, we'll just return true for all as a placeholder
    return true;
}

// Helper function to create a professional card
function createProCard(pro, isExactMatch) {
    const proCard = document.createElement('div');
    proCard.className = 'pro-card';
    
    const stars = '★'.repeat(Math.floor(pro.rating)) + '☆'.repeat(5 - Math.floor(pro.rating));
    const matchBadge = isExactMatch ? '<span class="exact-match">✓ Exact Match</span>' : '<span class="partial-match">∼ Close Match</span>';
    
    proCard.innerHTML = `
        <img src="${pro.image}" alt="${pro.name}" class="pro-image">
        <div class="pro-details">
            ${matchBadge}
            <h3 class="pro-name">${pro.name}</h3>
            <span class="pro-profession">${pro.profession}</span>
            <div class="pro-rating" title="${pro.rating.toFixed(1)}/5">${stars}</div>
            <p class="pro-experience">${pro.experience}+ years experience</p>
            <p class="pro-location">📍 ${pro.location}</p>
            <p class="pro-specialization">${pro.specialization}</p>
            <p class="pro-description">${pro.description}</p>
            <div class="pro-footer">
                <span class="pro-price">₹${pro.fee.toLocaleString()}</span>
                <button class="whatsapp-btn" onclick="window.open('https://wa.me/${pro.whatsapp}', '_blank')">
                    <i class="fab fa-whatsapp"></i> Contact
                </button>
            </div>
        </div>
    `;
    
    return proCard;
}

// Enhanced performSearch function that uses all the new features
function enhancedPerformSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    // Apply enhanced search
    const searchedPros = enhancedSearchProfessionals(query);
    const filteredPros = enhancedFilterProfessionals(searchedPros);
    
    // Hide all other sections
    document.querySelectorAll('.container > section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show search results container
    const resultsContainer = document.getElementById('searchResultsContainer');
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
        
        // Update results count
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.innerHTML = `
                <div>${filteredPros.length} professional${filteredPros.length !== 1 ? 's' : ''} found</div>
                <div style="font-size: 0.9em; color: var(--text-light); margin-top: 5px;">
                    Showing best matches first
                </div>
            `;
        }
    }
    
    // Display professionals with enhanced display
    enhancedDisplayProfessionals(filteredPros);
    
    // Add back button if it doesn't exist
    if (!document.querySelector('.back-to-home') && resultsContainer) {
        const backButton = document.createElement('button');
        backButton.className = 'back-to-home';
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Home';
        backButton.onclick = () => {
            resultsContainer.style.display = 'none';
            document.querySelectorAll('.container > section').forEach(section => {
                section.style.display = 'block';
            });
            if (searchInput) searchInput.value = '';
            resetFilters();
        };
        resultsContainer.prepend(backButton);
    }
}

// Update the event listeners to use the enhanced functions
document.addEventListener('DOMContentLoaded', () => {
    // Hide filters by default
    const filterOptions = document.getElementById('filterOptions');
    if (filterOptions) {
        filterOptions.style.display = 'none';
    }
    
    // Set up filter toggle
    const filterToggle = document.getElementById('filterToggle');
    if (filterToggle) {
        filterToggle.addEventListener('click', toggleFilters);
    }
    
    // Search button click handler - now using enhanced version
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', enhancedPerformSearch);
    }
    
    // Search on Enter key - now using enhanced version
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') enhancedPerformSearch();
        });
        
        // Add placeholder with Indian context example
        searchInput.placeholder = 'e.g., "lawyers in Mumbai under 20k with 5+ years experience"';
    }
    
    // Filter change handlers - now using enhanced version
    const filterIds = ['professionFilter', 'locationFilter', 'experienceFilter', 'priceFilter'];
    filterIds.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', () => {
                const resultsContainer = document.getElementById('searchResultsContainer');
                if (resultsContainer && resultsContainer.style.display === 'block') {
                    enhancedPerformSearch();
                }
            });
        }
    });
});

// Add some CSS for the new elements
const style = document.createElement('style');
style.textContent = `
    .results-header {
        grid-column: 1 / -1;
        margin: 20px 0 10px;
        color: var(--primary-color);
        font-size: 1.2em;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
    }
    
    .exact-match {
        background-color: #4CAF50;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        display: inline-block;
        margin-bottom: 5px;
    }
    
    .partial-match {
        background-color: #FFC107;
        color: black;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        display: inline-block;
        margin-bottom: 5px;
    }
`;
document.head.appendChild(style);

// Export the new enhanced functions
window.enhancedSearchProfessionals = enhancedSearchProfessionals;
window.enhancedFilterProfessionals = enhancedFilterProfessionals;
window.enhancedPerformSearch = enhancedPerformSearch;
window.enhancedDisplayProfessionals = enhancedDisplayProfessionals;