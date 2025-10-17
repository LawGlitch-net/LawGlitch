// Portfolio Single-Page Inline Editor
// Handles code editing, preview, localStorage persistence, undo/redo, and fullscreen expansion

import { createSupabaseClient } from '../join-us/config.js';
import { savePortfolio, loadPortfolioData, validateBookingIframe, validateExternalLinks } from './save.js';
import { stripMarkers } from './form-functions.js';

class PortfolioEditor {
    constructor() {
        this.supabase = createSupabaseClient();
        this.currentTemplate = null;
        this.userData = {
            personal: {},
            expertise: [],
            experience: [],
            education: [],
            colors: {}
        };
        this.templates = {};
        
        // Template data extraction
        this.extractedTemplateData = null;
        this.fullHtmlWithData = null;
        
        // History management for undo/redo
        this.history = [];
        this.fullHtmlHistory = []; // Parallel history for fullHtmlWithData
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        // Auto-save timer
        this.autoSaveTimer = null;
        this.autoSaveDelay = 2000; // 2 seconds
        
        // IndexedDB for persistence
        this.dbName = 'PortfolioEditorDB';
        this.dbVersion = 2; // Increment version for new store
        this.db = null;
        
        this.initialize();
    }

    async initialize() {
        await this.initIndexedDB();
        await this.loadTemplates();
        
        // Try to load portfolio data from Supabase first
        const portfolioData = await this.loadPortfolioFromSupabase();
        if (portfolioData) {
            // Store in IndexedDB for offline access
            await this.saveToIndexedDB('editorState', {
                id: 'current',
                code: portfolioData,
                timestamp: Date.now()
            });
        }
        
        // Load saved template selection from IndexedDB
        const savedTemplate = await this.loadFromIndexedDB('templateSelection', 'current');
        if (savedTemplate && savedTemplate.templateId) {
            this.currentTemplate = savedTemplate.templateId;
        }
        
        this.loadFromLocalStorage();
        this.renderEditor();
        this.setupEventListeners();
        await this.restoreEditorState();
        
        // Auto-load template if one was previously selected
        if (this.currentTemplate && this.templates[this.currentTemplate]) {
            await this.loadTemplate(this.currentTemplate, true); // true = silent load
        }
    }

    getCurrentUsername() {
        return localStorage.getItem('username') || 'testuser';
    }

    // Initialize IndexedDB for persistent storage
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('IndexedDB failed to open');
                resolve(); // Don't block initialization if IndexedDB fails
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('IndexedDB initialized successfully');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('editorState')) {
                    db.createObjectStore('editorState', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('formData')) {
                    db.createObjectStore('formData', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('templateSelection')) {
                    db.createObjectStore('templateSelection', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('uploadedImages')) {
                    db.createObjectStore('uploadedImages', { keyPath: 'path' });
                }
            };
        });
    }

    // Save to IndexedDB
    async saveToIndexedDB(storeName, data) {
        if (!this.db) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error(`Failed to save to ${storeName}`);
                resolve(); // Don't block on errors
            };
        });
    }

    // Load from IndexedDB
    async loadFromIndexedDB(storeName, id) {
        if (!this.db) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error(`Failed to load from ${storeName}`);
                resolve(null);
            };
        });
    }

    // Load portfolio data from Supabase
    async loadPortfolioFromSupabase() {
        try {
            const username = this.getCurrentUsername();
            const { data, error } = await this.supabase
                .from('professionals')
                .select('portfolio')
                .eq('username', username)
                .single();
            
            if (error) {
                console.error('Error loading portfolio from Supabase:', error);
                return null;
            }
            
            if (data && data.portfolio) {
                console.log('Portfolio data loaded from Supabase');
                return data.portfolio;
            }
        } catch (error) {
            console.error('Failed to load portfolio from Supabase:', error);
        }
        
        return null;
    }

    // Fetch current portfolio code from GitHub
    async fetchPortfolioFromGitHub() {
        try {
            const username = this.getCurrentUsername();
            const response = await fetch(`https://webedit.lawglitch.workers.dev/profile?username=${encodeURIComponent(username)}`);
            
            if (!response.ok) {
                console.warn(`Portfolio not found on GitHub (HTTP ${response.status})`);
                return null;
            }
            
            const data = await response.json();
            if (data && data.html) {
                console.log('Portfolio code loaded from GitHub');
                return data.html;
            }
        } catch (error) {
            console.error('Error fetching portfolio from GitHub:', error);
        }
        
        return null;
    }

    // Load templates from HTML files
    async loadTemplates() {
        try {
            const templates = [
                { id: 'template0', name: 'My Current Portfolio', file: './template.html' },
                { id: 'template1', name: 'Classic Professional', file: './professional-template.html' },
                { id: 'template2', name: 'Modern Elegant', file: './professional-template2.html' },
                
            ];

            for (const template of templates) {
                try {
                    const response = await fetch(template.file);
                    const html = await response.text();
                    this.templates[template.id] = {
                        name: template.name,
                        html: html,
                        colors: {
                            primary: '#1B2B4D',
                            secondary: '#C9A961',
                            accent: '#A4884A',
                            background: '#FAF8F3'
                        }
                    };
                } catch (err) {
                    console.warn(`Failed to load ${template.name}:`, err);
                }
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    // Render the editor UI
    renderEditor() {
        const editorSection = document.getElementById('editor-section');
        if (!editorSection) return;

        editorSection.innerHTML = `
            <div class="inline-editor-container">
                <!-- Header with actions -->
                <div class="inline-editor-header">
                    <h2>Portfolio Editor</h2>
                    <div class="editor-actions">
                        <button id="undo-btn" class="action-btn" title="Undo (Ctrl+Z)" disabled>
                            <i class="fas fa-undo"></i>
                        </button>
                        <button id="redo-btn" class="action-btn" title="Redo (Ctrl+Y)" disabled>
                            <i class="fas fa-redo"></i>
                        </button>
                        <button id="load-template-btn" class="action-btn" title="Load Template">
                            <i class="fas fa-file-code"></i> Template
                        </button>
                        <button id="save-portfolio-btn" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save
                        </button>
                        <button id="view-portfolio-btn" class="btn btn-secondary">
                            <i class="fas fa-external-link-alt"></i> View Live
                        </button>
                    </div>
                </div>

                <!-- Main Editor Layout -->
                <div class="inline-editor-layout">
                    <!-- Code Editor Panel -->
                    <div class="code-panel">
                        <div class="panel-header">
                            <span class="panel-title">
                                <i class="fas fa-code"></i> HTML Code
                            </span>
                            <button class="expand-btn" data-panel="code" title="Expand">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                        <textarea id="code-editor" class="code-textarea" placeholder="Enter your HTML code here..."></textarea>
                    </div>

                    <!-- Preview Panel -->
                    <div class="preview-panel">
                        <div class="panel-header">
                            <span class="panel-title">
                                <i class="fas fa-eye"></i> Live Preview
                            </span>
                            <button class="expand-btn" data-panel="preview" title="Expand">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                        <div id="preview-frame" class="preview-frame">
                            <div class="preview-placeholder">
                                <i class="fas fa-file-code"></i>
                                <p>Start typing or load a template to see preview</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Template Selector Modal -->
                <div id="template-modal" class="modal-overlay hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Choose a Template</h3>
                            <button class="modal-close" id="close-template-modal">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="template-grid" id="template-grid">
                            <!-- Templates will be inserted here -->
                        </div>
                    </div>
                </div>

                <!-- Fullscreen Expansion Modal -->
                <div id="fullscreen-modal" class="fullscreen-modal hidden">
                    <div class="fullscreen-header">
                        <span id="fullscreen-title"></span>
                        <button class="fullscreen-close" id="close-fullscreen">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="fullscreen-content" class="fullscreen-content"></div>
                </div>
            </div>
        `;

        this.renderTemplateGrid();
    }

    // Render template selection grid
    renderTemplateGrid() {
        const templateGrid = document.getElementById('template-grid');
        if (!templateGrid) return;

        templateGrid.innerHTML = Object.entries(this.templates).map(([id, template]) => `
            <div class="template-card" data-template-id="${id}">
                <div class="template-preview-thumb">
                    <i class="fas fa-file-code"></i>
                </div>
                <h4>${template.name}</h4>
                <button class="btn btn-primary select-template-btn" data-template-id="${id}">
                    Select
                </button>
            </div>
        `).join('');
    }

    // Setup all event listeners
    setupEventListeners() {
        // Code editor input
        const codeEditor = document.getElementById('code-editor');
        if (codeEditor) {
            codeEditor.addEventListener('input', () => {
                this.handleCodeChange();
            });

            // Keyboard shortcuts
            codeEditor.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === 'z' && !e.shiftKey) {
                        e.preventDefault();
                        this.undo();
                    } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                        e.preventDefault();
                        this.redo();
                    } else if (e.key === 's') {
                        e.preventDefault();
                        this.saveToSupabase();
                    }
                }
            });
        }

        // Undo/Redo buttons
        document.getElementById('undo-btn')?.addEventListener('click', () => this.undo());
        document.getElementById('redo-btn')?.addEventListener('click', () => this.redo());

        // Template button
        document.getElementById('load-template-btn')?.addEventListener('click', () => {
            this.showTemplateModal();
        });

        // Save button
        document.getElementById('save-portfolio-btn')?.addEventListener('click', () => {
            this.saveToSupabase();
        });

        // View portfolio button
        document.getElementById('view-portfolio-btn')?.addEventListener('click', () => {
            this.viewPortfolio();
        });

        // Template modal
        document.getElementById('close-template-modal')?.addEventListener('click', () => {
            this.hideTemplateModal();
        });

        // Template selection
        document.querySelectorAll('.select-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.getAttribute('data-template-id');
                this.loadTemplate(templateId);
                this.hideTemplateModal();
            });
        });

        // Expand buttons
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.currentTarget.getAttribute('data-panel');
                this.expandPanel(panel);
            });
        });

        // Fullscreen close
        document.getElementById('close-fullscreen')?.addEventListener('click', () => {
            this.closeFullscreen();
        });

        // Close modals on overlay click
        document.getElementById('template-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'template-modal') {
                this.hideTemplateModal();
            }
        });

        document.getElementById('fullscreen-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'fullscreen-modal') {
                this.closeFullscreen();
            }
        });

        // Handle tab close/reload - save to localStorage
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });
    }

    // Handle code changes
    handleCodeChange() {
        const code = document.getElementById('code-editor')?.value || '';
        
        // Add to history
        this.addToHistory(code);
        
        // Update preview
        this.updatePreview(code);

        // Attempt to sync changes from Code -> Form when appropriate
        try {
            // If there's an extractedTemplateData and form panel exists, attempt to parse templateData from code
            const editorInstance = this;
            const codeEditorVal = code;

            // 1) Try to extract const templateData = { ... } block
            const match = codeEditorVal.match(/const\s+templateData\s*=\s*(\{[\s\S]*?\});/);
            if (match) {
                try {
                    const parsed = eval('(' + match[1] + ')');
                    if (parsed && typeof parsed === 'object') {
                        editorInstance.extractedTemplateData = parsed;
                        // re-render form to reflect code changes
                        if (typeof renderFormFromCode === 'function') renderFormFromCode();
                    }
                } catch (e) {
                    // ignore parse errors
                }
            } else {
                // 2) Fallback: attempt to parse rendered HTML structure to extract values
                // This covers code where the user edited the markup directly (no templateData block)
                const tmp = document.createElement('div');
                tmp.innerHTML = codeEditorVal;
                const maybeNameEl = tmp.querySelector('#profileName') || tmp.querySelector('.profile-name');
                const maybeTitleEl = tmp.querySelector('#profileTitle') || tmp.querySelector('.profile-title');
                const maybeCredEl = tmp.querySelector('#profileCred') || tmp.querySelector('.profile-credentials');
                const maybeLocationEl = tmp.querySelector('#locationText');
                const maybeAboutEl = tmp.querySelector('#aboutContent');
                const maybeProfileImg = tmp.querySelector('#profileImage');

                if (maybeNameEl || maybeTitleEl || maybeAboutEl || maybeProfileImg) {
                    const newData = editorInstance.extractedTemplateData ? JSON.parse(JSON.stringify(editorInstance.extractedTemplateData)) : {};
                    if (maybeNameEl) newData.name = maybeNameEl.textContent.trim();
                    if (maybeTitleEl) newData.title = maybeTitleEl.textContent.trim();
                    if (maybeCredEl) newData.credentials = maybeCredEl.textContent.trim();
                    if (maybeLocationEl) newData.location = maybeLocationEl.textContent.trim();
                    if (maybeAboutEl) newData.about = maybeAboutEl.textContent.trim();
                    if (maybeProfileImg) newData.profileImage = maybeProfileImg.getAttribute('src') || '';

                    // Extract expertise items if present
                    const expItems = Array.from(tmp.querySelectorAll('#expertiseContainer .expertise-card, .expertise-card'));
                    if (expItems.length > 0) {
                        newData.expertise = expItems.map(card => ({
                            icon: (card.querySelector('i') && card.querySelector('i').className) || '',
                            name: (card.querySelector('.expertise-name') && card.querySelector('.expertise-name').textContent.trim()) || (card.querySelector('h3') && card.querySelector('h3').textContent.trim()) || '',
                            desc: (card.querySelector('.expertise-desc') && card.querySelector('.expertise-desc').textContent.trim()) || ''
                        }));
                    }

                    // experiences
                    const expEls = Array.from(tmp.querySelectorAll('#experienceTimeline .timeline-item, .experience-card'));
                    if (expEls.length > 0) {
                        newData.experience = expEls.map(el => ({
                            title: (el.querySelector('.timeline-title, .experience-title') && el.querySelector('.timeline-title, .experience-title').textContent.trim()) || '',
                            org: (el.querySelector('.timeline-org, .experience-org') && el.querySelector('.timeline-org, .experience-org').textContent.trim()) || '',
                            date: (el.querySelector('.timeline-date, .experience-date') && el.querySelector('.timeline-date, .experience-date').textContent.trim()) || '',
                            desc: (el.querySelector('.timeline-desc, .experience-desc') && el.querySelector('.timeline-desc, .experience-desc').textContent.trim()) || ''
                        }));
                    }

                    // education
                    const eduEls = Array.from(tmp.querySelectorAll('#educationContainer .education-card, .education-card'));
                    if (eduEls.length > 0) {
                        newData.education = eduEls.map(el => ({
                            degree: (el.querySelector('.education-degree') && el.querySelector('.education-degree').textContent.trim()) || '',
                            school: (el.querySelector('.education-school') && el.querySelector('.education-school').textContent.trim()) || '',
                            date: (el.querySelector('.education-date') && el.querySelector('.education-date').textContent.trim()) || ''
                        }));
                    }

                    editorInstance.extractedTemplateData = newData;
                    if (typeof renderFormFromCode === 'function') renderFormFromCode();
                }
            }
        } catch (err) {
            // swallow errors to avoid breaking typing
            console.warn('Code->Form sync error', err);
        }
        
        // Auto-save to localStorage
        this.scheduleAutoSave();
    }

    // Add code to history for undo/redo
    addToHistory(code, fullHtml = null) {
        // Remove any history after current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.fullHtmlHistory = this.fullHtmlHistory.slice(0, this.historyIndex + 1);
        
        // Add new state
        this.history.push(code);
        this.fullHtmlHistory.push(fullHtml || code); // Store fullHtml or fallback to code
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.fullHtmlHistory.shift();
        } else {
            this.historyIndex++;
        }
        
        this.updateUndoRedoButtons();
    }

    // Undo action
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const code = this.history[this.historyIndex];
            const fullHtml = this.fullHtmlHistory[this.historyIndex];
            
            // Restore code editor
            document.getElementById('code-editor').value = code;
            
            // Restore fullHtmlWithData
            this.fullHtmlWithData = fullHtml;
            
            // Update preview with fullHtml (which has markers that will be stripped)
            this.updatePreview(fullHtml);
            
            this.updateUndoRedoButtons();
            this.saveToLocalStorage();
            
            // Re-render form to reflect the undone change
            if (typeof renderFormFromCode === 'function') renderFormFromCode();
        }
    }

    // Redo action
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const code = this.history[this.historyIndex];
            const fullHtml = this.fullHtmlHistory[this.historyIndex];
            
            // Restore code editor
            document.getElementById('code-editor').value = code;
            
            // Restore fullHtmlWithData
            this.fullHtmlWithData = fullHtml;
            
            // Update preview with fullHtml (which has markers that will be stripped)
            this.updatePreview(fullHtml);
            
            this.updateUndoRedoButtons();
            this.saveToLocalStorage();
            
            // Re-render form to reflect the redone change
            if (typeof renderFormFromCode === 'function') renderFormFromCode();
        }
    }

    // Update undo/redo button states
    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.disabled = this.historyIndex <= 0;
        }
        
        if (redoBtn) {
            redoBtn.disabled = this.historyIndex >= this.history.length - 1;
        }
    }

    // Update live preview
    updatePreview(code) {
        const previewFrame = document.getElementById('preview-frame');
        if (!previewFrame) return;

        if (!code || code.trim() === '') {
            previewFrame.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-file-code"></i>
                    <p>Start typing or load a template to see preview</p>
                </div>
            `;
            return;
        }

        // Create sandboxed preview
        previewFrame.innerHTML = `
            <iframe 
                sandbox="allow-same-origin allow-scripts" 
                style="width: 100%; height: 100%; border: none; background: white;"
                srcdoc="${this.escapeHtml(stripMarkers(code))}"
            ></iframe>
        `;
    }

    // Escape HTML for iframe srcdoc
    escapeHtml(html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Schedule auto-save to localStorage
    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.saveToLocalStorage();
        }, this.autoSaveDelay);
    }

    // Save to localStorage and IndexedDB
    async saveToLocalStorage() {
        const code = document.getElementById('code-editor')?.value || '';
        const editorState = {
            code: code,
            history: this.history,
            fullHtmlHistory: this.fullHtmlHistory,
            historyIndex: this.historyIndex,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('portfolio_editor_state', JSON.stringify(editorState));
            console.log('Editor state saved to localStorage');
            
            // Also save to IndexedDB for better persistence
            await this.saveToIndexedDB('editorState', {
                id: 'current',
                code: code,
                extractedTemplateData: this.extractedTemplateData,
                fullHtmlWithData: this.fullHtmlWithData,
                fullHtmlHistory: this.fullHtmlHistory,
                currentTemplate: this.currentTemplate,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    // Load from localStorage
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('portfolio_editor_state');
            if (saved) {
                const editorState = JSON.parse(saved);
                return editorState;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
        return null;
    }

    // Restore editor state from localStorage and IndexedDB
    async restoreEditorState() {
        // Try IndexedDB first (more reliable)
        const indexedDBState = await this.loadFromIndexedDB('editorState', 'current');
        
        // Fallback to localStorage
        const savedState = indexedDBState || this.loadFromLocalStorage();
        
        if (savedState) {
            const codeEditor = document.getElementById('code-editor');
            if (codeEditor) {
                codeEditor.value = savedState.code || '';
                this.history = savedState.history || [savedState.code || ''];
                this.historyIndex = savedState.historyIndex || 0;
                
                // Restore extractedTemplateData if available
                if (savedState.extractedTemplateData) {
                    this.extractedTemplateData = savedState.extractedTemplateData;
                }
                
                // Restore fullHtmlWithData if available
                if (savedState.fullHtmlWithData) {
                    this.fullHtmlWithData = savedState.fullHtmlWithData;
                }
                
                // Restore currentTemplate if available
                if (savedState.currentTemplate) {
                    this.currentTemplate = savedState.currentTemplate;
                }
                
                // Update preview with fullHtmlWithData if available, otherwise use code
                this.updatePreview(savedState.fullHtmlWithData || savedState.code || '');
                this.updateUndoRedoButtons();
                
                // Render form from restored data
                if (this.extractedTemplateData) {
                    await renderFormFromCode(savedState.code || '');
                }
                
                console.log('Editor state restored from storage');
            }
        }
    }

    // Load a template
    async loadTemplate(templateId, silent = false) {
        const template = this.templates[templateId];
        if (!template) return;

        try {
            // Store current template ID
            this.currentTemplate = templateId;
            
            // Save template selection to IndexedDB
            await this.saveToIndexedDB('templateSelection', {
                id: 'current',
                templateId: templateId,
                timestamp: Date.now()
            });

            // Fetch user data from Supabase including portfolio data
            const { data, error } = await this.supabase
                .from('professionals')
                .select('*')
                .eq('username', this.getCurrentUsername())
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
            }

            let processedHtml = template.html;

            // For template0 (My Current Code), fetch the current portfolio from GitHub
            if (templateId === 'template0') {
                const githubPortfolio = await this.fetchPortfolioFromGitHub();
                if (githubPortfolio) {
                    processedHtml = githubPortfolio;
                } else {
                    // If portfolio doesn't exist on GitHub, use the template.html as fallback
                    console.log('No portfolio found on GitHub, using template.html as starting point');
                    processedHtml = template.html;
                }
            }

            // Extract templateData for form editor (before stripping it out)
            const templateDataMatch = processedHtml.match(/const\s+templateData\s*=\s*(\{[\s\S]*?\});/);
            if (templateDataMatch) {
                try {
                    // Store the extracted templateData for form generation
                    this.extractedTemplateData = eval('(' + templateDataMatch[1] + ')');
                    
                    // Load saved portfolio data from Supabase and populate templateData
                    if (data && data.portfolio) {
                        const savedPortfolioData = typeof data.portfolio === 'string' 
                            ? JSON.parse(data.portfolio) 
                            : data.portfolio;
                        
                        // If portfolio data exists and has userData, merge it with templateData
                        if (savedPortfolioData && savedPortfolioData.userData) {
                            this.extractedTemplateData = { ...this.extractedTemplateData, ...savedPortfolioData.userData };
                            console.log('Loaded saved portfolio data into template:', this.extractedTemplateData);
                            
                            // Update the HTML with the merged templateData
                            const updatedTemplateDataString = JSON.stringify(this.extractedTemplateData, null, 4);
                            processedHtml = processedHtml.replace(
                                templateDataMatch[0],
                                `const templateData = ${updatedTemplateDataString};`
                            );
                        }
                    }
                } catch (e) {
                    console.warn('Failed to parse templateData:', e);
                    this.extractedTemplateData = null;
                }
            }

            // Replace PROFESSIONAL_ID placeholder early for both fullHtml and stripped version
            const professionalId = data?.user_id || data?.id || '';
            if (professionalId) {
                processedHtml = processedHtml.replace(/\[\[\[PROFESSIONAL_ID\]\]\]/g, professionalId);
            }

            // Store the full HTML with templateData for later use (now includes merged data)
            this.fullHtmlWithData = processedHtml;

            // Strip out templateData and populateTemplate sections from code canvas
            processedHtml = this.stripProtectedCode(processedHtml);

            // Replace placeholders with user data if available
            // Priority: saved portfolio data > basic user data from professionals table
            if (data) {
                const userData = this.extractedTemplateData || {};
                processedHtml = processedHtml
                    .replace(/\[Attorney Name\]/g, userData.name || data.username || '[Name]')
                    .replace(/\[Professional Title\]/g, userData.title || data.profession || '[Title]')
                    .replace(/\[Location\]/g, userData.location || data.location || '[Location]')
                    .replace(/\[your\.email@example\.com\]/g, userData.email || data.email || '')
                    .replace(/\[Professional Summary\]/g, userData.about || data.about || '');
            }

            // Set the code in editor
            const codeEditor = document.getElementById('code-editor');
            if (codeEditor) {
                codeEditor.value = processedHtml;
                this.addToHistory(processedHtml);
                this.updatePreview(this.fullHtmlWithData); // Preview uses full HTML with templateData
                this.saveToLocalStorage();
            }

            // Automatically show form editor after loading template
            setTimeout(() => {
                if (typeof renderFormFromCode === 'function') {
                    renderFormFromCode();
                }
            }, 100);

            if (!silent) {
                this.showNotification(`Template "${template.name}" loaded successfully!`, 'success');
            }
        } catch (error) {
            console.error('Error loading template:', error);
            if (!silent) {
                this.showNotification('Failed to load template', 'error');
            }
        }
    }

    // Strip protected code sections (templateData and populateTemplate)
    stripProtectedCode(html) {
        // Remove the templateData declaration
        html = html.replace(/\/\/\s*Template data structure for form population[\s\S]*?const\s+templateData\s*=\s*\{[\s\S]*?\};/g, '');
        
        // Remove the populateTemplate function
        html = html.replace(/\/\/\s*Function to populate template[\s\S]*?function\s+populateTemplate\s*\([^)]*\)\s*\{[\s\S]*?\}\s*(?=\/\/|<\/script>)/g, '');
        
        // Remove the window.populateTemplate exposure
        html = html.replace(/\/\/\s*Expose function globally[\s\S]*?window\.populateTemplate\s*=\s*populateTemplate;/g, '');
        
        // Remove the stripMarkers function
        html = html.replace(/\/\/\s*Strip\s*\[\[\[.*?\]\]\]\s*markers[\s\S]*?\(function\s+stripMarkers\s*\(\)\s*\{[\s\S]*?\}\)\(\);/g, '');
        
        return html;
    }

    // Save to Supabase and deploy to GitHub
    async saveToSupabase() {
        const username = this.getCurrentUsername();

        // Save current state to IndexedDB before saving to Supabase
        await this.saveToLocalStorage();
        
        // Also save form data if form exists
        const formCanvas = document.getElementById('form-canvas');
        if (formCanvas && formCanvas.querySelector('.field-input')) {
            try {
                const { saveFormDataToIndexedDB } = await import('./form-functions.js');
                await saveFormDataToIndexedDB();
            } catch (err) {
                console.warn('Could not save form data:', err);
            }
        }

        // Use the full HTML with templateData if available, otherwise use code editor value
        const htmlToSave = this.fullHtmlWithData || document.getElementById('code-editor')?.value || '';

        // No name/title/about validation here — only booking iframe and allowed external links are enforced.

        // Frontend validation: Check for booking iframe
        if (!validateBookingIframe(htmlToSave)) {
            alert('Portfolio must include a booking iframe.');
            this.showNotification('Booking iframe required', 'error');
            return;
        }

        // Frontend validation: Check for unauthorized external links
        const linkValidation = validateExternalLinks(htmlToSave);
        if (!linkValidation.valid) {
            const list = linkValidation.unauthorizedLinks && linkValidation.unauthorizedLinks.length ? ('\n\n' + linkValidation.unauthorizedLinks.join('\n')) : '';
            alert('Portfolio contains unauthorized external links.' + list);
            this.showNotification('Unauthorized external links detected', 'error');
            return;
        }

        try {
            // Show loading state
            this.showNotification('Saving and deploying portfolio...', 'info');
            
            // Prepare portfolio data structure
            const portfolioData = {
                html: htmlToSave,
                userData: this.extractedTemplateData || this.userData,
                timestamp: Date.now()
            };

            // Use the save helper function
            const result = await savePortfolio(username, portfolioData, htmlToSave);
            
            if (result.success) {
                this.showNotification('Portfolio saved and deployed successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving portfolio:', error);
            this.showNotification(error.message || 'Failed to save portfolio', 'error');
            alert(error.message || 'Failed to save portfolio. Please try again.');
        }
    }

    // View portfolio in new tab
    viewPortfolio() {
        const username = this.getCurrentUsername();
        const url = `../profiles/index.html?username=${username}`;
        window.open(url, '_blank');
    }

    // Show template modal
    showTemplateModal() {
        const modal = document.getElementById('template-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // Hide template modal
    hideTemplateModal() {
        const modal = document.getElementById('template-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Expand panel to fullscreen
    expandPanel(panel) {
        const fullscreenModal = document.getElementById('fullscreen-modal');
        const fullscreenTitle = document.getElementById('fullscreen-title');
        const fullscreenContent = document.getElementById('fullscreen-content');
        
        if (!fullscreenModal || !fullscreenTitle || !fullscreenContent) return;

        if (panel === 'code') {
            fullscreenTitle.innerHTML = '<i class="fas fa-code"></i> HTML Code Editor';
            const code = document.getElementById('code-editor')?.value || '';
            fullscreenContent.innerHTML = `
                <textarea id="fullscreen-code-editor" class="fullscreen-code-textarea">${code}</textarea>
            `;
            
            // Sync changes back to main editor
            const fullscreenEditor = document.getElementById('fullscreen-code-editor');
            if (fullscreenEditor) {
                fullscreenEditor.addEventListener('input', (e) => {
                    const mainEditor = document.getElementById('code-editor');
                    if (mainEditor) {
                        mainEditor.value = e.target.value;
                        this.handleCodeChange();
                    }
                });
            }
        } else if (panel === 'preview') {
            fullscreenTitle.innerHTML = '<i class="fas fa-eye"></i> Live Preview';
            const code = document.getElementById('code-editor')?.value || '';
            fullscreenContent.innerHTML = `
                <iframe 
                    sandbox="allow-same-origin" 
                    style="width: 100%; height: 100%; border: none; background: white;"
                    srcdoc="${this.escapeHtml(stripMarkers(code))}"
                ></iframe>
            `;
        }

        fullscreenModal.classList.remove('hidden');
    }

    // Close fullscreen modal
    closeFullscreen() {
        const fullscreenModal = document.getElementById('fullscreen-modal');
        if (fullscreenModal) {
            fullscreenModal.classList.add('hidden');
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        const container = document.getElementById('toast-container') || document.querySelector('.toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize editor when module is loaded
let editorInstance = null;

export default PortfolioEditor;

// Auto-initialize when editor section is visible
export function initializeEditor() {
    if (!editorInstance) {
        editorInstance = new PortfolioEditor();
        // Expose globally for form functions
        window.portfolioEditorInstance = editorInstance;
    }
    return editorInstance;
}

// Initialize on DOM ready if editor section exists
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('editor-section')) {
            initializeEditor();
        }
    });
} else {
    if (document.getElementById('editor-section')) {
        initializeEditor();
    }
}



// Add a small toggle UI to the top-left of the editor header to switch
// between Code (</>) and Form (pencil) modes. By default Form mode is shown.
function ensureFormToggleUI() {
    const header = document.querySelector('.inline-editor-header .editor-actions');
    if (!header) return;

    // Avoid duplicating buttons
    if (document.getElementById('mode-toggle-group')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'mode-toggle-group';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '6px';
    wrapper.style.alignItems = 'center';

    // Add styles for active state
    const style = document.createElement('style');
    style.textContent = `
        .action-btn.active {
            background: #e9ecef !important;
            border-color: #dee2e6 !important;
        }
    `;
    document.head.appendChild(style);

    wrapper.innerHTML = `
        <button id="form-mode-btn" class="action-btn" title="Form Mode">
            <i class="fas fa-pencil-alt"></i>
        </button>
        <button id="code-mode-btn" class="action-btn" title="Code Mode">
            <i class="fas fa-code"></i>
        </button>
        <button id="image-uploader-toggle" class="action-btn" title="Manage Images">
            <i class="fas fa-images"></i>
        </button>
    `;

    header.insertBefore(wrapper, header.firstChild);

    document.getElementById('form-mode-btn')?.addEventListener('click', () => {
        setEditorMode('form');
    });

    document.getElementById('code-mode-btn')?.addEventListener('click', () => {
        setEditorMode('code');
    });

    // initialize uploader UI when toggle exists
    document.getElementById('image-uploader-toggle')?.addEventListener('click', (e) => {
        toggleImageUploaderPanel();
    });
}

// Set editor mode: 'form' or 'code'
function setEditorMode(mode) {
    const codePanel = document.querySelector('.code-panel');
    const previewPanel = document.querySelector('.preview-panel');
    if (!codePanel || !previewPanel) return;

    const editorLayout = document.querySelector('.inline-editor-layout');
    if (!codePanel || !previewPanel || !editorLayout) return;

    if (mode === 'form') {
        // Hide code editor, show form canvas
        codePanel.style.display = 'none';
        if (!document.getElementById('form-panel')) {
            insertFormPanel();
        }
        document.getElementById('form-panel').style.display = 'block';
        editorLayout.classList.add('form-active'); // Add class to layout
        // If no template loaded, prompt to choose one
        const editor = editorInstance;
        const code = (document.getElementById('code-editor')?.value || '').trim();
        if (!code) {
            editor?.showTemplateModal();
        } else {
            renderFormFromCode(code);
        }
    } else {
        // Show code editor, hide form canvas
        codePanel.style.display = '';
        const formPanel = document.getElementById('form-panel');
        if (formPanel) formPanel.style.display = 'none';
        editorLayout.classList.remove('form-active'); // Remove class from layout
    }
}

/* ---------------------- Image Uploader (self-contained) ---------------------- */

// IndexedDB handler for the uploader
const uploaderDB = {
    db: null,
    dbName: 'portfolioUploaderDB',
    storeName: 'images',

    async open() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.dbName, 1);
            req.onerror = () => reject(req.error);
            req.onsuccess = () => {
                this.db = req.result;
                resolve(this.db);
            };
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    },

    async getAll() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.getAll();
            req.onsuccess = () => {
                const map = {};
                (req.result || []).forEach(item => {
                    if (item && item.path && item.dataUrl) {
                        map[item.path] = item.dataUrl;
                    }
                });
                resolve(map);
            };
            req.onerror = () => reject(req.error);
        });
    },

    async put(path, dataUrl) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.put({ path, dataUrl }, path);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async delete(path) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.delete(path);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async clear() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
};

// Toggle the visibility of the image uploader modal
function toggleImageUploaderPanel() {
    let modal = document.getElementById('image-uploader-modal');
    if (!modal) {
        insertImageUploaderModal();
        modal = document.getElementById('image-uploader-modal');
    }

    if (modal.classList.contains('visible')) {
        modal.classList.remove('visible');
        modal.style.display = 'none';
    } else {
        modal.classList.add('visible');
        modal.style.display = 'block';
        renderUploadedImagesList();
    }

    // Toggle active state on button
    const btn = document.getElementById('image-uploader-toggle');
    if (btn) {
        btn.classList.toggle('active');
    }
}

// Insert the uploader modal into the body
function insertImageUploaderModal() {
    // Avoid duplication
    if (document.getElementById('image-uploader-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'image-uploader-modal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '9999';

    const modalContent = document.createElement('div');
    modalContent.style.position = 'relative';
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.margin = '40px auto';
    modalContent.style.padding = '20px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '800px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflow = 'auto';

    modalContent.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3 style="margin:0;">Image Manager</h3>
            <button class="modal-close" style="border:none; background:none; font-size:20px; cursor:pointer;">×</button>
        </div>
        <div style="display:flex; gap:8px; align-items:center; padding:12px; background:#f8f9fa; border-radius:4px; margin-bottom:20px;">
            <label for="image-upload-input" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; margin:0;">
                <i class="fas fa-plus"></i> <span>Upload PNG</span>
            </label>
            <input id="image-upload-input" type="file" accept="image/png" style="display:none;" />
            <button id="image-upload-clear" class="btn" title="Clear all" style="margin:0;">Clear All</button>
            <div style="margin-left:auto; font-size:12px; color:#666;">Referenced as <code>assets/imgN.png</code></div>
        </div>
        <div id="uploaded-images-list" style="display:flex; gap:12px; padding:12px; flex-wrap:wrap; align-content:flex-start; background:white; border:1px solid #eee; border-radius:4px; min-height:200px;"></div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            toggleImageUploaderPanel();
        }
    });

    // Close button
    modalContent.querySelector('.modal-close').addEventListener('click', () => {
        toggleImageUploaderPanel();
    });

    // event bindings
    const input = document.getElementById('image-upload-input');
    if (input) {
        input.value = ''; // Reset any existing value
        input.addEventListener('change', handleImageFileSelect);
    }

    document.getElementById('image-upload-clear')?.addEventListener('click', () => {
        if (!confirm('Clear all uploaded images?')) return;
        uploaderDB.clear().then(() => {
            renderUploadedImagesList();
            if (editorInstance) editorInstance.showNotification('All images cleared', 'info');
        });
    });
}

// IndexedDB helpers for storing uploaded images
const dbName = 'portfolioImagesDB';
const storeName = 'images';

// Initialize IndexedDB
async function initImageDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = () => {
            console.error('Failed to open IndexedDB');
            showToast('Failed to access image storage', 'error');
            reject(request.error);
        };

        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName);
            }
        };
    });
}

// Read stored images map from IndexedDB
async function readUploadedImages() {
    try {
        const db = await initImageDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get('imageMap');
            
            request.onsuccess = () => resolve(request.result || {});
            request.onerror = () => {
                console.warn('Failed to read uploaded images', request.error);
                showToast('Failed to load images', 'error');
                resolve({});
            };
        });
    } catch (e) {
        console.warn('Failed to read from IndexedDB', e);
        showToast('Failed to access image storage', 'error');
        return {};
    }
}

// Write images map to IndexedDB
async function writeUploadedImages(map) {
    try {
        const db = await initImageDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(map, 'imageMap');
            
            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Failed to save to IndexedDB', request.error);
                showToast('Failed to save image', 'error');
                reject(request.error);
            };
        });
    } catch (e) {
        console.error('Failed to write to IndexedDB', e);
        showToast('Failed to save image', 'error');
    }
}

// Generate next unique path like /assets/img1.png
function generateNextImagePath(existingMap) {
    const used = Object.keys(existingMap || {});
    let max = 0;
    used.forEach(k => {
        const m = k.match(/img(\d+)\.png$/);
        if (m) {
            const n = parseInt(m[1], 10);
            if (!isNaN(n) && n > max) max = n;
        }
    });
    return `assets/img${max + 1}.png`;
}

// Handle selected file (only one PNG allowed)
async function handleImageFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.type !== 'image/png') {
        alert('Only PNG files are accepted for this uploader.');
        return;
    }

    try {
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });

        const map = await uploaderDB.getAll();
        const path = generateNextImagePath(map);
        await uploaderDB.put(path, dataUrl);
        await renderUploadedImagesList();
        if (editorInstance) editorInstance.showNotification('Image uploaded: ' + path, 'success');
    } catch (err) {
        console.error('Failed to upload image:', err);
        alert('Failed to upload image. Please try again.');
    }
    
    e.target.value = '';
}

// Render thumbnails and controls for uploaded images
async function renderUploadedImagesList() {
    const container = document.getElementById('uploaded-images-list');
    if (!container) return;
    container.innerHTML = '';
    const map = await uploaderDB.getAll();
    const entries = Object.entries(map || {});
    if (entries.length === 0) {
        container.innerHTML = `<div class="preview-placeholder" style="padding:12px;">No uploaded images</div>`;
        return;
    }
    entries.forEach(([path, dataUrl]) => {
        const card = document.createElement('div');
        card.style.border = '1px solid #ddd';
        card.style.padding = '8px';
        card.style.width = '150px';
        card.style.minWidth = '150px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.gap = '8px';
        card.style.background = '#fff';
        card.style.borderRadius = '4px';
        card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        card.style.position = 'relative';

        // Delete button in top-right corner
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '×';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.right = '2px';
        deleteBtn.style.top = '2px';
        deleteBtn.style.width = '20px';
        deleteBtn.style.height = '20px';
        deleteBtn.style.padding = '0';
        deleteBtn.style.background = '#ff4444';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '50%';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.display = 'flex';
        deleteBtn.style.alignItems = 'center';
        deleteBtn.style.justifyContent = 'center';
        deleteBtn.style.fontSize = '16px';
        deleteBtn.style.lineHeight = '1';
        deleteBtn.title = 'Delete image';
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Delete this image?')) {
                await uploaderDB.delete(path);
                renderUploadedImagesList();
                if (editorInstance) editorInstance.showNotification('Image deleted', 'success');
            }
        });

        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.width = '100%';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '3px';
        img.alt = path;

        const pathContainer = document.createElement('div');
        pathContainer.style.width = '100%';
        pathContainer.style.position = 'relative';
        pathContainer.style.display = 'flex';
        pathContainer.style.alignItems = 'center';
        pathContainer.style.gap = '4px';
        pathContainer.style.minHeight = '20px';

        const pathEl = document.createElement('div');
        pathEl.textContent = path;
        pathEl.style.fontSize = '11px';
        pathEl.style.color = '#666';
        pathEl.style.wordBreak = 'break-all';
        pathEl.style.flex = '1';

        const quickCopyBtn = document.createElement('button');
        quickCopyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        quickCopyBtn.style.padding = '2px 6px';
        quickCopyBtn.style.fontSize = '12px';
        quickCopyBtn.style.background = '#f8f8f8';
        quickCopyBtn.style.border = '1px solid #ddd';
        quickCopyBtn.style.borderRadius = '3px';
        quickCopyBtn.style.cursor = 'pointer';
        quickCopyBtn.title = 'Copy path';
        quickCopyBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText(path);
                if (editorInstance) editorInstance.showNotification('Copied: ' + path, 'success');
                quickCopyBtn.style.background = '#e6ffe6';
                quickCopyBtn.style.borderColor = '#b3ffb3';
                setTimeout(() => {
                    quickCopyBtn.style.background = '#f8f8f8';
                    quickCopyBtn.style.borderColor = '#ddd';
                }, 1000);
            } catch (err) {
                const ta = document.createElement('textarea');
                ta.value = path;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
                if (editorInstance) editorInstance.showNotification('Copied: ' + path, 'success');
            }
        });

        pathContainer.appendChild(pathEl);
        pathContainer.appendChild(quickCopyBtn);

        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn small';
        copyBtn.textContent = 'Copy URL';
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(path);
                if (editorInstance) editorInstance.showNotification('Copied ' + path, 'success');
            } catch (err) {
                // fallback
                const ta = document.createElement('textarea'); ta.value = path; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
                if (editorInstance) editorInstance.showNotification('Copied ' + path, 'success');
            }
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-danger small';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', async () => {
            if (!confirm('Delete ' + path + '?')) return;
            await uploaderDB.delete(path);
            renderUploadedImagesList();
        });

        card.appendChild(deleteBtn);
        card.appendChild(img);
        card.appendChild(pathContainer);

        container.appendChild(card);
    });
}

// Map asset paths like /assets/imgN.png in code to data URLs when rendering preview
// Wrap existing updatePreview and substitute uploaded image paths reliably.
const originalUpdatePreview = PortfolioEditor.prototype.updatePreview;
if (originalUpdatePreview && typeof originalUpdatePreview === 'function') {
    PortfolioEditor.prototype.updatePreview = async function(code) {
        let processed = code || '';

        try {
            const map = await uploaderDB.getAll();
            const paths = Object.keys(map || {});

            if (paths.length > 0 && typeof DOMParser !== 'undefined') {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(processed, 'text/html');

                    // Helper to replace a value if it matches any known uploaded path variants
                    const replaceValueWithMap = (val) => {
                        if (!val || typeof val !== 'string') return val;
                        let out = val;
                        paths.forEach(path => {
                            const dataUrl = map[path];
                            if (!dataUrl) return;
                            const variants = [path, '/' + path, './' + path, '../' + path];
                            variants.forEach(v => {
                                if (out === v || out.endsWith(v) || out.includes(v)) {
                                    out = out.split(v).join(dataUrl);
                                }
                            });
                        });
                        return out;
                    };

                    // Replace attributes (src, href, srcset) and inline styles
                    const els = doc.querySelectorAll('*');
                    els.forEach(el => {
                        if (el.hasAttribute && el.hasAttribute('src')) {
                            const newSrc = replaceValueWithMap(el.getAttribute('src'));
                            if (newSrc !== el.getAttribute('src')) el.setAttribute('src', newSrc);
                        }

                        if (el.hasAttribute && el.hasAttribute('href')) {
                            const newHref = replaceValueWithMap(el.getAttribute('href'));
                            if (newHref !== el.getAttribute('href')) el.setAttribute('href', newHref);
                        }

                        if (el.hasAttribute && el.hasAttribute('srcset')) {
                            const srcset = el.getAttribute('srcset') || '';
                            const parts = srcset.split(',').map(p => p.trim()).map(p => {
                                // entries can be like "path 1x" or "path 2x"
                                const subParts = p.split(' ');
                                subParts[0] = replaceValueWithMap(subParts[0]);
                                return subParts.join(' ');
                            });
                            const newSrcset = parts.join(', ');
                            if (newSrcset !== srcset) el.setAttribute('srcset', newSrcset);
                        }

                        if (el.hasAttribute && el.hasAttribute('style')) {
                            let styleVal = el.getAttribute('style') || '';
                            // replace url(...) occurrences for each path variant
                            paths.forEach(path => {
                                const dataUrl = map[path];
                                if (!dataUrl) return;
                                // replace straight occurrences and with leading slash or ./
                                const variants = [path, '/' + path, './' + path, '../' + path];
                                variants.forEach(v => {
                                    const re = new RegExp(escapeRegExp(v), 'g');
                                    styleVal = styleVal.replace(re, dataUrl);
                                });
                            });
                            if (styleVal !== el.getAttribute('style')) el.setAttribute('style', styleVal);
                        }
                    });

                    // Serialize back to HTML
                    processed = doc.documentElement.outerHTML;
                } catch (domErr) {
                    console.warn('DOMParser mapping failed, falling back to regex mapping', domErr);
                }
            }

            // Fallback simple replacement across the string (handles cases where DOM parsing failed)
            if (paths.length > 0) {
                paths.forEach(path => {
                    const dataUrl = map[path];
                    if (!dataUrl) return;
                    const esc = escapeRegExp(path);
                    processed = processed.replace(new RegExp(esc, 'g'), dataUrl);
                    const withLead = path.startsWith('/') ? path : ('/' + path);
                    processed = processed.replace(new RegExp(escapeRegExp(withLead), 'g'), dataUrl);
                    processed = processed.replace(new RegExp(escapeRegExp('./' + path), 'g'), dataUrl);
                });
            }
        } catch (e) {
            console.warn('Could not map uploaded images for preview:', e);
        }

        return originalUpdatePreview.call(this, processed);
    };
}

// ensure uploader panel is cleaned up when editor not present (no-op additional safety)
function _cleanupImageUploader() {
    const panel = document.getElementById('image-uploader-panel');
    if (panel) panel.remove();
}

/* ---------------------- End Image Uploader ---------------------- */

// Insert the form panel into the layout next to preview
function insertFormPanel() {
    const preview = document.querySelector('.preview-panel');
    if (!preview) return;

    const formPanel = document.createElement('div');
    formPanel.className = 'form-panel';
    formPanel.id = 'form-panel';
    formPanel.innerHTML = `
        <div class="panel-header">
            <span class="panel-title"><i class="fas fa-pencil-alt"></i> Form Editor</span>
        </div>
        <div id="form-canvas" class="form-canvas">
            <div id="form-placeholder" class="preview-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>No template loaded. Please select a template to begin editing.</p>
                <button id="placeholder-template-btn" class="btn btn-primary" style="margin-top: 12px;">
                    <i class="fas fa-file-code"></i> Choose Template
                </button>
            </div>
        </div>
        <div class="form-actions" style="padding:8px; display:none; gap:8px;">
            <button id="apply-form-to-code" class="btn btn-primary">Save Changes</button>
        </div>
    `;

    preview.parentNode.insertBefore(formPanel, preview.nextSibling);

    // Template button in placeholder
    document.getElementById('placeholder-template-btn')?.addEventListener('click', () => {
        const editorInstance = window.portfolioEditorInstance;
        if (editorInstance) {
            editorInstance.showTemplateModal();
        }
    });

    // Save changes button
    document.getElementById('apply-form-to-code')?.addEventListener('click', () => {
        applyFormChangesToCode().catch(err => console.error('Failed to apply form changes:', err));
    });
}

// Lightweight wrapper that delegates form rendering to the simplified module
async function renderFormFromCode(code) {
    try {
        const mod = await import('./form-functions.js');
        console.debug('renderFormFromCode: imported module keys=', Object.keys(mod || {}));
        console.debug('renderFormFromCode: mod.renderSimpleForm type=', typeof (mod && mod.renderSimpleForm));
        if (mod && typeof mod.renderSimpleForm === 'function') {
            await mod.renderSimpleForm();
            return;
        }
        // fallback to default export
        console.debug('renderFormFromCode: mod.default keys=', mod && mod.default ? Object.keys(mod.default) : null);
        console.debug('renderFormFromCode: mod.default.renderSimpleForm type=', typeof (mod && mod.default && mod.default.renderSimpleForm));
        if (mod && mod.default && typeof mod.default.renderSimpleForm === 'function') {
            await mod.default.renderSimpleForm();
            return;
        }
    } catch (e) {
        console.error('renderFormFromCode delegate failed', e && e.stack ? e.stack : e);
        const canvas = document.getElementById('form-canvas');
        if (canvas) {
            const msg = (e && e.message) ? e.message : String(e);
            canvas.innerHTML = `<div class="preview-placeholder"><i class="fas fa-exclamation-triangle"></i><p>Unable to load form editor.</p><pre style="white-space:pre-wrap; font-size:12px;">${escapeHtml(msg)}</pre></div>`;
        }
        return;
    }

    const canvas = document.getElementById('form-canvas');
    if (canvas) {
        canvas.innerHTML = `<div class="preview-placeholder"><i class="fas fa-info-circle"></i><p>Unable to load form editor.</p></div>`;
    }
}

// Simple wrappers so other parts of editor.js can call these names synchronously
async function saveFormDataToIndexedDB() {
    try { const mod = await import('./form-functions.js'); if (mod && mod.saveFormDataToIndexedDB) return mod.saveFormDataToIndexedDB(); } catch (e) { console.warn(e); }
}

async function loadFormDataFromIndexedDB() {
    try { const mod = await import('./form-functions.js'); if (mod && mod.loadFormDataFromIndexedDB) return mod.loadFormDataFromIndexedDB(); } catch (e) { console.warn(e); }
    return null;
}

async function applyFormChangesToCode() {
    try { const mod = await import('./form-functions.js'); if (mod && mod.applyFormChangesToCode) return mod.applyFormChangesToCode(); } catch (e) { console.warn(e); }
}

// debouncedLiveApply wrapper — attempt to call module's exported debouncedLiveApply
function debouncedLiveApply() {
    try {
        import('./form-functions.js').then(mod => {
            if (mod && mod.debouncedLiveApply) mod.debouncedLiveApply();
        }).catch(() => {});
    } catch (e) { }
}




// Utility to escape RegExp special chars
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Replace simple placeholder tokens like [Attorney Name] in HTML with values from templateData
function replacePlaceholdersInHtml(html, data) {
    if (!html || !data) return html;
    // Helper: replace inner content of element with specific id in raw html string
    const replaceElementContentString = (srcHtml, id, newContent) => {
        if (!newContent) newContent = '';
        const re = new RegExp('(<[^>]*id=["\']' + id + '["\'][^>]*>)([\s\S]*?)(<\\/[^>]+>)', 'i');
        if (re.test(srcHtml)) {
            return srcHtml.replace(re, (m, open, old, close) => {
                return open + newContent + close;
            });
        }
        return srcHtml;
    };

    // Helper: replace src attribute of element with id
    const replaceElementSrcString = (srcHtml, id, newSrc) => {
        if (!newSrc) newSrc = '';
        // find id occurrence
        let pos = srcHtml.indexOf(`id="${id}"`);
        let quoteType = '"';
        if (pos === -1) {
            pos = srcHtml.indexOf(`id='${id}'`);
            quoteType = "'";
        }
        if (pos === -1) return srcHtml;

        // find start of tag
        const tagStart = srcHtml.lastIndexOf('<', pos);
        const tagEnd = srcHtml.indexOf('>', pos);
        if (tagStart === -1 || tagEnd === -1) return srcHtml;
        const tag = srcHtml.slice(tagStart, tagEnd + 1);

        // find src attribute in tag
        const srcMatch = tag.match(/src\s*=\s*("([^"]*)"|'([^']*)')/i);
        let newTag;
        if (srcMatch) {
            const full = srcMatch[0];
            const quote = full.indexOf('"') !== -1 ? '"' : "'";
            const replacement = `src=${quote}[[[${newSrc}]]]${quote}`;
            newTag = tag.replace(srcMatch[0], replacement);
        } else {
            // no src attribute; insert before closing
            newTag = tag.replace(/\s*>\s*$/, ` src="[[[${newSrc}]]]"$1`);
        }

        return srcHtml.slice(0, tagStart) + newTag + srcHtml.slice(tagEnd + 1);
    };

    // Helper: replace anchor with id's innerHTML and href
    const replaceAnchorContentAndHref = (srcHtml, id, href, innerText) => {
        let out = srcHtml;
        // find id occurrence
        let pos = out.indexOf(`id="${id}"`);
        if (pos === -1) pos = out.indexOf(`id='${id}'`);
        if (pos === -1) {
            // fallback to just replacing inner content
            if (typeof innerText !== 'undefined') out = replaceElementContentString(out, id, innerText);
            return out;
        }

        // locate tag boundaries
        const tagStart = out.lastIndexOf('<', pos);
        const tagEnd = out.indexOf('>', pos);
        if (tagStart === -1 || tagEnd === -1) return out;
        const tag = out.slice(tagStart, tagEnd + 1);

        let newTag = tag;
        if (href) {
            // replace existing href or append
            const hrefMatch = newTag.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i);
            if (hrefMatch) {
                const full = hrefMatch[0];
                const quote = full.indexOf('"') !== -1 ? '"' : "'";
                newTag = newTag.replace(hrefMatch[0], `href=${quote}${href}${quote}`);
            } else {
                newTag = newTag.replace(/\s*>\s*$/, ` href="${href}">`);
            }
        }

        out = out.slice(0, tagStart) + newTag + out.slice(tagEnd + 1);

        if (typeof innerText !== 'undefined') out = replaceElementContentString(out, id, innerText);
        return out;
    };

    let result = html;

    result = replaceElementContentString(result, 'navLogo', data.name ? (data.name.toUpperCase()) : '');
    result = replaceElementContentString(result, 'profileName', data.name || '');
    result = replaceElementContentString(result, 'footerName', data.name || '');
    result = replaceElementContentString(result, 'profileTitle', data.title || '');
    result = replaceElementContentString(result, 'profileCred', data.credentials || '');
    result = replaceElementContentString(result, 'locationText', data.location || '');
    result = replaceElementContentString(result, 'aboutContent', data.about || '');

    result = replaceElementSrcString(result, 'profileImage', data.profileImage || '');

    result = replaceAnchorContentAndHref(result, 'footerEmail', data.email ? `mailto:${data.email}` : '', data.email ? `<i class="fas fa-envelope"></i> ${data.email}` : '');

    // Fallback: replace simple placeholder tokens as earlier
    result = result.replace(/\[Attorney Name\]/g, data.name || '');
    result = result.replace(/\[Professional Title\]/g, data.title || '');
    result = result.replace(/\[Location\]/g, data.location || '');
    result = result.replace(/\[your\.email@example\.com\]/g, data.email || '');
    result = result.replace(/\[Professional Summary\]/g, data.about || '');

    return result;
}


// Initialize UI helpers after DOM is ready and editorInstance exists
function initFormHelpersWhenReady() {
    const maxWait = 5000; // ms
    const interval = 150; // ms
    let waited = 0;

    const id = setInterval(() => {
        const headerActions = document.querySelector('.inline-editor-header .editor-actions');
        if (headerActions && typeof editorInstance !== 'undefined' && editorInstance) {
            ensureFormToggleUI();
            // default to form
            setEditorMode('form');
            clearInterval(id);
            return;
        }

        waited += interval;
        if (waited >= maxWait) {
            clearInterval(id);
            // final attempt: still try to insert if editor-section exists
            if (document.getElementById('editor-section')) {
                try { ensureFormToggleUI(); setEditorMode('form'); } catch (e) { /* ignore */ }
            }
        }
    }, interval);
}

// Start form helpers
initFormHelpersWhenReady();