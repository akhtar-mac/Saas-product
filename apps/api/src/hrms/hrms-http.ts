/** Small shared helpers for the profile and HRMS routers. */
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { recordAuditLog } from '../services/audit.service.js';
import { attachRbac, RbacContext } from '../rbac/route-guard.js';
import { canonical, Principal } from './hrms-data.js';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

export interface Me {
  ctx: RbacContext;
  /** the person, mapped to the old `users` row when the email matches */
  who: Principal;
  name: string;
}

export async function meOf(req: Request): Promise<Me> {
  const ctx = await attachRbac(req);
  if (!ctx) throw new HttpError(401, 'Please sign in with your staff account.');
  const who = await canonical({ source: ctx.profile.source, id: ctx.profile.id });
  return { ctx, who, name: ctx.profile.name || ctx.profile.email || `Staff #${ctx.profile.id}` };
}

export function requirePerm(me: Me, ...anyOf: string[]) {
  if (!anyOf.some((p) => me.ctx.has(p))) {
    throw new HttpError(
      403,
      "You don't have access to this option. Ask an admin to give you access.",
      'PERMISSION_DENIED'
    );
  }
}

export function audit(
  req: Request,
  res: Response,
  me: Me | null,
  p: {
    module: 'Profile' | 'HR';
    action: string;
    resource: string;
    resourceId?: string | number;
    summary: string;
    oldState?: unknown;
    newState?: unknown;
  }
) {
  res.locals.auditLogged = true;
  const a = me?.ctx.profile;
  void recordAuditLog({
    actorId: a?.id,
    actorEmail: a?.email,
    actorName: a?.name,
    actorRole: a?.roleKey,
    actorSource: a?.source,
    statusCode: 200,
    method: req.method,
    path: req.originalUrl.split('?')[0],
    ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
    userAgent: req.headers['user-agent'],
    ...p,
  });
}

export function fail(res: Response, err: unknown) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, error: err.message, code: err.code });
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({
      success: false,
      error: first?.message || 'Please check the form.',
      field: first?.path?.join('.'),
    });
  }
  const e: any = err;
  if (e?.statusCode === 400 || e?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: e.code === 'LIMIT_FILE_SIZE' ? 'Photo is larger than 2 MB.' : e.message,
    });
  }
  console.error('[hrms]', e?.message || e);
  return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
}

export const tablesMissing = (what: string) =>
  new HttpError(
    503,
    `${what} is not switched on yet: the HR tables have not been added to the database.`,
    'HR_TABLES_MISSING'
  );

/** Wrap an async handler with the common error reply. */
export const h =
  (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) =>
    fn(req, res).catch((e) => fail(res, e));
