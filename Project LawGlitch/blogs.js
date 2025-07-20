// Blog data
const blogs = [
    {
        id: 1,
        title: "Understanding Corporate Law in the Middle East",
        excerpt: "A comprehensive guide to navigating corporate legal structures in Middle Eastern countries.",
        content: "<p>Corporate law in the Middle East has evolved significantly over the past decade, with many countries modernizing their legal frameworks to attract foreign investment. This article explores the key aspects of corporate law in major Middle Eastern jurisdictions including Iraq, UAE, and Saudi Arabia.</p><p>One of the most significant developments has been the introduction of free zones with 100% foreign ownership in the UAE. These zones offer tax exemptions and full repatriation of profits, making them attractive for international businesses.</p><p>In Iraq, the legal system is undergoing reforms to align with international standards, particularly in areas of contract enforcement and dispute resolution. Understanding these changes is crucial for businesses operating in the region.</p>",
        image: "https://via.placeholder.com/800x400/1E1E1E/D4AF37?text=Corporate+Law",
        author: "Ahmed Al-Mansoori",
        authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
        date: "June 15, 2025"
    },
    {
        id: 2,
        title: "Tax Planning Strategies for 2025",
        excerpt: "Effective tax planning techniques to optimize your financial position in the coming year.",
        content: "<p>With changing tax regulations across the Middle East, it's essential to stay informed about new opportunities for tax optimization. This article covers key strategies for individuals and businesses.</p><p>One effective approach is taking advantage of tax treaties between Middle Eastern countries and other jurisdictions. These treaties can help reduce withholding taxes on dividends, interest, and royalties.</p><p>For businesses, structuring operations through free zones can provide significant tax benefits. Many free zones offer corporate tax holidays for periods of 15-50 years, along with exemptions from import/export duties.</p>",
        image: "https://via.placeholder.com/800x400/1E1E1E/D4AF37?text=Tax+Planning",
        author: "Nadia Salem",
        authorImage: "https://randomuser.me/api/portraits/women/68.jpg",
        date: "May 28, 2025"
    },
    {
        id: 3,
        title: "Investment Trends in the Gulf Region",
        excerpt: "Analyzing the most promising sectors for investment in 2025 and beyond.",
        content: "<p>The Gulf region continues to offer attractive investment opportunities across various sectors. This article highlights the most promising areas for investors in 2025.</p><p>Renewable energy is one of the fastest-growing sectors, with Saudi Arabia's NEOM project and UAE's Masdar City leading the way. These mega-projects are creating opportunities in solar, wind, and hydrogen energy.</p><p>Technology is another key sector, with governments investing heavily in digital transformation. Fintech, e-commerce, and AI startups are particularly well-positioned to benefit from these initiatives.</p><p>Finally, healthcare and education remain strong sectors as populations grow and demand for quality services increases.</p>",
        image: "https://via.placeholder.com/800x400/1E1E1E/D4AF37?text=Investment+Trends",
        author: "Fatima Al-Hashimi",
        authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
        date: "April 10, 2025"
    }
];

// Display blogs in the grid
function displayBlogs() {
    const blogsGrid = document.getElementById('blogsGrid');
    blogsGrid.innerHTML = '';
    
    blogs.forEach(blog => {
        const blogCard = document.createElement('div');
        blogCard.className = 'blog-card';
        
        blogCard.innerHTML = `
            <img src="${blog.image}" alt="${blog.title}" class="blog-image">
            <div class="blog-content">
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${blog.excerpt}</p>
                <div class="blog-author">
                    <img src="${blog.authorImage}" alt="${blog.author}" class="author-avatar">
                    <span class="author-name">Posted by ${blog.author} • ${blog.date}</span>
                </div>
                <span class="read-more" data-id="${blog.id}">Read More →</span>
            </div>
        `;
        
        blogsGrid.appendChild(blogCard);
    });
    
    // Add event listeners to read more buttons
    document.querySelectorAll('.read-more').forEach(button => {
        button.addEventListener('click', function() {
            const blogId = parseInt(this.getAttribute('data-id'));
            openBlogModal(blogId);
        });
    });
}

// Open blog modal
function openBlogModal(blogId) {
    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;
    
    document.getElementById('modalImage').src = blog.image;
    document.getElementById('modalTitle').textContent = blog.title;
    document.getElementById('modalAuthorImg').src = blog.authorImage;
    document.getElementById('modalAuthorName').textContent = `By ${blog.author} • ${blog.date}`;
    document.getElementById('modalText').innerHTML = blog.content;
    
    const modal = document.getElementById('blogModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close blog modal
function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Initialize blogs
document.addEventListener('DOMContentLoaded', () => {
    displayBlogs();
    
    // Close modal when clicking X
    document.getElementById('closeModal').addEventListener('click', closeBlogModal);
    
    // Close modal when clicking outside content
    document.getElementById('blogModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeBlogModal();
        }
    });
});