// VideoSDK configuration
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2J1bXRwbnpiYnF6cWhuc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjM4NTcsImV4cCI6MjA3MzgzOTg1N30.CfDyCEQCCoc4p1KrE_G43ToVGExuVvGAGWk3hMQxf3s';

// Function to generate a short-lived token
async function generateToken(API_KEY, SECRET_KEY) {
  try {
    if (!API_KEY || !SECRET_KEY) {
      throw new Error('Missing API_KEY or SECRET_KEY');
    }
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 600; // Token expires in 10 minutes

    const payload = {
      apikey: API_KEY,
      permissions: ["allow_join", "allow_mod"],  // Adding mod permission for room creation
      iat: iat,
      exp: exp
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    
    // Base64Url encode the header and payload
    const encodedHeader = btoa(JSON.stringify(header))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    // Create signing key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET_KEY);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign the data
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(dataToSign)
    );

    // Convert signature to Base64Url
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
}
const API_BASE_URL = 'https://api.videosdk.live';
const SUPABASE_URL = 'https://pxwbumtpnzbbqzqhnsow.supabase.co';

// CORS headers configuration
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://lawglitch.in',
    'https://www.lawglitch.in',
];

// CORS headers helper function
const getCorsHeaders = (request) => {
    const origin = request.headers.get('Origin');
    const corsHeaders = {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    };
    
    if (origin && allowedOrigins.includes(origin)) {
        corsHeaders['Access-Control-Allow-Origin'] = origin;
    } else {
        corsHeaders['Access-Control-Allow-Origin'] = allowedOrigins[0];
    }
    
    return corsHeaders;
};

// Error handling wrapper
const handleError = (error, request) => {
    console.error('Worker Error:', error);
    return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
    }), {
        status: 500,
        headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(request)
        }
    });
};

async function handleRequest(request, env) {
  const corsHeaders = getCorsHeaders(request);

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  // Generate JWT token endpoint
  if (path === "/generateJWTToken") {
    try {
      const token = await generateToken(env.VIDEOSDK_API_KEY, env.VIDEOSDK_SECRET_KEY);
      return new Response(JSON.stringify({
        token
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } catch (error) {
      return handleError(error, request);
    }
  }

  // REMOVED: /get-token endpoint for security
  // Token is now handled internally, never exposed to client

  // Handle meeting creation - token used internally
  if (path === "/create-meeting" || path === "/createMeeting") {
    try {
      // Create room in VideoSDK using internal token
      const token = await generateToken(env.VIDEOSDK_API_KEY, env.VIDEOSDK_SECRET_KEY);
      console.log('Generated token:', token);
      
      const response = await fetch(`${API_BASE_URL}/v2/rooms`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('VideoSDK API error:', errorText);
        throw new Error('Failed to create room: ' + response.status);
      }

      const data = await response.json();
      console.log('Room creation response:', data);
      
      if (!data.roomId) {
        throw new Error('No roomId in response');
      }

      // Get the request body if it exists
      let bookingId;
      try {
        const body = await request.json();
        bookingId = body.bookingId;
      } catch (e) {
        console.log('No booking ID provided');
      }

      // Update Supabase with room link if booking ID exists
      if (bookingId && data.roomId) {
        const supabaseEndpoint = 'https://pxwbumtpnzbbqzqhnsow.supabase.co/rest/v1/bookings';
        await fetch(`${supabaseEndpoint}?id=eq.${bookingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            room_link: data.roomId,
            meeting_status: 'ready'
          })
        });
      }

      // Return room data along with a token for joining
      const joinToken = await generateToken(env.VIDEOSDK_API_KEY, env.VIDEOSDK_SECRET_KEY);
      return new Response(JSON.stringify({
        roomId: data.roomId,
        token: joinToken
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } catch (error) {
      return handleError(error, request);
    }
  }

  // Handle meeting validation
  if (path === "/validate-meeting") {
    try {
      const { roomId } = await request.json();
      const token = await generateToken(env.VIDEOSDK_API_KEY, env.VIDEOSDK_SECRET_KEY);
      const response = await fetch(
        `${API_BASE_URL}/v2/rooms/validate/${roomId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      
      // Return validation result with a fresh token
      const validationToken = await generateToken(env.VIDEOSDK_API_KEY, env.VIDEOSDK_SECRET_KEY);
      return new Response(JSON.stringify({
        ...data,
        token: validationToken
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to validate meeting" }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }

  return new Response("Not found", { status: 404 });
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};