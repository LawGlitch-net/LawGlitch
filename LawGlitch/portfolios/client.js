/**
 * Portfolio Client Module
 * Fetches portfolio from GitHub and displays it with images from assets folder
 */

export async function fetchAndDisplayPortfolio(containerId = null) {
    try {
        const username = localStorage.getItem('username');
        
        if (!username) {
            console.warn('Username not found in localStorage');
            if (containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #c33; background: #fee; border-radius: 6px;">Error: Username not found. Please log in first.</div>';
                }
            }
            return null;
        }

        // Fetch portfolio from backend
        const response = await fetch(`https://webedit.lawglitch.workers.dev/profile?username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch portfolio (HTTP ${response.status})`);
        }

        const data = await response.json();
        
        if (!data.html) {
            throw new Error('No portfolio found');
        }

        return {
            html: data.html,
            username: username
        };
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return null;
    }
}

export async function fetchAssetsFromGitHub(username) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/lawglitch-profiles/${username}/contents/assets`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'LawGlitch-Client'
                }
            }
        );

        if (!response.ok) {
            console.warn('Assets folder not found or empty');
            return [];
        }

        const files = await response.json();
        
        if (!Array.isArray(files)) {
            return [];
        }

        // Filter for image files and map to raw URLs
        return files
            .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name))
            .map(file => ({
                name: file.name,
                url: `https://raw.githubusercontent.com/lawglitch-profiles/${username}/main/assets/${file.name}`,
                path: file.path
            }));
    } catch (error) {
        console.error('Error fetching assets:', error);
        return [];
    }
}

export function displayPortfolioInContainer(html, containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = html;
    }
}

export function replaceImagesInDOM(imageMap) {
    // Replace all img elements with src attributes that match pattern
    const images = document.querySelectorAll('img[src]');
    images.forEach((img, index) => {
        const key = `img${index + 1}.png`;
        if (imageMap[key]) {
            img.src = imageMap[key];
        }
    });
}