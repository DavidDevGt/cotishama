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
    }
 }