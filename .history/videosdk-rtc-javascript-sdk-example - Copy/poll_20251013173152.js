// Initialize Supabase client
let supabaseClient;
let monitoringInterval;
let lastMeetingId = null;

// Function to get current meeting ID from various sources
function getCurrentMeetingId() {
    // Try all possible meeting ID elements
    const possibleIds = ['meetingid', 'joinMeetingId', 'meeting-id'];
    for (const id of possibleIds) {
        const element = document.getElementById(id);
        if (element && element.value) {
            return element.value;
        }
    }
    return null;
}

// Function to get booking ID from parent window or URL
function getBookingId() {
    try {
        // Try parent window first
        const parentForm = window.parent.document;
        if (parentForm) {
            const bookingInput = parentForm.getElementById('booking-id');
            if (bookingInput && bookingInput.value) {
                console.log('📝 Found booking ID in parent form:', bookingInput.value);
                return bookingInput.value;
            }
        }
    } catch (e) {
        console.warn('⚠️ Could not access parent window booking ID:', e);
    }

    // Try URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlBookingId = urlParams.get('room_id');
    if (urlBookingId) {
        console.log('📝 Using booking ID from URL:', urlBookingId);
        return urlBookingId;
    }

    console.warn('⚠️ No booking ID found');
    return null;
}

// Function to initialize Supabase client
function initSupabase() {
    console.log('🔄 Initializing Supabase client...');
    if (typeof window.createClient === 'function') {
        supabaseClient = window.createClient(
            'https://pxwbumtpnzbbqzqhnsow.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2J1bXRwbnpiYnF6cWhuc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjM4NTcsImV4cCI6MjA3MzgzOTg1N30.CfDyCEQCCoc4p1KrE_G43ToVGExuVvGAGWk3hMQxf3s'
        );
        console.log('✅ Supabase client initialized via createClient');
        return true;
    } else if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(
            'https://pxwbumtpnzbbqzqhnsow.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2J1bXRwbnpiYnF6cWhuc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjM4NTcsImV4cCI6MjA3MzgzOTg1N30.CfDyCEQCCoc4p1KrE_G43ToVGExuVvGAGWk3hMQxf3s'
        );
        console.log('✅ Supabase client initialized via window.supabase');
        return true;
    }
    console.error('❌ No Supabase client available!');
    return false;
}

// Function to update Supabase with meeting code
async function updateSupabaseWithMeetingCode(meetingId) {
    try {
        console.log('🔄 Attempting to update Supabase with meeting code:', meetingId);
        
        // Try to get booking ID from parent window first
        let bookingId = '';
        try {
            const parentForm = window.parent.document;
            if (parentForm) {
                const bookingInput = parentForm.getElementById('booking-id');
                if (bookingInput) {
                    bookingId = bookingInput.value;
                    console.log('📝 Found booking ID in parent form:', bookingId);
                }
            }
        } catch (e) {
            console.warn('⚠️ Could not access parent window booking ID:', e);
        }

        // Fallback to URL param if parent window access fails
        if (!bookingId) {
            const urlParams = new URLSearchParams(window.location.search);
            bookingId = urlParams.get('room_id');
            if (bookingId) {
                console.log('📝 Using booking ID from URL:', bookingId);
            } else {
                console.warn('⚠️ No booking ID found in URL parameters');
            }
        }

        if (!supabaseClient && !initSupabase()) {
            console.error('❌ Could not initialize Supabase client');
            return;
        }

        if (bookingId && meetingId) {
            console.log('🔄 Updating Supabase booking:', bookingId, 'with room_link:', meetingId);
            const { data: updated, error: updateError } = await supabaseClient
                .from('bookings')
                .update({ room_link: meetingId })
                .eq('id', bookingId)
                .select();

            if (updateError) {
                console.error('❌ Failed to update booking room_link:', updateError);
            } else {
                console.log('✅ Successfully updated room_link in Supabase:', updated);
                
                // Update parent window form if accessible
                try {
                    const parentForm = window.parent.document;
                    if (parentForm) {
                        const bookingInput = parentForm.getElementById('booking-id');
                        const clientNameInput = parentForm.getElementById('client-name');
                        const clientEmailInput = parentForm.getElementById('client-email');
                        
                        if (updated && updated[0]) {
                            console.log('📝 Updating parent form with booking data');
                            if (bookingInput) bookingInput.value = updated[0].id;
                            if (clientNameInput) clientNameInput.value = updated[0].name || '';
                            if (clientEmailInput) clientEmailInput.value = updated[0].email || '';
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Could not update parent window form:', e);
                }
            }
        } else {
            console.warn('⚠️ Missing booking ID or meeting ID for update');
        }
    } catch (e) {
        console.error('❌ Error in updateSupabaseWithMeetingCode:', e);
    }
}

// Handle meeting code copy functionality
async function copyMeetingCode() {
    console.log('📋 Attempting to copy meeting code...');
    const displayedCode = document.getElementById('meetingid');
    
    if (!displayedCode || !displayedCode.value) {
        console.warn('⚠️ No meeting code to copy');
        return;
    }
    
    try {
        // Copy to clipboard
        displayedCode.select();
        document.execCommand("copy");
        console.log('✅ Meeting code copied:', displayedCode.value);

        // Update Supabase with the copied code
        await updateSupabaseWithMeetingCode(displayedCode.value);
    } catch (e) {
        console.error('❌ Error copying meeting code:', e);
    }
}

// Monitor meeting code changes
function startMeetingCodeMonitoring() {
    console.log('🔄 Starting meeting code monitoring...');
    
    // Clear any existing interval
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }

    // Monitor meeting input changes
    document.addEventListener('input', function(event) {
        const meetingId = getCurrentMeetingId();
        if (meetingId) {
            console.log('📝 Meeting input changed:', meetingId);
            updateSupabaseWithMeetingCode(meetingId);
        }
    });

    // Monitor copy button
    const copyButton = document.querySelector('[onclick*="copyMeetingCode"]');
    if (copyButton) {
        console.log('🔍 Found copy button, setting up listener');
        copyButton.addEventListener('click', copyMeetingCode);
    }

    // Setup continuous meeting code watcher
    const meetingInputs = ['joinMeetingId', 'meetingid'].map(id => document.getElementById(id)).filter(Boolean);
    meetingInputs.forEach(input => {
        let lastValue = input.value;
        setInterval(() => {
            try {
                if (input.value !== lastValue) {
                    console.log(`🔄 ${input.id} changed from ${lastValue} to ${input.value}`);
                    if (input.value) {
                        updateSupabaseWithMeetingCode(input.value);
                    }
                    lastValue = input.value;
                }
            } catch (e) {
                console.error('❌ Error in meeting code watcher:', e);
            }
        }, 1000);
    });
}

// Initialize everything when the document is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing meeting management system...');
    
    // Initialize Supabase
    if (!initSupabase()) {
        console.error('❌ Failed to initialize Supabase client');
        return;
    }

    // Setup meeting code monitoring
    startMeetingCodeMonitoring();

    // Clear any existing meeting code value
    const joinMeetingCode = document.getElementById('joinMeetingId');
    if (joinMeetingCode) {
        joinMeetingCode.value = "";
        console.log('🧹 Cleared existing meeting code');
    }

    // Handle media permissions with fallback
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                optional: [{ sourceId: undefined }] 
            }, 
            audio: true 
        });
        console.log('✅ Media permissions granted:', {
            video: stream.getVideoTracks().length > 0,
            audio: stream.getAudioTracks().length > 0
        });
        stream.getTracks().forEach(track => track.stop());
    } catch (e) {
        console.warn('⚠️ Media access error:', e.message);
        // Continue without video if needed
        try {
            const audioOnly = await navigator.mediaDevices.getUserMedia({ 
                audio: true 
            });
            console.log('✅ Audio-only mode activated');
            audioOnly.getTracks().forEach(track => track.stop());
        } catch (audioErr) {
            console.error('❌ Could not access any media devices:', audioErr.message);
        }
    }
});