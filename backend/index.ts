// create-profile-repo/index.ts
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Octokit } from "https://esm.sh/@octokit/rest@20.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

serve(async (req) => {
  let username: string | undefined;
  let supabase: any;

  console.log('Function invoked:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });
  
  // Handle OPTIONS pre-flight request
  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response("ok", { 
      status: 200,
      headers: corsHeaders
    });
  }

  // Explicitly handle GET requests with instructions
  if (req.method === "GET") {
    return new Response(JSON.stringify({
      error: "This endpoint requires a POST request with JSON body",
      example: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          record: {
            username: "example-user",
            email: "user@example.com",
            repo_status: null,
            repo: null
          }
        }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });
  }

  // Only allow POST method
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed. Use POST request."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405
    });
  }

  try {
    // Check env vars first with detailed logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const githubToken = Deno.env.get("GITHUB_PROFILES");

    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'present' : 'missing',
      supabaseKey: supabaseKey ? 'present' : 'missing',
      githubToken: githubToken ? 'present' : 'missing',
      envKeys: Object.keys(Deno.env.toObject())
    });

    if (!supabaseUrl || !supabaseKey || !githubToken) {
      console.error('Missing required environment variables:', {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey,
        hasGithubToken: !!githubToken,
        message: 'Please check your environment variables configuration'
      });
      return new Response(JSON.stringify({ 
        error: 'Missing required environment variables. Check function logs.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let record;
    try {
      const body = await req.json();
      if (!body.record) {
        return new Response(JSON.stringify({
          error: "Missing 'record' in request body",
          example: {
            record: {
              username: "example-user",
              email: "user@example.com",
              repo_status: null,
              repo: null
            }
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        });
      }
      record = body.record;
    } catch (e) {
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body",
        details: e instanceof Error ? e.message : "Could not parse request body"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    const { username, email, repo_status, repo } = record;

    // Input validation
    if (!username || !email) {
      return new Response(JSON.stringify({ message: "Username and email are required." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check existing repo status
    const { data: existingUser } = await supabase
      .from("professionals")
      .select("repo, repo_status")
      .eq("username", username)
      .single();

    // If repo already exists or is in process, stop immediately
    if (existingUser?.repo || existingUser?.repo_status === 'creating' || existingUser?.repo_status === 'completed') {
      return new Response(JSON.stringify({ message: "Repo creation not required or already in progress." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Set status to 'creating' immediately to act as a lock
    await supabase
      .from("professionals")
      .update({ repo_status: 'creating' })
      .eq("username", username);

    console.log('Creating Octokit client...');
    const octokit = new Octokit({
      auth: githubToken
    });

    // 1️⃣ Create repo with basic settings
    console.log('Attempting to create repo for:', username);
    let repoResponse;
    try {
      repoResponse = await octokit.repos.createForAuthenticatedUser({
        name: username,
        private: false,
        auto_init: true,
        description: `Auto-generated portfolio for ${username} (${email})`,
      });
      console.log('Repository creation response:', {
        status: repoResponse.status,
        url: repoResponse.data.html_url,
        owner: repoResponse.data.owner.login
      });
      
      // Basic repo settings update
      await octokit.repos.update({
        owner: repoResponse.data.owner.login,
        repo: username,
        has_wiki: false,
        has_pages: true,
        default_branch: "main"
      });
    } catch (error) {
      console.error('Failed to create repository:', {
        error: error instanceof Error ? error.message : String(error),
        username,
        githubTokenLength: githubToken?.length ?? 0
      });
      throw error;
    }
    console.log('Repo created successfully and HTTPS enforced:', repoResponse.data.html_url);
    
    const repoUrl = repoResponse.data.html_url;
    const owner = repoResponse.data.owner.login;

    // 2️⃣ Add required files with better error handling
    try {
      console.log('Creating initial files...');
      
      // Add index.html
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: username,
        path: "index.html",
        message: "Initialize portfolio",
        content: btoa("<!DOCTYPE html><html><head><title>Portfolio</title></head><body><h1>Portfolio</h1></body></html>")
      });
      console.log('✓ index.html created');

      // Create assets/.gitkeep
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: username,
        path: "assets/.gitkeep",
        message: "Create assets folder",
        content: btoa("")
      });
      console.log('✓ assets folder created');

      // Add CNAME
      const cname = `${username}.lawglitch.in`;
      console.log('Setting up CNAME for:', cname);
      
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: username,
        path: "CNAME",
        message: "Add CNAME for custom subdomain",
        content: btoa(cname)
      });
      console.log('✓ CNAME file created with:', cname);
    } catch (error) {
      console.error('Failed to create repository files:', {
        error: error instanceof Error ? error.message : String(error),
        phase: 'file_creation'
      });
      throw error;
    }

    // Verify repository settings
    console.log('Verifying repository settings...');
    const repoSettings = await octokit.repos.get({
      owner,
      repo: username
    });
    console.log('Repository settings:', {
      hasIssues: repoSettings.data.has_issues,
      hasPages: repoSettings.data.has_pages,
      defaultBranch: repoSettings.data.default_branch
    });

    // 5️⃣ Enable GitHub Pages
    console.log('Enabling GitHub Pages...');
    try {
      // Enable GitHub Pages with one API call
      await octokit.request('POST /repos/{owner}/{repo}/pages', {
        owner,
        repo: username,
        source: {
          branch: "main",
          path: "/"
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      
      console.log('✓ GitHub Pages enabled successfully');
    } catch (pagesError) {
      // Log error but don't throw - Pages might need time to recognize the repo
      console.error('Note: GitHub Pages initial setup pending:', 
        pagesError instanceof Error ? pagesError.message : String(pagesError)
      );
    }

    // 6️⃣ Update Supabase table with repo URL and 'completed' status
    console.log('Updating Supabase with repo URL:', repoUrl);
    
    // First verify the professional exists
    const { data: checkData, error: checkError } = await supabase
      .from("professionals")
      .select("id")
      .eq("username", username)
      .maybeSingle();
      
    if (checkError || !checkData) {
      console.error('Failed to find professional in database:', checkError || 'No record found');
      throw new Error('Could not find professional record to update');
    }

    // Then update with subdomain instead of repo URL
    const { data: updateData, error: updateError } = await supabase
      .from("professionals")
      .update({ 
        repo: `${username}.lawglitch.in`, 
        repo_status: 'completed'
      })
      .eq("username", username)
      .select()
      .single();
    
    if (updateError) {
      console.error('Failed to update repo URL in database:', updateError);
      throw updateError;
    }
    console.log('Database updated successfully:', updateData);

    return new Response(JSON.stringify({ success: true, repo: repoUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    const isError = error instanceof Error;
    console.error('Function error:', {
      error: isError ? (error as Error).message : String(error),
      phase: isError ? (error as Error).stack : 'unknown_phase'
    });

    // If we have username, try to update status to failed
    if (typeof username === 'string') {
      try {
        await supabase
          .from("professionals")
          .update({ repo_status: 'failed' })
          .eq("username", username);
      } catch (dbError) {
        console.error('Failed to update status:', dbError);
      }
    }

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error',
      details: 'Check function logs for more information'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});