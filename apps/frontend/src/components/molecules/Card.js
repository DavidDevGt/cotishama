/**
 * Card Molecule
 * Container for grouped content with optional header and footer
 *
 * Usage:
 * const card = new Card({
 *   title: 'Card Title',
 *   subtitle: 'Subtitle text',
 *   padding: 'md',
 *   variant: 'elevated'
 * }).render()
 *
 * card.setContent(contentElement)
 */

export class Card {
  constructor(options = {}) {
    const {
      title = "",
      subtitle = "",
      padding = "md", // sm, md, lg
      variant = "outlined", // outlined, elevated, flat
      onClick = null,
      className = "",
      id = null,
    } = options;

    this.title = title;
    this.subtitle = subtitle;
    this.padding = padding;
    this.variant = variant;
    this.onClick = onClick;
    this.className = className;
    this.id = id;
    this.contentElement = null;
    this.footerElement = null;
  }

  render() {
    const card = document.createElement("div");
    card.className = this.getClasses();
    card.style.cssText = this.getStyles();

    if (this.id) card.id = this.id;
    if (this.onClick) card.addEventListener("click", this.onClick);

    // Header
    if (this.title) {
      const header = document.createElement("div");
      header.className = "card-header";
      header.style.cssText = `
        margin-bottom: var(--spacing-md);
        border-bottom: 1px solid var(--color-border);
        padding-bottom: var(--spacing-md);
      `;

      const titleEl = document.createElement("h3");
      titleEl.className = "card-title";
      titleEl.textContent = this.title;
      titleEl.style.cssText = `
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
      `;
      header.appendChild(titleEl);

      if (this.subtitle) {
        const subtitleEl = document.createElement("p");
        subtitleEl.className = "card-subtitle";
        subtitleEl.textContent = this.subtitle;
        subtitleEl.style.cssText = `
          margin: var(--spacing-xs) 0 0;
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        `;
        header.appendChild(subtitleEl);
      }

      card.appendChild(header);
    }

    // Content container
    const content = document.createElement("div");
    content.className = "card-content";
    content.id = `${this.id}-content` || "card-content";
    card.appendChild(content);

    // Store reference for later content updates
    card.setContent = (element) => {
      content.innerHTML = "";
      if (typeof element === "string") {
        content.textContent = element;
      } else if (element instanceof HTMLElement) {
        content.appendChild(element);
      }
    };

    // Footer placeholder
    card.setFooter = (element) => {
      if (this.footerElement) {
        this.footerElement.remove();
      }

      if (element) {
        const footer = document.createElement("div");
        footer.className = "card-footer";
        footer.style.cssText = `
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--color-border);
        `;
        footer.appendChild(element);
        card.appendChild(footer);
        this.footerElement = footer;
      }
    };

    return card;
  }

  getClasses() {
    const classes = [
      "card",
      `card-${this.variant}`,
      `card-padding-${this.padding}`,
      this.className,
    ];

    return classes.filter(Boolean).join(" ");
  }

  getStyles() {
    const paddingMap = {
      sm: "var(--spacing-sm)",
      md: "var(--spacing-md)",
      lg: "var(--spacing-lg)",
    };

    const variantStyles = {
      outlined: {
        border: "1px solid var(--color-border)",
        "background-color": "var(--color-background)",
        "box-shadow": "none",
      },
      elevated: {
        border: "none",
        "background-color": "var(--color-background)",
        "box-shadow": "var(--shadow-sm)",
      },
      flat: {
        border: "none",
        "background-color": "var(--color-surface)",
        "box-shadow": "none",
      },
    };

    const padding = paddingMap[this.padding] || paddingMap.md;
    const variant = variantStyles[this.variant] || variantStyles.outlined;

    return `
      ${Object.entries(variant)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ")};
      padding: ${padding};
      border-radius: var(--radius-lg);
      transition: all var(--transition-normal);
    `.trim();
  }
}

// Add Card styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .card {
      border-radius: var(--radius-lg);
      transition: all var(--transition-normal);
    }

    .card-outlined {
      border: 1px solid var(--color-border);
      background-color: var(--color-background);
      box-shadow: none;
    }

    .card-outlined:hover {
      border-color: var(--color-neutral-300);
      box-shadow: var(--shadow-xs);
    }

    .card-elevated {
      border: none;
      background-color: var(--color-background);
      box-shadow: var(--shadow-sm);
    }

    .card-elevated:hover {
      box-shadow: var(--shadow-md);
    }

    .card-flat {
      border: none;
      background-color: var(--color-surface);
      box-shadow: none;
    }

    .card-padding-sm {
      padding: var(--spacing-sm);
    }

    .card-padding-md {
      padding: var(--spacing-md);
    }

    .card-padding-lg {
      padding: var(--spacing-lg);
    }

    .card-header {
      margin-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--spacing-md);
    }

    .card-title {
      margin: 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .card-subtitle {
      margin: var(--spacing-xs) 0 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .card-content {
      min-height: auto;
    }

    .card-footer {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }
  `;
  document.head.appendChild(style);
}
