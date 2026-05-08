# Testing Strategy & Quality Assurance

## Overview

Cotishama 2.0 implements a comprehensive, multi-layered testing strategy to ensure enterprise-grade quality, reliability, and performance. This document outlines the testing approach, test coverage, and how to execute tests.

## Testing Pyramid

```
        ┌─────────────────┐
        │   E2E Tests     │ (5-10%)
        │   Playwright    │
        ├─────────────────┤
        │Integration Tests│ (15-25%)
        │   API Tests     │
        │  Unit Tests     │
        ├─────────────────┤
        │  Unit Tests     │ (65-80%)
        │  Components     │
        │  Utils/Libs     │
        └─────────────────┘
```

## Test Categories

### 1. Unit Tests (65-80%)

Test individual functions, components, and utilities in isolation.

**Location:** `tests/unit/**/*.test.ts`

**Coverage:**
- Authentication utilities (JWT, password hashing)
- Configuration parsing
- Data validators
- UI component behavior
- Utility functions

**Run:**
```bash
bun run test:unit
bun run test:unit:watch
```

### 2. Integration Tests (15-25%)

Test API endpoints and component interactions without the frontend.

**Location:** `tests/integration/**/*.test.ts`

**Coverage:**
- Authentication API endpoints
- Quote management endpoints
- Client management endpoints
- Error handling and validation
- Database operations

**Run:**
```bash
bun run test:integration
```

### 3. End-to-End Tests (5-10%)

Test complete user flows through the entire application using Playwright.

**Location:** `tests/e2e/**/*.spec.ts`

**Coverage:**
- User authentication flows
- Quote creation, editing, deletion
- Client management workflows
- Search and filtering
- PDF export functionality
- Mobile responsiveness
- Accessibility compliance

**Run:**
```bash
bun run test:e2e            # Headless mode
bun run test:e2e:ui         # Interactive mode
bun run test:e2e:debug      # Debug mode
```

## E2E Test Suites

### Auth Flows (`tests/e2e/auth.spec.ts`)

- Login with valid credentials
- Error handling (invalid email, wrong password)
- Session persistence
- Logout and session clearing
- Protected route access
- Token refresh mechanism
- Form validation
- Focus management

### Quote Management (`tests/e2e/quotes.spec.ts`)

- Quote list display
- Create new quote
- Edit existing quote
- Delete quote with confirmation
- Filter by status
- Search functionality
- PDF export
- Data validation

### Client Management (`tests/e2e/clients.spec.ts`)

- Client list display
- Create client
- Edit client details
- Delete client
- Search by name
- Sort operations
- View client details
- Link quotes to clients

### Performance & Accessibility (`tests/e2e/performance.spec.ts`)

- Page load time < 3 seconds
- Proper page titles
- Accessible form labels
- Keyboard navigation
- Color contrast ratios
- Image alt texts
- Mobile responsiveness (375px viewport)
- Long content handling
- Focus indicators
- API response caching

## API Test Suites

### Authentication Tests (`tests/integration/api-auth.test.ts`)

- User registration
- User login
- Credentials validation
- Token refresh
- Token verification
- Protected route access
- Bearer token validation

### Quotes API (`tests/integration/api-quotes.test.ts`)

- Create quote
- Retrieve list
- Retrieve single quote
- Update quote
- Delete quote
- Field validation
- Pagination
- Status filtering
- Search functionality

### Clients API (`tests/integration/api-clients.test.ts`)

- Create client
- Retrieve list
- Retrieve single client
- Update client
- Delete client
- Email validation
- Pagination
- Search
- Sorting
- Client quotes retrieval

## Running Tests

### All Tests

```bash
bun run test:all        # Run all tests
bun run test:ci         # Run with CI timeouts (15s)
bun run test:quality    # Unit + Integration + E2E
```

### By Category

```bash
bun run test:unit       # Unit tests only
bun run test:integration # API integration tests
bun run test:security   # Security tests
bun run test:e2e        # E2E tests (headless)
```

### Development

```bash
bun run test:unit:watch # Watch unit tests during development
bun run test:e2e:ui     # Interactive E2E test execution
bun run test:e2e:debug  # Debug failing E2E tests
```

### Reports

```bash
bun run test:coverage   # Generate coverage report
bun run test:report     # View HTML test report
```

## Test Configuration

### Playwright Configuration (`playwright.config.ts`)

- **Browsers:** Chromium, Firefox, WebKit
- **Devices:** Desktop Chrome, Firefox, Safari, Mobile Chrome (Pixel 5)
- **Timeouts:** 30s per test
- **Retries:** 2 retries on CI, 0 on local
- **Reporters:** HTML, JSON, JUnit XML
- **Screenshots:** On failure
- **Videos:** On failure
- **Traces:** On first retry

### Test Fixtures (`tests/e2e/fixtures/auth-fixtures.ts`)

- `authenticatedPage` - Pre-authenticated browser session
- `helpers` - TestHelpers utility class
- `testEmail` - Unique test email generation

## Test Data

### Test Users

```
admin:    admin@cotishama.local / Admin123!Secure
manager:  manager@cotishama.local / Manager123!Secure
user:     user@cotishama.local / User123!Secure
```

## CI/CD Integration

All tests run automatically on:
- Push to main branches
- Pull requests
- Scheduled runs

Tests run with `continue-on-error: true` to prevent pipeline blockage while tracking failures.

## Best Practices

### Writing Tests

1. Use `data-testid` attributes for element selection
2. Avoid hardcoded timeouts - use proper waits
3. Use test fixtures for common setup
4. Write meaningful assertions with error messages
5. Keep tests focused and readable

### Naming

- Test files: `*.spec.ts` (E2E) or `*.test.ts` (Unit/Integration)
- Test suites: Describe grouped functionality
- Test cases: Should start with action verb (should, verify, handles)

## Performance Baselines

- Page Load: < 3 seconds
- API Response: < 500ms (median)
- Database Query: < 100ms (median)
- E2E Test Suite: < 10 minutes total
- Full Test Suite: < 15 minutes

## Resources

- Playwright: https://playwright.dev
- Bun Test: https://bun.sh/docs/test/basics
- WCAG Accessibility: https://www.w3.org/WAI/WCAG21/quickref/

---

**Last Updated:** 2026-05-08
