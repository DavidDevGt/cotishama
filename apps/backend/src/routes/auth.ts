import { Hono } from 'hono';
import { z } from 'zod';
import { authService } from '../services/AuthService';
import { AuthenticationError, ValidationError } from '../types/errors';
import { LoginSchema } from '@shared/validators/schemas';

const router = new Hono();

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshRequest {
  refreshToken: string;
}

router.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>();

    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError('Invalid credentials format');
    }

    const { user, accessToken, refreshToken } = await authService.login({
      email: body.email,
      password: body.password,
    });

    c.header('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        accessToken,
      },
      status_code: 200,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return c.json({
        success: false,
        error: error.message,
        status_code: 401,
      }, 401);
    }
    throw error;
  }
});

router.post('/refresh', async (c) => {
  try {
    const body = await c.req.json<RefreshRequest>();

    if (!body.refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    const accessToken = await authService.refreshToken(body.refreshToken);

    return c.json({
      success: true,
      data: { accessToken },
      status_code: 200,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return c.json({
        success: false,
        error: error.message,
        status_code: 401,
      }, 401);
    }
    throw error;
  }
});

router.post('/logout', async (c) => {
  c.header('Set-Cookie', 'refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0');

  return c.json({
    success: true,
    data: { message: 'Logged out successfully' },
    status_code: 200,
  });
});

router.post('/register', async (c) => {
  try {
    const body = await c.req.json<{
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }>();

    const validation = LoginSchema.safeParse({
      email: body.email,
      password: body.password,
    });

    if (!validation.success) {
      throw new ValidationError('Invalid registration data');
    }

    const user = await authService.register(
      body.email,
      body.password,
      body.firstName,
      body.lastName
    );

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      status_code: 201,
    }, 201);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return c.json({
        success: false,
        error: error.message,
        status_code: 400,
      }, 400);
    }
    throw error;
  }
});

export default router;
