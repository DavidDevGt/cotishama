import { DOM_IDS } from './constants.js';

export class DOMElements {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    initializeElements() {
        Object.entries(DOM_IDS).forEach(([key, id]) => {
            this.elements[key.toLowerCase()] = document.getElementById(id);
        });
    }

    get(elementKey) {
        return this.elements[elementKey.toLowerCase()];
    }
}
