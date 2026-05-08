/**
 * MenuItem Molecule
 * Individual menu item with icon and active state
 *
 * Usage:
 * new MenuItem({
 *   label: 'Dashboard',
 *   icon: 'home',
 *   active: true,
 *   onClick: () => navigate('/dashboard')
 * }).render()
 */

export class MenuItem {
  constructor(options = {}) {
    const {
      label = "",
      icon = null,
      iconPosition = "left",
      badge = null,
      active = false,
      disabled = false,
      onClick = null,
      href = null,
      target = null,
      className = "",
      id = null,
      size = "md", // sm, md, lg
    } = options;

    this.label = label;
    this.icon = icon;
    this.iconPosition = iconPosition;
    this.badge = badge;
    this.active = active;
    this.disabled = disabled;
    this.onClick = onClick;
    this.href = href;
    this.target = target;
    this.className = className;
    this.id = id;
    this.size = size;
  }

  render() {
    const { Icon } = require("../atoms/Icon.js");
    const { Badge } = require("../atoms/Badge.js");

    const element = this.href ? document.createElement("a") : document.createElement("button");

    if (this.href) {
      element.href = this.href;
      if (this.target) element.target = this.target;
    } else {
      element.type = "button";
    }

    element.className = this.getClasses();
    element.style.cssText = this.getStyles();

    if (this.id) element.id = this.id;
    if (this.disabled) element.disabled = true;
    if (this.onClick && !this.href) {
      element.addEventListener("click", this.onClick);
    }

    // Accessibility
    element.setAttribute("aria-label", this.label);
    if (this.active) element.setAttribute("aria-current", "page");

    // Content wrapper
    const content = document.createElement("span");
    content.style.cssText = `
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      width: 100%;
    `;

    // Icon left
    if (this.icon && this.iconPosition === "left") {
      const iconEl = new Icon({
        name: this.icon,
        size: this.size === "lg" ? "md" : "sm",
        color: this.active ? "primary" : this.disabled ? "secondary" : "primary",
      }).render();
      content.appendChild(iconEl);
    }

    // Label
    const labelEl = document.createElement("span");
    labelEl.textContent = this.label;
    labelEl.style.cssText = `
      flex: 1;
      text-align: left;
    `;
    content.appendChild(labelEl);

    // Badge
    if (this.badge) {
      const badgeEl = new Badge({
        label: this.badge.toString(),
        variant: "primary",
        size: "xs",
      }).render();
      content.appendChild(badgeEl);
    }

    // Icon right
    if (this.icon && this.iconPosition === "right") {
      const iconEl = new Icon({
        name: this.icon,
        size: this.size === "lg" ? "md" : "sm",
        color: this.active ? "primary" : this.disabled ? "secondary" : "primary",
      }).render();
      content.appendChild(iconEl);
    }

    element.appendChild(content);

    return element;
  }

  getClasses() {
    const classes = [
      "menu-item",
      `menu-item-${this.size}`,
      this.active && "menu-item-active",
      this.disabled && "menu-item-disabled",
      this.className,
    ];

    return classes.filter(Boolean).join(" ");
  }

  getStyles() {
    const sizes = {
      sm: {
        padding: "var(--spacing-sm) var(--spacing-md)",
        "font-size": "var(--font-size-sm)",
        "min-height": "36px",
      },
      md: {
        padding: "var(--spacing-sm) var(--spacing-md)",
        "font-size": "var(--font-size-base)",
        "min-height": "40px",
      },
      lg: {
        padding: "var(--spacing-md) var(--spacing-lg)",
        "font-size": "var(--font-size-base)",
        "min-height": "48px",
      },
    };

    const baseStyles = {
      display: "flex",
      "align-items": "center",
      "justify-content": "flex-start",
      width: "100%",
      border: "none",
      background: "none",
      color: "inherit",
      cursor: "pointer",
      "text-align": "left",
      transition: "all var(--transition-fast)",
      "border-radius": "var(--radius-md)",
      "font-family": "inherit",
      "text-decoration": "none",
      ...(sizes[this.size] || sizes.md),
    };

    if (this.active) {
      baseStyles["background-color"] = "var(--color-primary-50)";
      baseStyles["color"] = "var(--color-primary-800)";
      baseStyles["font-weight"] = "var(--font-weight-semibold)";
    } else {
      baseStyles["color"] = "var(--color-text-primary)";
    }

    if (this.disabled) {
      baseStyles["opacity"] = "0.5";
      baseStyles["cursor"] = "not-allowed";
    } else if (!this.active) {
      baseStyles["hover-background-color"] = "var(--color-surface)";
    }

    return Object.entries(baseStyles)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
  }
}

// Add MenuItem styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .menu-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      border: none;
      background: none;
      color: inherit;
      cursor: pointer;
      text-align: left;
      transition: all var(--transition-fast);
      border-radius: var(--radius-md);
      font-family: inherit;
      text-decoration: none;
      user-select: none;
    }

    .menu-item:hover:not(.menu-item-disabled) {
      background-color: var(--color-surface);
    }

    .menu-item:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .menu-item-active {
      background-color: var(--color-primary-50);
      color: var(--color-primary-800);
      font-weight: var(--font-weight-semibold);
    }

    .menu-item-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .menu-item-sm {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-sm);
      min-height: 36px;
    }

    .menu-item-md {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-base);
      min-height: 40px;
    }

    .menu-item-lg {
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: var(--font-size-base);
      min-height: 48px;
    }
  `;
  document.head.appendChild(style);
}
