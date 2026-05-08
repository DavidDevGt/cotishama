# CI/CD Operations Guide

How to monitor, debug, and maintain the CI/CD pipeline in production.

## 📊 Dashboard Overview

### GitHub Actions Dashboard

**Location:** GitHub Repo → Actions tab

```
┌─────────────────────────────────────────┐
│ All Workflows                           │
├─────────────────────────────────────────┤
│ ✅ CI/CD Pipeline (100 passes)          │
│ ⚠️  Deploy (2 failures)                  │
│ ✅ Security Checks (weekly)             │
└─────────────────────────────────────────┘
```

### Pipeline Status

```
RECENT RUNS:
✅ #2856: 13 min (all jobs passed)
✅ #2855: 12 min (all jobs passed)
❌ #2854: Build failed (backend compilation)
⚠️  #2853: E2E flaky (3/5 retries passed)
```

## 🚀 Real-Time Monitoring

### During a Build

**What to watch:**

```
1. Queue time: Should be < 1 min
2. Setup time: Should be < 2 min
3. Total time: Should be < 15 min
```

**If stuck:**
```bash
# Cancel and retry
gh workflow run test.yml --ref main
```

### Job Status Quick Check

```bash
# See current workflow runs
gh workflow view test.yml

# See latest run details
gh run view --log

# Watch a specific run
gh run watch 2856
```

## 🔴 Debugging Failures

### 1. Quality Check Failures

**Error:** Type checking failed

```
❌ Type error in apps/backend/src/index.ts:45
  Property 'email' not found in type 'User'
```

**Fix:**
```bash
# Run locally
bun run type-check

# Fix the issue
# Commit and push to re-run
git add . && git commit -m "Fix type error"
git push origin your-branch
```

**Quick Reference:**
```yaml
quality:
  - Type checking (TypeScript)
  - Linting (Biome)
  - Format checking
```

### 2. Unit Test Failures

**Error:** Unit test failed

```
❌ AuthService > validate email > should reject invalid emails
  Expected: false
  Received: true
```

**Fix:**
```bash
# Run test locally
bun run test:unit

# Find the failing test
bun test tests/unit/services/AuthService.test.ts

# Fix the test or code
# Re-run
bun run test:unit
```

**Tips:**
- Run locally BEFORE pushing
- Check if test is flaky (runs inconsistently)
- Update mocks if dependencies changed

### 3. Integration Test Failures

**Error:** Database connection failed

```
❌ Integration > api-auth > login
  PostgreSQL connection refused at localhost:5432
```

**Common Causes:**
- Test database not initialized
- Migrations not applied
- Wrong environment variables

**Fix:**
```bash
# Ensure database is ready
docker-compose up -d postgres
sleep 10

# Run migrations locally
bun run db:migrate

# Run tests
bun run test:integration
```

### 4. Build Failures

**Error:** Build step failed

```
❌ Build backend: error TS1234
   Cannot find module './config'
```

**Fix:**
```bash
# Test build locally
cd apps/backend
bun build src/index.ts --target bun --outdir ../../dist

# Check for missing files/imports
ls -la src/

# Fix import paths
# Re-push to trigger build
```

### 5. E2E Test Failures

**Error:** Playwright test timeout

```
❌ E2E Tests > auth.spec.ts > should login
  Timeout: page.fill took longer than 30000ms
```

**Debug:**
```bash
# Run test in debug mode
bun run test:e2e:debug

# Run with verbose output
bun run test:e2e --reporter=verbose

# Check Playwright reports
bun run test:report
```

**Common Causes:**
- Frontend not responding
- Network issues
- Selector timing wrong
- Flaky test

## 🏥 Health Checks

### Check Pipeline Health

```bash
# Last 10 runs
gh run list --limit 10

# Count failures in last 30 days
gh run list --limit 100 | grep -c "✗"
```

### Check Service Health

```bash
# Is PostgreSQL running in tests?
docker ps | grep postgres

# Is Docker registry accessible?
docker login

# Are artifacts being uploaded?
gh run download <run-id>
```

## ⏸️ Pausing Pipeline

**If there's a critical issue:**

```bash
# Disable workflow temporarily
gh workflow disable test.yml

# Do urgent fixes

# Re-enable workflow
gh workflow enable test.yml
```

**Note:** This blocks all PRs and commits from being tested.

## 🔄 Retry Logic

### Automatic Retries (Built-in)

```yaml
- Unit tests:      0 retries (fast, should always pass)
- Integration:     0 retries (with proper mocking)
- E2E:             2 retries (can be flaky)
```

### Manual Retry

```bash
# Retry last failed run
gh run rerun <run-id>

# Retry specific job
gh run rerun <run-id> --failed
```

### Re-trigger Pipeline

```bash
# Force run on a commit
gh workflow run test.yml --ref <commit-sha>

# Trigger from PR
gh pr comment <pr-number> -b "/run-tests"
```

## 📈 Performance Optimization

### Monitor Pipeline Times

```bash
# Get metrics for last 30 runs
gh run list --limit 30 --json durationMinutes,status

# Identify slowest jobs
gh run view <run-id> --json jobs | jq '.[] | {name, durationMinutes}'
```

### If Pipeline is Slow

**Check 1: Dependencies**
```bash
# Is bun cache working?
# Look for "Cache hit" in logs
# If not, dependencies are being downloaded each time
```

**Check 2: Database**
```bash
# Is PostgreSQL startup slow?
# Should be ready in < 10 seconds
# Check health check logs
```

**Check 3: E2E Tests**
```bash
# Playwright setup can be slow
# Check browser installation logs
```

**Optimization Tips:**
```yaml
# Increase parallel jobs
matrix:
  test-file:
    - tests/unit/auth/**
    - tests/unit/quotes/**
    - tests/unit/clients/**

# Cache more aggressively
- uses: actions/cache@v4
  with:
    path: ~/.cache  # Playwright cache

# Use smaller test subset for PR checks
if: github.event_name == 'push'
  run: bun run test:quality  # Full suite
else
  run: bun run test:unit     # Quick check
```

## 🚨 Alerts & Notifications

### Setup Slack Alerts

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "CI/CD Pipeline Failed",
        "blocks": [{
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Build #${{ github.run_number }} Failed*\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Details>"
          }
        }]
      }
```

### Setup GitHub Email Alerts

Settings → Notifications → Watching

```
✓ Failed workflow runs
✓ Pull request reviews
✓ Deployments
```

## 🔐 Security in CI/CD

### Secrets Management

**Never log secrets:**
```yaml
- name: Login to registry
  run: echo ${{ secrets.DOCKER_PASSWORD }} | docker login ...
  # ⚠️ WRONG - shows secret in logs

- name: Login to registry
  run: |
    echo "${{ secrets.DOCKER_PASSWORD }}" | docker login \
      --username ${{ secrets.DOCKER_USER }} \
      --password-stdin
  # ✓ Correct - password piped, not logged
```

**Scope secrets properly:**
```yaml
# Only environment-specific secrets
prod:
  secrets: DB_PASSWORD, API_KEY, ...
  
staging:
  secrets: TEST_DB_PASSWORD, TEST_API_KEY, ...
```

## 📋 Maintenance Tasks

### Weekly

```
✓ Review failed runs from last week
✓ Check for flaky tests
✓ Review job times (any slower?)
✓ Check artifact storage usage
```

### Monthly

```
✓ Review and update dependencies
✓ Check GitHub Actions version updates
✓ Analyze success rate trends
✓ Update documentation
```

### Quarterly

```
✓ Performance optimization review
✓ Security audit of workflows
✓ Cost analysis (GitHub Actions usage)
✓ Plan improvements for next quarter
```

## 📊 Metrics to Track

### Build Metrics

```
Metric                    Target    Current   Trend
─────────────────────────────────────────────────
Pipeline Success Rate     >99%      98.5%     📉
Average Duration          <15min    13min     📈
P95 Duration              <20min    18min     📈
Deployment Frequency      1-2/day   3/day     📈
Lead Time (commit→prod)   <1hour    45min     📈
```

### Test Metrics

```
Metric                    Target    Current
──────────────────────────────────────────
Unit Test Coverage        >80%      82%
Integration Coverage      >70%      72%
E2E Critical Path         100%      100%
Flaky Test Rate          <1%       0.5%
```

## 🎯 SLOs (Service Level Objectives)

### Pipeline SLOs

```
Pipeline Availability:  99.9% uptime
Build Time P95:         < 20 minutes
Deployment Success:     100% (all tests pass)
Rollback Time:          < 5 minutes
```

### Deployment SLOs

```
Deployment Frequency:   1-2 per day
Lead Time:              < 1 hour (commit to prod)
Mean Time To Recover:   < 15 minutes
Change Failure Rate:    < 5%
```

## 🆘 Incident Response

### If Production Deployment Fails

**Immediate Actions:**
```bash
1. Check rollback status
   gh workflow view deploy.yml
   
2. Verify service health
   curl https://api.cotishama.com/api/health
   
3. If still down, manual rollback
   kubectl rollout undo deployment/cotishama-api
   
4. Notify team
   Slack: "#incidents channel"
   
5. Post-incident review
   What failed? Why? How prevent?
```

### If Tests Are Flaky

```bash
# Identify flaky test
gh run view <run-id> --json failedSteps

# Run locally 5 times
for i in {1..5}; do bun run test:e2e; done

# If inconsistent:
  - Check for timing issues
  - Update selectors
  - Add proper waits
  - Consider isolating test data

# Mark as flaky while fixing
# @flaky: timing issue with API response
```

### If Build is Stuck

```bash
# Cancel all runs
gh workflow disable test.yml
gh workflow disable deploy.yml

# Fix the issue

# Re-enable
gh workflow enable test.yml
gh workflow enable deploy.yml
```

## 📚 Quick Reference Commands

```bash
# View all workflows
gh workflow list

# View specific workflow
gh workflow view test.yml

# List recent runs
gh run list --limit 20

# View run details
gh run view <run-id>

# Download artifacts
gh run download <run-id>

# View logs for a job
gh run view <run-id> --log

# Cancel a run
gh run cancel <run-id>

# Rerun a failed job
gh run rerun <run-id> --failed

# Manually trigger workflow
gh workflow run test.yml --ref main
```

## 📞 Support & Escalation

### When to Contact DevOps Team

- Pipeline consistently slow (> 20 min)
- Build failures in multiple jobs
- Deployment not working
- Need to change GitHub Actions plan
- Need to increase storage/bandwidth

### When to Contact Database Team

- PostgreSQL connection issues
- Migration failures
- Database performance issues
- Need to reset test database

### When to Contact Security Team

- Secrets exposed in logs
- Unauthorized access detected
- Dependency vulnerability found
- Need security audit

---

**Last Updated:** 2026-05-08  
**Owner:** DevOps Team  
**On-Call:** Check Slack #devops-oncall
