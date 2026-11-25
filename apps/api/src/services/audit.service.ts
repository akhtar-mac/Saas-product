import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { hasColumn } from '../rbac/schema-features.js';

export interface CreateAuditLogParams {
  actorId?: number;
  userId?: number;
  actorEmail?: string;
  actorRole?: string;
  /** display name of the actor (new column, falls back to payload) */
  actorName?: string;
  /** 'users' | 'staff_users' */
  actorSource?: string;
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
  /** e.g. 'Leads', 'Users & Access', 'Recycle Bin' */
  module?: string;
  /** one plain-language line for the Logs page */
  summary?: string;
  statusCode?: number;
  method?: string;
  path?: string;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'new_password',
  'old_password',
  'confirm_password',
  'token',
  'user_token',
  'secret',
  'card_number',
  'cvv',
  'otp',
  'access_token',
  'refresh_token',
  'accesstoken',
  'refreshtoken',
  'authorization',
]);

const MAX_PAYLOAD = 20_000;

export function sanitize(data: unknown): unknown {
  if (data === undefined || data === null) return null;
  try {
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (SENSITIVE_KEYS.has(String(key).toLowerCase())) return '[REDACTED]';
        if (typeof value === 'bigint') return value.toString();
        if (typeof value === 'string' && value.length > 2000) return value.slice(0, 2000) + '…';
        return value;
      })
    );
  } catch {
    return '[UNSERIALIZABLE]';
  }
}

function sanitizePayload(data: unknown): string | null {
  const s = sanitize(data);
  if (s === null) return null;
  const str = typeof s === 'string' ? s : JSON.stringify(s);
  return str.length > MAX_PAYLOAD ? str.slice(0, MAX_PAYLOAD) : str;
}

/**
 * Record an audit log entry (never throws, never blocks the caller's response).
 * Uses the add-only columns (module, summary, actor_name, changes …) when the
 * migration has been applied; otherwise writes the original columns only.
 */
export async function recordAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    const actorId = params.actorId ?? params.userId ?? null;
    const resource = (params.resource ?? params.entityType ?? 'general').slice(0, 100);
    const resourceId = params.resourceId ?? params.entityId ?? null;
    const hasDiff = params.oldState !== undefined || params.newState !== undefined;
    const changes = hasDiff
      ? sanitizePayload({ before: params.oldState ?? null, after: params.newState ?? null })
      : null;

    if (await hasColumn('audit_logs', 'module')) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO audit_logs
          (actor_id, actor_email, actor_role, actor_name, actor_source, action, resource, resource_id,
           module, summary, status_code, method, path, payload, changes, ip_address, user_agent, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,UTC_TIMESTAMP())`,
        actorId,
        params.actorEmail?.slice(0, 150) ?? null,
        params.actorRole?.slice(0, 50) ?? null,
        params.actorName?.slice(0, 150) ?? null,
        params.actorSource?.slice(0, 20) ?? null,
        params.action.slice(0, 100),
        resource,
        resourceId !== null ? String(resourceId).slice(0, 50) : null,
        params.module?.slice(0, 60) ?? null,
        params.summary?.slice(0, 500) ?? null,
        params.statusCode ?? null,
        params.method?.slice(0, 10) ?? null,
        params.path?.slice(0, 255) ?? null,
        sanitizePayload(params.payload ?? null),
        changes,
        params.ipAddress?.slice(0, 45) ?? null,
        params.userAgent ? params.userAgent.slice(0, 500) : null
      );
      return;
    }

    // Pre-migration fallback: original columns only, extras folded into payload.
    const payloadStr = sanitizePayload({
      ...(params.payload && typeof params.payload === 'object'
        ? (params.payload as object)
        : { data: params.payload ?? null }),
      ...(hasDiff ? { before: params.oldState ?? null, after: params.newState ?? null } : {}),
      _module: params.module,
      _summary: params.summary,
      _actor_name: params.actorName,
      _status: params.statusCode,
    });
    await (prisma as any).audit_logs.create({
      data: {
        actor_id: actorId,
        actor_email: params.actorEmail ?? null,
        actor_role: params.actorRole ?? null,
        action: params.action,
        resource,
        resource_id: resourceId !== null ? String(resourceId) : null,
        payload: payloadStr ? payloadStr.slice(0, 65000) : null,
        ip_address: params.ipAddress ?? null,
        user_agent: params.userAgent ? params.userAgent.slice(0, 500) : null,
      },
    });
  } catch (err: any) {
    logger.warn('Failed to write audit_log record to DB:', {
      error: err.message,
      action: params.action,
    });
  }
}

export default { recordAuditLog };
