/**
 * Global permission guard for staff API routes.
 *
 * One table maps (method, path) -> the permission(s) needed. It runs before the
 * routers, so the 6,000-line crm.routes.ts and the other routers need no
 * per-handler edits. When a rule matches and the user holds the permission,
 * `req.rbacGranted` is set and the routers' older `requireRole([...])` checks
 * let the request through (so an employee given a manager option can use it).
 * Routes with no rule keep their old behaviour (JWT + requireRole).
 *
 * Scope rule: holders of a `*_view_all` option see all company data; everyone
 * else is pinned to their own records on list endpoints.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import {
  AccessProfile,
  computeEffective,
  getAccessProfile,
  listHas,
  resolveSource,
} from './rbac.service.js';
import { ROLE_BY_KEY } from './catalog.js';

export interface RbacContext {
  profile: AccessProfile;
  has: (perm: string) => boolean;
}

declare global {
  namespace Express {
    interface Request {
      rbac?: RbacContext;
      rbacGranted?: boolean;
    }
  }
}

type Scope = (req: Request, ctx: RbacContext) => void;
interface Rule {
  methods: string[];
  re: RegExp;
  any: string[];
  scope?: Scope;
  /** label for 403 messages */
  label: string;
}

const STAFF = '(?:/v1/crm|/v1/staff)';
const ANY_STAFF = ['dashboard:view', 'chat:view'];
const CUSTOMER_READ = [
  'accounts:view',
  'operations:customers_view',
  'operations:customer_details',
  'operations:customer_timeline',
  'operations:tasks_view',
  'franchise:orders_view',
  'leads:view_own',
  'leads:view_all',
];

function setQuery(req: Request, key: string, value: string | undefined) {
  const q = { ...(req.query as Record<string, any>) };
  if (value === undefined) delete q[key];
  else q[key] = value;
  Object.defineProperty(req, 'query', {
    value: q,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

/** Leads: without leads:view_all you only ever get your own assigned leads. */
const ownLeads: Scope = (req, ctx) => {
  if (ctx.has('leads:view_all')) return;
  setQuery(req, 'assigned_to', String(req.user?.user_id ?? ctx.profile.id));
  setQuery(req, 'user_id', undefined);
  setQuery(req, 'unassigned', undefined);
};

/** Call report: without calls:view_all you only see your own calls. */
const ownCalls: Scope = (req, ctx) => {
  if (ctx.has('calls:view_all')) return;
  setQuery(req, 'user_id', String(req.user?.user_id ?? ctx.profile.id));
  setQuery(req, 'employee_id', undefined);
};

const R = (methods: string, path: string, any: string[], scope?: Scope): Rule => {
  const src = path
    .replace(/\//g, '\\/')
    .replace(/:[a-zA-Z_]+/g, '[^/]+')
    .replace(/\*\*/g, '.*');
  return {
    methods: methods === '*' ? ['*'] : methods.split('|'),
    re: new RegExp(`^${src}\\/?$`),
    any,
    scope,
    label: path,
  };
};
const C = (methods: string, sub: string, any: string[], scope?: Scope) =>
  R(methods, `${STAFF}${sub}`, any, scope);

// Order matters: first match wins.
export const RULES: Rule[] = [
  // ── RBAC / logs / recycle bin (new screens) ──────────────────────────────
  C('GET', '/access/me', ANY_STAFF.concat(['__any'])),
  C('GET', '/access/catalog', ['users:view', 'users:create', 'users:grant_permissions']),
  C('GET', '/access/users', ['users:view']),
  C('GET', '/access/users/:source/:id', ['users:view']),
  C('POST', '/access/users', ['users:create']),
  C('PUT|PATCH', '/access/users/:source/:id', ['users:edit']),
  C('PUT', '/access/users/:source/:id/overrides', ['users:grant_permissions']),
  C('PATCH', '/access/users/:source/:id/status', ['users:deactivate']),
  C('GET', '/audit-logs', ['logs:view']),
  C('GET', '/audit-logs/facets', ['logs:view']),
  C('GET', '/audit-logs/export', ['logs:export']),
  C('GET', '/audit-logs/:id', ['logs:view']),
  C('GET', '/recycle-bin', ['recycle_bin:view']),
  C('GET', '/recycle-bin/:id', ['recycle_bin:view']),
  C('POST', '/recycle-bin/:id/restore', ['recycle_bin:restore']),
  C('DELETE', '/recycle-bin/:id', ['recycle_bin:purge']),

  // ── Dashboard & shared pickers ───────────────────────────────────────────
  C('GET', '/stats', ANY_STAFF),
  C('GET', '/notifications', ANY_STAFF),
  C('POST', '/notifications/read', ANY_STAFF),
  C('GET', '/staff', ANY_STAFF),
  C('GET', '/operation-staff', ANY_STAFF),
  C('GET', '/employees', ANY_STAFF),
  C('GET', '/categories', ANY_STAFF),
  C('GET', '/services-by-category/:id', ANY_STAFF),
  C('GET', '/all-services', ANY_STAFF),
  C('GET', '/services', ANY_STAFF),
  C('GET', '/services/questions', ANY_STAFF),
  C('GET', '/service-questions', ANY_STAFF),
  C('GET', '/service-questions/by-service/:id', ANY_STAFF),
  C('POST|PUT', '/service-questions/**', ['service_questions:manage']),
  C('POST', '/service-questions', ['service_questions:manage']),
  C('DELETE', '/service-questions/:id', ['service_questions:manage']),
  C('GET', '/lead-question-answers', ANY_STAFF),
  C('POST', '/lead-question-answers', ['leads:edit']),

  // ── Leads ────────────────────────────────────────────────────────────────
  C('GET', '/leads', ['leads:view_own', 'leads:view_all'], ownLeads),
  C('GET', '/leads/counts', ['leads:view_own', 'leads:view_all'], ownLeads),
  C('POST', '/leads', ['leads:create']),
  C('POST', '/leads/assign', ['leads:assign']),
  C('POST', '/leads/followup', ['leads:edit']),
  C('DELETE', '/leads/:id', ['leads:delete']),
  C('GET', '/leads/:id', ['leads:view_own', 'leads:view_all']),
  C('GET', '/leads/:id/remarks', ['leads:view_own', 'leads:view_all']),
  C('POST', '/leads/:id/remarks', ['leads:edit']),
  C('PATCH', '/leads/:id/**', ['leads:edit']),
  C('GET', '/sub-brands/**', ['leads:subbrands']),

  // ── Calls (crm stubs + /v1/call-logs router) ─────────────────────────────
  C('POST', '/calls/log', ['calls:log', 'calls:view_own']),
  C('POST', '/calls/store', ['calls:log', 'calls:view_own']),
  C('GET', '/calls/export', ['calls:export']),
  C('GET', '/calls/**', ['calls:view_own', 'calls:view_all']),
  C('GET', '/calls', ['calls:view_own', 'calls:view_all']),
  R('POST', '/v1/call-logs/sync', ['calls:log', 'calls:view_own']),
  R('GET', '/v1/call-logs/analytics/me', ['calls:view_own', 'calls:view_all']),
  R('GET', '/v1/call-logs/analytics/team', ['calls:view_all']),
  R('GET', '/v1/call-logs/analytics/admin', ['calls:view_all']),
  R('GET', '/v1/call-logs/analytics/all', ['calls:view_all']),
  R('GET', '/v1/call-logs/staff', ['calls:view_all']),
  R('GET', '/v1/call-logs/**', ['calls:view_own', 'calls:view_all'], ownCalls),

  // ── Operations: customers, orders, tasks ─────────────────────────────────
  C('GET', '/customers', CUSTOMER_READ),
  C('GET', '/customer-details-list', [
    'operations:customer_details',
    'operations:customers_view',
    'accounts:view',
  ]),
  C('POST', '/customers/check-email', ['operations:customers_create', 'leads:edit']),
  C('POST', '/customers/check-mobile', ['operations:customers_create', 'leads:edit']),
  C('POST', '/customers/add-offline', ['operations:customers_create', 'leads:edit']),
  C('POST', '/customers/create-from-order', ['operations:customers_create', 'leads:edit']),
  C('DELETE', '/customers/:id', ['operations:customers_delete']),
  C('GET', '/customers/:id', CUSTOMER_READ),
  C('PUT', '/customers/:id', ['operations:customers_edit', 'accounts:view']),
  C('PATCH', '/customers/:id/sub-customer', ['operations:customers_edit']),
  C('GET', '/customers/:id/**', CUSTOMER_READ),
  C('POST', '/customers/:id/orders', ['operations:customers_create', 'leads:edit']),
  C('POST', '/customers/:id/tasks', ['operations:tasks_assign', 'operations:customers_edit']),
  C('POST', '/customers/:id/**', ['operations:customers_edit']),
  C('GET', '/tasks', ['operations:tasks_view']),
  C('GET', '/tasks/stats', ['operations:tasks_view']),
  C('POST', '/tasks/assign', ['operations:tasks_assign']),
  C('POST', '/tasks/bulk-assign', ['operations:tasks_assign']),
  C('POST', '/tasks/update-due-date', ['operations:tasks_assign']),
  C('PATCH', '/tasks/:id/status', ['operations:tasks_edit', 'operations:tasks_assign']),
  C('DELETE', '/tasks/:id', ['operations:tasks_delete']),
  C('*', '/ops-employee/**', ['operations:tasks_view']),
  C('GET', '/internal-tasks', ['operations:internal_tasks_view']),
  C('POST', '/internal-tasks', ['operations:internal_tasks_view']),
  C('PUT', '/internal-tasks/:id', ['operations:internal_tasks_view']),
  C('DELETE', '/internal-tasks/:id', ['operations:internal_tasks_manage']),
  C('GET', '/documents', CUSTOMER_READ),
  C('POST', '/documents/upload', [
    'operations:customers_edit',
    'operations:tasks_edit',
    'accounts:view',
  ]),
  C('GET', '/locations', ['operations:locations_view']),
  C('POST', '/locations', ['operations:locations_view']),
  C('GET', '/locations/**', ['operations:locations_view']),
  C('GET', '/om/dashboard-stats', ['operations:view', 'operations:customers_view']),
  C('GET', '/reports/**', ['reports:view']),

  // ── Sales ────────────────────────────────────────────────────────────────
  C('GET', '/quotations', ['quotations:view']),
  C('POST', '/quotations', ['quotations:create']),
  C('PUT', '/quotations/:id', ['quotations:edit', 'quotations:create']),
  C('GET', '/sm/stats', ['sales:view', 'leads:view_all']),
  C('GET', '/sm/fees-report', ['reports:view', 'sales:view']),
  C('*', '/sm/support-tickets/**', ['sales:view', 'leads:view_all']),
  C('GET', '/sm/support-tickets', ['sales:view', 'leads:view_all']),
  C('POST', '/coupons/validate', ANY_STAFF),
  C('GET', '/coupons', ANY_STAFF),
  C('GET', '/sm/coupons', ANY_STAFF),
  C('GET', '/om/coupons', ANY_STAFF),
  C('POST', '/coupons', ['coupons:manage']),
  C('POST', '/sm/coupons', ['coupons:manage']),
  C('POST', '/om/coupons', ['coupons:manage']),

  // ── Appointments ─────────────────────────────────────────────────────────
  C('GET', '/appointments', ['appointments:view']),
  C('POST', '/appointments', [
    'appointments:create',
    'appointments:edit',
    'operations:customers_edit',
  ]),

  // ── Franchise ────────────────────────────────────────────────────────────
  C('GET', '/franchise-manager-dashboard-stats', ['franchise:partners_manage']),
  C('GET', '/franchise-employee-dashboard-stats', ['franchise:view']),
  C('GET', '/franchise-partners-orders', ['franchise:view']),
  C('*', '/franchise/**', ['franchise:view']),

  // ── Desktrack (crm stubs + desktrack router) ─────────────────────────────
  C('GET', '/desktop-tracking', ['desktop_tracking:view']),
  C('POST', '/desktrack/logout-event', ANY_STAFF),
  C('GET', '/desktrack/**', ['desktop_tracking:view']),
  C('POST|PUT|DELETE', '/desktrack/desktop-users/**', ['desktop_tracking:manage_users']),
  C('POST', '/desktrack/desktop-users', ['desktop_tracking:manage_users']),
  C('POST|PUT|DELETE', '/desktrack/ips/**', ['desktop_tracking:manage_ips']),
  C('POST', '/desktrack/ips', ['desktop_tracking:manage_ips']),
  C('POST|PUT|DELETE', '/desktrack/blocked/**', ['desktop_tracking:block_websites']),
  C('POST', '/desktrack/blocked', ['desktop_tracking:block_websites']),

  // ── Users (old screens) & admin settings ─────────────────────────────────
  C('GET', '/users', ['users:view', 'workforce:view', 'operations:employees']),
  C('POST', '/users', ['users:create']),
  C('PUT', '/users/:id', ['users:edit']),
  C('DELETE', '/users/:id', ['users:deactivate']),
  C('GET', '/settings', ['admin:view']),
  C('PUT', '/settings', ['admin:view']),
  C('GET', '/attendance', ['hr:view', 'admin:view']),
  C('GET', '/payroll', ['hr:view', 'admin:view']),
  R('GET', '/v1/admin/users', ['users:view']),
  R('POST', '/v1/admin/users', ['users:create']),
  R('PATCH', '/v1/admin/users/:id', ['users:edit']),
  R('PATCH', '/v1/admin/users/:id/deactivate', ['users:deactivate']),
  R('POST', '/v1/admin/users/:id/roles', ['users:edit']),
  R('DELETE', '/v1/admin/users/:id/roles/:id', ['users:edit']),
  R('DELETE', '/v1/admin/users/:id', ['users:deactivate']),

  // ── Chat with customers ──────────────────────────────────────────────────
  C('POST', '/chat/:id/send', ['chat:send']),
];

export function matchRule(method: string, path: string): Rule | undefined {
  return RULES.find(
    (r) => (r.methods.includes('*') || r.methods.includes(method)) && r.re.test(path)
  );
}

/** Paths the guard never touches (mobile app, desktop client, customers, public). */
const SKIP = [
  /^\/api\//,
  /^\/v1\/mobile\//,
  /^\/v1\/customer\//,
  /^\/v1\/auth\//,
  /^\/v1\/careers\//,
  /^\/v1\/health/,
];
const STAFF_PATH =
  /^\/v1\/(crm|staff|call-logs|admin|chat|hr|marketing|it|disbursements|ai|infrastructure)(\/|$)/;

function decode(req: Request): any | null {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  const token = h.slice(7);
  if (token === 'demo-staff-token') return null; // verifyJWT handles (blocked in production)
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
}

/** Profile from the token alone (used when the user row cannot be read, e.g. dev built-ins). */
function profileFromToken(t: any): AccessProfile {
  const roleIds: number[] =
    Array.isArray(t.role_ids) && t.role_ids.length ? t.role_ids : [t.role_id];
  const byName = ROLE_BY_KEY.get(t.role_name);
  const ids =
    byName && !roleIds.includes(byName.id) && roleIds.length === 1 ? [byName.id] : roleIds;
  const { defaults, effective } = computeEffective(ids, [], []);
  return {
    source: 'staff_users',
    id: Number(t.user_id),
    name: t.username,
    email: t.email,
    active: true,
    roleIds: ids,
    primaryRoleId: ids[0],
    roleKey: byName?.key || 'staff',
    roleName: byName?.name || 'Staff',
    defaults,
    grants: [],
    revokes: [],
    effective,
    isSuperAdmin: ids.includes(1),
    isAdmin: ids.includes(1) || ids.includes(2),
  };
}

export async function attachRbac(req: Request): Promise<RbacContext | null> {
  if (req.rbac) return req.rbac;
  const t = decode(req);
  if (!t || !t.user_id) return null;
  const source = await resolveSource(t).catch(() => 'staff_users' as const);
  let profile = await getAccessProfile(source, Number(t.user_id)).catch(() => null);
  if (!profile) profile = profileFromToken(t);
  const ctx: RbacContext = { profile, has: (p) => listHas(profile!.effective, p) };
  req.rbac = ctx;
  return ctx;
}

export async function rbacGuard(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  if (!STAFF_PATH.test(path) || SKIP.some((re) => re.test(path)) || req.method === 'OPTIONS') {
    return next();
  }
  try {
    const ctx = await attachRbac(req);
    if (!ctx) return next(); // no/invalid token: the router's verifyJWT answers 401
    if (!ctx.profile.active) {
      return res.status(403).json({
        success: false,
        error: 'This staff account has been deactivated. Please contact an administrator.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }
    const rule = matchRule(req.method, path);
    if (!rule) return next();
    const ok = rule.any.includes('__any') || rule.any.some((p) => ctx.has(p));
    if (!ok) {
      return res.status(403).json({
        success: false,
        error: "You don't have access to this option. Ask an admin to give you access.",
        code: 'PERMISSION_DENIED',
        required_any: rule.any,
      });
    }
    req.rbacGranted = true;
    rule.scope?.(req, ctx);
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Helper for handlers: does the current request's user hold `perm`? */
export function reqHas(req: Request, perm: string): boolean {
  return !!req.rbac?.has(perm);
}
