# API Contracts: Sistema de Cotizaciones Fuzzy PDF

**Feature**: 001-quote-fuzzy-pdf  
**Date**: 2026-03-22

This directory contains API contract definitions for external interfaces.

---

## Contracts

### 1. Product Search API

**Endpoint**: `GET /api/products/search`

Fuzzy search for products using PostgreSQL pg_trgm.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (supports typos) |
| `limit` | number | No | Max results (default: 20) |

**Response** (200 OK):
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Tornillo 1 pulgada",
      "code": "TOR-001",
      "price": 0.50,
      "category": "Herramientas Manuales",
      "available": true
    }
  ]
}
```

**Error Responses**:
- 400: Missing `q` parameter
- 500: Server error

---

### 2. Quote Management API

#### Create Quote
**Endpoint**: `POST /api/quotations`

Create a new quotation (draft).

**Request Body**:
```json
{
  "clientName": "Juan Pérez",
  "clientAddress": "Ciudad, Guatemala",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10
    }
  ],
  "observations": "Entrega en 3 días"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "clientName": "Juan Pérez",
  "clientAddress": "Ciudad, Guatemala",
  "status": "draft",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Tornillo 1 pulgada",
      "quantity": 10,
      "unitPrice": 0.50,
      "subtotal": 5.00
    }
  ],
  "total": 5.00,
  "pricesSnapshot": {...},
  "createdAt": "2026-03-22T10:30:00Z"
}
```

#### Get Quote
**Endpoint**: `GET /api/quotations/:id`

Retrieve a quotation by ID.

**Response** (200 OK):
```json
{
  "id": "uuid",
  "clientName": "Juan Pérez",
  "clientAddress": "Ciudad, Guatemala",
  "status": "saved",
  "items": [...],
  "total": 150.00,
  "pricesSnapshot": {...},
  "createdAt": "2026-03-22T10:30:00Z",
  "updatedAt": "2026-03-22T10:35:00Z"
}
```

#### List Quotes
**Endpoint**: `GET /api/quotations`

List all quotations with optional filters.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (draft, saved, void) |
| `limit` | number | No | Max results (default: 50) |
| `offset` | number | No | Pagination offset |

**Response** (200 OK):
```json
{
  "quotations": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### Save Quote
**Endpoint**: `PUT /api/quotations/:id/save`

Save a draft quotation, locking prices in snapshot.

**Response** (200 OK):
```json
{
  "id": "uuid",
  "status": "saved",
  "pricesSnapshot": {
    "createdAt": "2026-03-22T10:30:00Z",
    "items": [...]
  }
}
```

#### Update Quote Items
**Endpoint**: `PUT /api/quotations/:id/items`

Update items in a draft quotation.

**Request Body**:
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 5
    }
  ]
}
```

**Response** (200 OK): Updated quote with recalculated totals.

---

### 3. PDF Generation API

**Endpoint**: `GET /api/quotations/:id/pdf`

Generate and download PDF for a saved quotation.

**Response** (200 OK):
- `Content-Type`: `application/pdf`
- `Content-Disposition`: `attachment; filename="cotizacion-{id}.pdf"`

**Error Responses**:
- 404: Quote not found
- 400: Quote is in draft status (must save first)
- 500: PDF generation failed

---

## Internal Types

```typescript
// Product
interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  category: string;
  available: boolean;
}

// Quotation Item
interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Price Snapshot
interface PriceSnapshot {
  createdAt: string;
  items: {
    productId: string;
    productName: string;
    unitPrice: number;
  }[];
}

// Quotation
interface Quotation {
  id: string;
  clientName: string;
  clientAddress?: string;
  status: 'draft' | 'saved' | 'void';
  items: QuotationItem[];
  total: number;
  pricesSnapshot: PriceSnapshot;
  observations?: string;
  createdAt: string;
  updatedAt?: string;
}
```
