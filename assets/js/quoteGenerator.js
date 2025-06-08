import { QuoteState } from './core/state.js';
import { DOMElements } from './core/dom.js';
import { QuoteUtils } from './shared/utils.js';
import { Validations } from './core/validations.js';
import { ProductAutocomplete } from './autocomplete.js';
import { STYLE, DOM_IDS } from './core/constants.js';

/**
 * Class responsible for generating and managing quotes.
 * Handles application logic and user interactions for creating
 * and downloading quotes as PNG files.
 */
export class QuoteGenerator {
    /**
     * Initializes a new instance of QuoteGenerator.
     * Sets up initial state, DOM elements, and event listeners.
     */
    constructor() {
        this.state = new QuoteState();
        this.dom = new DOMElements();
        this.createElement = this.dom.createElement.bind(this.dom);
        this.appendTo = this.dom.append.bind(this.dom);
        this.querySelectorAll = this.dom.querySelectorAll.bind(this.dom);
        this.currentDate = QuoteUtils.getCurrentDate();
        this.initializeAutocomplete();
        this.initializeEventListeners();
        this.restrictNumericInput();

    }

    /**
     * Initializes the product autocomplete functionality
     * @private
     */
    initializeAutocomplete() {
        this.autocomplete = new ProductAutocomplete();
        this.autocomplete.initializeAutocomplete('product', 'suggestions_container');
    }

    /**
     * Sets up event listeners for the main functionality buttons.
     * @private
     */
    initializeEventListeners() {
        this.dom.on('add', 'click', () => this.addProduct());
        this.dom.on('generate', 'click', () => this.generateQuoteImage());

        QuoteUtils.setUpperCase(this.dom.get('client'));
        QuoteUtils.setUpperCase(this.dom.get('product'));
    }

    /**
     * Restricts the quantity input to only allow positive integers
     * and max 8 digits.
     * @private
     */
    restrictNumericInput() {
        const input = this.dom.get('quantity');

        if (!input) {
            console.error('Element "quantity" not found in cache');
            return;
        }

        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^\d]/g, '');
            if (e.target.value.length > 8) {
                e.target.value = e.target.value.slice(0, 8);
            }
        });

        input.addEventListener('keypress', (e) => {
            const char = String.fromCharCode(e.which);

            // max 8 digits and only numbers
            if (!/\d/.test(char) || input.value.length >= 8) {
                e.preventDefault();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = e.clipboardData.getData('text');

            if (/^\d+$/.test(paste)) {
                input.value = paste.slice(0, 8); // max 8 digits
            } else {
                Validations.notyf.error('Solo se permiten números enteros.');
            }
        });
    }


    /**
     * Adds a new product to the quote based on form input values.
     * Validates the input before adding the product and updates the display.
     * @private
     */
    addProduct() {
        const product = {
            nombre: this.dom.getValue('product'),
            cantidad: this.dom.getValue('quantity'),
            precio: this.dom.getValue('price'),
            cliente: this.dom.getValue('client')
        };

        if (!Validations.validateForm(product)) {
            return;
        }

        this.state.setClient(product.cliente);
        product.cantidad = parseInt(product.cantidad);
        product.precio = parseFloat(product.precio);

        if (!this.state.addProduct(product)) {
            return;
        }
        this.renderProducts();
        this.clearInputs();
    }

    /**
     * Renders the current list of products in the quote table.
     * Updates client name, date, and total amount.
     * @private
     */
    renderProducts() {
        this.dom.setText('client_name', this.dom.getValue('client'));
        this.dom.setText('date', this.currentDate);
        this.dom.clear('products_table');

        const total = this.state.getTotal();
        this.state.products.forEach((product, index) => {
            const subtotal = product.cantidad * product.precio;
            const row = this.createProductRow(product, subtotal, index);
            this.appendTo('products_table', row);
        });

        const MIN_ROWS = STYLE.MIN_ROWS;
        const rowsToAdd = MIN_ROWS - this.state.products.length;
        if (rowsToAdd > 0) {
            for (let i = 0; i < rowsToAdd; i++) {
                // Create empty row using DOM helper
                const emptyRow = this.createElement('tr', { className: 'empty-row' });
                const emptyTd = this.createElement('td', { attributes: { colSpan: 5 }, html: '&nbsp;' });
                emptyRow.appendChild(emptyTd);
                this.appendTo('products_table', emptyRow);
            }
        }
        this.dom.setText('total', QuoteUtils.formatCurrency(total));
    }


    /**
     * Creates a table row for a product in the quote.
     * @private
     * @param {Object} product - The product to create a row for
     * @param {number} subtotal - The subtotal for this product (quantity * price)
     * @param {number} index - The index of the product in the products array
     * @returns {HTMLTableRowElement} The created table row element
     */
    createProductRow(product, subtotal, index) {
        const row = this.createElement('tr');
        const cells = [
            { text: product.cantidad },
            { text: product.nombre },
            { text: QuoteUtils.formatCurrency(product.precio), className: 'money-cell' },
            { text: QuoteUtils.formatCurrency(subtotal), className: 'money-cell' },
            {
                element: this.createDeleteButton(() => {
                    this.state.removeProduct(index);
                    this.renderProducts();
                })
            }
        ];
        cells.forEach(cell => {
            const td = this.createElement('td');
            if (cell.text !== undefined) {
                td.textContent = cell.text;
                if (cell.className) td.classList.add(cell.className);
            } else if (cell.element) {
                td.appendChild(cell.element);
            }
            row.appendChild(td);
        });
        return row;
    }

    /**
     * Creates a delete button for a product row with a FontAwesome icon.
     * @private
     * @param {Function} onClick - The callback function to execute when the button is clicked
     * @returns {HTMLButtonElement} The created button element
     */
    createDeleteButton(onClick) {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('btn-danger');

        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-trash');
        button.appendChild(icon);

        button.addEventListener('click', onClick);

        return button;
    }

    /**
     * Clears all input fields in the product form.
     * @private
     */
    clearInputs() {
        this.dom.clearMultiple(['product', 'quantity', 'price']);
    }

    /**
     * Generates a PNG image of the current quote.
     * Temporarily hides delete buttons during capture for a cleaner image.
     * @private
     * @async
     * @throws {Error} When image generation fails
     * @returns {Promise<void>}
     */
    async generateQuoteImage() {
        if (!this.state.hasProducts()) {
            Validations.notyf.error('No hay productos en la cotización. Agrega al menos uno para continuar.');
            console.warn('Cannot generate image: No products available');
            return;
        }

        const table = this.dom.get('capture');
        if (!table) throw new Error('Capture element not found');

        const deleteCells = Array.from(this.querySelectorAll('td:nth-child(5)', 'capture'));
        const originalDisplayValues = deleteCells.map(cell => cell.style.display);

        try {
            // Hide delete cells
            deleteCells.forEach(cell => cell.style.display = 'none');
            await new Promise(resolve => setTimeout(resolve, 0));

            const canvas = await html2canvas(table, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: false,
                logging: false,
                removeContainer: true,
                imageTimeout: 15000,
                onclone: (clonedDoc) => {
                    const clonedTable = clonedDoc.querySelector('[data-capture], #capture, .capture');
                    if (clonedTable) {
                        clonedTable.style.fontFamily = window.getComputedStyle(table).fontFamily;
                    }
                }
            });

            if (!canvas) throw new Error('Failed to generate canvas from table');

            const imageUrl = canvas.toDataURL('image/png', 1.0);
            if (!imageUrl || imageUrl === 'data:,') {
                throw new Error('Failed to generate image data');
            }

            await this.downloadImage(imageUrl);
            console.log(`Quote image generated successfully: ${this.generateFileName()}`);

        } catch (error) {
            console.error('Error generating quote image:', error);
            this.showNotification?.('Error al generar la imagen. Por favor, intenta nuevamente.', 'error');
            throw error;
        } finally {
            // Restore original display values
            deleteCells.forEach((cell, index) => {
                cell.style.display = originalDisplayValues[index] || '';
            });
        }
    }

    /**
     * Downloads image and handles cleanup
     * @private
     * @param {string} imageUrl - Data URL of the image
     * @returns {Promise<void>}
     */
    async downloadImage(imageUrl) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = this.generateFileName();
        link.style.display = 'none';

        try {
            document.body.appendChild(link);
            link.click();

            if (imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        } catch (error) {
            console.error('Error downloading image:', error);
            throw new Error('Failed to download image');
        } finally {
            document.body.removeChild(link);
        }
    }

    /**
     * Generates a filename for the quote image based on client initials,
     * current date, and quote counter.
     * @private
     * @returns {string} The generated filename
     */
    generateFileName() {
        const clientName = this.dom.get('client').value;
        const cleanDate = QuoteUtils.cleanDate(this.currentDate);
        const initials = QuoteUtils.getInitials(clientName);
        const identifier = QuoteUtils.generateQuoteIdentifier(this.state.quoteCounter++);
        return `${initials}${cleanDate}-${identifier}.png`;
    }
}