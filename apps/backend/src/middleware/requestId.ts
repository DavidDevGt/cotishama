/**
 * Request ID Middleware
 * Generates unique IDs for request tracing
 */

import { Context, Next } from 'hono';
import { randomUUID } from 'crypto';

export const requestIdMiddleware = () => {
  return async (c: Context, next: Next) => {
    const requestId = c.req.header('X-Request-ID') || randomUUID();
    c.set('request_id', requestId);

    // Set response header
    c.header('X-Request-ID', requestId);

    await next();
  };
};
