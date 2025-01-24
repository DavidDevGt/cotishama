import { Trie } from './trie.js';
import { productList } from './data/productList.js';

export class ProductAutocomplete {
    constructor() {
        this.trie = new Trie();
        this.initializeTrie();
        this.currentFocus = -1;
    }

    initializeTrie() {
        if (!productList || productList.length === 0) {
            console.error('El dataset de productos está vacío. No se pueden inicializar las sugerencias.');
            return;
        }
        this.trie.bulkInsert(productList);
    }


    getSuggestions(prefix) {
        return this.trie.getSuggestions(prefix.toUpperCase());
    }

    initializeAutocomplete(inputId, suggestionsContainerId) {
        const input = document.getElementById(inputId);
        const suggestionsContainer = document.getElementById(suggestionsContainerId);

        if (!input || !suggestionsContainer) {
            console.error('No se encontraron los elementos necesarios');
            return;
        }

        // Cuando el usuario escribe:
        input.addEventListener('input', () => {
            const value = input.value;
            this.currentFocus = -1;

            if (value.length < 2) {
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'none';
                return;
            }

            const suggestions = this.getSuggestions(value);
            this.displaySuggestions(suggestions, suggestionsContainer, input);
        });

        document.addEventListener('click', (e) => {
            if (!suggestionsContainer.contains(e.target) && e.target !== input) {
                suggestionsContainer.style.display = 'none';
            }
        });

        // **Escuchar flechas y Enter** para navegar/seleccionar
        input.addEventListener('keydown', (e) => {
            if (suggestionsContainer.style.display === 'none') return;

            const items = suggestionsContainer.querySelectorAll('.suggestion-item');
            if (!items.length) return;

            switch (e.key) {
                case 'ArrowDown':
                    // Mover hacia abajo
                    e.preventDefault();
                    this.currentFocus++;
                    this.highlightItem(items);
                    break;
                case 'ArrowUp':
                    // Mover hacia arriba
                    e.preventDefault();
                    this.currentFocus--;
                    this.highlightItem(items);
                    break;
                case 'Enter':
                    // Seleccionar la sugerencia activa
                    e.preventDefault();
                    if (this.currentFocus > -1) {
                        items[this.currentFocus].click();
                    }
                    break;
            }
        });
    }

    displaySuggestions(suggestions, container, input) {
        container.innerHTML = '';

        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }

        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = suggestion;

            div.addEventListener('click', () => {
                input.value = suggestion;
                container.style.display = 'none';
                input.dispatchEvent(new Event('change'));
            });

            container.appendChild(div);
        });

        container.style.display = 'block';
    }

    highlightItem(items) {
        items.forEach(item => item.classList.remove('active-suggestion'));

        if (this.currentFocus >= items.length) {
            this.currentFocus = 0;
        } else if (this.currentFocus < 0) {
            this.currentFocus = items.length - 1;
        }

        items[this.currentFocus].classList.add('active-suggestion');
    }
}
