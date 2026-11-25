/**
 * Activity Logs — every sign-in, change, delete, restore and export by every
 * staff user. Filters, a details drawer with before/after, and CSV export.
 * Kept for one year (see RUNBOOK: purge job, never run on live without approval).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Filter, RefreshCw, ScrollText, Search, X } from 'lucide-react';
import { api, download, fmtIST, todayIST } from './access-api';
import { useAuthStore } from '@/store/auth-store';
import { hasUserPermission } from '../permissions';

interface LogRow {
  id: number;
  actor_id: number | null;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: string | null;
  actor_source: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  module: string | null;
  summary: string | null;
  status_code: number | null;
  method: string | null;
  path: string | null;
  ip_address: string | null;
  created_at: string;
}
interface LogDetail extends LogRow {
  payload: unknown;
  changes: { before?: unknown; after?: unknown } | null;
  user_agent: string | null;
}
interface Facets {
  actors: { actor_id: number; actor_source: string; name: string; count: number }[];
  modules: { value: string; count: number }[];
  actions: { value: string; count: number }[];
  retention_days?: number;
}

const inputCls =
  'w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20';

const ACTION_TONE: Record<string, string> = {
  delete: 'bg-rose-50 text-rose-700 border-rose-200',
  purge: 'bg-rose-50 text-rose-700 border-rose-200',
  restore: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  create: 'bg-sky-50 text-sky-700 border-sky-200',
  login: 'bg-slate-50 text-slate-600 border-slate-200',
  logout: 'bg-slate-50 text-slate-600 border-slate-200',
  login_failed: 'bg-amber-50 text-amber-800 border-amber-200',
  export: 'bg-violet-50 text-violet-700 border-violet-200',
};
const tone = (a: string) =>
  ACTION_TONE[a] ||
  (a.includes('delete') || a.includes('deactivate')
    ? ACTION_TONE.delete
    : a.includes('grant') || a.includes('override') || a.includes('role')
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-blue-50 text-[#1B365D] border-blue-100');
const label = (a: string) => a.replace(/_/g, ' ');

function asList(v: Facets['modules'] | Facets['actions'], _key?: string): string[] {
  return (v || []).map((x: any) => (typeof x === 'string' ? x : x.value)).filter(Boolean);
}

/** Flat list of changed fields between two objects (one level deep, enough for rows). */
function diffRows(before: any, after: any): { field: string; before: string; after: string }[] {
  const show = (v: unknown) =>
    v === null || v === undefined ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (
    before &&
    typeof before === 'object' &&
    after &&
    typeof after === 'object' &&
    !Array.isArray(before)
  ) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
    return keys
      .filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]))
      .map((k) => ({ field: k, before: show(before[k]), after: show(after[k]) }));
  }
  if (before && typeof before === 'object' && !after) {
    return Object.keys(before).map((k) => ({ field: k, before: show(before[k]), after: '—' }));
  }
  if (after && typeof after === 'object' && !before) {
    return Object.keys(after).map((k) => ({ field: k, before: '—', after: show(after[k]) }));
  }
  return before || after ? [{ field: 'value', before: show(before), after: show(after) }] : [];
}

function Drawer({ id, onClose }: { id: number; onClose: () => void }) {
  const [d, setD] = useState<LogDetail | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api<{ data: LogDetail }>(`/v1/crm/audit-logs/${id}`)
      .then((r) => setD(r.data))
      .catch((e) => setErr(e.message));
  }, [id]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const rows = d?.changes ? diffRows(d.changes.before, d.changes.after) : [];
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="relative w-full max-w-xl h-full bg-white border-l border-[#EAE6DD] shadow-2xl flex flex-col">
        <div className="h-1 bg-multicolor" />
        <div className="p-4 border-b border-[#EAE6DD] flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-[#1B365D]">{d?.summary || 'Log entry'}</h3>
            <p className="text-[11px] text-slate-500">
              #{id} · {d ? fmtIST(d.created_at) : '…'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {err && <p className="text-rose-600">{err}</p>}
          {d && (
            <>
              <dl className="grid grid-cols-[110px_1fr] gap-y-1.5 gap-x-3">
                <dt className="text-slate-500">Who</dt>
                <dd className="font-semibold text-slate-800">
                  {d.actor_name || '—'}{' '}
                  <span className="font-normal text-slate-500">{d.actor_email}</span>
                </dd>
                <dt className="text-slate-500">Role</dt>
                <dd>{d.actor_role ? label(d.actor_role) : '—'}</dd>
                <dt className="text-slate-500">Section</dt>
                <dd>{d.module || d.resource}</dd>
                <dt className="text-slate-500">Action</dt>
                <dd>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tone(d.action)}`}
                  >
                    {label(d.action)}
                  </span>
                </dd>
                <dt className="text-slate-500">Record</dt>
                <dd className="font-mono">{d.resource_id || '—'}</dd>
                <dt className="text-slate-500">Result</dt>
                <dd>
                  {d.status_code
                    ? d.status_code >= 400
                      ? `Failed (${d.status_code})`
                      : `OK (${d.status_code})`
                    : '—'}
                </dd>
                <dt className="text-slate-500">Request</dt>
                <dd className="font-mono break-all">
                  {d.method} {d.path}
                </dd>
                <dt className="text-slate-500">IP / device</dt>
                <dd className="break-all text-slate-600">
                  {d.ip_address || '—'} · {d.user_agent || '—'}
                </dd>
              </dl>
              {rows.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-1.5">What changed</h4>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                          <th className="px-3 py-2">Field</th>
                          <th className="px-3 py-2">Before</th>
                          <th className="px-3 py-2">After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.slice(0, 200).map((r) => (
                          <tr key={r.field}>
                            <td className="px-3 py-1.5 font-mono text-slate-600 align-top">
                              {r.field}
                            </td>
                            <td className="px-3 py-1.5 align-top break-all bg-rose-50/40 text-rose-800">
                              {r.before}
                            </td>
                            <td className="px-3 py-1.5 align-top break-all bg-emerald-50/40 text-emerald-800">
                              {r.after}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {d.payload != null && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-1.5">Details sent</h4>
                  <pre className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] whitespace-pre-wrap break-all max-h-72 overflow-auto">
                    {typeof d.payload === 'string' ? d.payload : JSON.stringify(d.payload, null, 2)}
                  </pre>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Passwords, tokens and OTPs are never stored.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function ActivityLogsPage() {
  const { staffUser, activeRole } = useAuthStore();
  const canExport = hasUserPermission(staffUser?.permissions, activeRole, 'logs:export', [
    ...((staffUser?.roles as (string | number)[]) || []),
    ...(staffUser?.roleIds || []),
  ]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const LIMIT = 50;
  const [f, setF] = useState({
    actor: '',
    module: '',
    action: '',
    status: '',
    from: todayIST(-6),
    to: todayIST(),
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setF((x) => ({ ...x, search: searchInput.trim() })), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const query = useMemo(() => {
    const [actor_source, actor_id] = f.actor ? f.actor.split(':') : ['', ''];
    return {
      actor_source,
      actor_id,
      module: f.module,
      action: f.action,
      status: f.status,
      from: f.from,
      to: f.to,
      search: f.search,
    };
  }, [f]);

  useEffect(() => {
    api<{ data: Facets }>('/v1/crm/audit-logs/facets')
      .then((d) => setFacets(d.data))
      .catch(() => undefined);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api<{ data: LogRow[]; total: number }>('/v1/crm/audit-logs', {
      query: { ...query, page, limit: LIMIT },
    })
      .then((d) => {
        setRows(d.data);
        setTotal(d.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query, page]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => setPage(1), [query]);

  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((x) => ({ ...x, [k]: e.target.value }));
  const clear = () => {
    setSearchInput('');
    setF({
      actor: '',
      module: '',
      action: '',
      status: '',
      from: todayIST(-6),
      to: todayIST(),
      search: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-[#1B365D] flex items-center gap-2">
            <ScrollText className="w-5 h-5" /> Activity Logs
          </h1>
          <p className="text-xs text-slate-500">
            Who did what, and when — for every staff user. Times are India time (IST). Kept for{' '}
            {Math.round((facets?.retention_days || 365) / 30) >= 12
              ? '1 year'
              : `${facets?.retention_days} days`}
            .
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline btn-sm inline-flex items-center gap-1.5" onClick={load}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {canExport && (
            <button
              className="btn-multicolor btn-sm inline-flex items-center gap-1.5 disabled:opacity-60"
              disabled={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  await download(
                    '/v1/crm/audit-logs/export',
                    query,
                    `activity-logs-${f.from}-to-${f.to}.csv`
                  );
                } catch (e: any) {
                  setError(e.message);
                } finally {
                  setExporting(false);
                }
              }}
            >
              <Download className="w-3.5 h-3.5" /> {exporting ? 'Preparing…' : 'Export CSV'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" /> Filters
          <button
            onClick={clear}
            className="ml-auto normal-case tracking-normal font-semibold text-[#1B365D] hover:underline"
          >
            Clear
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <label className="col-span-2">
            <span className="block text-[11px] font-bold text-slate-600 mb-1">Search</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                className={inputCls + ' pl-8'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, email, record, text…"
              />
            </div>
          </label>
          <label>
            <span className="block text-[11px] font-bold text-slate-600 mb-1">User</span>
            <select className={inputCls} value={f.actor} onChange={set('actor')}>
              <option value="">Everyone</option>
              {(facets?.actors || []).map((a) => (
                <option
                  key={`${a.actor_source}:${a.actor_id}`}
                  value={`${a.actor_source}:${a.actor_id}`}
                >
                  {a.name} ({a.count})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-[11px] font-bold text-slate-600 mb-1">Section</span>
            <select className={inputCls} value={f.module} onChange={set('module')}>
              <option value="">All sections</option>
              {asList(facets?.modules || [], 'module').map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-[11px] font-bold text-slate-600 mb-1">Action</span>
            <select className={inputCls} value={f.action} onChange={set('action')}>
              <option value="">All actions</option>
              {asList(facets?.actions || [], 'action').map((a) => (
                <option key={a} value={a}>
                  {label(a)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-[11px] font-bold text-slate-600 mb-1">From</span>
            <input
              type="date"
              className={inputCls}
              value={f.from}
              max={f.to}
              onChange={set('from')}
            />
          </label>
          <label>
            <span className="block text-[11px] font-bold text-slate-600 mb-1">To</span>
            <input
              type="date"
              className={inputCls}
              value={f.to}
              min={f.from}
              onChange={set('to')}
            />
          </label>
        </div>
        <div className="flex gap-1.5 text-[11px]">
          {[
            ['', 'All results'],
            ['ok', 'Successful'],
            ['failed', 'Failed / denied'],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setF((x) => ({ ...x, status: v }))}
              className={`px-2.5 py-1 rounded-full border font-semibold ${
                f.status === v
                  ? 'bg-[#1B365D] text-white border-[#1B365D]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3 whitespace-nowrap">When (IST)</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">What happened</th>
                <th className="px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Nothing logged for these filters.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setOpenId(r.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {fmtIST(r.created_at).replace(' IST', '')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">
                        {r.actor_name || r.actor_email || '—'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {r.actor_role ? label(r.actor_role) : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {r.module || r.resource}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${tone(r.action)}`}
                      >
                        {label(r.action)}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-slate-700 max-w-[300px] truncate"
                      title={r.summary || ''}
                    >
                      {r.summary || `${r.method || ''} ${r.path || ''}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.status_code && r.status_code >= 400 ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
                          Failed
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {total === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of{' '}
            {total.toLocaleString('en-IN')}
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
      {openId !== null && <Drawer id={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
