# Testing Quick Start

## Before You Start

Ensure services are running:

```bash
# Terminal 1: Frontend
cd apps/frontend && bun run dev

# Terminal 2: Backend
cd apps/backend && bun --hot src/index.ts

# Terminal 3: Database (if needed)
docker-compose up -d postgres redis
```

## Running Tests

### All Tests
```bash
bun run test:quality    # Run unit + integration + E2E (comprehensive)
```

### By Type

```bash
# Unit Tests (fast - 30 seconds)
bun run test:unit

# Integration Tests (medium - 1-2 minutes)
bun run test:integration

# E2E Tests (slower - 3-5 minutes)
bun run test:e2e        # Headless

# Security Tests
bun run test:security
```

### Development Workflow

```bash
# Watch unit tests while coding
bun run test:unit:watch

# Debug E2E tests interactively
bun run test:e2e:debug

# View E2E tests in browser UI
bun run test:e2e:ui
```

### Reports

```bash
# Generate coverage report
bun run test:coverage

# View HTML test report
bun run test:report
```

## What Gets Tested

| Layer | Tests | Coverage |
|-------|-------|----------|
| **E2E** | 40+ scenarios | Authentication, Quotes, Clients, Performance, Accessibility |
| **API** | 30+ endpoints | Auth, Quotes, Clients |
| **Unit** | Component & utility tests | Logic, calculations, formatting |
| **Security** | Vulnerability tests | JWT, passwords, injection prevention |

## Test Data

### Pre-seeded Users
- Admin: `admin@cotishama.local` / `Admin123!Secure`
- Manager: `manager@cotishama.local` / `Manager123!Secure`
- User: `user@cotishama.local` / `User123!Secure`

### Auto-generated Test Data
- Test emails: `test-{timestamp}@cotishama.local`
- Unique data per test run (safe for parallel execution)

## Troubleshooting

### Tests Won't Start
```bash
# Ensure all dependencies installed
bun install

# Seed database with test users
bun run db:seed
```

### E2E Tests Failing
```bash
# Make sure frontend runs on correct port
# Default: http://localhost:5173
# Set: PLAYWRIGHT_TEST_BASE_URL=http://localhost:5173

# Debug a specific test
bun run test:e2e tests/e2e/auth.spec.ts --debug
```

### API Tests Failing
```bash
# Verify backend is running
curl http://localhost:3000/api/health

# Check API URL (default: http://localhost:3000/api)
# Set: API_URL=http://localhost:3000/api
```

## CI/CD Pipeline

Tests run automatically on:
- ✅ Push to branches
- ✅ Pull requests
- ✅ Scheduled nightly runs

All tests are **non-blocking** in CI - failures don't stop the pipeline.

## Performance Expectations

| Test Type | Duration | Count |
|-----------|----------|-------|
| Unit Tests | ~30 seconds | 50+ |
| Integration Tests | ~1-2 minutes | 30+ |
| E2E Tests | ~3-5 minutes | 40+ |
| **Total** | **~10 minutes** | **120+** |

## Key Files

- **Playwright Config:** `playwright.config.ts`
- **E2E Tests:** `tests/e2e/**/*.spec.ts`
- **API Tests:** `tests/integration/**/*.test.ts`
- **Unit Tests:** `tests/unit/**/*.test.ts`
- **Test Fixtures:** `tests/e2e/fixtures/auth-fixtures.ts`
- **Test Utilities:** `tests/e2e/utils/test-helpers.ts`
- **Full Guide:** `TESTING_STRATEGY.md`

## Next Steps

1. Run `bun run test:quality` to validate the entire test suite
2. Fix any failing tests by updating selectors/assertions
3. Add `data-testid` attributes to UI components
4. Create unit tests for new backend utilities
5. Add E2E tests for new features

---

**Documentation:** See `TESTING_STRATEGY.md` for comprehensive testing guide
