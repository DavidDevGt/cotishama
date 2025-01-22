import { DOM_IDS } from './constants.js';

/**
* Class responsible for managing and caching DOM element references.
* Provides a centralized way to access DOM elements using predefined IDs.
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
        this.initializeElements();
    }
 
    /**
     * Initializes the elements cache by querying DOM elements using IDs from DOM_IDS.
     * Stores references in lowercase keys for case-insensitive access.
     * @private
     */
    initializeElements() {
        Object.entries(DOM_IDS).forEach(([key, id]) => {
            this.elements[key.toLowerCase()] = document.getElementById(id);
        });
    }
 
    /**
     * Retrieves a cached DOM element reference.
     * @param {string} elementKey - The key of the element to retrieve (case-insensitive)
     * @returns {HTMLElement|null} The DOM element if found, null otherwise
     */
    get(elementKey) {
        return this.elements[elementKey.toLowerCase()];
    }
 }