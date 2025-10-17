import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Configuration
const SUPABASE_URL = 'https://pxwbumtpnzbbqzqhnsow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2J1bXRwbnpiYnF6cWhuc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjM4NTcsImV4cCI6MjA3MzgzOTg1N30.CfDyCEQCCoc4p1KrE_G43ToVGExuVvGAGWk3hMQxf3s';

// Initialize Supabase Client with specific configuration
const createSupabaseClient = () => {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        },
        db: {
            schema: 'public'
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    });
    return client;
};

// Create and export a ready-to-use Supabase client instance
const supabase = createSupabaseClient();

// Export configuration, client creator and the default client instance
export { SUPABASE_URL, SUPABASE_ANON_KEY, createSupabaseClient, supabase };
