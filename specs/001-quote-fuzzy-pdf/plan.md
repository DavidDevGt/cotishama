# Implementation Plan: Sistema de Cotizaciones Fuzzy PDF

**Branch**: `001-quote-fuzzy-pdf` | **Date**: 2026-03-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-quote-fuzzy-pdf/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Sistema de Cotizaciones para Ferretería Shama con búsqueda fuzzy tolerante a errores tipográficos, creación de cotizaciones con múltiples ítems, guardado con snapshot de precios inmutables, y generación de PDF descargable. El sistema usa búsqueda PostgreSQL pg_trgm con índice GIN para fuzzy search y React-PDF para generación de documentos.

## Technical Context

**Language/Version**: TypeScript (strict mode - per Constitution)  
**Primary Dependencies**: Bun, Hono.js, Next.js 15 (App Router), Drizzle ORM, React-PDF, @supabase/postgrest, pg_trgm  
**Storage**: PostgreSQL via Supabase with Drizzle ORM  
**Testing**: Vitest (per Bun/TypeScript ecosystem)  
**Target Platform**: Linux server (Hono backend), Web browser (Next.js frontend)
**Project Type**: Web application (monorepo with frontend + backend)  
**Performance Goals**: Search <500ms, PDF generation <3s  
**Constraints**: Single-user mode (basic auth), <200ms p95 for search queries, console logging only  
**Scale/Scope**: ~154 products in 8 categories, less than 10,000 products expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Strict TypeScript | ✅ COMPLIANT | TypeScript with strict mode required per Constitution |
| II. Monorepo with Bun Workspaces | ✅ COMPLIANT | Spec confirms monorepo with Bun Workspaces |
| III. Optimistic UI | ✅ COMPLIANT | Must implement for all mutations (search, add item, save quote) |
| IV. Price Snapshot | ✅ COMPLIANT | FR-006 and FR-007 explicitly require price snapshot |
| V. No Stacked Modals | ✅ COMPLIANT | Must use slide-over panels for secondary content |
| Technology Stack | ✅ COMPLIANT | All technologies match Constitution requirements |

**Gate Result**: PASSED - No violations detected

## Project Structure

### Documentation (this feature)

```text
specs/001-quote-fuzzy-pdf/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (API contracts for external interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Based on the Constitution (Monorepo with Bun Workspaces) and spec (Next.js 15 + Hono.js):

```text
apps/
├── web/                  # Next.js 15 frontend (per spec)
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├──components/  # React components
│   │   ├── services/   # API client functions
│   │   └── hooks/      # Custom React hooks
│   └── tests/
│
└── api/                  # Hono.js backend (per spec)
    ├── src/
    │   ├── routes/     # API route handlers
    │   ├── services/   # Business logic
    │   ├── db/         # Drizzle schema and migrations
    │   └── pdf/        # React-PDF generation
    └── tests/

packages/
├── shared/              # Shared types and utilities
│   └── src/
└── db/                  # Database schema package
    └── src/
```

**Structure Decision**: Using Bun Workspaces monorepo structure with `apps/web` (Next.js 15) and `apps/api` (Hono.js), plus shared packages for types and database schema. This aligns with Constitution II (Monorepo) and Constitution technology stack requirements.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all gates passed.

---

## Constitution Check (Post-Design)

*Re-evaluated after Phase 1 design* | **Date**: 2026-03-22

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Strict TypeScript | ✅ COMPLIANT | TypeScript with strict mode required per Constitution |
| II. Monorepo with Bun Workspaces | ✅ COMPLIANT | apps/web + apps/api structure confirmed in plan.md |
| III. Optimistic UI | ✅ COMPLIANT | Documented in research.md, must implement in React Query hooks |
| IV. Price Snapshot | ✅ COMPLIANT | prices_snapshot JSONB in quotations entity (data-model.md) |
| V. No Stacked Modals | ✅ COMPLIANT | Use slide-over panels as per Constitution |
| Technology Stack | ✅ COMPLIANT | Bun, Hono.js, Next.js 15, Drizzle ORM, React-PDF, pg_trgm |

**Gate Result**: PASSED - Design phase confirmed compliance
