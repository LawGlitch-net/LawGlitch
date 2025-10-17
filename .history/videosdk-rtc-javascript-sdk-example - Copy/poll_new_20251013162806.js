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