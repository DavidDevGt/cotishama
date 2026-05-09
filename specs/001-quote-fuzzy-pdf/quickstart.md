# Quickstart: Sistema de Cotizaciones Fuzzy PDF

**Feature**: 001-quote-fuzzy-pdf  
**Date**: 2026-03-22

This guide helps developers get started with implementing the quote system.

---

## Prerequisites

- **Bun** (latest stable) - Runtime and package manager
- **Node.js** (v18+) - For some dependencies
- **PostgreSQL** with pg_trgm extension - Local or Supabase
- **Supabase project** - Database backend

---

## Project Structure

```
cotishama/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   │   └── src/
│   │       ├── app/           # App Router pages
│   │       ├── components/    # React components
│   │       ├── services/      # API client
│   │       └── hooks/         # React Query hooks
│   │
│   └── api/          # Hono.js backend
│       └── src/
│           ├── routes/     # API endpoints
│           ├── services/  # Business logic
│           ├── db/         # Drizzle schema
│           └── pdf/        # React-PDF generation
│
└── packages/
    ├── shared/        # Shared TypeScript types
    └── db/           # Database schema package
```

---

## Setup Steps

### 1. Database Setup

Enable pg_trgm extension in your PostgreSQL database:

```sql
-- Run in Supabase SQL Editor or local PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 2. Install Dependencies

```bash
# From project root
bun install
```

### 3. Configure Environment

Create `.env` files:

```bash
# apps/api/.env
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# apps/web/.env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Database Migrations

```bash
# From apps/api
bun run db:push
```

### 5. Start Development Servers

```bash
# Terminal 1: API server
cd apps/api
bun run dev

# Terminal 2: Web server
cd apps/web
bun run dev
```

---

## Key Implementation Areas

### Fuzzy Search

The search uses PostgreSQL pg_trgm for typo-tolerant matching:

```typescript
// Example search query (apps/api/src/services/product.ts)
import { sql } from 'drizzle-orm';
import { products } from '../db/schema';

async function searchProducts(query: string) {
  return db.select()
    .from(products)
    .where(sql`similarity(${products.name}, ${query}) > 0.3`)
    .orderBy(sql`similarity(${products.name}, ${query}) DESC`)
    .limit(20);
}
```

### Optimistic UI

Use React Query for optimistic updates:

```typescript
// Example (apps/web/src/hooks/useQuote.ts)
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useAddItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addItemToQuote,
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['quote', newItem.quoteId] });
      
      // Snapshot previous value
      const previousQuote = queryClient.getQueryData(['quote', newItem.quoteId]);
      
      // Optimistically update
      queryClient.setQueryData(['quote', newItem.quoteId], (old) => ({
        ...old,
        items: [...old.items, { ...newItem, optimistic: true }],
      }));
      
      return { previousQuote };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      queryClient.setQueryData(['quote', newItem.quoteId], context.previousQuote);
    },
  });
}
```

### PDF Generation

Generate PDFs server-side with React-PDF:

```typescript
// Example (apps/api/src/routes/pdf.ts)
import { renderToStream } from '@react-pdf/renderer';
import { QuoteDocument } from '../pdf/QuoteDocument';

app.get('/quotations/:id/pdf', async (c) => {
  const quote = await getQuote(c.params.id);
  
  const stream = await renderToStream(<QuoteDocument quote={quote} />);
  
  c.header('Content-Type', 'application/pdf');
  c.header('Content-Disposition', `attachment; filename="cotizacion-${quote.id}.pdf"`);
  
  return c.body(stream as any);
});
```

---

## Testing

```bash
# Run all tests
bun test

# Run tests for specific app
cd apps/api && bun test
cd apps/web && bun test

# Watch mode
bun test --watch
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Search latency | <500ms | pg_trgm query time |
| PDF generation | <3s | Server-side render |
| UI response | <100ms | Optimistic updates |

---

## Useful Commands

```bash
# TypeScript type checking
bun run typecheck

# Lint code
bun run lint

# Build for production
bun run build

# Database reset
cd apps/api && bun run db:reset
```

---

## Next Steps

1. **Database**: Set up Supabase project and run migrations
2. **API**: Implement product search and quote CRUD
3. **Frontend**: Build quote management UI with optimistic updates
4. **PDF**: Implement React-PDF template
5. **Testing**: Add unit and integration tests
