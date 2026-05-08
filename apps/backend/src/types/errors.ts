/**
 * Application Error Types
 * Domain-specific error handling
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Autenticación requerida') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'No tiene permisos para realizar esta acción') {
    super(403, 'FORBIDDEN', message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} no encontrado`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(409, 'CONFLICT', message, details);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Demasiadas solicitudes. Intente más tarde.') {
    super(429, 'TOO_MANY_REQUESTS', message);
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Error interno del servidor') {
    super(500, 'INTERNAL_SERVER_ERROR', message);
    this.name = 'InternalServerError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Error de base de datos', originalError?: Error) {
    super(500, 'DATABASE_ERROR', message, {
      originalError: originalError?.message,
    });
    this.name = 'DatabaseError';
  }
}

/**
 * Type guard for AppError
 */
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};
