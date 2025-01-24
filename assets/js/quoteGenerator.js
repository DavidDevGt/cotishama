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

        product.cantidad = parseInt(product.cantidad);
        product.precio = parseFloat(product.precio);
        this.state.products.push(product);
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

        let total = 0;
        this.state.products.forEach((product, index) => {
            const subtotal = product.cantidad * product.precio;
            total += subtotal;
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
                emptyTd.colSpan = 5; // Esto se ajusta al número de columnas en la tabla
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
                    this.state.products.splice(index, 1);
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
     * Temporarily hides delete buttons during capture.
     * @private
     * @async
     */
    async generateQuoteImage() {
        if (!Validations.validateHasProducts(this.state.products)) {
            return;
        }

        const table = this.dom.get('capture');
        const deleteCells = table.querySelectorAll('td:nth-child(5)');
        deleteCells.forEach(cell => (cell.style.display = 'none'));

        try {
            const canvas = await html2canvas(table);
            const imageUrl = canvas.toDataURL('image/png');
            const fileName = this.generateFileName();
            this.downloadImage(imageUrl, fileName);
        } finally {
            deleteCells.forEach(cell => (cell.style.display = ''));
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