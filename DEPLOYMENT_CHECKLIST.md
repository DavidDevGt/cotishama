# Deployment Checklist

Before deploying to production, ensure all quality gates pass.

## Pre-Deployment Testing

### Unit Tests
```bash
bun run test:unit
# Must pass: 0 failures
```

### Integration Tests
```bash
bun run test:integration
# Must pass: 0 failures
# Verify API endpoints respond correctly
```

### Security Tests
```bash
bun run test:security
# Must pass: 0 failures
# Check JWT validation, password hashing, injection prevention
```

### Smoke Tests (Critical Paths)
```bash
bun run test:e2e tests/e2e/smoke.spec.ts
# Must pass: 10/10 critical path tests
# Ensures: login, quote creation, client management work
```

### Visual Regression Tests
```bash
bun run test:e2e tests/e2e/visual-regression.spec.ts
# Must pass: Verify UI consistency
# Check: layouts, spacing, responsive design
```

### Regression Tests (Feature Stability)
```bash
bun run test:e2e tests/e2e/regression.spec.ts
# Must pass: Existing features still work
# Check: data persistence, search, pagination, sorting
```

### Full E2E Suite
```bash
bun run test:e2e
# Must pass: All 40+ E2E tests
# All browsers: Chromium, Firefox, WebKit
```

### Complete Quality Check
```bash
bun run test:quality
# Must complete without critical failures
# Combines: unit + integration + E2E
```

## Code Quality Gates

### Linting
```bash
bun run lint
# Must pass: 0 errors
# Warnings acceptable but should be reviewed
```

### Type Checking
```bash
bun run type-check
# Must pass: 0 TypeScript errors
```

### Format Verification
```bash
bun run format:check
# Must pass: Code is properly formatted
# If fails: Run `bun run format` to auto-fix
```

### Build Verification
```bash
bun run build
# Must succeed: dist/ artifacts created
# Backend: dist/index.js
# Frontend: dist/app.js
```

## Performance Validation

### Page Load Performance
- [ ] Dashboard loads in < 3 seconds
- [ ] Quote list loads in < 2 seconds
- [ ] Client list loads in < 2 seconds

### API Response Times
- [ ] Auth endpoints respond in < 500ms
- [ ] Quote endpoints respond in < 500ms
- [ ] Client endpoints respond in < 500ms

### Database Performance
- [ ] Query times < 100ms (median)
- [ ] No N+1 query issues
- [ ] Indexes are optimized

## Security Validation

### Authentication
- [ ] JWT tokens validate correctly
- [ ] Refresh tokens work properly
- [ ] Sessions expire correctly
- [ ] Protected routes require auth

### Authorization
- [ ] Users can only see their data
- [ ] Admin endpoints are protected
- [ ] Role-based access works

### Data Protection
- [ ] Passwords are hashed (bcrypt)
- [ ] Sensitive data not logged
- [ ] No secrets in environment
- [ ] HTTPS enabled (production)

### Vulnerability Scanning
```bash
bun run test:security
# Must pass: 0 vulnerabilities
# Check for: SQL injection, XSS, CSRF
```

## Configuration Validation

### Environment Variables
```bash
# Verify production .env contains:
- NODE_ENV=production
- DATABASE_URL (valid PostgreSQL connection)
- JWT_SECRET (32+ chars, random)
- JWT_REFRESH_SECRET (32+ chars, random)
- CORS_ORIGINS (only production URLs)
- All required variables set
```

### Database
- [ ] PostgreSQL running and accessible
- [ ] Migrations are up-to-date
- [ ] Database size is acceptable
- [ ] Backups are configured
- [ ] User accounts seeded

### Redis (if applicable)
- [ ] Redis running and accessible
- [ ] Cache is warming correctly
- [ ] Connection pooling configured

## Deployment Steps

### 1. Final Testing
```bash
# Run complete test suite
bun run test:quality

# Verify no console errors
bun run build
```

### 2. Backup
```bash
# Backup production database
pg_dump cotishama_prod > backup-$(date +%Y%m%d-%H%M%S).sql
```

### 3. Build & Package
```bash
# Clean build
rm -rf dist/
bun run build

# Verify artifacts
ls -la dist/
```

### 4. Deploy Backend
```bash
# Stop old backend
docker stop cotishama-backend

# Start new backend
docker run -d \
  --name cotishama-backend \
  --network cotishama_network \
  -e DATABASE_URL=$DATABASE_URL \
  -e JWT_SECRET=$JWT_SECRET \
  -p 3000:3000 \
  cotishama-backend:latest
```

### 5. Deploy Frontend
```bash
# Copy build artifacts
cp -r dist/app.js /var/www/cotishama/

# Update web server config
systemctl reload nginx  # or apache2

# Verify frontend loads
curl https://app.cotishama.com
```

### 6. Smoke Tests (Production)
```bash
# Test production endpoints
curl https://api.cotishama.com/api/health

# Login test
curl -X POST https://api.cotishama.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cotishama.local","password":"..."}'
```

### 7. Monitor
```bash
# Watch logs for errors
docker logs -f cotishama-backend

# Monitor system resources
watch 'free -h && df -h'

# Check application health
while true; do curl https://api.cotishama.com/api/health && sleep 10; done
```

## Rollback Plan

If deployment fails, rollback:

```bash
# 1. Stop current backend
docker stop cotishama-backend

# 2. Start previous version
docker run -d \
  --name cotishama-backend-prev \
  -e DATABASE_URL=$DATABASE_URL \
  --network cotishama_network \
  -p 3000:3000 \
  cotishama-backend:previous

# 3. Restore previous frontend
cp -r /backups/frontend-build/* /var/www/cotishama/

# 4. Restore database if needed
psql cotishama_prod < backup-YYYYMMDD-HHMMSS.sql

# 5. Verify health
curl https://api.cotishama.com/api/health
```

## Post-Deployment Verification

### Functional Testing
- [ ] Login works with production credentials
- [ ] Can create new quote
- [ ] Can create new client
- [ ] Can view and edit quotes
- [ ] PDF export works
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Pagination works

### User Experience
- [ ] No console errors in browser
- [ ] No broken images
- [ ] No layout shifts
- [ ] Responsive on mobile
- [ ] Touch/keyboard navigation works

### Performance
- [ ] Dashboard loads quickly
- [ ] No timeout errors
- [ ] API responses are fast
- [ ] Database queries are efficient

### Monitoring
- [ ] Error tracking enabled (Sentry/DataDog)
- [ ] Performance monitoring active
- [ ] Logs are being collected
- [ ] Alerts are configured

## Sign-Off

- [ ] All tests passed
- [ ] Code review completed
- [ ] Security review completed
- [ ] Performance validated
- [ ] Deployment successful
- [ ] Post-deployment verification passed
- [ ] Monitoring active

**Deployed by:** _______________  
**Deployment date:** _______________  
**Version:** _______________  
**Notes:** _______________  

---

## Emergency Contacts

**On-Call DevOps:** _______________  
**Database Admin:** _______________  
**Security Lead:** _______________  
**Product Manager:** _______________
