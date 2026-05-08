/**
 * FormLayout Template
 * Form-focused layout for login, registration, and forms
 *
 * Usage:
 * new FormLayout({
 *   title: 'Login',
 *   maxWidth: '500px'
 * }).render()
 */

export class FormLayout {
  constructor(options = {}) {
    const {
      title = '',
      subtitle = '',
      maxWidth = '500px',
      centered = true,
      showHeader = true,
      className = '',
      id = null,
    } = options;

    this.title = title;
    this.subtitle = subtitle;
    this.maxWidth = maxWidth;
    this.centered = centered;
    this.showHeader = showHeader;
    this.className = className;
    this.id = id;
    this.contentElement = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = `form-layout ${this.className}`;
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-background) 100%);
      padding: var(--spacing-lg);
      ${this.centered ? 'align-items: center; justify-content: center;' : ''}
    `;

    if (this.id) container.id = this.id;

    // Content wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'form-layout-wrapper';
    wrapper.style.cssText = `
      width: 100%;
      max-width: ${this.maxWidth};
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    `;

    // Header (optional)
    if (this.showHeader && this.title) {
      const header = document.createElement('div');
      header.className = 'form-layout-header';
      header.style.cssText = `
        text-align: center;
        margin-bottom: var(--spacing-lg);
      `;

      const titleEl = document.createElement('h1');
      titleEl.textContent = this.title;
      titleEl.style.cssText = `
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
      `;
      header.appendChild(titleEl);

      if (this.subtitle) {
        const subtitleEl = document.createElement('p');
        subtitleEl.textContent = this.subtitle;
        subtitleEl.style.cssText = `
          margin: 0;
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        `;
        header.appendChild(subtitleEl);
      }

      wrapper.appendChild(header);
    }

    // Content area
    const content = document.createElement('div');
    content.className = 'form-layout-content';
    this.contentElement = content;
    wrapper.appendChild(content);

    // Footer (optional)
    const footer = document.createElement('div');
    footer.className = 'form-layout-footer';
    footer.style.cssText = `
      text-align: center;
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-border);
      display: none;
    `;
    wrapper.appendChild(footer);

    container.appendChild(wrapper);

    // Public methods
    container.setContent = (element) => {
      content.innerHTML = '';
      if (typeof element === 'string') {
        content.textContent = element;
      } else if (element instanceof HTMLElement) {
        content.appendChild(element);
      }
    };

    container.setFooter = (element) => {
      footer.innerHTML = '';
      if (element) {
        footer.appendChild(element);
        footer.style.display = 'block';
      } else {
        footer.style.display = 'none';
      }
    };

    container.getContent = () => content;

    return container;
  }
}

// Add FormLayout styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .form-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-background) 100%);
      padding: var(--spacing-lg);
      align-items: center;
      justify-content: center;
    }

    .form-layout-wrapper {
      width: 100%;
      max-width: 500px;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .form-layout-header {
      text-align: center;
      margin-bottom: var(--spacing-lg);
    }

    .form-layout-header h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }

    .form-layout-header p {
      margin: 0;
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
    }

    .form-layout-footer {
      text-align: center;
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-border);
    }

    @media (max-width: 640px) {
      .form-layout {
        padding: var(--spacing-md);
      }

      .form-layout-wrapper {
        max-width: 100%;
      }

      .form-layout-header h1 {
        font-size: var(--font-size-2xl);
      }
    }
  `;
  document.head.appendChild(style);
}
