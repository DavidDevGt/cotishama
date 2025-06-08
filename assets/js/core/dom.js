import { DOM_IDS } from './constants.js';

/**
 * Class responsible for managing and caching DOM element references.
 * Provides a centralized way to access DOM elements using predefined IDs.
 * Enhanced with utility methods for common DOM operations.
 */
export class DOMElements {
    /**
     * Creates a new DOMElements instance and initializes element references.
     */
    constructor() {
        /**
         * Cache of DOM element references.
         * @private
         * @type {Object.<string, HTMLElement>}
         */
        this.elements = {};
        
        /**
         * Event listeners registry for cleanup
         * @private
         * @type {Map<HTMLElement, Array<{event: string, handler: Function, options?: Object}>>}
         */
        this.eventListeners = new Map();
        
        /**
         * Observer for DOM changes
         * @private
         * @type {MutationObserver}
         */
        this.observer = null;
        
        this.initializeElements();
        this.setupDOMObserver();
    }

    /**
     * Initializes the elements cache by querying DOM elements using IDs from DOM_IDS.
     * Stores references in lowercase keys for case-insensitive access.
     * @private
     */
    initializeElements() {
        Object.entries(DOM_IDS).forEach(([key, id]) => {
            const element = document.getElementById(id);
            if (element) {
                this.elements[key.toLowerCase()] = element;
            } else {
                console.warn(`DOM element with ID '${id}' not found for key '${key}'`);
            }
        });
    }

    /**
     * Sets up DOM observer to detect changes and update cache
     * @private
     */
    setupDOMObserver() {
        if (typeof MutationObserver !== 'undefined') {
            this.observer = new MutationObserver((mutations) => {
                let shouldRefresh = false;
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE && node.id) {
                                shouldRefresh = true;
                            }
                        });
                    }
                });
                if (shouldRefresh) {
                    this.refreshCache();
                }
            });
            
            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Retrieves a cached DOM element reference.
     * @param {string} elementKey - The key of the element to retrieve (case-insensitive)
     * @returns {HTMLElement|null} The DOM element if found, null otherwise
     */
    get(elementKey) {
        const element = this.elements[elementKey.toLowerCase()];
        if (!element) {
            console.warn(`Element '${elementKey}' not found in cache`);
        }
        return element;
    }

    /**
     * Checks if an element exists in the cache
     * @param {string} elementKey - The key to check
     * @returns {boolean} True if element exists
     */
    has(elementKey) {
        return !!this.elements[elementKey.toLowerCase()];
    }

    /**
     * Gets all cached elements
     * @returns {Object.<string, HTMLElement>} All cached elements
     */
    getAll() {
        return { ...this.elements };
    }

    /**
     * Gets the value of an input element
     * @param {string} elementKey - The key of the input element
     * @returns {string|null} The value or null if element doesn't exist
     */
    getValue(elementKey) {
        const element = this.get(elementKey);
        return element && ('value' in element) ? element.value : null;
    }

    /**
     * Sets the value of an input element
     * @param {string} elementKey - The key of the input element
     * @param {string|number} value - The value to set
     * @returns {boolean} True if successful
     */
    setValue(elementKey, value) {
        const element = this.get(elementKey);
        if (element && ('value' in element)) {
            element.value = value;
            // Trigger input event for frameworks/libraries that listen to it
            element.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
        }
        return false;
    }

    /**
     * Gets the text content of an element
     * @param {string} elementKey - The key of the element
     * @returns {string|null} The text content or null
     */
    getText(elementKey) {
        const element = this.get(elementKey);
        return element ? element.textContent : null;
    }

    /**
     * Sets the text content of an element
     * @param {string} elementKey - The key of the element
     * @param {string} text - The text to set
     * @returns {boolean} True if successful
     */
    setText(elementKey, text) {
        const element = this.get(elementKey);
        if (element) {
            element.textContent = text;
            return true;
        }
        return false;
    }

    /**
     * Gets the HTML content of an element
     * @param {string} elementKey - The key of the element
     * @returns {string|null} The HTML content or null
     */
    getHTML(elementKey) {
        const element = this.get(elementKey);
        return element ? element.innerHTML : null;
    }

    /**
     * Sets the HTML content of an element
     * @param {string} elementKey - The key of the element
     * @param {string} html - The HTML to set
     * @returns {boolean} True if successful
     */
    setHTML(elementKey, html) {
        const element = this.get(elementKey);
        if (element) {
            element.innerHTML = html;
            return true;
        }
        return false;
    }

    /**
     * Clears the content of an element
     * @param {string} elementKey - The key of the element
     * @returns {boolean} True if successful
     */
    clear(elementKey) {
        const element = this.get(elementKey);
        if (element) {
            if ('value' in element) {
                element.value = '';
            } else {
                element.innerHTML = '';
            }
            return true;
        }
        return false;
    }

    /**
     * Clears multiple elements at once
     * @param {string[]} elementKeys - Array of element keys to clear
     * @returns {Object} Success status for each element
     */
    clearMultiple(elementKeys) {
        const results = {};
        elementKeys.forEach(key => {
            results[key] = this.clear(key);
        });
        return results;
    }

    /**
     * Shows an element (removes hidden/display:none)
     * @param {string} elementKey - The key of the element
     * @param {string} displayType - The display type ('block', 'inline', etc.)
     * @returns {boolean} True if successful
     */
    show(elementKey, displayType = 'block') {
        const element = this.get(elementKey);
        if (element) {
            element.style.display = displayType;
            element.removeAttribute('hidden');
            return true;
        }
        return false;
    }

    /**
     * Hides an element
     * @param {string} elementKey - The key of the element
     * @returns {boolean} True if successful
     */
    hide(elementKey) {
        const element = this.get(elementKey);
        if (element) {
            element.style.display = 'none';
            return true;
        }
        return false;
    }

    /**
     * Toggles element visibility
     * @param {string} elementKey - The key of the element
     * @param {string} displayType - The display type when showing
     * @returns {boolean} True if now visible, false if now hidden
     */
    toggle(elementKey, displayType = 'block') {
        const element = this.get(elementKey);
        if (element) {
            const isHidden = element.style.display === 'none' || 
                            element.hasAttribute('hidden');
            if (isHidden) {
                this.show(elementKey, displayType);
                return true;
            } else {
                this.hide(elementKey);
                return false;
            }
        }
        return false;
    }

    /**
     * Adds a CSS class to an element
     * @param {string} elementKey - The key of the element
     * @param {string|string[]} className - Class name(s) to add
     * @returns {boolean} True if successful
     */
    addClass(elementKey, className) {
        const element = this.get(elementKey);
        if (element) {
            if (Array.isArray(className)) {
                element.classList.add(...className);
            } else {
                element.classList.add(className);
            }
            return true;
        }
        return false;
    }

    /**
     * Removes a CSS class from an element
     * @param {string} elementKey - The key of the element
     * @param {string|string[]} className - Class name(s) to remove
     * @returns {boolean} True if successful
     */
    removeClass(elementKey, className) {
        const element = this.get(elementKey);
        if (element) {
            if (Array.isArray(className)) {
                element.classList.remove(...className);
            } else {
                element.classList.remove(className);
            }
            return true;
        }
        return false;
    }

    /**
     * Toggles a CSS class on an element
     * @param {string} elementKey - The key of the element
     * @param {string} className - Class name to toggle
     * @returns {boolean|null} True if class was added, false if removed, null if element not found
     */
    toggleClass(elementKey, className) {
        const element = this.get(elementKey);
        if (element) {
            return element.classList.toggle(className);
        }
        return null;
    }

    /**
     * Checks if an element has a CSS class
     * @param {string} elementKey - The key of the element
     * @param {string} className - Class name to check
     * @returns {boolean} True if element has the class
     */
    hasClass(elementKey, className) {
        const element = this.get(elementKey);
        return element ? element.classList.contains(className) : false;
    }

    /**
     * Adds an event listener to an element with automatic cleanup tracking
     * @param {string} elementKey - The key of the element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object|boolean} options - Event options
     * @returns {boolean} True if successful
     */
    on(elementKey, event, handler, options = false) {
        const element = this.get(elementKey);
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler, options);
            
            // Track for cleanup
            if (!this.eventListeners.has(element)) {
                this.eventListeners.set(element, []);
            }
            this.eventListeners.get(element).push({ event, handler, options });
            
            return true;
        }
        return false;
    }

    /**
     * Remove an event listener from an element
     * @param {string} elementKey - The key of the element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object|boolean} options - Event options
     * @returns {boolean} True if successful
     */
    off(elementKey, event, handler, options = false) {
        const element = this.get(elementKey);
        if (element) {
            element.removeEventListener(event, handler, options);
            
            // Remove from tracking
            if (this.eventListeners.has(element)) {
                const listeners = this.eventListeners.get(element);
                const index = listeners.findIndex(l => 
                    l.event === event && l.handler === handler
                );
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
            
            return true;
        }
        return false;
    }

    /**
     * Focuses an element
     * @param {string} elementKey - The key of the element
     * @returns {boolean} True if successful
     */
    focus(elementKey) {
        const element = this.get(elementKey);
        if (element && typeof element.focus === 'function') {
            element.focus();
            return true;
        }
        return false;
    }

    /**
     * Validates that all required elements exist
     * @param {string[]} requiredKeys - Array of required element keys
     * @returns {Object} Validation result
     */
    validateElements(requiredKeys = []) {
        const missing = [];
        const existing = [];
        
        requiredKeys.forEach(key => {
            if (this.has(key)) {
                existing.push(key);
            } else {
                missing.push(key);
            }
        });
        
        return {
            isValid: missing.length === 0,
            existing,
            missing,
            total: requiredKeys.length
        };
    }

    /**
     * Refreshes the element cache
     * @returns {Object} Results of the refresh
     */
    refreshCache() {
        const oldKeys = Object.keys(this.elements);
        this.elements = {};
        this.initializeElements();
        const newKeys = Object.keys(this.elements);
        
        return {
            added: newKeys.filter(key => !oldKeys.includes(key)),
            removed: oldKeys.filter(key => !newKeys.includes(key)),
            total: newKeys.length
        };
    }

    /**
     * Gets debug information about the DOM cache
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        const elements = Object.keys(this.elements);
        const listenerCount = Array.from(this.eventListeners.values())
            .reduce((total, listeners) => total + listeners.length, 0);
        
        return {
            elementCount: elements.length,
            elements: elements,
            eventListenerCount: listenerCount,
            observerActive: !!this.observer,
            missingElements: Object.entries(DOM_IDS)
                .filter(([key]) => !this.has(key))
                .map(([key, id]) => ({ key, id }))
        };
    }

    /**
     * Cleanup method to remove event listeners and observers
     * Call this when the instance is no longer needed
     */
    destroy() {
        // Remove all tracked event listeners
        this.eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.eventListeners.clear();
        
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // Clear element cache
        this.elements = {};
    }

    /**
     * Create a new DOM element with optional attributes, classes, text or HTML.
     * @param {string} tagName
     * @param {Object} options - { text, html, className, attributes, dataset }
     * @returns {HTMLElement}
     */
    createElement(tagName, options = {}) {
        const el = document.createElement(tagName);
        if (options.className) {
            const cls = Array.isArray(options.className) ? options.className : [options.className];
            el.classList.add(...cls);
        }
        if (options.text !== undefined) el.textContent = options.text;
        if (options.html !== undefined) el.innerHTML = options.html;
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, val]) => el.setAttribute(key, val));
        }
        if (options.dataset) {
            Object.entries(options.dataset).forEach(([key, val]) => el.dataset[key] = val);
        }
        return el;
    }

    /**
     * Append a child element to a cached parent.
     * @param {string} parentKey
     * @param {HTMLElement} child
     * @returns {boolean}
     */
    append(parentKey, child) {
        const parent = this.get(parentKey);
        if (parent) {
            parent.appendChild(child);
            return true;
        }
        return false;
    }

    /**
     * Query a selector within optional cached parent or document.
     * @param {string} selector
     * @param {string} [parentKey]
     * @returns {Element|null}
     */
    querySelector(selector, parentKey) {
        const root = parentKey ? this.get(parentKey) : document;
        return root ? root.querySelector(selector) : null;
    }

    /**
     * Query all matching selectors within optional cached parent or document.
     * @param {string} selector
     * @param {string} [parentKey]
     * @returns {NodeList}
     */
    querySelectorAll(selector, parentKey) {
        const root = parentKey ? this.get(parentKey) : document;
        return root ? root.querySelectorAll(selector) : [];
    }

    /**
     * Adds an event listener to a cached element
     * @param {string} elementKey - The key of the element
     * @param {string} eventType - The type of event (e.g., 'click', 'input')
     * @param {Function} handler - The event handler function
     * @param {Object} [options] - Optional event listener options
     * @returns {boolean} True if successful
     */
    on(elementKey, eventType, handler, options = {}) {
        const element = this.get(elementKey);
        if (!element) {
            console.error(`Element '${elementKey}' not found when adding event listener`);
            return false;
        }

        element.addEventListener(eventType, handler, options);
        
        // Store event listener for potential cleanup
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        this.eventListeners.get(element).push({ event: eventType, handler, options });
        
        return true;
    }
}