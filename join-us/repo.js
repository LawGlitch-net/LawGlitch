// Function to create GitHub profile repository independently (exported as ES module)
export async function createGitHubProfileRepo(username, email) {
    if (!username || !email) {
        console.warn('createGitHubProfileRepo called without username or email');
        return { success: false, error: 'Missing username or email' };
    }

    try {
        // Call the Supabase Edge Function
        const response = await fetch('https://pxwbumtpnzbbqzqhnsow.supabase.co/functions/v1/create-profile-repo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                record: {
                    username: username,
                    email: email,
                    repo_status: null,
                    repo: null
                }
            }),
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (response.ok) {
            console.log('GitHub Profile Repository function succeeded:', data);
            return { success: true, repo: data?.repo ?? null, data };
        } else {
            console.warn('Repository creation function returned non-OK:', response.status, data);
            return { success: false, status: response.status, data };
        }
    } catch (error) {
        console.error('Error creating GitHub profile repository:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
