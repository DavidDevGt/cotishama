<!---
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles: None
- Added sections:
  - VI. SOLID Estricto (Single Responsibility, Open/Closed, Dependency Inversion)
  - VII. Estructura de Backend Hono (routes, controllers, services, repositories, schemas)
  - VIII. Buenas Prácticas de Código (TypeScript strict, Zod validation, error handling, pure functions, naming conventions, file size limits)
- Removed sections: None
- Templates requiring updates:
  - ✅ plan-template.md (Constitution Check placeholder remains generic - acceptable)
  - ✅ spec-template.md (no changes needed - generic)
  - ✅ tasks-template.md (no changes needed - generic)
  - ✅ commands/* (no files exist - no updates needed)
- Follow-up TODOs: None
--->

# Cotishama Constitution

## Core Principles

### I. Strict TypeScript
TypeScript MUST be used in all codebases with strict mode enabled. No `any` types permitted except in strictly controlled interoperability layers. All packages MUST pass `tsc --strict` without errors. This ensures type safety, catchable errors at compile time, and better IDE support.

### II. Monorepo with Bun Workspaces
All projects MUST be organized as a monorepo using Bun Workspaces. Shared code MUST be extracted into packages within the workspace. No code duplication across apps/packages. Workspace dependencies MUST use exact version matching to ensure reproducible builds.

### III. Optimistic UI (NON-NEGOTIABLE)
All user-facing mutations MUST implement optimistic updates. UI MUST reflect expected result immediately while background operation completes. On failure, UI MUST rollback with clear error messaging. This ensures responsive user experience without waiting for server confirmation.

### IV. Price Snapshot (Inmutabilidad de Precios)
Prices in quotes are immutable once created. A quote MUST capture prices as a snapshot at creation time - any price changes require creating a new quote version. This prevents pricing disputes and ensures auditability of commercial agreements.

### V. No Stacked Modals
Modal dialogs MUST NOT be stacked. Secondary content MUST use slide-over panels (drawers) instead of opening new modals on top of existing ones. This prevents accessibility issues and confusing UX hierarchies.

### VI. SOLID Estricto (NON-NEGIABLE)
All code MUST follow SOLID principles strictly:

- **Single Responsibility**: Each file or function MUST do exactly one thing. Hono handlers MUST only orchestrate; business logic MUST reside in services. A file with multiple responsibilities MUST be split.

- **Open/Closed**: Business logic MUST be implemented in extensible classes or functions that can be added to without modifying the core. Use composition and strategy patterns to enable extension.

- **Dependency Inversion**: Handlers MUST receive injected dependencies (db, services) rather than importing them directly. Use constructor injection or parameter passing. High-level modules MUST NOT depend on low-level modules.

### VII. Estructura de Backend Hono (OBLIGATORIA)
Backend applications using Hono MUST follow this layered structure:

- **routes/**: Defines routes only. Contains route definitions and HTTP method mappings.
- **controllers/**: Orchestrates request/response. Receives HTTP context, calls services, formats responses.
- **services/**: Pure business logic. No HTTP context, no database access. Receives and returns domain objects.
- **repositories/**: All database access using Drizzle ORM. Implements data persistence and retrieval.
- **schemas/**: Zod validation schemas for all inputs and outputs.

This separation ensures testability, maintainability, and clear separation of concerns.

### VIII. Buenas Prácticas de Código (NON-NEGOABLE)
All code MUST adhere to these practices:

- **TypeScript Estricto**: `strict: true` in tsconfig.json. Zero use of `any` type permitted.
- **Validación con Zod**: All input MUST be validated with Zod before reaching the service layer. No unvalidated data flows into business logic.
- **Manejo de Errores Centralizado**: Use Hono's error middleware for centralized error handling. Never use loose try/catch blocks without proper error propagation.
- **Funciones Puras**: Prefer pure functions with no hidden side effects. When side effects are necessary, they MUST be explicit and documented.
- **Nombres Descriptivos**: No abbreviations. No single-letter variables except loop indices. Use meaningful, self-documenting names.
- **Un Archivo = Una Responsabilidad**: If a file exceeds 150 lines, it MUST be split. This is a strong signal that the file is doing too much.

## Technology Stack

The following technologies are REQUIRED for all implementations:

- **Runtime**: Bun (latest stable)
- **Backend**: Hono.js with TypeScript
- **Frontend**: Next.js 15 with App Router
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Styling**: CSS Modules or Tailwind CSS (no component libraries with pre-built modals)
- **State**: React Query or similar for server state management
- **Validation**: Zod for all input/output validation

All dependencies MUST be compatible with the above stack. Alternative technologies require explicit approval via constitutional amendment.

## Deployment Strategy

### Backend Deployment
Backend applications MUST deploy to Railway or Fly.io. All backend services MUST have:
- Containerized deployment via Dockerfile
- Environment-based configuration
- Health check endpoints
- Structured logging (JSON format)

### Frontend Deployment
Frontend applications MUST deploy to Vercel. All frontend deployments MUST have:
- Static export or server-side rendering as appropriate
- Environment variables for API endpoints
- Performance budgets in place

## Governance

This constitution supersedes all other development practices. All PRs and code reviews MUST verify compliance with these principles.

### Amendment Procedure
1. Proposed changes MUST be documented in a PR with rationale
2. Changes require approval from at least one maintainer
3. MAJOR version bumps require migration plan for existing deployments
4. Changes MUST be communicated in CHANGELOG before release

### Versioning Policy
- **MAJOR**: Backward incompatible changes to principles or technology stack
- **MINOR**: New principles or material expansions to existing guidance
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Review
Every feature implementation plan MUST include a Constitution Check verifying:
- TypeScript strict mode compliance
- Monorepo structure adherence
- Optimistic UI implementation
- Price immutability handling
- Modal/slide-over pattern usage
- Technology stack alignment
- SOLID principles application
- Hono layered structure compliance
- Zod validation usage
- Centralized error handling implementation

**Version**: 1.1.0 | **Ratified**: 2026-03-22 | **Last Amended**: 2026-03-22
