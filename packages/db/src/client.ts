/**
 * Supabase client configuration for database operations
 * Uses @supabase/supabase-js for database access
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables should be set in apps/api/.env
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// Database schema import for type inference
export * from './schema.js';