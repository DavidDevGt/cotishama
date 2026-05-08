import { Hono } from "hono";
import { quoteService } from "../services";
import { authMiddleware, requireRole, getUser } from "../middleware/auth";
import { ValidationError, NotFoundError, ConflictError } from "../types/errors";

const router = new Hono();

router.use(authMiddleware);

router.get("/", async (c) => {
  try {
    const user = getUser(c);
    const page = Number.parseInt(c.req.query("page") || "1");
    const limit = Number.parseInt(c.req.query("limit") || "20");
    const status = c.req.query("status");
    const clientId = c.req.query("clientId");

    const offset = (page - 1) * limit;
    const filters: any = { limit, offset };

    if (status) filters.status = status;
    if (clientId) filters.clientId = Number.parseInt(clientId);

    const quotes = await quoteService.listQuotes(filters);

    return c.json({
      success: true,
      data: quotes,
      status_code: 200,
    });
  } catch (error) {
    throw error;
  }
});

router.post("/", async (c) => {
  try {
    const user = getUser(c);
    const body = await c.req.json();

    const input = {
      quoteNumber: body.quoteNumber,
      clientId: body.clientId,
      validUntil: new Date(body.validUntil),
      notes: body.notes,
      details: body.details || [],
    };

    const quote = await quoteService.createQuote(input, user.id);

    return c.json(
      {
        success: true,
        data: quote,
        status_code: 201,
      },
      201,
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return c.json({ success: false, error: error.message, status_code: 400 }, 400);
    }
    if (error instanceof NotFoundError) {
      return c.json({ success: false, error: error.message, status_code: 404 }, 404);
    }
    if (error instanceof ConflictError) {
      return c.json({ success: false, error: error.message, status_code: 409 }, 409);
    }
    throw error;
  }
});

router.get("/:id", async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const user = getUser(c);

    const quote = await quoteService.getQuote(id);

    return c.json({
      success: true,
      data: quote,
      status_code: 200,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ success: false, error: error.message, status_code: 404 }, 404);
    }
    throw error;
  }
});

router.put("/:id", async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const user = getUser(c);
    const body = await c.req.json();

    const updated = await quoteService.updateQuote(id, body, user.id);

    return c.json({
      success: true,
      data: updated,
      status_code: 200,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ success: false, error: error.message, status_code: 404 }, 404);
    }
    if (error instanceof ValidationError) {
      return c.json({ success: false, error: error.message, status_code: 400 }, 400);
    }
    throw error;
  }
});

router.patch("/:id/status", async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const user = getUser(c);
    const body = await c.req.json();

    const updated = await quoteService.changeStatus(id, body.status, user.id, body.reason);

    return c.json({
      success: true,
      data: updated,
      status_code: 200,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ success: false, error: error.message, status_code: 404 }, 404);
    }
    if (error instanceof ValidationError) {
      return c.json({ success: false, error: error.message, status_code: 400 }, 400);
    }
    throw error;
  }
});

router.delete("/:id", async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const user = getUser(c);

    await quoteService.deleteQuote(id);

    return c.json({
      success: true,
      data: { message: "Quote deleted" },
      status_code: 200,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ success: false, error: error.message, status_code: 404 }, 404);
    }
    if (error instanceof ValidationError) {
      return c.json({ success: false, error: error.message, status_code: 400 }, 400);
    }
    throw error;
  }
});

export default router;
