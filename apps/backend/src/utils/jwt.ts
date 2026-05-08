import * as jwt from '@hapi/jwt';
import { getEnv } from '../config/env';
import type { User } from '../db/schema';

interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

export function generateAccessToken(user: User): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + ACCESS_TOKEN_EXPIRY,
  };

  return jwt.sign(payload, getEnv('JWT_SECRET'));
}

export function generateRefreshToken(user: User): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: user.id,
    email: user.email,
    type: 'refresh',
    iat: now,
    exp: now + REFRESH_TOKEN_EXPIRY,
  };

  return jwt.sign(payload, getEnv('JWT_REFRESH_SECRET'));
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token, getEnv('JWT_SECRET'));
    if (!decoded.payload) return null;

    const payload = decoded.payload as JWTPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(
  token: string
): (JWTPayload & { type: string }) | null {
  try {
    const decoded = jwt.decode(token, getEnv('JWT_REFRESH_SECRET'));
    if (!decoded.payload) return null;

    const payload = decoded.payload as JWTPayload & { type: string };
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }

    if (payload.type !== 'refresh') {
      return null; // Not a refresh token
    }

    return payload;
  } catch {
    return null;
  }
}
