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
    
    if (!this.supabaseClient) {
      console.warn('⚠️ Supabase client not available in RoomManager');
    }

    // Listen for changes to the meeting ID input
    if (this.meetingIdElement) {
      this.meetingIdElement.addEventListener('input', (e) => {
        this.onMeetingIdChange(e.target.value);
      });
      console.log('✅ RoomManager initialized');
    } else {
      console.warn('⚠️ Meeting ID element not found');
    }
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
   * Update room_link in Supabase
   */
  async updateRoomLinkInDatabase(roomLink) {
    if (!this.supabaseClient) {
      console.error('❌ Supabase client not initialized');
      return;
    }

    // If we don't have a booking ID from routing, try to get the latest booking
    let bookingId = this.currentBookingId;
    
    if (!bookingId) {
      console.log('⚠️ No booking ID specified, updating latest booking');
      try {
        const { data, error } = await this.supabaseClient
          .from('bookings')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          console.error('❌ Could not find booking:', error);
          return;
        }

        bookingId = data.id;
      } catch (err) {
        console.error('❌ Error fetching booking ID:', err);
        return;
      }
    }

    try {
      console.log(`💾 Updating booking ${bookingId} with room_link: ${roomLink}`);

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
        this.showStatus('Error saving meeting code', 'error');
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

// Initialize global instance
window.RoomManager = new RoomManager();

// Also try to initialize from ChatroomRouter if available
document.addEventListener('DOMContentLoaded', () => {
  if (window.ChatroomRouter && window.RoomManager) {
    const bookingId = window.ChatroomRouter.getBookingId();
    if (bookingId && window.ChatroomRouter.isClientView()) {
      console.log('🔗 Syncing RoomManager with ChatroomRouter booking');
      window.RoomManager.syncWithBooking(bookingId);
    }
  }
});