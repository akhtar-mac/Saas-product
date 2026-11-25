/**
 * Effective-permission resolver.
 *
 * Identity: a staff login comes from either the legacy `users` table (old
 * etaxwala.com staff, ids used by leads / call_history / desktrack) or the
 * new-app-only `staff_users` table. The pair (source, id) is the principal.
 *
 * Effective = (role defaults ∪ extra grants) − revokes.
 * Super Admin always has everything; revokes never apply to Super Admin.
 */
import { prisma } from '../config/db.js';
import {
  expandRoleDefaults,
  LEGACY_ALIASES,
  PERMISSION_BY_KEY,
  PERMISSION_KEYS,
  PERMISSIONS,
  ROLE_BY_ID,
  USER_TYPE_TO_ROLE,
} from './catalog.js';
import { hasTable } from './schema-features.js';

export type UserSource = 'users' | 'staff_users';

export interface AccessProfile {
  source: UserSource;
  id: number;
  name: string;
  email: string;
  active: boolean;
  roleIds: number[];
  primaryRoleId: number;
  roleKey: string;
  roleName: string;
  defaults: string[];
  grants: string[];
  revokes: string[];
  effective: string[];
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

/** Sentinel added to JWT / login permission lists so the web app knows the list is final. */
export const RBAC_SENTINEL = '__rbac_v2';

/** Permissions only Super Admin may hold. */
export const SUPER_ADMIN_ONLY = new Set(
  PERMISSIONS.filter((p) => p.superAdminOnly).map((p) => p.key)
);
/** Permissions only Super Admin / Admin roles may hold (cannot be granted to others). */
export const ADMIN_ROLE_ONLY = new Set(['users:grant_permissions']);

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { at: number; p: AccessProfile }>();
const ck = (s: UserSource, id: number) => `${s}:${id}`;

export function invalidateAccess(source?: UserSource, id?: number) {
  if (!source || id === undefined) cache.clear();
  else cache.delete(ck(source, id));
}

function num(v: any): number {
  return typeof v === 'bigint' ? Number(v) : Number(v);
}

/** Work out which table a JWT principal came from (old tokens carry no user_source). */
export async function resolveSource(user: {
  user_id: number;
  email?: string;
  username?: string;
  user_source?: string;
}): Promise<UserSource> {
  if (user.user_source === 'users' || user.user_source === 'staff_users') return user.user_source;
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM users WHERE id = ? AND (LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)) LIMIT 1`,
      user.user_id,
      user.email || '',
      user.username || ''
    );
    if (rows.length) return 'users';
  } catch {
    /* fall through */
  }
  return 'staff_users';
}

async function loadOverrides(source: UserSource, id: number) {
  const out = {
    grants: [] as string[],
    revokes: [] as string[],
    roleOverride: null as number | null,
  };
  if (await hasTable('rbac_user_permission_overrides')) {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT permission_key, effect FROM rbac_user_permission_overrides WHERE user_source = ? AND user_id = ?`,
      source,
      id
    );
    for (const r of rows) {
      if (!PERMISSION_KEYS.has(r.permission_key)) continue;
      (r.effect === 'revoke' ? out.revokes : out.grants).push(r.permission_key);
    }
  }
  if (await hasTable('rbac_user_access')) {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT role_id FROM rbac_user_access WHERE user_source = ? AND user_id = ? LIMIT 1`,
      source,
      id
    );
    if (rows[0]?.role_id && ROLE_BY_ID.has(num(rows[0].role_id)))
      out.roleOverride = num(rows[0].role_id);
  }
  return out;
}

export function computeEffective(roleIds: number[], grants: string[], revokes: string[]) {
  const isSuperAdmin = roleIds.includes(1);
  const defaults = new Set<string>();
  for (const r of roleIds) expandRoleDefaults(r).forEach((k) => defaults.add(k));
  if (isSuperAdmin) {
    return { defaults: [...defaults], effective: PERMISSIONS.map((p) => p.key) };
  }
  const isAdmin = roleIds.includes(2);
  const eff = new Set<string>(defaults);
  for (const g of grants) eff.add(g);
  for (const r of revokes) eff.delete(r);
  for (const k of [...eff]) {
    if (SUPER_ADMIN_ONLY.has(k)) eff.delete(k);
    if (ADMIN_ROLE_ONLY.has(k) && !isAdmin) eff.delete(k);
  }
  return { defaults: [...defaults], effective: [...eff] };
}

export async function getAccessProfile(
  source: UserSource,
  id: number,
  opts: { fresh?: boolean } = {}
): Promise<AccessProfile | null> {
  const key = ck(source, id);
  const hit = cache.get(key);
  if (!opts.fresh && hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.p;

  let roleIds: number[] = [];
  let name = '';
  let email = '';
  let active = true;
  if (source === 'users') {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, username, email, user_type, status FROM users WHERE id = ? LIMIT 1`,
      id
    );
    if (!rows[0]) return null;
    const u = rows[0];
    name = u.username;
    email = u.email;
    active = num(u.status) === 1;
    roleIds = [USER_TYPE_TO_ROLE[num(u.user_type)] ?? 16];
  } else {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name, email, role_id, roles, is_active FROM staff_users WHERE id = ? LIMIT 1`,
      id
    );
    if (!rows[0]) return null;
    const s = rows[0];
    name = s.name;
    email = s.email;
    active = Boolean(num(s.is_active));
    const extra: any[] = await prisma
      .$queryRawUnsafe<any[]>(`SELECT role_id FROM staff_user_roles WHERE user_id = ?`, id)
      .catch(() => [] as any[]);
    roleIds = [num(s.role_id), ...(extra as any[]).map((r) => num(r.role_id))];
  }

  const ov = await loadOverrides(source, id).catch(() => ({
    grants: [] as string[],
    revokes: [] as string[],
    roleOverride: null as number | null,
  }));
  if (ov.roleOverride) roleIds = [ov.roleOverride];
  roleIds = [...new Set(roleIds.filter((r) => ROLE_BY_ID.has(r)))];
  if (!roleIds.length) roleIds = [16];
  const primaryRoleId = roleIds.includes(1) ? 1 : roleIds[0];
  const { defaults, effective } = computeEffective(roleIds, ov.grants, ov.revokes);
  const role = ROLE_BY_ID.get(primaryRoleId)!;

  const p: AccessProfile = {
    source,
    id,
    name,
    email,
    active,
    roleIds,
    primaryRoleId,
    roleKey: role.key,
    roleName: role.name,
    defaults,
    grants: ov.grants,
    revokes: ov.revokes,
    effective,
    isSuperAdmin: roleIds.includes(1),
    isAdmin: roleIds.includes(1) || roleIds.includes(2),
  };
  cache.set(key, { at: Date.now(), p });
  return p;
}

/** True when the permission list grants `perm` (directly, by '*', or by a legacy alias). */
export function listHas(list: string[] | undefined, perm: string): boolean {
  if (!list) return false;
  if (list.includes('*') || list.includes(perm)) return true;
  const alias = LEGACY_ALIASES[perm];
  return !!alias && alias.some((a) => list.includes(a));
}

export function describePermission(key: string) {
  return PERMISSION_BY_KEY.get(key)?.label || key;
}
