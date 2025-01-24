import { CURRENCY } from './constants.js';

/**
 * Utility class providing helper methods for quote-related operations.
 * @class QuoteUtils
 */
export class QuoteUtils {
    /**
     * Formats a number into a currency string with the system's currency symbol and code.
     * @param {number} amount - The monetary amount to format
     * @returns {string} Formatted currency string (e.g., "Q1,234.56 GTQ")
     */
    static formatCurrency(amount) {
        return `${CURRENCY.symbol}${amount.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${CURRENCY.code}`;
    }

    /**
     * Extracts initials from a full name.
     * @param {string} name - The full name to process
     * @returns {string} Uppercase initials from each word in the name
     * @example
     * QuoteUtils.getInitials("John Doe") // Returns "JD"
     */
    static getInitials(name) {
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    }

    /**
     * Removes separators from a date string.
     * @param {string} date - The date string to clean
     * @returns {string} Date string with all forward slashes and hyphens removed
     * @example
     * QuoteUtils.cleanDate("2024-01-22") // Returns "20240122"
     */
    static cleanDate(date) {
        return date.replace(/[/-]/g, '');
    }

    /**
     * Generates a padded quote identifier from a counter number.
     * @param {number} counter - The counter value to format
     * @returns {string} Three-digit padded string representation of the counter
     * @example
     * QuoteUtils.generateQuoteIdentifier(1) // Returns "001"
     */
    static generateQuoteIdentifier(counter) {
        return counter.toString().padStart(3, '0');
    }

    /**
     * Gets the current date in localized string format.
     * @returns {string} Current date formatted according to the system's locale
     */
    static getCurrentDate() {
        return new Date().toLocaleDateString();
    }

    /**
     * Sets an input field to uppercase when typing.
     * @param {HTMLInputElement} input - The input element to modify
     * @example
     * QuoteUtils.setInputUppercase(document.getElementById('client'));
     */
    static setUpperCase(input) {
        input.addEventListener('input', () => {
            input.value = input.value.toUpperCase();
        });
    }
}