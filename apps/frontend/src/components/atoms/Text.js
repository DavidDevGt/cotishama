/**
 * Text Component
 * Semantic text element with typography variants
 *
 * Usage:
 * new Text({
 *   content: 'Hello World',
 *   variant: 'body',
 *   size: 'base',
 *   weight: 'regular',
 *   color: 'primary'
 * }).render()
 */

export class Text {
  constructor(options = {}) {
    const {
      content = "",
      variant = "span", // span, p, small, strong, em
      size = "base", // xs, sm, base, lg, xl, 2xl, 3xl, 4xl
      weight = "regular", // regular, medium, semibold, bold
      color = "primary", // primary, secondary, tertiary, error, success, warning
      className = "",
      id = null,
      title = null,
      role = null,
    } = options;

    this.content = content;
    this.variant = variant;
    this.size = size;
    this.weight = weight;
    this.color = color;
    this.className = className;
    this.id = id;
    this.title = title;
    this.role = role;
  }

  render() {
    const element = document.createElement(this.getTagName());
    element.textContent = this.content;
    element.className = this.getClasses();

    if (this.id) element.id = this.id;
    if (this.title) element.title = this.title;
    if (this.role) element.setAttribute("role", this.role);

    element.style.cssText = this.getStyles();
    return element;
  }

  getTagName() {
    const tagMap = {
      span: "span",
      p: "p",
      small: "small",
      strong: "strong",
      em: "em",
    };
    return tagMap[this.variant] || "span";
  }

  getClasses() {
    const classes = [
      "text",
      `text-${this.size}`,
      `font-weight-${this.weight}`,
      `text-${this.color}`,
      this.className,
    ];

    return classes.filter(Boolean).join(" ");
  }

  getStyles() {
    const fontSizes = {
      xs: "var(--font-size-xs)",
      sm: "var(--font-size-sm)",
      base: "var(--font-size-base)",
      lg: "var(--font-size-lg)",
      xl: "var(--font-size-xl)",
      "2xl": "var(--font-size-2xl)",
      "3xl": "var(--font-size-3xl)",
      "4xl": "var(--font-size-4xl)",
    };

    const weights = {
      regular: "var(--font-weight-regular)",
      medium: "var(--font-weight-medium)",
      semibold: "var(--font-weight-semibold)",
      bold: "var(--font-weight-bold)",
    };

    const colors = {
      primary: "var(--color-text-primary)",
      secondary: "var(--color-text-secondary)",
      tertiary: "var(--color-text-tertiary)",
      error: "var(--color-error-600)",
      success: "var(--color-success-600)",
      warning: "var(--color-warning-600)",
    };

    return `
      font-size: ${fontSizes[this.size] || fontSizes.base};
      font-weight: ${weights[this.weight] || weights.regular};
      color: ${colors[this.color] || colors.primary};
      margin: 0;
      line-height: var(--line-height-normal);
    `.trim();
  }
}
