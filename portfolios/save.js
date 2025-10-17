/**
 * Portfolio Save Module
 * Handles HTML validation and secure deployment to GitHub via Cloudflare Worker
 */

/**
 * Validate that the HTML contains a booking iframe
 * @param {string} html - The HTML to validate
 * @returns {boolean} - True if valid booking iframe found
 */
export function validateBookingIframe(html) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        if (doc.body) {
            const iframes = doc.body.querySelectorAll('iframe');
            for (const iframe of iframes) {
                const src = iframe.getAttribute('src') || '';
                if (src.includes('book') || src.includes('booking')) {
                    return true;
                }
            }
        }
        return false;
    } catch (err) {
        console.error('Error validating booking iframe:', err);
        return false;
    }
}

/**
 * Validate external links in HTML against whitelist
 * @param {string} html - The HTML to validate
 * @returns {object} - { valid: true } or { valid: false, unauthorizedLinks: [array] }
 */
export function validateExternalLinks(html) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Whitelisted domains
        const whitelist = [
            'youtube.com',
            'youtu.be',
            'google.com/maps',
            'instagram.com',
            'facebook.com',
            'x.com',
            'linkedin.com',
            'lawglitch.com',
            'lawglitch.in'
        ];
        
        const unauthorizedLinks = [];
        
        if (doc.body) {
            const links = doc.body.querySelectorAll('a[href]');
            for (const link of links) {
                const href = link.getAttribute('href') || '';
                
                // Allow mailto, internal paths, and fragments
                if (href.startsWith('mailto:') || href.startsWith('/') || href.startsWith('#')) {
                    continue;
                }
                
                // Check if external link is whitelisted
                let isWhitelisted = false;
                for (const domain of whitelist) {
                    if (href.includes(domain)) {
                        isWhitelisted = true;
                        break;
                    }
                }
                
                if (!isWhitelisted && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('www.'))) {
                    unauthorizedLinks.push(href);
                }
            }
        }
        
        if (unauthorizedLinks.length > 0) {
            return {
                valid: false,
                unauthorizedLinks: unauthorizedLinks
            };
        }
        
        return { valid: true };
    } catch (err) {
        console.error('Error validating external links:', err);
        return { valid: false, unauthorizedLinks: ['Error parsing HTML for links'] };
    }
}

/**
 * Extract all images from HTML and retrieve their data from IndexedDB
 * @param {string} html - HTML content
 * @returns {Promise<Array>} - Array of base64 image strings
 */
async function extractImagesFromHTML(html) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const images = [];
        
        // Find all img tags with src wrapped in [[[...]]]
        const imgElements = doc.querySelectorAll('img');
        console.log(`🔍 Found ${imgElements.length} total img tags in HTML`);
        
        let markedImages = 0;
        for (const img of imgElements) {
            const src = img.getAttribute('src') || '';
            console.log(`  - img src: ${src.substring(0, 100)}`);
            
            // Check if src is wrapped in [[[...]]]
            if (src.startsWith('[[[') && src.endsWith(']]]')) {
                markedImages++;
                const imageName = src.slice(3, -3); // Remove [[[...]]]
                console.log(`    ✓ Found marked image: ${imageName}`);
                
                // Try to retrieve from IndexedDB
                const imageData = await getImageFromIndexedDB(imageName);
                if (imageData) {
                    console.log(`    ✓ Retrieved from IndexedDB: ${imageName} (${imageData.length} bytes)`);
                    images.push(imageData);
                } else {
                    console.warn(`    ✗ Failed to retrieve from IndexedDB: ${imageName}`);
                }
            }
        }
        
        console.log(`🎯 Extraction complete: ${markedImages} marked images found, ${images.length} successfully retrieved`);
        return images;
    } catch (error) {
        console.warn('Error extracting images from HTML:', error);
        return [];
    }
}

/**
 * Retrieve image data from IndexedDB
 * @param {string} imageName - Image identifier (e.g., "assets/img1.png")
 * @returns {Promise<string|null>} - Base64 image string or null
 */
async function getImageFromIndexedDB(imageName) {
    return new Promise((resolve) => {
        try {
            // Open the correct uploader database
            const request = indexedDB.open('portfolioUploaderDB', 1);
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                
                // Get from images store using the path as key
                if (db.objectStoreNames.contains('images')) {
                    const transaction = db.transaction('images', 'readonly');
                    const store = transaction.objectStore('images');
                    const imageRequest = store.get(imageName);
                    
                    imageRequest.onsuccess = () => {
                        const imageData = imageRequest.result;
                        // The uploader stores as {path, dataUrl}
                        resolve(imageData?.dataUrl || null);
                    };
                    
                    imageRequest.onerror = () => resolve(null);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => resolve(null);
        } catch (error) {
            console.warn('Error retrieving image from IndexedDB:', error);
            resolve(null);
        }
    });
}

/**
 * Replace <body>...</body> content in HTML
 */
function replaceBodyContent(originalHtml, newBodyContent) {
    const bodyStartMatch = originalHtml.match(/<body[^>]*>/i);
    if (!bodyStartMatch) {
        return newBodyContent;
    }
    const headContent = originalHtml.substring(0, bodyStartMatch.index + bodyStartMatch[0].length);
    const footerMatch = originalHtml.match(/<\/body>/i);
    const footerContent = footerMatch ? originalHtml.substring(footerMatch.index) : '</body>';
    return headContent + newBodyContent + footerContent;
}

/**
 * Delete assets folder from GitHub repo (client-side)
 */
async function deleteAssets(username, token) {
    try {
        const baseUrl = `https://api.github.com/repos/lawglitch-profiles/${username}/contents/assets`;

        // Try to get the assets folder contents (with retries)
        let listResponse = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'LawGlitch-Editor'
            }
        });

        if (listResponse.status === 404) {
            console.log('Assets folder not found, nothing to delete');
            return true;
        }

        if (!listResponse.ok) {
            console.warn(`Failed to list assets folder (HTTP ${listResponse.status})`);
            return false;
        }

        const files = await listResponse.json();
        let deletedCount = 0;
        const failedDeletes = [];
        
        // Delete each file in the assets folder sequentially
        if (Array.isArray(files)) {
            for (const file of files) {
                if (file.type === 'file') {
                    const deleteResponse = await fetch(file.url, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'LawGlitch-Editor'
                        },
                        body: JSON.stringify({
                            message: 'Delete old assets on portfolio update',
                            sha: file.sha
                        })
                    });

                    if (deleteResponse.ok) {
                        deletedCount++;
                        console.log(`✓ Deleted ${file.name}`);
                    } else {
                        console.warn(`✗ Failed to delete ${file.name} (HTTP ${deleteResponse.status})`);
                        failedDeletes.push(file.name);
                    }
                    
                    // Small delay between deletes to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 150));
                }
            }
            console.log(`✓ Deleted ${deletedCount} asset files${failedDeletes.length > 0 ? `, ${failedDeletes.length} failed` : ''}`);
        }
        
        // After deleting files, wait longer for GitHub to fully process
        console.log('⏳ Waiting for GitHub to process deletions...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return failedDeletes.length === 0;
    } catch (error) {
        console.error('❌ Assets deletion error:', error);
        return false;
    }
}

/**
 * Upload images to GitHub repo /assets folder (client-side)
 */
async function uploadImages(username, token, images) {
    try {
        if (!images || images.length === 0) {
            console.log('No images to upload');
            return true;
        }

        const baseUrl = `https://api.github.com/repos/lawglitch-profiles/${username}/contents/assets`;

        // Step 1: Ensure assets folder exists by creating .gitkeep
        console.log('📍 Ensuring assets folder exists...');
        const gitkeepPath = `${baseUrl}/.gitkeep`;
        const gitkeepResponse = await fetch(gitkeepPath, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'LawGlitch-Editor'
            },
            body: JSON.stringify({
                message: 'Initialize/refresh assets folder',
                content: btoa('') // Empty file
            })
        });

        if (!gitkeepResponse.ok) {
            console.warn(`⚠️  Warning creating/updating .gitkeep (HTTP ${gitkeepResponse.status})`);
            // Don't fail on this, continue anyway
        } else {
            console.log('✓ Assets folder initialized');
        }

        // Step 2: Wait for GitHub to process the .gitkeep file
        console.log('⏳ Waiting for GitHub to process folder structure...');
        await new Promise(resolve => setTimeout(resolve, 800));

        // Step 3: Upload each image sequentially with proper naming
        let uploadedCount = 0;
        const failedImages = [];
        
        console.log(`📊 Starting upload of ${images.length} images...`);
        for (let i = 0; i < images.length; i++) {
            const imageData = images[i];
            if (!imageData) {
                console.warn(`⚠️  Image ${i + 1} is empty or null, skipping`);
                continue;
            }
            
            let base64Content = imageData;

            // If it's a data URL, extract the base64 part
            if (imageData.startsWith('data:')) {
                base64Content = imageData.split(',')[1];
            }

            const filename = `img${i + 1}.png`;
            const filePath = `${baseUrl}/${filename}`;

            console.log(`📤 Uploading image ${i + 1}/${images.length}: ${filename} (${base64Content?.length || 0} bytes)...`);

            const uploadResponse = await fetch(filePath, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'LawGlitch-Editor'
                },
                body: JSON.stringify({
                    message: `Add/update image ${filename}`,
                    content: base64Content
                })
            });

            console.log(`📍 Response status for ${filename}: ${uploadResponse.status}`);
            
            if (uploadResponse.ok) {
                uploadedCount++;
                console.log(`✓ Successfully uploaded ${filename}`);
            } else {
                const errorText = await uploadResponse.text();
                console.error(`✗ Failed to upload ${filename} (HTTP ${uploadResponse.status}):`, errorText);
                failedImages.push(filename);
            }
            
            // Delay between uploads to avoid rate limiting
            if (i < images.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        console.log(`✓ Uploaded ${uploadedCount}/${images.length} images${failedImages.length > 0 ? `, ${failedImages.length} failed` : ''}`);
        return uploadedCount === images.length; // Only return true if ALL images uploaded
    } catch (error) {
        console.error('❌ Image upload error:', error);
        return false;
    }
}

/**
 * Update index.html on GitHub (client-side)
 */
async function updateIndexHtml(username, token, htmlToSave) {
    try {
        const repoUrl = `https://api.github.com/repos/lawglitch-profiles/${username}/contents/index.html`;

        // Get current file SHA
        const metaResponse = await fetch(repoUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'LawGlitch-Editor'
            }
        });

        if (!metaResponse.ok) {
            console.error('Failed to get current index.html metadata');
            return false;
        }

        const metaData = await metaResponse.json();
        
        // Get current HTML to preserve head section
        const currentResponse = await fetch(repoUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3.raw',
                'User-Agent': 'LawGlitch-Editor'
            }
        });

        const currentHtml = await currentResponse.text();
        const updatedHtml = replaceBodyContent(currentHtml, htmlToSave);

        // Prepare and send update
        const timestamp = new Date().toISOString();
        const commitMessage = `Updated portfolio via LawGlitch Web Editor - ${timestamp}`;
        const base64Content = btoa(unescape(encodeURIComponent(updatedHtml)));

        const updateResponse = await fetch(repoUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'LawGlitch-Editor'
            },
            body: JSON.stringify({
                message: commitMessage,
                content: base64Content,
                sha: metaData.sha,
                branch: 'main'
            })
        });

        if (!updateResponse.ok) {
            console.error('Failed to update index.html');
            return false;
        }

        const result = await updateResponse.json();
        console.log(`Portfolio updated: ${result.commit.html_url}`);
        return { success: true, commitUrl: result.commit.html_url };
    } catch (error) {
        console.error('Error updating index.html:', error);
        return false;
    }
}

/**
 * Save portfolio to GitHub - Client-side orchestration
 * @param {string} username - GitHub username
 * @param {object} portfolioData - Portfolio data object
 * @param {string} htmlToSave - HTML content to save
 * @returns {object} - { success: true, commitUrl? } or throws error
 */
export async function savePortfolio(username, portfolioData, htmlToSave) {
    try {
        // Step 1: Validate user with backend (get GitHub token + instructions)
        console.log('📍 Step 1: Validating with backend...');
        const validationResponse = await fetch('https://webedit.lawglitch.workers.dev/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (!validationResponse.ok) {
            const errorData = await validationResponse.json().catch(() => ({}));
            throw new Error(errorData.error || `Validation failed: HTTP ${validationResponse.status}`);
        }

        const authData = await validationResponse.json();
        const token = authData.authorization.token;
        const instructions = authData.instructions;

        console.log('✓ Backend validation passed, token received');

        // Step 2: Extract images from HTML
        console.log('📍 Step 2: Extracting images from HTML...');
        const images = await extractImagesFromHTML(htmlToSave);
        console.log(`✓ Found ${images.length} images to upload`);
        if (images.length > 0) {
            console.log('📊 Image data sample:', {
                count: images.length,
                firstImageLength: images[0]?.length || 0,
                firstImagePrefix: images[0]?.substring(0, 50) || 'N/A'
            });
        }

        // Step 3: Delete old assets if instructed
        if (instructions.deleteAssets) {
            console.log('📍 Step 3: Deleting old assets...');
            const deleteSuccess = await deleteAssets(username, token);
            if (!deleteSuccess) {
                console.warn('⚠️  Asset deletion had some failures, but continuing...');
            } else {
                console.log('✓ Asset deletion completed successfully');
            }
        }

        // Step 4: Upload new images if instructed
        if (instructions.uploadImages && images.length > 0) {
            console.log('📍 Step 4: Uploading new images...');
            const uploadSuccess = await uploadImages(username, token, images);
            if (!uploadSuccess) {
                console.warn('⚠️  Some images failed to upload, but continuing with portfolio update...');
            } else {
                console.log('✓ All images uploaded successfully');
            }
        } else if (instructions.uploadImages) {
            console.log('📍 Step 4: No images to upload, ensuring assets folder is clean...');
            // Still ensure assets folder exists even if no images
            const baseUrl = `https://api.github.com/repos/lawglitch-profiles/${username}/contents/assets`;
            const gitkeepPath = `${baseUrl}/.gitkeep`;
            await fetch(gitkeepPath, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'LawGlitch-Editor'
                },
                body: JSON.stringify({
                    message: 'Initialize assets folder',
                    content: btoa('')
                })
            }).catch(e => console.warn('Could not ensure assets folder:', e));
        }

        // Step 5: Update index.html if instructed
        if (instructions.updateIndexHtml) {
            console.log('📍 Step 5: Updating index.html...');
            const result = await updateIndexHtml(username, token, htmlToSave);
            if (!result) {
                throw new Error('Failed to update portfolio');
            }
            console.log('✓ Portfolio saved successfully!');
            return result;
        }

        throw new Error('No update instruction received from backend');
    } catch (error) {
        console.error('❌ Error saving portfolio:', error);
        throw error;
    }
}

/**
 * Load portfolio data from GitHub via Cloudflare Worker
 * This is primarily used by the template viewer
 * @param {string} username - GitHub username
 * @returns {object} - { html: string } or throws error
 */
export async function loadPortfolioData(username) {
    try {
        const response = await fetch(`https://webedit.lawglitch.workers.dev/profile?username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        throw error;
    }
}