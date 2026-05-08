/**
 * API Client
 * Fetch wrapper with JWT authentication and error handling
 */

class APIClient {
  constructor(baseURL = '/api/v1') {
    this.baseURL = baseURL;
    this.timeout = 30000;
    this.authToken = null;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  async request(method, endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const config = {
      method,
      headers,
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          ...data.error,
        };
      }

      return data;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  get(endpoint, options) {
    return this.request('GET', endpoint, options);
  }

  post(endpoint, body, options) {
    return this.request('POST', endpoint, { ...options, body });
  }

  put(endpoint, body, options) {
    return this.request('PUT', endpoint, { ...options, body });
  }

  patch(endpoint, body, options) {
    return this.request('PATCH', endpoint, { ...options, body });
  }

  delete(endpoint, options) {
    return this.request('DELETE', endpoint, options);
  }
}

export const apiClient = new APIClient();
