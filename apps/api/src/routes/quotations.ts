/**
 * Quotations API routes
 * POST /api/quotations - Create new quotation
 * GET /api/quotations - List quotations
 * GET /api/quotations/:id - Get quotation by ID
 * PUT /api/quotations/:id/items - Update quotation items
 * PUT /api/quotations/:id/save - Save quotation
 * POST /api/quotations/:id/duplicate - Duplicate quotation
 */

import { Hono } from 'hono';
import { createQuotation, getQuotationById, updateQuotationItems, saveQuotation, listQuotations, duplicateQuotation } from '../services/quotation_service.js';

const quotationRoutes = new Hono();

/**
 * POST /api/quotations
 * Create a new quotation (draft)
 */
quotationRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.clientName) {
      return c.json(
        {
          success: false,
          error: { code: 'MISSING_CLIENT_NAME', message: 'clientName is required' },
        },
        400
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return c.json(
        {
          success: false,
          error: { code: 'MISSING_ITEMS', message: 'items array is required and must not be empty' },
        },
        400
      );
    }

    const quotation = await createQuotation({
      clientName: body.clientName,
      clientAddress: body.clientAddress,
      items: body.items,
      observations: body.observations,
    });

    return c.json({ success: true, data: quotation }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json(
      {
        success: false,
        error: { code: 'CREATE_ERROR', message },
      },
      500
    );
  }
});

/**
 * GET /api/quotations
 * List all quotations with optional filters
 */
quotationRoutes.get('/', async (c) => {
  try {
    const status = c.req.query('status') || undefined;
    const limit = parseInt(c.req.query('limit') || '50', 10);
    const offset = parseInt(c.req.query('offset') || '0', 10);

    const result = await listQuotations(status, limit, offset);

    return c.json({
      success: true,
      data: {
        quotations: result.quotations,
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json(
      {
        success: false,
        error: { code: 'LIST_ERROR', message },
      },
      500
    );
  }
});

/**
 * GET /api/quotations/:id
 * Get a quotation by ID
 */
quotationRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const quotation = await getQuotationById(id);

    if (!quotation) {
      return c.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Quotation not found' },
        },
        404
      );
    }

    return c.json({ success: true, data: quotation });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json(
      {
        success: false,
        error: { code: 'GET_ERROR', message },
      },
      500
    );
  }
});

/**
 * PUT /api/quotations/:id/items
 * Update items in a quotation
 */
quotationRoutes.put('/:id/items', async (c) => {
  const id = c.req.param('id');

  try {
    const body = await c.req.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return c.json(
        {
          success: false,
          error: { code: 'MISSING_ITEMS', message: 'items array is required and must not be empty' },
        },
        400
      );
    }

    const quotation = await updateQuotationItems(id, { items: body.items });

    return c.json({ success: true, data: quotation });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = message.includes('not found') ? 404 : message.includes('Cannot update') ? 400 : 500;
    return c.json(
      {
        success: false,
        error: { code: 'UPDATE_ERROR', message },
      },
      statusCode
    );
  }
});

/**
 * PUT /api/quotations/:id/save
 * Save a quotation (lock prices in snapshot)
 */
quotationRoutes.put('/:id/save', async (c) => {
  const id = c.req.param('id');

  try {
    const quotation = await saveQuotation(id);

    return c.json({ success: true, data: quotation });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = message.includes('not found') ? 404 : message.includes('already saved') ? 400 : 500;
    return c.json(
      {
        success: false,
        error: { code: 'SAVE_ERROR', message },
      },
      statusCode
    );
  }
});

/**
 * POST /api/quotations/:id/duplicate
 * Duplicate a quotation
 */
quotationRoutes.post('/:id/duplicate', async (c) => {
  const id = c.req.param('id');

  try {
    const quotation = await duplicateQuotation(id);

    return c.json({ success: true, data: quotation }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json(
      {
        success: false,
        error: { code: 'DUPLICATE_ERROR', message },
      },
      500
    );
  }
});

export default quotationRoutes;