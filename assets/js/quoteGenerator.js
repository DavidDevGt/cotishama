import { QuoteState } from './state.js';
import { DOMElements } from './dom.js';
import { QuoteUtils } from './utils.js';
import { Validations } from './validations.js';

export class QuoteGenerator {
    constructor() {
        this.state = new QuoteState();
        this.dom = new DOMElements();
        this.currentDate = QuoteUtils.getCurrentDate();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.dom.get('add').addEventListener('click', () => this.addProduct());
        this.dom.get('generate').addEventListener('click', () => this.generateQuoteImage());
    }

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

        this.dom.get('total').textContent = QuoteUtils.formatCurrency(total);
    }

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

    createDeleteButton(onClick) {
        const button = document.createElement('button');
        button.textContent = 'Eliminar';
        button.setAttribute('type', 'button');
        button.classList.add('btn-danger');
        button.addEventListener('click', onClick);
        return button;
    }

    clearInputs() {
        ['product', 'quantity', 'price'].forEach(field => {
            this.dom.get(field).value = '';
        });
    }

    async generateQuoteImage() {
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

    generateFileName() {
        const clientName = this.dom.get('client').value;
        const cleanDate = QuoteUtils.cleanDate(this.currentDate);
        const initials = QuoteUtils.getInitials(clientName);
        const identifier = QuoteUtils.generateQuoteIdentifier(this.state.quoteCounter++);

        return `${initials}${cleanDate}-${identifier}.png`;
    }

    downloadImage(url, fileName) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
    }
}
