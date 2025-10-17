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

// Last seen meeting code to prevent duplicate updates
let lastSeenMeetingId = null;
let lastUpdateTime = 0;
const UPDATE_THROTTLE = 1000; // Minimum time between updates in milliseconds

// Candidate column names that might contain the meeting code
const MEETING_COLUMNS = [
    'room_link', 'roomLink', 'roomId', 'room_id', 'meeting_id', 'meetingId', 'link'
];

// Helper: set local join input from a booking row object by finding the right column
function setJoinInputFromRow(row) {
    if (!row || typeof row !== 'object') return false;
    const input = document.getElementById('joinMeetingId') || document.getElementById('meetingid') || document.getElementById('meeting-id');
    if (!input) return false;

    // Find first candidate column present on the row
    for (const col of MEETING_COLUMNS) {
        if (Object.prototype.hasOwnProperty.call(row, col)) {
            const val = row[col];
            console.log(`🔎 Found candidate column on booking row: ${col} =`, val);
            if (val) {
                if (input.value !== String(val)) {
                    console.log('➡️ Updating join input from booking column', col, val);
                    input.value = String(val);
                } else {
                    console.log('➡️ Join input already matches booking column', col);
                }
                return true;
            }
            // column exists but empty; still report presence
            console.log(`ℹ️ Column ${col} exists on booking row but is empty`);
            return false;
        }
    }
    console.log('⚠️ No known meeting-code column found on booking row');
    return false;
}

// Detect which column holds the meeting code for a booking row (returns column name or null)
async function detectMeetingColumn(bookingId) {
    if (!bookingId) return null;
    if (!supabaseClient && !initSupabase()) return null;

    try {
        console.log('🔍 Detecting meeting-code column for booking:', bookingId);
        const { data: row, error } = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (error) {
            console.error('❌ Error fetching booking row for detection:', error);
            return null;
        }

        if (!row) {
            console.warn('⚠️ Booking row not found for id:', bookingId);
            return null;
        }

        for (const col of MEETING_COLUMNS) {
            if (Object.prototype.hasOwnProperty.call(row, col)) {
                console.log('✅ Detected meeting-code column:', col, 'value:', row[col]);
                return col;
            }
        }

        console.warn('⚠️ No meeting-code column detected on booking row; available keys:', Object.keys(row));
        return null;
    } catch (e) {
        console.error('❌ Exception while detecting meeting column:', e);
        return null;
    }
}

// Poll the bookings row for a meeting code and update join input when found
async function pollBookingForMeetingCode(bookingId, { interval = 2000, timeout = 15000 } = {}) {
    if (!bookingId) {
        console.warn('⚠️ pollBookingForMeetingCode called without bookingId');
        return null;
    }
    if (!supabaseClient && !initSupabase()) return null;

    console.log(`🔁 Starting poll for booking ${bookingId} (interval=${interval}ms, timeout=${timeout}ms)`);
    const start = Date.now();
    let detectedColumn = null;

    // Try initial detection first
    detectedColumn = await detectMeetingColumn(bookingId);

    while (Date.now() - start < timeout) {
        try {
            const selectCols = detectedColumn ? detectedColumn : '*';
            const { data, error } = await supabaseClient
                .from('bookings')
                .select(selectCols)
                .eq('id', bookingId)
                .single();

            if (error) {
                console.error('❌ Error polling booking row:', error);
            } else if (data) {
                // If we didn't know the column, try to detect it now
                if (!detectedColumn) {
                    for (const col of MEETING_COLUMNS) {
                        if (Object.prototype.hasOwnProperty.call(data, col)) {
                            detectedColumn = col;
                            console.log('🔎 Detected meeting column during poll:', detectedColumn);
                            break;
                        }
                    }
                }

                // If we have a column, check value
                if (detectedColumn && data[detectedColumn]) {
                    console.log('✅ Found meeting code in bookings.', detectedColumn, data[detectedColumn]);
                    setJoinInputFromRow(data);
                    return { column: detectedColumn, value: data[detectedColumn] };
                }
            }
        } catch (e) {
            console.error('❌ Exception while polling booking row:', e);
        }

        await new Promise(r => setTimeout(r, interval));
        console.log('⏳ Still polling... elapsed:', Math.floor((Date.now() - start) / 1000), 's');
    }

    console.warn('⚠️ Polling ended without finding a meeting code for booking:', bookingId);
    return null;
}

// Function to update Supabase with meeting code
async function updateSupabaseWithMeetingCode(meetingId) {
    try {
        // Skip if same meeting ID was just updated recently
        const now = Date.now();
        if (meetingId === lastSeenMeetingId && (now - lastUpdateTime) < UPDATE_THROTTLE) {
            console.log('🔄 Skipping update - same meeting code:', meetingId, 
                      `(${Math.floor((now - lastUpdateTime) / 1000)}s since last update)`);
            return;
        }
        
        console.log('🔄 Attempting to update Supabase with meeting code:', meetingId, 
                  '(previous:', lastSeenMeetingId, ')');
        lastSeenMeetingId = meetingId;
        lastUpdateTime = now;
        
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
            console.log('📡 Sending update to Supabase...');
            const startTime = Date.now();
            
            const { data: updated, error: updateError } = await supabaseClient
                .from('bookings')
                .update({ room_link: meetingId })
                .eq('id', bookingId)
                .select();

            const duration = Date.now() - startTime;
            if (updateError) {
                console.error('❌ Failed to update booking room_link:', updateError, `(${duration}ms)`);
            } else {
                console.log(`✅ Updated room_link in Supabase: ${meetingId}`, 
                          `\n   Time: ${duration}ms`, 
                          `\n   Booking ID: ${bookingId}`, 
                          `\n   Response:`, updated);
                
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

                            // Also sync local join input from the updated booking row
                            try {
                                setJoinInputFromRow(updated[0]);
                            } catch (syncErr) {
                                console.warn('⚠️ Failed to sync join input from updated row:', syncErr);
                            }
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
    
    console.log('👀 Setting up watchers for:', meetingInputs.map(input => input.id));
    let pollCount = 0;
    
    meetingInputs.forEach(input => {
        let lastValue = input.value;
        setInterval(() => {
            try {
                pollCount++;
                if (pollCount % 5 === 0) { // Log every 5th poll
                    console.log(`🔍 Poll #${pollCount} checking ${input.id}...`);
                }
                
                if (input.value !== lastValue) {
                    console.log(`🔄 ${input.id} changed: ${lastValue || '(empty)'} ➜ ${input.value || '(empty)'}`);
                    if (input.value) {
                        updateSupabaseWithMeetingCode(input.value);
                    }
                    lastValue = input.value;
                } else if (pollCount % 10 === 0) { // Log current value every 10th poll
                    console.log(`✓ ${input.id} unchanged: ${lastValue || '(empty)'}`);
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
            video: true, 
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