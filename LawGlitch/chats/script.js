// Previous Chats Page - Improved with persistent rooms
// CONFIG
const SEARCH_PAGE = "../search/index.html";
const CHAT_PAGE = "../chatroom/index.html";
const DB_NAME = "lawglitch_chats";
const STORE_NAME = "previous_chats";

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeDB().then(() => {
        renderChatList();
        setupStorageEventListener();
        checkForBookingData();
    });
    
    // Add event listener for the search button
    document.getElementById('search-button').addEventListener('click', function() {
        window.location.href = SEARCH_PAGE;
    });
});

// Check for booking data in localStorage
function checkForBookingData() {
    const bookingData = localStorage.getItem('lawglitch_booking_data');
    if (bookingData) {
        try {
            const proData = JSON.parse(bookingData);
            saveChat(proData).then(() => {
                renderChatList();
                // Remove the booking data
                localStorage.removeItem('lawglitch_booking_data');
            });
        } catch (e) {
            console.error("Error parsing booking data:", e);
            localStorage.removeItem('lawglitch_booking_data');
        }
    }
}

// Initialize IndexedDB
function initializeDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 2);
        
        request.onerror = function(event) {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            resolve(event.target.result);
        };
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            const oldVersion = event.oldVersion;
            
            if (oldVersion < 1) {
                // Initial version
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                    store.createIndex("proId", "proId", { unique: false });
                    store.createIndex("updated", "updated", { unique: false });
                }
            }
            
            if (oldVersion < 2) {
                // Add lastAccessed index for sorting
                const transaction = event.target.transaction;
                const store = transaction.objectStore(STORE_NAME);
                if (!store.indexNames.contains('lastAccessed')) {
                    store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
                }
            }
        };
    });
}

// Get all chats from IndexedDB, sorted by last accessed
function getChats() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('lastAccessed');
            const getAllRequest = index.getAll();
            
            getAllRequest.onsuccess = function() {
                // Sort by last accessed (newest first)
                const chats = getAllRequest.result.sort((a, b) => b.lastAccessed - a.lastAccessed);
                resolve(chats);
            };
            
            getAllRequest.onerror = function(event) {
                reject(event.target.error);
            };
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Save or update a chat in IndexedDB
function saveChat(proData) {
    return new Promise((resolve, reject) => {
        // Add timestamps
        proData.updated = new Date().getTime();
        proData.lastAccessed = new Date().getTime();
        
        const request = indexedDB.open(DB_NAME);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            
            const putRequest = store.put(proData);
            
            putRequest.onsuccess = function() {
                resolve(putRequest.result);
                
                // Notify other tabs about the update
                if (typeof BroadcastChannel !== 'undefined') {
                    const channel = new BroadcastChannel('lawglitch_chats');
                    channel.postMessage({ type: 'chat_updated' });
                }
                
                localStorage.setItem('lawglitch_chats_updated', Date.now().toString());
            };
            
            putRequest.onerror = function(event) {
                reject(event.target.error);
            };
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Render the chat list from IndexedDB data
async function renderChatList() {
    try {
        const chats = await getChats();
        const chatList = document.getElementById('chat-list');
        const emptyState = document.getElementById('empty-state');
        
        // Show empty state if no chats
        if (chats.length === 0) {
            chatList.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        // Show chat list
        chatList.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        // Clear existing content
        chatList.innerHTML = '';
        
        // Create chat items
        chats.forEach(chat => {
            const chatItem = createChatItem(chat);
            chatList.appendChild(chatItem);
        });
    } catch (error) {
        console.error("Error rendering chat list:", error);
    }
}

// Create a chat item element
function createChatItem(chatData) {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    
    // Create rating stars
    const ratingStars = createRatingStars(chatData.rating);
    
    chatItem.innerHTML = `
        <img src="${chatData.image}" alt="${chatData.name}" class="chat-image" onerror="this.src='https://via.placeholder.com/60?text=Profile'">
        <div class="chat-details">
            <div class="chat-name">${chatData.name}</div>
            <div class="chat-profession">${chatData.profession} • ${chatData.specialization}</div>
            <div class="chat-rating">${ratingStars} ${chatData.rating}</div>
            <div class="chat-description">${chatData.description}</div>
        </div>
        <div class="chat-action">
            <div class="chat-fee">₹${chatData.fee}/min</div>
            <button class="btn-open" data-room-id="${chatData.id}" data-pro-id="${chatData.proId}" data-client-name="${chatData.clientName}">Continue Chat</button>
        </div>
    `;
    
    // Add event listener to the Open button
    const openButton = chatItem.querySelector('.btn-open');
    openButton.addEventListener('click', function() {
        const roomId = this.getAttribute('data-room-id');
        const proId = this.getAttribute('data-pro-id');
        const clientName = this.getAttribute('data-client-name');
        
        // Open existing chat room with saved roomId
        window.location.href = `${CHAT_PAGE}?room=${roomId}&view=client&proId=${proId}&clientName=${encodeURIComponent(clientName)}`;
    });
    
    return chatItem;
}

// Create rating stars HTML
function createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Set up storage event listener
function setupStorageEventListener() {
    window.addEventListener('storage', function(event) {
        if (event.key === 'lawglitch_chats_updated') {
            renderChatList();
        }
    });
    
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('lawglitch_chats');
        channel.onmessage = function(event) {
            if (event.data.type === 'chat_updated') {
                renderChatList();
            }
        };
    }
}

// Function to be called from booking flow to save a new chat
window.saveNewChat = function(proData) {
    return saveChat(proData);
};

// Enhanced Search and Filter Functionality for LawGlitch Previous Chats
// Paste this code at the end of your existing script.js file

// Global variables for search and filter
let currentFilter = 'all';
let searchQuery = '';
let allChats = [];

// Initialize enhanced functionality
function initializeEnhancedFeatures() {
    setupSearchFunctionality();
    setupFilterTabs();
    setupAdvancedInteractions();
}

// Setup search functionality with debouncing
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        searchQuery = e.target.value.toLowerCase().trim();
        filterAndRenderChats();
    });

    // Clear search on escape key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            searchQuery = '';
            filterAndRenderChats();
            this.blur();
        }
    });
}

// Setup filter tabs functionality
function setupFilterTabs() {
    const filterTabs = document.getElementById('filterTabs');
    if (!filterTabs) return;

    filterTabs.addEventListener('click', function(e) {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;

        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update filter and render
        currentFilter = tab.dataset.filter;
        filterAndRenderChats();
    });
}

// Filter chats based on search and filter criteria
function filterAndRenderChats() {
    const filteredChats = allChats.filter(chat => {
        // Search filter
        const matchesSearch = !searchQuery || 
            chat.name.toLowerCase().includes(searchQuery) ||
            chat.profession.toLowerCase().includes(searchQuery) ||
            chat.specialization.toLowerCase().includes(searchQuery) ||
            chat.description.toLowerCase().includes(searchQuery);

        // Category filter
        const matchesFilter = currentFilter === 'all' || 
            chat.profession === currentFilter;

        return matchesSearch && matchesFilter;
    });

    renderFilteredChats(filteredChats);
}

// Render filtered chats
function renderFilteredChats(chats) {
    const chatList = document.getElementById('chat-list');
    const emptyState = document.getElementById('empty-state');

    if (chats.length === 0) {
        chatList.innerHTML = '';
        showEmptyState();
        return;
    }

    hideEmptyState();
    chatList.innerHTML = '';
    
    // Create chat items
    chats.forEach(chat => {
        const chatItem = createEnhancedChatItem(chat);
        chatList.appendChild(chatItem);
    });

    // Add event listeners to Open buttons
    document.querySelectorAll('.btn-open').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const proId = this.getAttribute('data-pro-id');
            const proName = this.getAttribute('data-pro-name');
            const timestamp = new Date().getTime();
            
            // Generate the correct room ID format: lawglitch-abc-2-1757193505057
            const roomId = `lawglitch-${proName.toLowerCase().replace(/\s+/g, '-')}-${proId}-${timestamp}`;
            
            // Open with the correct parameter format
            window.location.href = `${CHAT_PAGE}?room=${roomId}&clientName=You&proId=${proId}`;
        });
    });
}

// Create enhanced chat item HTML
// Create enhanced chat item HTML
function createEnhancedChatItem(chatData) {
    const ratingStars = createRatingStars(chatData.rating);

    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.innerHTML = `
        <div class="chat-image-container">
            <img src="${chatData.image}" alt="${chatData.name}" class="chat-image" onerror="this.src='https://via.placeholder.com/60?text=Profile'">
        </div>
        <div class="chat-details">
            <div class="chat-header">
                <div class="chat-name">${chatData.name}</div>
                <div class="chat-time">${getTimeAgo(chatData.updated)}</div>
            </div>
            <div class="chat-profession">
                <i class="fas fa-${getProfessionIcon(chatData.profession)}"></i>
                ${chatData.profession}
                <span class="specialization-tag">${chatData.specialization}</span>
            </div>
            <div class="chat-meta">
                <div class="chat-rating">
                    <span class="stars">${ratingStars}</span>
                    <span>${chatData.rating}</span>
                </div>
            </div>
            <div class="chat-preview">${chatData.description}</div>
        </div>
        <div class="chat-action">
            <div class="chat-fee">
                <span class="fee-label">Consultation</span>
                ₹${chatData.fee}/min
            </div>
            <button class="btn-open" data-room-id="${chatData.id}" data-pro-id="${chatData.proId}" data-client-name="${chatData.clientName}">
                <i class="fas fa-comment-dots"></i>
                Open Chat
            </button>
        </div>
    `;
    
    // Add click handler for the Open button
    const openButton = chatItem.querySelector('.btn-open');
    openButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const roomId = this.getAttribute('data-room-id');
        const proId = this.getAttribute('data-pro-id');
        const clientName = this.getAttribute('data-client-name');
        
        // Open existing chat room with saved roomId
        window.location.href = `${CHAT_PAGE}?room=${roomId}&view=client&proId=${proId}&clientName=${encodeURIComponent(clientName)}`;
    });
    
    // Add click handler for the entire chat item
    chatItem.addEventListener('click', function(e) {
        if (!e.target.closest('.btn-open')) {
            const roomId = chatData.id;
            const proId = chatData.proId;
            const clientName = chatData.clientName;
            
            window.location.href = `${CHAT_PAGE}?room=${roomId}&view=client&proId=${proId}&clientName=${encodeURIComponent(clientName)}`;
        }
    });
    
    return chatItem;
}

// Get profession icon
function getProfessionIcon(profession) {
    const icons = {
        'Lawyer': 'balance-scale',
        'Chartered Accountant': 'calculator',
        'Financial Advisor': 'chart-line'
    };
    return icons[profession] || 'user-tie';
}

// Get time ago from timestamp
function getTimeAgo(timestamp) {
    const now = new Date().getTime();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleDateString();
}

// Show/hide empty state
function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.classList.remove('hidden');
        
        // Update empty state message based on filter/search
        const title = emptyState.querySelector('h2');
        const message = emptyState.querySelector('p');
        
        if (searchQuery) {
            title.textContent = 'No Results Found';
            message.textContent = `No professionals found matching "${searchQuery}". Try different keywords or clear the search.`;
        } else if (currentFilter !== 'all') {
            title.textContent = 'No Chats in This Category';
            message.textContent = `No previous chats found for ${currentFilter}. Try selecting a different category.`;
        }
    }
}

function hideEmptyState() {
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.classList.add('hidden');
}

// Advanced interactions
function setupAdvancedInteractions() {
    // Setup find professionals button
    const findBtn = document.getElementById('find-professionals');
    if (findBtn) {
        findBtn.addEventListener('click', function() {
            window.location.href = SEARCH_PAGE;
        });
    }
}

// Modify the saveChat function to handle duplicates
const originalSaveChat = saveChat;
saveChat = async function(proData) {
    // Check if this professional already exists
    const existingChats = await getChats();
    const existingChat = existingChats.find(chat => chat.proId === proData.proId);
    
    if (existingChat) {
        // Update the existing chat with new data and timestamp
        proData.id = existingChat.id; // Keep the same ID
        proData.updated = new Date().getTime(); // Update timestamp
    }
    
    // Call the original saveChat function
    return originalSaveChat.call(this, proData);
};

// Modify the renderChatList function to work with filters
const originalRenderChatList = renderChatList;
renderChatList = async function() {
    try {
        allChats = await getChats();
        const chatList = document.getElementById('chat-list');
        const emptyState = document.getElementById('empty-state');
        
        // Show empty state if no chats
        if (allChats.length === 0) {
            chatList.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        // Show chat list
        chatList.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        // Initialize enhanced features
        initializeEnhancedFeatures();
        
        // Render filtered chats
        filterAndRenderChats();
        
    } catch (error) {
        console.error("Error rendering chat list:", error);
    }
};

// Initialize enhanced features when page loads
document.addEventListener('DOMContentLoaded', function() {
    // This will be called after the original DOMContentLoaded handler
    setTimeout(initializeEnhancedFeatures, 100);
});