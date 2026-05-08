/**
 * Product Routes
 * GET /api/v1/products
 * GET /api/v1/products/search
 * POST /api/v1/products
 * PATCH /api/v1/products/:id/stock
 */

import { Hono } from 'hono';

const router = new Hono();

// @todo Implement all product endpoints
router.get('/', async (c) => c.json({ message: 'Product list implementation pending' }, 501));
router.get('/search', async (c) => c.json({ message: 'Product search implementation pending' }, 501));
router.post('/', async (c) => c.json({ message: 'Product create implementation pending' }, 501));
router.patch('/:id/stock', async (c) => c.json({ message: 'Stock adjust implementation pending' }, 501));

export default router;
