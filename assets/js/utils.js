import { CURRENCY } from './constants.js';

export class QuoteUtils {
    static formatCurrency(amount) {
        return `${CURRENCY.symbol}${amount.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${CURRENCY.code}`;
    }

    static getInitials(name) {
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    }

    static cleanDate(date) {
        return date.replace(/[/-]/g, '');
    }

    static generateQuoteIdentifier(counter) {
        return counter.toString().padStart(3, '0');
    }

    static getCurrentDate() {
        return new Date().toLocaleDateString();
    }
}