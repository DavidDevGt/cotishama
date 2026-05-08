# COTISHAMA 2.0 - ARQUITECTURA BACKEND (BUN + HONOJO + TYPESCRIPT)

## 🎯 Visión General del Backend

**Stack:**
- Runtime: **Bun** (JavaScript/TypeScript native runtime)
- Framework: **HonoJS** (ultra-lightweight web framework for edge computing)
- Language: **TypeScript** (type safety, DX)
- Database: **PostgreSQL** con **Drizzle ORM** (type-safe queries)
- Testing: **Bun:test** (built-in, native)

**Características Clave:**
- API REST stateless
- JWT authentication + RBAC
- Structured logging (Pino)
- Transacciones ACID
- Error handling consistente
- Middleware-based architecture

---

## 📐 Arquitectura por Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                  HTTP REQUEST / RESPONSE                        │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │  Hono Router & Middleware  │
                ├────────────────────────────┤
                │ • Request validation       │
                │ • Auth middleware (JWT)    │
                │ • CORS handling            │
                │ • Rate limiting            │
                │ • Error handling           │
                │ • Logging                  │
                └────────────┬───────────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │  Handlers (Controllers)    │
                ├────────────────────────────┤
                │ • Parse & validate input   │
                │ • Delegate to services     │
                │ • Format responses         │
                │ • Handle errors            │
                └────────────┬───────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │  Services (Business Logic)             │
        ├────────────────────────────────────────┤
        │ • Quote creation logic                 │
        │ • State transitions                    │
        │ • Calculations (subtotal, tax)         │
        │ • Stock validation                     │
        │ • Business rule enforcement            │
        │ • Transaction coordination             │
        └────────────┬──────────────────────────┘
                     │
        ┌────────────┴──────────────────┬─────────────┐
        │                               │             │
        ▼                               ▼             ▼
   ┌─────────────┐            ┌──────────────────┐  ┌─────────────┐
   │ Repository  │            │  External Svcs   │  │   Utilities │
   │  (Data)     │            │  (PDF, Email)    │  │             │
   │             │            │                  │  │ • JWT       │
   │ • Quote     │            │ • Puppeteer      │  │ • Password  │
   │ • Client    │            │ • Email service  │  │ • Formatters│
   │ • Product   │            │ • S3 upload      │  │ • Validators│
   │ • User      │            │                  │  │             │
   │             │            │                  │  │             │
   └──────┬──────┘            └──────────────────┘  └─────────────┘
          │
          ▼
   ┌──────────────────────────────────┐
   │  PostgreSQL Database             │
   │  (with connection pooling)        │
   └──────────────────────────────────┘
```

---

## 🔌 HonoJS - Características Clave

### **¿Por qué HonoJS?**

| Criteria | HonoJS | Express | Fastify | Nest |
|----------|--------|---------|---------|------|
| **Size** | 50KB | 150KB | 100KB | 500KB+ |
| **Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Startup** | <50ms | 100ms | 50ms | 500ms+ |
| **Bun-native** | ✅ | ❌ | ✅ | ❌ |
| **Edge-ready** | ✅ | ❌ | ✅ | ❌ |
| **TypeScript** | ✅ Native | ⚠️ Plugin | ✅ Native | ✅ Native |
| **Middleware** | ✅ Simple | ✅ Mature | ✅ Hooks | ✅ Decorators |
| **DX** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Razones para HonoJS:**
1. **Bun first-class support** - Optimizado para Bun runtime
2. **Ultra lightweight** - Perfecto para serverless + edge computing
3. **Type-safe** - TypeScript nativo sin overhead
4. **Middleware elegante** - Stack de middleware limpio y performante
5. **No boilerplate** - Setup mínimo, máxima flexibilidad
6. **Future-proof** - Ready para Workers, Deno, Bun

---

## 🏗️ Patrones de Arquitectura

### **1. Patrón de Handlers**

Cada handler es responsable de:

```
Handler:
├─ Extraer parámetros (params, query, body)
├─ Llamar a Zod validator para tipado
├─ Delegar lógica a Service
├─ Procesar respuesta
├─ Manejar errores
└─ Retornar JSON standardizado
```

**Flujo de una Solicitud:**

```
Request → Validation (Zod) → Handler → Service → Repository → DB
                    ↓                      ↓
                  Error ←─────────────────┘
                    ↓
            Error Handler Middleware
                    ↓
            Response (JSON)
```

### **2. Patrón de Servicios**

Services contienen toda la lógica de negocio:

```
Service responsabilidades:
├─ Validaciones de reglas de negocio
├─ Cálculos (subtotal, tax, total)
├─ Transacciones multi-repository
├─ Decisiones de flujo
├─ Llamadas a otros servicios
└─ Mapeo de errores
```

**Importante:** Los servicios NO conocen HTTP. Son agnósticos.

### **3. Patrón de Repositories**

Data Access Object pattern:

```
Repository responsabilidades:
├─ Queries a BD (SELECT)
├─ Inserciones (INSERT)
├─ Actualizaciones (UPDATE)
├─ Transacciones
├─ Joins y relaciones
└─ Mapeo de raw data → tipos TypeScript

¡NO hacen validaciones ni lógica de negocio!
```

### **4. Transaction Management**

Para operaciones atómicas:

```
Service:
├─ Obtiene connection/transaction
├─ Llama repository.create() dentro de TX
├─ Si error → rollback automático
├─ Si success → commit automático
└─ Maneja cleanup

Ejemplo: Crear cotización
├─ BEGIN TRANSACTION
├─ INSERT quote
├─ INSERT quote_details (batch)
├─ UPDATE products (stock)
├─ INSERT quote_history
├─ COMMIT (todo o nada)
```

---

## 📝 Implementación Detallada

### **I. Entry Point (index.ts)**

```
Responsabilidades:
├─ Crear instancia de Hono
├─ Registrar middlewares globales
├─ Importar y registrar rotas
├─ Inicializar conexión a BD
├─ Setup error handler global
├─ Start server en puerto
└─ Handle graceful shutdown
```

**Flujo de Inicialización:**

```
main()
├─ loadEnvironment()
├─ initializeDatabase()
│  └─ create connection pool
├─ setupApp()
│  ├─ register cors middleware
│  ├─ register auth middleware
│  ├─ register rate limiter
│  ├─ register logger
│  └─ register request-id middleware
├─ registerRoutes()
│  ├─ /api/v1/auth
│  ├─ /api/v1/quotes
│  ├─ /api/v1/clients
│  ├─ /api/v1/products
│  └─ /api/v1/reports
├─ registerErrorHandlers()
├─ startServer()
└─ handleShutdown()
```

### **II. Middleware Stack**

```
REQUEST FLOW (en orden):

1. Request Logging Middleware
   ├─ Generate request ID
   ├─ Log incoming request
   └─ Add requestId to context

2. CORS Middleware
   ├─ Check origin whitelist
   ├─ Set CORS headers
   └─ Handle preflight requests

3. Security Headers Middleware (Helmet-like)
   ├─ Content-Security-Policy
   ├─ X-Content-Type-Options: nosniff
   ├─ X-Frame-Options: DENY
   ├─ Strict-Transport-Security
   └─ X-XSS-Protection

4. Body Parser Middleware
   ├─ Parse JSON
   ├─ Validate content-type
   └─ Limit payload size

5. Rate Limiter Middleware
   ├─ Track IP address
   ├─ Count requests
   ├─ Return 429 if exceeded
   └─ Reset timer

6. Auth Middleware (conditional)
   ├─ Check Authorization header
   ├─ Validate JWT signature
   ├─ Check expiration
   ├─ Extract user claims
   ├─ Attach user to context
   └─ Return 401 if invalid

7. Handler (route-specific)
   └─ Execute actual business logic

8. Error Handler Middleware
   ├─ Catch exceptions
   ├─ Format error response
   └─ Log error with context

RESPONSE FLOW:

Response ← Handler
    ↓
  Error Handler (si aplica)
    ↓
  Format as JSON
    ↓
  Set status code
    ↓
  Add security headers
    ↓
  Log response
    ↓
  Send to client
```

### **III. Routing Structure**

```
Patrón: Declarativo, modular, type-safe

/api/v1/
├─ POST   /auth/login
├─ POST   /auth/refresh
├─ POST   /auth/logout
│
├─ GET    /quotes          (list - paginated)
├─ GET    /quotes/:id      (single)
├─ POST   /quotes          (create)
├─ PUT    /quotes/:id      (update)
├─ PATCH  /quotes/:id/status (state machine)
├─ GET    /quotes/:id/pdf  (download)
├─ DELETE /quotes/:id      (soft delete)
│
├─ GET    /clients
├─ GET    /clients/:id
├─ POST   /clients
├─ PUT    /clients/:id
├─ GET    /clients/:id/quotes
│
├─ GET    /products
├─ GET    /products/search
├─ POST   /products (admin)
├─ PATCH  /products/:id/stock
│
└─ GET    /reports/*

Cada grupo de rutas vive en su archivo:
apps/backend/src/routes/
├─ auth.routes.ts
├─ quote.routes.ts
├─ client.routes.ts
├─ product.routes.ts
├─ report.routes.ts
└─ index.ts (consolidador)
```

### **IV. Handlers (Controllers)**

```
Estructura general de un handler:

export const handleCreateQuote = async (c: Context) => {
  try {
    // 1. Validar input (Zod schema)
    // 2. Extraer usuario autenticado
    // 3. Llamar al servicio
    // 4. Formatear respuesta
    // 5. Retornar JSON + status code
  } catch (error) {
    // Error handling delegado a middleware global
    throw error;
  }
};

Características:
├─ No hace lógica de negocio compleja
├─ Delega a servicios
├─ Maneja validación de input
├─ Transforma respuestas
├─ Deja errores para middleware
└─ Retorna responses consistentes
```

### **V. Services Layer**

```
Estructura:

class QuoteService {
  constructor(
    private quoteRepository: QuoteRepository,
    private productRepository: ProductRepository,
    private clientRepository: ClientRepository
  ) {}

  async createQuote(input: CreateQuoteInput): Promise<Quote> {
    // 1. Validaciones de negocio
    // 2. Verificar cliente existe
    // 3. Verificar productos existen
    // 4. Calcular subtotal/tax/total
    // 5. Coordinar transacción multi-repo
    // 6. Retornar quote completa
  }

  async changeQuoteStatus(quoteId: string, newStatus: QuoteStatus) {
    // 1. Validar transición de estado permitida
    // 2. Aplicar lógica según nuevo estado
    // 3. Si approved: update inventory
    // 4. Crear entry en quote_history
    // 5. Return actualizado
  }

  // ... más métodos
}

Características:
├─ Encapsula lógica de negocio
├─ Coordinador de repositories
├─ Validaciones complejas
├─ Transacciones atómicas
├─ Mapeo de errores
└─ Inyección de dependencias
```

### **VI. Repository Pattern**

```
Estructura:

class QuoteRepository {
  constructor(private db: Database) {}

  async create(quote: Quote): Promise<Quote> {
    // Raw INSERT via Drizzle ORM
    // Return fully typed
  }

  async getById(id: string): Promise<Quote | null> {
    // SELECT with JOINs
    // Return typed
  }

  async list(filters: QuoteFilters): Promise<Quote[]> {
    // SELECT con WHERE/ORDER/LIMIT
    // Paginación
  }

  async update(id: string, updates: Partial<Quote>): Promise<Quote> {
    // UPDATE statement
  }

  async delete(id: string): Promise<void> {
    // SOFT delete (set deleted_at)
  }

  // Métodos específicos de dominio:
  async getByStatus(status: QuoteStatus): Promise<Quote[]> {}
  async getByClient(clientId: string): Promise<Quote[]> {}
  async getTotalByClient(clientId: string): Promise<number> {}
}

Características:
├─ Una sola responsabilidad: data access
├─ Métodos corresponden a queries
├─ Retornan tipos TypeScript
├─ No hacen validaciones
├─ No coordinan multi-table ops
└─ Agnósticos de HTTP
```

### **VII. Type System**

```
Estructura de tipos:

/apps/backend/src/types/

api.ts:
├─ CreateQuoteRequest
├─ QuoteResponse
├─ PaginatedResponse<T>
├─ ErrorResponse
└─ APIResponse<T>

domain.ts:
├─ User
├─ Client
├─ Product
├─ Quote
├─ QuoteDetail
└─ QuoteHistory

errors.ts:
├─ AppError (base)
├─ ValidationError
├─ NotFoundError
├─ UnauthorizedError
├─ ConflictError
└─ InternalServerError

Uso:
├─ Handlers reciben Request<CreateQuoteRequest>
├─ Services retornan Promise<Quote>
├─ Repositories retornan Promise<Quote[]>
└─ Validators usan CreateQuoteRequest
```

### **VIII. Error Handling Strategy**

```
Niveles de errores:

1. VALIDATION ERRORS
   ├─ Schema validation fails (Zod)
   ├─ Return 400 Bad Request
   └─ Include field-level errors

2. BUSINESS LOGIC ERRORS
   ├─ Client not found
   ├─ Stock insufficient
   ├─ Invalid state transition
   ├─ Return 400/409/422
   └─ Descriptive message

3. AUTHENTICATION/AUTHORIZATION
   ├─ Invalid JWT
   ├─ Expired token
   ├─ Insufficient permissions
   ├─ Return 401/403
   └─ No sensitive info in response

4. NOT FOUND
   ├─ Resource doesn't exist
   ├─ Return 404
   └─ Generic message (no leaking)

5. DATABASE ERRORS
   ├─ Connection failed
   ├─ Constraint violation
   ├─ Transaction conflict
   ├─ Return 500
   └─ Log full error, return generic

6. INTERNAL SERVER ERRORS
   ├─ Unhandled exceptions
   ├─ Return 500
   ├─ Log full stack
   └─ Return generic message

Estructura de error response:
{
  "success": false,
  "status_code": 400,
  "error": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": {
    "field": "cantidad",
    "constraint": "minimum",
    "expected": 1
  },
  "request_id": "req-abc123",
  "timestamp": "2026-05-08T10:30:00Z"
}
```

---

## 🔐 Seguridad en Backend

### **Authentication Flow**

```
1. LOGIN
   POST /api/v1/auth/login
   {
     "email": "user@example.com",
     "password": "secure_password"
   }

   Backend:
   ├─ Validate email format
   ├─ Find user in DB
   ├─ Compare password (bcrypt)
   ├─ Generate JWT tokens:
   │  ├─ access_token (15 min)
   │  └─ refresh_token (7 days, HttpOnly)
   └─ Return tokens

   Response:
   {
     "access_token": "eyJhbGc...",
     "refresh_token": "ref_xyz",
     "user": { id, email, role }
   }

2. AUTHENTICATED REQUEST
   GET /api/v1/quotes
   Authorization: Bearer eyJhbGc...

   Middleware:
   ├─ Extract token from header
   ├─ Verify signature (secret)
   ├─ Check expiration
   ├─ Extract claims
   ├─ Attach to context
   └─ Continue to handler

3. TOKEN REFRESH
   POST /api/v1/auth/refresh
   Body: { refresh_token: "ref_xyz" }

   Backend:
   ├─ Validate refresh_token
   ├─ Check if revoked (blacklist)
   ├─ Generate new access_token
   └─ Return new token

4. LOGOUT
   POST /api/v1/auth/logout
   Authorization: Bearer eyJhbGc...

   Backend:
   ├─ Add token to blacklist (Redis)
   ├─ Clear refresh_token
   └─ Return success
```

### **Authorization (RBAC)**

```
Roles:
├─ ADMIN
│  └─ Full access to everything
├─ OPERATOR
│  ├─ Create/edit own quotes
│  ├─ View all clients/products
│  ├─ Create clients
│  └─ View basic reports
└─ VIEWER
   ├─ View quotes (read-only)
   ├─ View clients (read-only)
   └─ View products (read-only)

Implementación vía middleware:
└─ requireAuth()
   └─ requireRole('OPERATOR')
      └─ requireOwnershipOrAdmin()

Ejemplo:
router.patch('/quotes/:id/status',
  requireAuth(),
  requireRole('ADMIN', 'OPERATOR'),
  requireQuoteOwnership(),
  handleChangeQuoteStatus
)
```

### **Password Security**

```
Storage:
├─ Hash con bcrypt (cost 12)
├─ Nunca almacenar plaintext
├─ Unique per user

Validation:
├─ Min 8 characters
├─ Contain uppercase
├─ Contain lowercase
├─ Contain number
├─ Contain special char
└─ Not common passwords (blacklist)

Reset Flow:
├─ User requests reset
├─ Generate secure token (32 bytes)
├─ Store hashed token + expiration (15 min)
├─ Send link vía email
├─ User clicks link
├─ Validate token
├─ Allow new password
└─ Invalidate all tokens
```

### **Input Validation**

```
En cada endpoint:

1. Zod Schema
   ├─ Define expected shape
   ├─ Include constraints
   ├─ Type-safe parsing
   └─ Return typed data

2. Sanitization
   ├─ Trim whitespace
   ├─ Remove null bytes
   ├─ Escape special chars
   └─ Normalize unicode

3. Business Rules
   ├─ Check dependencies
   ├─ Verify permissions
   ├─ Validate state
   └─ Check constraints

Ejemplo:
const createQuoteSchema = z.object({
  clientId: z.string().uuid(),
  details: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive()
  }))
})

En handler:
const validated = createQuoteSchema.parse(body)
// ↑ Type: CreateQuoteRequest
```

---

## 📊 Database Integration (Drizzle ORM)

### **¿Por qué Drizzle?**

```
vs Prisma:        vs TypeORM:       vs Raw SQL:
✅ Type-safe      ✅ Decorator-based ❌ No type safety
✅ Lightweight    ❌ Heavy          ✅ Full control
✅ Raw SQL option ❌ Complex        ❌ Hard to maintain
✅ Migrations     ✅ Migrations     ❌ Manual
✅ Bun support    ⚠️ Limited Bun    ✅ Direct Bun
```

### **Connection Management**

```
Pool Strategy:
├─ Min connections: 5
├─ Max connections: 20
├─ Idle timeout: 30 sec
├─ Connection timeout: 10 sec
└─ Validation query on acquire

Graceful Shutdown:
├─ Stop accepting new connections
├─ Wait for active queries
├─ Close pool
├─ Exit process

Retry Logic:
├─ Transient errors: retry 3 times
├─ Exponential backoff: 100ms, 200ms, 400ms
├─ Non-transient errors: fail immediately
└─ Circuit breaker (if in future)
```

### **Query Patterns**

```
SELECT:
├─ Simple: db.select().from(quotes)
├─ With where: .where(eq(quotes.id, id))
├─ With joins: .innerJoin(details)
├─ Pagination: .limit(50).offset(100)
└─ Ordering: .orderBy(desc(quotes.createdAt))

INSERT:
├─ Single: db.insert(quotes).values(data)
├─ Batch: db.insert(quotes).values([...])
└─ Return: .returning()

UPDATE:
├─ db.update(quotes)
│  .set(updates)
│  .where(eq(quotes.id, id))
└─ Return: .returning()

DELETE (soft):
├─ db.update(quotes)
│  .set({ deletedAt: new Date() })
│  .where(eq(quotes.id, id))
└─ Query filters deletedAt: isNull()
```

---

## 🧪 Testing Strategy

### **Test Pyramid**

```
        ▲
       /\
      /  \
     /E2E \        (5%)
    /______\
    /      \
   /  Integ \     (15%)
  /_________ \
  /          \
 /  Unit      \   (80%)
/____________\
```

### **Unit Tests**

```
Qué testear:
├─ Servicios (lógica de negocio)
├─ Validadores (Zod schemas)
├─ Utilities (formatters, helpers)
├─ Conversiones de tipos
└─ Funciones puras

Qué NO testear:
├─ Detalles de implementación
├─ Código de framework (Hono)
├─ Métodos triviales
└─ External dependencies (mockeados)

Estructura:
service.test.ts
├─ describe('QuoteService')
│  ├─ describe('createQuote')
│  │  ├─ test('should create valid quote')
│  │  ├─ test('should reject insufficient stock')
│  │  └─ test('should fail if client not found')
│  └─ describe('changeStatus')
│     └─ ...
```

### **Integration Tests**

```
Qué testear:
├─ Handlers + Services + Repositories
├─ Database interactions
├─ Transacciones completas
├─ Error flows end-to-end
└─ Validación input → output

Setup:
├─ Test database (separate, clean for each test)
├─ Seed data
├─ Mock external services (PDF, Email)
├─ Transaction rollback after each test
└─ Cleanup

Patrón:
test('should create quote with stock update', async () => {
  // Arrange: Setup data
  // Act: Call handler/service
  // Assert: Verify DB state + response
  // Cleanup: Automatic rollback
})
```

### **E2E Tests**

```
Qué testear:
├─ Flujos completos de usuario
├─ Múltiples endpoints secuencial
├─ Session management
├─ Error recovery
└─ Concurrencia

Tools:
├─ Playwright o Cypress
├─ Headless browser
├─ Real API endpoints
└─ Real database (staging)

Ejemplo:
1. Login
2. Create quote
3. Download PDF
4. Change status
5. Verify email sent
6. View in dashboard
```

---

## 📈 Logging & Monitoring

### **Structured Logging (Pino)**

```
Niveles:
├─ FATAL: Errores que causa salida
├─ ERROR: Errores que afectan funcionalidad
├─ WARN: Situaciones inesperadas
├─ INFO: Eventos significativos
├─ DEBUG: Info de debugging
└─ TRACE: Detalles muy granulares

Qué loguear:
├─ REQUEST: method, path, status, duration
├─ ERROR: stack trace, context, userId
├─ BUSINESS: acciones importantes
├─ DATABASE: query duración, errors
└─ SECURITY: login attempts, auth failures

Formato JSON:
{
  "level": "error",
  "timestamp": "2026-05-08T10:30:00Z",
  "request_id": "req-abc123",
  "message": "Quote creation failed",
  "error": {
    "code": "INVALID_STATE",
    "message": "Client not found",
    "stack": "..."
  },
  "context": {
    "userId": "user-123",
    "clientId": "client-456"
  }
}
```

### **Metrics (Prometheus)**

```
Métricas importantes:
├─ http_requests_total (por endpoint)
├─ http_request_duration (histograma)
├─ http_requests_in_progress
│
├─ db_query_duration
├─ db_connection_pool_size
├─ db_active_connections
│
├─ quotes_created_total
├─ quotes_by_status
├─ quote_total_amount_sum
│
└─ process_uptime
```

---

## 🚀 Deployment Considerations

### **Environment Configuration**

```
Variables necesarias:

DATABASE:
├─ DATABASE_URL=postgresql://user:pass@host:5432/db
├─ DATABASE_POOL_MIN=5
└─ DATABASE_POOL_MAX=20

JWT:
├─ JWT_SECRET=<long-random-string>
├─ JWT_ACCESS_EXPIRE=15m
└─ JWT_REFRESH_EXPIRE=7d

APP:
├─ PORT=3000
├─ NODE_ENV=production
├─ LOG_LEVEL=info
└─ CORS_ORIGINS=https://app.example.com

EXTERNAL:
├─ SMTP_HOST
├─ SMTP_PORT
├─ SENDGRID_KEY (alternativa)
├─ S3_BUCKET
├─ S3_REGION
├─ S3_ACCESS_KEY
└─ S3_SECRET_KEY

Validación:
├─ Verificar en startup todas las vars
├─ Fallar early si falta algo
├─ No loguear secrets
└─ Usar valores defaults sensatos
```

### **Health Checks**

```
GET /health
├─ Database connectivity
├─ External service status
├─ Memory usage
├─ Uptime
└─ Version

GET /healthz (Kubernetes liveness)
GET /ready (Kubernetes readiness)
```

---

## 📋 API Contract / OpenAPI

```
Especificación auto-generada de Hono:

GET /api/v1/quotes
├─ Description: List quotes with filters
├─ Auth: Required (Bearer token)
├─ Query params:
│  ├─ page: number (default: 1)
│  ├─ limit: number (default: 50)
│  ├─ status: enum
│  └─ clientId: uuid
├─ Response 200:
│  {
│    "data": [Quote],
│    "pagination": {
│      "page": 1,
│      "limit": 50,
│      "total": 123,
│      "pages": 3
│    }
│  }
└─ Response 401: Unauthorized

Similar para todos los endpoints...
```

---

## ✅ Backend Checklist

```
ESTRUCTURA:
□ Separación handlers → services → repositories
□ Types centralizados y compartidos
□ Middleware stack organizado
□ Error handling consistente
□ Logging estructurado

SEGURIDAD:
□ JWT autenticación
□ RBAC autorización
□ Password hashing (bcrypt)
□ Input validation (Zod)
□ CORS configurado
□ SQL injection prevention (Drizzle)
□ Rate limiting

DATABASE:
□ Connection pooling
□ Transacciones ACID
□ Índices optimizados
□ Soft deletes
□ Auditoría triggers
□ Migrations versionadas

TESTING:
□ Unit tests (servicios)
□ Integration tests (flow completo)
□ E2E tests (flujos de usuario)
□ Fixtures y seeders
□ >80% code coverage

DEPLOYMENT:
□ Dockerfile optimizado
□ Health checks
□ Graceful shutdown
□ Environment config
□ Logging centralizado
□ Error tracking

PERFORMANCE:
□ Query optimization
□ Database indices
□ Connection pooling
□ Caching strategy (Redis si aplica)
□ Response compression
```

---

**Próxima sección: FRONTEND_ARCHITECTURE_VANILLA.md**
