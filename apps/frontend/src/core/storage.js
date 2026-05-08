/**
 * Local Storage Wrapper
 * Persistent storage with TTL support
 */

class StorageManager {
  constructor() {
    this.prefix = 'cotishama_';
    this.ttlMap = new Map();
  }

  set(key, value, ttl = null) {
    const prefixedKey = this.prefix + key;
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl ? Date.now() + ttl : null,
    };

    try {
      localStorage.setItem(prefixedKey, JSON.stringify(item));
      if (ttl) {
        this.ttlMap.set(key, setTimeout(() => this.remove(key), ttl));
      }
    } catch (error) {
      console.error('Storage set failed:', error);
    }
  }

  get(key) {
    const prefixedKey = this.prefix + key;

    try {
      const item = JSON.parse(localStorage.getItem(prefixedKey));

      if (!item) return null;

      if (item.ttl && item.ttl < Date.now()) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Storage get failed:', error);
      return null;
    }
  }

  remove(key) {
    const prefixedKey = this.prefix + key;
    localStorage.removeItem(prefixedKey);

    if (this.ttlMap.has(key)) {
      clearTimeout(this.ttlMap.get(key));
      this.ttlMap.delete(key);
    }
  }

  clear() {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
    this.ttlMap.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }
}

export const storage = new StorageManager();
