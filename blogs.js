// Posts data
const posts = [
    {
        id: 1,
        author: "LegalEagle India",
        authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
        date: "July 30, 2025",
        text: "When the client says 'just make it work' without understanding the legal implications... 😅 #LawyerLife #IndianLawMemes",
        images: [
            "https://via.placeholder.com/600x400/1E1E1E/D4AF37?text=Legal+Meme+1",
            "https://via.placeholder.com/600x400/1E1E1E/D4AF37?text=Legal+Meme+2"
        ]
    },
    {
        id: 2,
        author: "Supreme Court Memes",
        authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
        date: "July 28, 2025",
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        text: "How I explain the difference between civil and criminal cases to my friends... 🤣 #LawStudentProblems"
    },
    {
        id: 3,
        author: "Bar Council Banter",
        authorImage: "https://randomuser.me/api/portraits/men/75.jpg",
        date: "July 25, 2025",
        text: "Just posted a new video about funny courtroom moments! Check it out!",
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
        id: 4,
        author: "IPC Jokes",
        authorImage: "https://randomuser.me/api/portraits/women/68.jpg",
        date: "July 20, 2025",
        text: "When you're trying to explain Section 420 IPC to non-lawyer friends and they just think you're talking about weed... 🌿 #IndianPenalCode #LawHumor"
    }
];

// Utility function to safely parse dates
function parseDate(dateString) {
    try {
        return new Date(dateString);
    } catch (e) {
        return new Date(); // Fallback to current date
    }
}

// Display posts in the feed
function displayPosts() {
    const contentFeed = document.getElementById('contentFeed');
    if (!contentFeed) {
        console.error('Content feed container not found');
        return;
    }

    // Clear existing content
    contentFeed.innerHTML = '';

    // Sort by date (newest first) with fallback for invalid dates
    const sortedPosts = [...posts].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA;
    });

    sortedPosts.forEach(post => {
        if (!post.id || !post.author || !post.date) {
            console.warn('Skipping invalid post:', post);
            return;
        }

        const postCard = document.createElement('div');
        postCard.className = 'post-card';

        // Build media content with safety checks
        let mediaContent = '';
        if (post.video) {
            try {
                const url = new URL(post.video);
                mediaContent = `
                    <div class="post-video">
                        <iframe src="${url.href}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                `;
            } catch (e) {
                console.error('Invalid video URL:', post.video);
            }
        } else if (post.images && post.images.length > 0) {
            const validImages = post.images.filter(img => {
                try {
                    new URL(img);
                    return true;
                } catch (e) {
                    console.error('Invalid image URL:', img);
                    return false;
                }
            });

            if (validImages.length > 0) {
                const imageClass = validImages.length > 2 ? 'grid-layout' : '';
                mediaContent = `
                    <div class="post-images ${imageClass}">
                        ${validImages.map(img => `
                            <img src="${img}" alt="Post image" class="post-image" onerror="this.style.display='none'">
                        `).join('')}
                    </div>
                `;
            }
        }

        // Safely escape text content
        const safeText = post.text ? post.text.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

        postCard.innerHTML = `
            <div class="post-header">
                <img src="${post.authorImage || 'https://via.placeholder.com/40'}" alt="${post.author}" class="author-avatar" onerror="this.src='https://via.placeholder.com/40'">
                <div class="post-author">
                    <span class="author-name">${post.author || 'Unknown Author'}</span>
                    <span class="post-date">${post.date || 'No date'}</span>
                </div>
            </div>
            <div class="post-text">${safeText}</div>
            ${mediaContent}
            <div class="post-actions">
                <button class="share-btn" data-id="${post.id}">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"></path>
                    </svg>
                    Share
                </button>
            </div>
        `;

        contentFeed.appendChild(postCard);
    });

    // Add event listeners to share buttons
    document.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', function() {
            const postId = parseInt(this.getAttribute('data-id'));
            if (!isNaN(postId)) {
                sharePost(postId);
            }
        });
    });
}

// Share post function
function sharePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        console.error('Post not found:', postId);
        return;
    }

    const postUrl = `${window.location.origin}${window.location.pathname}?post=${postId}`;
    
    // Modern clipboard API with fallback
    if (navigator.clipboard) {
        navigator.clipboard.writeText(postUrl).then(() => {
            showToast('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopyToClipboard(postUrl);
        });
    } else {
        fallbackCopyToClipboard(postUrl);
    }
}

// Fallback for older browsers
function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';  // Prevent scrolling to bottom
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('Link copied to clipboard!');
        } else {
            showToast('Press Ctrl+C to copy');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showToast('Failed to copy link');
    }
    
    document.body.removeChild(textarea);
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if content feed exists
    if (document.getElementById('contentFeed')) {
        displayPosts();
    } else {
        console.error('Content feed element not found');
    }
});

// Export for testing/module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        posts,
        displayPosts,
        sharePost
    };
}
