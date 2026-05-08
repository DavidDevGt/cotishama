# COTISHAMA 2.0 - ESTRUCTURA DE MONOREPO (BUN + HONOJO)

## 📁 Estrategia de Directorios

Una estructura **monorepo integrado** que permite desarrollo unificado sin necesidad de múltiples package.json. Bun maneja todo de forma nativa.

```
cotishama-v2/
│
├── 📦 Raíz del Proyecto
│   ├── bunfig.toml                    # Configuración de Bun
│   ├── tsconfig.json                  # TypeScript config (compartido)
│   ├── biome.json                     # Code formatter & linter
│   ├── package.json                   # Monorepo root + shared deps
│   ├── bun.lock                       # Lock file (Bun)
│   ├── .env.example                   # Ejemplo de variables
│   ├── Dockerfile                     # Single Docker image
│   ├── docker-compose.yml             # Dev environment
│   ├── Makefile                       # Task runner
│   └── .github/workflows/
│       ├── test.yml                   # Unit + Integration tests
│       ├── build.yml                  # Build & push Docker
│       ├── deploy-staging.yml         # Deploy a staging
│       └── deploy-production.yml      # Deploy a producción
│
├── 📂 /apps
│   │
│   ├── /backend                       # ← HonoJS + TypeScript
│   │   ├── src/
│   │   │   ├── index.ts               # Entry point (Hono app)
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── env.ts             # Validación de variables env
│   │   │   │   ├── database.ts        # Pool de PostgreSQL
│   │   │   │   └── constants.ts       # Constantes globales
│   │   │   │
│   │   │   ├── db/
│   │   │   │   ├── schema.ts          # Tipos SQL generados (sqlc)
│   │   │   │   ├── migrations/
│   │   │   │   │   ├── 001_init.sql
│   │   │   │   │   ├── 002_indices.sql
│   │   │   │   │   └── 003_triggers.sql
│   │   │   │   ├── client.ts          # SQL queries typed
│   │   │   │   └── seeders/
│   │   │   │       └── seed.ts        # Datos iniciales
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts            # JWT validation
│   │   │   │   ├── cors.ts            # CORS headers
│   │   │   │   ├── rateLimit.ts       # Rate limiting
│   │   │   │   ├── logger.ts          # Structured logging
│   │   │   │   ├── errorHandler.ts    # Error handling
│   │   │   │   └── requestId.ts       # Request ID tracking
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── api.ts             # API request/response types
│   │   │   │   ├── domain.ts          # Domain entities
│   │   │   │   ├── errors.ts          # Error types
│   │   │   │   └── index.ts           # Export all types
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── jwt.ts             # JWT creation/validation
│   │   │   │   ├── password.ts        # bcrypt hashing
│   │   │   │   ├── validator.ts       # Input validation (Zod)
│   │   │   │   ├── response.ts        # Standardized responses
│   │   │   │   └── logger.ts          # Winston logger
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts    # Login, refresh, logout
│   │   │   │   ├── quote.service.ts   # Lógica de cotizaciones
│   │   │   │   ├── client.service.ts  # Gestión de clientes
│   │   │   │   ├── product.service.ts # Catálogo de productos
│   │   │   │   ├── pdf.service.ts     # Generación de PDFs
│   │   │   │   └── report.service.ts  # Reportes y analytics
│   │   │   │
│   │   │   ├── repository/
│   │   │   │   ├── quote.repo.ts      # Data access for quotes
│   │   │   │   ├── client.repo.ts     # Data access for clients
│   │   │   │   ├── product.repo.ts    # Data access for products
│   │   │   │   ├── user.repo.ts       # Data access for users
│   │   │   │   ├── transaction.ts     # Transaction manager
│   │   │   │   └── base.repo.ts       # Base repository class
│   │   │   │
│   │   │   ├── handlers/
│   │   │   │   ├── auth.handler.ts    # /auth endpoints
│   │   │   │   ├── quote.handler.ts   # /quotes endpoints
│   │   │   │   ├── client.handler.ts  # /clients endpoints
│   │   │   │   ├── product.handler.ts # /products endpoints
│   │   │   │   └── report.handler.ts  # /reports endpoints
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts     # Auth route group
│   │   │   │   ├── quote.routes.ts    # Quote route group
│   │   │   │   ├── client.routes.ts   # Client route group
│   │   │   │   ├── product.routes.ts  # Product route group
│   │   │   │   ├── report.routes.ts   # Report route group
│   │   │   │   └── index.ts           # Consolidate all routes
│   │   │   │
│   │   │   └── pdf/
│   │   │       ├── template.html      # HTML template para PDF
│   │   │       └── generator.ts       # Puppeteer/wkhtmltopdf wrapper
│   │   │
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   │   ├── services/          # Unit tests de servicios
│   │   │   │   └── utils/             # Unit tests de utilidades
│   │   │   ├── integration/
│   │   │   │   ├── auth.integration.test.ts
│   │   │   │   ├── quote.integration.test.ts
│   │   │   │   └── db.integration.test.ts
│   │   │   └── fixtures/
│   │   │       └── test-data.ts       # Seed data for tests
│   │   │
│   │   ├── Dockerfile
│   │   ├── package.json               # Backend-specific deps
│   │   └── tsconfig.json              # Backend TypeScript config
│   │
│   └── /frontend                      # ← HTML5 + Vanilla JS
│       ├── public/
│       │   ├── index.html             # Entry point HTML
│       │   ├── favicon.ico
│       │   └── assets/
│       │       ├── css/
│       │       │   ├── reset.css      # Reset/normalize
│       │       │   ├── typography.css # Tipografía base
│       │       │   ├── layout.css     # Grid/flexbox
│       │       │   ├── components.css # Estilos de componentes
│       │       │   ├── utilities.css  # Clases auxiliares
│       │       │   └── theme.css      # Variables CSS (dark mode)
│       │       │
│       │       ├── img/
│       │       │   ├── logo.svg
│       │       │   └── icons/         # Icon spritesheet
│       │       │
│       │       └── fonts/
│       │           └── Inter/         # Self-hosted font
│       │
│       ├── src/
│       │   ├── index.js               # Bootstrap app
│       │   │
│       │   ├── app.js                 # Main app controller
│       │   │
│       │   ├── core/
│       │   │   ├── api-client.js      # HTTP client (fetch wrapper)
│       │   │   ├── state.js           # Global state manager
│       │   │   ├── router.js          # Client-side routing
│       │   │   ├── storage.js         # LocalStorage wrapper
│       │   │   └── config.js          # Frontend config
│       │   │
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── login.module.js
│       │   │   │   ├── logout.module.js
│       │   │   │   └── auth.service.js
│       │   │   │
│       │   │   ├── quotes/
│       │   │   │   ├── list.module.js       # Quote list page
│       │   │   │   ├── create.module.js     # Create new quote
│       │   │   │   ├── detail.module.js     # View quote details
│       │   │   │   ├── quote.service.js
│       │   │   │   └── quote.validator.js
│       │   │   │
│       │   │   ├── clients/
│       │   │   │   ├── list.module.js
│       │   │   │   ├── form.module.js
│       │   │   │   ├── client.service.js
│       │   │   │   └── client.validator.js
│       │   │   │
│       │   │   ├── products/
│       │   │   │   ├── catalog.module.js
│       │   │   │   ├── autocomplete.module.js
│       │   │   │   └── product.service.js
│       │   │   │
│       │   │   ├── reports/
│       │   │   │   ├── dashboard.module.js
│       │   │   │   ├── export.module.js
│       │   │   │   └── report.service.js
│       │   │   │
│       │   │   └── common/
│       │   │       ├── header.component.js
│       │   │       ├── sidebar.component.js
│       │   │       ├── modal.component.js
│       │   │       └── table.component.js
│       │   │
│       │   ├── components/
│       │   │   ├── form-group/
│       │   │   │   ├── input.component.js
│       │   │   │   ├── select.component.js
│       │   │   │   ├── checkbox.component.js
│       │   │   │   └── form-group.css
│       │   │   │
│       │   │   ├── table/
│       │   │   │   ├── table.component.js
│       │   │   │   ├── pagination.component.js
│       │   │   │   └── table.css
│       │   │   │
│       │   │   ├── card/
│       │   │   │   ├── card.component.js
│       │   │   │   └── card.css
│       │   │   │
│       │   │   ├── button/
│       │   │   │   ├── button.component.js
│       │   │   │   └── button.css
│       │   │   │
│       │   │   ├── modal/
│       │   │   │   ├── modal.component.js
│       │   │   │   ├── modal.css
│       │   │   │   └── confirm-dialog.js
│       │   │   │
│       │   │   ├── notification/
│       │   │   │   ├── toast.component.js
│       │   │   │   └── toast.css
│       │   │   │
│       │   │   └── loading/
│       │   │       ├── spinner.component.js
│       │   │       └── spinner.css
│       │   │
│       │   ├── lib/
│       │   │   ├── sanitizer.js       # DOMPurify integration
│       │   │   ├── validator.js       # Data validation (ajv)
│       │   │   ├── formatter.js       # Format currency, dates
│       │   │   ├── storage.js         # IndexedDB/localStorage wrapper
│       │   │   ├── crypto.js          # TweetNaCl.js wrapper
│       │   │   └── logger.js          # Client-side logging
│       │   │
│       │   ├── styles/
│       │   │   ├── variables.css      # CSS custom properties
│       │   │   ├── global.css         # Global styles
│       │   │   ├── responsive.css     # Breakpoints
│       │   │   └── animations.css     # Keyframes
│       │   │
│       │   ├── templates/
│       │   │   ├── quote.template.html     # Quote table HTML
│       │   │   ├── quote-form.template.html
│       │   │   ├── client-list.template.html
│       │   │   └── report.template.html
│       │   │
│       │   └── utils/
│       │       ├── dom.js             # DOM manipulation helpers
│       │       ├── event.js           # Event handling
│       │       ├── http.js            # HTTP utilities
│       │       ├── date.js            # Date utilities
│       │       └── string.js          # String utilities
│       │
│       ├── tests/
│       │   ├── unit/
│       │   │   ├── lib/               # Test para librerías
│       │   │   └── utils/             # Test para utilidades
│       │   └── e2e/                   # Playwright tests
│       │       ├── login.e2e.test.js
│       │       ├── quote-creation.e2e.test.js
│       │       └── utils.e2e.js
│       │
│       ├── package.json               # Frontend-specific deps
│       └── tsconfig.json              # Frontend TypeScript config (if used)
│
├── 📂 /docs
│   ├── ARCHITECTURE.md                # Este documento
│   ├── API_SPEC.md                    # OpenAPI/Swagger
│   ├── DATABASE.md                    # Schema documentation
│   ├── DEPLOYMENT.md                  # DevOps & deployment
│   ├── SECURITY.md                    # Security best practices
│   └── DEVELOPMENT.md                 # Setup local development
│
├── 📂 /infra
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── Dockerfile.nginx
│   │
│   ├── kubernetes/
│   │   ├── namespace.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── postgres-statefulset.yaml
│   │   └── ingress.yaml
│   │
│   └── terraform/
│       ├── provider.tf
│       ├── vpc.tf
│       ├── rds.tf
│       └── kubernetes.tf
│
├── README.md                          # Resumen del proyecto
└── .gitignore
```

---

## 🏗️ Estrategia de Directorios - Explicación

### **Monorepo Design Rationale**

```
VENTAJAS:
✓ Desarrollo unificado (backend + frontend en el mismo repo)
✓ Sincronización automática de cambios entre capas
✓ Bun workspace management (un solo node_modules)
✓ CI/CD simplificado (un solo pipeline)
✓ Versionado atómico (cambios coordenados)
✓ Fácil refactoring (renaming cross-layer)
✓ Shared types (TypeScript types entre backend y frontend)

DESVENTAJAS (y cómo mitigarlas):
✗ Tamaño del repo → .gitignore agresivo
✗ Complejidad de build → Makefile y scripts
✗ Múltiples lenguajes → Monorepo management via Bun
```

### **Separación Backend vs Frontend**

```
/apps/backend
├─ 100% TypeScript
├─ Modules de negocio
├─ Acceso a BD directo
├─ Puede correr en servidor
└─ NO debe tocar DOM

/apps/frontend
├─ HTML5 + Vanilla JS
├─ Módulos de UI/UX
├─ Acceso solo vía API
├─ Corre en navegador
└─ NO puede tocar BD directamente
```

### **Convenciones de Nomenclatura**

```
Backend:
├─ Archivos: camelCase.ts
├─ Clases: PascalCase
├─ Funciones: camelCase
├─ Rutas: /api/v1/resource
└─ Métodos HTTP: RESTful

Frontend:
├─ Archivos: camelCase.js o kebab-case.module.js
├─ Clases: PascalCase (si hay)
├─ Funciones: camelCase
├─ IDs HTML: kebab-case
└─ Atributos data: data-kebab-case
```

---

## 🔧 Configuración de Root

### **bunfig.toml**

Configuración centralizada de Bun:

```toml
[build]
entrypoints = [
  "apps/backend/src/index.ts",
  "apps/frontend/src/index.js"
]
outdir = "dist"

[bun]
jsx = "automatic"
preset = "bun"

[env]
FILES = "src,tests"

[dev]
reload = true
watch = true
hot = true

[[dependencies]]
alias = "@backend/*" = "apps/backend/src"
alias = "@frontend/*" = "apps/frontend/src"
alias = "@shared/*" = "packages/shared/src"
```

### **package.json Root**

Workspace configuration:

```json
{
  "name": "cotishama-v2",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "bun run dev:backend & bun run dev:frontend",
    "dev:backend": "cd apps/backend && bun --hot src/index.ts",
    "dev:frontend": "cd apps/frontend && bun run dev",
    "build": "bun run build:backend && bun run build:frontend",
    "test": "bun test",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@biomejs/biome": "^1.5.0"
  }
}
```

---

## 📊 Estructura de Datos Compartidos

Para evitar duplicación entre backend y frontend:

```
/packages/shared/
├── src/
│   ├── types/
│   │   ├── api.ts           # Request/Response types
│   │   ├── domain.ts        # Entities
│   │   └── errors.ts        # Error codes
│   │
│   ├── constants/
│   │   ├── http-status.ts
│   │   ├── error-codes.ts
│   │   ├── quote-status.ts
│   │   └── endpoints.ts     # API routes
│   │
│   └── validators/
│       ├── schemas.ts       # Zod schemas compartidos
│       └── index.ts
```

**Ambas capas importan de `@shared/*` sin duplicación.**

---

## 🔄 Flujo de Desarrollo

### **Setup Inicial**

```bash
# 1. Clone repo
git clone <url> cotishama-v2
cd cotishama-v2

# 2. Install deps (Bun las maneja)
bun install

# 3. Copy env
cp .env.example .env.local

# 4. Setup DB
bun run db:migrate
bun run db:seed

# 5. Start dev
bun run dev
```

### **Durante Desarrollo**

```
┌─────────────────────┐
│  Cambio en backend  │
├─────────────────────┤
│ 1. Edit TypeScript  │
│ 2. Hot-reload Bun  │
│ 3. Backend activo  │
│ 4. Frontend refetch│
└─────────────────────┘

┌─────────────────────┐
│ Cambio en frontend  │
├─────────────────────┤
│ 1. Edit HTML/JS    │
│ 2. Browser reload  │
│ 3. State preservado│
└─────────────────────┘
```

---

## 📦 Dependencies Management

### **Backend Dependencies (Bun)**

Mínimas, focadas en performance:

```
Runtime:
├─ bun (runtime itself)

Web Framework:
├─ hono/core
├─ hono/middleware
└─ hono/validator

Database:
├─ postgres (PostgreSQL client for Bun)
├─ drizzle-orm (query builder, type-safe)
└─ drizzle-kit (migrations)

Security:
├─ @hapi/bcrypt
├─ jsonwebtoken
├─ helmet (HTTP headers)
└─ rate-limiter-flexible

Validation:
├─ zod (TypeScript schemas)
└─ zod-to-json-schema

Utilities:
├─ pino (structured logging)
├─ pino-http
└─ date-fns

PDF Generation:
├─ puppeteer-core (headless browser)
└─ html5-to-pdf (alternative)

Testing:
├─ bun:test (built-in)
├─ @testing-library/dom
└─ node-postgres (for test setup)
```

### **Frontend Dependencies**

Extremadamente selectivas (goal: < 50KB gzip):

```
Security & Input Handling:
├─ dompurify          (5KB) - DOM sanitization
├─ ajv                (8KB) - JSON Schema validation
└─ tweetnacl.js       (16KB) - Encryption (if needed)

Date/Time:
├─ date-fns           (13KB) - Date utilities
│  OR
├─ dayjs              (2KB) - Lightweight alternative
└─ timezone library if needed

HTTP:
├─ (None) - Fetch API is native

State Management:
├─ (Custom) - Event emitter + localStorage

UI Components:
├─ (Custom) - Web components + CSS
└─ popper.js          (3KB) - Tooltips/dropdowns (optional)

Testing:
├─ playwright         (for E2E)
└─ @testing-library/dom

Development:
├─ postcss            (CSS processing)
├─ autoprefixer       (Browser prefixes)
└─ cssnano            (CSS minification)
```

**Total Frontend Bundle (production):** ~45KB gzip

---

## 🎯 Principios de Organización

### **Separación de Responsabilidades**

```
┌─────────────────────────────────────────────────┐
│  BACKEND (Node.js/Bun/HonoJS)                  │
├─────────────────────────────────────────────────┤
│ ✓ Lógica de negocio                            │
│ ✓ Acceso a base de datos                       │
│ ✓ Validaciones complejas                       │
│ ✓ Generación de PDFs                           │
│ ✓ Autenticación y tokens                       │
│ ✓ Auditoría y logs                             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  FRONTEND (Vanilla JS)                         │
├─────────────────────────────────────────────────┤
│ ✓ Presentación visual                          │
│ ✓ Interacción del usuario                      │
│ ✓ Validaciones de entrada (client-side)        │
│ ✓ Gestión de estado local                      │
│ ✓ Caching en localStorage                      │
│ ✓ Notificaciones visuales                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  SHARED (@shared/types, @shared/validators)    │
├─────────────────────────────────────────────────┤
│ ✓ Type definitions                             │
│ ✓ API contracts                                │
│ ✓ Validation schemas (Zod)                     │
│ ✓ Constants                                    │
│ ✓ Error codes                                  │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Comandos de Desarrollo

### **Makefile (Root)**

```makefile
# Installation & Setup
.PHONY: install
install:
	bun install
	make db:setup

# Development
.PHONY: dev
dev:
	bun run dev

.PHONY: dev:backend
dev:backend:
	cd apps/backend && bun --hot src/index.ts

.PHONY: dev:frontend
dev:frontend:
	cd apps/frontend && bun run dev

# Database
.PHONY: db:setup
db:setup:
	bun run db:migrate
	bun run db:seed

.PHONY: db:migrate
db:migrate:
	cd apps/backend && bun run drizzle-kit push:pg

.PHONY: db:fresh
db:fresh:
	cd apps/backend && bun run drizzle-kit reset:pg

# Testing
.PHONY: test
test:
	bun test

.PHONY: test:watch
test:watch:
	bun test --watch

.PHONY: test:coverage
test:coverage:
	bun test --coverage

# Linting & Formatting
.PHONY: lint
lint:
	biome lint .

.PHONY: format
format:
	biome format --write .

.PHONY: type-check
type-check:
	tsc --noEmit

# Building
.PHONY: build
build:
	bun run build

.PHONY: build:docker
build:docker:
	docker build -t cotishama:latest .

# Docker
.PHONY: up
up:
	docker-compose up -d

.PHONY: down
down:
	docker-compose down

.PHONY: logs
logs:
	docker-compose logs -f
```

---

## 📋 Organización por Features (Modules)

### **Estructura de un Feature Completo**

```
apps/backend/src/modules/quotes/
├── quotes.handler.ts        # Request handlers
├── quotes.service.ts        # Business logic
├── quotes.repository.ts     # Data access
├── quotes.routes.ts         # Route definitions
├── quotes.types.ts          # Types for this module
└── quotes.test.ts           # Tests

apps/frontend/src/modules/quotes/
├── list.module.js           # List page
├── create.module.js         # Create page
├── detail.module.js         # Detail page
├── quote.service.js         # API calls
├── quote.validator.js       # Input validation
├── quote.template.html      # HTML template
└── quotes.css               # Styling
```

**Cada módulo es autocontido pero comparte interfaces desde `@shared/`**

---

## ✅ Checklist de Estructura

```
BACKEND:
□ Separación clara de handlers → services → repositories
□ Tipos compartidos desde @shared/
□ Middleware de seguridad centralizado
□ Error handling consistente
□ Tests para cada layer

FRONTEND:
□ Módulos independientes por feature
□ Templates HTML en archivos separados
□ CSS modular y componentes reutilizables
□ State management sin dependencias externas
□ Validación antes de enviar al API

SHARED:
□ Tipos de API request/response
□ Validation schemas (Zod)
□ Error codes y constants
□ Endpoints mapping

DEVOPS:
□ Docker con multi-stage build
□ docker-compose para dev
□ CI/CD pipelines en .github/workflows/
□ Environment configuration vía .env
```

---

**Próximas secciones:**
- BACKEND_ARCHITECTURE.md (HonoJS patterns)
- FRONTEND_ARCHITECTURE.md (Vanilla JS patterns)
- DATABASE_SCHEMA.md (DER detallado)
