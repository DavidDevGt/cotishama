import { QuoteState } from './state.js';
import { DOMElements } from './dom.js';
import { QuoteUtils } from './utils.js';
import { Validations } from './validations.js';
import { ProductAutocomplete } from './autocomplete.js';
import { STYLE } from './constants.js';

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
        this.currentDate = QuoteUtils.getCurrentDate();
        this.initializeAutocomplete();
        this.initializeEventListeners();
    }

    /**
     * Initializes the product autocomplete functionality
     * @private
     */
    initializeAutocomplete() {
        this.autocomplete = new ProductAutocomplete();
        this.autocomplete.initializeAutocomplete('producto', 'sugerencias-productos');
    }

    /**
     * Sets up event listeners for the main functionality buttons.
     * @private
     */
    initializeEventListeners() {
        this.dom.get('add').addEventListener('click', () => this.addProduct());
        this.dom.get('generate').addEventListener('click', () => this.generateQuoteImage());
        // Setear mayusculas a nombre del cliente y producto usando utils
        QuoteUtils.setUpperCase(this.dom.get('client'));
        QuoteUtils.setUpperCase(this.dom.get('product'));
    }

    /**
     * Adds a new product to the quote based on form input values.
     * Validates the input before adding the product and updates the display.
     * @private
     */
    addProduct() {
        const product = {
            nombre: this.dom.get('product').value,
            cantidad: this.dom.get('quantity').value,
            precio: this.dom.get('price').value,
            cliente: this.dom.get('client').value
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
        const productsTable = this.dom.get('products_table');
        const clientNameElement = this.dom.get('client_name');
        const dateElement = this.dom.get('date');

        clientNameElement.textContent = this.dom.get('client').value;
        dateElement.textContent = this.currentDate;
        productsTable.innerHTML = '';

        const total = this.state.getTotal();
        this.state.products.forEach((product, index) => {
            const subtotal = product.cantidad * product.precio;
            const row = this.createProductRow(product, subtotal, index);
            productsTable.appendChild(row);
        });

        const MIN_ROWS = STYLE.MIN_ROWS;
        const rowsToAdd = MIN_ROWS - this.state.products.length;
        if (rowsToAdd > 0) {
            for (let i = 0; i < rowsToAdd; i++) {
                const emptyRow = document.createElement('tr');
                emptyRow.classList.add('empty-row');

                const emptyTd = document.createElement('td');
                emptyTd.colSpan = 5;
                emptyTd.innerHTML = '&nbsp;';

                emptyRow.appendChild(emptyTd);
                productsTable.appendChild(emptyRow);
            }
        }
        this.dom.get('total').textContent = QuoteUtils.formatCurrency(total);
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
        const row = document.createElement('tr');
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
            const td = document.createElement('td');
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
        ['product', 'quantity', 'price'].forEach(field => {
            this.dom.get(field).value = '';
        });
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
            // notify user
            Validations.notyf.error('No hay productos en la cotización. Agrega al menos uno para continuar.');
            console.warn('Cannot generate image: No products available');
            return;
        }

        const table = this.dom.get('capture');
        if (!table) {
            throw new Error('Capture element not found');
        }

        const deleteCells = table.querySelectorAll('td:nth-child(5)');
        const originalDisplayValues = [];

        try {
            deleteCells.forEach((cell, index) => {
                originalDisplayValues[index] = cell.style.display;
                cell.style.display = 'none';
            });
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

            if (!canvas) {
                throw new Error('Failed to generate canvas from table');
            }

            // Generate high-quality image
            const imageUrl = canvas.toDataURL('image/png', 1.0);
            if (!imageUrl || imageUrl === 'data:,') {
                throw new Error('Failed to generate image data');
            }

            const fileName = this.generateFileName();
            await this.downloadImage(imageUrl, fileName);

            console.log(`Quote image generated successfully: ${fileName}`);

        } catch (error) {
            console.error('Error generating quote image:', error);

            if (this.showNotification) {
                this.showNotification('Error al generar la imagen. Por favor, intenta nuevamente.', 'error');
            }

            throw error;
        } finally {
            // Restore original display values
            deleteCells.forEach((cell, index) => {
                cell.style.display = originalDisplayValues[index] || '';
            });
        }
    }

    /**
     * Download image with better error handling
     * @private
     * @param {string} imageUrl - Data URL of the image
     * @param {string} fileName - Name for the downloaded file
     * @returns {Promise<void>}
     */
    async downloadImage(imageUrl, fileName) {
        try {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = fileName;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }

        } catch (error) {
            console.error('Error downloading image:', error);
            throw new Error('Failed to download image');
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

    /**
     * Triggers the download of an image file.
     * @private
     * @param {string} url - The data URL of the image
     * @param {string} fileName - The name to give the downloaded file
     */
    downloadImage(url, fileName) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
    }
}