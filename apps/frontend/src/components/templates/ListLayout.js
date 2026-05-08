/**
 * ListLayout Template
 * List view layout with header, filters, and data table
 *
 * Usage:
 * const list = new ListLayout({
 *   title: 'Products',
 *   subtitle: 'Manage your product inventory'
 * }).render()
 *
 * list.setDataTable(dataTable)
 */

export class ListLayout {
  constructor(options = {}) {
    const {
      title = '',
      subtitle = '',
      actionButton = null,
      showFilters = true,
      showSearch = true,
      onSearch = null,
      onFilter = null,
      className = '',
      id = null,
    } = options;

    this.title = title;
    this.subtitle = subtitle;
    this.actionButton = actionButton;
    this.showFilters = showFilters;
    this.showSearch = showSearch;
    this.onSearch = onSearch;
    this.onFilter = onFilter;
    this.className = className;
    this.id = id;
    this.tableElement = null;
    this.filtersElement = null;
  }

  render() {
    const { SearchBox } = require('../molecules/SearchBox.js');
    const { Button } = require('../atoms/Button.js');

    const container = document.createElement('div');
    container.className = `list-layout ${this.className}`;
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
      width: 100%;
    `;

    if (this.id) container.id = this.id;

    // Header
    const header = this.renderHeader();
    container.appendChild(header);

    // Toolbar with search and filters
    const toolbar = this.renderToolbar();
    container.appendChild(toolbar);

    // Table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'list-layout-table';
    tableContainer.style.cssText = `
      background-color: var(--color-background);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      overflow: hidden;
    `;
    this.tableElement = tableContainer;
    container.appendChild(tableContainer);

    // Public methods
    container.setDataTable = (dataTable) => {
      tableContainer.innerHTML = '';
      tableContainer.appendChild(dataTable);
    };

    container.setFilters = (filters) => {
      if (this.filtersElement) {
        this.filtersElement.innerHTML = '';
        if (Array.isArray(filters)) {
          filters.forEach((filter) => {
            this.filtersElement.appendChild(filter);
          });
        } else {
          this.filtersElement.appendChild(filters);
        }
      }
    };

    return container;
  }

  renderHeader() {
    const { Button } = require('../atoms/Button.js');

    const header = document.createElement('div');
    header.className = 'list-layout-header';
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
    const titleSection = document.createElement('div');
    titleSection.className = 'list-layout-header-title';
    titleSection.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    `;

    const title = document.createElement('h2');
    title.textContent = this.title;
    title.style.cssText = `
      margin: 0;
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    `;
    titleSection.appendChild(title);

    if (this.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.textContent = this.subtitle;
      subtitle.style.cssText = `
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      `;
      titleSection.appendChild(subtitle);
    }

    header.appendChild(titleSection);

    // Action button
    if (this.actionButton) {
      const btn = new Button({
        label: this.actionButton.label,
        variant: this.actionButton.variant || 'primary',
        icon: this.actionButton.icon,
        onClick: this.actionButton.onClick,
      }).render();
      header.appendChild(btn);
    }

    return header;
  }

  renderToolbar() {
    const { SearchBox } = require('../molecules/SearchBox.js');

    const toolbar = document.createElement('div');
    toolbar.className = 'list-layout-toolbar';
    toolbar.style.cssText = `
      display: flex;
      gap: var(--spacing-md);
      align-items: center;
      flex-wrap: wrap;
    `;

    // Search
    if (this.showSearch) {
      const searchBox = new SearchBox({
        placeholder: 'Search...',
        onSearch: this.onSearch,
      }).render();
      searchBox.style.minWidth = '300px';
      toolbar.appendChild(searchBox);
    }

    // Filters
    if (this.showFilters) {
      const filters = document.createElement('div');
      filters.className = 'list-layout-filters';
      filters.style.cssText = `
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
      `;
      this.filtersElement = filters;
      toolbar.appendChild(filters);
    }

    return toolbar;
  }
}

// Add ListLayout styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .list-layout {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
      width: 100%;
    }

    .list-layout-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .list-layout-header-title {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .list-layout-header-title h2 {
      margin: 0;
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }

    .list-layout-header-title p {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .list-layout-toolbar {
      display: flex;
      gap: var(--spacing-md);
      align-items: center;
      flex-wrap: wrap;
    }

    .list-layout-filters {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .list-layout-table {
      background-color: var(--color-background);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .list-layout-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .list-layout-toolbar {
        width: 100%;
      }

      .list-layout-toolbar > * {
        flex: 1;
        min-width: 250px;
      }
    }
  `;
  document.head.appendChild(style);
}
