/**
 * Button Component
 * Atomic component for all interactive buttons
 *
 * Usage:
 * new Button({
 *   label: 'Click me',
 *   variant: 'primary',
 *   size: 'md',
 *   onClick: () => console.log('clicked'),
 *   disabled: false,
 *   icon: '+'
 * }).render()
 */

export class Button {
  constructor(options = {}) {
    const {
      label = "Button",
      variant = "primary", // primary, secondary, success, error, warning, ghost
      size = "md", // sm, md, lg
      onClick = null,
      disabled = false,
      icon = null,
      iconPosition = "left", // left, right
      className = "",
      type = "button",
      id = null,
      title = null,
      ariaLabel = null,
    } = options;

    this.label = label;
    this.variant = variant;
    this.size = size;
    this.onClick = onClick;
    this.disabled = disabled;
    this.icon = icon;
    this.iconPosition = iconPosition;
    this.className = className;
    this.type = type;
    this.id = id;
    this.title = title;
    this.ariaLabel = ariaLabel;
  }

  render() {
    const button = document.createElement("button");
    button.type = this.type;
    button.className = this.getClasses();
    button.disabled = this.disabled;
    button.textContent = this.label;

    if (this.id) button.id = this.id;
    if (this.title) button.title = this.title;
    if (this.ariaLabel) button.setAttribute("aria-label", this.ariaLabel);

    if (this.onClick && !this.disabled) {
      button.addEventListener("click", this.onClick);
    }

    // Agregar icono si existe
    if (this.icon) {
      const icon = document.createElement("span");
      icon.className = "button-icon";
      icon.textContent = this.icon;

      if (this.iconPosition === "left") {
        button.prepend(icon);
      } else {
        button.appendChild(icon);
      }
    }

    button.style.cssText = this.getStyles();
    return button;
  }

  getClasses() {
    const classes = ["btn", `btn-${this.variant}`, `btn-${this.size}`, this.className];

    if (this.disabled) classes.push("btn-disabled");

    return classes.filter(Boolean).join(" ");
  }

  getStyles() {
    const baseStyles = {
      "font-family": "var(--font-family-primary)",
      "font-weight": "var(--font-weight-medium)",
      border: "none",
      cursor: this.disabled ? "not-allowed" : "pointer",
      transition: "all var(--transition-fast)",
      "border-radius": "var(--radius-md)",
      display: "inline-flex",
      "align-items": "center",
      "justify-content": "center",
      gap: "var(--spacing-xs)",
      "white-space": "nowrap",
      "user-select": "none",
      outline: "none",
    };

    // Tamaños
    const sizes = {
      sm: {
        padding: "var(--spacing-xs) var(--spacing-sm)",
        "font-size": "var(--font-size-sm)",
        "min-height": "32px",
        "min-width": "32px",
      },
      md: {
        padding: "var(--spacing-sm) var(--spacing-md)",
        "font-size": "var(--font-size-base)",
        "min-height": "40px",
        "min-width": "40px",
      },
      lg: {
        padding: "var(--spacing-md) var(--spacing-lg)",
        "font-size": "var(--font-size-lg)",
        "min-height": "48px",
        "min-width": "48px",
      },
    };

    // Variantes
    const variants = {
      primary: {
        "background-color": "var(--color-primary-500)",
        color: "white",
      },
      secondary: {
        "background-color": "var(--color-surface)",
        color: "var(--color-text-primary)",
        border: "1px solid var(--color-border)",
      },
      success: {
        "background-color": "var(--color-success-500)",
        color: "white",
      },
      error: {
        "background-color": "var(--color-error-500)",
        color: "white",
      },
      warning: {
        "background-color": "var(--color-warning-500)",
        color: "white",
      },
      ghost: {
        "background-color": "transparent",
        color: "var(--color-primary-500)",
        border: "1px solid var(--color-primary-500)",
      },
    };

    const styles = {
      ...baseStyles,
      ...sizes[this.size],
      ...variants[this.variant],
    };

    // Estados hover y activos
    if (!this.disabled) {
      styles["--btn-hover-opacity"] = "0.9";
    } else {
      styles["opacity"] = "0.5";
    }

    return Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
  }
}

// Agregar estilos hover dinámicos
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .btn {
      outline: none;
    }

    .btn:hover:not(.btn-disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .btn:active:not(.btn-disabled) {
      transform: translateY(0);
    }

    .btn:focus-visible {
      box-shadow: var(--shadow-focus);
    }

    .btn-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .button-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2em;
    }
  `;
  document.head.appendChild(style);
}
