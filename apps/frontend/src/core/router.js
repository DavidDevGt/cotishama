/**
 * Client-Side Router
 * SPA routing without framework
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentPath = null;
  }

  register(pattern, handler) {
    this.routes.set(pattern, handler);
  }

  initialize() {
    window.addEventListener("popstate", () => this.navigate(window.location.pathname));
  }

  async navigate(path) {
    this.currentPath = path;

    // Find matching route
    const handler = this.routes.get(path) || this.routes.get("/404");

    if (!handler) {
      console.error("No route handler found for:", path);
      return;
    }

    // Update URL if different
    if (window.location.pathname !== path) {
      window.history.pushState({ path }, "", path);
    }

    try {
      await handler();
    } catch (error) {
      console.error("Route handler failed:", error);
    }
  }

  getCurrentPath() {
    return this.currentPath;
  }
}

export const router = new Router();
