# Cotishama Component Library

**Enterprise-Grade Atomic Design System**

A complete, production-ready component library built with vanilla JavaScript following Atomic Design principles. 21 carefully crafted components organized in 4 layers: Atoms, Molecules, Organisms, and Templates.

---

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| **Total Components** | 21 |
| **Lines of Code** | ~5,000 |
| **External Dependencies** | 0 |
| **Bundle Size (gzipped)** | ~45KB |
| **Accessibility** | WCAG 2.1 AA |
| **Browser Support** | All modern browsers |
| **Mobile Support** | Fully responsive |

---

## 🏗️ Architecture

### Atomic Design Layers

```
Templates (Page Layouts)
    ↓
Organisms (Complex Sections)
    ↓
Molecules (Composed Patterns)
    ↓
Atoms (Base Elements)
    ↓
Design System (CSS Tokens)
```

### Component Inventory

#### Atoms (6 components)
- **Button** - Interactive button with 6 variants, 3 sizes
- **Text** - Semantic text element with typography
- **Icon** - SVG icon wrapper with 25+ icons
- **Label** - Form label with required indicator
- **Badge** - Status badge with 6 variants
- **Input** - Text input with validation states

#### Molecules (6 components)
- **FormField** - Label + Input + Error text
- **Card** - Container with header and footer
- **SearchBox** - Search input with suggestions
- **Pagination** - Page navigation controls
- **MenuItem** - Menu item with icon
- **BreadCrumbs** - Navigation breadcrumbs

#### Organisms (5 components)
- **Modal** - Dialog with animations
- **Navigation** - Main header navigation
- **DataTable** - Table with sorting
- **Form** - Form container with validation
- **Sidebar** - Left navigation drawer

#### Templates (4 components)
- **MainLayout** - Primary layout with nav/sidebar
- **DashboardLayout** - Dashboard grid layout
- **FormLayout** - Centered form layout
- **ListLayout** - List view with table

---

## 🚀 Getting Started

### Installation

1. Import the design system CSS:
```html
<link rel="stylesheet" href="./css/design-system.css">
```

2. Import components:
```javascript
// Import specific components
import { Button } from './components/atoms/Button.js';
import { FormField } from './components/molecules/FormField.js';

// Or import all from index
import { Button, FormField, MainLayout } from './components/index.js';
```

### Basic Usage

#### Creating a Button
```javascript
const button = new Button({
  label: 'Click me',
  variant: 'primary',
  size: 'md',
  onClick: () => console.log('Clicked!')
}).render();

document.body.appendChild(button);
```

#### Creating a Form Field
```javascript
const field = new FormField({
  label: 'Email Address',
  inputType: 'email',
  placeholder: 'user@example.com',
  required: true,
  helpText: 'We never share your email'
}).render();

document.body.appendChild(field);
```

#### Creating a Layout
```javascript
const layout = new MainLayout({
  brand: { label: 'Cotishama', href: '/' },
  navItems: [
    { label: 'Dashboard', href: '/dashboard', icon: 'home' }
  ],
  sidebarItems: [
    { label: 'Menu Item', href: '/menu', icon: 'menu' }
  ]
}).render();

document.body.appendChild(layout);
layout.setContent(pageContent);
```

---

## 📖 Component APIs

### Button Component

```javascript
new Button({
  label: 'Click me',                    // Button text
  variant: 'primary',                   // primary|secondary|success|error|warning|ghost
  size: 'md',                          // sm|md|lg
  onClick: () => {},                   // Click handler
  disabled: false,                     // Disabled state
  icon: 'plus',                        // Optional icon
  iconPosition: 'left',                // left|right
  type: 'button',                      // button|submit|reset
  className: '',                       // Additional CSS classes
  ariaLabel: 'Button label'            // Accessibility label
}).render()
```

### Input Component

```javascript
new Input({
  type: 'text',                        // text|email|password|number|tel|url|search
  value: '',                           // Current value
  placeholder: '',                     // Placeholder text
  name: 'field-name',                  // Field name
  required: false,                     // Required validation
  disabled: false,                     // Disabled state
  size: 'md',                          // sm|md|lg
  state: 'default',                    // default|error|success|warning|loading
  icon: 'search',                      // Optional icon
  onChange: (e) => {},                 // Change handler
  onBlur: (e) => {},                   // Blur handler
  ariaLabel: 'Search',                 // Accessibility label
}).render()
```

### FormField Component

```javascript
new FormField({
  label: 'Email',                      // Field label
  inputType: 'email',                  // Input type
  required: true,                      // Required indicator
  placeholder: 'user@example.com',     // Placeholder
  error: null,                         // Error message
  helpText: 'Help text',               // Help message
  onChange: (value) => {}              // Change handler
}).render()
```

### Card Component

```javascript
const card = new Card({
  title: 'Card Title',                 // Header title
  subtitle: 'Subtitle',                // Header subtitle
  padding: 'md',                       // sm|md|lg
  variant: 'outlined'                  // outlined|elevated|flat
}).render();

card.setContent(element);              // Set card content
card.setFooter(footerElement);         // Set card footer
```

### Modal Component

```javascript
const modal = new Modal({
  title: 'Confirm',                    // Modal title
  size: 'md',                          // sm|md|lg|xl
  closeButton: true,                   // Show close button
  closeOnEscape: true,                 // Close with Esc
  onClose: () => {}                    // Close handler
}).render();

modal.setContent('Modal content');     // Set content
modal.show();                          // Display modal
modal.close();                         // Hide modal
```

### DataTable Component

```javascript
new DataTable({
  columns: [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name' }
  ],
  data: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ],
  striped: true,                       // Alternating row colors
  hoverable: true,                     // Hover effects
  pageable: true,                      // Enable pagination
  pageSize: 10,                        // Items per page
  onRowClick: (row) => {}              // Row click handler
}).render()
```

### Form Component

```javascript
new Form({
  title: 'Login',                      // Form title
  fields: [
    { 
      name: 'email', 
      type: 'email', 
      label: 'Email', 
      required: true 
    }
  ],
  submitLabel: 'Submit',               // Submit button text
  onSubmit: (data) => {}               // Form submission
}).render()
```

### MainLayout Component

```javascript
const layout = new MainLayout({
  brand: { label: 'App', href: '/' },  // Branding
  navItems: [],                        // Navigation items
  sidebarItems: [],                    // Sidebar items
  showSidebar: true,                   // Show/hide sidebar
  onNavClick: (item) => {}             // Nav click handler
}).render();

layout.setContent(element);            // Set page content
```

---

## 🎨 Design System

### Colors

The design system includes comprehensive color scales:

```css
/* Primary (Blue) */
--color-primary-50 through --color-primary-900

/* Semantic Colors */
--color-success-500      /* Green */
--color-error-500        /* Red */
--color-warning-500      /* Amber */
--color-neutral-*        /* Gray scale */
```

### Typography

```css
/* Font Families */
--font-family-primary    /* Inter, system fonts */
--font-family-mono       /* Fira Code, monospace */

/* Font Sizes: 0.75rem to 2.25rem */
--font-size-xs through --font-size-4xl

/* Font Weights */
--font-weight-regular    /* 400 */
--font-weight-medium     /* 500 */
--font-weight-semibold   /* 600 */
--font-weight-bold       /* 700 */
```

### Spacing Scale

8px-based spacing system:
```css
--spacing-xs   /* 8px */
--spacing-sm   /* 12px */
--spacing-md   /* 16px */
--spacing-lg   /* 24px */
--spacing-xl   /* 32px */
--spacing-2xl  /* 48px */
--spacing-3xl  /* 64px */
```

### Shadows & Effects

```css
--shadow-xs through --shadow-xl      /* Elevation system */
--shadow-focus                        /* Focus indicator */

--transition-fast    /* 150ms */
--transition-normal  /* 300ms */
--transition-slow    /* 500ms */
```

---

## ♿ Accessibility

All components follow WCAG 2.1 AA standards:

### Keyboard Navigation
- **Tab/Shift+Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and dropdowns
- **Arrow Keys**: Navigate lists and menus
- **Ctrl/Cmd+Enter**: Submit forms

### ARIA Support
- Proper semantic HTML (`<button>`, `<nav>`, `<label>`)
- ARIA roles and attributes for complex components
- aria-label for icon-only buttons
- aria-current for active navigation items
- aria-expanded for collapsible sections

### Screen Reader Support
- Form labels properly associated with inputs
- Error messages linked to form fields
- Live regions for dynamic updates
- Semantic heading structure

### Visual Accessibility
- Minimum 44px touch targets
- Focus visible states with box-shadow
- Color contrast ratio > 4.5:1
- Support for reduced motion (`prefers-reduced-motion`)
- Support for high contrast mode (`prefers-contrast`)

---

## 📱 Responsive Design

All components are mobile-first:

### Breakpoints
```javascript
// Mobile-first approach
// Default: Mobile view
// @media (min-width: 640px)  -> Tablet
// @media (min-width: 768px)  -> Desktop
// @media (min-width: 1024px) -> Large desktop
```

### Touch Optimization
- Minimum 44px touch targets on all interactive elements
- Adequate spacing between touch targets
- Responsive text sizing
- Mobile-optimized navigation (hamburger menu)

---

## 🔧 Advanced Usage

### Custom Styling

Components use CSS custom properties, allowing easy customization:

```javascript
// Override design tokens
document.documentElement.style.setProperty(
  '--color-primary-500',
  '#ff0000'
);
```

### Composition

Combine components to build complex UIs:

```javascript
// Create a user list card
const card = new Card({ title: 'Users' }).render();
const table = new DataTable({
  columns: [...],
  data: [...]
}).render();
const pagination = new Pagination({...}).render();

card.setContent(table);
card.setFooter(pagination);
```

### Event Handling

Components support standard DOM events:

```javascript
const input = new Input({
  onChange: (e) => console.log('Changed:', e.target.value),
  onBlur: (e) => console.log('Blurred'),
  onFocus: (e) => console.log('Focused')
}).render();
```

### Validation

Form components include built-in validation:

```javascript
const form = new Form({
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      validateMessage: 'Invalid email format'
    }
  ],
  onSubmit: (data) => {
    console.log('Valid form data:', data);
  }
}).render();
```

---

## 📚 Best Practices

### Do's ✅
- Use semantic HTML elements
- Include proper ARIA labels
- Provide keyboard alternatives
- Test on mobile devices
- Use proper color contrast
- Provide loading states
- Include error messages
- Test with screen readers

### Don'ts ❌
- Don't create custom focus styles (use existing ones)
- Don't remove outlines without replacement
- Don't rely on color alone for meaning
- Don't skip form labels
- Don't create very long forms (break into steps)
- Don't use placeholder as label
- Don't forget about tab order
- Don't animate automatically (respect prefers-reduced-motion)

---

## 🧪 Component Examples

### Building a Login Page

```javascript
import { FormLayout, Form } from './components/index.js';

const layout = new FormLayout({
  title: 'Login',
  subtitle: 'Welcome back!'
}).render();

const form = new Form({
  fields: [
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'password', type: 'password', label: 'Password', required: true }
  ],
  submitLabel: 'Sign In',
  onSubmit: (data) => {
    // Handle login
  }
}).render();

layout.setContent(form);
document.body.appendChild(layout);
```

### Building a Dashboard

```javascript
import { MainLayout, DashboardLayout, Card } from './components/index.js';

const layout = new MainLayout({
  brand: { label: 'Admin Panel' },
  navItems: [
    { label: 'Dashboard', href: '/dashboard', icon: 'home' }
  ]
}).render();

const dashboard = new DashboardLayout({
  title: 'Welcome',
  layout: 'grid',
  columns: 3
}).render();

// Add widgets
const widget1 = new Card({ title: 'Stats' }).render();
widget1.setContent('Content here');
dashboard.addWidget(widget1);

layout.setContent(dashboard);
document.body.appendChild(layout);
```

### Building a Product List

```javascript
import { ListLayout, DataTable } from './components/index.js';

const layout = new ListLayout({
  title: 'Products',
  subtitle: 'Manage your catalog',
  actionButton: {
    label: 'Add Product',
    onClick: () => {}
  }
}).render();

const table = new DataTable({
  columns: [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' }
  ],
  data: products
}).render();

layout.setDataTable(table);
document.body.appendChild(layout);
```

---

## 🚨 Common Patterns

### Form with Validation

```javascript
const form = new Form({
  fields: [
    {
      name: 'username',
      label: 'Username',
      required: true,
      minLength: 3,
      validate: (value) => /^[a-zA-Z0-9_]+$/.test(value),
      validateMessage: 'Alphanumeric and underscore only'
    }
  ],
  onSubmit: (data) => console.log('Form valid:', data)
}).render();
```

### Modal Confirmation

```javascript
const modal = new Modal({
  title: 'Confirm Action',
  size: 'sm',
  onClose: () => console.log('Cancelled')
}).render();

modal.setContent('Are you sure?');

const footer = flex([
  new Button({ label: 'Cancel', variant: 'secondary' }).render(),
  new Button({ label: 'Confirm', variant: 'error' }).render()
], { gap: 'md' });

modal.setFooter(footer);
modal.show();
```

### Breadcrumb Navigation

```javascript
new BreadCrumbs({
  items: [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Current Page', active: true }
  ]
}).render();
```

---

## 🔗 Component Showcase

View all components in action: `apps/frontend/public/showcase.html`

Open in browser to see:
- Live component examples
- Interactive demonstrations
- Responsive behavior
- Accessibility features

---

## 📋 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Latest 2 versions |
| Firefox | ✅ Latest 2 versions |
| Safari | ✅ Latest 2 versions |
| Edge | ✅ Latest 2 versions |
| iOS Safari | ✅ iOS 14+ |
| Chrome Mobile | ✅ Latest version |

---

## 📄 License

Built with ❤️ for Cotishama 2.0

Enterprise-grade component library following Atomic Design principles with zero external dependencies.

---

## 🎯 Next Steps

### For Developers
1. Review the `ARCHITECTURE_UXUI.md` for design principles
2. Explore `apps/frontend/public/showcase.html` for live examples
3. Use components in your pages following the API documentation
4. Customize via CSS custom properties

### For Designers
1. Review color palette in `design-system.css`
2. Follow spacing scale for consistency
3. Use design tokens for all styling
4. Test components for accessibility

### For Teams
1. Establish component usage guidelines
2. Document custom variations
3. Maintain component consistency
4. Conduct regular accessibility audits
5. Plan for component evolution

---

**Questions?** Refer to individual component files for detailed documentation.
