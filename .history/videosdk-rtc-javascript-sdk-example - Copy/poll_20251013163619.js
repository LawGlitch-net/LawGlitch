// Initialize Supabase client
// Ensure Supabase client is loaded via CDN
let supabaseClient;
if (typeof window.createClient === 'function') {
  supabaseClient = window.createClient(
    'https://pxwbumtpnzbbqzqhnsow.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2J1bXRwbnpiYnF6cWhuc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjM4NTcsImV4cCI6MjA3MzgzOTg1N30.CfDyCEQCCoc4p1KrE_G43ToVGExuVvGAGWk3hMQxf3s'
  );
} else if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(
    'https://pxwbumtpnzbbqzqhnsow.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2J1bXRwbnpiYnF6cWhuc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjM4NTcsImV4cCI6MjA3MzgzOTg1N30.CfDyCEQCCoc4p1KrE_G43ToVGExuVvGAGWk3hMQxf3s'
  );
}

function startRoomLinkPolling() {
  console.log("DEBUG: startRoomLinkPolling function entered.");
  const urlParams = new URLSearchParams(window.location.search);
  const clientName = urlParams.get('client_name');
  const autoJoin = urlParams.get('auto_join');
  
  // Set client name if provided
  if (clientName) {
    const nameInput = document.getElementById('name');
    if (nameInput) {
      nameInput.value = clientName;
    }
  }

  // Only auto-join if specified and we have a room link
  if (autoJoin === 'true') {
    const joinButton = document.getElementById('joinMeetingBtn');
    if (joinButton) {
      joinButton.click();
    }
  }

  console.log("Starting room link polling");

  // Clear any existing interval
  if (window.roomLinkPollingInterval) {
    clearInterval(window.roomLinkPollingInterval);
  }

  // Start polling every 5 seconds
  window.roomLinkPollingInterval = setInterval(async () => {
    console.log("DEBUG: Polling for room link...");
    try {
      if (!supabaseClient) {
        console.error('❌ Supabase client not initialized');
        return;
      }

      // Query Supabase for the latest room link
      const { data, error } = await supabaseClient
        .from('bookings')
        .select('id, room_link, meeting_status, scheduled_for')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        const statusDiv = document.getElementById('meeting-status');
        if (statusDiv) {
          statusDiv.textContent = 'Error connecting to meeting server. Retrying...';
          statusDiv.style.backgroundColor = '#3d0000';
          statusDiv.style.color = '#ff4444';
        }
        return;
      }

      if (data) {
        console.log('✅ Data received:', data);
        const statusDiv = document.getElementById('meeting-status');
        
        if (data.room_link) {
          const input = document.getElementById('joinMeetingId');
          const urlParams = new URLSearchParams(window.location.search);
          const urlRoomId = urlParams.get('room_id');

          // Defensive: only set join input from the room_link field (never from id)
          if (input && data.room_link) {
            console.log('Setting joinMeetingId from room_link:', data.room_link);
            input.value = data.room_link;
            input.dispatchEvent(new Event('input')); // Trigger input event for handlers
          }
        }
        
        // Update status messages with professional styling
        if (statusDiv) {
          statusDiv.style.padding = '10px';
          statusDiv.style.borderRadius = '5px';
          statusDiv.style.marginTop = '10px';
          statusDiv.style.fontWeight = 'bold';
          
          if (data.scheduled_for) {
            const date = new Date(data.scheduled_for);
            const formatted = date.toLocaleString();
            statusDiv.textContent = `📅 Scheduled for ${formatted}`;
            statusDiv.style.backgroundColor = '#2c2c2c';
            statusDiv.style.color = '#ffd700';
          } else if (data.meeting_status === 'pending') {
            statusDiv.textContent = '⌛ Waiting for host to join...';
            statusDiv.style.backgroundColor = '#3d0000';
            statusDiv.style.color = '#ff4444';
          } else if (data.meeting_status === 'ready') {
            statusDiv.textContent = '✅ Host has joined! Click Join Meeting';
            statusDiv.style.backgroundColor = '#004400';
            statusDiv.style.color = '#44ff44';
            document.querySelector('.join-meeting-input').style.display = 'block';
          } else {
            statusDiv.textContent = '🔄 Connecting to meeting...';
            statusDiv.style.backgroundColor = '#2c2c2c';
            statusDiv.style.color = '#ffffff';
          }
        }
      } else {
        console.log('⚠️ No data returned from Supabase');
        const statusDiv = document.getElementById('meeting-status');
        if (statusDiv) {
          statusDiv.textContent = 'No meeting information available';
          statusDiv.style.backgroundColor = '#2c2c2c';
          statusDiv.style.color = '#ffffff';
        }
      }
    } catch (err) {
      console.error('❌ Polling error:', err);
      const statusDiv = document.getElementById('meeting-status');
      if (statusDiv) {
        statusDiv.textContent = 'Connection error. Retrying...';
        statusDiv.style.backgroundColor = '#3d0000';
        statusDiv.style.color = '#ff4444';
      }
    }
  }, 5000); // Poll every 5 seconds
}

// Start polling when the document is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log("Starting room link polling on DOM load");
  startRoomLinkPolling();

  // Set up event handlers for input changes
  document.addEventListener('input', function(event) {
    if (event.target.id === 'joinMeetingId' || event.target.id === 'name') {
      console.log(`Input changed: ${event.target.id} = ${event.target.value}`);
    }
  });

  // Clear any existing meeting code value
  const joinMeetingCode = document.getElementById('joinMeetingId');
  if (joinMeetingCode) {
    joinMeetingCode.value = "";
  }

  // Watcher to detect unexpected programmatic changes to the meeting input
  const joinInputWatcher = document.getElementById('joinMeetingId');
  if (joinInputWatcher) {
    let _lastJoinVal = joinInputWatcher.value;
    setInterval(() => {
      try {
        if (joinInputWatcher.value !== _lastJoinVal) {
          console.log('DEBUG: joinMeetingId changed from', _lastJoinVal, 'to', joinInputWatcher.value);
          console.trace();
          _lastJoinVal = joinInputWatcher.value;
        }
      } catch (e) {
        console.error('Error in joinInputWatcher:', e);
      }
    }, 500);
  }
});

// Create new meeting function - uses worker proxy
async function createNewMeeting() {
  try {
    console.log("Creating new meeting...");
    
    // Get token from worker
    await tokenGeneration();
    
    if (!token) {
      alert("Failed to get authentication token");
      return;
    }

    // Get booking ID from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('room_id');
    
    // Create meeting via worker
    const createMeetingBody = bookingId ? { bookingId } : {};
    
    const response = await fetch(CREATE_MEETING_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createMeetingBody)
    });

    if (!response.ok) {
      throw new Error(`Failed to create meeting: ${response.statusText}`);
    }

    const data = await response.json();
    const roomId = data.roomId || data.room_id || data.id;

    if (!roomId && !data.room_link && !data.roomLink) {
      throw new Error("No room identifier returned from server");
    }

    console.log("Meeting created successfully (response):", data);

    // Try to find the authoritative room_link. The worker may return it directly
    // or the bookings row may be updated asynchronously. We'll prefer room_link.
    let roomLink = data.room_link || data.roomLink || null;

    // If a bookingId was provided (from URL earlier), poll the bookings table for its room_link
    if (!roomLink && bookingId) {
      // poll up to 15s for the booking row to have room_link
      const start = Date.now();
      const timeout = 15000; // ms
      while (!roomLink && Date.now() - start < timeout) {
        try {
          const { data: booking, error: bookingErr } = await supabaseClient
            .from('bookings')
            .select('room_link')
            .eq('id', bookingId)
            .single();
          if (!bookingErr && booking && booking.room_link) {
            roomLink = booking.room_link;
            break;
          }
        } catch (e) {
          console.warn('Error fetching booking row while waiting for room_link:', e);
        }
        // wait 2 seconds before retrying
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // Final fallback: if no room_link found, use the returned roomId
    const displayId = roomLink || roomId;

    // Update UI with meeting ID / room link
    const meetingIdInput = document.getElementById("meetingid");
    const joinInput = document.getElementById('joinMeetingId');
    const displayedId = displayId || '';
    
    // Update the UI
    if (meetingIdInput) meetingIdInput.value = displayedId;
    if (joinInput) joinInput.value = displayedId;

    // Try to get booking ID from parent window first
    let finalBookingId = '';
    try {
      const parentBookingInput = window.parent.document.getElementById('booking-id');
      if (parentBookingInput) {
        finalBookingId = parentBookingInput.value;
      }
    } catch (e) {
      console.warn('Could not access parent window booking ID:', e);
    }

    // Fallback to URL param if parent window access fails
    if (!finalBookingId) {
      finalBookingId = bookingId;  // from URL params
    }

    // Update Supabase with the displayed meeting code
    try {
      if (displayedId && finalBookingId) {
        const { data: updated, error: updateError } = await supabaseClient
          .from('bookings')
          .update({ room_link: displayedId })
          .eq('id', finalBookingId)
          .select();

        if (updateError) {
          console.error('Failed to update booking room_link:', updateError);
        } else {
          console.log('Booking updated with room_link:', updated);
          
          // Update parent window form if accessible
          try {
            const parentForm = window.parent.document;
            if (parentForm) {
              const bookingInput = parentForm.getElementById('booking-id');
              const clientNameInput = parentForm.getElementById('client-name');
              const clientEmailInput = parentForm.getElementById('client-email');
              
              if (updated && updated[0]) {
                if (bookingInput) bookingInput.value = updated[0].id;
                if (clientNameInput) clientNameInput.value = updated[0].name || '';
                if (clientEmailInput) clientEmailInput.value = updated[0].email || '';
              }
            }
          } catch (e) {
            console.warn('Could not update parent window form:', e);
          }
        }
      }
    } catch (e) {
      console.error('Error updating room_link in Supabase:', e);
    }

    document.getElementById("joinPage").style.display = "none";
    document.getElementById("gridPpage").style.display = "flex";
    toggleControls();

    // Start the meeting
    startMeeting(token, displayId, 'Admin');
    
  } catch (error) {
    console.error("Error creating meeting:", error);
    alert("Failed to create meeting: " + error.message);
  }
}

// Join an existing meeting
async function joinMeeting(newMeeting) {
  // get Token
  await tokenGeneration();

  let meetingId = document.getElementById("joinMeetingId").value || "";
  let userName = document.getElementById("name").value;
  
  if (!newMeeting && !meetingId) {
    return alert("Please provide a meeting ID");
  }
  
  if (!userName) {
    return alert("Please enter your name");
  }
  
  if (!newMeeting) {
    if (await validateMeeting(meetingId, userName)) {
      console.log("Meeting validated");
    } else {
      return alert("Invalid meeting ID. Please try again.");
    }
  }

  //create New Meeting
  //get new meeting if new meeting requested;
  if (newMeeting) {
    createNewMeeting();
  }
}

// Helper function to validate meeting ID format
async function validateMeeting(meetingId, joinMeetingName) {
  if (!VALIDATE_MEETING_URL) {
    console.error('VALIDATE_MEETING_URL not defined. Make sure config.js is loaded.');
    alert('Configuration error. Please try again later.');
    return false;
  }

  try {
    // Use worker proxy to validate meeting
    const response = await fetch(VALIDATE_MEETING_URL, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId: meetingId })
    });

    if (!response.ok) {
      throw new Error(`Failed to validate meeting: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.roomId === meetingId) {
      document.getElementById("meetingid").value = meetingId;
      document.getElementById('joinPage').style.display = 'none';
      document.getElementById('gridPpage').style.display = 'flex';
      toggleControls();
      return true;
    }
    
    alert('Invalid meeting ID. Please try again.');
    return false;
  } catch (error) {
    console.error("Error validating meeting:", error);
    alert('Failed to validate meeting. Please try again.');
    return false;
  }
}

// Helper function to get token
async function tokenGeneration() {
  // Use worker proxy to get token
  try {
    const response = await fetch(AUTH_URL);
    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.statusText}`);
    }
    const data = await response.json();
    token = data.token;
    console.log("Token retrieved successfully");
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    alert("Failed to get authentication token. Please try again.");
    return null;
  }
}