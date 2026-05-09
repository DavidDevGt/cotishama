---

description: "Task list for Sistema de Cotizaciones Fuzzy PDF implementation"
---

# Tasks: Sistema de Cotizaciones Fuzzy PDF

**Input**: Design documents from `/001-quote-fuzzy-pdf/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the feature specification - following Constitution guidelines for minimal viable testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- **Backend**: `apps/api/src/` (Hono.js)
- **Frontend**: `apps/web/src/` (Next.js 15)
- **Shared**: `packages/shared/src/`
- **Database**: `packages/db/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Bun Workspaces monorepo with apps/web and apps/api structure in package.json
- [ ] T002 [P] Setup apps/api with Hono.js and TypeScript in apps/api/package.json
- [ ] T003 [P] Setup apps/web with Next.js 15 App Router in apps/web/package.json
- [ ] T004 Configure TypeScript strict mode in tsconfig.json for all packages
- [ ] T005 Setup packages/shared with shared TypeScript types in packages/shared/src/
- [ ] T006 [P] Setup packages/db with Drizzle ORM configuration in packages/db/src/
- [ ] T007 Configure console logging infrastructure in apps/api/src/utils/logger.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Create Drizzle schema for products, quotations, quotation_items in packages/db/src/schema.ts
- [ ] T009 [P] Enable pg_trgm extension and create GIN index for fuzzy search in database/migrations/001_trgm_setup.sql
- [ ] T010 Setup Supabase client configuration in packages/db/src/client.ts
- [ ] T011 Create Product type definitions in packages/shared/src/types/product.ts
- [ ] T012 [P] Create Quotation type definitions in packages/shared/src/types/quotation.ts
- [ ] T013 Setup Hono.js app structure with error handling in apps/api/src/app.ts
- [ ] T014 Configure environment variables and validation in apps/api/src/config/env.ts
- [ ] T015 Create base API response types in packages/shared/src/types/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Búsqueda de Productos con Tolerancia a Errores (Priority: P1) 🎯 MVP

**Goal**: Allow users to search products using fuzzy search that tolerates typos

**Independent Test**: User can search with typos like "tornilo" → finds "tornillo", "blnca" → finds "blanca", "drmañ" → finds "de mano"

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement ProductService with fuzzy search using pg_trgm in apps/api/src/services/product_service.ts
- [ ] T017 [US1] Create GET /api/products/search endpoint in apps/api/src/routes/products.ts
- [ ] T018 [US1] Create ProductSearchAPI client in apps/web/src/services/product_api.ts
- [ ] T019 [US1] Create ProductSearchInput component in apps/web/src/components/ProductSearchInput.tsx
- [ ] T020 [US1] Create SearchResultsList component in apps/web/src/components/SearchResultsList.tsx
- [ ] T021 [US1] Implement useProductSearch hook with debounced search in apps/web/src/hooks/useProductSearch.ts
- [ ] T022 [US1] Integrate search UI into main page in apps/web/src/app/page.tsx
- [ ] T023 [US1] Add logging for search operations in apps/api/src/services/product_service.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Crear Cotización con Múltiples Ítems (Priority: P1)

**Goal**: Allow users to add multiple products to a quote and adjust quantities

**Independent Test**: User can add 5+ different products to a quote and all appear with correct prices and quantities

### Implementation for User Story 2

- [ ] T024 [P] [US2] Implement QuotationService for quote management in apps/api/src/services/quotation_service.ts
- [ ] T025 [P] [US2] Create POST /api/quotations endpoint in apps/api/src/routes/quotations.ts
- [ ] T026 [P] [US2] Create PUT /api/quotations/:id/items endpoint in apps/api/src/routes/quotations.ts
- [ ] T027 [US2] Create GET /api/quotations/:id endpoint in apps/api/src/routes/quotations.ts
- [ ] T028 [US2] Create QuotationAPI client in apps/web/src/services/quotation_api.ts
- [ ] T029 [US2] Create QuoteItemCard component in apps/web/src/components/QuoteItemCard.tsx
- [ ] T030 [US2] Create QuoteSummary component in apps/web/src/components/QuoteSummary.tsx
- [ ] T031 [US2] Create QuotePanel slide-over component in apps/web/src/components/QuotePanel.tsx
- [ ] T032 [US2] Implement useQuote hook with optimistic updates in apps/web/src/hooks/useQuote.ts
- [ ] T033 [US2] Add quantity adjustment and auto-calculate totals in apps/web/src/components/QuoteItemCard.tsx
- [ ] T034 [US2] Add logging for quote operations in apps/api/src/services/quotation_service.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Guardar Cotización con Snapshot de Precios (Priority: P1)

**Goal**: Save quotes with immutable price snapshots that protect against future price changes

**Independent Test**: User saves a quote, modifies product prices, and the saved quote still shows original prices

### Implementation for User Story 3

- [ ] T035 [P] [US3] Implement price snapshot logic in QuotationService in apps/api/src/services/quotation_service.ts
- [ ] T036 [US3] Create PUT /api/quotations/:id/save endpoint in apps/api/src/routes/quotations.ts
- [ ] T037 [US3] Implement duplicate quote functionality in apps/api/src/services/quotation_service.ts
- [ ] T038 [US3] Create QuoteSavedView component to display snapshot prices in apps/web/src/components/QuoteSavedView.tsx
- [ ] T039 [US3] Add "Duplicar" action in QuotePanel in apps/web/src/components/QuotePanel.tsx
- [ ] T040 [US3] Display saved timestamp and price snapshot in quote details in apps/web/src/components/QuoteSavedView.tsx
- [ ] T041 [US3] Add logging for save operations in apps/api/src/services/quotation_service.ts

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should work independently

---

## Phase 6: User Story 4 - Generar PDF Descargable (Priority: P1)

**Goal**: Generate professional PDF documents for quotes that can be downloaded or printed

**Independent Test**: User generates PDF and it contains all products, prices, totals, and company info

### Implementation for User Story 4

- [ ] T042 [P] [US4] Install @react-pdf/renderer in apps/api/package.json
- [ ] T043 [P] [US4] Create PDF document template in apps/api/src/pdf/QuotationPDF.tsx
- [ ] T044 [US4] Implement PDF generation service in apps/api/src/services/pdf_service.ts
- [ ] T045 [US4] Create GET /api/quotations/:id/pdf endpoint in apps/api/src/routes/pdf.ts
- [ ] T046 [US4] Create PDF download button in QuotePanel in apps/web/src/components/QuotePanel.tsx
- [ ] T047 [US4] Implement PDF client download function in apps/web/src/services/pdf_api.ts
- [ ] T048 [US4] Add validation to block PDF generation for draft quotes in apps/api/src/services/pdf_service.ts
- [ ] T049 [US4] Add logging for PDF generation in apps/api/src/services/pdf_service.ts

**Checkpoint**: All P1 user stories (US1-US4) should now be independently functional

---

## Phase 7: User Story 5 - Interfaz Simple con Pocos Pasos (Priority: P2)

**Goal**: Simple 3-step flow: Search Products → Review Quote → Generate PDF

**Independent Test**: New user can create and download a PDF with 3 products in under 2 minutes

### Implementation for User Story 5

- [ ] T050 [P] [US5] Design main layout with 3-step progress indicator in apps/web/src/app/page.tsx
- [ ] T051 [P] [US5] Create StepIndicator component in apps/web/src/components/StepIndicator.tsx
- [ ] T052 [US5] Implement navigation between steps in apps/web/src/app/page.tsx
- [ ] T053 [US5] Add tooltip/help component in apps/web/src/components/HelpTooltip.tsx
- [ ] T054 [US5] Add keyboard shortcuts for power users in apps/web/src/hooks/useKeyboardShortcuts.ts
- [ ] T055 [US5] Add unsaved changes confirmation dialog in apps/web/src/components/UnsavedChangesDialog.tsx (covers Edge Case: "usuario cierra navegador sin guardar")
- [ ] T056 [US5] Implement GET /api/quotations list endpoint in apps/api/src/routes/quotations.ts
- [ ] T057 [US5] Create QuoteHistory component in apps/web/src/components/QuoteHistory.tsx

**Checkpoint**: All user stories should now be complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Add error toast notifications in apps/web/src/components/ErrorToast.tsx
- [ ] T059 Implement retry logic for API calls in apps/web/src/services/api_client.ts
- [ ] T060 Add loading states and skeleton components in apps/web/src/components/

- [ ] T062 Add input validation and sanitization across all endpoints in apps/api/src/middleware/validation.ts
- [ ] T063 Run quickstart.md validation scenarios per quickstart.md
- [ ] T064 Final integration testing across all user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses products from US1 but independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Uses quotes from US2 but independently testable
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - Uses saved quotes from US3 but independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Integrates all stories

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before UI integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all P1 user stories (US1-US4) can start in parallel
- US5 (P2) can start after Foundational but benefits from US1-US4 being complete

---

## Parallel Example: User Story 1

```bash
# Launch all implementation for User Story 1 together:
Task: "Implement ProductService with fuzzy search in apps/api/src/services/product_service.ts"
Task: "Create GET /api/products/search endpoint in apps/api/src/routes/products.ts"
Task: "Create ProductSearchInput component in apps/web/src/components/ProductSearchInput.tsx"
Task: "Create SearchResultsList component in apps/web/src/components/SearchResultsList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Fuzzy Search)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - Fuzzy Search!)
3. Add User Story 2 → Test independently → Deploy/Demo (Add Items to Quote)
4. Add User Story 3 → Test independently → Deploy/Demo (Save with Snapshot)
5. Add User Story 4 → Test independently → Deploy/Demo (PDF Generation)
6. Add User Story 5 → Test independently → Deploy/Demo (Simple Interface)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Fuzzy Search)
   - Developer B: User Story 2 (Quote Items)
   - Developer C: User Story 3 (Price Snapshot)
3. Stories complete and integrate independently
4. Then:
   - Developer A: User Story 4 (PDF Generation)
   - Developer B: User Story 5 (Simple Interface)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Summary

- **Total Tasks**: 63
- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 8 tasks
- **Phase 3 (US1 - Fuzzy Search)**: 8 tasks
- **Phase 4 (US2 - Quote Items)**: 11 tasks
- **Phase 5 (US3 - Price Snapshot)**: 7 tasks
- **Phase 6 (US4 - PDF Generation)**: 8 tasks
- **Phase 7 (US5 - Simple Interface)**: 8 tasks
- **Phase 8 (Polish)**: 7 tasks

### MVP Scope (Phase 3)

- User Story 1 (Fuzzy Search) is the MVP
- Total: 8 implementation tasks + 7 setup + 8 foundational = 23 tasks before MVP

### Independent Test Criteria by Story

- **US1**: Search "tornilo" → finds "tornillo", "blnca" → finds "blanca"
- **US2**: Add 5 products → all appear with correct prices and quantities
- **US3**: Save quote, change product price, saved quote shows original price
- **US4**: Generate PDF → contains all items, prices, company info
- **US5**: Complete flow in under 2 minutes with 3 products
