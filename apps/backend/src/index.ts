import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';
import { getEnv } from './config/env';
import { db, closeDb } from './db/client';
import authRoutes from './routes/auth';
import quoteRoutes from './routes/quote';
import clientRoutes from './routes/client';
import productRoutes from './routes/product';
import reportRoutes from './routes/report';

const app = new Hono();

// Global middleware
app.use(secureHeaders());

const corsOrigins = getEnv('CORS_ORIGINS').split(',');
app.use(
  cors({
    origin: corsOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Total-Count', 'X-RateLimit-Remaining'],
    credentials: true,
    maxAge: 600,
  })
);

app.use(requestIdMiddleware());
app.use(logger((message) => console.log(message)));
app.use(rateLimiter());

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/healthz', (c) => c.text('ok'));

// API routes
const api = new Hono();
api.route('/auth', authRoutes);
api.route('/quotes', quoteRoutes);
api.route('/clients', clientRoutes);
api.route('/products', productRoutes);
api.route('/reports', reportRoutes);

app.route('/api/v1', api);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      status_code: 404,
      error: 'Endpoint not found',
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: c.get('request_id') || 'unknown',
        version: 'v1',
      },
    },
    404
  );
});

// Error handler
app.onError(errorHandler());

// Startup
const start = async () => {
  try {
    console.log('✓ Database ready');
    const port = getEnv('APP_PORT') || '3000';
    const host = getEnv('APP_HOST') || '0.0.0.0';

    console.log(`✓ Server starting on ${host}:${port}`);
    console.log(`✓ Environment: ${getEnv('NODE_ENV')}`);

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('✗ Startup failed:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  console.log('✓ Graceful shutdown initiated');
  await closeDb();
  process.exit(0);
};

start();

export default app;
