// Simplified form workflow - Single text canvas approach
// Exports: saveFormDataToIndexedDB, debouncedLiveApply, debouncedAutoSync, applyFormChangesToCode, loadFormDataFromIndexedDB, renderSimpleForm

try {
    console.debug('form-functions.js module loaded (single canvas version)');
} catch (e) { /* ignore */ }

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Simple debounce utility
 */
function debounce(fn, wait) {
    let timeout = null;
    return function(...args) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
    };
}

// ============================================================================
// UNDO/REDO SYSTEM WITH LOCALSTORAGE PERSISTENCE
// ============================================================================

/**
 * Undo/Redo history manager for form edits
 */
class FormHistoryManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50;
        this.storageKey = 'formEditHistory';
        this.loadFromStorage();
    }
    
    /**
     * Add a new state to history
     */
    addState(content) {
        // Remove any states after current index (when user makes new change after undo)
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        // Add new state
        this.history.push(content);
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
        
        this.saveToStorage();
    }
    
    /**
     * Undo to previous state
     */
    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            return this.history[this.currentIndex];
        }
        return null;
    }
    
    /**
     * Redo to next state
     */
    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            return this.history[this.currentIndex];
        }
        return null;
    }
    
    /**
     * Check if undo is available
     */
    canUndo() {
        return this.currentIndex > 0;
    }
    
    /**
     * Check if redo is available
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    
    /**
     * Get current state
     */
    getCurrentState() {
        return this.currentIndex >= 0 ? this.history[this.currentIndex] : null;
    }
    
    /**
     * Clear all history
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.saveToStorage();
    }
    
    /**
     * Save history to localStorage
     */
    saveToStorage() {
        try {
            const data = {
                history: this.history,
                currentIndex: this.currentIndex
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save form history to localStorage:', e);
        }
    }
    
    /**
     * Load history from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.history = data.history || [];
                this.currentIndex = data.currentIndex || -1;
            }
        } catch (e) {
            console.warn('Failed to load form history from localStorage:', e);
        }
    }
}

// Global history manager instance
let formHistoryManager = null;

/**
 * Get or create the form history manager
 */
function getFormHistoryManager() {
    if (!formHistoryManager) {
        formHistoryManager = new FormHistoryManager();
    }
    return formHistoryManager;
}

/**
 * Strip [[[...]]] markers from text, returning just the content
 */
export function stripMarkers(text) {
    return text.replace(/\[\[\[(.*?)\]\]\]/g, '$1');
}

/**
 * Helper to escape HTML for safe display
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// CORE HELPER: Extract all [[[...]]] markers in order
// ============================================================================

/**
 * Extract all [[[...]]] markers from HTML in the order they appear
 * Returns array of { text, index, fullMatch }
 */
function extractAllMarkers(html) {
    const markers = [];
    const regex = /\[\[\[(.*?)\]\]\]/g;
    let match;
    let index = 0;
    
    // Exclude markers in iframe src attributes
    const cleanedHtml = html.replace(/<iframe[^>]*src="\[\[\[.*?\]\]\]"[^>]*>/g, '');
    
    while ((match = regex.exec(cleanedHtml)) !== null) {
        // Skip empty markers
        if (match[1].trim() !== '') {
            markers.push({
                text: match[1],           // The content inside [[[...]]]
                index: index,             // Sequential index
                fullMatch: match[0],      // The full [[[...]]] string
                position: match.index     // Position in HTML string
            });
            index++;
        }
    }
    
    return markers;
}

/**
 * Replace all [[[...]]] markers in HTML with new values from array
 * Maintains the order and structure of the HTML
 * If a value is empty/null, the entire line containing that marker is removed
 */
function replaceAllMarkers(html, newValues) {
    let result = html;
    let index = 0;
    const linesToRemove = [];
    
    // First pass: identify which markers should be removed
    const markerPositions = [];
    const regex = /\[\[\[(.*?)\]\]\]/g;
    let match;
    let markerIndex = 0;
    
    while ((match = regex.exec(html)) !== null) {
        markerPositions.push({
            index: markerIndex,
            position: match.index,
            fullMatch: match[0],
            shouldRemove: markerIndex < newValues.length && (!newValues[markerIndex] || newValues[markerIndex].trim() === '')
        });
        markerIndex++;
    }
    
    // Second pass: replace markers or mark lines for removal
    index = 0;
    result = result.replace(/\[\[\[(.*?)\]\]\]/g, (match, content) => {
        if (index < newValues.length) {
            const newValue = newValues[index];
            const shouldRemove = !newValue || newValue.trim() === '';
            index++;
            
            if (shouldRemove) {
                // Commented out to prevent automatic deletion when text is cleared
                // return `___REMOVE_LINE_${index - 1}___`;
                return `[[[]]]`; // Return empty marker instead of removing
            }
            return `[[[${newValue}]]]`;
        }
        return match; // Keep original if no replacement available
    });
    
    // Third pass: remove entire lines that contain removal markers
    // Commented out to prevent automatic deletion when text is cleared
    // const lines = result.split('\n');
    // const filteredLines = lines.filter(line => {
    //     return !line.includes('___REMOVE_LINE_');
    // });
    // result = filteredLines.join('\n');
    
    return result;
}

// ============================================================================
// MAIN FORM RENDERING FUNCTION
// ============================================================================

/**
 * Main function: Parse HTML code and render individual form fields in separate boxes
 */
export async function renderSimpleForm() {
    const canvas = document.getElementById('form-canvas');
    if (!canvas) return;
    
    // Prevent re-entrant rendering
    if (canvas.dataset.renderLocked === '1') {
        console.debug('renderSimpleForm: render locked, skipping');
        return;
    }
    canvas.dataset.renderLocked = '1';
    canvas.innerHTML = '';
    
    const editorInstance = window.portfolioEditorInstance;
    const baseHtml = editorInstance?.fullHtmlWithData || document.getElementById('code-editor')?.value || '';
    
    if (!baseHtml.trim()) {
        canvas.innerHTML = `<div class="preview-placeholder"><i class="fas fa-info-circle"></i><p>No HTML code to edit. Please load a template or enter code.</p></div>`;
        delete canvas.dataset.renderLocked;
        return;
    }
    
    console.debug('renderSimpleForm: extracting markers...');
    
    try {
        // Extract all [[[...]]] markers in order
        const markers = extractAllMarkers(baseHtml);
        
        console.debug(`renderSimpleForm: found ${markers.length} editable markers`);
        
        if (markers.length === 0) {
            canvas.innerHTML = `<div class="preview-placeholder"><i class="fas fa-info-circle"></i><p>No editable text markers [[[...]]] found in the HTML.</p></div>`;
            delete canvas.dataset.renderLocked;
            return;
        }
        
        // Create form container
        const container = document.createElement('div');
        container.className = 'form-canvas-container';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '12px';
        container.style.padding = '10px';
        container.style.height = '100%';
        
        // Create header with info
        const header = document.createElement('div');
        header.style.padding = '8px 12px';
        header.style.background = '#f0f7ff';
        header.style.border = '1px solid #b3d9ff';
        header.style.borderRadius = '4px';
        header.style.fontSize = '13px';
        header.style.color = '#0066cc';
        header.innerHTML = `
            <i class="fas fa-info-circle"></i> 
            <strong>Edit Mode:</strong> Each editable field has its own box below. 
            Changes apply live to the preview. Click the Delete button to remove a field from the code.
            Use Ctrl+Z/Ctrl+Y or the buttons below to undo/redo changes.
        `;
        
        // Initialize history manager
        const historyManager = getFormHistoryManager();
        
        // Create scrollable fields container
        const fieldsContainer = document.createElement('div');
        fieldsContainer.id = 'form-fields-container';
        fieldsContainer.style.display = 'flex';
        fieldsContainer.style.flexDirection = 'column';
        fieldsContainer.style.gap = '16px';
        fieldsContainer.style.overflowY = 'auto';
        fieldsContainer.style.maxHeight = '500px';
        fieldsContainer.style.padding = '8px';
        fieldsContainer.style.background = '#fafafa';
        fieldsContainer.style.borderRadius = '4px';
        fieldsContainer.style.border = '1px solid #e0e0e0';
        
        // Track if we're programmatically setting values (to avoid adding to history)
        let isProgrammaticChange = false;
        
        // Function to collect all field values
        const collectFieldValues = () => {
            const fields = fieldsContainer.querySelectorAll('.form-field-input');
            return Array.from(fields).map(field => field.value);
        };
        
        // Function to save current state to history
        const saveToHistory = () => {
            if (!isProgrammaticChange) {
                const values = collectFieldValues();
                historyManager.addState(JSON.stringify(values));
                updateUndoRedoButtons();
            }
        };
        
        // Debounced version of saveToHistory
        const debouncedSaveToHistory = debounce(saveToHistory, 1000);
        
        // Function to handle field changes
        const handleFieldChange = () => {
            debouncedSaveToHistory();
            debouncedAutoSyncFields();
        };
        
        // Create individual field boxes
        markers.forEach((marker, index) => {
            const fieldBox = document.createElement('div');
            fieldBox.className = 'form-field-box';
            fieldBox.style.display = 'flex';
            fieldBox.style.flexDirection = 'column';
            fieldBox.style.gap = '6px';
            fieldBox.style.padding = '12px';
            fieldBox.style.background = '#ffffff';
            fieldBox.style.border = '2px solid #ddd';
            fieldBox.style.borderRadius = '6px';
            fieldBox.style.transition = 'border-color 0.2s';
            
            // Field label
            const label = document.createElement('div');
            label.style.fontSize = '12px';
            label.style.fontWeight = '600';
            label.style.color = '#555';
            label.style.display = 'flex';
            label.style.justifyContent = 'space-between';
            label.style.alignItems = 'center';
            label.innerHTML = `
                <span><i class="fas fa-edit"></i> Field ${index + 1}</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="char-count" style="font-weight: 400; color: #999; font-size: 11px;">
                        ${marker.text.length} characters
                    </span>
                    <button class="delete-field-btn" title="Delete this field" style="
                        background: #ff4444;
                        color: white;
                        border: none;
                        border-radius: 3px;
                        padding: 2px 6px;
                        font-size: 10px;
                        cursor: pointer;
                        transition: background 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 3px;
                    ">
                        <i class="fas fa-trash" style="font-size: 9px;"></i>
                        Delete
                    </button>
                </div>
            `;
            
            // Delete button functionality
            const deleteBtn = label.querySelector('.delete-field-btn');
            deleteBtn.addEventListener('mouseenter', () => {
                deleteBtn.style.background = '#cc0000';
            });
            deleteBtn.addEventListener('mouseleave', () => {
                deleteBtn.style.background = '#ff4444';
            });
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Delete Field ${index + 1}?\n\nThis will clear the field content and remove it from the code.`)) {
                    input.value = '';
                    const charCount = label.querySelector('.char-count');
                    charCount.textContent = '0 characters';
                    handleFieldChange();
                }
            });
            
            // Field input (textarea for multi-line support)
            const input = document.createElement('textarea');
            input.className = 'form-field-input';
            input.dataset.fieldIndex = index;
            input.value = marker.text;
            input.style.width = '100%';
            input.style.minHeight = '60px';
            input.style.padding = '8px';
            input.style.border = '1px solid #ccc';
            input.style.borderRadius = '4px';
            input.style.fontSize = '14px';
            input.style.fontFamily = 'inherit';
            input.style.resize = 'vertical';
            input.style.lineHeight = '1.5';
            
            // Update character count on input
            input.addEventListener('input', () => {
                const charCount = label.querySelector('.char-count');
                charCount.textContent = `${input.value.length} characters`;
                handleFieldChange();
            });
            
            // Highlight on focus
            input.addEventListener('focus', () => {
                fieldBox.style.borderColor = '#4CAF50';
                fieldBox.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.1)';
            });
            
            input.addEventListener('blur', () => {
                fieldBox.style.borderColor = '#ddd';
                fieldBox.style.boxShadow = 'none';
            });
            
            fieldBox.appendChild(label);
            fieldBox.appendChild(input);
            fieldsContainer.appendChild(fieldBox);
        });
        
        // Initialize history with current state
        if (historyManager.getCurrentState() === null) {
            const initialValues = collectFieldValues();
            historyManager.addState(JSON.stringify(initialValues));
        }
        
        // Create info footer
        const footer = document.createElement('div');
        footer.style.padding = '8px 12px';
        footer.style.background = '#f9f9f9';
        footer.style.border = '1px solid #e6e6e6';
        footer.style.borderRadius = '4px';
        footer.style.fontSize = '12px';
        footer.style.color = '#666';
        footer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>
                    <i class="fas fa-lightbulb"></i> 
                    <strong>Tip:</strong> Each field is independent. Use the Delete button to clear a field and remove it from the code.
                </span>
                <span id="field-count-display" style="font-weight: 600; color: #0066cc;">
                    ${markers.length} fields
                </span>
            </div>
        `;
        
        // Add control buttons
        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.gap = '8px';
        controls.style.marginTop = '8px';
        
        // Function to update undo/redo button states
        const updateUndoRedoButtons = () => {
            const undoBtn = document.getElementById('form-undo-btn');
            const redoBtn = document.getElementById('form-redo-btn');
            if (undoBtn) undoBtn.disabled = !historyManager.canUndo();
            if (redoBtn) redoBtn.disabled = !historyManager.canRedo();
        };
        
        // Undo button
        const undoBtn = document.createElement('button');
        undoBtn.id = 'form-undo-btn';
        undoBtn.className = 'btn btn-secondary';
        undoBtn.innerHTML = '<i class="fas fa-undo"></i> Undo';
        undoBtn.title = 'Undo last change (Ctrl+Z)';
        undoBtn.disabled = !historyManager.canUndo();
        undoBtn.addEventListener('click', () => {
            const prevState = historyManager.undo();
            if (prevState !== null) {
                isProgrammaticChange = true;
                const values = JSON.parse(prevState);
                const fields = fieldsContainer.querySelectorAll('.form-field-input');
                fields.forEach((field, idx) => {
                    if (idx < values.length) {
                        field.value = values[idx];
                        // Update character count
                        const fieldBox = field.closest('.form-field-box');
                        const charCount = fieldBox.querySelector('.char-count');
                        charCount.textContent = `${field.value.length} characters`;
                    }
                });
                isProgrammaticChange = false;
                updateUndoRedoButtons();
                debouncedAutoSyncFields();
            }
        });
        
        // Redo button
        const redoBtn = document.createElement('button');
        redoBtn.id = 'form-redo-btn';
        redoBtn.className = 'btn btn-secondary';
        redoBtn.innerHTML = '<i class="fas fa-redo"></i> Redo';
        redoBtn.title = 'Redo last undone change (Ctrl+Y)';
        redoBtn.disabled = !historyManager.canRedo();
        redoBtn.addEventListener('click', () => {
            const nextState = historyManager.redo();
            if (nextState !== null) {
                isProgrammaticChange = true;
                const values = JSON.parse(nextState);
                const fields = fieldsContainer.querySelectorAll('.form-field-input');
                fields.forEach((field, idx) => {
                    if (idx < values.length) {
                        field.value = values[idx];
                        // Update character count
                        const fieldBox = field.closest('.form-field-box');
                        const charCount = fieldBox.querySelector('.char-count');
                        charCount.textContent = `${field.value.length} characters`;
                    }
                });
                isProgrammaticChange = false;
                updateUndoRedoButtons();
                debouncedAutoSyncFields();
            }
        });
        
        // Global keyboard shortcuts for undo/redo
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undoBtn.click();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redoBtn.click();
            }
        };
        fieldsContainer.addEventListener('keydown', handleKeyDown);
        
        const applyBtn = document.createElement('button');
        applyBtn.className = 'btn btn-primary';
        applyBtn.innerHTML = '<i class="fas fa-check"></i> Apply Changes to Code';
        applyBtn.style.flex = '1';
        applyBtn.addEventListener('click', () => applyFormChangesToCode());
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn-secondary';
        resetBtn.innerHTML = '<i class="fas fa-sync"></i> Reset';
        resetBtn.title = 'Reset to current code state';
        resetBtn.addEventListener('click', () => {
            historyManager.clear();
            renderSimpleForm();
        });
        
        controls.appendChild(undoBtn);
        controls.appendChild(redoBtn);
        controls.appendChild(applyBtn);
        controls.appendChild(resetBtn);
        
        // Assemble the form
        container.appendChild(header);
        container.appendChild(fieldsContainer);
        container.appendChild(footer);
        container.appendChild(controls);
        
        // Make canvas scrollable
        canvas.style.overflowY = 'auto';
        canvas.style.maxHeight = 'calc(100vh - 180px)';
        canvas.style.display = 'flex';
        canvas.style.flexDirection = 'column';
        
        canvas.appendChild(container);
        
        console.debug('renderSimpleForm: complete');
        
    } catch (e) {
        console.error('renderSimpleForm failed:', e);
        canvas.innerHTML = `<div class="preview-placeholder"><i class="fas fa-exclamation-triangle"></i><p>Error parsing HTML: ${escapeHtml(e.message)}</p></div>`;
    }
    
    delete canvas.dataset.renderLocked;
}

// ============================================================================
// APPLY FORM CHANGES TO CODE
// ============================================================================

/**
 * Apply all form field changes back to the HTML code
 */
export async function applyFormChangesToCode() {
    const editorInstance = window.portfolioEditorInstance;
    if (!editorInstance) {
        console.warn('applyFormChangesToCode: no editor instance');
        return;
    }
    
    // Get all field inputs from the form
    const fieldsContainer = document.getElementById('form-fields-container');
    if (!fieldsContainer) {
        console.warn('applyFormChangesToCode: no fields container found');
        return;
    }
    
    console.debug('applyFormChangesToCode: starting...');
    
    try {
        // Get current HTML
        const baseHtml = editorInstance.fullHtmlWithData || document.getElementById('code-editor')?.value || '';
        
        // Collect all field values
        const fields = fieldsContainer.querySelectorAll('.form-field-input');
        const fieldValues = Array.from(fields).map(field => field.value.trim());
        
        console.debug(`applyFormChangesToCode: collected ${fieldValues.length} field values`);
        
        // Replace all markers with new values
        const updatedHtml = replaceAllMarkers(baseHtml, fieldValues);
        
        console.debug(`applyFormChangesToCode: applied ${fieldValues.length} changes`);
        
        // Update editor instance
        editorInstance.fullHtmlWithData = updatedHtml;
        
        // Strip protected code for code editor display
        const stripped = editorInstance.stripProtectedCode(updatedHtml);
        const codeEditor = document.getElementById('code-editor');
        if (codeEditor) {
            codeEditor.value = stripped;
        }
        
        // Update history for undo/redo
        editorInstance.addToHistory(stripped, updatedHtml);
        
        // Update preview (strip markers for clean display)
        const previewHtml = stripMarkers(updatedHtml);
        editorInstance.updatePreview(previewHtml);
        
        // Save to storage
        await editorInstance.saveToLocalStorage();
        
        // Show success notification
        if (editorInstance.showNotification) {
            const nonEmptyCount = fieldValues.filter(v => v !== '').length;
            const emptyCount = fieldValues.length - nonEmptyCount;
            let message = `Applied ${nonEmptyCount} field(s) to code`;
            if (emptyCount > 0) {
                message += ` (${emptyCount} empty field(s) removed)`;
            }
            editorInstance.showNotification(message, 'success');
        }
        
        console.debug('applyFormChangesToCode: complete');
        
    } catch (e) {
        console.error('applyFormChangesToCode failed:', e);
        alert('Failed to apply changes. See console for details.');
    }
}

// ============================================================================
// LIVE PREVIEW (DEBOUNCED)
// ============================================================================

/**
 * Auto-sync form changes to BOTH code editor and preview
 * This keeps everything in sync with form edits in real-time
 */
async function autoSyncFormToCode() {
    const editorInstance = window.portfolioEditorInstance;
    if (!editorInstance) return;
    
    // Check for new field-based form
    const fieldsContainer = document.getElementById('form-fields-container');
    if (fieldsContainer) {
        return autoSyncFormFieldsToCode();
    }
    
    // Legacy support for old textarea-based form
    const textarea = document.getElementById('form-text-canvas');
    if (!textarea) return;
    
    try {
        // Get current HTML
        const baseHtml = editorInstance.fullHtmlWithData || document.getElementById('code-editor')?.value || '';
        
        // Get new values from textarea (split by divider lines for field separation)
        const dividerPattern = /^─+$/;
        const lines = textarea.value
            .split('\n')
            .filter(line => !dividerPattern.test(line.trim())) // Remove divider lines
            .join('\n')
            .split(/\n{2,}/) // Split by multiple newlines (field separators)
            .map(line => line.trim());
        
        // Replace all markers with new values
        const updatedHtmlWithMarkers = replaceAllMarkers(baseHtml, lines);
        
        // Update fullHtmlWithData (with markers for persistence)
        editorInstance.fullHtmlWithData = updatedHtmlWithMarkers;
        
        // Update code editor (strip protected code for display)
        const stripped = editorInstance.stripProtectedCode(updatedHtmlWithMarkers);
        const codeEditor = document.getElementById('code-editor');
        if (codeEditor) {
            // Temporarily disable the input event to prevent recursion
            const originalValue = codeEditor.value;
            if (originalValue !== stripped) {
                codeEditor.value = stripped;
            }
        }
        
        // Update preview (strip markers for clean display)
        const previewHtml = stripMarkers(updatedHtmlWithMarkers);
        editorInstance.updatePreview(previewHtml);
        
        // Save to storage (debounced by editor instance)
        editorInstance.saveToLocalStorage();
        
    } catch (e) {
        console.warn('autoSyncFormToCode failed:', e);
    }
}

/**
 * Auto-sync individual form fields to code editor and preview
 * Works with the new field-based form system
 */
async function autoSyncFormFieldsToCode() {
    const editorInstance = window.portfolioEditorInstance;
    if (!editorInstance) return;
    
    const fieldsContainer = document.getElementById('form-fields-container');
    if (!fieldsContainer) return;
    
    try {
        // Get current HTML
        const baseHtml = editorInstance.fullHtmlWithData || document.getElementById('code-editor')?.value || '';
        
        // Collect all field values
        const fields = fieldsContainer.querySelectorAll('.form-field-input');
        const fieldValues = Array.from(fields).map(field => field.value.trim());
        
        // Replace all markers with new values
        const updatedHtmlWithMarkers = replaceAllMarkers(baseHtml, fieldValues);
        
        // Update fullHtmlWithData (with markers for persistence)
        editorInstance.fullHtmlWithData = updatedHtmlWithMarkers;
        
        // Update code editor (strip protected code for display)
        const stripped = editorInstance.stripProtectedCode(updatedHtmlWithMarkers);
        const codeEditor = document.getElementById('code-editor');
        if (codeEditor) {
            const originalValue = codeEditor.value;
            if (originalValue !== stripped) {
                codeEditor.value = stripped;
            }
        }
        
        // Update preview (strip markers for clean display)
        const previewHtml = stripMarkers(updatedHtmlWithMarkers);
        editorInstance.updatePreview(previewHtml);
        
        // Save to storage (debounced by editor instance)
        editorInstance.saveToLocalStorage();
        
    } catch (e) {
        console.warn('autoSyncFormFieldsToCode failed:', e);
    }
}

// ============================================================================
// INDEXEDDB PERSISTENCE (SIMPLIFIED)
// ============================================================================

/**
 * Save form data to IndexedDB (simplified - just saves the current state)
 */
export async function saveFormDataToIndexedDB() {
    const editorInstance = window.portfolioEditorInstance;
    if (!editorInstance || !editorInstance.db) return;
    
    const textarea = document.getElementById('form-text-canvas');
    if (!textarea) return;
    
    try {
        // Save textarea content
        const formData = {
            content: textarea.value,
            markerCount: textarea.dataset.markerCount
        };
        
        // Save to IndexedDB
        await editorInstance.saveToIndexedDB('formData', {
            id: 'current',
            data: formData,
            timestamp: Date.now()
        });
        
        console.debug('saveFormDataToIndexedDB: saved form data');
        
    } catch (e) {
        console.warn('saveFormDataToIndexedDB failed:', e);
    }
}

/**
 * Load form data from IndexedDB
 */
export async function loadFormDataFromIndexedDB() {
    const editorInstance = window.portfolioEditorInstance;
    if (!editorInstance || !editorInstance.db) return null;
    
    try {
        const saved = await editorInstance.loadFromIndexedDB('formData', 'current');
        return saved && saved.data ? saved.data : null;
    } catch (e) {
        console.warn('loadFormDataFromIndexedDB failed:', e);
        return null;
    }
}

// ============================================================================
// DEBOUNCED VERSIONS FOR PERFORMANCE
// ============================================================================

/**
 * Debounced version of autoSyncFormToCode for real-time sync
 * Uses 500ms delay to balance responsiveness with performance
 */
export const debouncedAutoSync = debounce(autoSyncFormToCode, 500);

/**
 * Debounced version of autoSyncFormFieldsToCode for real-time sync
 * Uses 500ms delay to balance responsiveness with performance
 */
const debouncedAutoSyncFields = debounce(autoSyncFormFieldsToCode, 500);

/**
 * Legacy debounced live apply (kept for backward compatibility)
 * This is now just an alias to debouncedAutoSync
 */
export const debouncedLiveApply = debouncedAutoSync;

/**
 * Debounced function to add state to history
 * Uses 1000ms delay to avoid adding too many history entries during typing
 */
const debouncedAddToHistory = debounce((content) => {
    const historyManager = getFormHistoryManager();
    historyManager.addState(content);
}, 1000);

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    renderSimpleForm,
    applyFormChangesToCode,
    saveFormDataToIndexedDB,
    loadFormDataFromIndexedDB,
    debouncedLiveApply,
    debouncedAutoSync,
    stripMarkers
};