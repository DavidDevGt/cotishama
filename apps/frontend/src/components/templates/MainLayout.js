/**
 * MainLayout Template
 * Primary layout with navigation and sidebar
 *
 * Usage:
 * const layout = new MainLayout({
 *   navItems: [
 *     { label: 'Dashboard', href: '/dashboard', icon: 'home' }
 *   ],
 *   sidebarItems: [
 *     { label: 'Menu', href: '/menu', icon: 'menu' }
 *   ]
 * }).render()
 *
 * layout.setContent(pageContent)
 */

export class MainLayout {
  constructor(options = {}) {
    const {
      navItems = [],
      navRightItems = [],
      brand = { label: "Cotishama", href: "/" },
      sidebarItems = [],
      sidebarWidth = "250px",
      showSidebar = true,
      onNavClick = null,
      onSidebarClick = null,
      className = "",
      id = null,
    } = options;

    this.navItems = navItems;
    this.navRightItems = navRightItems;
    this.brand = brand;
    this.sidebarItems = sidebarItems;
    this.sidebarWidth = sidebarWidth;
    this.showSidebar = showSidebar;
    this.onNavClick = onNavClick;
    this.onSidebarClick = onSidebarClick;
    this.className = className;
    this.id = id;
    this.contentElement = null;
  }

  render() {
    const { Navigation } = require("../organisms/Navigation.js");
    const { Sidebar } = require("../organisms/Sidebar.js");

    const container = document.createElement("div");
    container.className = `main-layout ${this.className}`;
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--color-background);
    `;

    if (this.id) container.id = this.id;

    // Navigation
    const nav = new Navigation({
      brand: this.brand,
      items: this.navItems,
      rightItems: this.navRightItems,
      onItemClick: (item) => {
        if (this.onNavClick) {
          this.onNavClick(item);
        }
      },
    }).render();
    container.appendChild(nav);

    // Main content area
    const mainWrapper = document.createElement("div");
    mainWrapper.className = "main-wrapper";
    mainWrapper.style.cssText = `
      display: flex;
      flex: 1;
      overflow: hidden;
    `;

    // Sidebar
    if (this.showSidebar && this.sidebarItems.length > 0) {
      const sidebar = new Sidebar({
        items: this.sidebarItems,
        width: this.sidebarWidth,
        onItemClick: (item) => {
          if (this.onSidebarClick) {
            this.onSidebarClick(item);
          }
        },
      }).render();
      mainWrapper.appendChild(sidebar);
    }

    // Content area
    const content = document.createElement("main");
    content.className = "main-content";
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-lg);
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    `;
    this.contentElement = content;
    mainWrapper.appendChild(content);

    container.appendChild(mainWrapper);

    // Public methods
    container.setContent = (element) => {
      content.innerHTML = "";
      if (typeof element === "string") {
        content.textContent = element;
      } else if (element instanceof HTMLElement) {
        content.appendChild(element);
      }
    };

    container.getContent = () => content;

    return container;
  }
}

// Add MainLayout styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .main-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--color-background);
    }

    .main-wrapper {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-lg);
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: var(--spacing-md);
      }
    }
  `;
  document.head.appendChild(style);
}
