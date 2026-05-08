/**
 * Label Component
 * Form label with optional required indicator
 *
 * Usage:
 * new Label({
 *   text: 'Email Address',
 *   htmlFor: 'email-input',
 *   required: true
 * }).render()
 */

export class Label {
  constructor(options = {}) {
    const {
      text = "",
      htmlFor = "",
      required = false,
      size = "base",
      weight = "medium",
      className = "",
      id = null,
      title = null,
    } = options;

    this.text = text;
    this.htmlFor = htmlFor;
    this.required = required;
    this.size = size;
    this.weight = weight;
    this.className = className;
    this.id = id;
    this.title = title;
  }

  render() {
    const label = document.createElement("label");

    if (this.htmlFor) label.htmlFor = this.htmlFor;
    if (this.id) label.id = this.id;
    if (this.title) label.title = this.title;

    label.className = this.getClasses();
    label.style.cssText = this.getStyles();

    const span = document.createElement("span");
    span.textContent = this.text;
    label.appendChild(span);

    if (this.required) {
      const required = document.createElement("span");
      required.className = "label-required";
      required.setAttribute("aria-label", "required");
      required.textContent = "*";
      required.style.cssText = `
        color: var(--color-error-500);
        margin-left: var(--spacing-xs);
        font-weight: var(--font-weight-bold);
      `;
      label.appendChild(required);
    }

    return label;
  }

  getClasses() {
    const classes = [
      "label",
      `label-${this.size}`,
      `font-weight-${this.weight}`,
      this.required && "label-required-parent",
      this.className,
    ];

    return classes.filter(Boolean).join(" ");
  }

  getStyles() {
    const fontSizes = {
      sm: "var(--font-size-sm)",
      base: "var(--font-size-base)",
      lg: "var(--font-size-lg)",
    };

    const weights = {
      regular: "var(--font-weight-regular)",
      medium: "var(--font-weight-medium)",
      semibold: "var(--font-weight-semibold)",
      bold: "var(--font-weight-bold)",
    };

    return `
      display: block;
      margin-bottom: var(--spacing-xs);
      font-size: ${fontSizes[this.size] || fontSizes.base};
      font-weight: ${weights[this.weight] || weights.medium};
      color: var(--color-text-primary);
      cursor: pointer;
      line-height: var(--line-height-normal);
    `.trim();
  }
}

// Add label styles to document
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .label {
      display: block;
      margin-bottom: var(--spacing-xs);
      color: var(--color-text-primary);
      cursor: pointer;
      user-select: none;
    }

    .label span {
      display: inline;
    }

    .label-required {
      color: var(--color-error-500);
      margin-left: var(--spacing-xs);
      font-weight: var(--font-weight-bold);
    }

    .label:hover {
      color: var(--color-text-secondary);
    }
  `;
  document.head.appendChild(style);
}
