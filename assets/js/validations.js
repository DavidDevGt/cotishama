export class Validations {
    static notyf = new Notyf();

    static validateNotEmpty(value, errorMessage) {
        if (!value || value.trim() === '') {
            this.notyf.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    static validateNumber(value, minValue, errorMessage) {
        const number = parseFloat(value);
        if (isNaN(number) || number < minValue) {
            this.notyf.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    static validateForm({ nombre, cantidad, precio, cliente }) {
        try {
            // Validar el nombre del cliente
            this.validateNotEmpty(cliente, 'El nombre del cliente es obligatorio.');

            // Validar el nombre del producto
            this.validateNotEmpty(nombre, 'El nombre del producto es obligatorio.');

            // Validar cantidad (número entero mayor o igual a 1)
            this.validateNotEmpty(cantidad, 'La cantidad es obligatoria.');
            this.validateNumber(cantidad, 1, 'La cantidad debe ser al menos 1.');

            // Validar precio (número mayor o igual a 0)
            this.validateNotEmpty(precio, 'El precio es obligatorio.');
            this.validateNumber(precio, 0, 'El precio debe ser un número positivo.');
        } catch (error) {
            return false; // Detener flujo si ocurre un error
        }
        return true; // Todo válido
    }
}
