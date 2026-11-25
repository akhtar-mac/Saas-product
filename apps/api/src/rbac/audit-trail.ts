/**
 * Writes one audit_logs row for every staff change (POST/PUT/PATCH/DELETE) and
 * every export, after the response is sent. Handlers that write their own
 * richer entry (with before/after) set `res.locals.auditLogged = true`.
 */
import { Request, Response, NextFunction } from 'express';
import { recordAuditLog } from '../services/audit.service.js';
import { attachRbac } from './route-guard.js';

const STAFF_PATH =
  /^\/v1\/(crm|staff|call-logs|admin|chat|hr|marketing|it|disbursements|ai|infrastructure)(\/|$)/;
// High-volume or read-like POSTs that would drown the log.
const QUIET = [
  /^\/v1\/call-logs\/sync/,
  /^\/v1\/(crm|staff)\/notifications\/read/,
  /^\/v1\/(crm|staff)\/desktrack\/logout-event/,
  /^\/v1\/(crm|staff)\/customers\/check-(email|mobile)/,
  /^\/v1\/(crm|staff)\/coupons\/validate/,
  /^\/v1\/(crm|staff)\/audit-logs/,
  /^\/v1\/chat\/.*\/(read|typing|seen)/,
];

const MODULES: Array<[RegExp, string]> = [
  // before /users: HR paths carry /employees/users/:id
  [/\/(crm|staff)\/profile\//, 'Profile'],
  [/\/(crm|staff)\/hrms\//, 'HR'],
  [/\/access\b|\/users\b|\/admin\/users/, 'Users & Access'],
  [/\/recycle-bin/, 'Recycle Bin'],
  [/\/sub-brands|\/leads|\/lead-question-answers/, 'Leads'],
  [/\/internal-tasks/, 'Internal Tasks'],
  [/\/tasks|\/ops-employee/, 'Tasks'],
  [/\/customers|\/customer-details|\/documents/, 'Customers'],
  [/\/quotations/, 'Quotations'],
  [/\/appointments/, 'Appointments'],
  [/\/call-logs|\/calls/, 'Calls'],
  [/\/desktrack|\/desktop-tracking/, 'Desktrack'],
  [/\/service-questions/, 'Service Questions'],
  [/coupons/, 'Coupons'],
  [/\/franchise/, 'Franchise'],
  [/\/v1\/hr/, 'HR'],
  [/\/v1\/marketing/, 'Marketing'],
  [/\/v1\/it/, 'IT'],
  [/\/v1\/disbursements/, 'Finance'],
  [/\/v1\/chat|\/chat\//, 'Chat'],
  [/\/settings|\/locations/, 'Settings'],
];

export function moduleFor(path: string): string {
  return MODULES.find(([re]) => re.test(path))?.[1] || 'Other';
}

const VERB: Record<string, string> = {
  POST: 'Created',
  PUT: 'Updated',
  PATCH: 'Updated',
  DELETE: 'Deleted',
  GET: 'Exported',
};
const SPECIAL: Array<[RegExp, string, string]> = [
  [/\/leads\/assign/, 'assign', 'Assigned leads'],
  [/\/leads\/followup/, 'followup', 'Added a lead follow-up'],
  [/\/leads\/[^/]+\/remarks/, 'remark', 'Added a lead remark'],
  [/\/leads\/[^/]+\/status/, 'status', 'Changed lead status'],
  [/\/tasks\/(bulk-)?assign/, 'assign', 'Assigned tasks'],
  [/\/tasks\/[^/]+\/status/, 'status', 'Changed task status'],
  [/\/ops-employee\/(start|stop)-timer/, 'timer', 'Task timer'],
  [/\/recycle-bin\/[^/]+\/restore/, 'restore', 'Restored from Recycle Bin'],
  [/\/export/, 'export', 'Exported data'],
];

function describe(method: string, path: string, body: any) {
  const clean = path.replace(/^\/v1\/(crm|staff)/, '').replace(/^\/v1/, '');
  for (const [re, action, text] of SPECIAL) {
    if (re.test(clean)) {
      const id = clean.match(/\/(\d+)(\/|$)/)?.[1];
      return { action, summary: id ? `${text} (#${id})` : text, resourceId: id };
    }
  }
  const parts = clean.split('/').filter(Boolean);
  const idIdx = parts.findIndex((p) => /^\d+$/.test(p));
  const resourceId = idIdx >= 0 ? parts[idIdx] : (body?.id ?? undefined);
  const resource = (idIdx > 0 ? parts[idIdx - 1] : parts[parts.length - 1] || 'item').replace(
    /-/g,
    ' '
  );
  const tail =
    idIdx >= 0 && parts[idIdx + 1]
      ? ` (${parts
          .slice(idIdx + 1)
          .join(' ')
          .replace(/-/g, ' ')})`
      : '';
  const verb = VERB[method] || method;
  const action = `${method === 'POST' ? 'create' : method === 'DELETE' ? 'delete' : method === 'GET' ? 'export' : 'update'}`;
  return {
    action,
    summary: `${verb} ${resource}${resourceId ? ` #${resourceId}` : ''}${tail}`,
    resourceId: resourceId !== undefined ? String(resourceId) : undefined,
  };
}

export function auditTrail(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isExport = req.method === 'GET' && /\/export(\/|$)/.test(path);
  if (!STAFF_PATH.test(path) || (!isWrite && !isExport) || QUIET.some((re) => re.test(path))) {
    return next();
  }
  res.on('finish', () => {
    if (res.locals.auditLogged) return;
    void (async () => {
      const ctx = req.rbac || (await attachRbac(req).catch(() => null));
      const u: any = req.user || {};
      if (!ctx && !u.user_id) return; // anonymous requests are rejected anyway
      const d = describe(req.method, path, req.body);
      await recordAuditLog({
        actorId: ctx?.profile.id ?? u.user_id,
        actorEmail: ctx?.profile.email ?? u.email,
        actorName: ctx?.profile.name ?? u.username,
        actorRole: ctx?.profile.roleKey ?? u.role_name,
        actorSource: ctx?.profile.source,
        action: d.action,
        resource: path.replace(/^\/v1\/(crm|staff)\//, '').split('/')[0] || 'general',
        resourceId: d.resourceId,
        module: moduleFor(path),
        summary: res.statusCode >= 400 ? `${d.summary} — failed (${res.statusCode})` : d.summary,
        statusCode: res.statusCode,
        method: req.method,
        path,
        payload: isWrite
          ? { body: req.body ?? null, query: req.query ?? null }
          : { query: req.query ?? null },
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
        userAgent: req.headers['user-agent'],
      });
    })();
  });
  next();
}
