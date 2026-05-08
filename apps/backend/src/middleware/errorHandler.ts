/**
 * Error Handler Middleware
 * Centralized error handling
 */

import type { Context } from "hono";
import { AppError, isAppError } from "../types/errors";

export const errorHandler = () => {
  return (err: Error, c: Context) => {
    const requestId = c.get("request_id") || "unknown";
    const timestamp = new Date().toISOString();

    // Log error
    console.error(`[${requestId}] Error:`, err);

    if (isAppError(err)) {
      return c.json(
        {
          success: false,
          status_code: err.statusCode,
          error: {
            code: err.code,
            message: err.message,
            details: err.details,
          },
          metadata: {
            timestamp,
            request_id: requestId,
            version: "v1",
          },
        },
        err.statusCode,
      );
    }

    // Handle Zod validation errors
    if (err.name === "ZodError") {
      const zodError = err as any;
      return c.json(
        {
          success: false,
          status_code: 400,
          error: {
            code: "VALIDATION_ERROR",
            message: "Datos inválidos",
            details: zodError.errors?.map((e: any) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          metadata: {
            timestamp,
            request_id: requestId,
            version: "v1",
          },
        },
        400,
      );
    }

    // Handle unknown errors
    return c.json(
      {
        success: false,
        status_code: 500,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Error interno del servidor",
        },
        metadata: {
          timestamp,
          request_id: requestId,
          version: "v1",
        },
      },
      500,
    );
  };
};
