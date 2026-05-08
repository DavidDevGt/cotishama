/**
 * Modal Organism
 * Dialog component with header, content, and footer sections
 *
 * Usage:
 * const modal = new Modal({
 *   title: 'Confirm Action',
 *   size: 'md',
 *   onClose: () => console.log('closed')
 * }).render()
 *
 * modal.show()
 * modal.setContent(element)
 */

export class Modal {
  constructor(options = {}) {
    const {
      id = null,
      title = '',
      size = 'md', // sm, md, lg, xl
      closeButton = true,
      closeOnEscape = true,
      closeOnBackdrop = false,
      onClose = null,
      onConfirm = null,
      className = '',
    } = options;

    this.id = id;
    this.title = title;
    this.size = size;
    this.closeButton = closeButton;
    this.closeOnEscape = closeOnEscape;
    this.closeOnBackdrop = closeOnBackdrop;
    this.onClose = onClose;
    this.onConfirm = onConfirm;
    this.className = className;
    this.isVisible = false;
    this.contentElement = null;
    this.footerElement = null;
  }

  render() {
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: var(--z-modal-backdrop);
      opacity: 0;
      transition: opacity var(--transition-normal);
    `;

    if (this.closeOnBackdrop) {
      backdrop.addEventListener('click', () => this.close());
    }

    // Modal container
    const container = document.createElement('div');
    container.className = `modal modal-${this.size} ${this.className}`;
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    if (this.title) container.setAttribute('aria-labelledby', `${this.id}-title`);

    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background-color: var(--color-background);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      display: none;
      flex-direction: column;
      z-index: var(--z-modal);
      opacity: 0;
      transition: all var(--transition-normal);
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
    `;

    const sizeMap = {
      sm: 'width: 320px',
      md: 'width: 480px',
      lg: 'width: 640px',
      xl: 'width: 800px',
    };
    container.style.cssText += sizeMap[this.size] || sizeMap.md;

    if (this.id) container.id = this.id;

    // Header
    if (this.title) {
      const header = document.createElement('div');
      header.className = 'modal-header';
      header.style.cssText = `
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-md);
      `;

      const titleEl = document.createElement('h2');
      titleEl.id = `${this.id}-title`;
      titleEl.textContent = this.title;
      titleEl.style.cssText = `
        margin: 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
      `;
      header.appendChild(titleEl);

      // Close button
      if (this.closeButton) {
        const { Button } = require('../atoms/Button.js');
        const closeBtn = new Button({
          label: '✕',
          variant: 'ghost',
          size: 'sm',
          onClick: () => this.close(),
          ariaLabel: 'Close dialog',
          title: 'Close (Esc)',
        }).render();
        header.appendChild(closeBtn);
      }

      container.appendChild(header);
    }

    // Content
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = `
      padding: var(--spacing-lg);
      overflow-y: auto;
      flex: 1;
    `;
    this.contentElement = content;
    container.appendChild(content);

    // Footer (optional)
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    footer.style.cssText = `
      padding: var(--spacing-lg);
      border-top: 1px solid var(--color-border);
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      display: none;
    `;
    this.footerElement = footer;
    container.appendChild(footer);

    // Wrapper for backdrop + container
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-wrapper';
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: calc(var(--z-modal) - 1);
    `;
    wrapper.style.display = 'none';

    wrapper.appendChild(backdrop);
    wrapper.appendChild(container);

    // Keyboard handling
    this.handleKeyDown = (e) => {
      if (e.key === 'Escape' && this.closeOnEscape) {
        this.close();
      }
    };

    // Public methods
    wrapper.show = () => this.show(wrapper, backdrop, container);
    wrapper.close = () => this.close(wrapper, backdrop, container);
    wrapper.setContent = (element) => {
      this.contentElement.innerHTML = '';
      if (typeof element === 'string') {
        this.contentElement.textContent = element;
      } else if (element instanceof HTMLElement) {
        this.contentElement.appendChild(element);
      }
    };

    wrapper.setFooter = (element) => {
      if (element) {
        footer.innerHTML = '';
        footer.appendChild(element);
        footer.style.display = 'flex';
      } else {
        footer.style.display = 'none';
      }
    };

    wrapper.modal = this;
    return wrapper;
  }

  show(wrapper, backdrop, container) {
    wrapper.style.display = 'block';
    backdrop.style.display = 'block';
    container.style.display = 'flex';

    // Trigger animation
    setTimeout(() => {
      backdrop.style.opacity = '1';
      container.style.transform = 'translate(-50%, -50%) scale(1)';
      container.style.opacity = '1';
    }, 10);

    document.addEventListener('keydown', this.handleKeyDown);
    document.body.style.overflow = 'hidden';
    this.isVisible = true;
  }

  close(wrapper, backdrop, container) {
    backdrop.style.opacity = '0';
    container.style.transform = 'translate(-50%, -50%) scale(0.9)';
    container.style.opacity = '0';

    setTimeout(() => {
      if (wrapper) wrapper.style.display = 'none';
      if (backdrop) backdrop.style.display = 'none';
      if (container) container.style.display = 'none';
    }, 300);

    document.removeEventListener('keydown', this.handleKeyDown);
    document.body.style.overflow = '';
    this.isVisible = false;

    if (this.onClose) {
      this.onClose();
    }
  }
}

// Add Modal styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .modal-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: calc(var(--z-modal) - 1);
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: var(--z-modal-backdrop);
      opacity: 0;
      transition: opacity var(--transition-normal);
    }

    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background-color: var(--color-background);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      display: none;
      flex-direction: column;
      z-index: var(--z-modal);
      opacity: 0;
      transition: all var(--transition-normal);
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
    }

    .modal-sm { width: 320px; }
    .modal-md { width: 480px; }
    .modal-lg { width: 640px; }
    .modal-xl { width: 800px; }

    .modal-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
    }

    .modal-title {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .modal-content {
      padding: var(--spacing-lg);
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      padding: var(--spacing-lg);
      border-top: 1px solid var(--color-border);
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
    }

    @media (max-width: 640px) {
      .modal-sm,
      .modal-md,
      .modal-lg,
      .modal-xl {
        width: calc(100vw - 2rem);
      }
    }
  `;
  document.head.appendChild(style);
}
