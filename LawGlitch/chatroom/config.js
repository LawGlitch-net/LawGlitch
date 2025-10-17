// VideoSDK Worker Configuration
const WORKER_URL = "https://purple-math-96f1.lawglitch.workers.dev";
const AUTH_URL = `${WORKER_URL}/generateJWTToken`;
const CREATE_MEETING_URL = `${WORKER_URL}/create-meeting`;
const VALIDATE_MEETING_URL = `${WORKER_URL}/validate-meeting`;

// VideoSDK Token - Empty by default, will be generated via AUTH_URL
const TOKEN = "";

// Supabase Configuration
const SUPABASE_URL = 'https://pxwbumtpnzbbqzqhnsow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2J1bXRwbnpiYnF6cWhuc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjM4NTcsImV4cCI6MjA3MzgzOTg1N30.CfDyCEQCCoc4p1KrE_G43ToVGExuVvGAGWk3hMQxf3s';

// Initialize Supabase Client
let supabaseClient = null;

try {
  if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
  } else {
    console.error('❌ Supabase library not loaded - check CDN');
  }
} catch (err) {
  console.error('❌ Failed to initialize Supabase client:', err.message);
}

// Make Supabase client available globally
window.supabaseClient = supabaseClient;

// Create config object
window.config = {
    TOKEN,
    AUTH_URL,
    WORKER_URL,
    CREATE_MEETING_URL,
    VALIDATE_MEETING_URL,
    EDGE_FUNCTION_URL: `${WORKER_URL}/api`,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    getHeaders: function() {
        return {
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
            'Content-Type': 'application/json'
        };
    }
};