import { Trie } from './trie.js';
import { productList } from './data/productList.js';

/**
 * A class for implementing product autocomplete functionality using a Trie data structure.
 * Provides intelligent suggestions based on user input with configurable options.
 */
export class ProductAutocomplete {
    /**
     * Create a new ProductAutocomplete instance.
     * @param {Object} [options={}] - Configuration options for autocomplete behavior.
     * @param {number} [options.minCharacters=2] - Minimum number of characters to trigger suggestions.
     * @param {number} [options.maxSuggestions=10] - Maximum number of suggestions to display.
     * @param {boolean} [options.caseSensitive=false] - Whether suggestions are case-sensitive.
     * @param {boolean} [options.highlightMatch=true] - Whether to highlight matching text in suggestions.
     * @param {number} [options.debounceDelay=150] - Debounce delay in milliseconds for input events.
     */
    constructor(options = {}) {
        this.trie = new Trie();
        this.options = {
            minCharacters: options.minCharacters || 2,
            maxSuggestions: options.maxSuggestions || 10,
            caseSensitive: options.caseSensitive || false,
            highlightMatch: options.highlightMatch !== false, // Default true
            debounceDelay: options.debounceDelay || 150
        };
        this.currentFocus = -1;
        this.debounceTimer = null;
        this.lastQuery = '';
        this.cachedResults = new Map(); // Cache
        this.maxCacheSize = 100;
        
        if (this.options.highlightMatch) {
            this.highlightRegexCache = new Map();
        }
        
        this.initializeTrie();
    }

    /**
     * Initialize the Trie data structure with product names.
     * Handles empty product list and case sensitivity.
     */
    initializeTrie() {
        if (!productList?.length) {
            console.error('Product dataset is empty. Autocomplete suggestions unavailable.');
            return;
        }
        
        if (this.options.caseSensitive) {
            this.originalProducts = productList;
            this.processedProducts = productList;
        } else {
            this.originalProducts = productList;
            this.processedProducts = productList.map(item => item.toUpperCase());
        }
        
        this.trie.bulkInsert(this.processedProducts);
    }

    /**
     * Retrieve autocomplete suggestions for a given prefix with caching.
     * @param {string} prefix - The input string to find suggestions for.
     * @returns {string[]} Array of matching product suggestions.
     */
    getSuggestions(prefix) {
        if (!prefix || prefix.length < this.options.minCharacters) {
            return [];
        }

        const cacheKey = this.options.caseSensitive ? prefix : prefix.toUpperCase();
        
        if (this.cachedResults.has(cacheKey)) {
            return this.cachedResults.get(cacheKey);
        }

        const suggestions = this.trie.getSuggestions(cacheKey);
        const limitedSuggestions = suggestions.slice(0, this.options.maxSuggestions);
        
        if (this.cachedResults.size >= this.maxCacheSize) {
            const firstKey = this.cachedResults.keys().next().value;
            this.cachedResults.delete(firstKey);
        }
        this.cachedResults.set(cacheKey, limitedSuggestions);
        
        return limitedSuggestions;
    }

    /**
     * Set up autocomplete functionality for a specific input element.
     * @param {string} inputId - ID of the input element.
     * @param {string} suggestionsContainerId - ID of the container for suggestions.
     */
    initializeAutocomplete(inputId, suggestionsContainerId) {
        const input = document.getElementById(inputId);
        const suggestionsContainer = document.getElementById(suggestionsContainerId);

        if (!input || !suggestionsContainer) {
            console.error('Required elements not found');
            return;
        }

        input.setAttribute('autocomplete', 'off');
        suggestionsContainer.classList.add('suggestions-container');

        // Use debounced input handler
        input.addEventListener('input', (e) => this.debouncedHandleInput(e.target, suggestionsContainer));
        
        this.setupEventListeners(input, suggestionsContainer);
    }

    /**
     * Debounced input handler to reduce excessive API calls.
     * @param {HTMLInputElement} input - The input element.
     * @param {HTMLElement} suggestionsContainer - Container for displaying suggestions.
     */
    debouncedHandleInput(input, suggestionsContainer) {
        clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(() => {
            this.handleInput(input, suggestionsContainer);
        }, this.options.debounceDelay);
    }

    /**
     * Handle input events and generate suggestions.
     * @param {HTMLInputElement} input - The input element.
     * @param {HTMLElement} suggestionsContainer - Container for displaying suggestions.
     */
    handleInput(input, suggestionsContainer) {
        const value = input.value.trim();
        this.currentFocus = -1;

        // Early return if same as last query
        if (value === this.lastQuery) {
            return;
        }
        this.lastQuery = value;

        if (value.length < this.options.minCharacters) {
            this.clearSuggestions(suggestionsContainer);
            return;
        }

        const suggestions = this.getSuggestions(value);
        this.displaySuggestions(suggestions, suggestionsContainer, input, value);
    }

    /**
     * Display autocomplete suggestions in the suggestions container with virtual scrolling for large lists.
     * @param {string[]} suggestions - List of suggestion strings.
     * @param {HTMLElement} container - Suggestions container element.
     * @param {HTMLInputElement} input - The input element.
     * @param {string} inputValue - Current input value.
     */
    displaySuggestions(suggestions, container, input, inputValue) {
        const fragment = document.createDocumentFragment();
        
        if (!suggestions.length) {
            container.style.display = 'none';
            container.innerHTML = '';
            return;
        }

        container.innerHTML = '';

        suggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.dataset.index = index;
            
            if (this.options.highlightMatch) {
                div.innerHTML = this.highlightMatchedText(suggestion, inputValue);
            } else {
                div.textContent = suggestion;
            }

            // Use event delegation instead of individual listeners
            fragment.appendChild(div);
        });

        container.appendChild(fragment);
        container.style.display = 'block';
    }

    /**
     * Highlight the matching part of a suggestion with cached regex.
     * @param {string} suggestion - The full suggestion string.
     * @param {string} inputValue - The input value to match.
     * @returns {string} HTML string with matched text highlighted.
     */
    highlightMatchedText(suggestion, inputValue) {
        if (!inputValue) return suggestion;
        
        const key = inputValue.toLowerCase();
        
        if (!this.highlightRegexCache.has(key)) {
            const escapedInput = inputValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            this.highlightRegexCache.set(key, new RegExp(`(${escapedInput})`, 'gi'));
            
            if (this.highlightRegexCache.size > 50) {
                const firstKey = this.highlightRegexCache.keys().next().value;
                this.highlightRegexCache.delete(firstKey);
            }
        }
        
        const regex = this.highlightRegexCache.get(key);
        return suggestion.replace(regex, '<strong>$1</strong>');
    }

    /**
     * Set up keyboard and click event listeners for suggestions with event delegation.
     * @param {HTMLInputElement} input - The input element.
     * @param {HTMLElement} suggestionsContainer - Container for suggestions.
     */
    setupEventListeners(input, suggestionsContainer) {
        suggestionsContainer.addEventListener('click', (e) => {
            const suggestionItem = e.target.closest('.suggestion-item');
            if (suggestionItem) {
                const suggestion = suggestionItem.textContent;
                input.value = suggestion;
                suggestionsContainer.style.display = 'none';
                input.dispatchEvent(new Event('change'));
            }
        });

        document.addEventListener('click', (e) => {
            if (!suggestionsContainer.contains(e.target) && e.target !== input) {
                this.clearSuggestions(suggestionsContainer);
            }
        }, { passive: true });

        input.addEventListener('keydown', (e) => {
            if (suggestionsContainer.style.display === 'none') return;

            const items = suggestionsContainer.querySelectorAll('.suggestion-item');
            if (!items.length) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateSuggestions(items, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateSuggestions(items, -1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.selectSuggestion(items, input, suggestionsContainer);
                    break;
                case 'Escape':
                    this.clearSuggestions(suggestionsContainer);
                    break;
                case 'Tab':
                    if (items.length > 0 && this.currentFocus === -1) {
                        e.preventDefault();
                        input.value = items[0].textContent;
                        this.clearSuggestions(suggestionsContainer);
                    }
                    break;
            }
        });
    }

    /**
     * Navigate through suggestions using keyboard arrows (optimized).
     * @param {NodeListOf<Element>} items - List of suggestion items.
     * @param {number} direction - Direction of navigation (1 for down, -1 for up).
     */
    navigateSuggestions(items, direction) {
        // Remove active class from current item only
        if (this.currentFocus >= 0 && this.currentFocus < items.length) {
            items[this.currentFocus].classList.remove('active-suggestion');
        }

        this.currentFocus += direction;
        if (this.currentFocus >= items.length) {
            this.currentFocus = 0;
        } else if (this.currentFocus < 0) {
            this.currentFocus = items.length - 1;
        }

        items[this.currentFocus].classList.add('active-suggestion');
        
        items[this.currentFocus].scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
        });
    }

    /**
     * Select the currently focused suggestion (optimized).
     * @param {NodeListOf<Element>} items - List of suggestion items.
     * @param {HTMLInputElement} input - The input element.
     * @param {HTMLElement} suggestionsContainer - Container for suggestions.
     */
    selectSuggestion(items, input, suggestionsContainer) {
        if (this.currentFocus > -1 && this.currentFocus < items.length) {
            const selectedText = items[this.currentFocus].textContent;
            input.value = selectedText;
            this.clearSuggestions(suggestionsContainer);
            input.dispatchEvent(new Event('change'));
        }
    }

    /**
     * Clear all suggestions from the container.
     * @param {HTMLElement} container - Suggestions container element.
     */
    clearSuggestions(container) {
        container.innerHTML = '';
        container.style.display = 'none';
        this.currentFocus = -1;
    }

    /**
     * Clear caches to free memory.
     */
    clearCaches() {
        this.cachedResults.clear();
        if (this.highlightRegexCache) {
            this.highlightRegexCache.clear();
        }
    }

    /**
     * Update the product list and reinitialize the trie.
     * @param {string[]} newProductList - New list of products.
     */
    updateProductList(newProductList) {
        if (!Array.isArray(newProductList)) {
            console.error('Product list must be an array');
            return;
        }
        this.clearCaches();
        Object.assign(productList, newProductList);
        this.initializeTrie();
    }

    /**
     * Destroy the autocomplete instance and clean up.
     */
    destroy() {
        clearTimeout(this.debounceTimer);
        this.clearCaches();
        this.trie = null;
    }
}