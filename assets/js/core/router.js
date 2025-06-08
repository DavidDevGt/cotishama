export class Router {
    constructor() {
        this.routes = {};
        this.middlewares = [];
        this.routeHistory = [];
        this.maxHistorySize = 25;

        this.currentRoute = null;
        this.currentParams = {};

        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname, false);
        });
    }

    /**
     * Adds a new route and its handler.
     * @param {string} path Route with or without parameters (e.g., "/user/:id")
     * @param {Function} handler Function that executes when navigating to the route
     */
    addRoute(path, handler) {
        if (typeof path !== 'string' || typeof handler !== 'function') {
            throw new Error('Invalid route. Expected (string, function).');
        }
        this.routes[path] = handler;
    }

    /**
     * Returns all registered routes.
     * @returns {string[]} Array of all registered route paths
     */
    allRoutes() {
        return Object.keys(this.routes);
    }

    /**
     * Adds a middleware that executes before each navigation.
     * @param {Function} fn Middleware function in the form (path, next)
     */
    use(fn) {
        if (typeof fn !== 'function') {
            throw new Error('Middleware must be a function');
        }
        this.middlewares.push(fn);
    }

    /**
     * Navigates to a route.
     * @param {string} path Desired route path
     * @param {boolean} pushState Whether to update the browser history (true by default)
     */
    navigate(path, pushState = true) {
        const matched = this._matchRoute(path);
        if (!matched) {
            console.warn(`Route not found: ${path}`);
            return;
        }

        const { route, params } = matched;

        const executeHandler = () => {
            if (pushState) {
                window.history.pushState({}, '', path);
            }

            this.currentRoute = route;
            this.currentParams = params;

            // Limit history size
            this.routeHistory.push(route);
            if (this.routeHistory.length > this.maxHistorySize) {
                this.routeHistory.shift();
            }

            this.routes[route](params);
        };

        this._runMiddlewares(path, executeHandler);
    }

    /**
     * Starts the router on the current route.
     */
    start() {
        this.navigate(window.location.pathname, false);
    }

    /**
     * Applies middlewares in order before executing the handler.
     * @private
     * @param {string} path The route path
     * @param {Function} done Callback to execute after all middlewares
     */
    _runMiddlewares(path, done) {
        const stack = [...this.middlewares];
        const next = () => {
            const middleware = stack.shift();
            if (middleware) {
                middleware(path, next);
            } else {
                done();
            }
        };
        next();
    }

    /**
     * Matches the current path with registered routes and extracts parameters.
     * @private
     * @param {string} path The path to match
     * @returns {Object|null} Object with route and params, or null if no match
     */
    _matchRoute(path) {
        for (const route in this.routes) {
            const paramNames = [];
            const regex = route.replace(/:([^\/]+)/g, (_, key) => {
                paramNames.push(key);
                return '([^\\/]+)';
            });

            const match = path.match(new RegExp(`^${regex}$`));
            if (match) {
                const params = {};
                paramNames.forEach((key, i) => {
                    params[key] = decodeURIComponent(match[i + 1]);
                });
                return { route, params };
            }
        }
        return null;
    }
}
