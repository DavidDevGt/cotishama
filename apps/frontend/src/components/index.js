/**
 * Cotishama Component Library
 * Complete Atomic Design component system
 *
 * Import by layer or individual component:
 *
 * // Import entire layer
 * import * as atoms from './components/atoms'
 * import * as molecules from './components/molecules'
 *
 * // Import specific component
 * import { Button } from './components/atoms/Button'
 * import { FormField } from './components/molecules/FormField'
 */

// ============================================================
// ATOMS - Base UI Elements
// ============================================================

export { Button } from './atoms/Button.js';
export { Text } from './atoms/Text.js';
export { Icon } from './atoms/Icon.js';
export { Label } from './atoms/Label.js';
export { Badge } from './atoms/Badge.js';
export { Input } from './atoms/Input.js';

// ============================================================
// MOLECULES - Composed UI Patterns
// ============================================================

export { FormField } from './molecules/FormField.js';
export { Card } from './molecules/Card.js';
export { SearchBox } from './molecules/SearchBox.js';
export { Pagination } from './molecules/Pagination.js';
export { MenuItem } from './molecules/MenuItem.js';
export { BreadCrumbs } from './molecules/BreadCrumbs.js';

// ============================================================
// ORGANISMS - Complex Sections
// ============================================================

export { Modal } from './organisms/Modal.js';
export { Navigation } from './organisms/Navigation.js';
export { DataTable } from './organisms/DataTable.js';
export { Form } from './organisms/Form.js';
export { Sidebar } from './organisms/Sidebar.js';

// ============================================================
// TEMPLATES - Full Page Layouts
// ============================================================

export { MainLayout } from './templates/MainLayout.js';
export { DashboardLayout } from './templates/DashboardLayout.js';
export { FormLayout } from './templates/FormLayout.js';
export { ListLayout } from './templates/ListLayout.js';

// ============================================================
// Component Composition Utilities
// ============================================================

/**
 * Helper to create a complete page with layout
 * @param {string} layoutType - 'main', 'dashboard', 'form', 'list'
 * @param {object} options - Layout configuration
 * @returns {HTMLElement} Complete layout
 */
export function createLayout(layoutType, options = {}) {
  const layouts = {
    main: 'MainLayout',
    dashboard: 'DashboardLayout',
    form: 'FormLayout',
    list: 'ListLayout',
  };

  const LayoutClass = layouts[layoutType];
  if (!LayoutClass) {
    throw new Error(`Unknown layout type: ${layoutType}`);
  }

  // Dynamically import and create
  // Note: In real app, use proper ES module imports
}

/**
 * Shorthand to create a button
 */
export function button(label, options = {}) {
  const { Button } = require('./atoms/Button.js');
  return new Button({ label, ...options }).render();
}

/**
 * Shorthand to create a card
 */
export function card(title, options = {}) {
  const { Card } = require('./molecules/Card.js');
  return new Card({ title, ...options }).render();
}

/**
 * Shorthand to create a form field
 */
export function formField(label, inputType = 'text', options = {}) {
  const { FormField } = require('./molecules/FormField.js');
  return new FormField({ label, inputType, ...options }).render();
}

// ============================================================
// Component Registry for Runtime Introspection
// ============================================================

export const COMPONENTS = {
  atoms: {
    Button: 'Interactive button with variants and sizes',
    Text: 'Semantic text element with typography',
    Icon: 'SVG icon wrapper with 25+ icons',
    Label: 'Form label with required indicator',
    Badge: 'Status badge with variants',
    Input: 'Text input with validation states',
  },
  molecules: {
    FormField: 'Label + Input + Error text',
    Card: 'Container with header and footer',
    SearchBox: 'Search input with suggestions',
    Pagination: 'Page navigation controls',
    MenuItem: 'Menu item with icon',
    BreadCrumbs: 'Navigation breadcrumbs',
  },
  organisms: {
    Modal: 'Dialog with header and footer',
    Navigation: 'Main header navigation',
    DataTable: 'Table with sorting and pagination',
    Form: 'Form container with validation',
    Sidebar: 'Left navigation drawer',
  },
  templates: {
    MainLayout: 'Primary layout with nav and sidebar',
    DashboardLayout: 'Dashboard grid layout',
    FormLayout: 'Centered form layout',
    ListLayout: 'List view with table',
  },
};

// ============================================================
// Accessibility Utilities
// ============================================================

/**
 * Apply ARIA labels to component
 */
export function withARIA(element, ariaLabel, ariaDescription = null) {
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
  if (ariaDescription) element.setAttribute('aria-describedby', ariaDescription);
  return element;
}

/**
 * Set focus to element safely
 */
export function setFocus(element) {
  if (element && typeof element.focus === 'function') {
    setTimeout(() => element.focus(), 0);
  }
}

/**
 * Announce message to screen readers
 */
export function announce(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}

// ============================================================
// Layout Utilities
// ============================================================

/**
 * Create a flex container
 */
export function flex(children = [], options = {}) {
  const {
    direction = 'row',
    gap = 'md',
    align = 'center',
    justify = 'flex-start',
    wrap = false,
  } = options;

  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    flex-direction: ${direction};
    gap: var(--spacing-${gap});
    align-items: ${align};
    justify-content: ${justify};
    ${wrap ? 'flex-wrap: wrap;' : ''}
  `;

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === 'string') {
        container.innerHTML += child;
      } else if (child instanceof HTMLElement) {
        container.appendChild(child);
      }
    });
  } else if (children instanceof HTMLElement) {
    container.appendChild(children);
  }

  return container;
}

/**
 * Create a grid container
 */
export function grid(children = [], columns = 3, gap = 'md') {
  const container = document.createElement('div');
  container.style.cssText = `
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    gap: var(--spacing-${gap});
  `;

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === 'string') {
        container.innerHTML += child;
      } else if (child instanceof HTMLElement) {
        container.appendChild(child);
      }
    });
  } else if (children instanceof HTMLElement) {
    container.appendChild(children);
  }

  return container;
}

/**
 * Create a spacer element
 */
export function spacer(size = 'md') {
  const el = document.createElement('div');
  el.style.height = `var(--spacing-${size})`;
  return el;
}

// ============================================================
// Component Validation
// ============================================================

/**
 * Validate component exports
 */
export function validateComponentLibrary() {
  const required = [
    'Button', 'Text', 'Icon', 'Label', 'Badge', 'Input',
    'FormField', 'Card', 'SearchBox', 'Pagination', 'MenuItem', 'BreadCrumbs',
    'Modal', 'Navigation', 'DataTable', 'Form', 'Sidebar',
    'MainLayout', 'DashboardLayout', 'FormLayout', 'ListLayout',
  ];

  const missing = [];
  const exports = Object.keys(this);

  required.forEach((component) => {
    if (!exports.includes(component)) {
      missing.push(component);
    }
  });

  if (missing.length > 0) {
    console.warn(
      `Missing components: ${missing.join(', ')}`
    );
  }

  return {
    total: required.length,
    available: required.length - missing.length,
    missing,
    ready: missing.length === 0,
  };
}
