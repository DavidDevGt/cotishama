/**
 * Input Component
 * Flexible input field with support for validation states and icons
 *
 * Usage:
 * new Input({
 *   type: 'email',
 *   placeholder: 'user@example.com',
 *   value: '',
 *   required: true,
 *   disabled: false,
 *   icon: 'search'
 * }).render()
 */

export class Input {
  constructor(options = {}) {
    const {
      type = "text", // text, email, password, number, tel, url, search
      value = "",
      placeholder = "",
      name = "",
      id = "",
      required = false,
      disabled = false,
      readonly = false,
      minLength = null,
      maxLength = null,
      min = null,
      max = null,
      pattern = null,
      autoComplete = "off",
      size = "md", // sm, md, lg
      state = "default", // default, error, success, warning, loading
      icon = null,
      iconPosition = "left",
      onChange = null,
      onFocus = null,
      onBlur = null,
      onKeyDown = null,
      className = "",
      title = null,
      ariaLabel = null,
      ariaDescribedBy = null,
    } = options;

    this.type = type;
    this.value = value;
    this.placeholder = placeholder;
    this.name = name;
    this.id = id;
    this.required = required;
    this.disabled = disabled;
    this.readonly = readonly;
    this.minLength = minLength;
    this.maxLength = maxLength;
    this.min = min;
    this.max = max;
    this.pattern = pattern;
    this.autoComplete = autoComplete;
    this.size = size;
    this.state = state;
    this.icon = icon;
    this.iconPosition = iconPosition;
    this.onChange = onChange;
    this.onFocus = onFocus;
    this.onBlur = onBlur;
    this.onKeyDown = onKeyDown;
    this.className = className;
    this.title = title;
    this.ariaLabel = ariaLabel;
    this.ariaDescribedBy = ariaDescribedBy;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = this.getWrapperClasses();
    wrapper.style.cssText = `
      display: inline-flex;
      align-items: center;
      position: relative;
      width: 100%;
    `;

    // Icon left
    if (this.icon && this.iconPosition === "left") {
      const { Icon } = require("./Icon.js");
      const icon = new Icon({
        name: this.icon,
        size: this.size === "sm" ? "sm" : this.size === "lg" ? "md" : "sm",
        color: this.disabled ? "secondary" : "primary",
      }).render();

      icon.style.cssText += `
        position: absolute;
        left: var(--spacing-sm);
        pointer-events: none;
        flex-shrink: 0;
      `;
      wrapper.appendChild(icon);
    }

    // Input
    const input = document.createElement("input");
    input.type = this.type;
    input.value = this.value;
    input.placeholder = this.placeholder;
    input.className = this.getInputClasses();
    input.style.cssText = this.getInputStyles();

    if (this.name) input.name = this.name;
    if (this.id) input.id = this.id;
    if (this.required) input.required = true;
    if (this.disabled) input.disabled = true;
    if (this.readonly) input.readOnly = true;
    if (this.minLength !== null) input.minLength = this.minLength;
    if (this.maxLength !== null) input.maxLength = this.maxLength;
    if (this.min !== null) input.min = this.min;
    if (this.max !== null) input.max = this.max;
    if (this.pattern) input.pattern = this.pattern;
    if (this.autoComplete) input.autoComplete = this.autoComplete;
    if (this.title) input.title = this.title;
    if (this.ariaLabel) input.setAttribute("aria-label", this.ariaLabel);
    if (this.ariaDescribedBy) input.setAttribute("aria-describedby", this.ariaDescribedBy);

    // Event listeners
    if (this.onChange) input.addEventListener("change", this.onChange);
    if (this.onFocus) input.addEventListener("focus", this.onFocus);
    if (this.onBlur) input.addEventListener("blur", this.onBlur);
    if (this.onKeyDown) input.addEventListener("keydown", this.onKeyDown);

    wrapper.appendChild(input);

    // Icon right
    if (this.icon && this.iconPosition === "right") {
      const { Icon } = require("./Icon.js");
      const icon = new Icon({
        name: this.icon,
        size: this.size === "sm" ? "sm" : this.size === "lg" ? "md" : "sm",
        color: this.disabled ? "secondary" : "primary",
      }).render();

      icon.style.cssText += `
        position: absolute;
        right: var(--spacing-sm);
        pointer-events: none;
        flex-shrink: 0;
      `;
      wrapper.appendChild(icon);
    }

    return wrapper;
  }

  getWrapperClasses() {
    const classes = [
      "input-wrapper",
      `input-wrapper-${this.size}`,
      `input-state-${this.state}`,
      this.disabled && "input-disabled",
      this.icon && `input-icon-${this.iconPosition}`,
    ];

    return classes.filter(Boolean).join(" ");
  }

  getInputClasses() {
    const classes = [
      "input",
      `input-${this.size}`,
      `input-${this.state}`,
      this.icon && `input-with-icon-${this.iconPosition}`,
      this.className,
    ];

    return classes.filter(Boolean).join(" ");
  }

  getInputStyles() {
    const sizes = {
      sm: {
        padding: `var(--spacing-xs) var(--spacing-sm)`,
        "font-size": "var(--font-size-sm)",
        "min-height": "32px",
      },
      md: {
        padding: `var(--spacing-sm) var(--spacing-md)`,
        "font-size": "var(--font-size-base)",
        "min-height": "40px",
      },
      lg: {
        padding: `var(--spacing-md) var(--spacing-lg)`,
        "font-size": "var(--font-size-lg)",
        "min-height": "48px",
      },
    };

    const iconPaddingMap = {
      left: { "padding-left": "2.5rem" },
      right: { "padding-right": "2.5rem" },
    };

    const states = {
      default: {
        "border-color": "var(--color-border)",
      },
      error: {
        "border-color": "var(--color-error-500)",
      },
      success: {
        "border-color": "var(--color-success-500)",
      },
      warning: {
        "border-color": "var(--color-warning-500)",
      },
      loading: {
        "border-color": "var(--color-primary-500)",
      },
    };

    const baseStyles = {
      "font-family": "inherit",
      border: "1px solid",
      "border-radius": "var(--radius-md)",
      "background-color": "var(--color-background)",
      color: "var(--color-text-primary)",
      transition: "all var(--transition-fast)",
      outline: "none",
      width: "100%",
      "box-sizing": "border-box",
      ...(sizes[this.size] || sizes.md),
      ...(this.icon ? iconPaddingMap[this.iconPosition] : {}),
      ...(states[this.state] || states.default),
    };

    if (this.disabled) {
      baseStyles["opacity"] = "0.6";
      baseStyles["cursor"] = "not-allowed";
      baseStyles["background-color"] = "var(--color-surface)";
    }

    return Object.entries(baseStyles)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    this.value = value;
  }

  focus() {
    // Will be called on the input element after render
  }

  blur() {
    // Will be called on the input element after render
  }

  validate() {
    // Email validation
    if (this.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.value);
    }

    // URL validation
    if (this.type === "url") {
      try {
        new URL(this.value);
        return true;
      } catch (e) {
        return false;
      }
    }

    // Pattern validation
    if (this.pattern) {
      const regex = new RegExp(this.pattern);
      return regex.test(this.value);
    }

    // Required validation
    if (this.required && !this.value) {
      return false;
    }

    return true;
  }
}

// Add input styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .input {
      font-family: inherit;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-background);
      color: var(--color-text-primary);
      transition: all var(--transition-fast);
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .input:hover:not(:disabled) {
      border-color: var(--color-neutral-400);
      background-color: var(--color-surface);
    }

    .input:focus {
      border-color: var(--color-primary-500);
      background-color: var(--color-background);
      box-shadow: var(--shadow-focus);
    }

    .input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: var(--color-surface);
    }

    .input-sm {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-sm);
      min-height: 32px;
    }

    .input-md {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-base);
      min-height: 40px;
    }

    .input-lg {
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: var(--font-size-lg);
      min-height: 48px;
    }

    .input-with-icon-left {
      padding-left: 2.5rem;
    }

    .input-with-icon-right {
      padding-right: 2.5rem;
    }

    .input-state-error {
      border-color: var(--color-error-500);
    }

    .input-state-success {
      border-color: var(--color-success-500);
    }

    .input-state-warning {
      border-color: var(--color-warning-500);
    }

    .input-state-loading {
      border-color: var(--color-primary-500);
    }

    .input-wrapper {
      display: inline-flex;
      align-items: center;
      position: relative;
      width: 100%;
    }

    .input-wrapper.input-disabled {
      opacity: 0.6;
    }
  `;
  document.head.appendChild(style);
}
