# COTISHAMA 2.0 - ARQUITECTURA UX/UI SENIOR

**Rol:** Senior UX/UI Architect + Software Architect  
**Objetivo:** Sistema digno, altamente usable, optimizado para velocidad de operación  
**Versión:** 2.0.0  
**Status:** Design Architecture In Progress

---

## 📋 ÍNDICE EJECUTIVO

Este documento define la arquitectura UX/UI para Cotishama 2.0 como un **sistema empresarial de generación de cotizaciones** con:
- ✅ **Usabilidad máxima** - Diseño centrado en el usuario
- ✅ **Velocidad de operación** - Optimizado para tareas repetitivas
- ✅ **Dignidad profesional** - Estándar empresarial
- ✅ **Accesibilidad** - WCAG 2.1 AA compliance
- ✅ **Performance** - <500ms en todas las operaciones

---

## 🎯 PRINCIPIOS RECTORES

### 1. **Progressive Disclosure**
```
Mostrar solo lo necesario en cada momento
└─ Ocultar complejidad innecesaria
└─ Revelar gradualmente según el contexto
└─ Minimizar carga cognitiva
```

### 2. **Velocidad de Operación**
```
Optimizar para usuarios que crean 50+ cotizaciones/día
└─ Atajos de teclado (keyboard-first)
└─ Acciones con un click
└─ Autocomplete y sugerencias
└─ Bulk operations
```

### 3. **Dignidad Profesional**
```
Diseño que refleja la importancia de la empresa
└─ Tipografía profesional (Inter)
└─ Color scheme corporativo
└─ Espaciado generoso
└─ Consistencia visual
```

### 4. **Accesibilidad**
```
WCAG 2.1 AA como mínimo
└─ Contraste 4.5:1 para texto
└─ Navegación por teclado completa
└─ ARIA labels adecuados
└─ Testing automático
```

### 5. **Mobile-First Responsive**
```
Funcional en todos los dispositivos
└─ 320px en mobile
└─ Tablets optimizadas
└─ Desktop mejorado
└─ Touch targets >= 44px
```

---

## 🎨 DESIGN SYSTEM

### Tipografía

```
Primary Font: Inter (Variable)
Fallback: System fonts

Escala de tamaños:
xs:   12px / 1.2  (deshabilitado, hints)
sm:   14px / 1.4  (labels, helper text)
base: 16px / 1.5  (body text, párrafos)
lg:   18px / 1.6  (subtítulos, labels grandes)
xl:   20px / 1.6  (headings h4)
2xl:  24px / 1.5  (headings h3)
3xl:  30px / 1.4  (headings h2)
4xl:  36px / 1.2  (headings h1, títulos principales)

Font Weights:
Regular: 400   (body text, normal)
Medium:  500   (labels, acciones)
Semibold: 600  (subtítulos, énfasis)
Bold:    700   (headings, importantes)

Line Heights:
Tight:   1.2   (headings)
Normal:  1.5   (body text)
Relaxed: 1.75  (descriptive text)
```

### Color Palette

```
Primario (Azul Corporativo):
primary-50:   #f0f7ff
primary-100:  #e0ecff
primary-200:  #bae0ff
primary-300:  #7ac9ff
primary-400:  #47b3ff
primary-500:  #2196f3  ← Principal
primary-600:  #1976d2
primary-700:  #1565c0
primary-800:  #0d47a1
primary-900:  #051e68

Secundario (Verde Éxito):
success-50:   #f0fde8
success-100:  #dcfcdf
success-200:  #b8f8be
success-300:  #7ef7a0
success-400:  #4cef5f
success-500:  #10b981  ← Success
success-600:  #059669
success-700:  #047857
success-800:  #065f46
success-900:  #052e16

Tertiary (Ámbar Advertencia):
warning-50:   #fffbeb
warning-100:  #fef3c7
warning-200:  #fce08b
warning-300:  #fcc34d
warning-400:  #fbbf24
warning-500:  #f59e0b  ← Warning
warning-600:  #d97706
warning-700:  #b45309
warning-800:  #92400e
warning-900:  #78350f

Error (Rojo):
error-50:     #fef2f2
error-100:    #fee2e2
error-200:    #fecaca
error-300:    #fca5a5
error-400:    #f87171
error-500:    #ef4444  ← Error
error-600:    #dc2626
error-700:    #b91c1c
error-800:    #991b1b
error-900:    #7f1d1d

Neutral (Grises):
gray-50:      #f9fafb
gray-100:     #f3f4f6
gray-200:     #e5e7eb
gray-300:     #d1d5db
gray-400:     #9ca3af
gray-500:     #6b7280  ← Secondary text
gray-600:     #4b5563
gray-700:     #374151
gray-800:     #1f2937
gray-900:     #111827  ← Primary text

Fondos:
background:   #ffffff
surface:      #f9fafb
hover:        #f3f4f6
selected:     #eff6ff
```

### Espaciado

```
Sistema de 8px base

8px  (xs)   - gaps pequeños, iconos inline
12px (sm)   - spacing interior pequeño
16px (md)   - padding estándar, gaps normales
24px (lg)   - padding generoso, spacing grande
32px (xl)   - sections, spacing principal
48px (2xl)  - layout espacioso
64px (3xl)  - page sections
```

### Sombras

```
Elevación 0:   ninguna (flat)
Elevación 1:   0 1px 2px rgba(0,0,0,0.05)
Elevación 2:   0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06)
Elevación 3:   0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
Elevación 4:   0 20px 25px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.05)
Modal:         0 25px 50px rgba(0,0,0,0.25)
```

### Radios de Esquina

```
xs:   2px  (borders finos, detalles)
sm:   4px  (inputs, pequeños elementos)
md:   8px  (cards, botones)
lg:   12px (modales, paneles grandes)
full: 9999px (avatar, circles)
```

### Transiciones

```
Fast:      150ms (hover states, toggles)
Normal:    300ms (modal open/close, page transitions)
Slow:      500ms (complex animations)

Easing:
in-out: cubic-bezier(0.4, 0, 0.2, 1)
out:    cubic-bezier(0, 0, 0.2, 1)
in:     cubic-bezier(0.4, 0, 1, 1)
```

---

## 🧩 COMPONENTES PRINCIPALES

### Atomic Design Hierarchy

```
Atoms
├─ Button
├─ Input
├─ Badge
├─ Icon
├─ Label
├─ Text

Molecules
├─ Form Field (Label + Input + Error)
├─ Search Box (Input + Icon)
├─ Pagination
├─ Breadcrumbs
├─ Card
├─ Menu Item

Organisms
├─ Form
├─ Data Table
├─ Navigation Header
├─ Sidebar
├─ Modal Dialog
├─ Dropdown Menu

Templates
├─ Layout Principal
├─ Dashboard Template
├─ Form Template
├─ List Template

Pages
├─ Dashboard
├─ Quote Editor
├─ Client Management
├─ Product Catalog
```

---

## 📐 ARQUITECTURA FRONTEND

### Estructura de Carpetas

```
apps/frontend/
├── src/
│   ├── app.js                 # Entry point
│   ├── core/
│   │   ├── api-client.js      # HTTP wrapper
│   │   ├── state.js           # Event-driven state
│   │   ├── router.js          # Routing
│   │   └── storage.js         # LocalStorage
│   ├── styles/
│   │   ├── design-system.css  # Design tokens
│   │   ├── global.css         # Global styles
│   │   ├── typography.css     # Font faces
│   │   └── utilities.css      # Helper classes
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Label.js
│   │   │   ├── Badge.js
│   │   │   └── Icon.js
│   │   ├── molecules/
│   │   │   ├── FormField.js
│   │   │   ├── Card.js
│   │   │   ├── SearchBox.js
│   │   │   ├── Pagination.js
│   │   │   └── BreadCrumbs.js
│   │   ├── organisms/
│   │   │   ├── Navigation.js
│   │   │   ├── Sidebar.js
│   │   │   ├── DataTable.js
│   │   │   ├── Modal.js
│   │   │   └── Form.js
│   │   └── templates/
│   │       ├── MainLayout.js
│   │       ├── DashboardLayout.js
│   │       ├── FormLayout.js
│   │       └── ListLayout.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.js
│   │   │   │   └── RegisterPage.js
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   ├── quotes/
│   │   │   ├── pages/
│   │   │   │   ├── QuoteListPage.js
│   │   │   │   ├── QuoteEditorPage.js
│   │   │   │   └── QuoteDetailPage.js
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   ├── clients/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── products/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── services/
│   │   └── dashboard/
│   │       ├── pages/
│   │       └── components/
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useForm.js
│   │   ├── useApi.js
│   │   └── useLocalStorage.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   ├── keyboard.js
│   │   └── performance.js
│   └── tests/
│       ├── unit/
│       └── integration/
└── public/
    ├── assets/
    │   ├── fonts/
    │   ├── icons/
    │   ├── images/
    │   └── images/logo.svg
    ├── css/
    │   └── design-system.css
    └── index.html
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### Estrategia de Carga

```
Critical Path:
1. Índice HTML (< 5KB)
2. CSS crítico inline (< 20KB)
3. Fuentes del sistema fallback
4. JavaScript mínimo para inicio (< 100KB)

Deferred Loading:
1. Resto de CSS (async, non-critical)
2. Iconos SVG (lazy loaded)
3. Imágenes (lazy loaded)
4. Módulos secundarios (code splitting)

Métricas Objetivo:
LCP (Largest Contentful Paint):    < 2.5s
FID (First Input Delay):           < 100ms
CLS (Cumulative Layout Shift):     < 0.1
TTFB (Time to First Byte):         < 500ms
FCP (First Contentful Paint):       < 1.8s
```

### Code Splitting

```
app.js                  (13KB gzipped)
├─ core/                (3KB - sempre necesario)
├─ auth/                (8KB - on-demand)
├─ quotes/              (25KB - on-demand)
├─ clients/             (15KB - on-demand)
├─ products/            (15KB - on-demand)
├─ dashboard/           (12KB - on-demand)
└─ components/          (30KB - shared)

Lazy Loading por ruta:
/login                  → cargar solo módulo auth
/quotes                 → cargar solo módulo quotes
/clients                → cargar solo módulo clients
/products               → cargar solo módulo products
```

### Caching Strategy

```
Static Assets (1 year):
- CSS compiled
- Fonts
- SVG icons
- Build artifacts

Images (30 days):
- Logos
- UI graphics
- Product images

API Responses (Según contexto):
- User data: 5 minutes
- Products: 30 minutes
- Clients: 1 hour
- Quotes: session-based

LocalStorage:
- Auth tokens
- Recent searches
- Form drafts
- User preferences
```

---

## ⌨️ KEYBOARD FIRST DESIGN

### Atajos Principales

```
Global:
Ctrl/Cmd + K          → Command palette
Escape                → Close modals/dropdowns
Tab                   → Focus navigation
Shift + Tab           → Focus reverse
Enter                 → Submit/confirm
Ctrl/Cmd + S          → Save

En Listados:
/                     → Buscar
n                     → Nueva cotización
e                     → Editar seleccionado
d                     → Eliminar seleccionado
↑↓                    → Navegar listado
Enter                 → Abrir/ver detalles

En Formularios:
Tab                   → Siguiente campo
Shift + Tab           → Campo anterior
Ctrl/Cmd + Enter      → Submit
Escape                → Cancelar

En Editor de Cotización:
+                     → Agregar producto
-                     → Eliminar línea
Tab                   → Siguiente campo
Ctrl/Cmd + Shift + C  → Copiar de cotización anterior
```

---

## 👥 USER PERSONAS & FLOWS

### Persona 1: Gerente de Ventas
```
Objetivo: Crear 30-50 cotizaciones/día rápidamente
Necesidades:
- Autocomplete de clientes frecuentes
- Plantillas de cotización rápidas
- Vista rápida de historial de cliente
- Bulk operations
- Exportar a PDF con un click

Flujo optimizado:
1. Dashboard → Botón "Nueva Cotización"
2. Buscar cliente (autocomplete)
3. Seleccionar plantilla (si aplica)
4. Cargar productos (drag-drop o búsqueda)
5. Ajustar cantidades y descuentos
6. Preview y PDF
7. Enviar cliente
```

### Persona 2: Administrador de Inventario
```
Objetivo: Mantener stock actualizado
Necesidades:
- Vista rápida de stock bajo
- Actualización bulk de inventario
- Alertas de productos con poco stock
- Búsqueda rápida de productos
- Reportes de movimiento

Flujo optimizado:
1. Dashboard → Sección "Inventario Bajo"
2. Búsqueda rápida (/)
3. Actualizar stock (input directo)
4. Ver historial de movimientos
5. Generar reportes
```

### Persona 3: Contadora/Admin
```
Objetivo: Reportes y análisis
Necesidades:
- Dashboards personalizados
- Filtros avanzados
- Exportación a Excel
- Gráficos de tendencias
- Auditoría de cambios

Flujo optimizado:
1. Dashboard → Analytics
2. Seleccionar fecha rango
3. Aplicar filtros
4. Generar reportes
5. Exportar datos
```

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile (320px - 639px)
└─ Stack vertical
└─ Single column
└─ Botones grandes (48px)
└─ Menú hamburguesa
└─ Tabs para navegación

Tablet (640px - 1023px)
└─ 2 columnas donde aplique
└─ Sidebar colapsible
└─ Grid flexible
└─ Botones 44px

Desktop (1024px+)
└─ 3+ columnas
└─ Sidebar fijo
└─ Sidebar derecho (panels)
└─ Menú horizontal
└─ Workspace optimizado
```

---

## ♿ ACCESSIBILITY (WCAG 2.1 AA)

### Requisitos Mínimos

```
Contraste:
Text (normal):        4.5:1
Text (large):         3:1
UI components:        3:1

Touch targets:        44x44px mínimo
Focus visible:        2px outline, ≥3:1 contrast

Keyboard:
- Tab navigation completa
- Escape para cerrar
- Enter para submit
- Arrow keys para listas
- No traps de keyboard

ARIA:
- aria-label en botones sin texto
- aria-describedby para descripciones
- role="main", role="navigation", etc.
- aria-live para actualizaciones dinámicas
- aria-current para indicar página actual
```

---

## 📊 LAYOUT PRINCIPAL

### Dashboard Principal

```
┌─────────────────────────────────────────┐
│  Logo    Buscar     [User Menu]         │ Header (h-16)
├──────┬──────────────────────────────────┤
│      │ Bienvenido, Usuario              │
│      │                                  │
│ Side │ ┌─ Mis Cotizaciones ────────┐   │
│ Bar  │ │ 5 por completar            │   │ 
│      │ │ 12 pendientes envío        │   │
│ Nav  │ └────────────────────────────┘   │
│      │                                  │
│      │ ┌─ Productos Bajo Stock ─────┐   │ Main Content
│      │ │ 3 productos con stock bajo │   │
│      │ │ 1 sin stock                │   │
│      │ └────────────────────────────┘   │
│      │                                  │
│      │ [Crear Cotización]              │
│      │ [Ver Todas las Cotizaciones]    │
│      │ [Gestionar Clientes]            │
│      │ [Gestionar Productos]           │
└──────┴──────────────────────────────────┘
```

### Editor de Cotización

```
┌─────────────────────────────────────────┐
│ ← Cotización #2024-001234  [Guardar]   │
├─────────────────────────────────────────┤
│                                         │
│ Cliente: [Autocomplete ▼]      Fecha: X │
│ Dirección: [Readonly]          Válido:  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Productos en Cotización                │
│ ┌─────────────────────────────────────┐│
│ │ Producto    Cant  Precio  Total  ⋮ ││
│ │─────────────────────────────────────││
│ │ Producto A  10    100     1000  ×  ││
│ │ Producto B  5     200     1000  ×  ││
│ │ Producto C  3     500     1500  ×  ││
│ └─────────────────────────────────────┘│
│ [+ Agregar producto]                   │
│                                         │
├─────────────────────────────────────────┤
│                              Subtotal:  │
│                              Descuento: │
│                              Impuesto:  │
│                              TOTAL: $   │
│                                         │
│ [Cancelar]  [Guardar]  [Enviar]        │
└─────────────────────────────────────────┘
```

---

## 🎬 USER FLOWS DETALLADOS

### Flow 1: Crear Cotización (5 minutos máximo)

```
1. INICIO
   ↓
2. Dashboard → "Nueva Cotización"
   ↓
3. Buscar Cliente (autocomplete)
   - Muestra últimos 5 clientes
   - Búsqueda instantánea
   - Carga datos del cliente
   ↓
4. Agregar Productos
   - Búsqueda por nombre/SKU
   - Autocompletar cantidad
   - Autocaculate total por línea
   ↓
5. Ajustar Detalles
   - Descuentos (si aplica)
   - Fecha de validez
   - Notas
   ↓
6. Preview & PDF
   - Previsualizar en pantalla
   - Opción: Descargar PDF
   ↓
7. Enviar/Guardar
   - Copiar al portapapeles
   - Enviar vía email
   - Guardar como borrador
   ↓
8. FIN
```

### Flow 2: Buscar Cotización Anterior

```
1. INICIO
   ↓
2. Listado de Cotizaciones
   - Mostrar últimas 10 por defecto
   - Búsqueda/filtro visible
   ↓
3. Búsqueda (/ shortcut)
   - Por número de cotización
   - Por cliente
   - Por fecha
   ↓
4. Resultados
   - Grid/Lista con acciones
   - Duplicar, Editar, Ver, PDF
   ↓
5. Duplicar (si es el caso)
   - Copiar todos los datos
   - Permitir edición inmediata
   - Generar nuevo número
   ↓
6. FIN (Volver a paso 1 para crear nueva)
```

---

## 🔄 STATE MANAGEMENT STRATEGY

### Estados Globales

```javascript
{
  auth: {
    user: { id, email, role, name },
    isAuthenticated: boolean,
    token: string,
    refreshToken: string
  },
  
  ui: {
    theme: 'light' | 'dark',
    sidebarOpen: boolean,
    currentPage: string,
    loading: boolean,
    notification: { type, message, duration }
  },
  
  data: {
    quotes: [],
    clients: [],
    products: [],
    currentQuote: null
  },
  
  cache: {
    lastFetch: { [resource]: timestamp },
    offline: boolean
  }
}
```

### Local State (por componente)

```
- Form inputs (useForm hook)
- Modal open/close
- Dropdown expanded/collapsed
- Popup visibility
- Sorting/filtering en tablas
- Paginación
```

---

## 📝 CONTENIDO & MICROCOPY

### Principios

```
✓ Breve y directo
✓ Acción-orientado
✓ No jerga técnica
✓ Español claro
✓ Consistente en toda la app

Patrones:
"Crear Cotización" (no "Nueva Cotización")
"Guardar Cambios" (no "Confirmar")
"¿Eliminar cotización?" (no "¿Estás seguro?")
```

---

## 🧪 TESTING STRATEGY

```
Unit Tests:
- Component rendering
- User interactions
- State management

Integration Tests:
- Full workflows
- API integration
- Error scenarios

E2E Tests:
- Critical flows
- Cross-browser
- Performance metrics

Accessibility Tests:
- Color contrast
- Keyboard navigation
- Screen reader compatibility
```

---

## 📊 MÉTRICAS DE ÉXITO

```
Usabilidad:
- Task completion rate: > 95%
- Time to complete quote: < 5 min
- Error rate: < 3%
- User satisfaction: > 4/5

Performance:
- First Paint: < 2.5s
- Interaction Ready: < 3.5s
- All interactions: < 500ms

Accessibility:
- WCAG 2.1 AA: 100%
- Keyboard navigation: 100%
- Screen reader tested: ✓

User Adoption:
- DAU/MAU ratio: > 70%
- Feature usage: > 80%
- Support tickets: < 2/week
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Fase 1: Foundation (Week 1-2)
- [ ] Design tokens CSS
- [ ] Atomic components
- [ ] Layout templates
- [ ] Basic routing

### Fase 2: Core Features (Week 3-4)
- [ ] Auth pages
- [ ] Dashboard
- [ ] Quote editor
- [ ] Client management

### Fase 3: Polish (Week 5-6)
- [ ] Animations
- [ ] Error handling
- [ ] Loading states
- [ ] Notifications

### Fase 4: Optimization (Week 7-8)
- [ ] Performance tuning
- [ ] Accessibility audit
- [ ] E2E testing
- [ ] Production build

---

## 📚 DOCUMENTACIÓN REQUERIDA

```
✓ Component Library (Storybook-style)
✓ Design Token Reference
✓ Color Palette Guide
✓ Typography Scale
✓ Spacing System
✓ Keyboard Shortcuts
✓ Accessibility Checklist
✓ Performance Budget
✓ Code Style Guide
✓ Git Workflow
```

---

**Principio Fundamental:**  
*"La mejor interfaz es la que el usuario no necesita pensar. Debe ser tan natural como el aire que respira."*

—Senior UX/UI Architect, May 2026
