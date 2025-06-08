/**
 * Static class for handling form validations and error notifications.
 */
export class Validations {
    /**
     * Instance of Notyf for displaying notification messages.
     * @type {Notyf}
     * @static
     */
    static notyf = new Notyf();

    /**
     * Validates that a value is not empty or only whitespace.
     * @static
     * @param {string} value - The value to validate
     * @param {string} errorMessage - The error message to display if validation fails
     * @throws {Error} If the value is empty or only contains whitespace
     */
    static validateNotEmpty(value, errorMessage) {
        if (!value || value.trim() === '') {
            this.notyf.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Validates that a value is a number and meets the minimum value requirement.
     * @static
     * @param {string|number} value - The value to validate
     * @param {number} minValue - The minimum acceptable value
     * @param {string} errorMessage - The error message to display if validation fails
     * @throws {Error} If the value is not a number or is less than the minimum value
     */
    static validateNumber(value, minValue, errorMessage) {
        const stringValue = String(value).trim();
        if (!/^\d*\.?\d*$/.test(stringValue) || stringValue === '') {
            this.notyf.error('Solo se permiten números.');
            throw new Error('Solo se permiten números.');
        }

        const number = parseFloat(value);
        if (isNaN(number) || number < minValue) {
            this.notyf.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Validates that a value is a positive integer (for quantities).
     * @static
     * @param {string|number} value - The value to validate
     * @param {string} errorMessage - The error message to display if validation fails
     * @throws {Error} If the value is not a positive integer
     */
    static validateInteger(value, errorMessage) {
        const stringValue = String(value).trim();
        if (!/^\d+$/.test(stringValue) || stringValue === '') {
            this.notyf.error('Solo se permiten números enteros.');
            throw new Error('Solo se permiten números enteros.');
        }

        const number = parseInt(value);
        if (isNaN(number) || number < 1) {
            this.notyf.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Validates a complete form object containing product and client information.
     * @static
     * @param {Object} form - The form object to validate
     * @param {string} form.nombre - The product name
     * @param {string|number} form.cantidad - The quantity of the product
     * @param {string|number} form.precio - The price of the product
     * @param {string} form.cliente - The client name
     * @returns {boolean} True if all validations pass, false otherwise
     */
    static validateForm({ nombre, cantidad, precio, cliente }) {
        try {
            // Validar el nombre del cliente
            this.validateNotEmpty(cliente, 'El nombre del cliente es obligatorio.');

            // Validar el nombre del producto
            this.validateNotEmpty(nombre, 'El nombre del producto es obligatorio.');

            // Validar cantidad (número entero mayor o igual a 1)
            this.validateNotEmpty(cantidad, 'La cantidad es obligatoria.');
            this.validateInteger(cantidad, 'La cantidad debe ser al menos 1.');

            // Validar precio (número mayor o igual a 0)
            this.validateNotEmpty(precio, 'El precio es obligatorio.');
            this.validateNumber(precio, 0, 'El precio debe ser un número positivo.');
        } catch (error) {
            return false; // Detener flujo si ocurre un error
        }
        return true; // Todo válido
    }

    /**
     * Validates that there are products in the quote.
     * @static
     * @param {Array} products - The list of products in the quote
     * @returns {boolean} False if there are no products, otherwise true
     */
    static validateHasProducts(products) {
        if (!products || products.length === 0) {
            this.notyf.error('No hay productos en la cotización. Agrega al menos uno para continuar.');
            return false;
        }
        return true;
    }
}
