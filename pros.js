// Professional Database with Enhanced Fields
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
        pricing: "₹15,000 per consultation",
        description: "Specialized in corporate law with extensive experience in mergers and acquisitions. Expert in company formation and compliance.",
        workingHours: "10:00 AM - 7:00 PM, Mon-Sat",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        whatsapp: ""
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
        pricing: "₹25,000 for comprehensive planning",
        description: "Certified financial planner helping clients grow their wealth through strategic investment planning and mutual funds.",
        workingHours: "9:30 AM - 6:30 PM, Mon-Fri",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        whatsapp: ""
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
        pricing: "₹12,000 per tax filing",
        description: "Expert in GST, income tax, and financial reporting for small and medium businesses. CA qualified.",
        workingHours: "10:00 AM - 5:00 PM, Tue-Sat",
        image: "https://randomuser.me/api/portraits/men/75.jpg",
        whatsapp: ""
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
        pricing: "₹18,000 per session",
        description: "Compassionate family law attorney with expertise in divorce, child custody, and matrimonial disputes.",
        workingHours: "11:00 AM - 8:00 PM, Mon-Sat",
        image: "https://randomuser.me/api/portraits/women/63.jpg",
        whatsapp: ""
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
        pricing: "₹30,000 retirement plan",
        description: "Helping clients plan for secure retirement with personalized financial strategies and pension planning.",
        workingHours: "9:00 AM - 5:00 PM, Mon-Fri",
        image: "https://randomuser.me/api/portraits/men/81.jpg",
        whatsapp: ""
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
        pricing: "₹16,000 per audit",
        description: "Chartered accountant with expertise in financial auditing, compliance, and statutory reporting.",
        workingHours: "10:30 AM - 6:30 PM, Mon-Fri",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        whatsapp: ""
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
        pricing: "₹22,000 per case review",
        description: "Expert criminal defense attorney with a strong track record in complex criminal cases and bail applications.",
        workingHours: "10:00 AM - 7:00 PM, Mon-Sat",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        whatsapp: ""
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
        pricing: "₹14,000 per analysis",
        description: "Skilled financial analyst helping businesses optimize their financial performance and cash flow management.",
        workingHours: "9:00 AM - 6:00 PM, Mon-Fri",
        image: "https://randomuser.me/api/portraits/women/32.jpg",
        whatsapp: ""
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
        pricing: "₹20,000 per consultation",
        description: "Specialist in property law, real estate transactions, and property disputes. Expert in RERA compliance.",
        workingHours: "10:00 AM - 6:00 PM, Mon-Sat",
        image: "https://randomuser.me/api/portraits/men/28.jpg",
        whatsapp: ""
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
        pricing: "₹18,000 insurance plan",
        description: "Certified insurance advisor specializing in life, health, and general insurance planning for individuals and families.",
        workingHours: "10:30 AM - 6:30 PM, Mon-Fri",
        image: "https://randomuser.me/api/portraits/women/56.jpg",
        whatsapp: ""
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
        pricing: "₹13,000 GST filing",
        description: "GST expert with comprehensive knowledge of indirect tax compliance, returns filing, and GST audits.",
        workingHours: "11:00 AM - 7:00 PM, Tue-Sat",
        image: "https://randomuser.me/api/portraits/men/65.jpg",
        whatsapp: ""
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
        pricing: "₹17,000 per consultation",
        description: "Labour law specialist handling employment disputes, industrial relations, and HR compliance matters.",
        workingHours: "10:00 AM - 6:00 PM, Mon-Fri",
        image: "https://randomuser.me/api/portraits/women/41.jpg",
        whatsapp: ""
    }
];

// Location Mapping (unchanged)
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

// Search Keywords (unchanged)
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

// Distance Calculation (unchanged)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Natural Query Parsing (unchanged)
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

    for (const [profession, keywords] of Object.entries(searchKeywords.professions)) {
        if (keywords.some(keyword => queryLower.includes(keyword))) {
            criteria.profession = profession;
            break;
        }
    }

    for (const [location, data] of Object.entries(locationMap)) {
        if (data.aliases.some(alias => queryLower.includes(alias))) {
            criteria.location = data.standard;
            break;
        }
    }

    for (const [specialization, keywords] of Object.entries(searchKeywords.specializations)) {
        if (keywords.some(keyword => queryLower.includes(keyword))) {
            criteria.specialization = specialization;
            break;
        }
    }

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
            if (match[0].includes('k')) {
                amount *= 1000;
            }
            criteria.maxFee = amount;
            break;
        }
    }

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

// Search Professionals (unchanged)
function searchProfessionals(query) {
    if (!query || query.trim() === '') return professionals;
    
    const criteria = parseNaturalQuery(query);
    const queryLower = query.toLowerCase().trim();
    
    let results = professionals.filter(pro => {
        if (criteria.profession && pro.profession.toLowerCase() !== criteria.profession) {
            return false;
        }
        
        if (criteria.location && pro.location !== criteria.location) {
            return false;
        }
        
        if (criteria.maxFee && pro.fee > criteria.maxFee) {
            return false;
        }
        
        if (criteria.minExperience && pro.experience < criteria.minExperience) {
            return false;
        }
        
        if (criteria.minRating && pro.rating < criteria.minRating) {
            return false;
        }
        
        if (criteria.specialization && pro.specialization.toLowerCase() !== criteria.specialization) {
            return false;
        }
        
        return true;
    });
    
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
    
    if (criteria.location) {
        const targetLocation = Object.values(locationMap).find(loc => loc.standard === criteria.location);
        if (targetLocation) {
            results.sort((a, b) => {
                if (a.location === criteria.location && b.location !== criteria.location) return -1;
                if (b.location === criteria.location && a.location !== criteria.location) return 1;
                
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

// Filter Professionals (unchanged)
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

// Display Professionals (updated for booking modal)
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
        proCard.dataset.proId = pro.id;
        
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
                    <button class="book-btn" onclick="openBookingModal(${pro.id})">
                        <i class="fas fa-calendar-alt"></i> Book Appointment
                    </button>
                </div>
            </div>
        `;
        
        prosGrid.appendChild(proCard);
    });
}

// Toggle Filters (unchanged)
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

// Perform Search (unchanged)
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    const searchedPros = searchProfessionals(query);
    const filteredPros = filterProfessionals(searchedPros);
    
    document.querySelectorAll('.container > section').forEach(section => {
        section.style.display = 'none';
    });
    
    const resultsContainer = document.getElementById('searchResultsContainer');
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
        
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
    
    displayProfessionals(filteredPros);
    
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

// Reset Filters (unchanged)
function resetFilters() {
    const filters = ['professionFilter', 'locationFilter', 'experienceFilter', 'priceFilter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.value = '';
        }
    });
}

// Booking Modal Functions
let currentProId = null;

function openBookingModal(proId) {
    const pro = professionals.find(p => p.id === proId);
    if (!pro) return;
    
    currentProId = proId;
    
    // Populate professional info
    document.getElementById('modalProImage').src = pro.image;
    document.getElementById('modalProImage').alt = pro.name;
    document.getElementById('modalProName').textContent = pro.name;
    document.getElementById('modalProSpecialization').textContent = `${pro.profession} - ${pro.specialization}`;
    document.getElementById('modalProLocation').querySelector('span').textContent = pro.location;
    document.getElementById('modalProPricing').querySelector('span').textContent = pro.pricing || `₹${pro.fee.toLocaleString()}`;
    document.getElementById('modalProHours').querySelector('span').textContent = pro.workingHours || '10:00 AM - 6:00 PM';
    document.getElementById('modalProDescription').textContent = pro.description;
    
    // Generate time slots
    generateTimeSlots(pro.workingHours || '10:00 AM - 6:00 PM');
    
    // Reset form
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userWhatsApp').value = pro.whatsapp;
    document.getElementById('bookingSuccess').style.display = 'none';
    document.getElementById('bookingSuccess').textContent = '';
    
    // Show modal
    document.getElementById('bookingModal').classList.add('show');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('show');
    currentProId = null;
}

function generateTimeSlots(workingHours) {
    // Parse working hours
    const [startTime, endTime] = workingHours.split('-').map(t => t.trim());
    const startHour = parseInt(startTime.split(':')[0]) + (startTime.includes('PM') && startTime.split(':')[0] !== '12' ? 12 : 0);
    const endHour = parseInt(endTime.split(':')[0]) + (endTime.includes('PM') && endTime.split(':')[0] !== '12' ? 12 : 0);
    
    // Generate slots every 30 minutes
    const timeSlots = [];
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const displayHour = hour > 12 ? hour - 12 : hour;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayMinute = minute === 0 ? '00' : '30';
            timeSlots.push(`${displayHour}:${displayMinute} ${ampm}`);
        }
    }
    
    // Populate time slot selects
    for (let i = 1; i <= 4; i++) {
        const select = document.getElementById(`timeSlot${i}`);
        select.innerHTML = i === 4 
            ? '<option value="">Select Time 4 (Optional)</option>'
            : `<option value="">Select Time ${i} (Required)</option>`;
        
        timeSlots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            select.appendChild(option);
        });
    }
}

async function submitBooking() {
    if (!currentProId) return;
    
    const pro = professionals.find(p => p.id === currentProId);
    if (!pro) return;
    
    // Validate form
    const time1 = document.getElementById('timeSlot1').value;
    const time2 = document.getElementById('timeSlot2').value;
    const time3 = document.getElementById('timeSlot3').value;
    const time4 = document.getElementById('timeSlot4').value;
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const whatsapp = document.getElementById('userWhatsApp').value.trim();
    
    if (!time1 || !time2 || !time3 || !name || !email || !whatsapp) {
        alert('Please fill all required fields');
        return;
    }
    
    // Format message
    const message = `📅 New Appointment Request:\n\n` +
                    `👨‍💼 Professional: ${pro.name}\n` +
                    `📌 Specialization: ${pro.specialization}\n` +
                    `📍 Location: ${pro.location}\n` +
                    `💰 Fee: ${pro.pricing || `₹${pro.fee.toLocaleString()}`}\n\n` +
                    `⏰ Preferred Times:\n1. ${time1}\n2. ${time2}\n3. ${time3}` +
                    (time4 ? `\n4. ${time4}` : '') + `\n\n` +
                    `👤 Client Details:\nName: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp}`;
    
    try {
        const botToken = '8099887805:AAF6Q3IUJyhR3Vo5gBp8Wc8ywGaOj_JjnIU';
        const chatId = '8374420796'; // Replace with your chat ID
        
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`);
        
        if (response.ok) {
            const successEl = document.getElementById('bookingSuccess');
            successEl.textContent = '✅ Your appointment request has been sent. We will contact you shortly.';
            successEl.style.display = 'block';
            
            // Clear form
            document.getElementById('timeSlot1').value = '';
            document.getElementById('timeSlot2').value = '';
            document.getElementById('timeSlot3').value = '';
            document.getElementById('timeSlot4').value = '';
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        alert('Failed to send booking request. Please try again later.');
    }
}

// Initialize (updated)
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
        
        searchInput.placeholder = 'e.g., "lawyers in Mumbai under 20k with 5+ years experience"';
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
    
    // Modal event listeners
    document.querySelector('.close-btn').addEventListener('click', closeBookingModal);
    document.getElementById('bookingModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('bookingModal')) {
            closeBookingModal();
        }
    });
    
    // Submit booking form
    document.getElementById('submitBookingBtn').addEventListener('click', submitBooking);
});

// Export functions
window.searchProfessionals = searchProfessionals;
window.filterProfessionals = filterProfessionals;
window.performSearch = performSearch;
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.submitBooking = submitBooking;
