import { QuoteState } from './state.js';
import { DOMElements } from './dom.js';
import { QuoteUtils } from './utils.js';
import { Validations } from './validations.js';
import { ProductAutocomplete } from './autocomplete.js';
import { DraftStorage } from './draft.js';
import { STYLE } from './constants.js';

/** Maps validation field names to the keys used in DOMElements. */
const INPUT_KEYS = {
    cliente: 'client',
    producto: 'product',
    cantidad: 'quantity',
    precio: 'price'
};

/** Label of the download button in its idle state. */
const GENERATE_LABEL = 'Descargar cotización (PNG)';

/** How long the "Deshacer" bar stays visible after removing a product. */
const UNDO_TIMEOUT_MS = 6000;

/**
 * Class responsible for generating and managing quotes.
 * Handles application logic and user interactions for creating
 * and downloading quotes as PNG files.
 */
export class QuoteGenerator {
    /**
     * Initializes a new instance of QuoteGenerator.
     * Sets up state, DOM references, event listeners and restores any saved draft.
     */
    constructor() {
        this.state = new QuoteState();
        this.dom = new DOMElements();
        this.draft = new DraftStorage();
        this.currentDate = QuoteUtils.getCurrentDate();
        this.isGenerating = false;
        this.editingCell = null;
        this.pendingUndo = null;
        this.undoTimer = null;

        // Autocomplete se registra primero para que su keydown se ejecute antes que el nuestro.
        this.initializeAutocomplete();
        this.initializeEventListeners();
        this.restoreDraft();
        this.renderProducts();
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
     * Sets up event listeners for the form, keyboard flow, table and action buttons.
     * @private
     */
    initializeEventListeners() {
        const dom = this.dom;

        // Mayúsculas en cliente y producto (se registra antes de los listeners de abajo).
        QuoteUtils.setUpperCase(dom.get('client'));
        QuoteUtils.setUpperCase(dom.get('product'));

        // Enter fluye: producto → cantidad → precio → agregar.
        dom.get('product').addEventListener('keydown', (e) => this.onProductKeydown(e));
        dom.get('quantity').addEventListener('keydown', (e) => this.onQuantityKeydown(e));
        dom.get('price').addEventListener('keydown', (e) => this.onPriceKeydown(e));

        // Editar el cliente se refleja al instante en la cotización.
        dom.get('client').addEventListener('input', () => this.onClientInput());

        // Quita el error de un campo en cuanto el usuario empieza a corregirlo.
        Object.values(INPUT_KEYS).forEach((key) => {
            dom.get(key).addEventListener('input', () => this.clearFieldError(key));
        });

        // Ningún envío nativo del formulario: todo se maneja aquí.
        dom.get('form').addEventListener('submit', (e) => e.preventDefault());

        dom.get('add').addEventListener('click', () => this.addProduct());
        dom.get('generate').addEventListener('click', () => this.generateQuoteImage());
        dom.get('new_quote').addEventListener('click', () => this.startNewQuote());
        dom.get('undo_button').addEventListener('click', () => this.undoRemove());

        // Edición de cantidad y precio en la tabla (delegación: las filas se re-renderizan).
        const tbody = dom.get('products_table');
        tbody.addEventListener('click', (e) => {
            const cell = e.target.closest('td.editable');
            if (cell) this.startEdit(cell);
        });
        tbody.addEventListener('keydown', (e) => {
            const cell = e.target;
            if (cell.tagName !== 'TD' || !cell.classList.contains('editable')) return;
            if (e.key === 'Enter' || e.key === 'F2') {
                e.preventDefault();
                this.startEdit(cell);
            }
        });
    }

    /* ------------------------------------------------------------------
     * Teclado del formulario
     * ------------------------------------------------------------------ */

    /**
     * Product field: Enter moves to quantity. When a suggestion is highlighted,
     * the autocomplete already consumed the event, so this does nothing.
     * @private
     * @param {KeyboardEvent} e
     */
    onProductKeydown(e) {
        if (e.key !== 'Enter' || e.defaultPrevented) return;
        e.preventDefault();
        this.dom.get('quantity').focus();
    }

    /**
     * Quantity field: Enter moves to price.
     * @private
     * @param {KeyboardEvent} e
     */
    onQuantityKeydown(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        this.dom.get('price').focus();
    }

    /**
     * Price field: Enter adds the product.
     * @private
     * @param {KeyboardEvent} e
     */
    onPriceKeydown(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        this.addProduct();
    }

    /* ------------------------------------------------------------------
     * Errores en línea
     * ------------------------------------------------------------------ */

    /**
     * Shows an error next to a field and marks it visually.
     * @private
     * @param {string} key - DOM key of the input (e.g. 'client')
     * @param {string} message - Message to show in the field hint
     */
    showFieldError(key, message) {
        const input = this.dom.get(key);
        const group = input.closest('.input-group');
        const hint = group.querySelector('.input-hint');

        if (!hint.dataset.defaultText) {
            hint.dataset.defaultText = hint.textContent;
        }
        hint.textContent = message;
        group.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
    }

    /**
     * Removes the error state of a field and restores its original hint.
     * @private
     * @param {string} key - DOM key of the input
     */
    clearFieldError(key) {
        const input = this.dom.get(key);
        const group = input.closest('.input-group');
        const hint = group.querySelector('.input-hint');

        if (hint.dataset.defaultText) {
            hint.textContent = hint.dataset.defaultText;
        }
        group.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
    }

    /* ------------------------------------------------------------------
     * Agregar, eliminar y deshacer
     * ------------------------------------------------------------------ */

    /**
     * Validates the product form and adds the product to the quote.
     * On error, shows the message next to the field and focuses it.
     * @private
     */
    addProduct() {
        const values = {
            cliente: this.dom.get('client').value.trim(),
            producto: this.dom.get('product').value.trim(),
            cantidad: this.dom.get('quantity').value,
            precio: this.dom.get('price').value
        };

        const error = Validations.getFormError(values);
        if (error) {
            const key = INPUT_KEYS[error.field];
            this.showFieldError(key, error.message);
            this.dom.get(key).focus();
            return;
        }

        this.state.setClient(values.cliente);
        const added = this.state.addProduct({
            nombre: values.producto,
            cantidad: parseInt(values.cantidad, 10),
            precio: parseFloat(values.precio)
        });

        if (!added) {
            Validations.notyf.error('No se pudo agregar el producto. Revisa los datos.');
            return;
        }

        this.renderProducts(this.state.products.length - 1);
        this.saveDraft();
        this.clearProductInputs();
        this.dom.get('product').focus();
    }

    /**
     * Removes a product and offers a short window to undo the removal.
     * @private
     * @param {number} index
     */
    removeProduct(index) {
        const product = this.state.products[index];
        if (!product || !this.state.removeProduct(index)) return;

        this.renderProducts();
        this.saveDraft();
        this.showUndo(product, index);
    }

    /**
     * Shows the "Deshacer" bar for a removed product. Only the most recent removal can be undone.
     * @private
     * @param {Object} product - The removed product
     * @param {number} index - Its position before removal
     */
    showUndo(product, index) {
        this.pendingUndo = { product, index };
        this.dom.get('undo_message').textContent = `Producto eliminado: ${product.nombre}`;
        this.dom.get('undo_bar').hidden = false;

        clearTimeout(this.undoTimer);
        this.undoTimer = setTimeout(() => this.hideUndo(), UNDO_TIMEOUT_MS);
    }

    /**
     * Hides the "Deshacer" bar and forgets the pending removal.
     * @private
     */
    hideUndo() {
        clearTimeout(this.undoTimer);
        this.pendingUndo = null;
        this.dom.get('undo_bar').hidden = true;
    }

    /**
     * Restores the last removed product at its original position.
     * @private
     */
    undoRemove() {
        if (!this.pendingUndo) return;

        const { product, index } = this.pendingUndo;
        this.hideUndo();
        this.state.insertProduct(index, product);
        this.renderProducts(Math.min(index, this.state.products.length - 1));
        this.saveDraft();
    }

    /**
     * Clears the product fields but keeps the client name.
     * @private
     */
    clearProductInputs() {
        ['product', 'quantity', 'price'].forEach(field => {
            this.dom.get(field).value = '';
            this.clearFieldError(field);
        });
    }

    /* ------------------------------------------------------------------
     * Edición en línea de cantidad y precio
     * ------------------------------------------------------------------ */

    /**
     * Replaces a quantity or price cell with a numeric input.
     * Enter or leaving the cell saves; Escape cancels.
     * @private
     * @param {HTMLTableCellElement} cell - The td with data-field "cantidad" or "precio"
     */
    startEdit(cell) {
        if (this.editingCell || cell.querySelector('input')) return;

        const index = Number(cell.closest('tr').dataset.index);
        const field = cell.dataset.field;
        const product = this.state.products[index];
        if (!product) return;

        const isPrice = field === 'precio';
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'cell-input';
        input.min = isPrice ? '0.01' : '1';
        input.step = isPrice ? '0.01' : '1';
        input.inputMode = isPrice ? 'decimal' : 'numeric';
        input.value = product[field];
        input.setAttribute('aria-label', isPrice ? 'Precio unitario' : 'Cantidad');

        cell.textContent = '';
        cell.appendChild(input);
        this.editingCell = { index, field };
        input.focus();
        input.select();

        let finished = false;
        const finish = (save, keepFocus) => {
            if (finished) return; // Enter/Escape re-renderizan y disparan blur: solo una vez
            finished = true;
            this.finishEdit(save ? input.value : null, index, field, keepFocus);
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finish(true, true);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                finish(false, true);
            }
        });
        input.addEventListener('blur', () => finish(true, false));
    }

    /**
     * Validates and applies an edited value, then re-renders the table.
     * @private
     * @param {string|null} raw - Typed value, or null when cancelled
     * @param {number} index - Row being edited
     * @param {string} field - 'cantidad' or 'precio'
     * @param {boolean} keepFocus - Return keyboard focus to the cell afterwards
     */
    finishEdit(raw, index, field, keepFocus) {
        this.editingCell = null;
        let highlight = null;

        if (raw !== null) {
            const error = field === 'precio'
                ? Validations.getPriceError(raw)
                : Validations.getQuantityError(raw);

            if (error) {
                Validations.notyf.error(error);
            } else {
                const value = field === 'precio' ? parseFloat(raw) : parseInt(raw, 10);
                if (value !== this.state.products[index][field]) {
                    this.state.updateProduct(index, { [field]: value });
                    this.saveDraft();
                    highlight = index;
                }
            }
        }

        this.renderProducts(highlight);
        if (keepFocus) {
            this.focusCell(index, field);
        }
    }

    /**
     * Moves keyboard focus to a table cell.
     * @private
     * @param {number} index - Row index
     * @param {string} field - data-field of the cell
     */
    focusCell(index, field) {
        const row = this.dom.get('products_table').querySelector(`tr[data-index="${index}"]`);
        row?.querySelector(`td[data-field="${field}"]`)?.focus();
    }

    /* ------------------------------------------------------------------
     * Render de la tabla
     * ------------------------------------------------------------------ */

    /**
     * Renders the product table, client name, date, total and action buttons.
     * @private
     * @param {number|null} [highlightIndex=null] - Row to flash after an add or edit
     */
    renderProducts(highlightIndex = null) {
        const productsTable = this.dom.get('products_table');

        this.dom.get('client_name').textContent = this.dom.get('client').value.trim();
        this.dom.get('date').textContent = this.currentDate;
        productsTable.innerHTML = '';

        this.state.products.forEach((product, index) => {
            const subtotal = product.cantidad * product.precio;
            const row = this.createProductRow(product, subtotal, index);
            if (index === highlightIndex) {
                row.classList.add('row-new');
            }
            productsTable.appendChild(row);
        });

        const rowsToAdd = STYLE.MIN_ROWS - this.state.products.length;
        for (let i = 0; i < rowsToAdd; i++) {
            const emptyRow = document.createElement('tr');
            emptyRow.classList.add('empty-row');

            const emptyTd = document.createElement('td');
            emptyTd.colSpan = 5;
            emptyTd.innerHTML = '&nbsp;';

            emptyRow.appendChild(emptyTd);
            productsTable.appendChild(emptyRow);
        }

        this.dom.get('total').textContent = QuoteUtils.formatCurrency(this.state.getTotal());
        this.updateActionState();
    }

    /**
     * Creates a table row for a product in the quote.
     * Quantity and price cells are editable.
     * @private
     * @param {Object} product - The product to create a row for
     * @param {number} subtotal - The subtotal for this product (quantity * price)
     * @param {number} index - The index of the product in the products array
     * @returns {HTMLTableRowElement} The created table row element
     */
    createProductRow(product, subtotal, index) {
        const row = document.createElement('tr');
        row.dataset.index = index;

        const cells = [
            { text: product.cantidad, field: 'cantidad' },
            { text: product.nombre },
            { text: QuoteUtils.formatCurrency(product.precio), className: 'money-cell', field: 'precio' },
            { text: QuoteUtils.formatCurrency(subtotal), className: 'money-cell' },
            {
                element: this.createDeleteButton(() => this.removeProduct(index), product.nombre)
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
            if (cell.field) {
                td.classList.add('editable');
                td.dataset.field = cell.field;
                td.tabIndex = 0;
                td.title = 'Clic o Enter para editar';
            }
            row.appendChild(td);
        });
        return row;
    }

    /**
     * Creates a delete button for a product row.
     * @private
     * @param {Function} onClick - Callback executed on click
     * @param {string} productName - Used for the accessible label
     * @returns {HTMLButtonElement}
     */
    createDeleteButton(onClick, productName) {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Eliminar ${productName}`);
        button.setAttribute('title', 'Eliminar producto');
        button.classList.add('btn-danger', 'btn-icon');

        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-trash');
        icon.setAttribute('aria-hidden', 'true');
        button.appendChild(icon);

        button.addEventListener('click', onClick);

        return button;
    }

    /* ------------------------------------------------------------------
     * Cliente, borrador y nueva cotización
     * ------------------------------------------------------------------ */

    /**
     * Keeps the preview and the saved draft in sync with the client name.
     * @private
     */
    onClientInput() {
        const name = this.dom.get('client').value.trim();
        this.state.setClient(name);
        this.dom.get('client_name').textContent = name;
        this.saveDraft();
    }

    /**
     * Saves client, products and the quote counter to localStorage.
     * @private
     */
    saveDraft() {
        this.draft.save({
            client: this.dom.get('client').value,
            products: this.state.products.map(({ nombre, cantidad, precio }) => ({ nombre, cantidad, precio })),
            counter: this.state.quoteCounter
        });
    }

    /**
     * Loads the saved draft, ignoring any malformed entries.
     * @private
     */
    restoreDraft() {
        const data = this.draft.load();
        if (!data) return;

        this.dom.get('client').value = typeof data.client === 'string' ? data.client : '';
        this.state.setClient(this.dom.get('client').value.trim());

        const products = Array.isArray(data.products) ? data.products : [];
        products.forEach((p) => {
            const valid = p
                && typeof p.nombre === 'string' && p.nombre.trim() !== ''
                && Number.isInteger(p.cantidad) && p.cantidad >= 1
                && Number.isFinite(p.precio) && p.precio > 0;
            if (valid) {
                this.state.addProduct({ nombre: p.nombre, cantidad: p.cantidad, precio: p.precio });
            }
        });

        if (Number.isInteger(data.counter) && data.counter >= 1) {
            this.state.quoteCounter = data.counter;
        }
    }

    /**
     * Starts a new quote: clears client and products after confirmation.
     * The quote counter is kept so file names stay unique.
     * @private
     */
    startNewQuote() {
        const hasData = this.state.hasProducts() || this.dom.get('client').value.trim() !== '';
        if (hasData && !window.confirm('¿Empezar una cotización nueva? Se borrarán el cliente y los productos.')) {
            return;
        }

        this.hideUndo();
        this.dom.get('client').value = '';
        this.state.clearProducts();
        this.state.setClient('');
        this.clearProductInputs();
        this.clearFieldError('client');
        this.renderProducts();
        this.draft.clear();
        this.saveDraft();
        this.dom.get('client').focus();
    }

    /**
     * Enables or disables the action buttons depending on the quote contents.
     * @private
     */
    updateActionState() {
        const hasProducts = this.state.hasProducts();
        const generate = this.dom.get('generate');
        generate.disabled = !hasProducts || this.isGenerating;
        generate.title = hasProducts ? '' : 'Agrega al menos un producto para descargar';
    }

    /* ------------------------------------------------------------------
     * Imagen
     * ------------------------------------------------------------------ */

    /**
     * Generates a PNG image of the current quote and starts the download.
     * Hides the delete buttons during capture and shows a loading state.
     * @private
     * @async
     * @returns {Promise<void>}
     */
    async generateQuoteImage() {
        if (this.isGenerating) return;

        if (!this.state.hasProducts()) {
            Validations.notyf.error('Agrega al menos un producto antes de descargar.');
            return;
        }

        if (!this.dom.get('client').value.trim()) {
            this.showFieldError('client', 'Escribe el nombre del cliente para nombrar el archivo.');
            this.dom.get('client').focus();
            return;
        }

        const table = this.dom.get('capture');
        if (!table) {
            Validations.notyf.error('No se encontró la cotización para generar la imagen.');
            return;
        }

        this.setGenerating(true);
        // Oculta la columna de acciones (botón borrar y su encabezado) solo en la imagen.
        const deleteCells = table.querySelectorAll('td:nth-child(5), th:nth-child(5)');
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
                imageTimeout: 15000
            });

            const imageUrl = canvas.toDataURL('image/png', 1.0);
            if (!imageUrl || imageUrl === 'data:,') {
                throw new Error('Failed to generate image data');
            }

            // Se genera el nombre una sola vez: incrementa el contador de cotizaciones.
            const fileName = this.generateFileName();
            this.downloadImage(imageUrl, fileName);
            this.saveDraft();
            Validations.notyf.success('Cotización descargada.');
        } catch (error) {
            console.error('Error generating quote image:', error);
            Validations.notyf.error('No se pudo generar la imagen. Intenta de nuevo.');
        } finally {
            deleteCells.forEach((cell, index) => {
                cell.style.display = originalDisplayValues[index] || '';
            });
            this.setGenerating(false);
        }
    }

    /**
     * Shows or hides the loading state of the download button.
     * @private
     * @param {boolean} active
     */
    setGenerating(active) {
        this.isGenerating = active;
        const button = this.dom.get('generate');
        button.innerHTML = active
            ? '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Generando…'
            : GENERATE_LABEL;
        this.updateActionState();
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
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    /**
     * Generates a filename from client initials, current date and quote counter.
     * @private
     * @returns {string}
     */
    generateFileName() {
        const clientName = this.dom.get('client').value.trim();
        // AAAAMMDD en hora local: ordena bien y no depende del idioma del navegador.
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const cleanDate = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
        const initials = QuoteUtils.getInitials(clientName);
        const identifier = QuoteUtils.generateQuoteIdentifier(this.state.quoteCounter++);
        return `${initials}${cleanDate}-${identifier}.png`;
    }
}
