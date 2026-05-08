/**
 * Database Configuration & Connection
 * PostgreSQL with connection pooling
 */

import { Client } from 'pg';
import { config, validateConfig } from './env';

let dbClient: Client | null = null;

export const initializeDatabase = async () => {
  validateConfig();

  try {
    dbClient = new Client({
      connectionString: config.DATABASE_URL,
      connectionTimeoutMillis: config.DATABASE_CONNECT_TIMEOUT,
      idleTimeoutMillis: config.DATABASE_IDLE_TIMEOUT,
      max: config.DATABASE_POOL_MAX,
    });

    // Test connection
    await dbClient.connect();
    console.log('✓ Database connection established');

    // Verify database version
    const result = await dbClient.query('SELECT version()');
    console.log('✓ PostgreSQL:', result.rows[0].version.split(',')[0]);

    return dbClient;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
};

export const getDatabase = (): Client => {
  if (!dbClient) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbClient;
};

export const closeDatabase = async () => {
  if (dbClient) {
    await dbClient.end();
    dbClient = null;
    console.log('✓ Database connection closed');
  }
};

/**
 * Execute a raw query
 * Use with caution - prefer parameterized queries
 */
export const query = async (sql: string, params?: any[]) => {
  const db = getDatabase();
  try {
    return await db.query(sql, params);
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
};

/**
 * Execute a transaction
 */
export const transaction = async <T>(
  callback: (client: Client) => Promise<T>
): Promise<T> => {
  const db = getDatabase();
  const client = await db.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
