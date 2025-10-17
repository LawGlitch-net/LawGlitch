// Portfolio Template Editor
// Handles template selection, customization, and real-time preview

import { createSupabaseClient } from '../join-us/config.js';

class PortfolioEditor {
    constructor() {
        this.currentTemplate = null;
        this.userData = {
            personal: {},
            expertise: [],
            experience: [],
            education: [],
            colors: {}
        };
        this.templates = {};
        this.isEditing = false;
        this.supabase = createSupabaseClient();
        
        this.initialize();
    }

    async initialize() {
        await this.loadTemplates();
        this.renderTemplateSelector();
        this.setupEventListeners();
        this.setupColorPickers();
        this.showTemplateSelection(); // Show template selection initially
    }

    getCurrentUsername() {
        const username = localStorage.getItem('username') || 'testuser';
        console.log('getCurrentUsername: ', username);
        return username; 
    }

    async loadTemplates() {
        try {
            // Load template 1
            const template1Response = await fetch('./professional-template.html');
            const template1Html = await template1Response.text();
            this.templates['template1'] = {
                name: 'Classic Professional',
                html: template1Html,
                colors: {
                    primary: '#1B2B4D',
                    secondary: '#C9A961',
                    accent: '#A4884A',
                    background: '#FAF8F3'
                }
            };

            // Load template 2
            const template2Response = await fetch('./professional-template2.html');
            const template2Html = await template2Response.text();
            this.templates['template2'] = {
                name: 'Modern Elegant',
                html: template2Html,
                colors: {
                    primary: '#2D1B2E',
                    secondary: '#C9A961',
                    accent: '#A4884A',
                    background: '#FAF8F3'
                }
            };

            // Load template 3
            const template3Response = await fetch('./professional-template3.html');
            const template3Html = await template3Response.text();
            this.templates['template3'] = {
                name: 'Corporate Navy',
                html: template3Html,
                colors: {
                    primary: '#0A1931',
                    secondary: '#C9A961',
                    accent: '#A4884A',
                    background: '#FAF8F3'
                }
            };
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    renderTemplateSelector() {
        const templateSelector = document.getElementById('template-selector');
        if (!templateSelector) return;

        templateSelector.innerHTML = `
            <h3>Choose a Template</h3>
            <div class="template-buttons">
                ${Object.entries(this.templates).map(([id, template]) => `
                    <button class="template-btn" data-template="${id}">
                        ${template.name}
                    </button>
                `).join('')}
            </div>
        `;
    }

    async selectTemplate(templateId) {
        console.log('Selecting template:', templateId);
        this.currentTemplate = this.templates[templateId];
        this.isEditing = true;

        try {
            // Fetch complete profile data from Supabase
            const { data, error } = await this.supabase
                .from('professionals')
                .select('*')
                .eq('username', this.getCurrentUsername())
                .single();

            if (error) {
                console.error('Supabase fetch error:', error);
                this.showNotification('Error fetching profile data', 'error');
                return;
            }

            console.log('Fetched Supabase data:', data);

            // Set template colors
            this.userData.colors = this.currentTemplate.colors;

            // Set user data from fetched data
            this.userData.username = data.username;
            this.userData.email = data.email;
            this.userData.name = data.username; // For form compatibility

            // Display portfolio content
            const portfolioText = this.currentTemplate.html;
            this.displayCodeContent(portfolioText); // This updates the code-editor textarea
            
            this.renderEditorForm(); // Render form first to ensure textarea exists

            const portfolioTextarea = document.getElementById('portfolio-content');
            if (portfolioTextarea) {
                portfolioTextarea.value = portfolioText;
            }

            this.updatePreview(portfolioText); // Pass processed HTML to updatePreview
            this.showEditor();
            
            // Ensure template selector remains accessible
            document.getElementById('template-selector').classList.remove('hidden');

            this.showNotification('Template loaded successfully!', 'success');
        } catch (error) {
            console.error('Error selecting template:', error);
            this.showNotification('Error loading template. Please try again.', 'error');
        }
    }

    setupEventListeners() {
        const templateButtons = document.querySelectorAll('.template-btn');
        templateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const templateId = e.currentTarget.getAttribute('data-template');
                this.selectTemplate(templateId);
            });
        });

        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.savePortfolio());
        }

        const previewBtn = document.getElementById('preview-btn');
        const codeBtn = document.getElementById('code-btn');
        if (previewBtn && codeBtn) {
            previewBtn.addEventListener('click', () => {
                previewBtn.classList.add('active');
                codeBtn.classList.remove('active');
                document.getElementById('canvas-content').classList.remove('hidden');
                document.getElementById('code-content').classList.add('hidden');
                this.updatePreview();
            });
            codeBtn.addEventListener('click', async () => {
                codeBtn.classList.add('active');
                previewBtn.classList.remove('active');
                document.getElementById('canvas-content').classList.add('hidden');
                document.getElementById('code-content').classList.remove('hidden');
                await this.fetchAndDisplayPortfolioText();
            });
        }

        const colorPickers = document.querySelectorAll('.color-picker');
        colorPickers.forEach(picker => {
            picker.addEventListener('input', (e) => this.handleColorChange(e));
        });
    }

    displayCodeContent(content) {
        const codeContent = document.getElementById('code-content');
        const codeEditor = codeContent?.querySelector('.code-editor');
        if (codeEditor) {
            codeEditor.value = content;
            // Add input listener to update preview live
            codeEditor.addEventListener('input', () => {
                this.updatePreview();
            });
        }
    }

    getCodeContent() {
        const codeContent = document.getElementById('code-content');
        const codeEditor = codeContent?.querySelector('.code-editor');
        return codeEditor ? codeEditor.value : '';
    }

    renderEditorForm() {
        const editorForm = document.getElementById('editor-form');
        if (!editorForm) return;

        // Clear existing content
        editorForm.innerHTML = '';

        // Create form fields based on userData
        const fields = [
            { label: 'Name', id: 'name', type: 'text' },
            { label: 'Professional Title', id: 'profession', type: 'text' },
            { label: 'Location', id: 'location', type: 'text' },
            { label: 'Email', id: 'email', type: 'email' },
            { label: 'About', id: 'about', type: 'textarea' }
        ];

        fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'form-field';

            const label = document.createElement('label');
            label.setAttribute('for', field.id);
            label.innerText = field.label;
            fieldDiv.appendChild(label);

            let input;
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.className = 'form-control';
                input.rows = 4;
            } else {
                input = document.createElement('input');
                input.className = 'form-control';
                input.type = field.type;
            }
            input.id = field.id;
            input.value = this.userData[field.id] || '';
            fieldDiv.appendChild(input);

            editorForm.appendChild(fieldDiv);
        });

        // Add color pickers
        const colorFields = [
            { label: 'Primary Color', id: 'primary' },
            { label: 'Secondary Color', id: 'secondary' },
            { label: 'Accent Color', id: 'accent' },
            { label: 'Background Color', id: 'background' }
        ];

        colorFields.forEach(colorField => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'form-field';

            const label = document.createElement('label');
            label.setAttribute('for', colorField.id);
            label.innerText = colorField.label;
            colorDiv.appendChild(label);

            const colorPicker = document.createElement('input');
            colorPicker.className = 'form-control color-picker';
            colorPicker.type = 'color';
            colorPicker.id = colorField.id;
            colorPicker.value = this.userData.colors[colorField.id] || '#000000';
            colorDiv.appendChild(colorPicker);

            const colorCode = document.createElement('span');
            colorCode.className = 'color-code';
            colorCode.innerText = colorPicker.value;
            colorCode.style.color = colorPicker.value;
            colorDiv.appendChild(colorCode);

            editorForm.appendChild(colorDiv);
        });

        // Add save button
        const saveButton = document.createElement('button');
        saveButton.id = 'save-button';
        saveButton.innerText = 'Save Changes';
        saveButton.className = 'form-save-btn';
        saveButton.addEventListener('click', () => this.savePortfolio());
        editorForm.appendChild(saveButton);
    }

    handleColorChange(event) {
        const { name, value } = event.target;
        this.userData.colors[name] = value;
        this.updatePreview();
    }

    async savePortfolio() {
        const username = this.getCurrentUsername();
        const portfolioContent = document.getElementById('portfolio-content').value;
        const colors = this.userData.colors;

        try {
            // Upsert the professional record
            const { data, error } = await this.supabase
                .from('professionals')
                .upsert({
                    username,
                    portfolio: portfolioContent,
                    ...colors
                });

            if (error) throw error;

            this.showNotification('Portfolio saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving portfolio:', error);
            this.showNotification('Error saving portfolio. Please try again.', 'error');
        }
    }

    updatePreview(htmlContent) {
        const canvasContent = document.getElementById('canvas-content');
        if (!canvasContent) return;

        let processedHTML = htmlContent || this.getCodeContent();

        // Add profiles style.css link
        processedHTML = `<link href="./profiles/style.css" rel="stylesheet">` + processedHTML;

        processedHTML = processedHTML
            .replace(/\[Attorney Name\]/g, this.userData.username || '[Name]')
            .replace(/\[Professional Title\]/g, this.userData.profession || '[Title]')
            .replace(/\[Location\]/g, this.userData.location || '[Location]')
            .replace(/\[your\.email@example\.com\]/g, this.userData.email || '')
            .replace(/\[Professional Summary\]/g, this.userData.about || '')
            .replace(/src="[^\"]*profile\.jpe?g"/, `src="${this.userData.photo_url}"`);

        canvasContent.innerHTML = processedHTML;
    }

    setupLiveDataBinding() {
        const username = this.getCurrentUsername();
        const colors = this.userData.colors;

        // Bind username changes
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('input', (e) => {
                this.userData.name = e.target.value;
                this.updatePreview();
            });
        }

        // Bind color changes
        const colorPickers = document.querySelectorAll('.color-picker');
        colorPickers.forEach(picker => {
            picker.addEventListener('input', (e) => this.handleColorChange(e));
        });
    }

    showNotification(message, type) {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.innerText = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    showEditor() {
        document.getElementById('template-selector').classList.add('hidden');
        document.getElementById('editor-form').classList.add('hidden');
        document.getElementById('canvas-content').classList.remove('hidden');
        document.getElementById('code-content').classList.add('hidden');
        document.getElementById('preview-container').classList.add('hidden');
    }

    showTemplateSelection() {
        const elements = {
            templateSelector: document.getElementById('template-selector'),
            editorForm: document.getElementById('editor-form'),
            canvasContent: document.getElementById('canvas-content'),
            codeContent: document.getElementById('code-content'),
            previewContainer: document.getElementById('preview-container')
        };

        if (elements.templateSelector) {
            elements.templateSelector.classList.remove('hidden');
        }
        if (elements.editorForm) {
            elements.editorForm.classList.add('hidden');
        }
        if (elements.canvasContent) {
            elements.canvasContent.classList.remove('hidden');
        }
        if (elements.codeContent) {
            elements.codeContent.classList.add('hidden');
        }
        if (elements.previewContainer) {
            elements.previewContainer.classList.add('hidden');
        }
    }

    setupColorPickers() {
        // Initialize color picker functionality
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('color-picker')) {
                const span = e.target.nextElementSibling;
                if (span && span.tagName === 'SPAN') {
                    span.textContent = e.target.value;
                    span.style.color = e.target.value;
                }
            }
        });
    }

    async fetchAndDisplayPortfolioText() {
        const username = this.getCurrentUsername();

        try {
            // Fetch the professional record
            const { data, error } = await this.supabase
                .from('professionals')
                .select('portfolio')
                .eq('username', username)
                .single();

            if (error) throw error;

            const portfolioText = (typeof data?.portfolio === 'string' ? data.portfolio : data?.portfolio?.html) || '';
            this.displayCodeContent(portfolioText);

            const portfolioTextarea = document.getElementById('portfolio-content');
            if (portfolioTextarea) {
                portfolioTextarea.value = portfolioText;
            }

            this.updatePreview(portfolioText);
        } catch (error) {
            console.error('Error fetching portfolio text:', error);
        }
    }

    viewPortfolio() {
        // For now, we'll just open the current preview in a new tab
        // In a real application, you might save it and then open a unique URL
        const previewHtml = document.getElementById('canvas-content').innerHTML;
        const newWindow = window.open();
        newWindow.document.write(previewHtml);
        newWindow.document.close();
    }
}

// RGB to Hex conversion utility
function rgbToHex(rgb) {
    if (!rgb || rgb.indexOf('rgb') === -1) return rgb;
    
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return rgb;
}

// Export the PortfolioEditor class
export default PortfolioEditor;