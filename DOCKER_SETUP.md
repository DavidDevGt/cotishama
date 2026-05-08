# Docker Compose Setup Guide

## ⚠️ Security Notice

**NEVER commit `.env` files with real secrets to Git!**

The `docker-compose.yml` file does NOT contain default passwords. All sensitive values MUST be provided via environment variables.

## Quick Start

### 1. Create Environment File

```bash
# Copy the example file
cp .env.local.example .env

# Edit with your preferred values (DO NOT COMMIT THIS FILE)
# Add to .gitignore if not already there:
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### 2. Configure Secrets

Edit `.env` with secure values:

```env
DB_NAME=cotishama_dev
DB_USER=cotishama_user
DB_PASSWORD=your_super_secure_password_here  # Change this!
DB_PORT=5432

JWT_SECRET=your_ultra_secure_jwt_secret_at_least_32_chars_long
JWT_REFRESH_SECRET=your_ultra_secure_refresh_secret_32_chars_long
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

### 4. Stop Services

```bash
docker-compose down

# Also remove volumes (be careful - this deletes data!)
docker-compose down -v
```

## Environment Variables

### Required for Docker Compose

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_NAME` | (required) | PostgreSQL database name |
| `DB_USER` | (required) | PostgreSQL username |
| `DB_PASSWORD` | (required) | PostgreSQL password |
| `DB_PORT` | 5432 | PostgreSQL port |
| `REDIS_PORT` | 6379 | Redis port |

### Required for Application

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | - | Full connection string |
| `JWT_SECRET` | - | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | - | Refresh token secret (min 32 chars) |
| `NODE_ENV` | development | Environment mode |

## Best Practices

### ✅ DO

- Store `.env` in your local machine only
- Use `.env.local.example` as a template
- Rotate secrets regularly
- Use strong passwords (20+ characters)
- Track `.env.example` in Git (with placeholder values)

### ❌ DON'T

- Commit `.env` files to Git
- Hardcode secrets in docker-compose.yml
- Use default/simple passwords in production
- Share `.env` files via email or chat
- Copy production secrets to development

## Production Deployment

For production, use proper secrets management:

### AWS
```yaml
# Use AWS Secrets Manager or Parameter Store
env_file: /run/secrets/postgres_password
```

### Docker Swarm
```yaml
secrets:
  db_password:
    external: true
```

### Kubernetes
```yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: postgres-secret
        key: password
```

### GitHub Actions
```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

## Troubleshooting

### Connection Refused

```bash
# Check if service is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Verify credentials in .env
cat .env
```

### Database Already Exists

```bash
# Remove volumes and start fresh
docker-compose down -v
docker-compose up -d
```

### Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

## Security Checklist

- [ ] `.env` not committed to Git
- [ ] Strong passwords used (20+ chars)
- [ ] `.gitignore` includes `.env*` files
- [ ] Secrets rotated regularly
- [ ] No hardcoded credentials in code
- [ ] Using environment variables for all secrets
- [ ] Production credentials never in development

## Development vs Production

### Development (.env)
```
DB_PASSWORD=dev_password_123
JWT_SECRET=dev-secret-at-least-32-characters-long
```

### Production (Secrets Manager)
```
DB_PASSWORD=<randomly-generated-64-char-password>
JWT_SECRET=<cryptographically-secure-256-bit-key>
```

---

**Remember:** When in doubt, refer to the principle of least privilege and never expose secrets in version control.
