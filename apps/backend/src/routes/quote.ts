/**
 * Quote Routes
 * GET /api/v1/quotes
 * POST /api/v1/quotes
 * GET /api/v1/quotes/:id
 * PUT /api/v1/quotes/:id
 * PATCH /api/v1/quotes/:id/status
 * GET /api/v1/quotes/:id/pdf
 * DELETE /api/v1/quotes/:id
 */

import { Hono } from 'hono';

const router = new Hono();

// @todo Implement all quote endpoints
router.get('/', async (c) => c.json({ message: 'Quote list implementation pending' }, 501));
router.post('/', async (c) => c.json({ message: 'Quote create implementation pending' }, 501));
router.get('/:id', async (c) => c.json({ message: 'Quote get implementation pending' }, 501));
router.put('/:id', async (c) => c.json({ message: 'Quote update implementation pending' }, 501));
router.patch('/:id/status', async (c) => c.json({ message: 'Quote status implementation pending' }, 501));
router.get('/:id/pdf', async (c) => c.json({ message: 'PDF download implementation pending' }, 501));
router.delete('/:id', async (c) => c.json({ message: 'Quote delete implementation pending' }, 501));

export default router;
