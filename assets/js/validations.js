/**
 * Static class for form validations and error notifications.
 */
export class Validations {
    /**
     * Instance of Notyf for displaying notification messages.
     * @type {Notyf}
     * @static
     */
    static notyf = Validations.createNotifier();

    /**
     * Builds the toast notifier. If the Notyf CDN fails to load, falls back to a
     * no-op notifier so the rest of the app (inline errors, table, download) still works.
     * @static
     * @returns {{error: Function, success: Function}}
     */
    static createNotifier() {
        if (typeof Notyf !== 'undefined') {
            return new Notyf();
        }
        console.warn('Notyf no está disponible; las notificaciones emergentes están desactivadas.');
        return { error: () => {}, success: () => {} };
    }

    /**
     * Checks the product form and returns the first problem found, if any.
     * Errors are tied to a field so the UI can show them next to the input.
     * @static
     * @param {Object} form - Raw values read from the form
     * @param {string} form.cliente - Client name
     * @param {string} form.producto - Product name
     * @param {string} form.cantidad - Quantity as typed (string from the input)
     * @param {string} form.precio - Unit price as typed (string from the input)
     * @returns {{field: string, message: string}|null} The first error, or null when valid
     */
    static getFormError({ cliente, producto, cantidad, precio }) {
        if (!cliente) {
            return { field: 'cliente', message: 'Escribe el nombre del cliente.' };
        }
        if (!producto) {
            return { field: 'producto', message: 'Escribe o elige un producto.' };
        }

        const quantity = Number(cantidad);
        if (cantidad === '' || !Number.isInteger(quantity) || quantity < 1) {
            return { field: 'cantidad', message: 'Usa un número entero, mínimo 1.' };
        }

        const price = Number(precio);
        if (precio === '' || !Number.isFinite(price) || price <= 0) {
            return { field: 'precio', message: 'El precio debe ser mayor que 0.' };
        }

        return null;
    }
}
