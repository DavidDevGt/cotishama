/**
 * Saves the in-progress quote in localStorage so a reload does not lose work.
 * Every storage call is wrapped in try/catch: private mode or blocked storage
 * must never break the app, it just means no draft is kept.
 */
const STORAGE_KEY = 'cotishama:draft:v1';

export class DraftStorage {
    /**
     * Reads the saved draft.
     * @returns {{client: string, products: Array<Object>, counter: number}|null}
     */
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Stores the draft.
     * @param {{client: string, products: Array<Object>, counter: number}} data
     */
    save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            // Storage unavailable: the app keeps working without a draft.
        }
    }

    /** Removes the saved draft. */
    clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            // Nothing to do if storage is unavailable.
        }
    }
}
