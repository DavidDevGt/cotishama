/**
 * BreadCrumbs Molecule
 * Navigation hierarchy display
 *
 * Usage:
 * new BreadCrumbs({
 *   items: [
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Electronics', active: true }
 *   ]
 * }).render()
 */

export class BreadCrumbs {
  constructor(options = {}) {
    const { items = [], separator = "/", onClick = null, className = "", id = null } = options;

    this.items = items;
    this.separator = separator;
    this.onClick = onClick;
    this.className = className;
    this.id = id;
  }

  render() {
    const nav = document.createElement("nav");
    nav.className = `breadcrumbs ${this.className}`;
    nav.setAttribute("aria-label", "Breadcrumb");
    nav.style.cssText = `
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) 0;
      flex-wrap: wrap;
    `;

    if (this.id) nav.id = this.id;

    const ol = document.createElement("ol");
    ol.style.cssText = `
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      list-style: none;
      padding: 0;
      margin: 0;
      flex-wrap: wrap;
    `;

    this.items.forEach((item, index) => {
      const li = document.createElement("li");
      li.style.cssText = `
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      `;

      // Item
      if (item.href && !item.active) {
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        link.className = "breadcrumb-link";
        link.style.cssText = `
          color: var(--color-primary-500);
          text-decoration: none;
          transition: color var(--transition-fast);
          cursor: pointer;
        `;

        link.addEventListener("click", (e) => {
          if (this.onClick) {
            e.preventDefault();
            this.onClick(item, index);
          }
        });

        li.appendChild(link);
      } else {
        const span = document.createElement("span");
        span.textContent = item.label;
        span.className = "breadcrumb-item";
        span.style.cssText = `
          color: ${item.active ? "var(--color-text-primary)" : "var(--color-text-secondary)"};
          font-weight: ${item.active ? "var(--font-weight-medium)" : "var(--font-weight-regular)"};
        `;

        if (item.active) {
          span.setAttribute("aria-current", "page");
        }

        li.appendChild(span);
      }

      // Separator (except for last item)
      if (index < this.items.length - 1) {
        const sep = document.createElement("span");
        sep.className = "breadcrumb-separator";
        sep.textContent = this.separator;
        sep.setAttribute("aria-hidden", "true");
        sep.style.cssText = `
          color: var(--color-border);
          user-select: none;
        `;
        li.appendChild(sep);
      }

      ol.appendChild(li);
    });

    nav.appendChild(ol);
    return nav;
  }
}

// Add BreadCrumbs styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) 0;
      flex-wrap: wrap;
    }

    .breadcrumbs ol {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      list-style: none;
      padding: 0;
      margin: 0;
      flex-wrap: wrap;
    }

    .breadcrumbs li {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .breadcrumb-link {
      color: var(--color-primary-500);
      text-decoration: none;
      transition: color var(--transition-fast);
      cursor: pointer;
      font-size: var(--font-size-sm);
    }

    .breadcrumb-link:hover {
      color: var(--color-primary-600);
      text-decoration: underline;
    }

    .breadcrumb-link:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
      border-radius: var(--radius-sm);
    }

    .breadcrumb-item {
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-regular);
      font-size: var(--font-size-sm);
    }

    .breadcrumb-item[aria-current="page"] {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
    }

    .breadcrumb-separator {
      color: var(--color-border);
      user-select: none;
      font-size: var(--font-size-sm);
    }

    @media (max-width: 640px) {
      .breadcrumbs {
        padding: var(--spacing-sm) 0;
      }

      .breadcrumb-item {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  `;
  document.head.appendChild(style);
}
