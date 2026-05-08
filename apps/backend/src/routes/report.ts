import { Hono } from 'hono';
import { authMiddleware, requireRole, getUser } from '../middleware/auth';
import { quoteService } from '../services';

const router = new Hono();

router.use(authMiddleware);

router.get('/summary', requireRole('ADMIN', 'OPERATOR'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = (page - 1) * limit;

    const quotes = await quoteService.listQuotes({ limit, offset });

    const summary = {
      totalQuotes: quotes.length,
      byStatus: {
        draft: quotes.filter((q) => q.status === 'DRAFT').length,
        sent: quotes.filter((q) => q.status === 'SENT').length,
        accepted: quotes.filter((q) => q.status === 'ACCEPTED').length,
        rejected: quotes.filter((q) => q.status === 'REJECTED').length,
        expired: quotes.filter((q) => q.status === 'EXPIRED').length,
        archived: quotes.filter((q) => q.status === 'ARCHIVED').length,
      },
      totalValue: quotes.reduce((sum, q) => sum + parseFloat(q.total), 0),
      averageValue: quotes.length > 0 
        ? quotes.reduce((sum, q) => sum + parseFloat(q.total), 0) / quotes.length 
        : 0,
    };

    return c.json({
      success: true,
      data: summary,
      status_code: 200,
    });
  } catch (error) {
    throw error;
  }
});

router.get('/metrics', requireRole('ADMIN'), async (c) => {
  try {
    const quotes = await quoteService.listQuotes({ limit: 1000 });

    const metrics = {
      acceptanceRate: quotes.length > 0
        ? (quotes.filter((q) => q.status === 'ACCEPTED').length / quotes.length) * 100
        : 0,
      rejectionRate: quotes.length > 0
        ? (quotes.filter((q) => q.status === 'REJECTED').length / quotes.length) * 100
        : 0,
      averageQuoteValue: quotes.length > 0
        ? quotes.reduce((sum, q) => sum + parseFloat(q.total), 0) / quotes.length
        : 0,
      medianQuoteValue: quotes.length > 0
        ? quotes.sort((a, b) => parseFloat(a.total) - parseFloat(b.total))[
            Math.floor(quotes.length / 2)
          ].total
        : 0,
    };

    return c.json({
      success: true,
      data: metrics,
      status_code: 200,
    });
  } catch (error) {
    throw error;
  }
});

router.get('/export', requireRole('ADMIN'), async (c) => {
  try {
    const format = c.req.query('format') || 'json';
    const quotes = await quoteService.listQuotes({ limit: 10000 });

    if (format === 'csv') {
      const csv = [
        'ID,Quote Number,Client ID,Status,Total,Created At',
        ...quotes.map(
          (q) =>
            `${q.id},"${q.quoteNumber}",${q.clientId},"${q.status}",${q.total},"${q.createdAt}"`
        ),
      ].join('\n');

      c.header('Content-Type', 'text/csv');
      c.header('Content-Disposition', 'attachment; filename="quotes-export.csv"');
      return c.text(csv);
    }

    return c.json({
      success: true,
      data: quotes,
      status_code: 200,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
