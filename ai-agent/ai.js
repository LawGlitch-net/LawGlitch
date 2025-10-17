// AI Agent for Portfolio Editor
class PortfolioAI {
    constructor() {
        this.isActive = false;
        this.container = null;
        this.input = null;
        this.output = null;
        this.suggestions = [];
    }

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('AI container not found');
            return;
        }

        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-header">
                <h3>AI Assistant</h3>
                <button id="ai-toggle" class="ai-toggle-btn">💡</button>
            </div>
            <div class="ai-content" id="ai-content">
                <div class="ai-input-section">
                    <textarea id="ai-input" placeholder="Ask me to help with your portfolio..."></textarea>
                    <button id="ai-submit" class="ai-submit-btn">Send</button>
                </div>
                <div class="ai-output" id="ai-output">
                    <p class="ai-placeholder">Hi! I'm your portfolio assistant. I can help you:</p>
                    <ul class="ai-suggestions">
                        <li>• Generate HTML code for sections</li>
                        <li>• Suggest improvements to your content</li>
                        <li>• Help with styling and layout</li>
                        <li>• Provide portfolio templates</li>
                    </ul>
                </div>
            </div>
        `;

        this.input = document.getElementById('ai-input');
        this.output = document.getElementById('ai-output');
    }

    bindEvents() {
        const toggleBtn = document.getElementById('ai-toggle');
        const submitBtn = document.getElementById('ai-submit');
        const content = document.getElementById('ai-content');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.isActive = !this.isActive;
                content.style.display = this.isActive ? 'block' : 'none';
                toggleBtn.textContent = this.isActive ? '🔽' : '💡';
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmit());
        }

        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSubmit();
                }
            });
        }
    }

    async handleSubmit() {
        const query = this.input.value.trim();
        if (!query) return;

        // Add user message to output
        this.addMessage('user', query);
        this.input.value = '';

        // Show thinking indicator
        this.addMessage('ai', 'Thinking...', 'thinking');

        try {
            // Simulate AI response (replace with actual AI integration)
            const response = await this.generateResponse(query);
            this.updateLastMessage(response);
        } catch (error) {
            console.error('AI error:', error);
            this.updateLastMessage('Sorry, I encountered an error. Please try again.');
        }
    }

    addMessage(type, content, className = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type} ${className}`;
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        this.output.appendChild(messageDiv);
        this.output.scrollTop = this.output.scrollHeight;
    }

    updateLastMessage(content) {
        const messages = this.output.querySelectorAll('.ai-message');
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.classList.contains('thinking')) {
            lastMessage.innerHTML = `<div class="message-content">${content}</div>`;
            lastMessage.classList.remove('thinking');
        }
    }

    async generateResponse(query) {
        // This is a placeholder - replace with actual AI integration
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('html') || lowerQuery.includes('code')) {
            return this.generateHtmlSnippet(query);
        } else if (lowerQuery.includes('style') || lowerQuery.includes('css')) {
            return this.generateCssSuggestion(query);
        } else if (lowerQuery.includes('template') || lowerQuery.includes('example')) {
            return this.generateTemplate(query);
        } else {
            return `I can help you with HTML generation, styling suggestions, and portfolio templates. Try asking me to "generate an about section" or "create a contact form".`;
        }
    }

    generateHtmlSnippet(query) {
        if (query.toLowerCase().includes('about')) {
            return `<div class="about-section">
    <h2>About Me</h2>
    <p>I'm a professional with expertise in [your field]. I have [X years] of experience helping clients achieve their goals.</p>
    <p>My approach focuses on [key principles or methods]. I believe in [your philosophy or values].</p>
</div>`;
        } else if (query.toLowerCase().includes('contact')) {
            return `<div class="contact-section">
    <h2>Get In Touch</h2>
    <div class="contact-info">
        <p><strong>Email:</strong> your.email@example.com</p>
        <p><strong>Phone:</strong> (555) 123-4567</p>
        <p><strong>Location:</strong> Your City, State</p>
    </div>
    <div class="social-links">
        <a href="#">LinkedIn</a> | <a href="#">Twitter</a> | <a href="#">Website</a>
    </div>
</div>`;
        } else {
            return `<div class="custom-section">
    <h2>Your Section Title</h2>
    <p>Your content goes here. You can add images, links, and formatting as needed.</p>
</div>`;
        }
    }

    generateCssSuggestion(query) {
        return `.your-section {
    padding: 20px;
    margin: 20px 0;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.your-section h2 {
    color: #333;
    margin-bottom: 15px;
}

.your-section p {
    line-height: 1.6;
    color: #666;
}`;
    }

    generateTemplate(query) {
        return `<div class="portfolio-template">
    <header class="hero-section">
        <h1>Your Name</h1>
        <p class="tagline">Your Professional Title</p>
    </header>

    <section class="about-section">
        <h2>About</h2>
        <p>Tell your story here...</p>
    </section>

    <section class="services-section">
        <h2>Services</h2>
        <ul>
            <li>Service 1</li>
            <li>Service 2</li>
            <li>Service 3</li>
        </ul>
    </section>

    <section class="contact-section">
        <h2>Contact</h2>
        <p>Get in touch to discuss your project.</p>
    </section>
</div>`;
    }
}

// Initialize AI agent when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const aiAgent = new PortfolioAI();
    aiAgent.init('ai-container');
});
