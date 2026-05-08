/**
 * Sidebar Organism
 * Left sidebar navigation with collapsible sections
 *
 * Usage:
 * new Sidebar({
 *   items: [
 *     { label: 'Dashboard', icon: 'home', href: '/dashboard' },
 *     { label: 'Settings', icon: 'settings', href: '/settings' }
 *   ],
 *   onItemClick: (item) => navigate(item.href)
 * }).render()
 */

export class Sidebar {
  constructor(options = {}) {
    const {
      items = [],
      collapsible = true,
      collapsed = false,
      width = "250px",
      onItemClick = null,
      activeHref = null,
      className = "",
      id = null,
    } = options;

    this.items = items;
    this.collapsible = collapsible;
    this.collapsed = collapsed;
    this.width = width;
    this.onItemClick = onItemClick;
    this.activeHref = activeHref;
    this.className = className;
    this.id = id;
  }

  render() {
    const { MenuItem } = require("../molecules/MenuItem.js");
    const { Icon } = require("../atoms/Icon.js");

    const aside = document.createElement("aside");
    aside.className = `sidebar ${this.className}`;
    aside.style.cssText = `
      width: ${this.width};
      background-color: var(--color-surface);
      border-right: 1px solid var(--color-border);
      padding: var(--spacing-lg) 0;
      height: 100vh;
      position: sticky;
      top: 0;
      overflow-y: auto;
      transition: width var(--transition-normal), transform var(--transition-normal);
      ${this.collapsed ? "width: 60px" : ""}
    `;

    if (this.id) aside.id = this.id;

    // Collapse button
    if (this.collapsible) {
      const collapseBtn = document.createElement("button");
      collapseBtn.className = "sidebar-toggle";
      collapseBtn.setAttribute("aria-label", "Toggle sidebar");
      collapseBtn.setAttribute("aria-expanded", !this.collapsed);
      collapseBtn.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 48px;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--color-text-primary);
        transition: background-color var(--transition-fast);
        padding: var(--spacing-md);
        gap: var(--spacing-sm);
      `;

      const icon = new Icon({
        name: this.collapsed ? "chevron_right" : "chevron_left",
        size: "md",
      }).render();
      collapseBtn.appendChild(icon);

      if (!this.collapsed) {
        const label = document.createElement("span");
        label.textContent = "Collapse";
        label.style.cssText = "font-size: var(--font-size-sm);";
        collapseBtn.appendChild(label);
      }

      collapseBtn.addEventListener("click", () => {
        this.collapsed = !this.collapsed;
        aside.style.width = this.collapsed ? "60px" : this.width;
        collapseBtn.setAttribute("aria-expanded", !this.collapsed);

        // Update icon and label
        const currentIcon = collapseBtn.querySelector("svg");
        if (currentIcon) currentIcon.remove();
        const newIcon = new Icon({
          name: this.collapsed ? "chevron_right" : "chevron_left",
          size: "md",
        }).render();
        collapseBtn.insertBefore(newIcon, collapseBtn.firstChild);

        const label = collapseBtn.querySelector("span");
        if (label) label.remove();
        if (!this.collapsed) {
          const newLabel = document.createElement("span");
          newLabel.textContent = "Collapse";
          newLabel.style.cssText = "font-size: var(--font-size-sm);";
          collapseBtn.appendChild(newLabel);
        }
      });

      aside.appendChild(collapseBtn);
    }

    // Navigation
    const nav = document.createElement("nav");
    nav.className = "sidebar-nav";
    nav.setAttribute("aria-label", "Sidebar navigation");
    nav.style.cssText = `
      display: flex;
      flex-direction: column;
      padding: 0 var(--spacing-sm);
    `;

    // Render items
    this.items.forEach((item) => {
      if (item.type === "section") {
        const section = this.renderSection(item);
        nav.appendChild(section);
      } else if (item.type === "divider") {
        const divider = document.createElement("div");
        divider.style.cssText = `
          height: 1px;
          background-color: var(--color-border);
          margin: var(--spacing-md) 0;
        `;
        nav.appendChild(divider);
      } else {
        const menuItem = new MenuItem({
          label: item.label,
          icon: item.icon,
          badge: item.badge,
          active: item.href === this.activeHref,
          href: item.href,
          onClick: () => {
            if (this.onItemClick) {
              this.onItemClick(item);
            }
          },
          size: "md",
        }).render();
        nav.appendChild(menuItem);
      }
    });

    aside.appendChild(nav);

    return aside;
  }

  renderSection(section) {
    const { Icon } = require("../atoms/Icon.js");

    const container = document.createElement("div");
    container.className = "sidebar-section";
    container.style.cssText = `
      margin-bottom: var(--spacing-md);
    `;

    // Section header (collapsible)
    const header = document.createElement("button");
    header.className = "sidebar-section-header";
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: none;
      background: none;
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: color var(--transition-fast);
    `;

    header.textContent = section.label;

    const chevron = new Icon({
      name: section.expanded ? "chevron_down" : "chevron_right",
      size: "sm",
    }).render();
    header.appendChild(chevron);

    // Content
    const content = document.createElement("div");
    content.className = "sidebar-section-content";
    content.style.cssText = `
      display: ${section.expanded ? "flex" : "none"};
      flex-direction: column;
      gap: var(--spacing-xs);
    `;

    section.items.forEach((item) => {
      const { MenuItem } = require("../molecules/MenuItem.js");
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
        size: "sm",
        className: "sidebar-subsection-item",
      }).render();
      menuItem.style.marginLeft = "var(--spacing-md)";
      content.appendChild(menuItem);
    });

    header.addEventListener("click", () => {
      section.expanded = !section.expanded;
      content.style.display = section.expanded ? "flex" : "none";

      // Update chevron
      const currentChevron = header.querySelector("svg");
      if (currentChevron) currentChevron.remove();
      const newChevron = new Icon({
        name: section.expanded ? "chevron_down" : "chevron_right",
        size: "sm",
      }).render();
      header.appendChild(newChevron);
    });

    container.appendChild(header);
    container.appendChild(content);

    return container;
  }
}

// Add Sidebar styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .sidebar {
      width: 250px;
      background-color: var(--color-surface);
      border-right: 1px solid var(--color-border);
      padding: var(--spacing-lg) 0;
      height: 100vh;
      position: sticky;
      top: 0;
      overflow-y: auto;
      transition: width var(--transition-normal), transform var(--transition-normal);
    }

    .sidebar-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 48px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--color-text-primary);
      transition: background-color var(--transition-fast);
      padding: var(--spacing-md);
      gap: var(--spacing-sm);
    }

    .sidebar-toggle:hover {
      background-color: var(--color-neutral-100);
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      padding: 0 var(--spacing-sm);
    }

    .sidebar-section {
      margin-bottom: var(--spacing-md);
    }

    .sidebar-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: none;
      background: none;
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: color var(--transition-fast);
    }

    .sidebar-section-header:hover {
      color: var(--color-text-primary);
    }

    .sidebar-section-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .sidebar-subsection-item {
      margin-left: var(--spacing-md);
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 56px;
        height: calc(100vh - 56px);
        z-index: var(--z-fixed);
        transform: translateX(-100%);
        transition: transform var(--transition-normal);
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
}
