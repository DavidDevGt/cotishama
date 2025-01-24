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
     */
    constructor(options = {}) {
        this.trie = new Trie();
        this.options = {
            minCharacters: options.minCharacters || 2,
            maxSuggestions: options.maxSuggestions || 10,
            caseSensitive: options.caseSensitive || false,
            highlightMatch: options.highlightMatch || true
        };
        this.currentFocus = -1;
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
        
        const processedList = this.options.caseSensitive 
            ? productList 
            : productList.map(item => item.toUpperCase());
        
        this.trie.bulkInsert(processedList);
    }

    /**
     * Retrieve autocomplete suggestions for a given prefix.
     * @param {string} prefix - The input string to find suggestions for.
     * @returns {string[]} Array of matching product suggestions.
     */
    getSuggestions(prefix) {
        const processedPrefix = this.options.caseSensitive 
            ? prefix 
            : prefix.toUpperCase();
        
        const suggestions = this.trie.getSuggestions(processedPrefix);
        return suggestions.slice(0, this.options.maxSuggestions);
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

        input.addEventListener('input', () => this.handleInput(input, suggestionsContainer));
        
        this.setupEventListeners(input, suggestionsContainer);
    }

    /**
     * Handle input events and generate suggestions.
     * @param {HTMLInputElement} input - The input element.
     * @param {HTMLElement} suggestionsContainer - Container for displaying suggestions.
     */
    handleInput(input, suggestionsContainer) {
        const value = input.value;
        this.currentFocus = -1;

        if (value.length < this.options.minCharacters) {
            this.clearSuggestions(suggestionsContainer);
            return;
        }

        const suggestions = this.getSuggestions(value);
        this.displaySuggestions(suggestions, suggestionsContainer, input, value);
    }

    /**
     * Display autocomplete suggestions in the suggestions container.
     * @param {string[]} suggestions - List of suggestion strings.
     * @param {HTMLElement} container - Suggestions container element.
     * @param {HTMLInputElement} input - The input element.
     * @param {string} inputValue - Current input value.
     */
    displaySuggestions(suggestions, container, input, inputValue) {
        container.innerHTML = '';

        if (!suggestions.length) {
            container.style.display = 'none';
            return;
        }

        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            
            if (this.options.highlightMatch) {
                div.innerHTML = this.highlightMatchedText(suggestion, inputValue);
            } else {
                div.textContent = suggestion;
            }

            div.addEventListener('click', () => {
                input.value = suggestion;
                container.style.display = 'none';
                input.dispatchEvent(new Event('change'));
            });

            container.appendChild(div);
        });

        container.style.display = 'block';
    }

    /**
     * Highlight the matching part of a suggestion.
     * @param {string} suggestion - The full suggestion string.
     * @param {string} inputValue - The input value to match.
     * @returns {string} HTML string with matched text highlighted.
     */
    highlightMatchedText(suggestion, inputValue) {
        const matchIndex = suggestion.toUpperCase().indexOf(inputValue.toUpperCase());
        if (matchIndex === -1) return suggestion;

        return `${suggestion.slice(0, matchIndex)}<strong>${suggestion.slice(matchIndex, matchIndex + inputValue.length)}</strong>${suggestion.slice(matchIndex + inputValue.length)}`;
    }

    /**
     * Set up keyboard and click event listeners for suggestions.
     * @param {HTMLInputElement} input - The input element.
     * @param {HTMLElement} suggestionsContainer - Container for suggestions.
     */
    setupEventListeners(input, suggestionsContainer) {
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!suggestionsContainer.contains(e.target) && e.target !== input) {
                suggestionsContainer.style.display = 'none';
            }
        });

        // Keyboard navigation
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
                    this.selectSuggestion(items);
                    break;
                case 'Escape':
                    suggestionsContainer.style.display = 'none';
                    break;
            }
        });
    }

    /**
     * Navigate through suggestions using keyboard arrows.
     * @param {NodeListOf<Element>} items - List of suggestion items.
     * @param {number} direction - Direction of navigation (1 for down, -1 for up).
     */
    navigateSuggestions(items, direction) {
        items.forEach(item => item.classList.remove('active-suggestion'));

        this.currentFocus += direction;
        if (this.currentFocus >= items.length) {
            this.currentFocus = 0;
        } else if (this.currentFocus < 0) {
            this.currentFocus = items.length - 1;
        }

        items[this.currentFocus].classList.add('active-suggestion');
    }

    /**
     * Select the currently focused suggestion.
     * @param {NodeListOf<Element>} items - List of suggestion items.
     */
    selectSuggestion(items) {
        if (this.currentFocus > -1) {
            items[this.currentFocus].click();
        }
    }

    /**
     * Clear all suggestions from the container.
     * @param {HTMLElement} container - Suggestions container element.
     */
    clearSuggestions(container) {
        container.innerHTML = '';
        container.style.display = 'none';
    }
}