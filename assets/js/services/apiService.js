class ApiService {
    constructor(baseURL = '', defaultHeaders = {}) {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...defaultHeaders
        };
    }

    /**
     * Set or update default headers
     * @param {Object} headers 
     */
    setHeaders(headers) {
        this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    }

    /**
     * Set Authorization token
     * @param {string} token 
     * @param {string} type 
     */
    setToken(token, type = 'Bearer') {
        this.setHeaders({ Authorization: `${type} ${token}` });
    }

    /**
     * Remove Authorization token
     */
    clearToken() {
        delete this.defaultHeaders.Authorization;
    }

    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        const config = {
            headers: { ...this.defaultHeaders, ...(options.headers || {}) },
            ...options
        };

        try {
            const res = await fetch(url, config);
            if (!res.ok) {
                throw new ApiError(`HTTP ${res.status}: ${res.statusText}`, res.status, res);
            }
            return res;
        } catch (err) {
            throw err instanceof ApiError ? err : new ApiError('Fetch failed', 0, null, err);
        }
    }

    async get(endpoint, params = {}, options = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.request(qs ? `${endpoint}?${qs}` : endpoint, {
            method: 'GET',
            ...options
        });
    }

    async post(endpoint, data, options = {}) {
        const config = {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options
        };

        if (data instanceof FormData) {
            delete config.headers?.['Content-Type'];
        }

        return this.request(endpoint, config);
    }

    async put(endpoint, data, options = {}) {
        return this.postOrUpdate('PUT', endpoint, data, options);
    }

    async patch(endpoint, data, options = {}) {
        return this.postOrUpdate('PATCH', endpoint, data, options);
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { method: 'DELETE', ...options });
    }

    async postOrUpdate(method, endpoint, data, options = {}) {
        const config = {
            method,
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options
        };

        if (data instanceof FormData) {
            delete config.headers?.['Content-Type'];
        }

        return this.request(endpoint, config);
    }

    // JSON responses
    async fetchJson(endpoint, params = {}, options = {}) {
        const res = await this.get(endpoint, params, options);
        return res.json();
    }

    async createJson(endpoint, data, options = {}) {
        const res = await this.post(endpoint, data, options);
        return res.json();
    }

    async updateJson(endpoint, data, options = {}) {
        const res = await this.put(endpoint, data, options);
        return res.json();
    }

    async modifyJson(endpoint, data, options = {}) {
        const res = await this.patch(endpoint, data, options);
        return res.json();
    }

    async removeJson(endpoint, options = {}) {
        const res = await this.delete(endpoint, options);
        return res.json();
    }

    // Text and Blob
    async fetchText(endpoint, params = {}, options = {}) {
        const res = await this.get(endpoint, params, options);
        return res.text();
    }

    async fetchBlob(endpoint, params = {}, options = {}) {
        const res = await this.get(endpoint, params, options);
        return res.blob();
    }

    // File upload
    async uploadSingleFile(endpoint, file, field = 'file', extra = {}) {
        const form = new FormData();
        form.append(field, file);
        Object.entries(extra).forEach(([k, v]) => form.append(k, v));
        return this.post(endpoint, form);
    }

    async uploadMultipleFiles(endpoint, files, field = 'files', extra = {}) {
        const form = new FormData();
        files.forEach((file, i) => form.append(`${field}[${i}]`, file));
        Object.entries(extra).forEach(([k, v]) => form.append(k, v));
        return this.post(endpoint, form);
    }

    // File download
    async downloadAs(endpoint, filename, params = {}) {
        const blob = await this.fetchBlob(endpoint, params);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        link.remove();
    }

    // Timeout support
    async fetchWithTimeout(endpoint, options = {}, timeout = 8000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            return await this.request(endpoint, { ...options, signal: controller.signal });
        } finally {
            clearTimeout(id);
        }
    }

    // Retry support
    async fetchWithRetry(endpoint, options = {}, retries = 2, delay = 500) {
        let error;
        for (let i = 0; i <= retries; i++) {
            try {
                return await this.request(endpoint, options);
            } catch (err) {
                error = err;
                if (i < retries) {
                    await new Promise(r => setTimeout(r, delay * (2 ** i)));
                }
            }
        }
        throw error;
    }

    // Multiple requests
    async fetchBatch(requests = []) {
        return Promise.all(requests.map(({ endpoint, method = 'GET', data, options }) =>
            this[method.toLowerCase()](endpoint, data, options).catch(error => ({ error }))
        ));
    }

    async fetchAllSettled(requests = []) {
        return Promise.allSettled(requests.map(({ endpoint, options = {} }) =>
            this.request(endpoint, options)
        ));
    }
}

// Custom error
class ApiError extends Error {
    constructor(message, status = 0, response = null, original = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
        this.original = original;
    }

    async toText() {
        try {
            return await this.response?.text();
        } catch {
            return null;
        }
    }

    async toJson() {
        try {
            return await this.response?.json();
        } catch {
            return null;
        }
    }
}

// Singleton export
const api = new ApiService();

export { ApiService, ApiError, api };
