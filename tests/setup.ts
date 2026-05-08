import { describe, afterEach, beforeEach } from 'bun:test';
import { db, closeDb } from '../apps/backend/src/db/client';
import { users, clients, products, quotes, quoteDetails } from '../apps/backend/src/db/schema';

/**
 * Test Database Setup & Teardown
 * Ensures clean database state for each test
 */

export async function setupTestDB() {
  try {
    // Clear all tables in correct order (due to foreign keys)
    await db.delete(quoteDetails);
    await db.delete(quotes);
    await db.delete(products);
    await db.delete(clients);
    await db.delete(users);

    console.log('✓ Test database initialized');
  } catch (error) {
    console.error('✗ Test database setup failed:', error);
    throw error;
  }
}

export async function teardownTestDB() {
  try {
    await closeDb();
  } catch (error) {
    console.error('✗ Test database teardown failed:', error);
  }
}

export function withDatabaseSetup(testSuite: (describe: typeof describe) => void) {
  return describe.suite('with database', (it) => {
    beforeEach(async () => {
      await setupTestDB();
    });

    afterEach(async () => {
      // Clean up after test
      try {
        await db.delete(quoteDetails);
        await db.delete(quotes);
        await db.delete(products);
        await db.delete(clients);
        await db.delete(users);
      } catch (e) {
        // ignore cleanup errors in afterEach
      }
    });

    testSuite(describe);
  });
}

/**
 * Test Data Helpers
 */

export const TEST_DATA = {
  VALID_EMAIL: 'test@example.com',
  VALID_PASSWORD: 'TestPassword123',
  INVALID_PASSWORD: 'short',
  VALID_PHONE: '+1-555-1234567',
  VALID_TAX_ID: 'TAX-123456',
};

/**
 * JWT Token Helper
 */

export function createMockJWT(payload: Record<string, any>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

/**
 * Assertion Helpers
 */

export const assertions = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  isValidISO8601: (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  },

  isValidJSON: (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Response Validation Helpers
 */

export const responseValidation = {
  isSuccessResponse: (response: any): boolean => {
    return (
      response &&
      response.success === true &&
      response.status_code >= 200 &&
      response.status_code < 300 &&
      response.data !== undefined
    );
  },

  isErrorResponse: (response: any): boolean => {
    return (
      response &&
      response.success === false &&
      response.status_code >= 400 &&
      response.error !== undefined
    );
  },

  isUnauthorized: (response: any): boolean => {
    return response && response.status_code === 401;
  },

  isForbidden: (response: any): boolean => {
    return response && response.status_code === 403;
  },

  isNotFound: (response: any): boolean => {
    return response && response.status_code === 404;
  },

  isConflict: (response: any): boolean => {
    return response && response.status_code === 409;
  },

  isBadRequest: (response: any): boolean => {
    return response && response.status_code === 400;
  },
};

/**
 * Performance Testing Helpers
 */

export const performanceHelper = {
  measureExecutionTime: async (fn: () => Promise<any>): Promise<number> => {
    const start = performance.now();
    await fn();
    return performance.now() - start;
  },

  assertUnder: (duration: number, threshold: number, operation: string): void => {
    if (duration > threshold) {
      throw new Error(
        `${operation} took ${duration.toFixed(2)}ms, expected under ${threshold}ms`
      );
    }
  },
};

/**
 * Mocking Helpers
 */

export function createMockContext() {
  return {
    set: (key: string, value: any) => {},
    get: (key: string) => {},
    req: {
      json: () => Promise.resolve({}),
      query: (key: string) => undefined,
      param: (key: string) => undefined,
      header: (key: string) => undefined,
    },
    json: (data: any, status?: number) => ({ data, status }),
    text: (data: string, status?: number) => ({ data, status }),
  };
}
