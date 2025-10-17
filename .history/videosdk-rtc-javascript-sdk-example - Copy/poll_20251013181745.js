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
    // Try multiple parent element IDs in parent window
    const parentCandidates = ['booking-id', 'bookingId', 'booking', 'id'];
    try {
        const parentDoc = window.parent && window.parent.document ? window.parent.document : null;
        if (parentDoc) {
            for (const id of parentCandidates) {
                try {
                    const el = parentDoc.getElementById(id);
                    if (el && el.value) {
                        console.log('📝 Found booking ID in parent form element:', id, el.value);
                        return el.value;
                    }
                } catch (e) {
                    // ignore per-element access errors
                }
            }
        }
    } catch (e) {
        console.warn('⚠️ Could not access parent window booking ID (parent access error):', e);
    }

    // Try several URL parameter names
    const urlParams = new URLSearchParams(window.location.search);
    const paramCandidates = ['room_id', 'roomId', 'booking', 'booking_id', 'bookingId', 'id'];
    for (const p of paramCandidates) {
        const v = urlParams.get(p);
        if (v) {
            console.log('📝 Using booking ID from URL param', p, ':', v);
            return v;
        }
    }

    // Try reading from hash parameters too
    try {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const hashParams = new URLSearchParams(hash);
            for (const p of paramCandidates) {
                const v = hashParams.get(p);
                if (v) {
                    console.log('📝 Using booking ID from URL hash param', p, ':', v);
                    return v;
                }
            }
        }
    } catch (e) {
        // ignore
    }

    console.warn('⚠️ No booking ID found (checked parent form and URL params)');
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

        // Debug print of row keys to help identify available columns
        try {
            console.log('📋 Booking row keys:', Object.keys(row));
            console.log('📦 Booking row sample values (first 10 keys):', Object.fromEntries(Object.keys(row).slice(0,10).map(k => [k, row[k]])));
        } catch (e) {
            // ignore
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

// Simpler: fetch only the room_link column for a booking and fill the join input
async function fetchRoomLinkAndFill(bookingId, { interval = 2000, timeout = 15000 } = {}) {
    if (!bookingId) {
        console.warn('⚠️ fetchRoomLinkAndFill called without bookingId');
        return null;
    }
    if (!supabaseClient && !initSupabase()) return null;

    console.log(`🔁 Starting room_link poll for booking ${bookingId} (interval=${interval}ms, timeout=${timeout}ms)`);
    const start = Date.now();

    while (Date.now() - start < timeout) {
        try {
            const { data, error } = await supabaseClient
                .from('bookings')
                .select('room_link')
                .eq('id', bookingId)
                .single();

            if (error) {
                console.error('❌ Error fetching room_link for booking:', error);
            } else if (data) {
                console.log('📋 Fetched booking row room_link:', data.room_link);
                if (data.room_link) {
                    const input = document.getElementById('joinMeetingId');
                    if (input) {
                        if (input.value !== String(data.room_link)) {
                            input.value = String(data.room_link);
                            console.log('✅ joinMeetingId auto-filled from room_link:', data.room_link);
                        } else {
                            console.log('ℹ️ joinMeetingId already set to room_link value');
                        }
                    } else {
                        console.warn('⚠️ joinMeetingId input not found in the DOM');
                    }
                    return { column: 'room_link', value: data.room_link };
                } else {
                    console.log('ℹ️ room_link empty for booking, will retry...');
                }
            }
        } catch (e) {
            console.error('❌ Exception while fetching room_link:', e);
        }

        await new Promise(r => setTimeout(r, interval));
    }

    console.warn('⚠️ fetchRoomLinkAndFill timed out without finding room_link for booking:', bookingId);
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
            // Skip polling if tab is not active
            if (!pollingActive) {
                return;
            }
            
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

// Variable to track if polling should be active
let pollingActive = !document.hidden;

// Handle visibility change events
document.addEventListener('visibilitychange', function() {
    pollingActive = !document.hidden;
    console.log(`👁️ Tab visibility changed. Polling is now ${pollingActive ? 'active' : 'paused'}`);
});

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

    // After initialization, attempt to fetch only the `room_link` column for the booking and fill the join input
    (async () => {
        try {
            const bookingId = getBookingId();
            if (bookingId) {
                console.log('🔎 Found bookingId after init, attempting to fetch room_link for booking:', bookingId);
                const result = await fetchRoomLinkAndFill(bookingId, { interval: 2000, timeout: 20000 });
                if (result) {
                    console.log('🎉 room_link fetch returned:', result);
                } else {
                    console.log('ℹ️ room_link was not present yet for booking:', bookingId);
                }
            } else {
                console.log('ℹ️ No bookingId available to fetch room_link after init');
            }
        } catch (e) {
            console.error('❌ Error during post-init room_link fetch:', e);
        }
    })();
});