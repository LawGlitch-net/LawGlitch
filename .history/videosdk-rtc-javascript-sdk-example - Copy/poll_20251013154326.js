// Constants for polling configuration
const SUPABASE_URL = 'https://pxwbumtpnzbbqzqhnsow.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2J1bXRwbnpiYnF6cWhuc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjM4NTcsImV4cCI6MjA3MzgzOTg1N30.CfDyCEQCCoc4p1KrE_G43ToVGExuVvGAGWk3hMQxf3s';
const BASE_INTERVAL = 5000;


// State variables
let roomLinkPollingInterval;
let retryCount = 0;
let lastSuccessfulPoll = 0;

// Get or create Supabase client
function getSupabaseClient() {
    try {
        return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (err) {
        console.error('Error initializing Supabase client:', err);
        return null;
    }
}

// Room link polling function
async function startRoomLinkPolling() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('room_id');
    const clientName = urlParams.get('client_name');
    const autoJoin = urlParams.get('auto_join');
    
    if (!bookingId) {
        console.warn('No room_id found in URL parameters');
        return;
    }

    // Set client name if provided
    if (clientName) {
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.value = clientName;
        }
    }

    // Auto join if specified and we have a room link
    if (autoJoin === 'true') {
        const joinButton = document.getElementById('joinMeetingBtn');
        if (joinButton) {
            joinButton.click();
        }
    }

    // Clear any existing interval
    if (roomLinkPollingInterval) {
        clearInterval(roomLinkPollingInterval);
    }

    // Initialize Supabase client
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
        console.error('Failed to initialize Supabase client');
        return;
    }

    // Start polling
    const pollForUpdates = async () => {
        try {
            // Query Supabase for room data
            const { data, error } = await supabaseClient
                .from('bookings')
                .select('id, room_link, meeting_status, scheduled_for')
                .eq('id', bookingId)
                .single();

            if (error) {
                throw error;
            }

            // Reset retry count on successful poll
            if (data) {
                retryCount = 0;
                lastSuccessfulPoll = Date.now();

                // Update meeting ID if room link exists
                if (data.room_link) {
                    const input = document.getElementById('joinMeetingId');
                    if (input && input.value !== data.room_link) {
                        input.value = data.room_link;
                        input.dispatchEvent(new Event('input'));
                    }
                }
                
                // Update status messages
                const statusDiv = document.getElementById('meeting-status');
                if (statusDiv) {
                    statusDiv.style.padding = '10px';
                    statusDiv.style.borderRadius = '5px';
                    statusDiv.style.marginTop = '10px';
                    statusDiv.style.fontWeight = 'bold';
                    
                    if (data.scheduled_for) {
                        const date = new Date(data.scheduled_for);
                        statusDiv.textContent = `📅 Scheduled for ${date.toLocaleString()}`;
                        statusDiv.style.backgroundColor = '#2c2c2c';
                        statusDiv.style.color = '#ffd700';
                    } else if (data.meeting_status === 'pending') {
                        statusDiv.textContent = '⌛ Waiting for host to join...';
                        statusDiv.style.backgroundColor = '#2c2c2c';
                        statusDiv.style.color = '#ffffff';
                    } else if (data.meeting_status === 'ready') {
                        statusDiv.textContent = '✅ Host has joined! Click Join Meeting';
                        statusDiv.style.backgroundColor = '#004400';
                        statusDiv.style.color = '#44ff44';
                    } else {
                        statusDiv.textContent = '🔄 Connecting to meeting...';
                        statusDiv.style.backgroundColor = '#2c2c2c';
                        statusDiv.style.color = '#ffffff';
                    }
                }
            }
        } catch (err) {
            retryCount++;
            console.warn(`Polling error (retry ${retryCount}/${MAX_RETRY_COUNT}):`, err);

            // Update status message to show reconnecting
            const statusDiv = document.getElementById('meeting-status');
            if (statusDiv) {
                statusDiv.textContent = '🔄 Reconnecting to meeting server...';
                statusDiv.style.backgroundColor = '#3d0000';
                statusDiv.style.color = '#ff4444';
            }
            
            if (retryCount >= MAX_RETRY_COUNT) {
                console.warn('Max retries reached, resetting retry count');
                retryCount = 0;
            }
        }
    };

    // Initial poll
    await pollForUpdates();
    
    // Set up polling interval
    roomLinkPollingInterval = setInterval(pollForUpdates, BASE_INTERVAL);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Start polling for room link
        startRoomLinkPolling();
        
        // Clear any existing meeting code
        const joinMeetingCode = document.getElementById('joinMeetingId');
        if (joinMeetingCode) {
            joinMeetingCode.value = "";
        }
    } catch (e) {
        console.warn('Error during initialization:', e);
    }
});
