/**
 * Global State Management
 * Event-driven state management without frameworks
 */

class StateManager {
  constructor() {
    this.state = {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
      },
      ui: {
        loading: false,
        error: null,
        notification: null,
      },
      quotes: [],
      clients: [],
      products: [],
    };

    this.listeners = new Map();
  }

  get(path) {
    const keys = path.split('.');
    let value = this.state;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  set(path, value) {
    const keys = path.split('.');
    let obj = this.state;

    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }

    const oldValue = obj[keys[keys.length - 1]];
    obj[keys[keys.length - 1]] = value;

    // Emit event
    this.emit(path, { oldValue, newValue: value });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for "${event}":`, error);
        }
      }
    }
  }

  notify({ type = 'info', message = '' }) {
    this.set('ui.notification', { type, message, timestamp: Date.now() });
  }

  getSnapshot() {
    return JSON.parse(JSON.stringify(this.state));
  }

  reset() {
    this.state = {
      auth: { user: null, token: null, isAuthenticated: false },
      ui: { loading: false, error: null, notification: null },
      quotes: [],
      clients: [],
      products: [],
    };
  }
}

export const state = new StateManager();
