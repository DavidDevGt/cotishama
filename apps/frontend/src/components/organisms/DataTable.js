/**
 * DataTable Organism
 * Reusable table component with sorting, pagination, and selection
 *
 * Usage:
 * new DataTable({
 *   columns: [
 *     { key: 'id', label: 'ID', sortable: true },
 *     { key: 'name', label: 'Name', width: '200px' }
 *   ],
 *   data: [
 *     { id: 1, name: 'Item 1' },
 *     { id: 2, name: 'Item 2' }
 *   ],
 *   onRowClick: (row) => console.log(row)
 * }).render()
 */

export class DataTable {
  constructor(options = {}) {
    const {
      columns = [],
      data = [],
      striped = true,
      hoverable = true,
      selectable = false,
      sortable = true,
      pageable = false,
      pageSize = 10,
      onRowClick = null,
      onSelectionChange = null,
      onSort = null,
      className = "",
      id = null,
    } = options;

    this.columns = columns;
    this.data = data;
    this.striped = striped;
    this.hoverable = hoverable;
    this.selectable = selectable;
    this.sortable = sortable;
    this.pageable = pageable;
    this.pageSize = pageSize;
    this.onRowClick = onRowClick;
    this.onSelectionChange = onSelectionChange;
    this.onSort = onSort;
    this.className = className;
    this.id = id;
    this.currentPage = 1;
    this.sortColumn = null;
    this.sortDirection = "asc";
    this.selectedRows = new Set();
  }

  render() {
    const container = document.createElement("div");
    container.className = `data-table-container ${this.className}`;
    container.style.cssText = `
      overflow-x: auto;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    `;

    const table = document.createElement("table");
    table.className = `data-table`;
    table.setAttribute("role", "grid");
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);
    `;

    if (this.id) table.id = this.id;

    // Thead
    const thead = this.renderHead();
    table.appendChild(thead);

    // Tbody
    const tbody = this.renderBody();
    table.appendChild(tbody);

    container.appendChild(table);

    // Pagination (if enabled)
    if (this.pageable && this.data.length > this.pageSize) {
      const { Pagination } = require("../molecules/Pagination.js");
      const totalPages = Math.ceil(this.data.length / this.pageSize);
      const pagination = new Pagination({
        currentPage: this.currentPage,
        totalPages: totalPages,
        onPageChange: (page) => {
          this.currentPage = page;
          const newTbody = this.renderBody();
          table.replaceChild(newTbody, tbody);
        },
      }).render();
      container.appendChild(pagination);
    }

    return container;
  }

  renderHead() {
    const thead = document.createElement("thead");
    thead.style.cssText = `
      background-color: var(--color-surface);
      border-bottom: 2px solid var(--color-border);
    `;

    const tr = document.createElement("tr");

    // Checkbox column
    if (this.selectable) {
      const th = document.createElement("th");
      th.style.cssText = `
        padding: var(--spacing-md);
        text-align: left;
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
      `;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.setAttribute("aria-label", "Select all");
      checkbox.addEventListener("change", (e) => {
        this.selectAll(e.target.checked);
      });
      th.appendChild(checkbox);
      tr.appendChild(th);
    }

    // Column headers
    this.columns.forEach((column) => {
      const th = document.createElement("th");
      th.style.cssText = `
        padding: var(--spacing-md);
        text-align: left;
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        ${column.width ? `width: ${column.width}` : ""}
        cursor: ${column.sortable ? "pointer" : "default"};
        user-select: none;
        transition: background-color var(--transition-fast);
      `;

      th.textContent = column.label;

      if (column.sortable) {
        th.addEventListener("click", () => {
          this.handleSort(column.key);
        });

        th.addEventListener("mouseenter", () => {
          th.style.backgroundColor = "var(--color-neutral-100)";
        });

        th.addEventListener("mouseleave", () => {
          th.style.backgroundColor = "transparent";
        });
      }

      tr.appendChild(th);
    });

    thead.appendChild(tr);
    return thead;
  }

  renderBody() {
    const tbody = document.createElement("tbody");

    const displayData = this.getDisplayData();

    displayData.forEach((row, index) => {
      const tr = document.createElement("tr");
      tr.setAttribute("role", "row");
      tr.style.cssText = `
        border-bottom: 1px solid var(--color-border);
        ${this.striped && index % 2 === 0 ? "background-color: var(--color-surface)" : ""}
        ${this.hoverable ? "transition: background-color var(--transition-fast); cursor: pointer;" : ""}
      `;

      if (this.hoverable) {
        tr.addEventListener("mouseenter", () => {
          tr.style.backgroundColor = "var(--color-neutral-100)";
        });

        tr.addEventListener("mouseleave", () => {
          tr.style.backgroundColor = this.striped && index % 2 === 0 ? "var(--color-surface)" : "";
        });
      }

      // Checkbox column
      if (this.selectable) {
        const td = document.createElement("td");
        td.style.cssText = "padding: var(--spacing-md);";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = row.id;
        checkbox.checked = this.selectedRows.has(row.id);
        checkbox.addEventListener("change", (e) => {
          this.toggleRowSelection(row.id, e.target.checked);
        });
        td.appendChild(checkbox);
        tr.appendChild(td);
      }

      // Data cells
      this.columns.forEach((column) => {
        const td = document.createElement("td");
        td.setAttribute("role", "gridcell");
        td.style.cssText = `
          padding: var(--spacing-md);
          color: var(--color-text-primary);
          ${column.width ? `width: ${column.width}` : ""}
        `;

        const value = row[column.key];
        if (column.render) {
          const rendered = column.render(value, row);
          if (typeof rendered === "string") {
            td.textContent = rendered;
          } else {
            td.appendChild(rendered);
          }
        } else {
          td.textContent = value || "—";
        }

        tr.appendChild(td);
      });

      if (this.onRowClick) {
        tr.addEventListener("click", () => {
          this.onRowClick(row);
        });
      }

      tbody.appendChild(tr);
    });

    return tbody;
  }

  getDisplayData() {
    const data = [...this.data];

    // Sort
    if (this.sortColumn) {
      data.sort((a, b) => {
        const aVal = a[this.sortColumn];
        const bVal = b[this.sortColumn];

        if (typeof aVal === "string") {
          return this.sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        return this.sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    // Paginate
    if (this.pageable) {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return data.slice(start, end);
    }

    return data;
  }

  handleSort(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortDirection = "asc";
    }

    if (this.onSort) {
      this.onSort(column, this.sortDirection);
    }
  }

  selectAll(checked) {
    if (checked) {
      this.getDisplayData().forEach((row) => {
        this.selectedRows.add(row.id);
      });
    } else {
      this.selectedRows.clear();
    }

    if (this.onSelectionChange) {
      this.onSelectionChange(Array.from(this.selectedRows));
    }
  }

  toggleRowSelection(rowId, selected) {
    if (selected) {
      this.selectedRows.add(rowId);
    } else {
      this.selectedRows.delete(rowId);
    }

    if (this.onSelectionChange) {
      this.onSelectionChange(Array.from(this.selectedRows));
    }
  }
}

// Add DataTable styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .data-table-container {
      overflow-x: auto;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);
    }

    .data-table thead {
      background-color: var(--color-surface);
      border-bottom: 2px solid var(--color-border);
    }

    .data-table th {
      padding: var(--spacing-md);
      text-align: left;
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      user-select: none;
    }

    .data-table tbody tr {
      border-bottom: 1px solid var(--color-border);
      transition: background-color var(--transition-fast);
    }

    .data-table tbody tr:hover {
      background-color: var(--color-neutral-100);
    }

    .data-table td {
      padding: var(--spacing-md);
      color: var(--color-text-primary);
    }

    .data-table-container input[type="checkbox"] {
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
}
