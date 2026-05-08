/**
 * Environment Configuration
 * Validates and exports environment variables
 */

interface Config {
  NODE_ENV: 'development' | 'staging' | 'production';
  APP_PORT: number;
  APP_HOST: string;
  LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  DATABASE_URL: string;
  DATABASE_POOL_MIN: number;
  DATABASE_POOL_MAX: number;
  DATABASE_IDLE_TIMEOUT: number;
  DATABASE_CONNECT_TIMEOUT: number;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRE: number;
  JWT_REFRESH_EXPIRE: number;
  CORS_ORIGINS: string;
  STORAGE_TYPE: 'local' | 's3';
  STORAGE_PATH?: string;
}

export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
};

export const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
};

export const config: Config = {
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production',
  APP_PORT: getEnvNumber('APP_PORT', 3000),
  APP_HOST: getEnv('APP_HOST', '0.0.0.0'),
  LOG_LEVEL: (process.env.LOG_LEVEL || 'info') as any,
  DATABASE_URL: getEnv('DATABASE_URL'),
  DATABASE_POOL_MIN: getEnvNumber('DATABASE_POOL_MIN', 5),
  DATABASE_POOL_MAX: getEnvNumber('DATABASE_POOL_MAX', 20),
  DATABASE_IDLE_TIMEOUT: getEnvNumber('DATABASE_IDLE_TIMEOUT', 30000),
  DATABASE_CONNECT_TIMEOUT: getEnvNumber('DATABASE_CONNECT_TIMEOUT', 10000),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRE: getEnvNumber('JWT_ACCESS_EXPIRE', 900000), // 15 minutes
  JWT_REFRESH_EXPIRE: getEnvNumber('JWT_REFRESH_EXPIRE', 604800000), // 7 days
  CORS_ORIGINS: getEnv('CORS_ORIGINS', 'http://localhost:3000'),
  STORAGE_TYPE: (process.env.STORAGE_TYPE || 'local') as 'local' | 's3',
  STORAGE_PATH: process.env.STORAGE_PATH || './uploads',
};

// Validate critical config on startup
export const validateConfig = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = required.filter((key) => !getEnv(key, ''));

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secrets have minimum length
  if (config.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  if (config.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
  }

  console.log('✓ Environment configuration validated');
};
