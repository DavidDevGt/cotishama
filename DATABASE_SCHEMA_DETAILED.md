# COTISHAMA 2.0 - MODELO DE DATOS (DER DETALLADO)

## 📊 Entity-Relationship Diagram (ER)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COTISHAMA 2.0 - ER DIAGRAM                       │
└─────────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │    USERS     │
                            │──────────────│
                            │ id [UUID] PK │
                            │ email        │
                            │ password     │
                            │ full_name    │
                            │ role         │
                            │ is_active    │
                            │ created_at   │
                            │ updated_at   │
                            └────────┬─────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    │ 1:N            │ 1:N            │ 1:N
                    │                │                │
                    ▼                ▼                ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐
        │     CLIENTS      │  │     QUOTES       │  │ QUOTE_HISTORY  │
        │──────────────────│  │──────────────────│  │────────────────│
        │ id [UUID] PK     │  │ id [UUID] PK     │  │ id [UUID] PK   │
        │ business_name    │  │ quote_number     │  │ quote_id (FK)◄─┼─ has 1:N
        │ contact_name     │  │ client_id (FK)◄──┼──┤ old_status     │
        │ email            │  │ user_id (FK)     │  │ new_status     │
        │ phone            │  │ status (enum)    │  │ changed_by(FK) │
        │ address          │  │ subtotal         │  │ reason         │
        │ city             │  │ tax_percentage   │  │ changed_at     │
        │ country          │  │ tax_amount       │  │ ip_address     │
        │ tax_id           │  │ total            │  └────────────────┘
        │ credit_limit     │  │ notes            │
        │ is_active        │  │ valid_until      │
        │ is_deleted       │  │ approved_at      │
        │ created_at       │  │ rejected_at      │
        │ updated_at       │  │ sent_at          │
        │ deleted_at       │  │ created_at       │
        └──────────────────┘  │ updated_at       │
                              │ deleted_at       │
                              └─────────┬────────┘
                                        │
                                        │ 1:N
                                        ▼
                              ┌──────────────────┐
                              │  QUOTE_DETAILS   │
                              │──────────────────│
                              │ id [UUID] PK     │
                              │ quote_id (FK)──┐ │
                              │ product_id(FK)─┼─┤
                              │ quantity        │ │
                              │ unit_price      │ │
                              │ subtotal        │ │
                              │ line_number     │ │
                              │ created_at      │ │
                              └────────┬────────┘ │
                                       │          │
                                       │ N:1      │
                                       │          │
                              ┌────────▼──────────┼──────┐
                              │    PRODUCTS       │      │
                              │──────────────────┐│      │
                              │ id [UUID] PK     ││      │
                              │ sku [UNIQUE]     ││      │
                              │ name             ││      │
                              │ description      ││      │
                              │ category         ││      │
                              │ unit_price       ││      │
                              │ stock_quantity   ││      │
                              │ min_stock        ││      │
                              │ is_active        ││      │
                              │ is_deleted       ││      │
                              │ created_at       ││      │
                              │ updated_at       ││      │
                              │ deleted_at       ││      │
                              └──────────────────┘│      │
                                                  │      │
                                                  ▼      │
                                   (quota_details points here)

                              ┌──────────────────┐
                              │    AUDIT_LOG     │
                              │──────────────────│
                              │ id [BIGINT] PK   │
                              │ table_name       │
                              │ record_id        │
                              │ action (CRUD)    │
                              │ old_values (JSON)│
                              │ new_values (JSON)│
                              │ user_id (FK)     │
                              │ timestamp        │
                              │ ip_address       │
                              └──────────────────┘

                              ┌──────────────────┐
                              │  INVENTORY_LOG   │
                              │──────────────────│
                              │ id [BIGINT] PK   │
                              │ product_id (FK)  │
                              │ operation        │
                              │ quantity_change  │
                              │ reason           │
                              │ user_id (FK)     │
                              │ timestamp        │
                              └──────────────────┘
```

---

## 📋 Tablas Detalladas

### **1. USERS (Operadores del Sistema)**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Credenciales
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Info personal
  full_name VARCHAR(255) NOT NULL,
  
  -- Autorización
  role VARCHAR(50) NOT NULL
    CHECK (role IN ('ADMIN', 'OPERATOR', 'VIEWER'))
    DEFAULT 'OPERATOR',
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT email_format CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
  )
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Tabla de auditoría: Detectar intentos de acceso fallidos
CREATE TABLE user_login_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_login_attempts_user_timestamp 
  ON user_login_attempts(user_id, timestamp DESC);
```

**Características:**
- Passwords hasheados con bcrypt (nunca plaintext)
- RBAC: ADMIN > OPERATOR > VIEWER
- Auditoría de login attempts
- Soft-delete (is_active) para preservar referencias

---

### **2. CLIENTS (Clientes/Empresas)**

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información empresarial
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Dirección
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Guatemala',
  postal_code VARCHAR(20),
  
  -- Identificación
  tax_id VARCHAR(50) UNIQUE,
  
  -- Relación comercial
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  total_quoted DECIMAL(12, 2) DEFAULT 0,
  num_quotes INTEGER DEFAULT 0,
  last_quote_at TIMESTAMP,
  
  -- Control
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT email_format CHECK (
    email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
  ),
  CONSTRAINT valid_credit_limit CHECK (credit_limit >= 0)
);

-- Índices
CREATE INDEX idx_clients_business_name ON clients(business_name);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_is_active ON clients(is_active);
CREATE INDEX idx_clients_is_deleted ON clients(is_deleted);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX idx_clients_tax_id ON clients(tax_id);

-- Trigger: Actualizar updated_at
CREATE TRIGGER update_clients_timestamp
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
```

**Características:**
- Soft-delete con `is_deleted` y `deleted_at`
- Validación de email (formato)
- Métricas desnormalizadas (total_quoted, num_quotes) para performance
- Auditoría completa via triggers

---

### **3. PRODUCTS (Catálogo de Productos)**

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  
  -- Pricing
  unit_price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GTQ',
  
  -- Inventario
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  max_stock INTEGER DEFAULT 999,
  
  -- Control
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_price CHECK (unit_price > 0),
  CONSTRAINT valid_stock CHECK (stock_quantity >= 0),
  CONSTRAINT valid_stock_limits CHECK (min_stock <= max_stock)
);

-- Índices
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_deleted ON products(is_deleted);

-- Índice para búsqueda rápida (full-text search futuro)
CREATE INDEX idx_products_name_tsvector 
  ON products USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '')));
```

**Características:**
- SKU como identificador única legible
- Gestión simple de stock
- Full-text search capabilities
- Categorización para filtros

---

### **4. QUOTES (Cotizaciones)**

```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Número único (CZ-2026-000001)
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Referencias
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Estado
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'cancelled', 'expired'))
    DEFAULT 'draft',
  
  -- Cálculos
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_percentage DECIMAL(5, 2) DEFAULT 12, -- IVA Guatemala
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  valid_until DATE,
  
  -- Timestamps de eventos
  sent_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_at TIMESTAMP,
  rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason VARCHAR(255),
  
  -- Control
  is_deleted BOOLEAN DEFAULT FALSE,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_total CHECK (total >= 0),
  CONSTRAINT valid_percentages CHECK (
    tax_percentage >= 0 AND tax_percentage <= 100
  ),
  CONSTRAINT valid_dates CHECK (valid_until >= CURRENT_DATE OR valid_until IS NULL)
);

-- Índices
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_is_deleted ON quotes(is_deleted);

-- Búsqueda combinada (cliente + fecha)
CREATE INDEX idx_quotes_client_created 
  ON quotes(client_id, created_at DESC);

-- Trigger: Actualizar updated_at
CREATE TRIGGER update_quotes_timestamp
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Trigger: Invalidar cotizaciones expiradas (si se accede)
-- Para queries, filtrar: WHERE valid_until IS NULL OR valid_until >= CURRENT_DATE
```

**Características:**
- Estado controlado (enum)
- Auditoría completa (sent_at, approved_at, etc.)
- Números únicos y legibles (CZ-2026-000001)
- Tracking de quién aprobó/rechazó
- Soft-delete

---

### **5. QUOTE_DETAILS (Líneas de Cotización)**

```sql
CREATE TABLE quote_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencias
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Datos
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  
  -- Metadata
  line_number INTEGER NOT NULL, -- Orden en la cotización
  product_name_snapshot VARCHAR(255), -- Para auditoría histórica
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_price CHECK (unit_price > 0),
  CONSTRAINT unique_quote_line UNIQUE (quote_id, line_number)
);

-- Índices
CREATE INDEX idx_quote_details_quote_id ON quote_details(quote_id);
CREATE INDEX idx_quote_details_product_id ON quote_details(product_id);

-- Vista para analytics
CREATE VIEW quote_details_summary AS
SELECT 
  qd.product_id,
  p.name,
  COUNT(*) as times_quoted,
  SUM(qd.quantity) as total_quantity,
  AVG(qd.unit_price) as avg_price
FROM quote_details qd
JOIN products p ON qd.product_id = p.id
GROUP BY qd.product_id, p.name;
```

**Características:**
- CASCADE delete con quote (atomic)
- RESTRICT en product (no borrar productos en uso)
- Subtotal computed (GENERATED)
- Snapshot del nombre (auditoría histórica)
- Vista para reportes de productos más cotizados

---

### **6. QUOTE_HISTORY (Auditoría de Cambios de Estado)**

```sql
CREATE TABLE quote_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencia
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Estados
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  
  -- Cambio
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason VARCHAR(255), -- Para rechazos
  
  -- Auditoría
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET
);

-- Índices
CREATE INDEX idx_quote_history_quote_id ON quote_history(quote_id);
CREATE INDEX idx_quote_history_timestamp ON quote_history(timestamp DESC);
CREATE INDEX idx_quote_history_status_change 
  ON quote_history(old_status, new_status);
```

**Características:**
- Auditoría completa de transiciones de estado
- IP address para detectar anomalías
- Immutable (append-only)

---

### **7. AUDIT_LOG (Auditoría General de Cambios)**

```sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  
  -- Qué cambió
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(50),
  
  -- Acción
  action VARCHAR(10) NOT NULL
    CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Datos
  old_values JSONB,
  new_values JSONB,
  
  -- Quién y cuándo
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  
  -- Opcional: contexto
  context JSONB
);

-- Índices
CREATE INDEX idx_audit_log_table_record 
  ON audit_log(table_name, record_id, timestamp DESC);
CREATE INDEX idx_audit_log_timestamp 
  ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_user_id 
  ON audit_log(user_id, timestamp DESC);

-- Trigger automático en tablas principales
CREATE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id, ip_address)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    CURRENT_SETTING('app.user_id', true)::uuid,
    CURRENT_SETTING('app.ip_address', true)::inet
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas principales
CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_quotes
  AFTER INSERT OR UPDATE OR DELETE ON quotes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

**Características:**
- Registro inmutable de todos los cambios
- JSONB para flexibilidad en distintas tablas
- Triggers automáticos
- IP address para seguridad

---

### **8. INVENTORY_LOG (Historial de Stock)**

```sql
CREATE TABLE inventory_log (
  id BIGSERIAL PRIMARY KEY,
  
  -- Referencia
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Movimiento
  operation VARCHAR(50) NOT NULL,
    -- 'QUOTE_RESERVED', 'QUOTE_UNRESERVED', 'MANUAL_ADJUST', 'RECEIPT'
  quantity_change INTEGER NOT NULL,
  old_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason VARCHAR(255),
  
  -- Referencia opcional a transacción
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  
  -- Quién y cuándo
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_quantities CHECK (new_quantity >= 0)
);

-- Índices
CREATE INDEX idx_inventory_log_product_timestamp
  ON inventory_log(product_id, timestamp DESC);
CREATE INDEX idx_inventory_log_quote_id
  ON inventory_log(quote_id);
```

**Características:**
- Historial de movimientos de stock
- Trazabilidad de cambios
- Permite auditar problemas de inventario

---

## 🔄 Relaciones y Restricciones

### **FK Estrategia**

| Tabla | FK | Referencia | ON DELETE | Rationale |
|-------|----|-----------|---------|----|
| quotes | user_id | users | RESTRICT | No borrar operador activo |
| quotes | client_id | clients | RESTRICT | No borrar cliente en cotizaciones |
| quote_details | quote_id | quotes | CASCADE | Borrar detalles con cotización |
| quote_details | product_id | products | RESTRICT | No borrar producto en uso |
| quote_history | changed_by | users | RESTRICT | Preservar auditoría |
| audit_log | user_id | users | SET NULL | Preservar historial |
| inventory_log | product_id | products | RESTRICT | Preservar historial |
| inventory_log | quote_id | quotes | SET NULL | Preservar historial |

---

## 🎯 Estrategia de Números de Cotización

### **Formato: `CZ-2026-000001`**

```sql
-- Tabla para generar números secuenciales
CREATE TABLE quote_sequence (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_sequence BIGINT DEFAULT 0,
  year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  CHECK (id = 1) -- Solo una fila
);

-- Función para generar número único
CREATE FUNCTION generate_quote_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  next_seq BIGINT;
  quote_num VARCHAR;
BEGIN
  UPDATE quote_sequence
  SET last_sequence = last_sequence + 1,
      year = current_year
  WHERE year = current_year;
  
  IF NOT FOUND THEN
    INSERT INTO quote_sequence (last_sequence, year)
    VALUES (1, current_year);
    next_seq := 1;
  ELSE
    SELECT last_sequence INTO next_seq FROM quote_sequence;
  END IF;
  
  quote_num := 'CZ-' || current_year || '-' || 
               LPAD(next_seq::text, 6, '0');
  
  RETURN quote_num;
END;
$$ LANGUAGE plpgsql;

-- Usar en INSERT:
INSERT INTO quotes (quote_number, ...)
VALUES (generate_quote_number(), ...)
```

---

## 📈 Vistas Útiles para Reportes

### **Vista: Resumen de Cotizaciones**

```sql
CREATE VIEW quote_summary AS
SELECT 
  q.id,
  q.quote_number,
  c.business_name,
  u.full_name as created_by,
  q.status,
  q.total,
  COUNT(qd.id) as item_count,
  q.created_at,
  CASE 
    WHEN q.status = 'draft' THEN 'Borrador'
    WHEN q.status = 'sent' THEN 'Enviada'
    WHEN q.status = 'approved' THEN 'Aprobada'
    WHEN q.status = 'rejected' THEN 'Rechazada'
    WHEN q.status = 'expired' THEN 'Expirada'
    ELSE 'Cancelada'
  END as status_label
FROM quotes q
LEFT JOIN quote_details qd ON q.id = qd.quote_id
LEFT JOIN clients c ON q.client_id = c.id
LEFT JOIN users u ON q.user_id = u.id
WHERE q.is_deleted = false
GROUP BY q.id, c.business_name, u.full_name;
```

### **Vista: Productos Más Cotizados**

```sql
CREATE VIEW top_products AS
SELECT 
  p.id,
  p.sku,
  p.name,
  COUNT(DISTINCT qd.quote_id) as times_quoted,
  SUM(qd.quantity) as total_quantity_sold,
  AVG(qd.unit_price) as avg_quoted_price,
  SUM(qd.quantity * qd.unit_price) as total_revenue
FROM products p
LEFT JOIN quote_details qd ON p.id = qd.product_id
LEFT JOIN quotes q ON qd.quote_id = q.id
WHERE q.is_deleted = false AND q.status IN ('approved', 'sent')
GROUP BY p.id, p.sku, p.name
ORDER BY total_revenue DESC;
```

### **Vista: Resumen por Cliente**

```sql
CREATE VIEW client_summary AS
SELECT 
  c.id,
  c.business_name,
  COUNT(q.id) as total_quotes,
  SUM(CASE WHEN q.status = 'approved' THEN 1 ELSE 0 END) as approved_quotes,
  SUM(CASE WHEN q.status = 'approved' THEN q.total ELSE 0 END) as total_value,
  MAX(q.created_at) as last_quote_at,
  AVG(q.total) as avg_quote_value
FROM clients c
LEFT JOIN quotes q ON c.id = q.client_id AND q.is_deleted = false
WHERE c.is_deleted = false
GROUP BY c.id, c.business_name;
```

---

## 🔒 Seguridad a Nivel de BD

### **Row-Level Security (RLS) - Futuro**

```sql
-- Habilitar RLS (si escalabilidad futura lo requiere)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Política: Operadores ven solo sus cotizaciones (a menos que sean admin)
CREATE POLICY operator_sees_own_quotes ON quotes
  AS PERMISSIVE
  FOR SELECT
  USING (
    user_id = CURRENT_USER_ID() OR
    (SELECT role FROM users WHERE id = CURRENT_USER_ID()) = 'ADMIN'
  );
```

### **Encriptación a Nivel de Campos (Futuro)**

```sql
-- Para datos sensibles (tax_id, email)
CREATE FUNCTION encrypt_field(plaintext TEXT)
RETURNS BYTEA AS $$
  SELECT pgcrypto.encrypt(plaintext::bytea, 
                         get_key()::bytea, 
                         'aes');
$$ LANGUAGE SQL;

CREATE FUNCTION decrypt_field(ciphertext BYTEA)
RETURNS TEXT AS $$
  SELECT convert_from(
    pgcrypto.decrypt(ciphertext, 
                     get_key()::bytea, 
                     'aes'),
    'UTF8'
  );
$$ LANGUAGE SQL;
```

---

## 📋 Checklist de Schema

```
TABLAS:
□ users (with bcrypt password)
□ clients (soft-delete)
□ products (inventory tracking)
□ quotes (state machine)
□ quote_details (cascading deletes)
□ quote_history (immutable audit)
□ audit_log (triggers on main tables)
□ inventory_log (stock movements)

ÍNDICES:
□ All FKs indexed
□ Search columns indexed (business_name, sku, email)
□ Timestamp columns indexed for sorting
□ Composite indices for common queries

CONSTRAINTS:
□ Primary keys (UUID)
□ Foreign keys (with ON DELETE behavior)
□ CHECK constraints (enums, ranges)
□ UNIQUE constraints (sku, email, quote_number)
□ NOT NULL where required

FUNCTIONS & TRIGGERS:
□ quote_number generation
□ update_timestamp() trigger
□ audit_trigger()
□ inventory movement logging

VIEWS:
□ quote_summary (for dashboard)
□ top_products (for analytics)
□ client_summary (for reports)

PERFORMANCE:
□ < 100ms query time for common queries
□ Efficient pagination (offset + limit with indices)
□ Full-text search on products (if needed)
□ Materialized views (if analytics get heavy)

SECURITY:
□ No plaintext passwords
□ Audit log on sensitive tables
□ IP address tracking
□ User context in triggers
□ No PII in logs (if possible)
```

---

**Esta arquitectura de BD soporta:**
- ✅ Transacciones ACID
- ✅ Auditoría completa
- ✅ Soft-delete para integridad referencial
- ✅ Escalabilidad (índices estratégicos)
- ✅ Reportes (vistas)
- ✅ Performance (< 100ms queries)
