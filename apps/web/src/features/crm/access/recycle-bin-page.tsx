/**
 * Recycle Bin — deleted leads, customers/orders, tasks and more.
 *  • Super Admin and Admin can restore (puts the record back with the same ID).
 *  • Only Super Admin can delete forever.
 * Deleted leads keep their call history until they are deleted forever.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, RefreshCw, RotateCcw, Search, Trash2 } from 'lucide-react';
import { CrmModal } from '@/components/ui/crm-modal';
import { api, fmtIST } from './access-api';

interface BinRow {
  id: number;
  entity_type: string;
  entity_id: string;
  title: string;
  subtitle: string | null;
  mode: 'flag' | 'archive';
  related_counts: Record<string, number> | null;
  deleted_by_name: string | null;
  deleted_at: string;
  delete_reason: string | null;
  status: 'in_bin' | 'restored' | 'purged';
  restored_by_name: string | null;
  restored_at: string | null;
  purged_by_name: string | null;
  purged_at: string | null;
  type_label: string;
}
interface BinDetail extends BinRow {
  payload_snapshot: Record<string, unknown> | null;
  linked_calls: number;
}
interface BinList {
  data: BinRow[];
  total: number;
  counts: Record<string, number>;
  can_restore: boolean;
  can_purge: boolean;
  ready: boolean;
}

const TABS: { key: string; label: string; types: string[] }[] = [
  { key: 'all', label: 'Everything', types: [] },
  { key: 'leads', label: 'Leads', types: ['lead', 'lead_udyami', 'lead_sahakar'] },
  { key: 'customers', label: 'Customers & orders', types: ['customer', 'order'] },
  { key: 'tasks', label: 'Tasks', types: ['operation_task', 'internal_task'] },
  { key: 'service_question', label: 'Service questions', types: ['service_question'] },
  { key: 'staff_user', label: 'Staff users', types: ['staff_user'] },
];
const RELATED_LABEL: Record<string, string> = {
  orders: 'orders',
  operation_tasks: 'tasks',
  customer_emi: 'EMI rows',
  customers: 'customer',
  task_assign: 'assignments',
  task_excel: 'task',
  task_comments: 'comments',
  service_questions: 'question',
  staff_users: 'account',
  staff_user_roles: 'role links',
};
const inputCls =
  'w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20';

const STATUS_CHIP: Record<string, string> = {
  in_bin: 'bg-amber-50 text-amber-800 border-amber-200',
  restored: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  purged: 'bg-slate-100 text-slate-500 border-slate-200',
};
const STATUS_LABEL: Record<string, string> = {
  in_bin: 'In bin',
  restored: 'Restored',
  purged: 'Deleted forever',
};

function relatedText(rc: Record<string, number> | null) {
  if (!rc) return '';
  return Object.entries(rc)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${n} ${RELATED_LABEL[k] || k}`)
    .join(' · ');
}

export default function RecycleBinPage() {
  const [tab, setTab] = useState('all');
  const [status, setStatus] = useState<'in_bin' | 'restored' | 'purged' | 'all'>('in_bin');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [list, setList] = useState<BinList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [view, setView] = useState<BinDetail | null>(null);
  const [restoreItem, setRestoreItem] = useState<BinRow | null>(null);
  const [purge, setPurge] = useState<BinDetail | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const LIMIT = 50;

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [tab, status, q]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api<BinList>('/v1/crm/recycle-bin', {
      query: { type: tab, status, search: q, page, limit: LIMIT },
    })
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab, status, q, page]);
  useEffect(() => {
    load();
  }, [load]);

  const tabCount = useMemo(() => {
    const c = list?.counts || {};
    const sum = (types: string[]) =>
      types.length
        ? types.reduce((a, t) => a + (c[t] || 0), 0)
        : Object.values(c).reduce((a, b) => a + b, 0);
    return Object.fromEntries(TABS.map((t) => [t.key, sum(t.types)]));
  }, [list]);

  const openDetail = async (id: number, forPurge = false) => {
    try {
      const d = await api<{ data: BinDetail }>(`/v1/crm/recycle-bin/${id}`);
      if (forPurge) {
        setConfirmText('');
        setPurge(d.data);
      } else setView(d.data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const doRestore = async () => {
    if (!restoreItem) return;
    setBusy(true);
    try {
      await api(`/v1/crm/recycle-bin/${restoreItem.id}/restore`, { method: 'POST' });
      setNotice(`Restored: ${restoreItem.title}`);
      setRestoreItem(null);
      setView(null);
      load();
    } catch (e: any) {
      setError(e.message);
      setRestoreItem(null);
    } finally {
      setBusy(false);
    }
  };
  const doPurge = async () => {
    if (!purge) return;
    setBusy(true);
    try {
      await api(`/v1/crm/recycle-bin/${purge.id}`, { method: 'DELETE' });
      setNotice(`Deleted forever: ${purge.title}`);
      setPurge(null);
      setView(null);
      load();
    } catch (e: any) {
      setError(e.message);
      setPurge(null);
    } finally {
      setBusy(false);
    }
  };

  const rows = list?.data || [];
  const total = list?.total || 0;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-[#1B365D] flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Recycle Bin
          </h1>
          <p className="text-xs text-slate-500">
            Deleted records wait here. Super Admin and Admin can restore them; only Super Admin can
            delete forever.
          </p>
        </div>
        <button className="btn-outline btn-sm inline-flex items-center gap-1.5" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {list && !list.ready && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          The Recycle Bin table is not set up on this database yet. Deletes still work the old way
          (permanent).
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === t.key
                  ? 'bg-[#1B365D] text-white border-[#1B365D]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
              <span
                className={`text-[10px] px-1.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}
              >
                {tabCount[t.key] || 0}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              className={inputCls + ' pl-8'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID or who deleted it"
            />
          </div>
          <select
            className={inputCls.replace('w-full ', '') + ' w-auto min-w-[140px]'}
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="in_bin">In bin</option>
            <option value="restored">Restored</option>
            <option value="purged">Deleted forever</option>
            <option value="all">All</option>
          </select>
        </div>
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
                <th className="px-4 py-3">Record</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Deleted by</th>
                <th className="px-4 py-3 whitespace-nowrap">When (IST)</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
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
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    The bin is empty for this view.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 min-w-[240px]">
                      <div className="font-semibold text-slate-800">{r.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.subtitle}
                        {relatedText(r.related_counts) && (
                          <span className="text-slate-400"> · {relatedText(r.related_counts)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{r.type_label}</td>
                    <td className="px-4 py-3 text-slate-700">{r.deleted_by_name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {fmtIST(r.deleted_at).replace(' IST', '')}
                    </td>
                    <td
                      className="px-4 py-3 text-slate-600 max-w-[180px] truncate"
                      title={r.delete_reason || ''}
                    >
                      {r.delete_reason || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_CHIP[r.status]}`}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                      {r.status === 'restored' && r.restored_by_name && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          by {r.restored_by_name}
                        </div>
                      )}
                      {r.status === 'purged' && r.purged_by_name && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          by {r.purged_by_name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.status !== 'purged' && (
                        <button
                          className="btn-ghost-etx btn-sm inline-flex items-center gap-1 mr-1"
                          onClick={() => openDetail(r.id)}
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      )}
                      {r.status === 'in_bin' && list?.can_restore && (
                        <button
                          className="btn-outline btn-sm inline-flex items-center gap-1 mr-1"
                          onClick={() => setRestoreItem(r)}
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                      )}
                      {r.status === 'in_bin' && list?.can_purge && (
                        <button
                          className="btn-danger btn-sm inline-flex items-center gap-1"
                          onClick={() => openDetail(r.id, true)}
                        >
                          <Trash2 className="w-3 h-3" /> Delete forever
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {total === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
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

      {/* View a deleted record */}
      <CrmModal
        isOpen={!!view}
        onClose={() => setView(null)}
        title={view?.title || ''}
        description={
          view
            ? `${view.type_label} #${view.entity_id} · deleted ${fmtIST(view.deleted_at)} by ${view.deleted_by_name || '—'}`
            : undefined
        }
        size="lg"
        icon={<Eye className="w-4 h-4" />}
      >
        {view && (
          <div className="space-y-3 text-xs">
            {view.linked_calls > 0 && (
              <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sky-800">
                {view.linked_calls} call record{view.linked_calls === 1 ? '' : 's'} are linked to
                this lead and are kept.
              </p>
            )}
            {relatedText(view.related_counts) && (
              <p className="text-slate-600">Saved with it: {relatedText(view.related_counts)}.</p>
            )}
            <div className="rounded-xl border border-slate-200 overflow-hidden max-h-[50vh] overflow-y-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(view.payload_snapshot || {}).map(([k, v]) => (
                    <tr key={k}>
                      <td className="px-3 py-1.5 font-mono text-slate-500 w-44 align-top">{k}</td>
                      <td className="px-3 py-1.5 text-slate-800 break-all">
                        {v === null || v === '' ? (
                          <span className="text-slate-300">—</span>
                        ) : typeof v === 'object' ? (
                          JSON.stringify(v)
                        ) : (
                          String(v)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              {view.status === 'in_bin' && list?.can_restore && (
                <button
                  className="btn-multicolor btn-sm inline-flex items-center gap-1.5"
                  onClick={() => setRestoreItem(view)}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              )}
            </div>
          </div>
        )}
      </CrmModal>

      {/* Restore confirm */}
      <CrmModal
        isOpen={!!restoreItem}
        onClose={() => !busy && setRestoreItem(null)}
        title="Restore this record?"
        description={restoreItem ? `${restoreItem.type_label}: ${restoreItem.title}` : undefined}
        size="sm"
        icon={<RotateCcw className="w-4 h-4" />}
      >
        <p className="text-xs text-slate-600 mb-4">
          It goes back with the same ID
          {restoreItem && relatedText(restoreItem.related_counts)
            ? `, together with ${relatedText(restoreItem.related_counts)}`
            : ''}
          . It shows up again in its list straight away.
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="btn-outline btn-sm"
            disabled={busy}
            onClick={() => setRestoreItem(null)}
          >
            Cancel
          </button>
          <button className="btn-success btn-sm" disabled={busy} onClick={doRestore}>
            {busy ? 'Restoring…' : 'Restore'}
          </button>
        </div>
      </CrmModal>

      {/* Delete forever (Super Admin) */}
      <CrmModal
        isOpen={!!purge}
        onClose={() => !busy && setPurge(null)}
        title="Delete forever?"
        description={purge ? `${purge.type_label}: ${purge.title}` : undefined}
        size="sm"
        icon={<AlertTriangle className="w-4 h-4" />}
      >
        {purge && (
          <div className="space-y-3 text-xs">
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
              This cannot be undone.
              {purge.mode === 'flag' && purge.linked_calls > 0
                ? ` The lead's ${purge.linked_calls} call record${purge.linked_calls === 1 ? '' : 's'} and answers will also be deleted.`
                : purge.mode === 'archive'
                  ? ' The saved copy is removed, so it can no longer be restored.'
                  : ''}
            </p>
            <label className="block">
              <span className="block text-[11px] font-bold text-slate-600 mb-1">
                Type DELETE to confirm
              </span>
              <input
                className={inputCls}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoFocus
              />
            </label>
            <div className="flex justify-end gap-2">
              <button className="btn-outline btn-sm" disabled={busy} onClick={() => setPurge(null)}>
                Cancel
              </button>
              <button
                className="btn-danger btn-sm disabled:opacity-50"
                disabled={busy || confirmText !== 'DELETE'}
                onClick={doPurge}
              >
                {busy ? 'Deleting…' : 'Delete forever'}
              </button>
            </div>
          </div>
        )}
      </CrmModal>
    </div>
  );
}
