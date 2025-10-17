/**
 * Room Link Poller for LawGlitch Chatroom - CLIENT VIEW ONLY
 * Polls for room_link from bookings table when tab is active
 * Implements caching to save memory and CPU
 */

class RoomLinkPoller {
  constructor() {
    this.pollingInterval = null;
    this.pollFrequency = 5000; // 5 seconds
    this.isActive = false;
    this.lastRoomLink = null;
    this.bookingId = null;
    
    // Cache to reduce memory usage
    this.cache = {
      lastData: null,
      lastUpdateTime: null,
      cacheExpiry: 60000 // 1 minute cache expiry
    };

    // Listen for tab visibility changes
    this.setupVisibilityListener();
  }

  /**
   * Setup listener for tab visibility
   * Only poll when tab is active
   */
  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📱 Tab hidden - pausing polling');
        this.stopPolling();
      } else {
        console.log('📱 Tab visible - resuming polling');
        if (this.bookingId) {
          this.startPolling();
        }
      }
    });
  }

  /**
   * Start polling for room_link
   */
  start(bookingId) {
    if (!bookingId) {
      console.warn('⚠️ No booking ID provided to poller');
      return;
    }

    // Check if this is client view only
    if (window.ChatroomRouter && !window.ChatroomRouter.isClientView()) {
      console.log('📊 Pro view detected - polling disabled for memory efficiency');
      return;
    }

    this.bookingId = bookingId;
    console.log(`🔄 Starting room link polling for booking ID: ${bookingId} (CLIENT VIEW)`);

    // Only start if tab is visible
    if (!document.hidden) {
      this.startPolling();
    }
  }

  /**
   * Internal method to start polling
   */
  startPolling() {
    // Clear any existing interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.isActive = true;

    // Poll immediately
    this.poll();

    // Then poll at regular intervals
    this.pollingInterval = setInterval(() => {
      this.poll();
    }, this.pollFrequency);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isActive = false;
  }

  /**
   * Main polling function
   */
  async poll() {
    if (!window.supabaseClient) {
      console.error('❌ Supabase client not initialized');
      return;
    }

    if (!this.bookingId) {
      console.warn('⚠️ No booking ID available for polling');
      return;
    }

    // Double-check pro view - stop polling if switched to pro view
    if (window.ChatroomRouter && !window.ChatroomRouter.isClientView()) {
      console.log('📊 Pro view detected - stopping polling');
      this.stopPolling();
      return;
    }

    try {
      // Check cache first
      if (this.isCacheValid()) {
        console.log('💾 Using cached data (not querying database)');
        const cachedData = this.cache.lastData;
        this.processRoomLinkData(cachedData);
        return;
      }

      // Query only the specific booking we're interested in
      const { data, error } = await window.supabaseClient
        .from('bookings')
        .select('id, room_link, meeting_status, scheduled_for')
        .eq('id', this.bookingId)
        .single();

      if (error) {
        console.error('❌ Supabase polling error:', error);
        this.handlePollingError(error);
        return;
      }

      if (!data) {
        console.warn('⚠️ No booking data found');
        return;
      }

      // Update cache
      this.cache.lastData = data;
      this.cache.lastUpdateTime = Date.now();

      // Process the data
      this.processRoomLinkData(data);

    } catch (err) {
      console.error('❌ Polling exception:', err);
      this.handlePollingError(err);
    }
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid() {
    if (!this.cache.lastData || !this.cache.lastUpdateTime) {
      return false;
    }

    const timeSinceCache = Date.now() - this.cache.lastUpdateTime;
    return timeSinceCache < this.cache.cacheExpiry;
  }

  /**
   * Process room link data and update UI
   */
  processRoomLinkData(data) {
    if (!data) return;

    // Update meeting input if room_link changed
    if (data.room_link && data.room_link !== this.lastRoomLink) {
      console.log('✅ New room_link received:', data.room_link);
      this.lastRoomLink = data.room_link;

      const joinMeetingInput = document.getElementById('joinMeetingId');
      if (joinMeetingInput) {
        joinMeetingInput.value = data.room_link;
        joinMeetingInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // Update status display
    this.updateStatusDisplay(data);
  }

  /**
   * Update meeting status display
   */
  updateStatusDisplay(data) {
    const statusDiv = document.getElementById('meeting-status');
    if (!statusDiv) return;

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
      statusDiv.textContent = '⌛ Waiting for professional to join...';
      statusDiv.style.backgroundColor = '#3d0000';
      statusDiv.style.color = '#ff4444';
    } else if (data.meeting_status === 'ready' && data.room_link) {
      statusDiv.textContent = '✅ Professional is ready! Meeting code found.';
      statusDiv.style.backgroundColor = '#004400';
      statusDiv.style.color = '#44ff44';
    } else if (data.room_link) {
      statusDiv.textContent = '🔄 Connecting to meeting...';
      statusDiv.style.backgroundColor = '#2c2c2c';
      statusDiv.style.color = '#ffffff';
    } else {
      statusDiv.textContent = '⌛ Waiting for professional...';
      statusDiv.style.backgroundColor = '#2c2c2c';
      statusDiv.style.color = '#ffffff';
    }
  }

  /**
   * Handle polling errors
   */
  handlePollingError(error) {
    const statusDiv = document.getElementById('meeting-status');
    if (!statusDiv) return;

    statusDiv.style.padding = '10px';
    statusDiv.style.borderRadius = '5px';
    statusDiv.style.backgroundColor = '#3d0000';
    statusDiv.style.color = '#ff4444';
    statusDiv.textContent = '⚠️ Connection issue. Retrying...';
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      lastData: null,
      lastUpdateTime: null,
      cacheExpiry: 60000
    };
  }

  /**
   * Destroy poller and cleanup
   */
  destroy() {
    this.stopPolling();
    this.clearCache();
    this.lastRoomLink = null;
    this.bookingId = null;
  }

  /**
   * Get polling status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      bookingId: this.bookingId,
      lastRoomLink: this.lastRoomLink,
      cacheValid: this.isCacheValid(),
      tabVisible: !document.hidden
    };
  }
}

// Initialize global instance
window.RoomLinkPoller = new RoomLinkPoller();