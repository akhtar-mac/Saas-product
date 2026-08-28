import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { logger } from '../utils/logger.js';

// ─── Standard API error class ─────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }
  static forbidden(message = 'Access denied'): ApiError {
    return new ApiError(403, message, 'FORBIDDEN');
  }
  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message, 'NOT_FOUND');
  }
  static conflict(message: string): ApiError {
    return new ApiError(409, message, 'CONFLICT');
  }
  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(429, message, 'RATE_LIMIT_EXCEEDED');
  }
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}

// ─── Global error handler middleware ─────────────────────────────────────────
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ApiError — our own typed error
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // ZodError — validation failure
  if (err instanceof ZodError) {
    const fieldErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: fieldErrors,
      },
    });
    return;
  }

  // Unknown errors
  const error = err as { message?: string; status?: number; statusCode?: number };
  const statusCode = error.status || error.statusCode || 500;
  const message = error.message || 'Internal server error';

  logger.error('Unhandled error:', { error: err, stack: (err as Error).stack });

  res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
      code: 'INTERNAL_ERROR',
    },
  });
}

// ─── 404 handler for unmatched routes ────────────────────────────────────────
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
}

// ─── Async handler wrapper ─────────────────────────────────────────────────────
/** Wraps an async route handler and forwards errors to next() */
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ─── Zod body validation middleware factory ───────────────────────────────────
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}

// ─── Zod query validation middleware factory ──────────────────────────────────
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
}
