# COTISHAMA 2.0 - ARQUITECTURA FRONTEND (HTML5 + VANILLA JS)

## 🎯 Visión del Frontend

**Filosofía:**
- Zero framework overhead
- Security-first approach
- Progressive enhancement
- Performance-obsessed
- Maintainable without transpilers

**Stack:**
- HTML5 (semantic markup)
- CSS3 (CSS Grid, Flexbox, Custom Properties)
- Vanilla JavaScript (ES2021+)
- Minimal, audited dependencies
- Bun for build/dev

---

## 📐 Arquitectura General

```
┌──────────────────────────────────────────────────────────┐
│              HTML TEMPLATES (semantic markup)            │
└─────────────────────────────┬──────────────────────────┘
                              │
                              ▼
                ┌────────────────────────────┐
                │  CSS (Modular + BEM)       │
                │  ├─ Reset/Normalize        │
                │  ├─ Typography             │
                │  ├─ Layout (Grid/Flex)     │
                │  ├─ Components             │
                │  ├─ Utilities              │
                │  └─ Variables (tokens)     │
                └────────────────┬───────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────┐
        │  JavaScript (Event-driven, modular)    │
        │                                        │
        │  ┌─ app.js (Bootstrap)                │
        │  ├─ core/                             │
        │  │  ├─ api-client.js (Fetch wrapper) │
        │  │  ├─ state.js (Event emitter)      │
        │  │  ├─ router.js (SPA routing)       │
        │  │  └─ storage.js (LocalStorage)     │
        │  │                                    │
        │  ├─ modules/                          │
        │  │  └─ [feature]/                    │
        │  │     ├─ [feature].module.js        │
        │  │     ├─ [feature].service.js       │
        │  │     └─ [feature].validator.js     │
        │  │                                    │
        │  ├─ components/                       │
        │  │  └─ [component]/                  │
        │  │     ├─ [component].component.js   │
        │  │     └─ [component].css            │
        │  │                                    │
        │  ├─ lib/                              │
        │  │  ├─ sanitizer.js (DOMPurify)     │
        │  │  ├─ validator.js (ajv)            │
        │  │  └─ crypto.js (TweetNaCl.js)     │
        │  │                                    │
        │  ├─ utils/                            │
        │  │  ├─ dom.js                        │
        │  │  ├─ event.js                      │
        │  │  ├─ format.js                     │
        │  │  └─ date.js                       │
        │  │                                    │
        │  └─ templates/                        │
        │     └─ [feature].template.html       │
        │                                        │
        └────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Fetch API  │
                    │   (native)   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │  Backend (Hono)  │
                    │  /api/v1/*       │
                    └──────────────────┘
```

---

## 🏗️ Patrones de Arquitectura

### **1. Module Pattern (IIFE + Closures)**

```
Cada feature es un módulo independiente:

quoteList.module.js:
├─ Encapsulación de estado local
├─ Métodos públicos (API del módulo)
├─ Métodos privados (implementación)
├─ Event listeners internos
└─ Cleanup en unmount

Ventajas:
├─ No contamina global scope
├─ Reutilizable en múltiples páginas
├─ Fácil testing
└─ Evita conflicts de nombres
```

### **2. Event-Driven State Management**

```
Sin Redux/Vuex/MobX, usamos EventEmitter pattern:

core/state.js
├─ Global state store (una sola fuente de verdad)
├─ Event emitter integrado
├─ Métodos para actualizar estado
├─ Listeners suscritos a cambios
└─ No reactividad mágica

Flujo:
1. Usuario interactúa
2. Handler actualiza estado via state.set()
3. state.set() emite evento
4. Listeners re-renderizan UI
5. DOM actualizado

Ejemplo:
state.on('quote:updated', (quote) => {
  render(quote);
})

state.set('quotes', newQuotes);
// ^ Automáticamente dispara listeners
```

### **3. Service Pattern**

```
quoteService.js encapsula lógica de API:

├─ getQuotes(filters)     → API call + error handling
├─ createQuote(data)      → API call + validation
├─ updateQuote(id, data)  → API call
├─ downloadPdf(id)        → Blob handling
└─ cachingStrategy()      → LocalStorage + TTL

Separación:
├─ quoteService.js = API communication only
├─ quoteValidator.js = Input validation
├─ quoteList.module.js = UI logic
└─ Componentes = Rendering only
```

### **4. Component Pattern**

```
Componentes reutilizables sin framework:

components/button/button.component.js
├─ create({ text, onClick, variant })
│  └─ Returns DOM element ready to use
└─ Encapsula listeners + styles

components/modal/modal.component.js
├─ create({ title, content, actions })
├─ .show() / .hide() / .destroy()
└─ Maneja overflow, focus trap, etc

components/table/table.component.js
├─ render(data, columns)
├─ Handles pagination
├─ Sortable columns
└─ No framework magic
```

### **5. Router Pattern (Client-Side)**

```
core/router.js:

router.register('/quotes', quoteList.init)
router.register('/quotes/:id', quoteDetail.init)
router.register('/clients', clientList.init)

router.navigate('/quotes') // Changes URL + inits module

Mecanismo:
├─ URL change → popstate event
├─ Extract route pattern
├─ Call associated module
├─ Cleanup previous module
├─ Render new module

History API nativo (no hash-based):
├─ /quotes
├─ /quotes/:id
└─ /clients
```

---

## 📝 Estructura Detallada

### **I. Core Modules (Fundación)**

#### **api-client.js**
```
Responsabilidades:
├─ Wrapper de Fetch API
├─ Manejo de JWT tokens
├─ Error handling consistente
├─ Request/response logging
├─ Timeout management
├─ Auto refresh de tokens
└─ Type-safe responses (TypeScript-like JSDoc)

Interfaz:
├─ apiClient.get(url, options)
├─ apiClient.post(url, data, options)
├─ apiClient.put(url, data, options)
├─ apiClient.delete(url, options)
└─ apiClient.download(url) → Blob

Características:
├─ Automatically adds Authorization header
├─ Handles 401 → refresh token → retry
├─ Centraliza error handling
├─ Logs cada request/response
├─ Timeouts (30s default)
└─ Abort controller para cancel
```

#### **state.js**
```
Responsabilidades:
├─ Single source of truth
├─ Event emitter para cambios
├─ Persistencia a LocalStorage
├─ Validación antes de set
├─ History para debugging
└─ Time-travel (futura feature)

Interfaz:
├─ state.get(key)
├─ state.set(key, value)
├─ state.on(event, callback)
├─ state.off(event, callback)
├─ state.clear()
├─ state.subscribe(key, callback)
└─ state.unsubscribe(key, callback)

Estado global:
{
  auth: {
    user: null,
    token: null,
    refreshToken: null
  },
  quotes: [],
  clients: [],
  products: [],
  ui: {
    loading: false,
    error: null,
    notification: null
  }
}
```

#### **router.js**
```
Responsabilidades:
├─ Client-side routing (SPA)
├─ URL ↔ Component mapping
├─ History API management
├─ Module lifecycle (init/cleanup)
├─ Not found handling
└─ Query params parsing

Interfaz:
├─ router.register(pattern, handler)
├─ router.navigate(path, params)
├─ router.back() / router.forward()
├─ router.getCurrentPath()
├─ router.getParams()
└─ router.onRouteChange(callback)

Rutas:
├─ /
├─ /login
├─ /quotes
├─ /quotes/:id
├─ /clients
├─ /products
├─ /reports
└─ /404 (catchall)
```

#### **storage.js**
```
Responsabilidades:
├─ Wrapper de LocalStorage + IndexedDB
├─ TTL (Time To Live) para caching
├─ Encryption para datos sensibles
├─ Event-based invalidation
└─ Error handling graceful

Interfaz:
├─ storage.set(key, value, ttl)
├─ storage.get(key)
├─ storage.remove(key)
├─ storage.clear()
├─ storage.has(key)
├─ storage.isExpired(key)
└─ storage.onStorageChange(callback)

Casos de uso:
├─ Auth tokens (encrypted)
├─ User preferences
├─ Cached API responses
└─ Draft forms (form state)
```

### **II. Modules (Features)**

Cada feature es un módulo self-contained:

#### **modules/auth/**
```
login.module.js:
├─ Render login form
├─ Validate credentials (client-side)
├─ Call authService.login()
├─ Handle success → navigate + store token
├─ Handle error → show message
└─ cleanup()

logout.module.js:
├─ Call authService.logout()
├─ Clear state
├─ Navigate to /login
└─ cleanup()

authService.js:
├─ login(email, password)
├─ logout()
├─ refreshToken()
├─ getCurrentUser()
└─ isAuthenticated()
```

#### **modules/quotes/**
```
list.module.js:
├─ Render table de quotes
├─ Pagination (click → load more)
├─ Filters (status, client, date range)
├─ Sort columns
├─ Delete action
├─ Subscribe to state.on('quote:updated')
└─ cleanup()

create.module.js:
├─ Render form (cliente, productos, cantidades)
├─ Autocomplete de productos
├─ Auto-calculate totals
├─ Validate antes de submit
├─ Call quoteService.create()
├─ Show success + navigate
└─ cleanup()

detail.module.js:
├─ Fetch quote by ID
├─ Render read-only detail
├─ Download PDF button
├─ Change status dropdown (if owner/admin)
├─ Delete button (if draft)
└─ cleanup()

quoteService.js:
├─ getQuotes(filters) → API + cache
├─ getQuoteById(id)
├─ createQuote(data)
├─ updateQuote(id, data)
├─ deleteQuote(id)
├─ downloadPdf(id) → Blob → Download
└─ cacheStrategy

quoteValidator.js:
├─ validateQuoteForm(data)
├─ validateProductDetails(details)
├─ checkClientExists(clientId)
└─ Return errors if any
```

#### **modules/clients/**
```
list.module.js:
├─ Render clients table
├─ Search by name
├─ Pagination
├─ Create button → navigate to /clients/new
├─ Edit button → navigate to /clients/:id/edit
├─ Delete (soft)
└─ cleanup()

form.module.js:
├─ New form (POST) or Edit form (PUT)
├─ Fields: name, contact, email, phone, address
├─ Save button → call service
├─ Cancel button → back
└─ cleanup()

clientService.js:
├─ getClients()
├─ getClientById(id)
├─ createClient(data)
├─ updateClient(id, data)
├─ deleteClient(id)
└─ getClientQuotes(id)

clientValidator.js:
├─ validateClientForm(data)
├─ checkDuplicateEmail()
├─ validatePhone()
└─ validateTaxId()
```

#### **modules/products/**
```
catalog.module.js:
├─ Render products grid/list
├─ Search by SKU/name
├─ Filter by category
├─ Stock status indicator
├─ (Admin only) Edit price
└─ cleanup()

autocomplete.module.js:
├─ Listen a input de producto
├─ Fetch /products/search?q=...
├─ Show suggestions dropdown
├─ Select → populate producto field
└─ Sanitize input (DOMPurify)

productService.js:
├─ getProducts(filters)
├─ searchProducts(query)
├─ getProductById(id)
└─ (Admin) updateProduct(id, data)
```

#### **modules/reports/**
```
dashboard.module.js:
├─ Summary metrics
├─ Quotes by status (chart)
├─ Revenue by month (chart)
├─ Top clients
├─ Low stock products
└─ cleanup()

export.module.js:
├─ Select date range
├─ Select columns to export
├─ Format: CSV, Excel
├─ Download button
└─ cleanup()

reportService.js:
├─ getSummary(dateRange)
├─ getQuotesByStatus()
├─ getRevenueByPeriod()
├─ generateCSV(data)
└─ generateExcel(data)
```

### **III. Components (Reusables)**

Componentes funcionales sin estado (presentacionales):

#### **FormGroup**
```
components/form-group/

input.component.js:
├─ create({ name, label, type, value, error })
├─ .setValue(value)
├─ .getValue()
├─ .setError(message)
├─ .clearError()
└─ Returns HTMLElement

select.component.js:
├─ create({ name, label, options, value })
├─ .setOptions(newOptions)
├─ .getValue()
└─ Returns HTMLElement

checkbox.component.js:
├─ create({ name, label, checked })
├─ .isChecked()
└─ Returns HTMLElement

form-group.css:
├─ Estilos consistentes
├─ Error states
├─ Responsive layout
└─ Accessibility
```

#### **Table**
```
components/table/

table.component.js:
├─ create({ columns, data, sortable, selectable })
├─ .render(newData)
├─ .setColumns(newColumns)
├─ .onRowClick(callback)
├─ .onSort(callback)
├─ .selectedRows()
└─ Returns HTMLElement

pagination.component.js:
├─ create({ page, totalPages })
├─ .setPage(page)
├─ .onPageChange(callback)
└─ Returns HTMLElement

table.css:
├─ Responsive
├─ Hover states
├─ Sticky headers
└─ Striped rows
```

#### **Modal**
```
components/modal/

modal.component.js:
├─ create({ title, content, actions })
├─ .show()
├─ .hide()
├─ .destroy()
├─ Focus trap
├─ ESC to close
├─ Backdrop click to close
└─ Returns HTMLElement

confirm-dialog.js:
├─ create({ title, message, onConfirm, onCancel })
├─ Predefined buttons
└─ Returns promise

modal.css:
├─ Backdrop
├─ Dialog styles
├─ Animations
└─ Responsive sizing
```

#### **Notification**
```
components/notification/

toast.component.js:
├─ create({ message, type, duration })
├─ Types: success, error, warning, info
├─ Auto-dismiss after duration
├─ Stacking multiple toasts
├─ .dismiss()
└─ Returns HTMLElement

toast.css:
├─ Position: bottom-right (customizable)
├─ Animations (slide-in, fade-out)
└─ Color variants
```

#### **Button**
```
components/button/

button.component.js:
├─ create({ text, onClick, variant, disabled, loading })
├─ Variants: primary, secondary, danger, success
├─ Loading state con spinner
├─ Disabled state
└─ Returns HTMLElement

button.css:
├─ Variants
├─ Hover/Active states
├─ Disabled appearance
└─ Accessibility focus
```

### **IV. Librerías Externas (Seguras & Livianas)**

**Criterios de Selección:**
```
✓ < 10KB (gzip)
✓ Auditoría de seguridad reciente
✓ Mantenimiento activo
✓ Sin dependencias pesadas
✓ TypeScript o JSDoc
✓ Uso simple (no magic)
```

#### **1. DOMPurify (5KB)**
```
Uso: Sanitizar HTML input antes de insertarlo en DOM

Caso de uso:
├─ User rich text editable
├─ Dynamic HTML rendering
├─ Prevent XSS attacks

Implementación:
const clean = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
  ALLOWED_ATTR: ['href', 'title']
})
element.innerHTML = clean;

Alternativa si no se necesita:
└─ textContent (más seguro que innerHTML)
```

#### **2. AJV (8KB)**
```
Uso: JSON schema validation (similar a Zod en backend)

Caso de uso:
├─ Validate API responses shape
├─ Client-side form validation
├─ Type checking sin TypeScript

Implementación:
const schema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    quantity: { type: 'integer', minimum: 1 }
  },
  required: ['email', 'quantity']
}
const validate = ajv.compile(schema)
if (!validate(data)) {
  console.log(validate.errors)
}

Alternativa si solo HTML5 validation:
└─ <input type="email" required> es suficiente
```

#### **3. date-fns (13KB) OR dayjs (2KB)**
```
Uso: Date manipulation y formatting

Caso de uso:
├─ Format dates para display
├─ Parse date strings
├─ Date arithmetic
└─ Timezone handling

date-fns example:
import { format, add } from 'date-fns'
format(new Date(), 'dd/MM/yyyy')
add(new Date(), { days: 7 })

dayjs example (más ligero):
import dayjs from 'dayjs'
dayjs().format('DD/MM/YYYY')
dayjs().add(7, 'day')

Recomendación:
├─ dayjs si solo date formatting
├─ date-fns si se necesita funcionalidad avanzada
└─ Nativa Date API si cálculos simples
```

#### **4. TweetNaCl.js (16KB) - OPCIONAL**
```
Uso: Encryption para datos sensibles en localStorage

Caso de uso:
├─ Encrypt tokens
├─ Encrypt user preferences si contienen sensibles
├─ NOT para passwords (solo servidor)

Alternativa más simple:
├─ No encryptr si HTTPS
├─ localStorage en HTTPS está relativament secure
└─ Tokens con HttpOnly cookies (desde servidor)

Si se necesita:
const encrypted = nacl.secretbox.seal(
  nacl.utils.decodeUTF8(plaintext),
  nonce,
  key
)
```

#### **NO Incluir:**
```
❌ jQuery (obsoleto con native DOM API)
❌ Lodash (native JS suficiente)
❌ Moment.js (demasiado pesado, usa date-fns o dayjs)
❌ Bootstrap (solo CSS, custom mejor)
❌ Font Awesome CDN (usar SVG icons o web fonts)
❌ Redux/MobX (custom state management es simple)
❌ Webpack (Bun lo maneja)
```

---

## 🎨 CSS Architecture (BEM + CSS Layers)

### **Reset & Normalize**
```css
/* reset.css */
├─ Remove default margins/paddings
├─ Inherit box-sizing
├─ Set base font properties
└─ Ensure consistency across browsers
```

### **Typography**
```css
/* typography.css */
├─ Font loading (self-hosted)
├─ Base font size (1rem = 16px)
├─ Line-height consistent
├─ Heading scales
└─ Text utilities
```

### **Layout**
```css
/* layout.css */
├─ Grid system (CSS Grid native)
├─ Flex utilities
├─ Container queries if needed
├─ Responsive breakpoints
└─ Spacing scale (4px, 8px, 16px...)
```

### **Components (BEM)**
```css
/* components.css */

.button {}
.button--primary {}
.button--secondary {}
.button--danger {}
.button.is-loading {}
.button:disabled {}

.form-group {}
.form-group__label {}
.form-group__input {}
.form-group__error {}
.form-group.is-invalid {}

.table {}
.table__head {}
.table__row {}
.table__cell {}
.table__cell--sticky {}

.modal {}
.modal__backdrop {}
.modal__dialog {}
.modal__close {}
.modal.is-visible {}
```

### **Utilities**
```css
/* utilities.css */

.text-center { text-align: center; }
.mt-1 { margin-top: var(--space-1); }
.mb-2 { margin-bottom: var(--space-2); }
.flex { display: flex; }
.grid { display: grid; }
.hidden { display: none; }
.sr-only { ... /* screen reader only */ }
```

### **Theming (Dark Mode)**
```css
/* theme.css */

:root {
  /* Light mode (default) */
  --color-primary: #0066cc;
  --color-surface: #ffffff;
  --color-text: #000000;
  /* ... más variables */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode */
    --color-primary: #3385ff;
    --color-surface: #1a1a1a;
    --color-text: #ffffff;
  }
}
```

### **Responsive**
```css
/* responsive.css */

/* Mobile First Approach */
/* Base: Mobile (< 640px) */
/* md: 640px */
/* lg: 1024px */
/* xl: 1280px */

@media (min-width: 640px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

---

## 🔐 Security Practices

### **Input Sanitization**

```javascript
// DON'T:
element.innerHTML = userInput; // XSS vulnerability

// DO - Option 1: Text content only
element.textContent = userInput; // Safe

// DO - Option 2: DOMPurify for formatted text
const clean = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
  ALLOWED_ATTR: []
});
element.innerHTML = clean;

// DO - Option 3: Use createTextNode
const text = document.createTextNode(userInput);
element.appendChild(text);
```

### **API Security**

```javascript
// HTTPS only (enforced by server headers)
// Authorization header (JWT token)
// CORS allowed origins (server-side)
// Content-Type validation

const apiClient = {
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  // Auto-refresh tokens
  // Timeout on requests
  // Log errors securely
}
```

### **Storage Security**

```javascript
// ✓ localStorage: Unencrypted (HTTPS safe)
// ✓ SessionStorage: Expires on close
// ❌ Avoid sensitive PII in storage
// ❌ Avoid passwords ever
// ✓ Tokens with short TTL

storage.set('auth_token', token, TTL_15_MIN)
// Auto-refresh with refresh_token
```

### **CSP (Content Security Policy)**

```html
<!-- Set by backend -->
<meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data:;
        font-src 'self' data:;
        connect-src 'self' https://api.example.com;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self'
      ">
```

---

## 🧪 Frontend Testing

### **Unit Testing (form validation, utilities)**

```javascript
// test/unit/validators.test.js

describe('QuoteValidator', () => {
  describe('validateQuoteForm', () => {
    test('should accept valid quote', () => {
      const data = { clientId: 'uuid', details: [...] }
      const errors = QuoteValidator.validateQuoteForm(data)
      expect(errors).toEqual([])
    })

    test('should reject missing clientId', () => {
      const data = { details: [...] }
      const errors = QuoteValidator.validateQuoteForm(data)
      expect(errors).toContain('clientId is required')
    })
  })
})
```

### **E2E Testing (Playwright)**

```javascript
// test/e2e/quote-creation.e2e.test.js

test('should create quote from login to download pdf', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:3000/login')
  await page.fill('#email', 'user@test.com')
  await page.fill('#password', 'password123')
  await page.click('button:has-text("Login")')
  
  // 2. Create quote
  await page.click('a:has-text("New Quote")')
  await page.selectOption('[name="client"]', 'client-uuid')
  
  // 3. Add products
  await page.fill('[name="product"]', 'tubo')
  await page.click('button:has-text("tubo 2m")')
  await page.fill('[name="quantity"]', '5')
  await page.click('button:has-text("Add Product")')
  
  // 4. Submit
  await page.click('button:has-text("Create Quote")')
  
  // 5. Verify success
  await expect(page).toHaveURL(/\/quotes\/[a-f0-9-]+/)
  await expect(page.locator('.success-message')).toBeVisible()
  
  // 6. Download PDF
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("Download PDF")')
  ])
  expect(download.suggestedFilename()).toMatch(/quote_.*\.pdf/)
})
```

---

## 📊 Performance Optimization

### **Bundle Size**
```
Target: < 100KB gzip total
├─ HTML: 5KB
├─ CSS: 15KB
├─ JS: 35KB
├─ Dependencies: 45KB
└─ Fonts: N/A (self-hosted)
```

### **Loading Strategy**
```
<head>
  <!-- Critical CSS inline or high priority -->
  <link rel="preload" href="fonts.woff2" as="font">
  <link rel="preconnect" href="https://api.example.com">
</head>

<body>
  <!-- HTML content -->
  
  <!-- Defer non-critical scripts -->
  <script src="utils.js" defer></script>
  <script src="app.js" defer></script>
</body>
```

### **Caching Strategy**
```
Static assets (CSS, JS, fonts):
├─ Cache forever (use content hash in filename)
├─ app.abc123.js (webpack-style hashing)
└─ index.html (never cache, use no-cache)

API responses:
├─ Quotes list: 5 min TTL
├─ Products catalog: 30 min TTL
├─ User data: Session only
└─ Auth tokens: 15 min (auto-refresh)

LocalStorage:
├─ Draft quotes: Persist until submit
├─ User preferences: Persist
├─ API responses: TTL-based
└─ Auth tokens: Encrypted, 15 min TTL
```

---

## ✅ Frontend Checklist

```
ESTRUCTURA:
□ Modules independientes por feature
□ Components reutilizables
□ Core (api, state, router, storage)
□ Utils y helpers
□ Lib (sanitizer, validator)

CSS:
□ BEM methodology
□ CSS custom properties para theming
□ Mobile-first responsive
□ Dark mode support
□ < 20KB gzip

JAVASCRIPT:
□ No global variables
□ Event-driven state
□ Clean module interfaces
□ Error handling
□ Logging

SEGURIDAD:
□ Input sanitization (DOMPurify)
□ No innerHTML de user input
□ HTTPS only
□ JWT in Authorization header
□ CSP headers
□ XSS prevention
□ CSRF tokens si necesario

PERFORMANCE:
□ Bundle < 100KB gzip
□ Lazy loading de modules
□ Caching strategy
□ No unused dependencies
□ Images optimized
□ Fonts self-hosted

TESTING:
□ Unit tests para validators
□ E2E tests para flujos críticos
□ Browser compatibility
□ Mobile responsiveness
□ Accessibility (WCAG 2.1)

DEVX:
□ Clear file structure
□ Consistent naming
□ Comments para lógica comple ja
□ Easy debugging
□ Fast dev server
```

---

**Próxima sección: DATABASE_SCHEMA.md (DER detallado)**
