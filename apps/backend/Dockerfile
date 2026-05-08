# Build stage
FROM oven/bun:latest as builder

WORKDIR /app

# Copy source
COPY . .

# Install dependencies
RUN bun install --production

# Build backend
RUN bun build src/index.ts --target bun --outdir ./dist

# Runtime stage
FROM oven/bun:latest

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${APP_PORT:-3000}/api/health || exit 1

# Environment
ENV NODE_ENV=production
ENV APP_PORT=3000

# Start application
EXPOSE 3000

CMD ["bun", "dist/index.js"]
