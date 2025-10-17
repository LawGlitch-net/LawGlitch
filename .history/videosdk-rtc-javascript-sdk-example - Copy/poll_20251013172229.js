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

// Function to update Supabase with meeting code
async function updateSupabaseWithMeetingCode(meetingId) {
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
    console.warn('Could not access parent window booking ID:', e);
  }

  // Fallback to URL param if parent window access fails
  if (!bookingId) {
    const urlParams = new URLSearchParams(window.location.search);
    bookingId = urlParams.get('room_id');
    console.log('📝 Using booking ID from URL:', bookingId);
  }

  if (bookingId && meetingId) {
    console.log('🔄 Updating Supabase booking:', bookingId, 'with room_link:', meetingId);
    try {
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
          console.warn('Could not update parent window form:', e);
        }
      }
    } catch (e) {
      console.error('❌ Error updating room_link in Supabase:', e);
    }
  } else {
    console.warn('⚠️ Missing booking ID or meeting ID for update');
  }
}

// Start polling when the document is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log("Starting room link polling on DOM load");
  startRoomLinkPolling();

  // Set up event handlers for input changes
  document.addEventListener('input', function(event) {
    if (event.target.id === 'joinMeetingId' || event.target.id === 'name') {
      console.log(`Input changed: ${event.target.id} = ${event.target.value}`);
      
      // If meeting ID input changes, update Supabase
      if (event.target.id === 'joinMeetingId' && event.target.value) {
        updateSupabaseWithMeetingCode(event.target.value);
      }
    }
  });

  // Watch for copy button clicks
  const copyButton = document.querySelector('[onclick*="copyMeetingCode"]');
  if (copyButton) {
    copyButton.addEventListener('click', function() {
      const meetingInput = document.getElementById('meetingid');
      if (meetingInput && meetingInput.value) {
        updateSupabaseWithMeetingCode(meetingInput.value);
      }
    });
  }

  // Clear any existing meeting code value
  const joinMeetingCode = document.getElementById('joinMeetingId');
  if (joinMeetingCode) {
    joinMeetingCode.value = "";

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