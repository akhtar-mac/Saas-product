import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

export interface CreateAuditLogParams {
  actorId?: number;
  userId?: number;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resource?: string;
  entityType?: string;
  resourceId?: string | number;
  entityId?: string | number;
  payload?: unknown;
  oldState?: unknown;
  newState?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'token',
  'secret',
  'card_number',
  'cvv',
  'access_token',
  'refresh_token',
  'authorization',
]);

function sanitizePayload(data: unknown): string | null {
  if (data === undefined || data === null) return null;
  try {
    if (typeof data !== 'object') return String(data);
    const sanitized = JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
          return '[REDACTED]';
        }
        return value;
      })
    );
    return JSON.stringify(sanitized);
  } catch {
    return '[UNSERIALIZABLE]';
  }
}

/**
 * Record an immutable audit log entry.
 * Runs asynchronously without blocking the calling request.
 */
export async function recordAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    const actorId = params.actorId ?? params.userId ?? null;
    const resource = params.resource ?? params.entityType ?? 'general';
    const resourceId = params.resourceId ?? params.entityId ?? null;
    const rawPayload =
      params.payload ??
      (params.oldState !== undefined || params.newState !== undefined
        ? { oldState: params.oldState, newState: params.newState }
        : null);

    const payloadStr = sanitizePayload(rawPayload);

    await (prisma as any).audit_logs.create({
      data: {
        actor_id: actorId,
        actor_email: params.actorEmail ?? null,
        actor_role: params.actorRole ?? null,
        action: params.action,
        resource,
        resource_id: resourceId ? String(resourceId) : null,
        payload: payloadStr,
        ip_address: params.ipAddress ?? null,
        user_agent: params.userAgent ? params.userAgent.slice(0, 500) : null,
      },
    });
  } catch (err: any) {
    logger.warn('Failed to write audit_log record to DB:', { error: err.message, action: params.action });
  }
}

export default { recordAuditLog };
