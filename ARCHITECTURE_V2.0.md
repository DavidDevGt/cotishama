# COTISHAMA 2.0 - ARQUITECTURA TÉCNICA DE PRODUCCIÓN

**Documento de Arquitectura Ejecutivo**  
**Status**: Diseño de Fase 1  
**Fecha**: Mayo 2026  
**Responsable**: Tech Lead / Arquitecto Senior

---

## 📋 ÍNDICE
1. [Visión General](#visión-general)
2. [Decisiones Arquitectónicas](#decisiones-arquitectónicas)
3. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
4. [Modelo de Datos (DER)](#modelo-de-datos-der)
5. [Diseño de API REST](#diseño-de-api-rest)
6. [Estrategia de Migración](#estrategia-de-migración)
7. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
8. [Plan de Escalabilidad](#plan-de-escalabilidad)
9. [Roadmap Futuro](#roadmap-futuro)

---

## 1. VISIÓN GENERAL

### Contexto Actual
- Cotishama 1.0: Herramienta frontend pura, estado en memoria, exportación a PNG
- Limitaciones: No persistencia, no autenticación, no multi-usuario, no auditoría

### Objetivo de 2.0
Transformar a un **Sistema Enterprise-Grade** con:
- ✅ Persistencia real en PostgreSQL
- ✅ API REST escalable y versionada
- ✅ Autenticación y autorización
- ✅ Generación de PDFs desde backend
- ✅ Historial completo de cotizaciones
- ✅ Gestión de inventario
- ✅ Métricas y reportes
- ✅ Arquitectura preparada para microservicios futuros

### Principios de Diseño
- **SOLID**: Aplicar en todas las capas
- **DDD**: Domain-Driven Design para el negocio
- **12FA**: Aplicación 12-factor compatible
- **ACID**: Transacciones garantizadas
- **Stateless**: API sin estado de sesión

---

## 2. DECISIONES ARQUITECTÓNICAS

### 2.1 Selección del Backend: **GO (Golang)**

#### ¿Por qué Go?
| Criterio | Go | FastAPI | Bun |
|----------|----|---------|----|
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Concurrencia** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Compilado** | ✅ Binary único | ❌ Runtime Python | ✅ Binary único |
| **Startup** | <100ms | 500ms+ | <100ms |
| **Memory** | ~15MB | ~100MB | ~50MB |
| **DevOps** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Curva Aprendizaje** | Medio | Bajo | Bajo |
| **Madurez** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

#### Recomendación Final: **GO**
- Razón 1: Para cotizaciones + PDF generadas en paralelo, goroutines es ideal
- Razón 2: Un único binario en Docker es más fácil de desplegar
- Razón 3: Performance bajo carga crítico para generación de PDFs
- Razón 4: Comunidad más madura para backend financiero/transaccional

#### Stack Go Propuesto
```
Framework Web:      Gin (o Echo si prefieres alternativa)
ORM:                sqlc (type-safe SQL) o Gorm (conveniencia)
Validación:         Playground Validator
PDF Generation:     wkhtmltopdf (renderizado HTML→PDF) o go-echarts
JSON Web Tokens:    jwt-go o jose
Base Datos:         PostgreSQL (driver: pq)
Migrations:         golang-migrate
Logging:            Zap (structured logging)
Testing:            testify, httptest
CI/CD:              GitHub Actions
Containerización:   Docker + docker-compose
```

### 2.2 Base de Datos: PostgreSQL (Obligatorio)
- Versión mínima: 14
- Extensiones necesarias: `uuid-ossp`, `pgcrypto`
- Replicación futura: Preparada para WAL archiving

### 2.3 Frontend (Evolución de 1.0)
- Mantener Vanilla JS (sin React/Vue de momento)
- Pasar a consumir API REST
- SPA mejorado con routing client-side
- Módulos ES6 expandidos
- State management con event emitters

### 2.4 Infraestructura
```
Producción:
├── Docker + Docker Compose (Dev/Staging)
├── Kubernetes (Escalabilidad futura)
├── PostgreSQL con backup automático
├── Nginx como reverse proxy
└── CloudStorage para archivos (PDFs, anexos)
```

---

## 3. ARQUITECTURA DE ALTO NIVEL

### 3.1 Diagrama de Capas (3-Tier Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTACIÓN                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Frontend SPA (Vanilla JS / HTML5)               │   │
│  │  ├─ Páginas: Dashboard, Cotizaciones, Clientes  │   │
│  │  ├─ Componentes: Formularios, Tablas, Reportes │   │
│  │  └─ State: Redux-like o MobX emitter            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────┬──────────────────────────────────────┘
                  │ HTTP/REST (JSON)
                  ↓
┌─────────────────────────────────────────────────────────┐
│                   APLICACIÓN (API)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Gateway (Gin/Echo + Middleware)             │   │
│  │  ├─ Auth Middleware (JWT)                        │   │
│  │  ├─ Rate Limiting                                │   │
│  │  ├─ CORS Management                              │   │
│  │  └─ Request/Response Logging                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Servicios de Negocio (Domain Logic)             │   │
│  │  ├─ QuoteService                                 │   │
│  │  ├─ ClientService                                │   │
│  │  ├─ ProductService                               │   │
│  │  ├─ PdfGenerationService                         │   │
│  │  └─ ReportingService                             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Repositorio / Data Access Layer (DAO)           │   │
│  │  ├─ QuoteRepository                              │   │
│  │  ├─ ClientRepository                             │   │
│  │  ├─ ProductRepository                            │   │
│  │  └─ Transacciones ACID                           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────┬──────────────────────────────────────┘
                  │ SQL (pq driver)
                  ↓
┌─────────────────────────────────────────────────────────┐
│                   DATOS (PostgreSQL)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ├─ Tablas Transaccionales                       │   │
│  │  ├─ Índices Optimizados                          │   │
│  │  ├─ Triggers para Auditoría                      │   │
│  │  ├─ Funciones PL/pgSQL                           │   │
│  │  └─ Backups automáticos                          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Datos: Crear Cotización

```
1. Usuario rellena formulario frontend
   ↓
2. Frontend valida (client-side)
   ↓
3. POST /api/v1/quotes (JSON payload)
   ↓
4. API Gateway valida autenticación (JWT)
   ↓
5. Handler recibe datos
   ↓
6. QuoteService procesa:
   ├─ Valida reglas de negocio
   ├─ Calcula totales
   ├─ Verifica stock de productos
   └─ Prepara datos transaccionales
   ↓
7. Transaction inicio
   ├─ QuoteRepository.Create() → INSERT
   ├─ QuoteDetailRepository.CreateBatch() → INSERT
   └─ InventoryRepository.ReserveStock() → UPDATE
   ↓
8. Transaction commit (ACID garantizado)
   ↓
9. Response 201 Created con Quote ID
   ↓
10. Frontend recibe y actualiza UI
```

### 3.3 Flujo Adicional: Generar PDF

```
1. Usuario hace click "Descargar PDF"
   ↓
2. GET /api/v1/quotes/{id}/pdf
   ↓
3. QuoteService.GetById() (de BD)
   ↓
4. PdfGenerationService.Generate():
   ├─ Obtiene datos de cotización
   ├─ Renderiza HTML template
   ├─ wkhtmltopdf convierte a PDF
   └─ Guarda en /tmp o S3
   ↓
5. Response: Binary PDF (Content-Type: application/pdf)
   ↓
6. Navegador descarga automáticamente
```

---

## 4. MODELO DE DATOS (DER)

### 4.1 Diagrama de Entidades

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MODELO DE DATOS - COTISHAMA 2.0                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│      USERS           │
│──────────────────────│
│ id (PK) [UUID]       │
│ email [UNIQUE]       │
│ password_hash        │
│ full_name            │
│ role (admin/op.)     │
│ is_active            │
│ last_login           │
│ created_at           │
│ updated_at           │
└──────────────────────┘
         │
         │ 1:N
         ├──────────────────────────────┐
         │                              │
         ↓                              ↓
┌──────────────────────┐      ┌──────────────────────┐
│     CLIENTS          │      │    QUOTES            │
│──────────────────────│      │──────────────────────│
│ id (PK) [UUID]       │◄─────│ id (PK) [UUID]       │
│ business_name        │  1:N │ client_id (FK)       │
│ contact_name         │      │ user_id (FK)         │
│ email                │      │ status (enum)        │
│ phone                │      │ subtotal (DECIMAL)   │
│ address              │      │ tax (DECIMAL)        │
│ city                 │      │ total (DECIMAL)      │
│ tax_id               │      │ notes                │
│ credit_limit         │      │ valid_until          │
│ is_active            │      │ approved_at          │
│ created_at           │      │ created_at           │
│ updated_at           │      │ updated_at           │
└──────────────────────┘      └──────────────────────┘
                                       │
                                       │ 1:N
                                       ↓
                              ┌──────────────────────┐
                              │  QUOTE_DETAILS       │
                              │──────────────────────│
                              │ id (PK) [UUID]       │
                              │ quote_id (FK)        │
                              │ product_id (FK)      │
                              │ quantity             │
                              │ unit_price (DECIMAL) │
                              │ subtotal (DECIMAL)   │
                              │ line_number          │
                              └──────────────────────┘
                                       │
                                       │ N:1
                                       ↓
                              ┌──────────────────────┐
                              │    PRODUCTS          │
                              │──────────────────────│
                              │ id (PK) [UUID]       │
                              │ sku [UNIQUE]         │
                              │ name                 │
                              │ description          │
                              │ category             │
                              │ unit_price (DECIMAL) │
                              │ stock_quantity       │
                              │ min_stock            │
                              │ is_active            │
                              │ created_at           │
                              │ updated_at           │
                              └──────────────────────┘

┌──────────────────────┐
│ QUOTE_HISTORY        │
│──────────────────────│
│ id (PK) [UUID]       │
│ quote_id (FK)        │
│ old_status           │
│ new_status           │
│ changed_by (FK User) │
│ reason               │
│ changed_at           │
└──────────────────────┘

┌──────────────────────┐
│ AUDIT_LOG            │
│──────────────────────│
│ id (PK) [BIGINT]     │
│ table_name           │
│ record_id            │
│ action (CRUD)        │
│ old_values (JSON)    │
│ new_values (JSON)    │
│ user_id (FK)         │
│ timestamp            │
└──────────────────────┘
```

### 4.2 Definición Detallada de Tablas

#### **Tabla: `users`**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM ('admin', 'operator', 'viewer') DEFAULT 'operator',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
```

#### **Tabla: `clients`**
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    tax_id VARCHAR(50) UNIQUE,
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    total_quoted DECIMAL(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_business_name ON clients(business_name);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_is_active ON clients(is_active);
```

#### **Tabla: `products`**
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(12, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_price CHECK (unit_price > 0),
    CONSTRAINT valid_stock CHECK (stock_quantity >= 0)
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
```

#### **Tabla: `quotes`**
```sql
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,  -- CZ-2026-000001
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'cancelled', 'expired')),
    
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) DEFAULT 0,
    
    tax_percentage DECIMAL(5, 2) DEFAULT 12,  -- Para Guatemala (IVA 12%)
    notes TEXT,
    valid_until DATE,
    
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    sent_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_total CHECK (total >= 0)
);

CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
```

#### **Tabla: `quote_details`**
```sql
CREATE TABLE quote_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    line_number INTEGER NOT NULL,  -- Orden en la cotización
    product_name_snapshot VARCHAR(255),  -- Para auditoría
    
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    CONSTRAINT valid_price CHECK (unit_price > 0)
);

CREATE INDEX idx_quote_details_quote_id ON quote_details(quote_id);
CREATE INDEX idx_quote_details_product_id ON quote_details(product_id);
```

#### **Tabla: `quote_history`** (Auditoría)
```sql
CREATE TABLE quote_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quote_history_quote_id ON quote_history(quote_id);
CREATE INDEX idx_quote_history_changed_at ON quote_history(changed_at);
```

#### **Tabla: `audit_log`** (Auditoría General)
```sql
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET
);

CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
```

### 4.3 Relaciones Clave

| Relación | Cardinalidad | Integridad | Notas |
|----------|-------------|-----------|-------|
| Users → Quotes | 1:N | FK + Cascade | Usuario crea múltiples cotizaciones |
| Clients → Quotes | 1:N | FK + Restrict | Coti. depende del cliente |
| Quotes → QuoteDetails | 1:N | FK + Cascade | Detalles se borran con coti. |
| Products → QuoteDetails | 1:N | FK + Restrict | No borrar producto en uso |
| Quotes → QuoteHistory | 1:N | FK + Cascade | Historial vinculado a coti. |

---

## 5. DISEÑO DE API REST

### 5.1 Estándar REST de Cotishama

#### Convenciones
```
Versión:        /api/v1/
Recursos:       Sustantivos plurales (quotes, clients, products)
Métodos:        GET, POST, PUT/PATCH, DELETE
Responses:      JSON con estructura estandarizada
Autenticación:  JWT en header Authorization: Bearer {token}
Paginación:     ?page=1&limit=50&sort=created_at:desc
Filtros:        ?status=approved&client_id=xxx
Rate Limit:     X-RateLimit-Limit, X-RateLimit-Remaining headers
```

#### Estructura de Response

**Success (2xx)**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Operación exitosa",
  "data": { /* payload */ },
  "metadata": {
    "timestamp": "2026-05-08T14:30:00Z",
    "request_id": "req_abc123xyz",
    "version": "v1"
  }
}
```

**Error (4xx, 5xx)**
```json
{
  "success": false,
  "status_code": 400,
  "error": "INVALID_INPUT",
  "message": "El campo 'cantidad' es requerido",
  "details": {
    "field": "cantidad",
    "constraint": "required"
  },
  "metadata": {
    "timestamp": "2026-05-08T14:30:00Z",
    "request_id": "req_abc123xyz"
  }
}
```

### 5.2 Endpoints por Recurso

#### **🔐 Authentication**

```
POST /api/v1/auth/login
├─ Request:  { email, password }
├─ Response: 200 { access_token, refresh_token, user }
├─ Errors:   401 Unauthorized, 429 Too Many Attempts
└─ Rate:     5 intentos / 15 minutos

POST /api/v1/auth/refresh
├─ Request:  { refresh_token }
├─ Response: 200 { access_token }
└─ Errors:   401 Invalid token

POST /api/v1/auth/logout
├─ Headers:  Authorization: Bearer {token}
├─ Response: 200 { message: "Logged out" }
└─ Action:   Invalidar token en blacklist (Redis)
```

#### **📄 Quotes (Cotizaciones)**

```
GET /api/v1/quotes
├─ Headers:  Authorization: Bearer {token}
├─ Query:    ?page=1&limit=50&status=draft&client_id=xxx&sort=created_at:desc
├─ Response: 200 { data: [...], pagination: { page, limit, total, pages } }
└─ Perms:    Listar propias (operator) o todas (admin)

GET /api/v1/quotes/{id}
├─ Headers:  Authorization: Bearer {token}
├─ Response: 200 { id, quote_number, client, products[], total, status... }
├─ Errors:   404 Not Found, 403 Forbidden
└─ Perms:    Ver propias o ser admin

POST /api/v1/quotes
├─ Headers:  Authorization: Bearer {token}
├─ Payload:  {
│     client_id: UUID,
│     notes?: string,
│     valid_until?: date,
│     details: [
│       { product_id: UUID, quantity: int },
│       { product_id: UUID, quantity: int }
│     ]
│   }
├─ Response: 201 Created { id, quote_number, status: 'draft', ... }
├─ Validations:
│   ├─ Cliente debe existir y estar activo
│   ├─ Productos deben existir y estar activos
│   ├─ Cantidades > 0
│   └─ Verificar stock (warning si es bajo)
└─ Transaction: INSERT quote + INSERT quote_details (atomic)

PUT /api/v1/quotes/{id}
├─ Headers:  Authorization: Bearer {token}
├─ Payload:  { notes?, valid_until?, status? (solo admin) }
├─ Response: 200 { ... (quote actualizado) }
├─ Errors:   400 Invalid status transition, 403 Permission denied
└─ Validations:
    ├─ Solo owner o admin pueden editar
    ├─ No editar si status != 'draft'
    └─ Estado debe ser válido

PATCH /api/v1/quotes/{id}/status
├─ Headers:  Authorization: Bearer {token}
├─ Payload:  { new_status: 'sent'|'approved'|'rejected'|'cancelled' }
├─ Response: 200 { status, updated_at, history_entry }
├─ Transitions:
│   draft  → sent, cancelled
│   sent   → approved, rejected, cancelled
│   approved, rejected, cancelled → (final, no cambios)
└─ Action:  Crear entrada en quote_history

DELETE /api/v1/quotes/{id}
├─ Headers:  Authorization: Bearer {token}
├─ Response: 204 No Content
├─ Errors:   403 Can only delete draft quotes, 404 Not Found
└─ Action:   Solo borrar si status = 'draft'

GET /api/v1/quotes/{id}/pdf
├─ Headers:  Authorization: Bearer {token}
├─ Response: 200 { Content-Type: application/pdf, body: binary }
├─ Errors:   404 Not Found, 507 Generation failed
└─ Action:   Llamar PdfGenerationService, cachear por 1 hora
```

#### **👥 Clients (Clientes)**

```
GET /api/v1/clients
├─ Query:    ?page=1&limit=50&search=nombre&is_active=true
├─ Response: 200 { data: [...], pagination }
└─ Perms:    Todos (autenticado)

GET /api/v1/clients/{id}
├─ Response: 200 { id, business_name, contact, email, phone, quotes_count... }
├─ Errors:   404 Not Found
└─ Perms:    Todos (autenticado)

POST /api/v1/clients
├─ Payload:  { business_name, contact_name, email?, phone?, address?, city?, tax_id? }
├─ Response: 201 Created { id, ... }
├─ Validations:
│   ├─ business_name: required, max 255
│   ├─ email: valid format si está presente
│   └─ tax_id: unique si está presente
└─ Perms:    Admin, Operator

PUT /api/v1/clients/{id}
├─ Payload:  { business_name?, contact_name?, email?, ... }
├─ Response: 200 { ... }
├─ Errors:   404 Not Found, 409 Conflict (tax_id)
└─ Perms:    Admin, Owner

DELETE /api/v1/clients/{id}
├─ Response: 204 No Content
├─ Errors:   409 Has associated quotes (soft delete?)
└─ Action:   Marcar como inactive en lugar de borrar (soft delete)

GET /api/v1/clients/{id}/quotes
├─ Query:    ?page=1&limit=20&status=approved
├─ Response: 200 { data: [...quotes for client], pagination }
└─ Perms:    Todos (autenticado)
```

#### **📦 Products (Productos)**

```
GET /api/v1/products
├─ Query:    ?page=1&limit=50&category=tuberias&is_active=true&search=tubo
├─ Response: 200 { data: [...], pagination }
└─ Perms:    Todos (autenticado) - view only

GET /api/v1/products/search
├─ Query:    ?q=tubo&limit=10  (para autocomplete)
├─ Response: 200 { data: [{ id, sku, name, unit_price, stock_quantity }] }
└─ Perms:    Todos (autenticado)

GET /api/v1/products/{id}
├─ Response: 200 { id, sku, name, description, price, stock, category... }
├─ Errors:   404 Not Found
└─ Perms:    Todos

POST /api/v1/products
├─ Payload:  { sku, name, description?, category?, unit_price, min_stock? }
├─ Response: 201 Created { id, ... }
├─ Validations:
│   ├─ sku: unique, max 50
│   ├─ name: required, max 255
│   └─ unit_price: > 0
└─ Perms:    Admin only

PUT /api/v1/products/{id}
├─ Payload:  { name?, description?, category?, unit_price?, min_stock? }
├─ Response: 200 { ... }
├─ Errors:   404, 409 Conflict
└─ Perms:    Admin only

PATCH /api/v1/products/{id}/stock
├─ Payload:  { quantity: int, operation: 'set'|'add'|'subtract' }
├─ Response: 200 { id, stock_quantity, updated_at }
├─ Validations:
│   └─ Resultado no puede ser negativo
└─ Perms:    Admin, Operator

DELETE /api/v1/products/{id}
├─ Response: 204 No Content (soft delete)
├─ Errors:   409 In use in active quotes
└─ Action:   Set is_active = FALSE
```

#### **📊 Reports (Reportes)**

```
GET /api/v1/reports/quotes-summary
├─ Query:    ?from_date=2026-01-01&to_date=2026-05-31
├─ Response: 200 { total_quotes, total_value, by_status, by_client[] }
└─ Perms:    Admin

GET /api/v1/reports/client-metrics/{client_id}
├─ Response: 200 { total_quotes, total_value, avg_quote, last_quote, top_products[] }
└─ Perms:    Admin, Owner

GET /api/v1/reports/inventory
├─ Query:    ?show_low_stock=true
├─ Response: 200 { total_products, by_category, low_stock_items[] }
└─ Perms:    Admin

GET /api/v1/reports/export-csv
├─ Query:    ?type=quotes&from_date=...&to_date=...
├─ Response: 200 { Content-Type: text/csv }
└─ Perms:    Admin
```

### 5.3 Códigos de Status HTTP

| Status | Caso de Uso |
|--------|-----------|
| 200 | GET exitoso, PUT/PATCH exitoso |
| 201 | POST exitoso, recurso creado |
| 204 | DELETE exitoso, no hay contenido |
| 400 | Validación fallida, datos inválidos |
| 401 | No autenticado, token inválido/expirado |
| 403 | Autenticado pero sin permisos |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: email duplicado) |
| 429 | Rate limit excedido |
| 500 | Error del servidor |
| 503 | Servicio no disponible |

### 5.4 Autenticación JWT

```
Flow:
1. POST /api/v1/auth/login
   Response: {
     access_token: "eyJhbGc...",     // 15 minutos
     refresh_token: "ref_...",        // 7 días
     expires_in: 900
   }

2. Headers en requests autenticados:
   Authorization: Bearer eyJhbGc...

3. Payload del JWT:
   {
     sub: "user_uuid",
     email: "user@example.com",
     role: "operator",
     iat: 1715168400,
     exp: 1715169300
   }

4. Refresh token:
   POST /api/v1/auth/refresh
   Body: { refresh_token: "ref_..." }
   Response: { access_token: "new_token", expires_in: 900 }
```

### 5.5 Seguridad en Endpoints

```
Reglas de Autorización:

ADMIN:
├─ Ver/editar todas las cotizaciones
├─ Gestionar productos
├─ Gestionar usuarios
├─ Acceder a reportes completos
└─ Cambiar estado de cotizaciones

OPERATOR:
├─ Ver/editar sus propias cotizaciones
├─ Ver todos los clientes
├─ Crear/editar clientes
├─ Ver productos
├─ Crear cotizaciones
└─ Acceder a reportes básicos (sus datos)

VIEWER:
├─ Ver cotizaciones (lectura)
├─ Ver clientes (lectura)
├─ Ver productos (lectura)
└─ Exportar reportes (lectura)
```

---

## 6. ESTRATEGIA DE MIGRACIÓN

### 6.1 Fases de Implementación

```
FASE 0: Setup Infraestructura (Weeks 1-2)
├─ Crear proyecto Go con estructura boilerplate
├─ Configurar PostgreSQL local + Docker Compose
├─ Implementar CI/CD pipeline (GitHub Actions)
├─ Setup base de testing
└─ Documentar standards de código

FASE 1: Core MVP (Weeks 3-6)
├─ Modelos de base de datos (migrations)
├─ API endpoints básicos (CRUD quotes, clients, products)
├─ Autenticación JWT simple
├─ PDF generation básico
└─ Frontend integración con API

FASE 2: Robustez (Weeks 7-9)
├─ Validaciones exhaustivas
├─ Manejo de errores completo
├─ Logging y monitoring
├─ Tests (unit + integration)
├─ Auditoría y quote_history
└─ Rate limiting

FASE 3: Optimización (Weeks 10-12)
├─ Caching (Redis)
├─ Índices de base de datos
├─ Query optimization
├─ Frontend SPA mejorado
├─ Reportes y exportación CSV
└─ Performance testing

FASE 4: Producción (Weeks 13+)
├─ Deployment a Kubernetes
├─ Backup y disaster recovery
├─ SSL/TLS certificates
├─ Monitoring 24/7
├─ Documentación de operaciones
└─ Training para usuarios
```

### 6.2 Estrategia de Datos: Migración del Legado

```
PROBLEMA: Cotishama 1.0 no tiene persistencia real

SOLUCIÓN DUAL:

Opción A: LIMPIEZA (Recomendada si datos no son críticos)
├─ Comenzar con BD vacía en v2.0
├─ Usuarios crean cotizaciones nuevas en v2.0
├─ Versión 1.0 se mantiene en read-only por cierto tiempo
└─ Transición gradual: v1 → v2

Opción B: IMPORTACIÓN (Si hay historial importante)
├─ Exportar datos de v1.0 (si existen en localStorage)
├─ Crear script de migración en Go
├─ Validar integridad de datos
├─ Bulk insert a v2.0 con nueva estructura
├─ Auditoría: marcar datos migrados
└─ Después, limpieza de v1.0

RECOMENDACIÓN: Opción A
└─ Cotishama 1.0 es una herramienta de corto plazo
└─ No hay persistencia, datos se pierden con refresh
└─ Mejor oportunidad para diseño limpio de v2.0
```

### 6.3 Configuración de Feature Flags

```
Durante la transición, implementar feature flags:

DURANTE BETA:
├─ API_V2_ENABLED: true/false  (activa endpoints v2)
├─ FRONTEND_USE_API: true/false (frontend consume API o localStorage)
├─ PDF_GENERATION_SOURCE: 'v1'|'v2' (dónde generar PDFs)
└─ ANALYTICS_ENABLED: true (new system analytics)

Permitirá:
├─ Rodar ambas versiones en paralelo
├─ Rollback rápido si hay issues
├─ Testing A/B si es necesario
└─ Validación de datos entre sistemas
```

### 6.4 Plan de Cutover

```
DÍA DE GO-LIVE:

06:00 - Backup completo de datos actuales (v1.0)
08:00 - Maintenance window: Sistema en read-only
09:00 - Validar datos en v2.0
10:00 - Activar API_V2_ENABLED = true
10:15 - Monitoreo intensivo (logs, errores)
14:00 - v1.0 solo en archived mode (vista histórica)
16:00 - Notificar a usuarios: migración completada
        Proporcionar documentación v2.0

ROLLBACK PLAN:
├─ Si errores críticos detectados antes de 10:30 AM
├─ Reactivar v1.0 como principal
├─ Mantener v2.0 en investigación
└─ Comunicar retraso a usuarios
```

---

## 7. CONSIDERACIONES DE SEGURIDAD

### 7.1 Matriz de Amenazas

| Amenaza | Mitigación | Prioridad |
|---------|-----------|-----------|
| SQL Injection | Parameterized queries (ORM), sqlc type-safe | CRÍTICA |
| XSS (Frontend) | Content Security Policy, DOMPurify, validate input | CRÍTICA |
| CSRF | SameSite cookies, CSRF tokens en forms | CRÍTICA |
| Brute Force | Rate limiting (5 intentos / 15min), JWT refresh | ALTA |
| Session Hijacking | HTTPS only, Secure cookies, short JWT lifetime | ALTA |
| Unauthorized Access | RBAC (admin/operator/viewer), ACLs | ALTA |
| Data Leakage | Encryption at rest, encryption in transit | MEDIA |
| DDoS | Rate limiting, WAF (Nginx), CDN | MEDIA |
| Credential Compromise | bcrypt password hashing, 2FA (futuro) | ALTA |

### 7.2 Implementación de Seguridad

#### Authentication
```go
Hashing:      bcrypt (cost: 12)
JWT Secret:   Min 256 bits, desde env var
Tokens:       Access (15min) + Refresh (7 días)
Blacklist:    Redis para tokens revocados
Login Limit:  5 intentos → locked 15 minutos
```

#### Database
```sql
-- Niveles de acceso:
CREATE ROLE app_user WITH PASSWORD 'secure_pass';
GRANT SELECT, INSERT, UPDATE ON quotes, clients, products TO app_user;

-- Encriptación:
ALTER TABLE users ALTER COLUMN password_hash TYPE VARCHAR USING pgcrypto.encrypt(...);

-- Auditoría:
CREATE TRIGGER audit_quotes_changes
AFTER UPDATE ON quotes
FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
```

#### API
```
Headers seguridad:
├─ Content-Security-Policy: default-src 'self'
├─ X-Content-Type-Options: nosniff
├─ X-Frame-Options: DENY
├─ Strict-Transport-Security: max-age=31536000; includeSubDomains
├─ X-XSS-Protection: 1; mode=block
└─ Referrer-Policy: strict-origin-when-cross-origin

CORS:
├─ AllowedOrigins: ["https://app.cotishama.com", "https://staging.cotishama.com"]
├─ AllowedMethods: ["GET", "POST", "PUT", "DELETE"]
├─ AllowedHeaders: ["Authorization", "Content-Type"]
└─ ExposedHeaders: ["X-Total-Count", "X-RateLimit-Remaining"]
```

#### Frontend
```javascript
// Sanitización de inputs
const sanitize = (html) => {
    const el = document.createElement('div');
    el.textContent = html;
    return el.innerHTML;
};

// Validación de datos
const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// HTTPS-only
window.addEventListener('load', () => {
    if (location.protocol !== 'https:' && !location.hostname === 'localhost') {
        location.protocol = 'https:';
    }
});
```

---

## 8. PLAN DE ESCALABILIDAD

### 8.1 Horizonte Actual (MVP) 100-500 usuarios/mes

```
Infraestructura:
├─ Single VM: Go API + Nginx
├─ PostgreSQL: single instance con backups
├─ Storage: Local filesystem para PDFs
└─ Load: < 10 req/s promedio

Cost: ~$50-100/mes (DigitalOcean, AWS)
```

### 8.2 Horizonte Medio (6-12 meses) 2,000+ usuarios/mes

```
Infraestructura:
├─ Kubernetes (1 master + 2 workers)
│  ├─ API Pod replicas: 3-5
│  ├─ Frontend: Served from CDN
│  └─ Nginx Ingress controller
├─ PostgreSQL: 
│  ├─ Primary + Standby (replication)
│  └─ Automated failover (Patroni)
├─ Redis: Caching + sessions (cluster)
├─ S3/Object Storage: PDFs
├─ Monitoring: Prometheus + Grafana
└─ Logging: ELK stack (Elasticsearch)

Load: 50-100 req/s pico

Cost: ~$300-500/mes
```

### 8.3 Horizonte Largo (1-2 años) 10,000+ usuarios/mes

```
Microservicios:
├─ API Gateway (Kong/Traefik)
├─ Services:
│  ├─ Quote Service (Go)
│  ├─ Client Service (Go)
│  ├─ Product Service (Go)
│  ├─ PDF Service (Go + headless Chrome)
│  ├─ Report Service (Go + Spark?)
│  └─ Auth Service (Go + OAuth2)
├─ Message Queue: RabbitMQ/Kafka
│  └─ Para: PDF generation async, notifications, audit logs
├─ Search: Elasticsearch (queries de cotizaciones/clientes)
├─ Cache: Redis Cluster
├─ Databases:
│  ├─ PostgreSQL (principal)
│  ├─ Read replicas para reports
│  └─ Event Store (futuro)
├─ Object Storage: S3 (PDFs, attachments)
├─ CDN: CloudFlare / CloudFront
└─ Observability:
    ├─ Metrics: Prometheus
    ├─ Traces: Jaeger
    ├─ Logs: ELK + Loki
    └─ APM: Datadog/New Relic

Load: 500+ req/s

Cost: $1,000-2,000/mes
```

### 8.4 Puntos de Extensión Futuros

```
Queueing:
├─ PDF generation asincrónica
├─ Email notifications
├─ Batch reports
└─ Audit logging

Caching:
├─ Client list (invalidate on update)
├─ Product catalog
├─ User permissions
└─ Quote summary

Search:
├─ Elasticsearch para queries complejas
├─ Full-text search en cotizaciones
└─ Analytics dashboards

Integrations:
├─ WhatsApp notifications
├─ Email (SendGrid/AWS SES)
├─ Accounting software (SAP, QuickBooks)
├─ CRM (Salesforce, Zoho)
└─ Payment gateway (Stripe, Conekta)
```

---

## 9. ROADMAP FUTURO (POST-MVP)

### Fase 2: Características Avanzadas
```
□ Plantillas de cotizaciones personalizables
□ Descuentos por cliente/volumen
□ Multi-moneda (USD, EUR, GTQ)
□ Sistema de notificaciones (Email, SMS, WhatsApp)
□ Aprobación multinivel
□ Órdenes de compra desde cotizaciones aprobadas
□ Invoicing integrado
□ Reportes avanzados y dashboards
□ Mobile app (React Native / Flutter)
```

### Fase 3: Inteligencia de Negocio
```
□ Predicción de tasas de aprobación (ML)
□ Recomendaciones de productos
□ Análisis de tendencias de precios
□ Alertas de stock bajo
□ Análisis de rentabilidad por cliente
□ Forecasting de demanda
```

### Fase 4: Integración Empresarial
```
□ APIs abiertas para partners
□ Webhook para eventos (quote created, status changed)
□ SSO/SAML
□ Integración con contabilidad (Xero, SAP)
□ EDI para órdenes automatizadas
□ White-label capability
```

---

## 10. TABLA RESUMEN DE DECISIONES

| Decisión | Opción Elegida | Justificación |
|----------|----------------|--------------|
| **Backend** | Go + Gin | Performance, deployment simpleza, concurrencia |
| **Base de Datos** | PostgreSQL | ACID, escalabilidad, relaciones complejas, JSONB |
| **Frontend** | Vanilla JS mejorado | Mantener familiaridad, sin overhead de frameworks |
| **Autenticación** | JWT + bcrypt | Stateless, scalable, standard industry |
| **PDF Generation** | wkhtmltopdf en backend | Control total, template reusable, no DOM capture |
| **Persistencia PDF** | S3 / Object Storage | Scalable, backups, CDN compatible |
| **Deployment** | Docker + Kubernetes | Multi-cloud ready, scaling automático |
| **Monitoreo** | Prometheus + Grafana | Open-source, proven, compatible Go |
| **Testing** | Unit + Integration | Test pyramid, CI/CD gating |

---

## 11. CONCLUSIONES Y NEXT STEPS

### ¿Por Qué Esta Arquitectura?

1. **Escalabilidad**: Diseñada para crecer de 100 a 10,000+ usuarios sin rehacer
2. **Mantenibilidad**: Separación clara de responsabilidades, fácil de debuggear
3. **Seguridad**: RBAC, auditoría completa, encriptación
4. **Performance**: Go para I/O heavy (PDF), caching en capas
5. **Observabilidad**: Logging estructurado, metrics, trazas distribuidas
6. **Reliability**: Transacciones ACID, backups automáticos, failover
7. **Developer Experience**: TypeScript ready, API REST clara, docs auto-generadas

### Próximos Pasos Inmediatos

```
SEMANA 1:
□ Crear repo backend (github.com/DavidDevGt/cotishama-api)
□ Boilerplate Go: estructura, Dockerfile, docker-compose.yml
□ PostgreSQL setup local con migrations
□ Skeleton CI/CD (GitHub Actions)

SEMANA 2:
□ Migrations de todas las tablas
□ CRUD básico en API (quotes, clients, products)
□ Autenticación JWT endpoints

SEMANA 3:
□ Frontend: Rewrite de modules para consumir API
□ Integración con endpoints del backend
□ Testing básico

SEMANA 4:
□ PDF generation implementation
□ Auditoría completa
□ Documentation
```

---

**Documento de Arquitectura Finalizado**
**Próxima Revisión**: Después de MVP (2-3 semanas)
