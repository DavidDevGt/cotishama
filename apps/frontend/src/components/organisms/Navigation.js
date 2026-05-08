/**
 * Navigation Organism
 * Main header navigation with branding and menu items
 *
 * Usage:
 * const nav = new Navigation({
 *   brand: { label: 'Cotishama', href: '/' },
 *   items: [
 *     { label: 'Dashboard', href: '/dashboard', icon: 'home' },
 *     { label: 'Products', href: '/products', icon: 'package' }
 *   ],
 *   onItemClick: (item) => navigate(item.href)
 * }).render()
 */

export class Navigation {
  constructor(options = {}) {
    const {
      brand = { label: "App", href: "/" },
      items = [],
      rightItems = [],
      activeHref = null,
      onItemClick = null,
      mobile = false,
      className = "",
      id = null,
    } = options;

    this.brand = brand;
    this.items = items;
    this.rightItems = rightItems;
    this.activeHref = activeHref;
    this.onItemClick = onItemClick;
    this.mobile = mobile;
    this.className = className;
    this.id = id;
    this.mobileOpen = false;
  }

  render() {
    const nav = document.createElement("nav");
    nav.className = `navigation ${this.className}`;
    nav.setAttribute("aria-label", "Main navigation");
    nav.style.cssText = `
      background-color: var(--color-background);
      border-bottom: 1px solid var(--color-border);
      padding: 0 var(--spacing-lg);
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      box-shadow: var(--shadow-xs);
    `;

    if (this.id) nav.id = this.id;

    // Container
    const container = document.createElement("div");
    container.className = "navigation-container";
    container.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-lg);
      max-width: 1400px;
      margin: 0 auto;
      height: 64px;
    `;

    // Brand
    const brand = this.renderBrand();
    container.appendChild(brand);

    // Menu (left)
    const menu = this.renderMenu();
    container.appendChild(menu);

    // Right items
    const rightSection = document.createElement("div");
    rightSection.className = "navigation-right";
    rightSection.style.cssText = `
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-left: auto;
    `;

    if (this.rightItems.length > 0) {
      this.rightItems.forEach((item) => {
        if (item.type === "button") {
          const { Button } = require("../atoms/Button.js");
          const btn = new Button({
            label: item.label,
            variant: item.variant || "secondary",
            size: "sm",
            onClick: item.onClick,
            icon: item.icon,
          }).render();
          rightSection.appendChild(btn);
        } else if (item.type === "divider") {
          const divider = document.createElement("div");
          divider.style.cssText = `
            width: 1px;
            height: 32px;
            background-color: var(--color-border);
          `;
          rightSection.appendChild(divider);
        }
      });
    }

    container.appendChild(rightSection);

    // Mobile menu button
    if (this.mobile) {
      const { Button } = require("../atoms/Button.js");
      const menuBtn = new Button({
        label: "☰",
        variant: "ghost",
        size: "sm",
        onClick: () => this.toggleMobileMenu(menu),
        ariaLabel: "Toggle navigation menu",
        title: "Menu",
        className: "nav-mobile-btn",
      }).render();
      container.appendChild(menuBtn);
    }

    nav.appendChild(container);
    return nav;
  }

  renderBrand() {
    const { Icon } = require("../atoms/Icon.js");

    const brand = document.createElement("div");
    brand.className = "navigation-brand";
    brand.style.cssText = `
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      text-decoration: none;
      color: var(--color-primary-500);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-lg);
      cursor: pointer;
      flex-shrink: 0;
    `;

    if (this.brand.icon) {
      const icon = new Icon({
        name: this.brand.icon,
        size: "md",
        color: "primary",
      }).render();
      brand.appendChild(icon);
    }

    const label = document.createElement("span");
    label.textContent = this.brand.label;
    brand.appendChild(label);

    if (this.brand.href) {
      brand.style.cursor = "pointer";
      brand.addEventListener("click", (e) => {
        if (this.onItemClick) {
          e.preventDefault();
          this.onItemClick(this.brand);
        }
      });
    }

    return brand;
  }

  renderMenu() {
    const { MenuItem } = require("../molecules/MenuItem.js");

    const menu = document.createElement("ul");
    menu.className = "navigation-menu";
    menu.style.cssText = `
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;
    `;

    this.items.forEach((item) => {
      const menuItem = new MenuItem({
        label: item.label,
        icon: item.icon,
        active: item.href === this.activeHref,
        href: item.href,
        onClick: () => {
          if (this.onItemClick) {
            this.onItemClick(item);
          }
        },
        size: "md",
      }).render();

      const li = document.createElement("li");
      li.style.cssText = "display: flex;";
      li.appendChild(menuItem);
      menu.appendChild(li);
    });

    return menu;
  }

  toggleMobileMenu(menu) {
    this.mobileOpen = !this.mobileOpen;
    menu.style.display = this.mobileOpen ? "flex" : "none";
  }
}

// Add Navigation styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .navigation {
      background-color: var(--color-background);
      border-bottom: 1px solid var(--color-border);
      padding: 0 var(--spacing-lg);
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      box-shadow: var(--shadow-xs);
    }

    .navigation-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-lg);
      max-width: 1400px;
      margin: 0 auto;
      height: 64px;
    }

    .navigation-brand {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      text-decoration: none;
      color: var(--color-primary-500);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-lg);
      cursor: pointer;
      flex-shrink: 0;
      transition: color var(--transition-fast);
    }

    .navigation-brand:hover {
      color: var(--color-primary-600);
    }

    .navigation-menu {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;
    }

    .navigation-menu li {
      display: flex;
    }

    .navigation-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-left: auto;
    }

    .nav-mobile-btn {
      display: none;
    }

    @media (max-width: 768px) {
      .navigation {
        padding: 0 var(--spacing-md);
      }

      .navigation-container {
        height: 56px;
        gap: var(--spacing-md);
      }

      .navigation-menu {
        display: none;
        position: absolute;
        top: 56px;
        left: 0;
        right: 0;
        flex-direction: column;
        gap: 0;
        background-color: var(--color-background);
        border-bottom: 1px solid var(--color-border);
        padding: var(--spacing-sm) 0;
        z-index: var(--z-fixed);
      }

      .navigation-menu li {
        width: 100%;
      }

      .navigation-menu li button,
      .navigation-menu li a {
        width: 100%;
        justify-content: flex-start;
        border-radius: 0;
      }

      .nav-mobile-btn {
        display: flex;
      }
    }
  `;
  document.head.appendChild(style);
}
