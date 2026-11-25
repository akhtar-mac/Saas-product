/**
 * Users & Access — one screen to add or edit a staff user, pick their role and
 * add or remove single options on top of what the role gives.
 *
 *  • "From role"  options come with the role (green).
 *  • "+ Added"    an admin gave this extra option (amber).
 *  • "− Removed"  an admin took this option away from the role default (rose).
 *
 * Only Super Admin and Admin can add or remove options. The API enforces every
 * rule (no self-edits, no Super Admin options, can't give what you don't have).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  Pencil,
  Info,
} from 'lucide-react';
import { CrmModal } from '@/components/ui/crm-modal';
import { useAuthStore } from '@/store/auth-store';
import { hasUserPermission } from '../permissions';
import {
  api,
  fmtIST,
  type AccessProfile,
  type AccessUserRow,
  type CatalogPermission,
  type CatalogRole,
} from './access-api';

type Source = 'users' | 'staff_users';

const inputCls =
  'w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20';

function useCan() {
  const { staffUser, activeRole } = useAuthStore();
  return useCallback(
    (key: string) =>
      hasUserPermission(staffUser?.permissions, activeRole, key, [
        ...((staffUser?.roles as (string | number)[]) || []),
        ...(staffUser?.roleIds || []),
      ]),
    [staffUser, activeRole]
  );
}

// ─── Option toggles ──────────────────────────────────────────────────────────
function OptionsEditor({
  catalog,
  defaults,
  grants,
  revokes,
  onChange,
  readOnly,
  isTargetSuperAdmin,
  canGrant,
}: {
  catalog: CatalogPermission[];
  defaults: string[];
  grants: string[];
  revokes: string[];
  onChange: (g: string[], r: string[]) => void;
  readOnly: boolean;
  isTargetSuperAdmin: boolean;
  canGrant: (key: string) => boolean;
}) {
  const [filter, setFilter] = useState('');
  const [onlyChanged, setOnlyChanged] = useState(false);
  const dset = useMemo(() => new Set(defaults), [defaults]);
  const groups = useMemo(() => {
    const m = new Map<string, CatalogPermission[]>();
    const f = filter.trim().toLowerCase();
    for (const p of catalog) {
      if (
        f &&
        !p.label.toLowerCase().includes(f) &&
        !p.key.includes(f) &&
        !p.category.toLowerCase().includes(f)
      )
        continue;
      if (onlyChanged && !grants.includes(p.key) && !revokes.includes(p.key)) continue;
      if (!m.has(p.category)) m.set(p.category, []);
      m.get(p.category)!.push(p);
    }
    return [...m.entries()];
  }, [catalog, filter, onlyChanged, grants, revokes]);

  const toggle = (key: string) => {
    if (readOnly) return;
    if (dset.has(key)) {
      onChange(
        grants,
        revokes.includes(key) ? revokes.filter((k) => k !== key) : [...revokes, key]
      );
    } else {
      onChange(grants.includes(key) ? grants.filter((k) => k !== key) : [...grants, key], revokes);
    }
  };

  if (isTargetSuperAdmin) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-800 flex gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        Super Admin always has every option, including deleting forever from the Recycle Bin.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Find an option…"
            className={inputCls + ' pl-8'}
          />
        </div>
        <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
          <input
            type="checkbox"
            checked={onlyChanged}
            onChange={(e) => setOnlyChanged(e.target.checked)}
          />
          Only added / removed
        </label>
      </div>
      <div className="flex flex-wrap gap-2 text-[10px]">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
          From role
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 font-semibold">
          + Added
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200 font-semibold">
          − Removed
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-sky-50 text-sky-700 border-sky-200 font-semibold">
          Manager option = sees all company data
        </span>
      </div>
      <div className="max-h-[48vh] overflow-y-auto pr-1 space-y-3">
        {groups.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center">No options match.</p>
        )}
        {groups.map(([cat, perms]) => (
          <div key={cat} className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              {cat}
            </div>
            <div className="divide-y divide-slate-100">
              {perms.map((p) => {
                const isDefault = dset.has(p.key);
                const granted = grants.includes(p.key);
                const revoked = revokes.includes(p.key);
                const on = isDefault ? !revoked : granted;
                const locked =
                  readOnly || !!p.superAdminOnly || (!isDefault && !granted && !canGrant(p.key));
                const chip = granted
                  ? { t: '+ Added', c: 'bg-amber-50 text-amber-800 border-amber-200' }
                  : revoked
                    ? { t: '− Removed', c: 'bg-rose-50 text-rose-700 border-rose-200' }
                    : isDefault
                      ? { t: 'From role', c: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                      : null;
                return (
                  <div
                    key={p.key}
                    className={`flex items-center gap-3 px-3 py-2 ${on ? '' : 'opacity-80'}`}
                  >
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      disabled={locked}
                      onClick={() => toggle(p.key)}
                      title={
                        p.superAdminOnly
                          ? 'Super Admin only'
                          : locked && !readOnly
                            ? "You can't give an option you don't have"
                            : undefined
                      }
                      className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${
                        on
                          ? granted
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                          : revoked
                            ? 'bg-rose-300'
                            : 'bg-slate-300'
                      } ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`}
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-800 flex flex-wrap items-center gap-1.5">
                        {p.label}
                        {p.manager && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                            Manager option
                          </span>
                        )}
                        {p.superAdminOnly && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                            Super Admin only
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.key}</div>
                    </div>
                    {chip && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${chip.c}`}
                      >
                        {chip.t}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Create / edit modal ─────────────────────────────────────────────────────
interface EditorState {
  mode: 'create' | 'edit';
  source?: Source;
  id?: number;
}

function UserEditor({
  state,
  roles,
  catalog,
  onClose,
  onSaved,
}: {
  state: EditorState;
  roles: CatalogRole[];
  catalog: CatalogPermission[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const can = useCan();
  const { staffUser } = useAuthStore();
  const meIsSuper = (staffUser?.roleIds || []).includes(1);
  const meIsAdmin = meIsSuper || (staffUser?.roleIds || []).includes(2);
  const canGrantAny = meIsAdmin && can('users:grant_permissions');

  const [tab, setTab] = useState<'profile' | 'options'>('profile');
  const [loading, setLoading] = useState(state.mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(7);
  const [grants, setGrants] = useState<string[]>([]);
  const [revokes, setRevokes] = useState<string[]>([]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (state.mode !== 'edit') return;
    api<{ data: AccessProfile }>(`/v1/crm/access/users/${state.source}/${state.id}`)
      .then((d) => {
        const p = d.data;
        setProfile(p);
        setName(p.name || '');
        setEmail(p.email || '');
        setPhone(p.phone || '');
        setRoleId(p.role_id);
        setGrants(p.grants || []);
        setRevokes(p.revokes || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [state]);

  const role = roles.find((r) => r.id === roleId);
  const defaults = role?.defaults || [];
  // Changing the role drops grants that the new role already includes, and revokes it doesn't.
  useEffect(() => {
    setGrants((g) => g.filter((k) => !defaults.includes(k)));
    setRevokes((r) => r.filter((k) => defaults.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  const myPerms = staffUser?.permissions || [];
  const canGrantKey = (key: string) =>
    canGrantAny &&
    (meIsSuper ||
      myPerms.includes('*') ||
      hasUserPermission(myPerms, undefined, key, staffUser?.roleIds));

  const assignableRoles = roles.filter((r) => meIsSuper || (r.id !== 1 && r.id !== 2));
  const targetIsSuper = roleId === 1;
  const isSelf =
    state.mode === 'edit' && profile && staffUser && Number(staffUser.id) === profile.id;
  const lockedTarget =
    state.mode === 'edit' &&
    !meIsSuper &&
    profile &&
    (profile.role_id === 1 || profile.role_id === 2);

  const save = async () => {
    setError('');
    if (!name.trim() || !email.trim()) return setError('Name and email are required.');
    if (state.mode === 'create' && password.length < 6)
      return setError('Password must be at least 6 characters.');
    setSaving(true);
    try {
      if (state.mode === 'create') {
        await api('/v1/crm/access/users', {
          method: 'POST',
          body: { name, email, phone, password, role_id: roleId, grants, revokes, reason },
        });
        onSaved(`${name} was added.`);
      } else if (profile) {
        const body: Record<string, unknown> = {};
        if (name !== profile.name) body.name = name;
        if (email !== profile.email) body.email = email;
        if ((phone || '') !== (profile.phone || '')) body.phone = phone;
        if (password) body.password = password;
        if (roleId !== profile.role_id) body.role_id = roleId;
        if (Object.keys(body).length) {
          await api(`/v1/crm/access/users/${profile.source}/${profile.id}`, {
            method: 'PUT',
            body,
          });
        }
        const sameSet = (a: string[], b: string[]) =>
          a.length === b.length && a.every((x) => b.includes(x));
        if (!sameSet(grants, profile.grants) || !sameSet(revokes, profile.revokes)) {
          await api(`/v1/crm/access/users/${profile.source}/${profile.id}/overrides`, {
            method: 'PUT',
            body: { grants, revokes, reason },
          });
        }
        onSaved(`${name} was updated.`);
      }
    } catch (e: any) {
      setError(e.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const effectiveCount = defaults.filter((k) => !revokes.includes(k)).length + grants.length;

  return (
    <CrmModal
      isOpen
      onClose={() => !saving && onClose()}
      title={state.mode === 'create' ? 'Add user' : `Edit ${profile?.name || 'user'}`}
      description={
        state.mode === 'edit' && profile
          ? `${profile.source === 'users' ? 'Old + new CRM login' : 'New CRM login'} · #${profile.id}`
          : 'Pick a role, then add or remove single options if needed.'
      }
      size="xl"
      icon={<KeyRound className="w-4 h-4" />}
    >
      {loading ? (
        <p className="text-xs text-slate-400 py-10 text-center">Loading…</p>
      ) : (
        <div className="space-y-4">
          {(isSelf || lockedTarget) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex gap-2">
              <Info className="w-4 h-4 shrink-0" />
              {isSelf
                ? 'You cannot change your own role or options. Ask another admin.'
                : 'Only a Super Admin can change a Super Admin or Admin account.'}
            </div>
          )}
          <div className="flex gap-1 border-b border-slate-200">
            {(['profile', 'options'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-2 text-xs font-bold border-b-2 -mb-px ${
                  tab === t
                    ? 'border-[#1B365D] text-[#1B365D]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'profile'
                  ? 'Profile & role'
                  : `Options (${targetIsSuper ? 'all' : effectiveCount})`}
              </button>
            ))}
          </div>

          {tab === 'profile' ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-600 mb-1">Full name</span>
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-600 mb-1">
                  Official email
                </span>
                <input
                  className={inputCls}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-600 mb-1">Mobile</span>
                <input
                  className={inputCls}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-600 mb-1">
                  {state.mode === 'create' ? 'Password' : 'New password (leave empty to keep)'}
                </span>
                <input
                  className={inputCls}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-[11px] font-bold text-slate-600 mb-1">Role</span>
                <select
                  className={inputCls}
                  value={roleId}
                  disabled={!!isSelf || !!lockedTarget}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                >
                  {(assignableRoles.some((r) => r.id === roleId) ? assignableRoles : roles).map(
                    (r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.legacyUserType ? '' : ' (new CRM only)'}
                      </option>
                    )
                  )}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {targetIsSuper
                    ? 'Super Admin has every option.'
                    : `${role?.name || 'This role'} gives ${defaults.length} options by default.`}{' '}
                  {role && !role.legacyUserType && state.mode === 'create'
                    ? 'This role has no login on the old CRM (etaxwala.com).'
                    : ''}
                </p>
              </label>
              {(grants.length > 0 || revokes.length > 0) && (
                <div className="sm:col-span-2 flex flex-wrap gap-1.5">
                  {grants.map((g) => (
                    <span
                      key={g}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200"
                    >
                      + {catalog.find((p) => p.key === g)?.label || g}
                    </span>
                  ))}
                  {revokes.map((g) => (
                    <span
                      key={g}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200"
                    >
                      − {catalog.find((p) => p.key === g)?.label || g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {!canGrantAny && (
                <p className="text-[11px] text-slate-500 flex gap-1.5 items-center">
                  <Info className="w-3.5 h-3.5" /> Only Super Admin and Admin can add or remove
                  options.
                </p>
              )}
              <OptionsEditor
                catalog={catalog}
                defaults={defaults}
                grants={grants}
                revokes={revokes}
                onChange={(g, r) => {
                  setGrants(g);
                  setRevokes(r);
                }}
                readOnly={!canGrantAny || !!isSelf || !!lockedTarget}
                isTargetSuperAdmin={targetIsSuper}
                canGrant={canGrantKey}
              />
              {canGrantAny && !targetIsSuper && (
                <label className="block">
                  <span className="block text-[11px] font-bold text-slate-600 mb-1">
                    Why (shown in Activity Logs)
                  </span>
                  <input
                    className={inputCls}
                    value={reason}
                    maxLength={255}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. covering for the Sales Manager this week"
                  />
                </label>
              )}
            </div>
          )}

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button className="btn-outline btn-sm" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              className="btn-multicolor btn-sm"
              onClick={save}
              disabled={saving || !!isSelf || !!lockedTarget}
            >
              {saving ? 'Saving…' : state.mode === 'create' ? 'Add user' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </CrmModal>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function UsersAccessPage() {
  const can = useCan();
  const { staffUser } = useAuthStore();
  const meIsSuper = (staffUser?.roleIds || []).includes(1);
  const [rows, setRows] = useState<AccessUserRow[]>([]);
  const [roles, setRoles] = useState<CatalogRole[]>([]);
  const [catalog, setCatalog] = useState<CatalogPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | 0>(0);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [onlyOverrides, setOnlyOverrides] = useState(false);
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [confirm, setConfirm] = useState<AccessUserRow | null>(null);
  const PAGE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [u, c] = await Promise.all([
        api<{ data: AccessUserRow[] }>('/v1/crm/access/users'),
        roles.length
          ? Promise.resolve(null)
          : api<{ data: { roles: CatalogRole[]; permissions: CatalogPermission[] } }>(
              '/v1/crm/access/catalog'
            ),
      ]);
      setRows(u.data);
      if (c) {
        setRoles(c.data.roles);
        setCatalog(c.data.permissions);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [roles.length]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (statusFilter === 'all' || (statusFilter === 'active' ? r.active : !r.active)) &&
        (!roleFilter || r.role_id === roleFilter) &&
        (!onlyOverrides || r.grants > 0 || r.revokes > 0) &&
        (!q ||
          r.name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          String(r.id) === q)
    );
  }, [rows, search, roleFilter, statusFilter, onlyOverrides]);
  useEffect(() => setPage(1), [search, roleFilter, statusFilter, onlyOverrides]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const shown = filtered.slice((page - 1) * PAGE, page * PAGE);

  const toggleStatus = async (r: AccessUserRow) => {
    try {
      await api(`/v1/crm/access/users/${r.source}/${r.id}/status`, {
        method: 'PATCH',
        body: { active: !r.active },
      });
      setNotice(`${r.name} is now ${r.active ? 'inactive' : 'active'}.`);
      setConfirm(null);
      load();
    } catch (e: any) {
      setError(e.message);
      setConfirm(null);
    }
  };

  const counts = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.active).length,
      withExtras: rows.filter((r) => r.grants > 0 || r.revokes > 0).length,
    }),
    [rows]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-[#1B365D] flex items-center gap-2">
            <Users className="w-5 h-5" /> Users &amp; Access
          </h1>
          <p className="text-xs text-slate-500">
            Each user gets their role's options. Super Admin and Admin can add or remove single
            options.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline btn-sm inline-flex items-center gap-1.5" onClick={load}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {can('users:create') && (
            <button
              className="btn-multicolor btn-sm inline-flex items-center gap-1.5"
              onClick={() => setEditor({ mode: 'create' })}
            >
              <Plus className="w-3.5 h-3.5" /> Add user
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ['Users', counts.total],
          ['Active', counts.active],
          ['With extra / removed options', counts.withExtras],
        ].map(([l, v]) => (
          <div
            key={String(l)}
            className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm"
          >
            <div className="text-[11px] font-semibold text-slate-500">{l}</div>
            <div className="text-xl font-extrabold text-[#1B365D]">{v}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            className={inputCls + ' pl-8'}
            placeholder="Search name, email or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={inputCls.replace('w-full ', '') + ' w-auto min-w-[140px]'}
          value={roleFilter}
          onChange={(e) => setRoleFilter(Number(e.target.value))}
        >
          <option value={0}>All roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          className={inputCls.replace('w-full ', '') + ' w-auto min-w-[140px]'}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="all">All</option>
        </select>
        <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
          <input
            type="checkbox"
            checked={onlyOverrides}
            onChange={(e) => setOnlyOverrides(e.target.checked)}
          />
          Only with changed options
        </label>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 flex justify-between">
          {notice}
          <button onClick={() => setNotice('')} className="font-bold">
            ×
          </button>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 flex justify-between">
          {error}
          <button onClick={() => setError('')} className="font-bold">
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Options</th>
                <th className="px-4 py-3">Login</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && shown.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No users match.
                  </td>
                </tr>
              )}
              {!loading &&
                shown.map((r) => {
                  const isMe = Number(staffUser?.id) === r.id;
                  const protectedRow = !meIsSuper && (r.role_id === 1 || r.role_id === 2);
                  return (
                    <tr
                      key={`${r.source}:${r.id}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{r.name}</div>
                        <div className="text-[11px] text-slate-500">{r.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-[#1B365D] border-slate-200 whitespace-nowrap">
                          {r.role_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.role_id === 1 ? (
                          <span className="text-[10px] text-emerald-700 font-semibold">All</span>
                        ) : r.grants || r.revokes ? (
                          <span className="inline-flex gap-1">
                            {r.grants > 0 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                                +{r.grants}
                              </span>
                            )}
                            {r.revokes > 0 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
                                −{r.revokes}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Role default</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {r.source === 'users' ? 'Old + new CRM' : 'New CRM'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                            r.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {r.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {fmtIST(r.last_login_at)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {can('users:edit') && (
                          <button
                            className="btn-outline btn-sm inline-flex items-center gap-1 mr-1.5"
                            onClick={() => setEditor({ mode: 'edit', source: r.source, id: r.id })}
                          >
                            <Pencil className="w-3 h-3" /> {protectedRow || isMe ? 'View' : 'Edit'}
                          </button>
                        )}
                        {can('users:deactivate') && !isMe && !protectedRow && r.role_id !== 1 && (
                          <button
                            className={`btn-sm inline-flex items-center gap-1 ${r.active ? 'btn-ghost-etx text-rose-600' : 'btn-ghost-etx text-emerald-700'}`}
                            onClick={() => setConfirm(r)}
                          >
                            {r.active ? (
                              <UserX className="w-3 h-3" />
                            ) : (
                              <UserCheck className="w-3 h-3" />
                            )}
                            {r.active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {filtered.length === 0 ? 0 : (page - 1) * PAGE + 1}–
            {Math.min(page * PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              className="btn-outline btn-sm disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <button
              className="btn-outline btn-sm disabled:opacity-50"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {editor && (
        <UserEditor
          state={editor}
          roles={roles}
          catalog={catalog}
          onClose={() => setEditor(null)}
          onSaved={(msg) => {
            setEditor(null);
            setNotice(msg);
            load();
          }}
        />
      )}

      <CrmModal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.active ? 'Deactivate this user?' : 'Activate this user?'}
        description={confirm ? `${confirm.name} · ${confirm.email}` : undefined}
        size="sm"
        icon={confirm?.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
      >
        <p className="text-xs text-slate-600 mb-4">
          {confirm?.active
            ? 'They are signed out of the new CRM at once and cannot sign in there. Their leads, calls and history stay. Note: the old CRM (etaxwala.com) does not check this.'
            : 'They can sign in again with their existing password.'}
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn-outline btn-sm" onClick={() => setConfirm(null)}>
            Cancel
          </button>
          <button
            className={confirm?.active ? 'btn-danger btn-sm' : 'btn-success btn-sm'}
            onClick={() => confirm && toggleStatus(confirm)}
          >
            {confirm?.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </CrmModal>
    </div>
  );
}
