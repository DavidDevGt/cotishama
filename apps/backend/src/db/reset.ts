import postgres from 'postgres';
import { getEnv } from '../config/env';

async function resetDatabase() {
  const dbUrl = getEnv('DATABASE_URL');
  const client = postgres(dbUrl, { prepare: false });

  try {
    console.log('🔄 Dropping all tables...');

    await client`DROP SCHEMA IF EXISTS public CASCADE`;
    await client`CREATE SCHEMA public`;

    console.log('✅ Database reset successfully');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  resetDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
