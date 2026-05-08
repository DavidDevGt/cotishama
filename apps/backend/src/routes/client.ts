import { Hono } from 'hono';
import { clientService } from '../services';
import { quoteService } from '../services';
import { authMiddleware, getUser } from '../middleware/auth';
import { ValidationError, NotFoundError, ConflictError } from '../types/errors';

const router = new Hono();

router.use(authMiddleware);

router.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const name = c.req.query('name');
    const email = c.req.query('email');

    const offset = (page - 1) * limit;
    const filters: any = { limit, offset };

    if (name) filters.name = name;
    if (email) filters.email = email;

    const clients = await clientService.listClients(filters);

    return c.json({
      success: true,
      data: clients,
      status_code: 200,
    });
  } catch (error) {
    throw error;
  }
});

router.post('/', async (c) => {
  try {
    const user = getUser(c);
    const body = await c.req.json();

    const client = await clientService.createClient({
      ...body,
      createdBy: user.id,
    });

    return c.json({
      success: true,
      data: client,
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
    const client = await clientService.getClient(id);

    return c.json({
      success: true,
      data: client,
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

router.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const updated = await clientService.updateClient(id, body);

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

router.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    await clientService.deleteClient(id);

    return c.json({
      success: true,
      data: { message: 'Client deleted' },
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

router.get('/:id/quotes', async (c) => {
  try {
    const clientId = parseInt(c.req.param('id'));
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');

    // Verify client exists
    await clientService.getClient(clientId);

    const offset = (page - 1) * limit;
    const quotes = await quoteService.listQuotes({
      clientId,
      limit,
      offset,
    });

    return c.json({
      success: true,
      data: quotes,
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
