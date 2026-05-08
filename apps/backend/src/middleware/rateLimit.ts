/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiting (use Redis for production)
 */

import { Context, Next } from 'hono';
import { RateLimitError } from '../types/errors';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const rateLimiter = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
) => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') ||
               c.req.header('X-Forwarded-For')?.split(',')[0] ||
               c.req.header('X-Real-IP') ||
               'unknown';

    // Special handling for login endpoint
    const path = c.req.path;
    if (path === '/api/v1/auth/login') {
      const loginKey = `login:${ip}`;
      const now = Date.now();
      let entry = rateLimitStore.get(loginKey);

      if (!entry || entry.resetTime < now) {
        entry = { count: 0, resetTime: now + 15 * 60 * 1000 };
      }

      entry.count++;
      rateLimitStore.set(loginKey, entry);

      if (entry.count > 5) {
        throw new RateLimitError(
          'Demasiados intentos de inicio de sesión. Intente en 15 minutos.'
        );
      }
    } else {
      const key = `rate:${ip}`;
      const now = Date.now();
      let entry = rateLimitStore.get(key);

      if (!entry || entry.resetTime < now) {
        entry = { count: 0, resetTime: now + windowMs };
      }

      entry.count++;
      rateLimitStore.set(key, entry);

      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());

      if (entry.count > maxRequests) {
        throw new RateLimitError();
      }
    }

    await next();
  };
};
