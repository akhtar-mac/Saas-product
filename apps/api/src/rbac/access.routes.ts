/**
 * /v1/crm/access/*  — Users & Access (role + extra grants/revokes)
 * Permission checks live in route-guard.ts; this file adds the
 * privilege-escalation rules that depend on who the target user is.
 */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/db.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { recordAuditLog } from '../services/audit.service.js';
import { PERMISSIONS, PERMISSION_KEYS, ROLES, ROLE_BY_ID, expandRoleDefaults } from './catalog.js';
import {
  ADMIN_ROLE_ONLY,
  AccessProfile,
  RBAC_SENTINEL,
  SUPER_ADMIN_ONLY,
  UserSource,
  getAccessProfile,
  invalidateAccess,
} from './rbac.service.js';
import { attachRbac } from './route-guard.js';
import { hasTable, resetSchemaCache } from './schema-features.js';

const router = Router();
router.use(verifyJWT);

const n = (v: any) =>
  typeof v === 'bigint' ? Number(v) : v === null || v === undefined ? v : Number(v);
const isSource = (s: any): s is UserSource => s === 'users' || s === 'staff_users';

class GuardError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function actorOf(req: Request): AccessProfile {
  if (!req.rbac) throw new GuardError(401, 'Not authenticated.');
  return req.rbac.profile;
}

/**
 * Privilege-escalation guard.
 *  - nobody edits their own role or options
 *  - only Super Admin manages Super Admins and Admins, or hands out roles 1/2
 *  - only Super Admin / Admin may grant or revoke extra options
 *  - you can never grant an option you do not hold yourself
 *  - a non-admin with users:create may only create roles whose defaults they hold
 */
export function assertCanManage(
  actor: AccessProfile,
  target: AccessProfile | null,
  change: { roleId?: number; grants?: string[]; revokes?: string[] }
) {
  if (target && target.source === actor.source && target.id === actor.id) {
    throw new GuardError(403, 'You cannot change your own role or access.');
  }
  if (target && (target.isSuperAdmin || target.roleIds.includes(2)) && !actor.isSuperAdmin) {
    throw new GuardError(403, 'Only a Super Admin can change a Super Admin or Admin account.');
  }
  if (change.roleId !== undefined) {
    if (!ROLE_BY_ID.has(change.roleId)) throw new GuardError(400, 'Unknown role.');
    if ((change.roleId === 1 || change.roleId === 2) && !actor.isSuperAdmin) {
      throw new GuardError(403, 'Only a Super Admin can give the Super Admin or Admin role.');
    }
    if (!actor.isAdmin) {
      const missing = expandRoleDefaults(change.roleId).filter((k) => !actor.effective.includes(k));
      if (missing.length) {
        throw new GuardError(
          403,
          `You cannot give a role with options you don't have (${missing.slice(0, 3).join(', ')}…).`
        );
      }
    }
  }
  const touched = [...(change.grants || []), ...(change.revokes || [])];
  if (touched.length) {
    if (!actor.isAdmin)
      throw new GuardError(403, 'Only Super Admin and Admin can give or remove extra options.');
    for (const k of touched)
      if (!PERMISSION_KEYS.has(k)) throw new GuardError(400, `Unknown option: ${k}`);
    for (const g of change.grants || []) {
      if (SUPER_ADMIN_ONLY.has(g))
        throw new GuardError(403, `"${g}" belongs to Super Admin only and cannot be granted.`);
      if (ADMIN_ROLE_ONLY.has(g))
        throw new GuardError(403, `"${g}" comes with the Admin role and cannot be granted.`);
      if (!actor.effective.includes(g))
        throw new GuardError(403, `You cannot grant "${g}" because you don't have it.`);
    }
  }
}

function send(res: Response, err: any) {
  if (err instanceof GuardError)
    return res.status(err.status).json({ success: false, error: err.message });
  console.error('[access]', err?.message || err);
  return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
}

function audit(req: Request, res: Response, p: Parameters<typeof recordAuditLog>[0]) {
  res.locals.auditLogged = true;
  const a = req.rbac?.profile;
  void recordAuditLog({
    actorId: a?.id,
    actorEmail: a?.email,
    actorName: a?.name,
    actorRole: a?.roleKey,
    actorSource: a?.source,
    module: 'Users & Access',
    statusCode: 200,
    method: req.method,
    path: req.path,
    ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
    userAgent: req.headers['user-agent'],
    ...p,
  });
}

function publicProfile(p: AccessProfile) {
  return {
    source: p.source,
    id: p.id,
    name: p.name,
    email: p.email,
    active: p.active,
    role_id: p.primaryRoleId,
    role_ids: p.roleIds,
    role_key: p.roleKey,
    role_name: p.roleName,
    defaults: p.defaults,
    grants: p.grants,
    revokes: p.revokes,
    effective: p.effective,
    is_super_admin: p.isSuperAdmin,
    is_admin: p.isAdmin,
  };
}

// ─── GET /access/me — live permissions for the signed-in user ────────────────
router.get('/me', async (req, res) => {
  try {
    const ctx = await attachRbac(req);
    if (!ctx) return res.status(401).json({ success: false, error: 'Not authenticated.' });
    res.json({
      success: true,
      data: {
        ...publicProfile(ctx.profile),
        permissions: [...ctx.profile.effective, RBAC_SENTINEL],
        rbac_tables: await hasTable('rbac_user_permission_overrides'),
      },
    });
  } catch (err) {
    send(res, err);
  }
});

// ─── GET /access/catalog — roles, options and role defaults ──────────────────
router.get('/catalog', (_req, res) => {
  res.json({
    success: true,
    data: {
      roles: ROLES.map((r) => ({ ...r, defaults: expandRoleDefaults(r.id) })),
      permissions: PERMISSIONS,
    },
  });
});

// ─── GET /access/users — one list across users + staff_users ─────────────────
router.get('/users', async (req, res) => {
  try {
    const q = String(req.query.search || '')
      .trim()
      .toLowerCase();
    const legacy: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, username AS name, email, contact AS phone, user_type, status, company_id, last_login_at, created_at
       FROM users ORDER BY status DESC, username ASC LIMIT 2000`
    );
    const staff: any[] = await prisma.$queryRawUnsafe(
      `SELECT s.id, s.name, s.email, s.phone, s.role_id, s.is_active, s.last_login_at, s.created_at, s.position, s.department
       FROM staff_users s
       WHERE NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(s.email))
       ORDER BY s.name ASC LIMIT 2000`
    );
    const overrides: any[] = (await hasTable('rbac_user_permission_overrides'))
      ? await prisma.$queryRawUnsafe(
          `SELECT user_source, user_id, SUM(effect='grant') g, SUM(effect='revoke') r
           FROM rbac_user_permission_overrides GROUP BY user_source, user_id`
        )
      : [];
    const roleRows: any[] = (await hasTable('rbac_user_access'))
      ? await prisma.$queryRawUnsafe(`SELECT user_source, user_id, role_id FROM rbac_user_access`)
      : [];
    const ov = new Map(
      overrides.map((o) => [`${o.user_source}:${n(o.user_id)}`, { g: n(o.g) || 0, r: n(o.r) || 0 }])
    );
    const ro = new Map(roleRows.map((o) => [`${o.user_source}:${n(o.user_id)}`, n(o.role_id)]));
    const { USER_TYPE_TO_ROLE } = await import('./catalog.js');

    const list = [
      ...legacy.map((u) => {
        const key = `users:${n(u.id)}`;
        const roleId = ro.get(key) || USER_TYPE_TO_ROLE[n(u.user_type)] || 16;
        return {
          source: 'users',
          id: n(u.id),
          name: u.name,
          email: u.email,
          phone: u.phone,
          role_id: roleId,
          role_name: ROLE_BY_ID.get(roleId)?.name || 'Staff',
          legacy_user_type: n(u.user_type),
          company_id: u.company_id,
          active: n(u.status) === 1,
          last_login_at: u.last_login_at,
          created_at: u.created_at,
          grants: ov.get(key)?.g || 0,
          revokes: ov.get(key)?.r || 0,
        };
      }),
      ...staff.map((s) => {
        const key = `staff_users:${n(s.id)}`;
        const roleId = ro.get(key) || n(s.role_id) || 16;
        return {
          source: 'staff_users',
          id: n(s.id),
          name: s.name,
          email: s.email,
          phone: s.phone,
          role_id: roleId,
          role_name: ROLE_BY_ID.get(roleId)?.name || 'Staff',
          legacy_user_type: null,
          company_id: null,
          active: Boolean(n(s.is_active)),
          last_login_at: s.last_login_at,
          created_at: s.created_at,
          grants: ov.get(key)?.g || 0,
          revokes: ov.get(key)?.r || 0,
        };
      }),
    ].filter(
      (u) =>
        !q ||
        String(u.name || '')
          .toLowerCase()
          .includes(q) ||
        String(u.email || '')
          .toLowerCase()
          .includes(q) ||
        String(u.phone || '').includes(q)
    );
    res.json({ success: true, data: list, total: list.length });
  } catch (err) {
    send(res, err);
  }
});

// ─── GET /access/users/:source/:id ───────────────────────────────────────────
router.get('/users/:source/:id', async (req, res) => {
  try {
    const { source } = req.params;
    if (!isSource(source)) throw new GuardError(400, 'Unknown user source.');
    const p = await getAccessProfile(source, Number(req.params.id), { fresh: true });
    if (!p) throw new GuardError(404, 'User not found.');
    const extra: any[] =
      source === 'users'
        ? await prisma.$queryRawUnsafe(
            `SELECT contact AS phone, company_id, user_type, last_login_at FROM users WHERE id = ?`,
            p.id
          )
        : await prisma.$queryRawUnsafe(
            `SELECT phone, position, department, last_login_at FROM staff_users WHERE id = ?`,
            p.id
          );
    res.json({
      success: true,
      data: { ...publicProfile(p), ...(extra[0] || {}), user_type: n(extra[0]?.user_type) },
    });
  } catch (err) {
    send(res, err);
  }
});

async function emailTaken(email: string, except?: { source: UserSource; id: number }) {
  const a: any[] = await prisma.$queryRawUnsafe(
    `SELECT id FROM users WHERE LOWER(email) = LOWER(?)`,
    email
  );
  const b: any[] = await prisma.$queryRawUnsafe(
    `SELECT id FROM staff_users WHERE LOWER(email) = LOWER(?)`,
    email
  );
  const hits = [
    ...a.map((r) => ({ source: 'users' as UserSource, id: n(r.id) })),
    ...b.map((r) => ({ source: 'staff_users' as UserSource, id: n(r.id) })),
  ].filter((h) => !(except && h.source === except.source && h.id === except.id));
  // a staff_users row with the same email as the users row is the old shadow copy: ignore it
  if (except?.source === 'users') return hits.some((h) => h.source === 'users');
  return hits.length > 0;
}

async function saveOverrides(
  source: UserSource,
  id: number,
  grants: string[],
  revokes: string[],
  actorId: number,
  reason?: string
) {
  if (!(await hasTable('rbac_user_permission_overrides'))) {
    throw new GuardError(503, 'Extra options need the RBAC tables (run the migration first).');
  }
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `DELETE FROM rbac_user_permission_overrides WHERE user_source = ? AND user_id = ?`,
      source,
      id
    );
    for (const [list, effect] of [
      [grants, 'grant'],
      [revokes, 'revoke'],
    ] as const) {
      for (const k of list) {
        await tx.$executeRawUnsafe(
          `INSERT INTO rbac_user_permission_overrides (user_source, user_id, permission_key, effect, granted_by, reason)
           VALUES (?,?,?,?,?,?)`,
          source,
          id,
          k,
          effect,
          actorId,
          reason?.slice(0, 255) ?? null
        );
      }
    }
  });
}

async function saveRole(source: UserSource, id: number, roleId: number, actorId: number) {
  if (!(await hasTable('rbac_user_access'))) return;
  await prisma.$executeRawUnsafe(
    `INSERT INTO rbac_user_access (user_source, user_id, role_id, updated_by) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), updated_by = VALUES(updated_by)`,
    source,
    id,
    roleId,
    actorId
  );
}

function cleanList(v: any): string[] {
  return Array.isArray(v) ? [...new Set(v.map(String).filter(Boolean))] : [];
}

// ─── POST /access/users — create a user with a role (+ optional extras) ─────
router.post('/users', async (req, res) => {
  try {
    const actor = actorOf(req);
    const { name, email, phone, password, role_id, reason } = req.body || {};
    const grants = cleanList(req.body?.grants);
    const revokes = cleanList(req.body?.revokes).filter((k) => !grants.includes(k));
    const roleId = Number(role_id);
    if (!name || !String(name).trim()) throw new GuardError(400, 'Name is required.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))
      throw new GuardError(400, 'A valid email is required.');
    if (!password || String(password).length < 6)
      throw new GuardError(400, 'Password must be at least 6 characters.');
    assertCanManage(actor, null, { roleId, grants, revokes });
    const cleanEmail = String(email).trim().toLowerCase();
    if (await emailTaken(cleanEmail))
      throw new GuardError(409, 'This email is already used by another user.');

    const role = ROLE_BY_ID.get(roleId)!;
    let source: UserSource;
    let id: number;
    if (role.legacyUserType !== null) {
      // Legacy `users` table: same shape the old app writes, so the mobile app,
      // lead assignment, call history and Desktrack all see the new person.
      // Password is stored as bcrypt. Run scripts/hash-legacy-passwords.ts for old rows.
      const company = await prisma
        .$queryRawUnsafe<any[]>(
          `SELECT company_id FROM users WHERE id = ?`,
          actor.source === 'users' ? actor.id : 0
        )
        .catch(() => [] as any[]);
      await prisma.$executeRawUnsafe(
        `INSERT INTO users (username, email, contact, user_type, password, status, added_by, user_token, company_id)
         VALUES (?,?,?,?,?,1,?, '', ?)`,
        String(name).trim(),
        cleanEmail,
        String(phone || ''),
        role.legacyUserType,
        await bcrypt.hash(String(password), 12),
        actor.id,
        String(company[0]?.company_id || 'ETax1') === '0'
          ? 'ETax1'
          : String(company[0]?.company_id || 'ETax1')
      );
      const r: any[] = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`);
      source = 'users';
      id = n(r[0].id);
    } else {
      const hash = await bcrypt.hash(String(password), 12);
      await prisma.$executeRawUnsafe(
        `INSERT INTO staff_users (name, email, password_hash, phone, role_id, position, is_active, created_by, created_at, updated_at)
         VALUES (?,?,?,?,?,?,1,?, NOW(3), NOW(3))`,
        String(name).trim(),
        cleanEmail,
        hash,
        phone ? String(phone) : null,
        roleId,
        role.name,
        actor.id
      );
      const r: any[] = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`);
      source = 'staff_users';
      id = n(r[0].id);
    }
    await saveRole(source, id, roleId, actor.id);
    if (grants.length || revokes.length)
      await saveOverrides(source, id, grants, revokes, actor.id, reason);
    invalidateAccess(source, id);
    const p = await getAccessProfile(source, id, { fresh: true });
    audit(req, res, {
      action: 'user_create',
      resource: 'users',
      resourceId: `${source}:${id}`,
      summary: `Added user ${String(name).trim()} as ${role.name}${grants.length ? ` (+${grants.length} extra)` : ''}${revokes.length ? ` (−${revokes.length} removed)` : ''}`,
      newState: { name, email: cleanEmail, role: role.name, grants, revokes },
      payload: { source, id },
    });
    res.status(201).json({ success: true, data: p ? publicProfile(p) : { source, id } });
  } catch (err) {
    send(res, err);
  }
});

// ─── PUT /access/users/:source/:id — profile + role ──────────────────────────
router.put('/users/:source/:id', async (req, res) => {
  try {
    const actor = actorOf(req);
    const { source } = req.params;
    if (!isSource(source)) throw new GuardError(400, 'Unknown user source.');
    const id = Number(req.params.id);
    const target = await getAccessProfile(source, id, { fresh: true });
    if (!target) throw new GuardError(404, 'User not found.');
    const { name, email, phone, password } = req.body || {};
    const roleId = req.body?.role_id !== undefined ? Number(req.body.role_id) : undefined;
    assertCanManage(actor, target, {
      roleId: roleId !== target.primaryRoleId ? roleId : undefined,
    });
    const cleanEmail = email ? String(email).trim().toLowerCase() : undefined;
    if (
      cleanEmail &&
      cleanEmail !== String(target.email).toLowerCase() &&
      (await emailTaken(cleanEmail, { source, id }))
    ) {
      throw new GuardError(409, 'This email is already used by another user.');
    }
    if (password !== undefined && password !== '' && String(password).length < 6) {
      throw new GuardError(400, 'Password must be at least 6 characters.');
    }
    const role = roleId ? ROLE_BY_ID.get(roleId) : undefined;
    if (source === 'users') {
      const sets: string[] = [];
      const vals: any[] = [];
      if (name) (sets.push('username = ?'), vals.push(String(name).trim()));
      if (cleanEmail) (sets.push('email = ?'), vals.push(cleanEmail));
      if (phone !== undefined) (sets.push('contact = ?'), vals.push(String(phone || '')));
      if (password) (sets.push('password = ?'), vals.push(await bcrypt.hash(String(password), 12)));
      if (role && role.legacyUserType !== null)
        (sets.push('user_type = ?'), vals.push(role.legacyUserType));
      if (sets.length)
        await prisma.$executeRawUnsafe(
          `UPDATE users SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`,
          ...vals,
          id
        );
    } else {
      const sets: string[] = [];
      const vals: any[] = [];
      if (name) (sets.push('name = ?'), vals.push(String(name).trim()));
      if (cleanEmail) (sets.push('email = ?'), vals.push(cleanEmail));
      if (phone !== undefined) (sets.push('phone = ?'), vals.push(phone ? String(phone) : null));
      if (password)
        (sets.push('password_hash = ?'), vals.push(await bcrypt.hash(String(password), 12)));
      if (role) (sets.push('role_id = ?'), vals.push(role.id));
      if (sets.length)
        await prisma.$executeRawUnsafe(
          `UPDATE staff_users SET ${sets.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
          ...vals,
          id
        );
    }
    if (role) await saveRole(source, id, role.id, actor.id);
    invalidateAccess(source, id);
    const after = await getAccessProfile(source, id, { fresh: true });
    audit(req, res, {
      action: role && role.id !== target.primaryRoleId ? 'user_role_change' : 'user_update',
      resource: 'users',
      resourceId: `${source}:${id}`,
      summary:
        role && role.id !== target.primaryRoleId
          ? `Changed ${target.name}'s role: ${target.roleName} → ${role.name}`
          : `Updated profile of ${target.name}${password ? ' (password reset)' : ''}`,
      oldState: { name: target.name, email: target.email, role: target.roleName },
      newState: {
        name: after?.name,
        email: after?.email,
        role: after?.roleName,
        password: password ? '[changed]' : undefined,
      },
    });
    res.json({ success: true, data: after ? publicProfile(after) : null });
  } catch (err) {
    send(res, err);
  }
});

// ─── PUT /access/users/:source/:id/overrides — extra grants / revokes ────────
router.put('/users/:source/:id/overrides', async (req, res) => {
  try {
    const actor = actorOf(req);
    const { source } = req.params;
    if (!isSource(source)) throw new GuardError(400, 'Unknown user source.');
    const id = Number(req.params.id);
    const target = await getAccessProfile(source, id, { fresh: true });
    if (!target) throw new GuardError(404, 'User not found.');
    // Only keep real changes: a grant of something the role already gives is dropped, etc.
    const grants = cleanList(req.body?.grants).filter((k) => !target.defaults.includes(k));
    const revokes = cleanList(req.body?.revokes).filter(
      (k) => target.defaults.includes(k) && !grants.includes(k)
    );
    const newGrants = grants.filter((g) => !target.grants.includes(g));
    assertCanManage(actor, target, { grants: newGrants, revokes });
    if (target.isSuperAdmin) throw new GuardError(400, 'Super Admin always has every option.');
    await saveOverrides(source, id, grants, revokes, actor.id, req.body?.reason);
    invalidateAccess(source, id);
    const after = await getAccessProfile(source, id, { fresh: true });
    const added = grants.filter((g) => !target.grants.includes(g));
    const removedGrants = target.grants.filter((g) => !grants.includes(g));
    const newRevokes = revokes.filter((r) => !target.revokes.includes(r));
    const restored = target.revokes.filter((r) => !revokes.includes(r));
    const bits = [
      added.length && `gave ${added.length} extra`,
      removedGrants.length && `took back ${removedGrants.length} extra`,
      newRevokes.length && `removed ${newRevokes.length} role option(s)`,
      restored.length && `restored ${restored.length} role option(s)`,
    ].filter(Boolean);
    audit(req, res, {
      action: 'user_access_change',
      resource: 'users',
      resourceId: `${source}:${id}`,
      summary: `Changed ${target.name}'s options: ${bits.join(', ') || 'no change'}`,
      oldState: { grants: target.grants, revokes: target.revokes },
      newState: { grants, revokes },
      payload: { reason: req.body?.reason || null },
    });
    res.json({ success: true, data: after ? publicProfile(after) : null });
  } catch (err) {
    send(res, err);
  }
});

// ─── PATCH /access/users/:source/:id/status — activate / deactivate ─────────
router.patch('/users/:source/:id/status', async (req, res) => {
  try {
    const actor = actorOf(req);
    const { source } = req.params;
    if (!isSource(source)) throw new GuardError(400, 'Unknown user source.');
    const id = Number(req.params.id);
    const target = await getAccessProfile(source, id, { fresh: true });
    if (!target) throw new GuardError(404, 'User not found.');
    assertCanManage(actor, target, {});
    const active = Boolean(req.body?.active);
    if (source === 'users')
      await prisma.$executeRawUnsafe(
        `UPDATE users SET status = ? WHERE id = ?`,
        active ? 1 : 0,
        id
      );
    else
      await prisma.$executeRawUnsafe(
        `UPDATE staff_users SET is_active = ?, updated_at = NOW(3) WHERE id = ?`,
        active ? 1 : 0,
        id
      );
    invalidateAccess(source, id);
    audit(req, res, {
      action: active ? 'user_activate' : 'user_deactivate',
      resource: 'users',
      resourceId: `${source}:${id}`,
      summary: `${active ? 'Activated' : 'Deactivated'} ${target.name}`,
      oldState: { active: target.active },
      newState: { active },
    });
    res.json({ success: true });
  } catch (err) {
    send(res, err);
  }
});

// Dev helper: re-read table list after applying the migration locally.
router.post('/schema/refresh', (req, res) => {
  if (!req.rbac?.profile.isSuperAdmin) return res.status(403).json({ success: false });
  resetSchemaCache();
  invalidateAccess();
  res.json({ success: true });
});

export default router;
