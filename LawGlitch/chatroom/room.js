/**
 * Room Link Manager - Updates room_link in Supabase when meeting code is generated
 * Handles syncing the meetingid input with Supabase booking records
 */

class RoomManager {
  constructor() {
    this.meetingIdElement = null;
    this.statusElement = null;
    this.supabaseClient = null;
    this.currentBookingId = null;
    this.updateDebounceTimer = null;
    this.updateDelay = 1000; // Delay before updating DB to avoid excessive writes
    this.lastValue = null; // Track last known value for change detection
    this.pollInterval = null; // Polling interval for value changes
    this.changeTimeout = null; // Debounce timeout
    
    this.initialize();
  }

  /**
   * Initialize the room manager
   */
  initialize() {
    // Get DOM elements
    this.meetingIdElement = document.getElementById('meetingid');
    this.statusElement = document.getElementById('meeting-status');
    
    // Get Supabase client from window
    this.supabaseClient = window.supabaseClient;

    // Get booking ID from URL parameters
    // Priority: booking_id (actual database booking) > pro_id (professional session)
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking_id');
    const proId = urlParams.get('pro_id');
    
    if (bookingId) {
      this.setBookingId(bookingId);
    } else if (proId && proId !== 'default') {
      // Only use pro_id if it's not the default placeholder
      this.setBookingId(proId);
    } else {
      console.warn('⚠️ Booking ID not found in URL parameters. Expected booking_id or non-default pro_id');
    }
    
    if (!this.supabaseClient) {
      console.warn('⚠️ Supabase client not available in RoomManager');
    }

    // Listen for changes to the meeting ID input
    if (this.meetingIdElement) {
      // Listen to both 'input' and 'change' events
      this.meetingIdElement.addEventListener('input', (e) => {
        console.log('📝 Input event triggered on meetingid');
        this.onMeetingIdChange(e.target.value);
      });

      this.meetingIdElement.addEventListener('change', (e) => {
        console.log('📝 Change event triggered on meetingid');
        this.onMeetingIdChange(e.target.value);
      });

      // Also observe mutations for programmatic changes
      this.observeMeetingIdChanges();
      
      console.log('✅ RoomManager initialized and listening for meetingid changes');
    } else {
      console.warn('⚠️ Meeting ID element not found');
    }
  }

  /**
   * Observe programmatic changes to the meetingid field
   * Uses a Proxy wrapper to detect value changes
   */
  observeMeetingIdChanges() {
    if (!this.meetingIdElement) return;

    // Store initial value for comparison
    this.lastValue = this.meetingIdElement.value;
    
    // Create a polling mechanism to detect value changes
    // This is more reliable than trying to intercept property changes
    const checkInterval = setInterval(() => {
      const currentValue = this.meetingIdElement.value;
      
      if (currentValue && currentValue !== this.lastValue) {
        console.log(`👀 Detected programmatic value change: "${this.lastValue}" → "${currentValue}"`);
        this.lastValue = currentValue;
        
        // Trigger our change handler but add a small delay to avoid rapid-fire updates
        if (!this.changeTimeout) {
          this.onMeetingIdChange(currentValue);
          
          // Add debounce to prevent immediate re-triggers
          this.changeTimeout = setTimeout(() => {
            this.changeTimeout = null;
          }, 500);
        }
      }
    }, 100);

    // Store interval ID so we can clear it if needed
    this.pollInterval = checkInterval;
    console.log('✅ Value polling observer set up for meetingid');
  }

  /**
   * Set the booking ID for tracking
   */
  setBookingId(bookingId) {
    this.currentBookingId = bookingId;
    console.log(`📝 RoomManager tracking booking: ${bookingId}`);
  }

  /**
   * Called when meeting ID changes
   */
  onMeetingIdChange(newMeetingId) {
    if (!newMeetingId) {
      console.log('📭 Meeting ID cleared');
      return;
    }

    console.log(`🔄 Meeting ID updated: ${newMeetingId}`);

    // Debounce the database update
    clearTimeout(this.updateDebounceTimer);
    this.updateDebounceTimer = setTimeout(() => {
      this.updateRoomLinkInDatabase(newMeetingId);
    }, this.updateDelay);
  }

  /**
   * Validate if a string is a valid UUID v4
   */
  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Update room_link in Supabase
   */
  async updateRoomLinkInDatabase(roomLink) {
    if (!this.supabaseClient) {
      console.error('❌ Supabase client not initialized');
      this.showStatus('Error: Supabase client not ready', 'error');
      return;
    }

    const bookingId = this.currentBookingId;

    if (!bookingId) {
      console.error('❌ Booking ID not set in RoomManager. Cannot update room link.');
      this.showStatus('Error: Booking ID not available', 'error');
      return;
    }

    // Validate that booking ID is a proper UUID
    if (!this.isValidUUID(bookingId)) {
      console.error(`❌ Invalid booking ID format: "${bookingId}". Expected a valid UUID.`);
      console.warn(`⚠️ Make sure to pass a valid booking_id in the URL parameters (e.g., ?booking_id=uuid-here)`);
      this.showStatus('Error: Invalid booking ID format', 'error');
      return;
    }

    console.log(`💾 Updating booking ${bookingId} with room_link: ${roomLink}`);

    try {
      const { data, error } = await this.supabaseClient
        .from('bookings')
        .update({
          room_link: roomLink,
          meeting_status: 'ready'
        })
        .eq('id', bookingId)
        .select();

      if (error) {
        console.error('❌ Error updating room_link:', error);
        this.showStatus(`Error: ${error.message}`, 'error');
        return;
      }

      console.log('✅ Room link updated successfully:', data);
      this.showStatus('Meeting code saved', 'success');

    } catch (err) {
      console.error('❌ Exception updating room_link:', err);
      this.showStatus('Failed to save meeting code', 'error');
    }
  }

  /**
   * Display status message
   */
  showStatus(message, type = 'info') {
    if (!this.statusElement) return;

    this.statusElement.textContent = message;
    this.statusElement.style.padding = '10px';
    this.statusElement.style.borderRadius = '5px';
    this.statusElement.style.marginTop = '10px';
    this.statusElement.style.fontWeight = 'bold';

    switch (type) {
      case 'success':
        this.statusElement.style.backgroundColor = '#004400';
        this.statusElement.style.color = '#44ff44';
        break;
      case 'error':
        this.statusElement.style.backgroundColor = '#3d0000';
        this.statusElement.style.color = '#ff4444';
        break;
      case 'info':
      default:
        this.statusElement.style.backgroundColor = '#2c2c2c';
        this.statusElement.style.color = '#ffffff';
    }
  }

  /**
   * Get current meeting ID
   */
  getMeetingId() {
    return this.meetingIdElement ? this.meetingIdElement.value : null;
  }

  /**
   * Set meeting ID (useful for external updates)
   */
  setMeetingId(meetingId) {
    if (this.meetingIdElement) {
      this.meetingIdElement.value = meetingId;
      this.meetingIdElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /**
   * Sync booking ID and start managing
   */
  syncWithBooking(bookingId) {
    this.setBookingId(bookingId);
    console.log(`🔗 RoomManager synced with booking: ${bookingId}`);
  }
}

// Initialize global instance after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.RoomManager = new RoomManager();
  // Also try to initialize from VideoSDKRouter if available
  if (window.VideoSDKRouter && window.RoomManager) {
    const bookingId = window.VideoSDKRouter.getBookingId();
    if (bookingId) {
      console.log('🔗 Syncing RoomManager with VideoSDKRouter booking');
      window.RoomManager.syncWithBooking(bookingId);
    }
  }
});