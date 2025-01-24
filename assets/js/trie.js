/**
 * @classdesc Represents a node in a Trie data structure.
 * Each node can hold multiple children, one for each character.
 * It also tracks whether it is the end of a word, the word itself,
 * the word’s insertion frequency, and a popularity score.
 */
class TrieNode {
    /**
     * Creates a new TrieNode instance.
     * @constructor
     */
    constructor() {
        /**
         * @type {Object.<string, TrieNode>}
         * @description An object mapping a character to a child TrieNode.
         */
        this.children = {};

        /**
         * @type {boolean}
         * @description Indicates if this node marks the end of a valid word.
         */
        this.isEndOfWord = false;

        /**
         * @type {?string}
         * @description Stores the complete word if this node is the ending node.
         */
        this.word = null;

        /**
         * @type {number}
         * @description Tracks how many times the word was inserted into the Trie.
         */
        this.frequency = 0;

        /**
         * @type {number}
         * @description A heuristic indicating how frequently this node (character path) is traversed.
         */
        this.popularity = 0;
    }
}

/**
 * @classdesc A Trie data structure supporting efficient word insertions, lookups, 
 * and prefix-based queries. Includes caching for autocomplete operations.
 */
export class Trie {
    /**
     * Creates a new Trie instance.
     * @constructor
     * @param {string[]} [initialWords=[]] - An optional array of words to pre-populate the Trie.
     */
    constructor(initialWords = []) {
        /**
         * @type {TrieNode}
         * @description The root node of the Trie.
         */
        this.root = new TrieNode();

        /**
         * @type {Map<string, string[]>}
         * @description Caches the results of autocomplete queries. The key is the prefix string, 
         * and the value is an array of suggestions.
         */
        this.cache = new Map();

        /**
         * @type {number}
         * @description The maximum number of prefix results to store in the cache.
         */
        this.maxCacheSize = 1000;

        // Insert initial words if provided.
        initialWords.forEach(word => this.insert(word.toLowerCase()));
    }

    /**
     * Inserts a word into the Trie (case-insensitive).
     * @param {string} word - The word to insert into the Trie.
     * @example
     * trie.insert('Hello');
     * trie.insert('world');
     */
    insert(word) {
        let current = this.root;

        for (const char of word.toLowerCase()) {
            if (!current.children[char]) {
                current.children[char] = new TrieNode();
            }
            current = current.children[char];
            
            // Increment popularity for each character/node visited
            current.popularity = (current.popularity || 0) + 1;
        }

        current.isEndOfWord = true;
        current.word = word;
        current.frequency++;

        // Clear the autocomplete cache whenever a new word is inserted
        this.cache.clear();
    }

    /**
     * Provides autocomplete suggestions for a given prefix, with ranking
     * based on frequency, popularity, and word length.
     *
     * @param {string} prefix - The prefix to match.
     * @param {Object} [options={}] - Options to configure the autocomplete behavior.
     * @param {number} [options.limit=10] - Maximum number of suggestions to return.
     * @param {boolean} [options.caseSensitive=false] - Whether to treat prefix as case-sensitive.
     * @param {number} [options.minWordLength=1] - Minimum word length to include in suggestions.
     * @param {number} [options.maxWordLength=Infinity] - Maximum word length to include in suggestions.
     * @returns {string[]} An array of ranked autocomplete suggestions.
     *
     * @example
     * trie.autocomplete('ap');          // Returns up to 10 suggestions by default
     * trie.autocomplete('ap', { limit: 5, caseSensitive: true });
     */
    autocomplete(prefix, options = {}) {
        const {
            limit = 10,
            caseSensitive = false,
            minWordLength = 1,
            maxWordLength = Infinity
        } = options;

        const normalizedPrefix = caseSensitive ? prefix : prefix.toLowerCase();
        const cacheKey = `autocomplete_${normalizedPrefix}`;

        // Return cached results if they exist
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const suggestions = [];
        let current = this.root;

        // Traverse down the Trie to the node corresponding to the prefix
        for (const char of normalizedPrefix) {
            if (!current.children[char]) {
                // No matching prefix found; return an empty array
                return suggestions;
            }
            current = current.children[char];
        }

        // Helper function to perform DFS from the prefix node to collect suggestions
        const collectSuggestions = (node, currentWord) => {
            if (node.isEndOfWord) {
                const wordLength = currentWord.length;
                if (wordLength >= minWordLength && wordLength <= maxWordLength) {
                    suggestions.push({
                        word: node.word,
                        frequency: node.frequency,
                        popularity: node.popularity
                    });
                }
            }

            // Recursively collect from child nodes
            for (const [char, childNode] of Object.entries(node.children)) {
                collectSuggestions(childNode, currentWord + char);
            }
        };

        // Gather all potential suggestions from this prefix
        collectSuggestions(current, normalizedPrefix);

        // Rank the suggestions:
        // 1) frequency (descending),
        // 2) popularity (descending),
        // 3) word length (ascending).
        const rankedSuggestions = suggestions
            .sort((a, b) => {
                if (a.frequency !== b.frequency) {
                    return b.frequency - a.frequency;
                }
                if (a.popularity !== b.popularity) {
                    return b.popularity - a.popularity;
                }
                return a.word.length - b.word.length;
            })
            .map(s => s.word)
            .slice(0, limit);

        // Manage cache size and store the new result
        if (this.cache.size >= this.maxCacheSize) {
            // Remove the oldest entry (Map in insertion order)
            this.cache.delete(this.cache.keys().next().value);
        }
        this.cache.set(cacheKey, rankedSuggestions);

        return rankedSuggestions;
    }

    /**
     * Searches for a full word in the Trie (case-insensitive).
     * @param {string} word - The word to search for.
     * @returns {boolean} `true` if the word exists in the Trie; otherwise, `false`.
     * @example
     * trie.search('hello'); // returns true if 'hello' was inserted
     */
    search(word) {
        let current = this.root;

        for (const char of word.toLowerCase()) {
            if (!current.children[char]) {
                return false;
            }
            current = current.children[char];
        }

        return current.isEndOfWord;
    }

    /**
     * Checks if the Trie contains any word starting with the given prefix (case-insensitive).
     * @param {string} prefix - The prefix to check.
     * @returns {boolean} `true` if there is at least one word with the given prefix; otherwise, `false`.
     * @example
     * trie.startsWith('hell'); // returns true if a word 'hello', 'helloworld', etc. exists
     */
    startsWith(prefix) {
        let current = this.root;

        for (const char of prefix.toLowerCase()) {
            if (!current.children[char]) {
                return false;
            }
            current = current.children[char];
        }

        return true;
    }

    /**
     * Retrieves autocomplete suggestions for a given prefix, returning up to a specified limit.
     * This is a convenience wrapper around the more configurable `autocomplete` method.
     *
     * @param {string} prefix - The prefix to get suggestions for.
     * @param {number} [limit=10] - The maximum number of suggestions to return.
     * @returns {string[]} An array of suggestions.
     * @example
     * trie.getSuggestions('wor', 5); // returns up to 5 suggestions
     */
    getSuggestions(prefix, limit = 10) {
        return this.autocomplete(prefix, { limit });
    }

    /**
     * Inserts multiple words into the Trie in bulk (case-insensitive).
     * @param {string[]} words - An array of words to insert.
     * @example
     * trie.bulkInsert(['apple', 'app', 'application']);
     */
    bulkInsert(words) {
        words.forEach(word => this.insert(word));
    }
}
