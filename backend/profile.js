/**
 * Cloudflare Worker: Portfolio Web Editor Backend
 * Handles GitHub integration for portfolio deployment with Supabase verification
 * 
 * Environment Variables (Secrets):
 * - EDITOR: GitHub Personal Access Token (PAT)
 *   Required scopes:
 *   - repo (full control of private repositories)
 *   - admin:repo_hook (read)
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_KEY: Supabase service role key
 */

export default {
    async fetch(request, env, ctx) {
        // Enable CORS
        if (request.method === 'OPTIONS') {
            return handleCORS();
        }

        const url = new URL(request.url);
        const pathname = url.pathname;

        try {
            if (pathname === '/save' && request.method === 'POST') {
                return await handleSave(request, env);
            } else if (pathname === '/profile' && request.method === 'GET') {
                return await handleProfile(request, env);
            } else {
                return new Response(JSON.stringify({ error: 'Not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
                });
            }
        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({ 
                error: error.message || 'Internal server error' 
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders() }
            });
        }
    }
};

/**
 * Handle POST /save - Lightweight gatekeeper only
 * Backend validates user and returns GitHub token + instructions
 * Frontend handles all GitHub operations
 */
async function handleSave(request, env) {
    try {
        const payload = await request.json();
        const { username } = payload;

        if (!username) {
            return errorResponse('Missing username', 400);
        }

        // Verify user exists in Supabase (only validation)
        const supabaseUser = await verifyUserInSupabase(username, env);
        if (!supabaseUser) {
            return errorResponse('User not found in system', 404);
        }

        const githubToken = env.EDITOR;
        if (!githubToken) {
            console.error('EDITOR token not configured');
            return errorResponse('Server configuration error', 500);
        }

        // Return token + instructions for frontend to execute
        return successResponse({
            success: true,
            authorization: {
                token: githubToken,
                repoUrl: `lawglitch-profiles/${username}`
            },
            instructions: {
                deleteAssets: true,
                updateIndexHtml: true,
                uploadImages: true
            }
        });
    } catch (error) {
        console.error('Save error:', error);
        return errorResponse(error.message || 'Failed to validate request', 500);
    }
}

/**
 * Handle GET /profile - Fetch current portfolio from GitHub
 */
async function handleProfile(request, env) {
    try {
        const url = new URL(request.url);
        const username = url.searchParams.get('username');

        if (!username) {
            return errorResponse('Missing username parameter', 400);
        }

        // Verify user exists in Supabase
        const supabaseUser = await verifyUserInSupabase(username, env);
        if (!supabaseUser) {
            return errorResponse('User not found in system', 404);
        }

        const githubToken = env.EDITOR;
        if (!githubToken) {
            console.error('EDITOR token not configured');
            return errorResponse('Server configuration error', 500);
        }

        // Fetch index.html from repo
        const repoUrl = `https://api.github.com/repos/lawglitch-profiles/${username}/contents/index.html`;
        const response = await fetch(repoUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3.raw',
                'User-Agent': 'LawGlitch-Editor'
            }
        });

        if (response.status === 404) {
            return errorResponse('Repository not found', 404);
        }

        if (!response.ok) {
            return errorResponse(`Failed to fetch portfolio: ${response.statusText}`, response.status);
        }

        const html = await response.text();
        return successResponse({ html });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return errorResponse(error.message || 'Failed to fetch profile', 500);
    }
}



/**
 * Verify user exists in Supabase
 */
async function verifyUserInSupabase(username, env) {
    try {
        const supabaseUrl = env.SUPABASE_URL;
        const supabaseKey = env.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase credentials not configured');
            return null;
        }

        const response = await fetch(
            `${supabaseUrl}/rest/v1/professionals?username=eq.${encodeURIComponent(username)}&select=*`,
            {
                method: 'GET',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            console.error('Supabase query failed:', response.statusText);
            return null;
        }

        const data = await response.json();
        return data && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('Supabase verification error:', error);
        return null;
    }
}

/**
 * Helper functions for responses
 */
function successResponse(data) {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders()
        }
    });
}

function errorResponse(message, status = 500) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders()
        }
    });
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
}

function handleCORS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders()
    });
}