/**
* @module constants
* @description Defines application-wide constants for currency and DOM element IDs
*/

/**
* Currency configuration for the application.
* @constant {Object} CURRENCY
*/
export const CURRENCY = {
   symbol: 'Q',
   code: 'GTQ'
};

/**
* Mapping of DOM element identifiers used throughout the application.
* @constant {Object} DOM_IDS
*/
export const DOM_IDS = {
   CLIENT: 'cliente',
   PRODUCT: 'producto',
   QUANTITY: 'cantidad',
   PRICE: 'precio',
   ADD: 'agregar',
   PRODUCTS_TABLE: 'productos',
   TOTAL: 'total',
   GENERATE: 'generar-pdf',
   CAPTURE: 'capture',
   CLIENT_NAME: 'nombre',
   DATE: 'fecha'
};

/**
 * Mapping of styles used in the application.
 * @constant {Object} STYLE
 */
export const STYLE = {
   MIN_ROWS: 12,
}