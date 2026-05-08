/**
 * Authentication Middleware
 * JWT validation and user context injection
 */

import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { config } from '../config/env';
import { AuthenticationError } from '../types/errors';
import type { JWTPayload, UserPublic } from '@shared/types/domain';

declare global {
  namespace HonoRequest {
    interface HonoRequest {
      user?: UserPublic;
    }
  }
}

export const authMiddleware = () => {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Token no proporcionado');
    }

    const token = authHeader.slice(7);

    try {
      const payload = (await verify(
        token,
        config.JWT_SECRET
      )) as JWTPayload;

      // Check expiration
      if (payload.exp * 1000 < Date.now()) {
        throw new AuthenticationError('Token expirado');
      }

      // Inject user into context
      c.set('user', {
        id: payload.sub,
        email: payload.email,
        full_name: payload.email.split('@')[0],
        role: payload.role,
        is_active: true,
      } as UserPublic);

      await next();
    } catch (error) {
      throw new AuthenticationError('Token inválido');
    }
  };
};

/**
 * Require specific role
 */
export const requireRole = (...roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as UserPublic;

    if (!user || !roles.includes(user.role)) {
      throw new AuthorizationError();
    }

    await next();
  };
};

/**
 * Get authenticated user from context
 */
export const getUser = (c: Context): UserPublic => {
  const user = c.get('user') as UserPublic | undefined;
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
};

import { AuthorizationError } from '../types/errors';
