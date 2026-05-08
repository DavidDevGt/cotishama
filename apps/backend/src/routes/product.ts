import { Hono } from 'hono';
import { productService } from '../services';
import { authMiddleware, requireRole, getUser } from '../middleware/auth';
import { ValidationError, NotFoundError, ConflictError } from '../types/errors';

const router = new Hono();

router.use(authMiddleware);

router.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const category = c.req.query('category');
    const minPrice = c.req.query('minPrice');
    const maxPrice = c.req.query('maxPrice');

    const offset = (page - 1) * limit;
    const filters: any = { limit, offset };

    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    const products = await productService.listProducts(filters);

    return c.json({
      success: true,
      data: products,
      status_code: 200,
    });
  } catch (error) {
    throw error;
  }
});

router.get('/search', async (c) => {
  try {
    const query = c.req.query('q') || '';
    const limit = parseInt(c.req.query('limit') || '20');

    const results = await productService.searchProducts(query, limit);

    return c.json({
      success: true,
      data: results,
      status_code: 200,
    });
  } catch (error) {
    throw error;
  }
});

router.post('/', requireRole('ADMIN', 'OPERATOR'), async (c) => {
  try {
    const user = getUser(c);
    const body = await c.req.json();

    const product = await productService.createProduct({
      ...body,
      createdBy: user.id,
    });

    return c.json({
      success: true,
      data: product,
      status_code: 201,
    }, 201);
  } catch (error) {
    if (error instanceof ConflictError) {
      return c.json(
        { success: false, error: error.message, status_code: 409 },
        409
      );
    }
    if (error instanceof ValidationError) {
      return c.json(
        { success: false, error: error.message, status_code: 400 },
        400
      );
    }
    throw error;
  }
});

router.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const product = await productService.getProduct(id);

    return c.json({
      success: true,
      data: product,
      status_code: 200,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(
        { success: false, error: error.message, status_code: 404 },
        404
      );
    }
    throw error;
  }
});

router.put('/:id', requireRole('ADMIN', 'OPERATOR'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const updated = await productService.updateProduct(id, body);

    return c.json({
      success: true,
      data: updated,
      status_code: 200,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(
        { success: false, error: error.message, status_code: 404 },
        404
      );
    }
    if (error instanceof ConflictError) {
      return c.json(
        { success: false, error: error.message, status_code: 409 },
        409
      );
    }
    throw error;
  }
});

router.patch('/:id/stock', requireRole('ADMIN', 'OPERATOR'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (typeof body.quantity !== 'number') {
      return c.json(
        { success: false, error: 'quantity must be a number', status_code: 400 },
        400
      );
    }

    const updated = await productService.updateStock(id, body.quantity);

    return c.json({
      success: true,
      data: updated,
      status_code: 200,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(
        { success: false, error: error.message, status_code: 404 },
        404
      );
    }
    if (error instanceof ValidationError) {
      return c.json(
        { success: false, error: error.message, status_code: 400 },
        400
      );
    }
    throw error;
  }
});

router.delete('/:id', requireRole('ADMIN'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    await productService.deleteProduct(id);

    return c.json({
      success: true,
      data: { message: 'Product deleted' },
      status_code: 200,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(
        { success: false, error: error.message, status_code: 404 },
        404
      );
    }
    throw error;
  }
});

export default router;
