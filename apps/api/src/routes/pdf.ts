/**
 * PDF API routes
 * GET /api/quotations/:id/pdf - Generate and download PDF for a quotation
 */

import { Hono } from 'hono';
import { generatePDF } from '../services/pdf_service.js';

const pdfRoutes = new Hono();

/**
 * GET /api/quotations/:id/pdf
 * Generate and download PDF for a saved quotation
 */
pdfRoutes.get('/:id/pdf', async (c) => {
  const id = c.req.param('id');

  try {
    const pdfBuffer = await generatePDF(id);

    return new Response(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cotizacion-${id}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // Determine appropriate status code
    let statusCode: number = 500;
    if (message.includes('not found')) {
      statusCode = 404;
    } else if (message.includes('draft')) {
      statusCode = 400;
    }

    return c.json(
      {
        success: false,
        error: { code: 'PDF_GENERATION_ERROR', message },
      },
      statusCode as any
    );
  }
});

export default pdfRoutes;