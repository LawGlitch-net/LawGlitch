/**
 * URL Router for LawGlitch VideoSDK
 * Handles client view and professional view routing
 * Client View: Lands after booking, polls for room_link, joins meeting
 * Pro View: In active meetings section, creates meeting, displays room_link
 */

class VideoSDKURLRouter {
  constructor() {
    this.urlParams = new URLSearchParams(window.location.search);
    this.view = this.detectView();
    this.proId = this.urlParams.get('pro_id');
    
    // Get booking ID - should be a real UUID, not the placeholder 'default'
    let bookingId = this.urlParams.get('booking_id') || this.urlParams.get('room_id');
    
    // Only use pro_id as fallback if it's not the placeholder 'default'
    if (!bookingId && this.proId && this.proId !== 'default') {
      bookingId = this.proId;
    }
    
    this.bookingId = bookingId;
    this.clientName = this.urlParams.get('name');
    this.clientEmail = this.urlParams.get('email');
    this.autoJoin = this.urlParams.get('auto_join') === 'true';
  }

  /**
   * Detect which view should be shown based on URL parameters
   * Pro view: when pro_id is present AND a real booking_id is provided (from active meetings iframe)
   * Client view: when booking_id OR room_id is present (from booking confirmation)
   */
  detectView() {
    // Check for valid pro_id with real booking_id (professional view from active meetings)
    if (this.urlParams.has('pro_id')) {
      const proId = this.urlParams.get('pro_id');
      // Only treat as pro view if pro_id is provided AND (booking_id exists OR pro_id is not 'default')
      if (this.urlParams.has('booking_id') || (proId && proId !== 'default')) {
        return 'pro';
      }
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

    // Sync with RoomManager for booking updates
    if (window.RoomManager && this.bookingId) {
      console.log(`🔗 Syncing RoomManager with booking ID: ${this.bookingId}`);
      window.RoomManager.syncWithBooking(this.bookingId);
    } else {
      console.warn('⚠️ RoomManager not found or no booking ID to sync');
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
window.VideoSDKRouter = new VideoSDKURLRouter();

// 🚀 Initialize the UI immediately after creating the router
// This ensures pro/client view UI elements are shown/hidden correctly
window.addEventListener('DOMContentLoaded', function() {
  if (window.VideoSDKRouter) {
    console.log('🎬 Initializing VideoSDKRouter view configuration...');
    window.VideoSDKRouter.initializeView();
    console.log('✅ VideoSDKRouter view initialization complete');
  }
});