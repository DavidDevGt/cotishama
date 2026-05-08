# COTISHAMA 2.0 - DIAGRAMAS ARQUITECTÓNICOS

## 1. FLUJO DE NEGOCIO PRINCIPAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FLUJO: CREAR Y APROBAR COTIZACIÓN                        │
└─────────────────────────────────────────────────────────────────────────────┘

USUARIO (Operador)                API GO                    BASE DE DATOS
    │                               │                              │
    │ 1. Selecciona cliente          │                              │
    ├──────────────────────────────>│                              │
    │                               │                              │
    │ 2. Agrega productos            │                              │
    ├──────────────────────────────>│                              │
    │                               │                              │
    │ 3. Revisa totales             │                              │
    │                               │                              │
    │ 4. Submite cotización         │ POST /api/v1/quotes         │
    ├──────────────────────────────>│                              │
    │                               │ BEGIN TRANSACTION            │
    │                               │                              │
    │                               │ INSERT quotes              │
    │                               ├─────────────────────────────>│
    │                               │                              │
    │                               │ INSERT quote_details (bulk)  │
    │                               ├─────────────────────────────>│
    │                               │                              │
    │                               │ UPDATE products (stock)      │
    │                               ├─────────────────────────────>│
    │                               │                              │
    │                               │ INSERT quote_history         │
    │                               ├─────────────────────────────>│
    │                               │ COMMIT                       │
    │                               │                              │
    │<──────────────────────────────┤ 201 Created + quote_id       │
    │                               │                              │
    │ 5. Descarga PDF               │ GET /quotes/{id}/pdf         │
    ├──────────────────────────────>│                              │
    │                               │ SELECT quote data           │
    │                               ├─────────────────────────────>│
    │                               │                              │
    │                               │ RENDER TEMPLATE + WKHTMLTOPDF
    │                               │                              │
    │                               │ SAVE TO S3                  │
    │                               │                              │
    │<──────────────────────────────┤ 200 PDF Binary              │
    │                               │                              │
    │ 6. Cambia estado a "sent"     │ PATCH /quotes/{id}/status    │
    ├──────────────────────────────>│                              │
    │                               │ UPDATE quotes status         │
    │                               ├─────────────────────────────>│
    │                               │                              │
    │                               │ INSERT quote_history         │
    │                               ├─────────────────────────────>│
    │                               │                              │
    │<──────────────────────────────┤ 200 Updated                  │
    │                               │                              │
    │                               │                              │
    └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ARQUITECTURA DE SISTEMA DISTRIBUIDO

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        INTERNET / CLIENTES                                 │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            ┌──────────────┐          ┌──────────────┐
            │ Web Browser  │          │ Mobile App   │
            │ (Vanilla JS) │          │ (Futuro)     │
            └──────┬───────┘          └──────┬───────┘
                   │                        │
                   └────────────┬───────────┘
                                │ HTTPS/REST
                                ▼
                        ┌──────────────────┐
                        │  CloudFlare CDN  │
                        │  (Caché estático)│
                        └────────┬─────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   NGINX Reverse Proxy  │
                    │  (SSL, Load Balancing) │
                    └─────────┬──────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼────┐  ┌────▼──────┐  ┌───▼───────┐
        │  API Pod 1 │  │  API Pod 2│  │ API Pod 3 │
        │  (Go + Gin)│  │ (Go + Gin)│  │(Go + Gin) │
        └────┬───────┘  └────┬──────┘  └────┬──────┘
             │               │              │
             └───────────────┼──────────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │   PostgreSQL       │
                    │   Primary Instance │
                    └────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐        ┌──────────────┐
        │  PostgreSQL  │        │   PostgreSQL │
        │  Standby 1   │        │   Standby 2  │
        │(Read Replica)│        │(Read Replica)│
        └──────────────┘        └──────────────┘

        ┌──────────────────┐
        │   Redis Cluster  │
        │  (Caching)       │
        └──────────────────┘

        ┌──────────────────┐
        │  AWS S3 / Minio  │
        │  (PDF Storage)   │
        └──────────────────┘

        ┌──────────────────┐
        │   Monitoring     │
        │  Prometheus      │
        │  Grafana         │
        └──────────────────┘
```

---

## 3. FLUJO DE AUTENTICACIÓN Y AUTORIZACIÓN

```
┌──────────────────────────────────────────────────────────────────────┐
│                    JWT AUTHENTICATION FLOW                           │
└──────────────────────────────────────────────────────────────────────┘

CLIENTE                              SERVIDOR API
    │                                    │
    │ 1. POST /auth/login                │
    │    { email, password }             │
    ├───────────────────────────────────>│
    │                                    │
    │                                    │ Hash password
    │                                    │ Compare with bcrypt
    │                                    │
    │                                    │ ┌─ Valid?
    │                                    │ │
    │                              NO ◄──┘
    │<───────────────────────────────────┤ 401 Unauthorized
    │                                    │
    │                              YES ──┤
    │                                    │
    │                                    │ Generar JWT:
    │                                    │ {
    │                                    │   sub: user_uuid,
    │                                    │   email: email,
    │                                    │   role: "operator",
    │                                    │   iat: 1715168400,
    │                                    │   exp: 1715169300  (15 min)
    │                                    │ }
    │                                    │
    │<───────────────────────────────────┤ 200 OK
    │ {                                  │
    │   access_token: "eyJhbGc...",     │
    │   refresh_token: "ref_xyz...",    │
    │   expires_in: 900                 │
    │ }                                  │
    │                                    │
    │ 2. Guardar tokens (localStorage)  │
    │                                    │
    │ 3. GET /api/v1/quotes             │
    │    Header: Authorization: Bearer eyJhbGc...
    ├───────────────────────────────────>│
    │                                    │
    │                                    │ Validar JWT
    │                                    │ ├─ Signature OK?
    │                                    │ ├─ Expirado?
    │                                    │ └─ Permisos?
    │                                    │
    │<───────────────────────────────────┤ 200 JSON data
    │ [...]                              │
    │                                    │
    │ 4. (15 min después) JWT expira    │
    │                                    │
    │ 5. POST /auth/refresh             │
    │    { refresh_token }               │
    ├───────────────────────────────────>│
    │                                    │
    │                                    │ Validar refresh token
    │                                    │ Generar nuevo access_token
    │                                    │
    │<───────────────────────────────────┤ 200 OK
    │ {                                  │
    │   access_token: "eyJhbGc...",     │
    │   expires_in: 900                 │
    │ }                                  │
    │                                    │
    └──────────────────────────────────────────────────────────────────┘
```

---

## 4. MODELO RELACIONAL (ER DIAGRAM)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      COTISHAMA 2.0 - ER DIAGRAM                             │
└─────────────────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │    USERS     │
                            │──────────────│
                            │ id [UUID] PK │
                            │ email        │
                            │ pass_hash    │
                            │ role         │
                            │ active       │
                            │ created_at   │
                            └────────┬─────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    │ creates        │ creates        │ logs changes
                    │ (1:N)          │ (1:N)          │ (1:N)
                    │                │                │
                    ▼                ▼                ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐
        │     CLIENTS      │  │     QUOTES       │  │  QUOTE_HISTORY  │
        │──────────────────│  │──────────────────│  │─────────────────│
        │ id [UUID] PK     │  │ id [UUID] PK     │  │ id [UUID] PK    │
        │ business_name    │  │ quote_number     │  │ quote_id (FK)   │
        │ contact_name     │  │ client_id (FK)◄──┼──┤ old_status      │
        │ email            │  │ user_id (FK)     │  │ new_status      │
        │ phone            │  │ status (enum)    │  │ changed_by (FK) │
        │ address          │  │ subtotal         │  │ reason          │
        │ tax_id [UNIQUE]  │  │ tax              │  │ changed_at      │
        │ credit_limit     │  │ total            │  └─────────────────┘
        │ created_at       │  │ notes            │
        │ updated_at       │  │ valid_until      │
        └──────────────────┘  │ approved_at      │
                              │ created_at       │
                              │ updated_at       │
                              └─────────┬────────┘
                                        │
                                        │ has_many (1:N)
                                        │
                                        ▼
                              ┌──────────────────────┐
                              │   QUOTE_DETAILS      │
                              │──────────────────────│
                              │ id [UUID] PK         │
                              │ quote_id (FK)        │
                              │ product_id (FK)─────┐
                              │ quantity             │
                              │ unit_price           │
                              │ subtotal (GENERATED) │
                              │ line_number          │
                              └──────────────────────┘
                                        │
                                        │ N:1
                                        │
                              ┌─────────▼────────────┐
                              │    PRODUCTS          │
                              │──────────────────────│
                              │ id [UUID] PK         │
                              │ sku [UNIQUE]         │
                              │ name                 │
                              │ description          │
                              │ category             │
                              │ unit_price           │
                              │ stock_quantity       │
                              │ min_stock            │
                              │ active               │
                              │ created_at           │
                              │ updated_at           │
                              └──────────────────────┘

                              ┌──────────────────────┐
                              │    AUDIT_LOG         │
                              │──────────────────────│
                              │ id [BIGINT] PK       │
                              │ table_name           │
                              │ record_id            │
                              │ action (I/U/D)       │
                              │ old_values (JSON)    │
                              │ new_values (JSON)    │
                              │ user_id (FK)         │
                              │ timestamp            │
                              │ ip_address           │
                              └──────────────────────┘
```

---

## 5. CICLO DE VIDA DE UNA COTIZACIÓN

```
┌─────────────────────────────────────────────────────────────────────────┐
│              QUOTE LIFECYCLE - STATE TRANSITIONS                        │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌─────────┐
                            │ CREADA  │
                            │ (draft) │
                            └────┬────┘
                                 │
                  ┌──────────────┬┴──────────────┐
                  │              │               │
                  │              │               │
        ┌─────────▼───┐  ┌──────▼────┐  ┌──────▼──────┐
        │             │  │             │  │              │
        │  CANCELADA  │  │   ENVIADA   │  │   VENCIDA    │
        │ (cancelled) │  │   (sent)    │  │  (expired)   │
        │             │  │             │  │              │
        └─────────────┘  └──────┬──────┘  └──────────────┘
                                 │
                  ┌──────────────┬┴──────────────┐
                  │              │               │
                  │              │               │
        ┌─────────▼────────┐ ┌────▼─────────────┐
        │                  │ │                  │
        │   APROBADA       │ │   RECHAZADA      │
        │  (approved)      │ │  (rejected)      │
        │                  │ │                  │
        └──────────────────┘ └──────────────────┘
                                (FINAL STATES)

    TRANSICIONES PERMITIDAS:
    ✓ draft      → sent, cancelled
    ✓ sent       → approved, rejected, cancelled
    ✓ approved   → (ninguna, estado final)
    ✓ rejected   → (ninguna, estado final)
    ✓ cancelled  → (ninguna, estado final)
    ✓ expired    → (ninguna, estado final)

    EVENTOS AUDITABLE:
    • draft creation      → INSERT quote_history
    • status change       → INSERT quote_history + UPDATE quote.updated_at
    • pdf generation      → Log in audit_log
    • datos modification  → Log in audit_log
```

---

## 6. ARQUITECTURA DE CAPAS - DETALLE TÉCNICO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CAPA DE PRESENTACIÓN                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌────────────────┐  ┌───────────────────┐           │
│  │ Formulario Input │  │ Quote Table    │  │ Reportes & Charts │           │
│  │ (HTML + CSS)     │  │ (HTML + CSS)   │  │ (HTML + CSS + JS) │           │
│  └────────┬─────────┘  └────────┬───────┘  └───────────┬───────┘           │
│           │                     │                      │                   │
│           └─────────────────────┼──────────────────────┘                    │
│                                 │ REST API Calls                           │
│                                 ▼                                          │
│  ┌────────────────────────────────────────────────────────┐                 │
│  │  State Management (Event Emitters)                      │                 │
│  │  ├─ quoteState                                         │                 │
│  │  ├─ clientState                                        │                 │
│  │  ├─ productState                                       │                 │
│  │  └─ authState                                          │                 │
│  └────────────────────────────────────────────────────────┘                 │
│                                                                              │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │ HTTP/REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CAPA DE APLICACIÓN (API)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ HTTP Server (Gin Framework)                             │               │
│  │ ├─ Router                                               │               │
│  │ ├─ Request Parser                                       │               │
│  │ └─ Response Serializer                                  │               │
│  └──────────────────┬──────────────────────────────────────┘               │
│                     │                                                       │
│  ┌─────────────────▼──────────────────────────────────────┐               │
│  │ Middleware Stack                                         │               │
│  │ ├─ CORS Handler                                         │               │
│  │ ├─ Auth Middleware (JWT validation)                    │               │
│  │ ├─ Rate Limiter                                         │               │
│  │ ├─ Request Logger                                       │               │
│  │ ├─ Error Handler                                        │               │
│  │ └─ Request Validator                                    │               │
│  └──────────────────┬──────────────────────────────────────┘               │
│                     │                                                       │
│  ┌─────────────────▼──────────────────────────────────────┐               │
│  │ API Handlers/Controllers                                │               │
│  │ ├─ AuthHandler                                          │               │
│  │ ├─ QuoteHandler                                         │               │
│  │ ├─ ClientHandler                                        │               │
│  │ ├─ ProductHandler                                       │               │
│  │ └─ ReportHandler                                        │               │
│  └──────────────────┬──────────────────────────────────────┘               │
│                     │                                                       │
│  ┌─────────────────▼──────────────────────────────────────┐               │
│  │ Business Logic Layer (Services)                         │               │
│  │ ├─ AuthService                                          │               │
│  │ │  ├─ Login                                             │               │
│  │ │  ├─ Refresh Token                                     │               │
│  │ │  └─ Logout                                            │               │
│  │ ├─ QuoteService                                         │               │
│  │ │  ├─ Create (con validaciones de negocio)             │               │
│  │ │  ├─ Update                                            │               │
│  │ │  ├─ Change Status (con transiciones permitidas)      │               │
│  │ │  └─ GetById                                           │               │
│  │ ├─ PdfGenerationService                                 │               │
│  │ │  ├─ Render HTML                                       │               │
│  │ │  ├─ wkhtmltopdf conversion                           │               │
│  │ │  └─ Upload to S3                                      │               │
│  │ ├─ ClientService                                        │               │
│  │ ├─ ProductService                                       │               │
│  │ └─ ReportService                                        │               │
│  └──────────────────┬──────────────────────────────────────┘               │
│                     │                                                       │
│  ┌─────────────────▼──────────────────────────────────────┐               │
│  │ Data Access Layer (Repositories)                        │               │
│  │ ├─ QuoteRepository                                      │               │
│  │ │  ├─ Create()                                          │               │
│  │ │  ├─ GetById()                                         │               │
│  │ │  ├─ List()                                            │               │
│  │ │  ├─ Update()                                          │               │
│  │ │  └─ Delete()                                          │               │
│  │ ├─ QuoteDetailRepository                                │               │
│  │ ├─ ClientRepository                                     │               │
│  │ ├─ ProductRepository                                    │               │
│  │ └─ UserRepository                                       │               │
│  └──────────────────┬──────────────────────────────────────┘               │
│                     │ SQL Queries (sqlc / ORM)                             │
│                     │ Transacciones ACID                                  │
│                     │ Connection Pooling                                  │
│  ┌─────────────────▼──────────────────────────────────────┐               │
│  │ External Services                                       │               │
│  │ ├─ S3/Object Storage (PDFs)                            │               │
│  │ ├─ Redis (Caching)                                      │               │
│  │ ├─ Email Service (futuro)                              │               │
│  │ └─ SMS Service (futuro)                                │               │
│  └──────────────────┬──────────────────────────────────────┘               │
│                     │                                                       │
└──────────────────────┼───────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CAPA DE DATOS                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────┐             │
│  │ PostgreSQL Database                                        │             │
│  │ ├─ Tablas Transaccionales                                │             │
│  │ │  ├─ users                                              │             │
│  │ │  ├─ clients                                            │             │
│  │ │  ├─ products                                           │             │
│  │ │  ├─ quotes                                             │             │
│  │ │  ├─ quote_details                                      │             │
│  │ │  ├─ quote_history                                      │             │
│  │ │  └─ audit_log                                          │             │
│  │ ├─ Índices (por performance)                             │             │
│  │ ├─ Triggers (auditoría automática)                       │             │
│  │ ├─ Funciones PL/pgSQL                                    │             │
│  │ └─ Vistas (para reportes)                                │             │
│  └────────┬──────────────────────────────────────────────────┘             │
│           │                                                                 │
│           ├──────────────────┬─────────────────┬──────────────────┐        │
│           │                  │                 │                  │        │
│           ▼                  ▼                 ▼                  ▼        │
│    ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐  │
│    │ Primary    │    │ Standby 1  │    │ Standby 2  │    │ Backup     │  │
│    │ Instance   │◄───┤ (Read)     │    │ (Read)     │    │ Storage    │  │
│    │            │    │            │    │            │    │            │  │
│    │ WAL Logs   │    │ Replica    │    │ Replica    │    │ Archiving  │  │
│    │ Streaming  │    │            │    │            │    │            │  │
│    └────────────┘    └────────────┘    └────────────┘    └────────────┘  │
│           │                                                                 │
│    Replication / Failover (Patroni)                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

          ┌───────────────────────────────────────────────────┐
          │ CROSS-CUTTING CONCERNS                            │
          ├───────────────────────────────────────────────────┤
          │                                                    │
          │ ├─ Logging (Zap - structured)                    │
          │ ├─ Metrics (Prometheus)                          │
          │ ├─ Tracing (Jaeger - distributed tracing)        │
          │ ├─ Error Handling (custom error codes)           │
          │ ├─ Caching (Redis)                               │
          │ ├─ Queue (RabbitMQ - futuro async jobs)          │
          │ └─ Secrets Management (env vars + vault)         │
          │                                                    │
          └───────────────────────────────────────────────────┘
```

---

## 7. FLUJO DE DEPLOYMENT - GITOPS PIPELINE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE - GITHUB ACTIONS                           │
└─────────────────────────────────────────────────────────────────────────────┘

Developer Push
  │
  ├─ Commit to branch
  │
  ▼
┌──────────────────┐
│ GitHub Webhook   │ Trigger
└────────┬─────────┘
         │
         ▼
    ┌────────────────────────────────────┐
    │ WORKFLOW: Test & Build             │
    │ Trigger: push on any branch        │
    └──────────────┬─────────────────────┘
                   │
         ┌─────────┴────────────┐
         │                      │
         ▼                      ▼
    ┌──────────────┐      ┌──────────────┐
    │ Run Tests    │      │ Lint Code    │
    │ ├─ Unit      │      │ ├─ Go fmt    │
    │ ├─ Integ.    │      │ ├─ Vet       │
    │ └─ E2E       │      │ └─ Linter    │
    └──────┬───────┘      └──────┬───────┘
           │                     │
           └──────────┬──────────┘
                      │
                      ▼ (All passed?)
                  ┌────────────────┐
                  │ Build Docker   │
                  │ Image          │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Push to        │
                  │ Container      │
                  │ Registry       │
                  │ (ECR/Dockerhub)│
                  └────────┬───────┘
                           │
         ┌─────────────────┼──────────────────┐
         │                 │                  │
         │ Main branch?    │ PR?              │ Other?
         │                 │                  │
    YES  │            NO   │            NO    │
         ▼                 ▼                  ▼
    ┌─────────────┐   ┌─────────────┐   ┌──────────┐
    │ WORKFLOW:   │   │ WORKFLOW:   │   │ Stop     │
    │ Deploy to   │   │ Comment PR  │   │(skip)    │
    │ STAGING     │   │ with image  │   │          │
    │             │   │ link        │   │          │
    └──────┬──────┘   └─────────────┘   └──────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Deploy to K8s        │
    │ Cluster (Staging)    │
    │ ├─ Apply manifests   │
    │ ├─ Rolling update    │
    │ └─ Health check      │
    └──────┬───────────────┘
           │
           ▼ (Manual trigger)
    ┌────────────────────────┐
    │ Approval Gate          │
    │ (Manual review)        │
    │ Require 2 approvals    │
    └──────┬─────────────────┘
           │ Approved
           ▼
    ┌────────────────────────┐
    │ WORKFLOW: Deploy to    │
    │ PRODUCTION             │
    │ ├─ Tag image: v1.x.x   │
    │ ├─ K8s rollout         │
    │ ├─ Canary deployment   │
    │ ├─ Health checks       │
    │ ├─ Smoke tests         │
    │ └─ Rollback if fails   │
    └──────────────────────┘
```

---

## 8. ESTRUCTURA DE CARPETAS - BACKEND (Go)

```
cotishama-api/
├── cmd/
│   └── server/
│       └── main.go                 # Entry point
│
├── internal/
│   ├── config/
│   │   └── config.go               # Configuration management
│   │
│   ├── database/
│   │   ├── db.go                   # DB connection pool
│   │   ├── migrations/
│   │   │   ├── 001_init_schema.sql
│   │   │   ├── 002_add_indices.sql
│   │   │   └── 003_add_triggers.sql
│   │   └── sqlc/
│   │       └── queries/            # Generated SQL code
│   │
│   ├── domain/
│   │   ├── models.go               # Domain entities
│   │   ├── errors.go               # Domain errors
│   │   └── constants.go            # Domain constants
│   │
│   ├── repository/
│   │   ├── quote_repository.go
│   │   ├── client_repository.go
│   │   ├── product_repository.go
│   │   ├── user_repository.go
│   │   └── transaction.go          # TX manager
│   │
│   ├── service/
│   │   ├── auth_service.go
│   │   ├── quote_service.go
│   │   ├── client_service.go
│   │   ├── product_service.go
│   │   ├── pdf_service.go
│   │   └── report_service.go
│   │
│   ├── handler/
│   │   ├── auth_handler.go
│   │   ├── quote_handler.go
│   │   ├── client_handler.go
│   │   ├── product_handler.go
│   │   └── report_handler.go
│   │
│   ├── middleware/
│   │   ├── auth_middleware.go
│   │   ├── cors_middleware.go
│   │   ├── rate_limit_middleware.go
│   │   └── request_logger_middleware.go
│   │
│   ├── utils/
│   │   ├── jwt.go
│   │   ├── password.go
│   │   ├── validator.go
│   │   └── helpers.go
│   │
│   └── templates/
│       └── quote.html              # HTML template para PDF
│
├── pkg/
│   ├── logger/
│   │   └── logger.go               # Zap logger wrapper
│   │
│   ├── errors/
│   │   └── errors.go               # Error handling
│   │
│   └── metrics/
│       └── metrics.go              # Prometheus metrics
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/                   # Test data
│
├── docs/
│   ├── api.yaml                    # OpenAPI spec
│   ├── ARCHITECTURE.md
│   └── SETUP.md
│
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/
│   ├── test.yml
│   ├── build.yml
│   └── deploy.yml
│
├── go.mod
├── go.sum
├── Makefile
├── .env.example
└── README.md
```

---

## 9. MÉTRICAS DE MONITOREO EN PRODUCCIÓN

```
┌─────────────────────────────────────────────────────────────────────┐
│              PROMETHEUS METRICS DASHBOARD                           │
└─────────────────────────────────────────────────────────────────────┘

API PERFORMANCE:
├─ http_requests_total           # Total de requests por endpoint
├─ http_request_duration_seconds # Latencia (histograma)
├─ http_requests_in_progress     # Requests activas
└─ http_response_status          # Status codes (2xx, 4xx, 5xx)

BUSINESS METRICS:
├─ quotes_created_total          # Total de cotizaciones creadas
├─ quotes_by_status              # Cotizaciones por estado
├─ quote_total_amount_sum        # Suma de valores de cotizaciones
├─ pdf_generation_duration       # Tiempo de generación de PDFs
├─ pdf_generation_errors         # Errores en generación
└─ products_low_stock            # Productos con stock bajo

DATABASE:
├─ db_connection_pool_size       # Conexiones activas
├─ db_query_duration             # Duración de queries
├─ db_errors_total               # Errores de BD
└─ db_transaction_duration       # Duración de transacciones

SYSTEM:
├─ go_goroutines                 # Goroutines activas
├─ go_memstats_heap_alloc_bytes  # Memoria en uso
├─ process_cpu_seconds_total     # CPU
├─ process_resident_memory_bytes # RSS memory
└─ up                            # Server health
```

---

**FIN DE DIAGRAMAS ARQUITECTÓNICOS**

Estos diagramas complementan el documento ARCHITECTURE_V2.0.md
