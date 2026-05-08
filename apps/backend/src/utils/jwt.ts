import * as jwt from 'jsonwebtoken';
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
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, getEnv('JWT_SECRET'), {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: 'HS256',
  });
}

export function generateRefreshToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    type: 'refresh',
  };

  return jwt.sign(payload, getEnv('JWT_REFRESH_SECRET'), {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getEnv('JWT_SECRET'), {
      algorithms: ['HS256'],
    });

    return decoded as JWTPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(
  token: string
): (JWTPayload & { type: string }) | null {
  try {
    const decoded = jwt.verify(token, getEnv('JWT_REFRESH_SECRET'), {
      algorithms: ['HS256'],
    });

    const payload = decoded as JWTPayload & { type: string };

    if (payload.type !== 'refresh') {
      return null; // Not a refresh token
    }

    return payload;
  } catch {
    return null;
  }
}
