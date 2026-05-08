import { defineConfig } from 'drizzle-kit';
import { getEnv } from './apps/backend/src/config/env';

export default defineConfig({
  schema: './apps/backend/src/db/schema',
  out: './apps/backend/src/db/migrations-generated',
  driver: 'pg',
  dbCredentials: {
    connectionString: getEnv('DATABASE_URL'),
  },
  migrations: {
    prefix: 'timestamp',
  },
});
