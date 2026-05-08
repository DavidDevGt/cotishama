/**
 * Client Routes
 * GET /api/v1/clients
 * POST /api/v1/clients
 * GET /api/v1/clients/:id
 * PUT /api/v1/clients/:id
 * GET /api/v1/clients/:id/quotes
 */

import { Hono } from 'hono';

const router = new Hono();

// @todo Implement all client endpoints
router.get('/', async (c) => c.json({ message: 'Client list implementation pending' }, 501));
router.post('/', async (c) => c.json({ message: 'Client create implementation pending' }, 501));
router.get('/:id', async (c) => c.json({ message: 'Client get implementation pending' }, 501));
router.put('/:id', async (c) => c.json({ message: 'Client update implementation pending' }, 501));
router.get('/:id/quotes', async (c) => c.json({ message: 'Client quotes implementation pending' }, 501));

export default router;
