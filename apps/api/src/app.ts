/**
 * Hono.js application setup with error handling
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';

// Import routes
import productRoutes from './routes/products.js';
import quotationRoutes from './routes/quotations.js';
import pdfRoutes from './routes/pdf.js';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', prettyJSON());

// Request logging middleware
app.use('*', honoLogger((message) => {
  logger.info(message);
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.route('/api/products', productRoutes);
app.route('/api/quotations', quotationRoutes);
app.route('/api/quotations', pdfRoutes);

// Error handling middleware
app.onError((err, c) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      },
    },
    404
  );
});

export default app;