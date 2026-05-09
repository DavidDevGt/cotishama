# Data Model: Sistema de Cotizaciones Fuzzy PDF

**Feature**: 001-quote-fuzzy-pdf  
**Date**: 2026-03-22  
**Source**: Feature specification and research findings

---

## Entities

### 1. Product (products)

Catálogo de productos de ferretería.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Product name |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | SKU/product code |
| `price` | DECIMAL(10,2) | NOT NULL, CHECK (price >= 0) | Unit price in Quetzales (Q) |
| `category` | VARCHAR(100) | NOT NULL | Product category |
| `available` | BOOLEAN | DEFAULT true | Product availability |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_products_name_trgm`: GIN index on `name` using pg_trgm for fuzzy search
- `idx_products_category`: B-tree index on `category`
- `idx_products_code`: B-tree index on `code`

**Validation Rules**:
- `name`: Required, max 255 characters
- `code`: Required, unique, max 50 characters
- `price`: Required, >= 0, max 2 decimal places
- `category`: Required, max 100 characters

---

### 2. Quotation (quotations)

Cotizaciones guardadas con snapshot de precios.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `client_name` | VARCHAR(255) | NOT NULL | Client name |
| `client_address` | VARCHAR(500) | NULL | Client address |
| `status` | VARCHAR(20) | DEFAULT 'draft', CHECK (status IN ('draft', 'saved', 'void')) | Quote status |
| `prices_snapshot` | JSONB | NOT NULL | Immutable price snapshot |
| `observations` | TEXT | NULL | Additional notes |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_quotations_status`: B-tree index on `status`
- `idx_quotations_created_at`: B-tree index on `created_at`

**Validation Rules**:
- `client_name`: Required, max 255 characters
- `client_address`: Optional, max 500 characters
- `status`: Must be one of: draft, saved, void
- `prices_snapshot`: Required, must be valid JSON object

**Price Snapshot Structure**:
```json
{
  "created_at": "2026-03-22T10:30:00Z",
  "items": [
    {
      "product_id": "uuid",
      "product_name": "Tornillo 1 pulgada",
      "unit_price": 0.50
    }
  ]
}
```

---

### 3. Quotation Item (quotation_items)

Líneas de cotización (ítems individuales).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `quotation_id` | UUID | NOT NULL, FK -> quotations(id) | Parent quote |
| `product_id` | UUID | NOT NULL, FK -> products(id) | Referenced product |
| `quantity` | INTEGER | NOT NULL, CHECK (quantity > 0) | Item quantity |
| `unit_price` | DECIMAL(10,2) | NOT NULL, CHECK (unit_price >= 0) | Price from snapshot |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes**:
- `idx_quotation_items_quotation_id`: B-tree index on `quotation_id`

**Validation Rules**:
- `quotation_id`: Required, must reference existing quotation
- `product_id`: Required, must reference existing product
- `quantity`: Required, must be positive integer
- `unit_price`: Required, >= 0 (snapshot price)

---

## Relationships

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  products   │       │   quotations    │       │ quotation_items  │
├─────────────┤       ├─────────────────┤       ├──────────────────┤
│ id (PK)     │       │ id (PK)         │       │ id (PK)          │
│ name        │       │ client_name     │       │ quotation_id (FK)│
│ code        │       │ client_address  │◄──────│ product_id (FK)  │
│ price       │       │ status          │       │ quantity         │
│ category    │       │ prices_snapshot │       │ unit_price       │
│ available   │       │ observations    │       │ created_at       │
│ created_at  │       │ created_at      │       └──────────────────┘
└─────────────┘       └─────────────────┘              │
       │                     │                        │
       │                     │ 1:N                   │1:1
       └─────────────────────┘                       │
                      quotes have                     │
                      many items                      │
                                                     │
                    ┌─────────────────────────────────┘
                    │
                    ▼
            Each item references
            product at snapshot price
```

**Cardinality**:
- `products` 1:N `quotation_items` (a product can be in many quote items)
- `quotations` 1:N `quotation_items` (a quote has many items)

---

## State Transitions

### Quotation Status

```
draft ──► saved ──► void
  │          │
  └──────────┴── (can only go to saved once)
  
Notes:
- draft: Working quote, not yet saved
- saved: Finalized quote with price snapshot locked
- void: Cancelled/invalid quote
```

---

## Implementation Notes

### Drizzle Schema Example

```typescript
// products table
export const products = pgTable('products', {
  id: uuid('id').defaultGen().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// quotations table
export const quotations = pgTable('quotations', {
  id: uuid('id').defaultGen().primaryKey(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientAddress: varchar('client_address', { length: 500 }),
  status: varchar('status', { length: 20 }).default('draft'),
  pricesSnapshot: jsonb('prices_snapshot').notNull(),
  observations: text('observations'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// quotation_items table
export const quotationItems = pgTable('quotation_items', {
  id: uuid('id').defaultGen().primaryKey(),
  quotationId: uuid('quotation_id').references(() => quotations.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### pg_trgm Index Setup

```sql
-- Enable extension (run once)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index for fuzzy search
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- Example fuzzy query
SELECT * FROM products 
WHERE similarity(name, 'tornilo') > 0.3
ORDER BY similarity(name, 'tornilo') DESC
LIMIT 20;
```
