// State Management
export class QuoteState {
    /**
     * Initializes a new QuoteState instance with empty products array and initial counter.
     */
    constructor() {
        /**
         * Array of products in the current quote.
         * @type {Array<Object>}
         * @property {string} nombre - The name of the product
         * @property {number} cantidad - The quantity of the product
         * @property {number} precio - The price per unit
         * @property {string} cliente - The client name associated with the product
         */
        this.products = [];
        
        /**
         * Counter used to generate unique identifiers for quotes.
         * Increments with each quote generation.
         * @type {number}
         */
        this.quoteCounter = 1;
        
        /**
         * Current client information
         * @type {Object}
         */
        this.client = {
            name: '',
            lastModified: null
        };
        
        /**
         * Quote metadata
         * @type {Object}
         */
        this.metadata = {
            created: new Date(),
            lastModified: new Date(),
            version: '1.0'
        };
    }

    /**
     * Adds a product to the quote and updates metadata
     * @param {Object} product - Product to add
     * @returns {boolean} Success status
     */
    addProduct(product) {
        if (!product || !product.nombre || !product.cantidad || !product.precio) {
            return false;
        }
        
        this.products.push({
            ...product,
            id: this.generateProductId(),
            addedAt: new Date()
        });
        
        this.updateMetadata();
        return true;
    }

    /**
     * Removes a product by index
     * @param {number} index - Index of product to remove
     * @returns {boolean} Success status
     */
    removeProduct(index) {
        if (index < 0 || index >= this.products.length) {
            return false;
        }
        
        this.products.splice(index, 1);
        this.updateMetadata();
        return true;
    }

    /**
     * Updates a product by index
     * @param {number} index - Index of product to update
     * @param {Object} updates - Fields to update
     * @returns {boolean} Success status
     */
    updateProduct(index, updates) {
        if (index < 0 || index >= this.products.length) {
            return false;
        }
        
        this.products[index] = {
            ...this.products[index],
            ...updates,
            modifiedAt: new Date()
        };
        
        this.updateMetadata();
        return true;
    }

    /**
     * Gets the total amount of the quote
     * @returns {number} Total amount
     */
    getTotal() {
        return this.products.reduce((total, product) => {
            return total + (product.cantidad * product.precio);
        }, 0);
    }

    /**
     * Gets the total number of items
     * @returns {number} Total quantity
     */
    getTotalItems() {
        return this.products.reduce((total, product) => {
            return total + product.cantidad;
        }, 0);
    }

    /**
     * Checks if the quote has products
     * @returns {boolean} True if has products
     */
    hasProducts() {
        return this.products.length > 0;
    }

    /**
     * Sets client information
     * @param {string} clientName - Name of the client
     */
    setClient(clientName) {
        this.client.name = clientName;
        this.client.lastModified = new Date();
        this.updateMetadata();
    }

    /**
     * Gets current client name
     * @returns {string} Client name
     */
    getClientName() {
        return this.client.name;
    }

    /**
     * Clears all products from the quote
     */
    clearProducts() {
        this.products = [];
        this.updateMetadata();
    }

    /**
     * Resets the entire state
     */
    reset() {
        this.products = [];
        this.quoteCounter = 1;
        this.client = {
            name: '',
            lastModified: null
        };
        this.metadata = {
            created: new Date(),
            lastModified: new Date(),
            version: '1.0'
        };
    }

    /**
     * Gets a copy of the current state
     * @returns {Object} State snapshot
     */
    getSnapshot() {
        return {
            products: [...this.products],
            quoteCounter: this.quoteCounter,
            client: { ...this.client },
            metadata: { ...this.metadata },
            total: this.getTotal(),
            totalItems: this.getTotalItems()
        };
    }

    /**
     * Validates the current state
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];
        
        if (!this.hasProducts()) {
            errors.push('No products in quote');
        }
        
        if (!this.client.name.trim()) {
            errors.push('Client name is required');
        }
        
        // Check for invalid products
        this.products.forEach((product, index) => {
            if (!product.nombre || !product.nombre.trim()) {
                errors.push(`Product ${index + 1}: Name is required`);
            }
            if (!product.cantidad || product.cantidad <= 0) {
                errors.push(`Product ${index + 1}: Invalid quantity`);
            }
            if (!product.precio || product.precio <= 0) {
                errors.push(`Product ${index + 1}: Invalid price`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generates a unique product ID
     * @private
     * @returns {string} Unique ID
     */
    generateProductId() {
        return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Updates the metadata timestamp
     * @private
     */
    updateMetadata() {
        this.metadata.lastModified = new Date();
    }
}