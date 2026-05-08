/**
 * DashboardLayout Template
 * Dashboard-specific layout with grid system for widgets
 *
 * Usage:
 * const dashboard = new DashboardLayout({
 *   title: 'Dashboard',
 *   subtitle: 'Welcome back!',
 *   layout: 'grid'
 * }).render()
 *
 * dashboard.addWidget(widget)
 */

export class DashboardLayout {
  constructor(options = {}) {
    const {
      title = "Dashboard",
      subtitle = "",
      layout = "grid", // grid, masonry
      columns = 3,
      gap = "md",
      showHeader = true,
      onSearch = null,
      className = "",
      id = null,
    } = options;

    this.title = title;
    this.subtitle = subtitle;
    this.layout = layout;
    this.columns = columns;
    this.gap = gap;
    this.showHeader = showHeader;
    this.onSearch = onSearch;
    this.className = className;
    this.id = id;
    this.widgets = [];
  }

  render() {
    const { SearchBox } = require("../molecules/SearchBox.js");

    const container = document.createElement("div");
    container.className = `dashboard-layout ${this.className}`;
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
      width: 100%;
    `;

    if (this.id) container.id = this.id;

    // Header
    if (this.showHeader) {
      const header = this.renderHeader();
      container.appendChild(header);
    }

    // Content grid
    const content = document.createElement("div");
    content.className = `dashboard-content dashboard-${this.layout}`;
    const gapValues = {
      sm: "var(--spacing-sm)",
      md: "var(--spacing-md)",
      lg: "var(--spacing-lg)",
    };

    if (this.layout === "grid") {
      content.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${this.columns}, 1fr);
        gap: ${gapValues[this.gap] || gapValues.md};
        width: 100%;
      `;
    } else if (this.layout === "masonry") {
      content.style.cssText = `
        column-count: ${this.columns};
        column-gap: ${gapValues[this.gap] || gapValues.md};
        width: 100%;
      `;
    }

    this.contentElement = content;
    container.appendChild(content);

    // Public methods
    container.addWidget = (element, columnSpan = 1) => {
      const widget = document.createElement("div");
      if (this.layout === "grid") {
        widget.style.gridColumn = `span ${columnSpan}`;
      } else {
        widget.style.breakInside = "avoid";
      }

      if (typeof element === "string") {
        widget.textContent = element;
      } else if (element instanceof HTMLElement) {
        widget.appendChild(element);
      }

      this.contentElement.appendChild(widget);
      this.widgets.push(widget);
      return widget;
    };

    container.clearWidgets = () => {
      this.contentElement.innerHTML = "";
      this.widgets = [];
    };

    return container;
  }

  renderHeader() {
    const { SearchBox } = require("../molecules/SearchBox.js");

    const header = document.createElement("div");
    header.className = "dashboard-header";
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    `;

    // Title section
    const titleSection = document.createElement("div");
    titleSection.className = "dashboard-header-title";
    titleSection.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    `;

    const title = document.createElement("h1");
    title.textContent = this.title;
    title.style.cssText = `
      margin: 0;
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    `;
    titleSection.appendChild(title);

    if (this.subtitle) {
      const subtitle = document.createElement("p");
      subtitle.textContent = this.subtitle;
      subtitle.style.cssText = `
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      `;
      titleSection.appendChild(subtitle);
    }

    header.appendChild(titleSection);

    // Search box
    if (this.onSearch) {
      const searchBox = new SearchBox({
        placeholder: "Search...",
        onSearch: this.onSearch,
      }).render();
      searchBox.style.width = "300px";
      header.appendChild(searchBox);
    }

    return header;
  }
}

// Add DashboardLayout styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .dashboard-layout {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
      width: 100%;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .dashboard-header-title {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .dashboard-header-title h1 {
      margin: 0;
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }

    .dashboard-header-title p {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-lg);
      width: 100%;
    }

    .dashboard-masonry {
      column-count: 3;
      column-gap: var(--spacing-lg);
      width: 100%;
    }

    .dashboard-masonry > * {
      break-inside: avoid;
    }

    @media (max-width: 1200px) {
      .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-masonry {
        column-count: 2;
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-masonry {
        column-count: 1;
      }
    }
  `;
  document.head.appendChild(style);
}
