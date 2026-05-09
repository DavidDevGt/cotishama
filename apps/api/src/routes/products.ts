/**
 * Products API routes
 * GET /api/products/search - Fuzzy search for products
 */

import { Hono } from 'hono';
import { searchProducts } from '../services/product_service.js';

const productRoutes = new Hono();

/**
 * GET /api/products/search?q=<query>&limit=<limit>
 * Fuzzy search for products using PostgreSQL pg_trgm
 */
productRoutes.get('/search', async (c) => {
  const query = c.req.query('q');
  const limit = parseInt(c.req.query('limit') || '20', 10);

  // Validate required parameter
  if (!query || query.trim() === '') {
    return c.json(
      {
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'The "q" query parameter is required',
        },
      },
      400
    );
  }

  try {
    const products = await searchProducts(query.trim(), limit);
    return c.json({
      success: true,
      data: { products },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json(
      {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message,
        },
      },
      500
    );
  }
});

export default productRoutes;