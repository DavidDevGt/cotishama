# Research: Sistema de Cotizaciones Fuzzy PDF

**Feature**: 001-quote-fuzzy-pdf  
**Date**: 2026-03-22  
**Source**: Plan.md Technical Context

## Research Questions

### 1. Testing Strategy for Bun/TypeScript Monorepo

**Question**: What testing framework and approach should be used?

**Decision**: Vitest + Testing Library
**Rationale**: 
- Vitest is the de-facto test runner for Bun ecosystem
- Works seamlessly with TypeScript without additional transpilation
- Compatible with React Testing Library for frontend component testing
- Fast execution (<100ms per test typical)

**Alternatives considered**:
- Jest: Not needed since Vitest provides Jest-compatible API
- Mocha: Less TypeScript native support, older ecosystem

---

### 2. PostgreSQL pg_trgm Fuzzy Search Configuration

**Question**: What similarity threshold and index configuration for optimal fuzzy search?

**Decision**: GIN index with pg_trgm, threshold 0.3-0.5
**Rationale**:
- pg_trgm provides trigram-based similarity using `similarity()` function
- GIN index provides fast lookups for large product catalogs (~154 products, scalable to 10k)
- Threshold 0.3 catches typos like "tornilo" → "tornillo", "blnca" → "blanca"
- Threshold 0.5 provides better precision for longer product names

**Alternatives considered**:
- pg_trgm with GiST index: Slower writes, faster reads for small datasets
- Levinshtein distance: More expensive computation, no index support
- External search (Elasticsearch): Overkill for <10k products

---

### 3. React-PDF Server-Side Generation in Hono

**Question**: How to generate PDFs server-side using React-PDF in Hono.js?

**Decision**: Use `@react-pdf/renderer` with Node.js stream
**Rationale**:
- @react-pdf/renderer works in Node.js environment
- Hono runs on Bun which has excellent Node.js compatibility
- Generate PDF as stream and return via proper content-type headers
- Use separate endpoint for PDF generation (not blocking main API)

**Implementation approach**:
1. Create PDF document component using react-pdf primitives
2. Render to stream using `renderToStream()` 
3. Return stream with `Content-Type: application/pdf`
4. Client receives as downloadable blob

**Alternatives considered**:
- html2canvas + jsPDF: Lower quality, text not selectable
- PDFKit: More manual layout, harder to maintain
- puppeteer: Heavy dependency, overkill for simple quotes

---

### 4. Optimistic UI Implementation Strategy

**Question**: How to implement optimistic updates for quote operations?

**Decision**: React Query with optimistic mutations
**Rationale**:
- React Query (TanStack Query) is specified in Constitution
- Supports `onMutate` for optimistic updates
- Automatic rollback on error via `onError`
- Works seamlessly with Next.js 15

**Implementation pattern**:
1. Before mutation: Cache current state, update UI immediately
2. On success: Let cache update naturally
3. On error: Rollback to cached state, show error toast

---

## Consolidated Decisions

| Decision Area | Choice | Justification |
|---------------|--------|---------------|
| Testing | Vitest | Bun-native, fast, TypeScript support |
| Fuzzy Search | pg_trgm GIN | Database-native, indexable, <500ms target achievable |
| PDF Generation | @react-pdf/renderer | React component model, professional output |
| State Management | React Query | Constitution requirement, optimistic UI support |
| Error Handling | Toast + Rollback | Constitution III (Optimistic UI) compliance |

---

## Implementation Notes

1. **pg_trgm setup**: Need to enable extension `CREATE EXTENSION pg_trgm;` and create index:
   ```sql
   CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);
   ```

2. **PDF endpoint**: Should be separate from main API for timeout handling:
   - `/api/quotes/:id/pdf` - returns PDF stream
   - Client uses `window.open()` or blob download

3. **Optimistic UI flows**:
   - Add to quote: Optimistically add item, rollback on error
   - Update quantity: Optimistically update, rollback on error
   - Save quote: Optimistically mark as saved, rollback on error

---

## References

- [pg_trgm documentation](https://www.postgresql.org/docs/current/pgtrgm.html)
- [@react-pdf/renderer](https://react-pdf.org/)
- [TanStack Query optimistic mutations](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Vitest documentation](https://vitest.dev/)
