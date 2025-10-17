/**
 * URL Router for LawGlitch Chatroom
 * Handles client view and professional view routing
 * Client View: Lands after booking, polls for room_link, joins meeting
 * Pro View: In active meetings section, creates meeting, displays room_link
 */

class ChatroomURLRouter {
  constructor() {
    this.urlParams = new URLSearchParams(window.location.search);
    this.view = this.detectView();
    this.bookingId = this.urlParams.get('booking_id') || this.urlParams.get('room_id');
    this.proId = this.urlParams.get('pro_id');
    this.clientName = this.urlParams.get('name');
    this.clientEmail = this.urlParams.get('email');
    this.autoJoin = this.urlParams.get('auto_join') === 'true';
  }

  /**
   * Detect which view should be shown based on URL parameters
   * Client view: when booking_id OR room_id is present (from booking)
   * Pro view: when pro_id is present (from active meetings iframe)
   */
  detectView() {
    // Check for pro_id first (professional/pro view)
    if (this.urlParams.has('pro_id')) {
      return 'pro';
    }
    
    // Check for booking_id or room_id (client view)
    if (this.urlParams.has('booking_id') || this.urlParams.has('room_id')) {
      return 'client';
    }
    
    // Default to client view if no specific indicators
    return 'client';
  }

  /**
   * Initialize UI based on detected view
   */
  initializeView() {
    console.log(`🔄 Initializing ${this.view.toUpperCase()} view`);
    console.log('URL Params:', {
      view: this.view,
      bookingId: this.bookingId,
      proId: this.proId,
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      autoJoin: this.autoJoin
    });

    // Hide/show elements based on view
    this.configureUIElements();

    if (this.view === 'client') {
      this.initializeClientView();
    } else if (this.view === 'pro') {
      this.initializeProView();
    }
  }

  /**
   * Show/hide UI elements based on view using CSS classes
   */
  configureUIElements() {
    console.log(`🎯 Configuring UI for ${this.view.toUpperCase()} view`);

    // Get all pro-view-only and client-view-only elements
    const proViewElements = document.querySelectorAll('.pro-view-only');
    const clientViewElements = document.querySelectorAll('.client-view-only');

    if (this.view === 'client') {
      // CLIENT VIEW: Show join form, hide pro-only elements
      console.log('✅ Setting up CLIENT view UI');
      
      // Show client view elements
      clientViewElements.forEach(el => {
        el.classList.remove('hidden');
      });
      console.log(`✅ Showing ${clientViewElements.length} client view elements`);
      
      // Hide pro view elements
      proViewElements.forEach(el => {
        el.classList.remove('visible');
      });
      console.log(`✅ Hidden ${proViewElements.length} pro view elements`);

    } else if (this.view === 'pro') {
      // PRO VIEW: Show create button, hide client form
      console.log('✅ Setting up PRO view UI');
      
      // Show pro view elements
      proViewElements.forEach(el => {
        el.classList.add('visible');
      });
      console.log(`✅ Showing ${proViewElements.length} pro view elements`);
      
      // Hide client view elements
      clientViewElements.forEach(el => {
        el.classList.add('hidden');
      });
      console.log(`✅ Hidden ${clientViewElements.length} client view elements`);
    }
  }

  /**
   * Initialize client view
   * Sets up auto-join and polling for room_link
   */
  initializeClientView() {
    console.log('👤 Setting up CLIENT view');

    // Set client name if provided
    if (this.clientName) {
      const nameInput = document.getElementById('name');
      if (nameInput) {
        nameInput.value = this.clientName;
        nameInput.readOnly = true;
      }
    }

    // Start polling for room_link from Supabase
    if (window.RoomLinkPoller) {
      window.RoomLinkPoller.start(this.bookingId);
    }

    // Auto-join if specified and room_link becomes available
    if (this.autoJoin) {
      console.log('🔄 Auto-join enabled, will join when room_link is available');
    }
  }

  /**
   * Initialize professional view
   * Sets up meeting creation interface
   */
  initializeProView() {
    console.log('👨‍💼 Setting up PROFESSIONAL view');

    // Store pro_id for later use when creating meeting
    window.currentProId = this.proId;

    // Set up event listener for meetingid input to update Supabase
    const meetingIdInput = document.getElementById('meetingid');
    if (meetingIdInput) {
      // Watch for changes to meetingid input
      this.watchMeetingIdInput(meetingIdInput);
    }
  }

  /**
   * Watch meetingid input for changes and update Supabase
   */
  watchMeetingIdInput(inputElement) {
    let previousValue = inputElement.value;

    const observer = new MutationObserver(() => {
      if (inputElement.value !== previousValue) {
        console.log('Meeting ID changed:', previousValue, '->', inputElement.value);
        previousValue = inputElement.value;

        // Update Supabase professionals table when meeting ID is set
        if (inputElement.value && this.proId) {
          this.updateSupabaseRoomLink(inputElement.value);
        }
      }
    });

    observer.observe(inputElement, {
      attributes: true,
      attributeFilter: ['value']
    });

    // Also listen for input events
    inputElement.addEventListener('input', () => {
      if (inputElement.value !== previousValue) {
        console.log('Meeting ID input changed:', previousValue, '->', inputElement.value);
        previousValue = inputElement.value;

        if (inputElement.value && this.proId) {
          this.updateSupabaseRoomLink(inputElement.value);
        }
      }
    });
  }

  /**
   * Update Supabase professionals table with room_link
   */
  async updateSupabaseRoomLink(roomLink) {
    if (!window.supabaseClient || !this.proId) {
      console.warn('⚠️ Cannot update Supabase: missing client or proId');
      return;
    }

    try {
      console.log(`📝 Updating professionals table for ${this.proId} with room_link: ${roomLink}`);

      const { error } = await window.supabaseClient
        .from('professionals')
        .update({ room_link: roomLink })
        .eq('id', this.proId);

      if (error) {
        console.error('❌ Failed to update professionals table:', error);
        return;
      }

      console.log('✅ Successfully updated professionals table');
    } catch (err) {
      console.error('❌ Error updating Supabase:', err);
    }
  }

  /**
   * Get current view
   */
  getView() {
    return this.view;
  }

  /**
   * Check if this is client view
   */
  isClientView() {
    return this.view === 'client';
  }

  /**
   * Check if this is professional view
   */
  isProView() {
    return this.view === 'pro';
  }

  /**
   * Get booking/room ID
   */
  getBookingId() {
    return this.bookingId;
  }

  /**
   * Get professional ID
   */
  getProId() {
    return this.proId;
  }
}

// Export for use in other files
window.ChatroomRouter = new ChatroomURLRouter();

// 🚀 Initialize the UI immediately after creating the router
// This ensures pro/client view UI elements are shown/hidden correctly
window.addEventListener('DOMContentLoaded', function() {
  if (window.ChatroomRouter) {
    console.log('🎬 Initializing ChatroomRouter view configuration...');
    window.ChatroomRouter.initializeView();
    console.log('✅ ChatroomRouter view initialization complete');
  }
});