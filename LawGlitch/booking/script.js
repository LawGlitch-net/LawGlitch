// Booking model - Improved
document.addEventListener('DOMContentLoaded', function() {
    // Get professional ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const proId = urlParams.get('proId');
    
    if (!proId) {
        alert('No professional specified. Please select a professional to book a session.');
        return;
    }
    
    // Find the professional by ID
    const professional = professionalsData.find(pro => pro.id == proId);
    
    if (!professional) {
        alert('Professional not found. Please check the URL and try again.');
        return;
    }
    
    // Display professional details
    displayProfessionalDetails(professional);
    
    // Setup form submission
    const bookingForm = document.getElementById('booking-form');
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission(professional);
    });
});

function displayProfessionalDetails(professional) {
    const proDetailsContainer = document.getElementById('professional-details');
    
    // Format fee to show per minute
    const feePerMin = typeof professional.fee === 'number' ? professional.fee : parseInt(professional.fee);
    
    proDetailsContainer.innerHTML = `
        <div class="pro-header">
            <img src="${professional.image}" alt="${professional.name}" class="pro-image">
            <div class="pro-info">
                <h2>
                    ${professional.name}
                    ${professional.verified === "yes" ? '<span class="verified-badge">✓ Verified</span>' : ''}
                </h2>
                <p>${professional.profession} ${professional.specialization ? `- ${professional.specialization}` : ''}</p>
                <p>${professional.experience} years of experience</p>
                <div class="rating">${getStarRating(professional.rating)} ${professional.rating}</div>
                <p class="fee-per-min">${feePerMin}</p>
                <p>${professional.location}</p>
            </div>
        </div>
        <div class="description">
            <p>${professional.description}</p>
        </div>
        <div class="instructions">
            <h3><i class="fas fa-info-circle"></i> Booking Instructions</h3>
            <ul>
                <li><i class="fas fa-check-circle"></i> Select your preferred consultation duration</li>
                <li><i class="fas fa-check-circle"></i> Provide your WhatsApp number for confirmation</li>
                <li><i class="fas fa-check-circle"></i> Choose a date if you have a preference</li>
                <li><i class="fas fa-check-circle"></i> Same-day consultation available at no extra cost</li>
                <li><i class="fas fa-check-circle"></i> You'll be redirected to the chat room after booking</li>
            </ul>
        </div>
    `;
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    if (halfStar) {
        stars += '⯨';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

function handleFormSubmission(professional) {
    const formData = new FormData(document.getElementById('booking-form'));
    const clientName = formData.get('fullName');
    const clientEmail = formData.get('email');
    const clientPhone = formData.get('phone');
    const duration = formData.get('duration');
    const preferredDate = formData.get('preferredDate');
    
    // Generate simple room ID: emailUsername-proId
    const emailUsername = clientEmail.split('@')[0]; // Get part before @
    const sanitizeEmail = (email) => email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const roomId = `${sanitizeEmail(emailUsername)}-${professional.id}`;
    
    const proData = {
        id: roomId,
        proId: professional.id,
        name: professional.name,
        profession: professional.profession,
        specialization: professional.specialization || '',
        rating: parseFloat(professional.rating),
        fee: typeof professional.fee === 'number' ? professional.fee : parseInt(professional.fee),
        description: professional.description,
        image: professional.image,
        duration: duration,
        preferredDate: preferredDate || 'ASAP',
        clientName: clientName,
        clientEmail: clientEmail,
        clientPhone: clientPhone,
        lastUpdated: new Date().getTime()
    };

    // Save to localStorage for the Previous Chats page to pick up
    localStorage.setItem('lawglitch_booking_data', JSON.stringify(proData));

    // Send Telegram notification
    sendTelegramNotification(professional, clientName, clientEmail, clientPhone, duration, preferredDate, roomId);
    
    // Redirect to chat room - CLIENT VIEW
    setTimeout(() => {
        window.location.href = `../chatroom/index.html?room=${roomId}&view=client&proId=${professional.id}&clientName=${encodeURIComponent(clientName)}`;
    }, 100);
}

function sendTelegramNotification(professional, clientName, clientEmail, clientPhone, duration, preferredDate, roomId) {
    const BOT_TOKEN = ''; // To be filled by the user
    const CHAT_ID = '';   // To be filled by the user
    
    if (!BOT_TOKEN || !CHAT_ID) {
        console.log('Telegram bot token or chat ID not configured');
        return;
    }
    
    const message = `
New Booking Request:
Professional: ${professional.name}
Profession: ${professional.profession}
Client Name: ${clientName}
Client Email: ${clientEmail}
WhatsApp: ${clientPhone}
Duration: ${duration} minutes
Preferred Date: ${preferredDate || 'ASAP'}
Room ID: ${roomId}
Timestamp: ${new Date().toLocaleString()}
    `;
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.ok) {
                console.error('Error sending Telegram notification:', data);
            }
        })
        .catch(error => {
            console.error('Error sending Telegram notification:', error);
        });
}