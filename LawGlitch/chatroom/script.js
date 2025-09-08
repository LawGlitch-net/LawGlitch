// LawGlitch Chatroom Functionality - Simplified and Improved
document.addEventListener('DOMContentLoaded', function() {
    // CONFIG
    const BOOKING_PAGE = "../booking/index.html";
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    const proId = urlParams.get('proId');
    const clientName = urlParams.get('clientName');
    const viewType = urlParams.get('view');
    
    // State variables
    let isClientView = false;
    let professional = null;
    let timerInterval = null;
    let seconds = 0;
    let db = null;
    
    // Initialize the chatroom
    initChatroom();
    
    async function initChatroom() {
        // Check if required parameters exist
        if (!roomId) {
            alert('Room ID is missing from URL');
            return;
        }
        
        // Determine if this is client or professional view
        isClientView = viewType === 'client';
        
        if (isClientView) {
            // Client view - get professional details
            if (proId) {
                professional = professionalsData.find(pro => pro.id == proId);
                if (!professional) {
                    alert('Professional not found');
                    return;
                }
                renderProfessionalHeader();
            } else {
                alert('Professional ID missing for client view');
                return;
            }
        } else {
            // Professional view - show client info
            renderClientHeader();
        }
        
        // Initialize database
        await initDatabase();
        
        // Load existing messages
        await loadMessages();
        
        // Start timer (default 00:00)
        startTimer();
        
        // Set up event listeners
        setupEventListeners();
        
     
    
    function renderProfessionalHeader() {
        const headerContent = document.getElementById('header-content');
        const icon = getProfessionIcon(professional.profession);
        
        headerContent.innerHTML = `
            <img src="${professional.image}" alt="${professional.name}" class="pro-image">
            <div class="pro-info">
                <div class="pro-name">
                    ${professional.name}
                    ${professional.verified === "yes" ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                </div>
                <div class="pro-specialization">
                    <i class="fas fa-${icon}"></i> ${professional.profession} ${professional.specialization ? `- ${professional.specialization}` : ''}
                </div>
                <div class="rating">
                    ${getStarRating(professional.rating)} ${professional.rating}
                </div>
            </div>
        `;
    }
    
    function renderClientHeader() {
        const headerContent = document.getElementById('header-content');
        const clientId = roomId.split('-')[0]; // Get client ID from roomId
        
        headerContent.innerHTML = `
            <i class="fas fa-user" style="font-size: 2rem; background: var(--cream); padding: 8px; border-radius: 50%;"></i>
            <div class="pro-info">
                <div class="pro-name">${clientName || 'Client'}</div>
                <div class="pro-specialization">Client</div>
           
            </div>
        `;
    }
 
        
        headerContent.appendChild(shareButton);
    }
    
    function generateProfessionalViewLink() {
        if (!proId || !roomId) return null;
        
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('view');
        currentUrl.searchParams.delete('clientName');
        currentUrl.searchParams.set('view', 'pro');
        
        return currentUrl.toString();
    }
    
    function getProfessionIcon(profession) {
        const icons = {
            'Lawyer': 'balance-scale',
            'Chartered Accountant': 'calculator',
            'Financial Advisor': 'chart-line'
        };
        return icons[profession] || 'user-tie';
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
    
    async function initDatabase() {
        // Open IndexedDB database
        try {
            db = await idb.openDB('lawglitch_chatroom', 2, {
                upgrade(db, oldVersion) {
                    if (oldVersion < 1) {
                        // Initial version
                        if (!db.objectStoreNames.contains('messages')) {
                            db.createObjectStore('messages', { 
                                keyPath: 'id',
                                autoIncrement: true 
                            });
                        }
                        if (!db.objectStoreNames.contains('rooms')) {
                            db.createObjectStore('rooms', { keyPath: 'roomId' });
                        }
                    }
                    if (oldVersion < 2) {
                        // Add index for roomId in messages store
                        const transaction = db.transaction(['messages'], 'readwrite');
                        const store = transaction.objectStore('messages');
                        if (!store.indexNames.contains('roomId')) {
                            store.createIndex('roomId', 'roomId', { unique: false });
                        }
                    }
                }
            });
            
            // Store room info if it doesn't exist
            try {
                const existingRoom = await db.get('rooms', roomId);
                // Update last accessed time
                existingRoom.lastAccessed = new Date().getTime();
                await db.put('rooms', existingRoom);
            } catch (error) {
                // Room doesn't exist, create it
                await db.add('rooms', {
                    roomId: roomId,
                    proId: professional ? professional.id : proId,
                    clientName: clientName,
                    createdAt: new Date().getTime(),
                    lastAccessed: new Date().getTime()
                });
            }
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }
    
    async function loadMessages() {
        if (!db) return;
        
        try {
            // Get messages for this room using index
            const transaction = db.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const index = store.index('roomId');
            const roomMessages = await index.getAll(roomId);
            
            const chatArea = document.getElementById('chat-area');
            const lockedState = document.getElementById('locked-state');
            
            if (roomMessages.length > 0) {
                // If messages exist, hide the locked state
                lockedState.style.display = 'none';
                
                // Enable input and send button
                document.getElementById('message-input').disabled = false;
                document.getElementById('send-btn').disabled = false;
                
                // Render messages
                roomMessages.forEach(msg => {
                    renderMessage(msg);
                });
                
                // Scroll to bottom
                chatArea.scrollTop = chatArea.scrollHeight;
            } else {
                // Show locked state if no messages
                lockedState.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }
    
    function renderMessage(message) {
        const chatArea = document.getElementById('chat-area');
        const messageEl = document.createElement('div');
        messageEl.classList.add('message');
        messageEl.classList.add(message.sender);
        
        const time = new Date(message.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageEl.innerHTML = `
            <div class="message-text">${message.text}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatArea.appendChild(messageEl);
    }
    
    function startTimer() {
        // Start with 00:00
        document.getElementById('timer').textContent = '00:00';
        document.getElementById('session-timer').textContent = '00:00';
        
        // Update timer every second
        timerInterval = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            const timerDisplay = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            document.getElementById('timer').textContent = timerDisplay;
            document.getElementById('session-timer').textContent = timerDisplay;
        }, 1000);
    }
    
    function setupEventListeners() {
        // Unlock button click
        document.getElementById('unlock-btn').addEventListener('click', () => {
            document.getElementById('popup-overlay').style.display = 'flex';
        });
        
        // Book Now button click
        document.getElementById('book-now-btn').addEventListener('click', () => {
            const proIdToUse = professional ? professional.id : proId;
            if (proIdToUse) {
                window.location.href = `${BOOKING_PAGE}?proId=${proIdToUse}`;
            } else {
                alert('Professional ID not available for booking');
            }
        });
        
        // Close popup button
        document.getElementById('close-popup').addEventListener('click', () => {
            document.getElementById('popup-overlay').style.display = 'none';
        });
        
        // Send button click
        document.getElementById('send-btn').addEventListener('click', sendMessage);
        
        // Send message on Enter key
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    async function sendMessage() {
        const input = document.getElementById('message-input');
        const messageText = input.value.trim();
        
        if (!messageText) return;
        
        // Create message object
        const message = {
            roomId: roomId,
            sender: isClientView ? 'client' : 'pro',
            text: messageText,
            ts: new Date().getTime()
        };
        
        // Save to IndexedDB
        try {
            await db.add('messages', message);
            
            // Render message
            renderMessage(message);
            
            // Clear input
            input.value = '';
            
            // Hide locked state if it's the first message
            document.getElementById('locked-state').style.display = 'none';
            
            // Enable input if it was disabled
            input.disabled = false;
            document.getElementById('send-btn').disabled = false;
            
            // Scroll to bottom
            const chatArea = document.getElementById('chat-area');
            chatArea.scrollTop = chatArea.scrollHeight;
            
            // Update room last accessed time
            try {
                const room = await db.get('rooms', roomId);
                room.lastAccessed = new Date().getTime();
                await db.put('rooms', room);
            } catch (error) {
                console.error('Error updating room access time:', error);
            }
        } catch (error) {
            console.error('Error saving message:', error);
        }
    }
});
// ===== ENHANCED FUNCTIONALITY - ADD TO EXISTING CODE =====

// WebRTC configuration
const rtcConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Global variables for enhanced functionality
let peerConnection = null;
let dataChannel = null;
let lockRef = null;
let signalingRef = null;
let serverTimeOffset = 0;
let countdownInterval = null;

// Banned words and patterns
const bannedPatterns = [
    // Email pattern
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // Phone pattern (basic)
    /\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g
];

const bannedWords = [
    'password', 'creditcard', 'ssn', 'socialsecurity', 
    'bankaccount', 'credentials', 'login'
];

// Initialize enhanced functionality after DOM is loaded
async function initEnhancedFeatures() {
    if (!roomId) return;
    
    try {
        // Get server time offset
        await getServerTimeOffset();
        
        // Set up Firebase lock listener
        setupLockListener();
        
        // Initialize WebRTC if enabled
        if (isWebRTCEnabled()) {
            initWebRTC();
        }
    } catch (error) {
        console.error('Error initializing enhanced features:', error);
    }
}

// Get server time offset from Firebase
async function getServerTimeOffset() {
    try {
        // Import Firebase dynamically to avoid breaking existing code
        const { db } = await import('./firebase-init.js');
        const serverTime = await db.ref('/.info/serverTimeOffset').once('value');
        serverTimeOffset = serverTime.val();
    } catch (error) {
        console.error('Error getting server time offset:', error);
        serverTimeOffset = 0; // Fallback to local time
    }
}

// Set up Firebase lock listener
function setupLockListener() {
    try {
        // Import Firebase dynamically
        import('./firebase-init.js').then(({ db }) => {
            lockRef = db.ref(`/rooms/${roomId}/lock`);
            
            lockRef.on('value', (snapshot) => {
                const lockData = snapshot.val();
                if (lockData) {
                    handleLockStatusChange(lockData.status, lockData.expiresAt);
                }
            });
        }).catch(error => {
            console.error('Firebase not available:', error);
        });
    } catch (error) {
        console.error('Error setting up lock listener:', error);
    }
}

// Handle lock status changes
function handleLockStatusChange(status, expiresAt) {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const lockedOverlay = document.getElementById('locked-overlay') || createLockedOverlay();
    
    if (status === 'closed') {
        // Disable input and show locked overlay
        input.disabled = true;
        sendBtn.disabled = true;
        lockedOverlay.style.display = 'flex';
        
        // Close WebRTC connection
        closeWebRTC();
        
        // Clear countdown timer
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    } else if (status === 'open') {
        // Enable input and hide locked overlay
        input.disabled = false;
        sendBtn.disabled = false;
        lockedOverlay.style.display = 'none';
        
        // Start countdown timer
        startCountdownTimer(expiresAt);
        
        // Initialize WebRTC if not already connected
        if (isWebRTCEnabled() && !peerConnection) {
            initWebRTC();
        }
    }
}

// Create locked overlay if it doesn't exist
function createLockedOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'locked-overlay';
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 100;
        color: white;
        font-size: 1.5rem;
        flex-direction: column;
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-lock" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <p>Chat session has ended</p>
            <button id="reopen-chat-btn" style="margin-top: 1rem; padding: 10px 20px; background: var(--primary); color: white; border: none; border-radius: 5px;">
                Book Another Session
            </button>
        </div>
    `;
    
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.style.position = 'relative';
        chatContainer.appendChild(overlay);
        
        // Add event listener to button
        document.getElementById('reopen-chat-btn').addEventListener('click', () => {
            const proIdToUse = professional ? professional.id : proId;
            if (proIdToUse) {
                window.location.href = `${BOOKING_PAGE}?proId=${proIdToUse}`;
            }
        });
    }
    
    return overlay;
}

// Start countdown timer based on server time
function startCountdownTimer(expiresAt) {
    // Clear any existing countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        const now = Date.now() + serverTimeOffset;
        const timeLeft = expiresAt - now;
        
        if (timeLeft <= 0) {
            // Time's up - lock the chat
            clearInterval(countdownInterval);
            countdownInterval = null;
            
            // Update UI to show locked state
            const input = document.getElementById('message-input');
            const sendBtn = document.getElementById('send-btn');
            const lockedOverlay = document.getElementById('locked-overlay');
            
            if (input) input.disabled = true;
            if (sendBtn) sendBtn.disabled = true;
            if (lockedOverlay) lockedOverlay.style.display = 'flex';
            
            // Close WebRTC connection
            closeWebRTC();
        } else {
            // Update timer display
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            const timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            const timerEl = document.getElementById('timer');
            const sessionTimerEl = document.getElementById('session-timer');
            
            if (timerEl) timerEl.textContent = timerDisplay;
            if (sessionTimerEl) sessionTimerEl.textContent = timerDisplay;
        }
    }, 1000);
}

// Check if WebRTC should be enabled
function isWebRTCEnabled() {
    return typeof RTCPeerConnection !== 'undefined';
}

// Initialize WebRTC connection
function initWebRTC() {
    console.log(`[Init] Starting WebRTC for ${isClientView ? 'Client' : 'Professional'}`);
    try {
        peerConnection = new RTCPeerConnection(rtcConfiguration);

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('[ICE] Found local ICE candidate');
                const candidatePath = isClientView ? 'iceCandidates/client' : 'iceCandidates/pro';
                import('./firebase-init.js').then(({ db, ref, push }) => {
                    if (signalingRef) {
                        const candidateRef = ref(db, `rooms/${roomId}/signaling/${candidatePath}`);
                        push(candidateRef, event.candidate.toJSON());
                    }
                });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            console.warn('[State] WebRTC connection state:', peerConnection.connectionState);
            if (peerConnection.connectionState === 'connected') {
                // Connection successful!
            }
        };

        // Dynamically import Firebase and start signaling
        import('./firebase-init.js').then(({ db, ref }) => {
            signalingRef = ref(db, `rooms/${roomId}/signaling`);
            
            if (isClientView) {
                console.log('[Signaling] Client is creating offer...');
                setupDataChannel(); // Client creates the data channel
                createOffer();
                listenForAnswer(); // <<< CRITICAL FIX: Client must listen for the answer
            } else {
                console.log('[Signaling] Professional is listening for offer...');
                listenForOffer(); // Professional waits for the offer
            }
            listenForIceCandidates(); // Both listen for candidates
        }).catch(error => {
            console.error('Firebase not available for WebRTC:', error);
        });

    } catch (error) {
        console.error('Error initializing WebRTC:', error);
    }
}

// Set up data channel
function setupDataChannel() {
    if (isClientView) {
        // Client creates data channel
        dataChannel = peerConnection.createDataChannel('chat');
        console.log('[DataChannel] Data channel created by client.');
        attachDataChannelListeners();
    } else {
        // Professional listens for data channel
        peerConnection.ondatachannel = (event) => {
            dataChannel = event.channel;
            console.log('[DataChannel] Data channel received by professional.');
            attachDataChannelListeners();
        };
    }
}

// Attach listeners to the data channel once it's created or received
function attachDataChannelListeners() {
    dataChannel.onopen = () => console.warn('[DataChannel] STATE: OPEN - Chat is now P2P');
    dataChannel.onclose = () => console.warn('[DataChannel] STATE: CLOSED');
    dataChannel.onmessage = (event) => {
        console.log('[DataChannel] Message received:', event.data);
        const message = JSON.parse(event.data);
        saveAndRenderMessage(message); // Use your existing function to show the message
    };
}


// Create offer (client only)
async function createOffer() {
    try {
        const { db, ref, set } = await import('./firebase-init.js');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        const offerRef = ref(db, `rooms/${roomId}/signaling/offer`);
        await set(offerRef, { sdp: offer.sdp, type: offer.type });
        console.log('[Offer] Offer sent to Firebase.');
    } catch (error) {
        console.error('Error creating offer:', error);
    }
}

// Listen for offer (professional only)
function listenForOffer() {
    import('./firebase-init.js').then(({ db, ref, onValue, set }) => {
        const offerRef = ref(db, `rooms/${roomId}/signaling/offer`);
        onValue(offerRef, async (snapshot) => {
            if (!snapshot.exists()) return;
            console.log('[Offer] Received offer from Firebase.');
            
            try {
                await peerConnection.setRemoteDescription(snapshot.val());
                
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                const answerRef = ref(db, `rooms/${roomId}/signaling/answer`);
                await set(answerRef, { sdp: answer.sdp, type: answer.type });
                console.log('[Answer] Answer created and sent to Firebase.');
                
                // Set up data channel after getting offer
                setupDataChannel();
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        });
    });
}

// Listen for answer (client only)
function listenForAnswer() {
    import('./firebase-init.js').then(({ db, ref, onValue }) => {
        const answerRef = ref(db, `rooms/${roomId}/signaling/answer`);
        onValue(answerRef, async (snapshot) => {
            if (!snapshot.exists() || peerConnection.currentRemoteDescription) return;
            console.log('[Answer] Received answer from Firebase.');
            try {
                await peerConnection.setRemoteDescription(snapshot.val());
                console.log('[Signaling] Handshake complete!');
            } catch (error) {
                console.error('Error setting remote description from answer:', error);
            }
        });
    });
}

// Listen for ICE candidates from the other peer
function listenForIceCandidates() {
    import('./firebase-init.js').then(({ db, ref, onChildAdded }) => {
        const remoteCandidatePath = isClientView ? 'iceCandidates/pro' : 'iceCandidates/client';
        const candidatesRef = ref(db, `rooms/${roomId}/signaling/${remoteCandidatePath}`);
        
        onChildAdded(candidatesRef, async (snapshot) => {
            if (snapshot.exists()) {
                console.log('[ICE] Received remote ICE candidate.');
                await peerConnection.addIceCandidate(new RTCIceCandidate(snapshot.val()));
            }
        });
    });
}

// Close WebRTC connection
function closeWebRTC() {
    if (dataChannel) dataChannel.close();
    if (peerConnection) peerConnection.close();
    peerConnection = null;
    dataChannel = null;
    console.log('[WebRTC] Connection closed.');
    // You don't need to manually turn off listeners here if they are handled by page unload
}