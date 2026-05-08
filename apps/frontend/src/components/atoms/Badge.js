/**
 * Badge Component
 * Status indicator with multiple variants and sizes
 *
 * Usage:
 * new Badge({
 *   label: 'Active',
 *   variant: 'success',
 *   size: 'sm'
 * }).render()
 */

export class Badge {
  constructor(options = {}) {
    const {
      label = 'Badge',
      variant = 'primary', // primary, secondary, success, error, warning, info
      size = 'sm', // xs, sm, md
      className = '',
      id = null,
      title = null,
      ariaLabel = null,
    } = options;

    this.label = label;
    this.variant = variant;
    this.size = size;
    this.className = className;
    this.id = id;
    this.title = title;
    this.ariaLabel = ariaLabel;
  }

  render() {
    const badge = document.createElement('span');
    badge.className = this.getClasses();
    badge.textContent = this.label;
    badge.style.cssText = this.getStyles();

    if (this.id) badge.id = this.id;
    if (this.title) badge.title = this.title;
    if (this.ariaLabel) badge.setAttribute('aria-label', this.ariaLabel);

    badge.setAttribute('role', 'status');

    return badge;
  }

  getClasses() {
    const classes = [
      'badge',
      `badge-${this.variant}`,
      `badge-${this.size}`,
      this.className
    ];

    return classes.filter(Boolean).join(' ');
  }

  getStyles() {
    const sizes = {
      xs: {
        padding: 'var(--spacing-xs) 0.375rem',
        'font-size': 'var(--font-size-xs)',
        'min-height': '18px',
      },
      sm: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        'font-size': 'var(--font-size-sm)',
        'min-height': '22px',
      },
      md: {
        padding: 'var(--spacing-sm) var(--spacing-md)',
        'font-size': 'var(--font-size-base)',
        'min-height': '28px',
      },
    };

    const variants = {
      primary: {
        'background-color': 'var(--color-primary-500)',
        'color': 'white',
      },
      secondary: {
        'background-color': 'var(--color-neutral-200)',
        'color': 'var(--color-text-primary)',
      },
      success: {
        'background-color': 'var(--color-success-500)',
        'color': 'white',
      },
      error: {
        'background-color': 'var(--color-error-500)',
        'color': 'white',
      },
      warning: {
        'background-color': 'var(--color-warning-500)',
        'color': 'white',
      },
      info: {
        'background-color': 'var(--color-primary-100)',
        'color': 'var(--color-primary-800)',
      },
    };

    const baseStyles = {
      display: 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'border-radius': 'var(--radius-md)',
      'font-weight': 'var(--font-weight-medium)',
      'white-space': 'nowrap',
      'user-select': 'none',
      'line-height': '1',
      ...sizes[this.size] || sizes.sm,
      ...variants[this.variant] || variants.primary,
    };

    return Object.entries(baseStyles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }
}

// Add badge styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
      user-select: none;
      line-height: 1;
    }

    .badge-xs {
      padding: var(--spacing-xs) 0.375rem;
      font-size: var(--font-size-xs);
      min-height: 18px;
    }

    .badge-sm {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-sm);
      min-height: 22px;
    }

    .badge-md {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-base);
      min-height: 28px;
    }

    .badge-primary {
      background-color: var(--color-primary-500);
      color: white;
    }

    .badge-secondary {
      background-color: var(--color-neutral-200);
      color: var(--color-text-primary);
    }

    .badge-success {
      background-color: var(--color-success-500);
      color: white;
    }

    .badge-error {
      background-color: var(--color-error-500);
      color: white;
    }

    .badge-warning {
      background-color: var(--color-warning-500);
      color: white;
    }

    .badge-info {
      background-color: var(--color-primary-100);
      color: var(--color-primary-800);
    }
  `;
  document.head.appendChild(style);
}
