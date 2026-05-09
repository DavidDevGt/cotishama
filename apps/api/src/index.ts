/**
 * API Entry Point
 * Starts the Hono.js server
 */

import { serve } from '@hono/node-server';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const port = env.port;

logger.info(`Starting API server on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

logger.info(`Server running at http://localhost:${port}`);