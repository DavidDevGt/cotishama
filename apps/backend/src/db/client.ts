import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getEnv } from '../config/env';
import * as schema from './schema';

const dbUrl = getEnv('DATABASE_URL');

const client = postgres(dbUrl, {
  prepare: false,
});

export const db = drizzle(client, { schema });

export async function closeDb() {
  await client.end();
}
