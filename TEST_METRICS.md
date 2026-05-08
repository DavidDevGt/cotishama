# Test Metrics & Reporting

Track testing quality and coverage over time to maintain enterprise-grade standards.

## Coverage Metrics

### Current Coverage Targets

| Component | Target | Method |
|-----------|--------|--------|
| **Unit Tests** | >80% | `bun run test:coverage` |
| **Integration Tests** | >70% | API endpoint coverage |
| **Critical Paths** | 100% | Smoke test suite |
| **E2E Tests** | >60% | User flow coverage |
| **Security Tests** | >90% | Vulnerability checks |

### Measuring Coverage

```bash
# Generate detailed coverage report
bun run test:coverage

# View coverage results
# Check: coverage/coverage-final.json
# View: coverage/lcov-report/index.html
```

## Test Execution Metrics

### Success Metrics

```bash
# Run full test suite with timing
bun run test:quality

# Expected results:
# Unit Tests: ~50-100 tests, <30 seconds
# Integration Tests: ~25-35 tests, <2 minutes  
# E2E Tests: ~40+ tests, <5 minutes
# Total: ~120+ tests, <10 minutes
```

### Performance Baselines

| Test Type | Expected Time | Max Acceptable |
|-----------|---------------|-----------------|
| Unit (per test) | 50-200ms | 1000ms |
| Integration (per test) | 100-500ms | 2000ms |
| E2E (per test) | 200-2000ms | 5000ms |
| **Full Suite** | ~10 minutes | 15 minutes |

### CI/CD Pipeline Metrics

```bash
# Monitor in GitHub Actions
# Look for:
- Test execution time trend
- Failure rate trend
- Coverage trend
- Performance regression
```

## Reliability Metrics

### Test Flakiness

Track tests that fail intermittently:

```bash
# Run tests multiple times to identify flaky tests
for i in {1..5}; do
  echo "Run $i"
  bun run test:e2e tests/e2e/auth.spec.ts || echo "Failed"
done

# If any test fails <5 times: investigate timing issues
# If any test fails >2 times: mark as flaky, fix or disable
```

### Flaky Test Threshold

- **Green:** 100% pass rate
- **Yellow:** 95-99% pass rate (needs investigation)
- **Red:** <95% pass rate (needs fixing)

## Defect Metrics

### Bug Categories

| Type | Example | Test Layer |
|------|---------|-----------|
| **Functional** | Quote not saving | E2E + Integration |
| **Performance** | Page takes 10s to load | Performance tests |
| **Security** | JWT not validating | Security tests |
| **Regression** | Feature broken after update | Regression tests |
| **UI/UX** | Button misaligned on mobile | Visual regression |

### Tracking Defects

```markdown
## Bug Report Template

**Found in test:** tests/e2e/quotes.spec.ts
**Severity:** High/Medium/Low
**Priority:** Critical/High/Normal/Low
**Status:** Open/In Progress/Fixed/Closed

**Description:** [What's broken]
**Steps to reproduce:** [How to trigger]
**Expected behavior:** [What should happen]
**Actual behavior:** [What happens]
**Screenshots/Video:** [Evidence]

**Root cause:** [Analysis]
**Fix:** [Solution]
**Test coverage:** [How to prevent]
```

## Trend Analysis

### Weekly Metrics Review

```bash
# Track metrics over time
cat > test-metrics.json << 'EOF'
{
  "week": "2026-05-08",
  "unit_tests": {
    "total": 50,
    "passed": 50,
    "failed": 0,
    "skipped": 0,
    "duration_ms": 28000
  },
  "integration_tests": {
    "total": 30,
    "passed": 30,
    "failed": 0,
    "skipped": 0,
    "duration_ms": 90000
  },
  "e2e_tests": {
    "total": 42,
    "passed": 42,
    "failed": 0,
    "skipped": 0,
    "duration_ms": 300000
  },
  "security_tests": {
    "total": 15,
    "passed": 15,
    "failed": 0,
    "vulnerabilities": 0
  },
  "coverage": {
    "lines": 82,
    "branches": 78,
    "functions": 85,
    "statements": 83
  }
}
EOF
```

### Monthly Dashboard

Create a dashboard showing:

1. **Test Coverage Trend**
   - Target: >80% (unit) >70% (integration)
   - Track week-over-week progress

2. **Test Success Rate**
   - Target: >99% (green tests)
   - <5% flakiness

3. **Bug Escape Rate**
   - Bugs found in production vs. in testing
   - Target: 0 critical bugs in production

4. **Test Execution Time**
   - Track slowness in CI pipeline
   - Alert if >15 minutes for full suite

5. **Code Quality Score**
   - Combine: coverage + linting + type safety
   - Target: A grade

## Reporting

### HTML Report
```bash
bun run test:report
# Opens Playwright HTML report with:
# - All test results
# - Screenshots on failure
# - Video recordings
# - Timeline view
```

### JSON Report
```bash
# Find: test-results/e2e.json
# Shows detailed test results for CI systems
# Use for: custom dashboards, integrations
```

### JUnit XML Report
```bash
# Find: test-results/junit.xml
# Use for: Jenkins, GitHub Actions, GitLab CI
# Integrates with: most CI/CD systems
```

## Continuous Integration Metrics

### GitHub Actions Workflow Metrics

Monitor from Actions tab:
- Workflow duration trend
- Success rate per test
- Flaky test detection
- Code coverage badge

### Setting Up Metrics Tracking

```yaml
# .github/workflows/metrics.yml
name: Publish Test Metrics

on:
  workflow_run:
    workflows: [Tests]
    types: [completed]

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: test-results
      
      - name: Publish to dashboard
        run: |
          # Push metrics to external dashboard
          # e.g., CloudWatch, Datadog, Grafana
          curl -X POST $METRICS_ENDPOINT \
            -d @test-results/e2e.json
```

## Goals & Targets

### Q2 2026 Goals

- [ ] **Coverage:** Increase unit test coverage to 85%
- [ ] **Flakiness:** Reduce flaky test failures to <1%
- [ ] **Speed:** Keep full suite under 10 minutes
- [ ] **Quality:** Zero critical bugs in production
- [ ] **Documentation:** 100% test coverage documented

### Q3 2026 Goals

- [ ] **Coverage:** Increase to 90% (unit), 75% (integration)
- [ ] **Performance:** Reduce suite time to <8 minutes
- [ ] **Automation:** 100% of critical paths automated
- [ ] **Regression:** Zero regressions after deployments

## Tools & Integrations

### Coverage Tools
- **Bun Test Coverage:** Built-in
- **Codecov:** https://codecov.io
- **Coveralls:** https://coveralls.io

### Dashboard Tools
- **Grafana:** Real-time metrics dashboard
- **DataDog:** APM and metrics
- **New Relic:** Performance monitoring
- **Sentry:** Error tracking

### Integration Examples

```javascript
// Send metrics to external service
async function reportMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    tests: {
      unit: 50,
      integration: 30,
      e2e: 42,
      passed: 122,
      failed: 0
    },
    coverage: 82,
    duration_ms: 418000
  };

  await fetch('https://metrics.example.com/api/tests', {
    method: 'POST',
    body: JSON.stringify(metrics),
    headers: { 'Authorization': `Bearer ${process.env.METRICS_TOKEN}` }
  });
}
```

## Maintenance

### Monthly Tasks

- [ ] Review coverage report
- [ ] Update metrics dashboard
- [ ] Investigate flaky tests
- [ ] Update performance baselines
- [ ] Archive old test results

### Quarterly Tasks

- [ ] Review test strategy effectiveness
- [ ] Update test targets
- [ ] Identify test gaps
- [ ] Plan new test coverage
- [ ] Review and improve test utilities

## Resources

- **Playwright Test Reports:** https://playwright.dev/docs/test-reporters
- **Coverage Reports:** https://bun.sh/docs/test/coverage
- **Best Practices:** https://testing-library.com/docs/queries/about
- **Performance Metrics:** https://web.dev/metrics/

---

**Last Updated:** 2026-05-08
**Metrics Owner:** QA Team
**Review Frequency:** Weekly
