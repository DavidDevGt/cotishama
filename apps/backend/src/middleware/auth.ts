import { Context, Next } from 'hono';
import { verifyAccessToken } from '../utils/jwt';
import { AuthenticationError, AuthorizationError } from '../types/errors';

export interface UserContext {
  id: number;
  email: string;
  role: string;
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Token not provided');
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    throw new AuthenticationError('Invalid or expired token');
  }

  c.set('user', {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  });

  await next();
};

export const requireRole = (...roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as UserContext | undefined;

    if (!user || !roles.includes(user.role)) {
      throw new AuthorizationError('Insufficient permissions');
    }

    await next();
  };
};

export const getUser = (c: Context): UserContext => {
  const user = c.get('user') as UserContext | undefined;
  if (!user) {
    throw new AuthenticationError('User not authenticated');
  }
  return user;
};
