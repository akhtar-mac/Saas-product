import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// ─── Audit log entry structure ─────────────────────────────────────────────────
interface AuditLogEntry {
  actor_id?: number;
  actor_email?: string;
  actor_role?: string;
  action: string;       // e.g., 'CREATE_LEAD', 'UPDATE_TASK_STATUS'
  resource: string;     // e.g., 'leads', 'tasks'
  resource_id?: string;
  payload?: unknown;
  ip?: string;
  user_agent?: string;
  timestamp: string;
}

// ─── Audit logger (logs to Winston — DB write can be wired later) ─────────────
function writeAuditLog(entry: AuditLogEntry): void {
  logger.info('AUDIT', entry);
  // TODO: Phase 4 — write to audit_logs table in DB via Prisma
}

// ─── Audit middleware factory ──────────────────────────────────────────────────
/**
 * Logs staff actions for audit trail.
 * @param action — verb describing the action, e.g. 'UPDATE_LEAD_STATUS'
 * @param resource — resource type, e.g. 'leads'
 * @param getResourceId — optional extractor for the resource ID from req
 */
export function auditLog(
  action: string,
  resource: string,
  getResourceId?: (req: Request) => string | undefined
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const entry: AuditLogEntry = {
      actor_id: req.user?.user_id,
      actor_email: req.user?.email,
      actor_role: req.user?.role_name,
      action,
      resource,
      resource_id: getResourceId?.(req) ?? req.params?.id,
      payload: req.method !== 'GET' ? sanitizePayload(req.body) : undefined,
      ip: req.ip || req.socket?.remoteAddress,
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    };
    writeAuditLog(entry);
    next();
  };
}

// ─── Soft-delete helper (Prisma extension) ────────────────────────────────────
/**
 * Adds soft-delete filtering to Prisma queries.
 * Use in Prisma client extension: prisma.$extends(softDeleteExtension)
 */
export const softDeleteExtension = {
  name: 'softDelete',
  query: {
    $allModels: {
      async findMany({ args, query }: { args: Record<string, unknown>; query: (args: unknown) => Promise<unknown> }) {
        if (!args.where) args.where = {};
        const where = args.where as Record<string, unknown>;
        if (!('deletedAt' in where)) {
          where.deletedAt = null;
        }
        return query(args);
      },
      async findFirst({ args, query }: { args: Record<string, unknown>; query: (args: unknown) => Promise<unknown> }) {
        if (!args.where) args.where = {};
        const where = args.where as Record<string, unknown>;
        if (!('deletedAt' in where)) {
          where.deletedAt = null;
        }
        return query(args);
      },
      async findUnique({ args, query }: { args: Record<string, unknown>; query: (args: unknown) => Promise<unknown> }) {
        return query(args); // findUnique doesn't filter by default
      },
      async count({ args, query }: { args: Record<string, unknown>; query: (args: unknown) => Promise<unknown> }) {
        if (!args.where) args.where = {};
        const where = args.where as Record<string, unknown>;
        if (!('deletedAt' in where)) {
          where.deletedAt = null;
        }
        return query(args);
      },
    },
  },
};

// ─── Request logger middleware ────────────────────────────────────────────────
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logFn = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';
    logger[logFn](`${method} ${originalUrl} ${statusCode} ${duration}ms`, {
      ip,
      userAgent: req.headers['user-agent'],
      actor: req.user?.email,
    });
  });

  next();
}

// ─── Utility: strip sensitive fields before logging ────────────────────────────
function sanitizePayload(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const sanitized = { ...(body as Record<string, unknown>) };
  const sensitiveFields = ['password', 'password_hash', 'token', 'secret', 'card_number', 'cvv'];
  for (const field of sensitiveFields) {
    if (field in sanitized) sanitized[field] = '[REDACTED]';
  }
  return sanitized;
}
