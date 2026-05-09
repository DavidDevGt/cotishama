/**
 * Environment variables and validation for the API
 */

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  port: number;
  nodeEnv: string;
}

function getEnv(): EnvConfig {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const port = parseInt(process.env.PORT || '3001', 10);
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!supabaseUrl) {
    console.warn('SUPABASE_URL not set, using default');
  }

  if (!supabaseAnonKey) {
    console.warn('SUPABASE_ANON_KEY not set, using default');
  }

  return {
    supabaseUrl: supabaseUrl || 'http://localhost:54321',
    supabaseAnonKey: supabaseAnonKey || '',
    port,
    nodeEnv,
  };
}

export const env = getEnv();