/**
 * Cotishama Backend API
 * HonoJS + TypeScript + PostgreSQL
 *
 * Entry Point
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { requestIdMiddleware } from './middleware/requestId';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';
import { config } from './config/env';
import { initializeDatabase } from './config/database';
import authRoutes from './routes/auth';
import quoteRoutes from './routes/quote';
import clientRoutes from './routes/client';
import productRoutes from './routes/product';
import reportRoutes from './routes/report';

// Initialize Hono app
const app = new Hono();

// ===== GLOBAL MIDDLEWARE =====

// Secure headers
app.use(secureHeaders());

// CORS
app.use(
  cors({
    origin: config.CORS_ORIGINS.split(','),
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Total-Count', 'X-RateLimit-Remaining'],
    credentials: true,
    maxAge: 600,
  })
);

// Request ID
app.use(requestIdMiddleware());

// Logging
app.use(logger((message) => console.log(message)));

// Rate limiting
app.use(rateLimiter());

// ===== HEALTH CHECK =====

app.get('/health', (c) => {
  return c.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    200
  );
});

app.get('/healthz', (c) => {
  return c.text('ok');
});

// ===== API ROUTES =====

const api = new Hono();

// Auth endpoints (no auth required)
api.route('/auth', authRoutes);

// Protected endpoints (auth required)
api.use('*', authMiddleware());

api.route('/quotes', quoteRoutes);
api.route('/clients', clientRoutes);
api.route('/products', productRoutes);
api.route('/reports', reportRoutes);

app.route('/api/v1', api);

// ===== 404 HANDLER =====

app.notFound((c) => {
  return c.json(
    {
      success: false,
      status_code: 404,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint no encontrado',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: c.get('request_id') || 'unknown',
        version: 'v1',
      },
    },
    404
  );
});

// ===== ERROR HANDLER =====

app.onError(errorHandler());

// ===== STARTUP =====

const start = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✓ Database connected');

    // Start server
    const port = config.APP_PORT;
    const host = config.APP_HOST;

    console.log(`✓ Server starting on ${host}:${port}`);
    console.log(`✓ Environment: ${config.NODE_ENV}`);

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    export default app;
  } catch (error) {
    console.error('✗ Startup failed:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  console.log('✓ Graceful shutdown initiated');
  // Add cleanup logic here
  process.exit(0);
};

// Start the application
start();
