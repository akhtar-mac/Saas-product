/**
 * Desktrack — parity with the old etaxwala.com "Manage Desktrack" screens
 * (DesktopController): Tracking Report, Session Report (idle), screenshot
 * viewer, Block Website, Manage IPs, plus desktop_users config and a live board.
 * Live data is polled over HTTP (no WebSockets on Hostinger Node).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Monitor,
  Clock,
  Radio,
  Ban,
  Settings2,
  Network,
  RefreshCw,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { hasUserPermission } from './permissions';
import {
  API_BASE,
  crmFetch,
  staffAuthHeaders,
  Button,
  buttonClass,
  StatusPill,
  ToneBadge,
  DESKTRACK_ACTIVITY_TONE,
  DESKTRACK_STATE_LABEL,
  DESKTRACK_STATE_TONE,
  OLD_SURFACES,
} from './desktrack/desktrack-ui';

const BASE = '/v1/crm/desktrack';
const LIVE_POLL_MS = 30_000;
const REPORT_POLL_MS = 60_000;

export type DesktrackTab = 'tracking' | 'session' | 'live' | 'blocked' | 'desktop-users' | 'ips';

const TABS: Array<{ key: DesktrackTab; label: string; path: string; icon: React.ReactNode }> = [
  {
    key: 'tracking',
    label: 'Tracking Report',
    path: '/crm/desktop-report',
    icon: <Radio className="w-3.5 h-3.5" />,
  },
  {
    key: 'session',
    label: 'Session Report',
    path: '/crm/desktop-report-idle',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    key: 'live',
    label: 'Live Now',
    path: '/crm/desktrack-live',
    icon: <Monitor className="w-3.5 h-3.5" />,
  },
  {
    key: 'blocked',
    label: 'Block Website',
    path: '/crm/block-websites',
    icon: <Ban className="w-3.5 h-3.5" />,
  },
  {
    key: 'desktop-users',
    label: 'Desktop Users',
    path: '/crm/desktop-users',
    icon: <Settings2 className="w-3.5 h-3.5" />,
  },
  {
    key: 'ips',
    label: 'Manage IPs',
    path: '/crm/manage-ips',
    icon: <Network className="w-3.5 h-3.5" />,
  },
];

/** Old formatDateDMY(): YYYY-MM-DD HH:mm:ss → DD-MM-YYYY HH:mm:ss */
export function dmy(v: string | null | undefined): string {
  if (!v) return '';
  const [d, t = ''] = String(v).split(' ');
  const p = d.split('-');
  if (p.length !== 3) return String(v);
  return `${p[2]}-${p[1]}-${p[0]}${t ? ` ${t}` : ''}`;
}

function staffName(name: string | null | undefined, id: number) {
  return name || (id ? `Unknown staff (#${id})` : 'Unknown staff (#0)');
}

function usePoll(fn: () => void, ms: number, enabled: boolean) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') ref.current();
    }, ms);
    return () => window.clearInterval(id);
  }, [ms, enabled]);
}

const inputCls =
  'w-full text-xs bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]';
const thCls =
  'px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-white whitespace-nowrap';
const tdCls = 'px-3 py-2 text-xs text-slate-700 whitespace-nowrap';

function Table({
  head,
  children,
  empty,
}: {
  head: string[];
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead style={{ background: OLD_SURFACES.tableHeader }}>
          <tr>
            {head.map((h) => (
              <th key={h} className={thCls}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {children}
          {empty && (
            <tr>
              <td colSpan={head.length} className="px-3 py-8 text-center text-xs text-slate-500">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pager({
  page,
  limit,
  total,
  onPage,
  onLimit,
}: {
  page: number;
  limit: number;
  total: number;
  onPage: (p: number) => void;
  onLimit: (l: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = Math.min(total, page * limit);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-t border-slate-100 text-xs text-slate-600">
      <div className="flex items-center gap-1.5">
        <span>Show</span>
        <select
          aria-label="Rows per page"
          value={limit}
          onChange={(e) => onLimit(Number(e.target.value))}
          className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span>
          Showing {from}–{to} of {total}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <span className="px-2 font-semibold">
          {page} / {pages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

interface StaffOption {
  id: number;
  username: string;
  user_type: number;
}

function useStaff(scope: 'tracking' | 'session') {
  const [staff, setStaff] = useState<StaffOption[]>([]);
  useEffect(() => {
    crmFetch(`${BASE}/staff?scope=${scope}`)
      .then((d) => setStaff(d.data || []))
      .catch(() => setStaff([]));
  }, [scope]);
  return staff;
}

function Filters({
  staff,
  value,
  onApply,
}: {
  staff: StaffOption[];
  value: { user_id: string; from: string; to: string };
  onApply: (v: { user_id: string; from: string; to: string }) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
      <div className="sm:col-span-4">
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Staff</label>
        <select
          aria-label="Select Staff"
          value={draft.user_id}
          onChange={(e) => setDraft({ ...draft, user_id: e.target.value })}
          className={inputCls}
        >
          <option value="">All Staff</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.username}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-3">
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">From Date</label>
        <input
          aria-label="From Date"
          type="date"
          value={draft.from}
          onChange={(e) => setDraft({ ...draft, from: e.target.value })}
          className={inputCls}
        />
      </div>
      <div className="sm:col-span-3">
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">To Date</label>
        <input
          aria-label="To Date"
          type="date"
          value={draft.to}
          onChange={(e) => setDraft({ ...draft, to: e.target.value })}
          className={inputCls}
        />
      </div>
      <div className="sm:col-span-2 flex gap-2">
        <Button size="sm" variant="filter" className="flex-1" onClick={() => onApply(draft)}>
          Filter
        </Button>
        <Button
          size="sm"
          variant="filter"
          onClick={() => onApply({ user_id: '', from: '', to: '' })}
        >
          Reset All
        </Button>
      </div>
    </div>
  );
}

function qs(o: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => {
    if (v !== undefined && v !== '') p.set(k, String(v));
  });
  return p.toString();
}

async function exportCsv(
  path: string,
  filter: Record<string, string>,
  cols: Array<[string, string]>,
  name: string
) {
  const rows: any[] = [];
  for (let page = 1; page <= 50; page++) {
    const d = await crmFetch(`${path}?${qs({ ...filter, page, limit: 100 })}`);
    rows.push(...(d.data || []));
    if (rows.length >= d.total) break;
  }
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [
    cols.map(([, h]) => esc(h)).join(','),
    ...rows.map((r) => cols.map(([k]) => esc(r[k])).join(',')),
  ].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── Screenshot viewer ──────────────────────────────────────────────────────
function useAuthedImage(id: number | null, visible: boolean) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!id || !visible) return;
    let url: string | null = null;
    let cancelled = false;
    fetch(`${API_BASE}${BASE}/screenshots/${id}`, { headers: staffAuthHeaders() })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => {
        if (cancelled) return;
        url = URL.createObjectURL(b);
        setSrc(url);
      })
      .catch(() => !cancelled && setErr(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, visible]);
  return { src, err };
}

function Thumb({ shot, onOpen }: { shot: { id: number; taken_at: string }; onOpen: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && (setVisible(true), io.disconnect()),
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const { src, err } = useAuthedImage(shot.id, visible);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className="group text-left rounded-lg border border-slate-200 overflow-hidden bg-slate-50 hover:border-[#1E3A8A]"
      data-testid="desktrack-thumb"
    >
      <div className="aspect-video flex items-center justify-center bg-slate-100">
        {src ? (
          <img
            src={src}
            alt={`Screenshot ${dmy(shot.taken_at)}`}
            className="w-full h-full object-cover"
          />
        ) : err ? (
          <span className="text-[11px] text-red-600">Could not load</span>
        ) : (
          <ImageIcon className="w-5 h-5 text-slate-300 animate-pulse" />
        )}
      </div>
      <div className="px-2 py-1 text-[11px] text-slate-600">{dmy(shot.taken_at)}</div>
    </button>
  );
}

function LargeShot({ id }: { id: number }) {
  const { src, err } = useAuthedImage(id, true);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, [id]);
  if (err) return <div className="text-xs text-red-600 p-6">Could not load this screenshot.</div>;
  if (!src) return <div className="text-xs text-slate-400 p-6">Loading…</div>;
  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10 flex gap-1">
        <Button
          size="sm"
          variant="view"
          iconOnly
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="view"
          iconOnly
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div
        className="overflow-hidden rounded-lg bg-black/90 flex items-center justify-center max-h-[70vh]"
        onWheel={(e) => setZoom((z) => Math.min(5, Math.max(1, z + (e.deltaY < 0 ? 0.1 : -0.1))))}
        onMouseDown={(e) => (drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y })}
        onMouseUp={() => (drag.current = null)}
        onMouseLeave={() => (drag.current = null)}
        onMouseMove={(e) =>
          drag.current && setPos({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })
        }
      >
        <img
          src={src}
          alt="Screenshot"
          draggable={false}
          className="max-h-[70vh] object-contain select-none"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
            cursor: zoom > 1 ? 'grab' : 'default',
          }}
        />
      </div>
    </div>
  );
}

function ScreenshotViewer({
  loginId,
  username,
  state,
  onClose,
}: {
  loginId: number;
  username: string;
  state: string;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const [scope, setScope] = useState<'session' | 'all'>('session');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const limit = 12;
  const load = useCallback(() => {
    crmFetch(
      `${BASE}/logins/${loginId}/screenshots?${qs({ page, limit, scope: scope === 'all' ? 'all' : '' })}`
    )
      .then((d) => {
        setData(d);
        setError('');
      })
      .catch((e) => setError(e.message));
  }, [loginId, page, scope]);
  useEffect(load, [load]);
  // A live session keeps getting screenshots: refresh the first page.
  usePoll(load, LIVE_POLL_MS, state === 'live' && page === 1 && open === null);
  const shots: Array<{ id: number; taken_at: string }> = useMemo(
    () => data?.screenshots || [],
    [data]
  );
  const idx = open === null ? -1 : shots.findIndex((s) => s.id === open);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') open !== null ? setOpen(null) : onClose();
      if (open !== null && e.key === 'ArrowRight' && idx < shots.length - 1)
        setOpen(shots[idx + 1].id);
      if (open !== null && e.key === 'ArrowLeft' && idx > 0) setOpen(shots[idx - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, idx, shots, onClose]);
  const total = data?.total ?? 0;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-label="Screenshots"
    >
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[92vh] overflow-auto shadow-xl">
        <div
          className="flex items-center justify-between px-4 py-3 text-white"
          style={{ background: OLD_SURFACES.modalHeader }}
        >
          <div className="text-sm font-bold">
            Screenshots — {username}{' '}
            {data && (
              <span className="font-normal opacity-90">
                · login {dmy(data.login_time)} · {total} total
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StateBadge state={state} />
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="p-1 rounded hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <StatusPill
              tone="primary"
              label="This session"
              active={scope === 'session'}
              onClick={() => (setScope('session'), setPage(1))}
            />
            <StatusPill
              tone="dark"
              label="Everything after this login (old view)"
              active={scope === 'all'}
              onClick={() => (setScope('all'), setPage(1))}
            />
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          {open !== null ? (
            <div className="space-y-2">
              <LargeShot id={open} />
              <div className="flex items-center justify-between text-xs text-slate-600">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  disabled={idx <= 0}
                  onClick={() => setOpen(shots[idx - 1].id)}
                >
                  Newer
                </Button>
                <span>{dmy(shots[idx]?.taken_at)}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="cancel" onClick={() => setOpen(null)}>
                    Back to grid
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    disabled={idx >= shots.length - 1}
                    onClick={() => setOpen(shots[idx + 1].id)}
                  >
                    Older
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {data && !shots.length && (
                <div className="text-xs text-slate-500 py-8 text-center">
                  No screenshots found for this session
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {shots.map((s) => (
                  <Thumb key={s.id} shot={s} onOpen={() => setOpen(s.id)} />
                ))}
              </div>
              {total > limit && (
                <div className="flex items-center justify-center gap-2 text-xs">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} / {Math.ceil(total / limit)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page * limit >= total}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StateBadge({ state, title }: { state: string; title?: string }) {
  return (
    <ToneBadge tone={DESKTRACK_STATE_TONE[state] ?? 'secondary'} title={title}>
      {DESKTRACK_STATE_LABEL[state] ?? state}
    </ToneBadge>
  );
}

// ─── Tracking Report ────────────────────────────────────────────────────────
function TrackingTab() {
  const staff = useStaff('tracking');
  const [filter, setFilter] = useState({ user_id: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [res, setRes] = useState<any>({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewer, setViewer] = useState<{ id: number; name: string; state: string } | null>(null);
  const load = useCallback(() => {
    crmFetch(`${BASE}/tracking?${qs({ ...filter, page, limit })}`)
      .then((d) => (setRes(d), setError('')))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter, page, limit]);
  useEffect(load, [load]);
  usePoll(load, REPORT_POLL_MS, page === 1 && !viewer);
  return (
    <>
      <div className="p-4 border-b border-slate-100 space-y-3">
        <Filters staff={staff} value={filter} onApply={(v) => (setFilter(v), setPage(1))} />
      </div>
      <div className="px-4 pt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">
          Auto-logout = no screenshot for 30+ minutes (old rule). Refreshes every minute.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="view"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={load}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="export"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() =>
              exportCsv(
                `${BASE}/tracking`,
                filter,
                [
                  ['username', 'Name'],
                  ['login_time', 'Login Time'],
                  ['logout_time', 'Logout Time'],
                  ['state', 'Status'],
                  ['screenshot_count', 'Screenshots'],
                ],
                'desktrack-tracking'
              )
            }
          >
            Export
          </Button>
        </div>
      </div>
      {error && <div className="px-4 py-2 text-xs text-red-600">{error}</div>}
      <div className="p-4" data-testid="desktrack-tracking-table">
        <Table
          head={['Name', 'Login Time', 'Logout Time', 'Status', 'Screenshots']}
          empty={!loading && !res.data.length}
        >
          {res.data.map((r: any) => (
            <tr key={r.login_id} className="hover:bg-slate-50">
              <td className={`${tdCls} font-semibold`}>{staffName(r.username, r.user_id)}</td>
              <td className={tdCls}>{dmy(r.login_time)}</td>
              <td className={tdCls}>
                {r.logout_time ? dmy(r.logout_time) : '—'}
                {r.logout_other_day && r.state === 'logged_out' && (
                  <span className="ml-1 text-[10px] text-amber-700">(next day)</span>
                )}
              </td>
              <td className={tdCls}>
                <StateBadge state={r.state} title={`Old screen showed: ${r.old_display}`} />
              </td>
              <td className={tdCls}>
                <Button
                  size="sm"
                  variant="view"
                  disabled={!r.screenshot_count}
                  onClick={() =>
                    setViewer({
                      id: r.login_id,
                      name: staffName(r.username, r.user_id),
                      state: r.state,
                    })
                  }
                >
                  Screenshots ({r.screenshot_count})
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </div>
      <Pager
        page={page}
        limit={limit}
        total={res.total}
        onPage={setPage}
        onLimit={(l) => (setLimit(l), setPage(1))}
      />
      {viewer && (
        <ScreenshotViewer
          loginId={viewer.id}
          username={viewer.name}
          state={viewer.state}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}

// ─── Session (idle) Report ─────────────────────────────────────────────────
function SessionTab() {
  const staff = useStaff('session');
  const [filter, setFilter] = useState({ user_id: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [res, setRes] = useState<any>({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    crmFetch(`${BASE}/sessions?${qs({ ...filter, page, limit })}`)
      .then((d) => (setRes(d), setError('')))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter, page, limit]);
  useEffect(load, [load]);
  usePoll(load, REPORT_POLL_MS, page === 1);
  const cols: Array<[string, string]> = [
    ['username', 'Name'],
    ['login_time', 'Login Time'],
    ['logout_time', 'Logout Time'],
    ['lunch_time', 'Lunch Time'],
    ['meeting_time', 'Meeting Time'],
    ['outside_time', 'Outside Work Time'],
    ['idle_time', 'Idle Time'],
    ['session_duration', 'Working Time'],
  ];
  return (
    <>
      <div className="p-4 border-b border-slate-100">
        <Filters staff={staff} value={filter} onApply={(v) => (setFilter(v), setPage(1))} />
      </div>
      <div className="px-4 pt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">
          One row per staff per day: first to last screenshot. Idle = idle alerts × 5 min. Working
          Time = logout − login (as before).
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="view"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={load}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="export"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => exportCsv(`${BASE}/sessions`, filter, cols, 'desktrack-sessions')}
          >
            Export
          </Button>
        </div>
      </div>
      {error && <div className="px-4 py-2 text-xs text-red-600">{error}</div>}
      <div className="p-4" data-testid="desktrack-session-table">
        <Table head={cols.map(([, h]) => h)} empty={!loading && !res.data.length}>
          {res.data.map((r: any) => (
            <tr key={`${r.user_id}-${r.log_date}-${r.username}`} className="hover:bg-slate-50">
              <td className={`${tdCls} font-semibold`}>{staffName(r.username, r.user_id)}</td>
              <td className={tdCls}>{dmy(r.login_time)}</td>
              <td className={tdCls}>{dmy(r.logout_time)}</td>
              <td className={tdCls}>{r.lunch_time}</td>
              <td className={tdCls}>{r.meeting_time}</td>
              <td className={tdCls}>{r.outside_time}</td>
              <td className={tdCls}>
                <ToneBadge
                  tone={
                    r.idle_minutes >= 60 ? 'danger' : r.idle_minutes > 0 ? 'warning' : 'success'
                  }
                >
                  {r.idle_time}
                </ToneBadge>
              </td>
              <td className={`${tdCls} font-semibold`}>{r.session_duration}</td>
            </tr>
          ))}
        </Table>
      </div>
      <Pager
        page={page}
        limit={limit}
        total={res.total}
        onPage={setPage}
        onLimit={(l) => (setLimit(l), setPage(1))}
      />
    </>
  );
}

// ─── Live board (polled) ───────────────────────────────────────────────────
function LiveTab() {
  const [date, setDate] = useState('');
  const [res, setRes] = useState<any>({ data: [] });
  const [error, setError] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [updated, setUpdated] = useState('');
  const load = useCallback(() => {
    crmFetch(`${BASE}/live?${qs({ date })}`)
      .then((d) => {
        setRes(d);
        setError('');
        setUpdated(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
      })
      .catch((e) => setError(e.message));
  }, [date]);
  useEffect(load, [load]);
  usePoll(load, LIVE_POLL_MS, !date);
  const counts = useMemo(() => {
    const c: Record<string, number> = { live: 0, auto_logout: 0, logged_out: 0 };
    res.data.forEach((r: any) => (c[r.state] = (c[r.state] || 0) + 1));
    return c;
  }, [res]);
  const rows = res.data.filter((r: any) => !stateFilter || r.state === stateFilter);
  return (
    <>
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Day</label>
          <input
            aria-label="Day"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="flex flex-wrap gap-2" data-testid="desktrack-live-pills">
          <StatusPill
            tone="primary"
            label="All"
            count={res.data.length}
            active={!stateFilter}
            onClick={() => setStateFilter('')}
          />
          {(['live', 'auto_logout', 'logged_out'] as const).map((s) => (
            <StatusPill
              key={s}
              tone={DESKTRACK_STATE_TONE[s]}
              label={DESKTRACK_STATE_LABEL[s]}
              count={counts[s] || 0}
              active={stateFilter === s}
              onClick={() => setStateFilter(stateFilter === s ? '' : s)}
            />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
          {date ? (
            <span>End-of-day view for {dmy(date)}</span>
          ) : (
            <span>Auto-refresh every 30 s · updated {updated} IST</span>
          )}
          <Button
            size="sm"
            variant="view"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={load}
          >
            Refresh
          </Button>
          {date && (
            <Button size="sm" variant="filter" onClick={() => setDate('')}>
              Today
            </Button>
          )}
        </div>
      </div>
      {error && <div className="px-4 py-2 text-xs text-red-600">{error}</div>}
      <div className="p-4" data-testid="desktrack-live-table">
        <Table
          head={[
            'Name',
            'Status',
            'Doing now',
            'Login',
            'Last screenshot',
            'Screenshots',
            'Idle today',
            'Logout',
          ]}
          empty={!rows.length}
        >
          {rows.map((r: any) => (
            <tr key={r.user_id} className="hover:bg-slate-50">
              <td className={`${tdCls} font-semibold`}>{staffName(r.username, r.user_id)}</td>
              <td className={tdCls}>
                <StateBadge state={r.state} />
              </td>
              <td className={tdCls}>
                {r.activity ? (
                  <ToneBadge tone={DESKTRACK_ACTIVITY_TONE[r.activity] ?? 'secondary'}>
                    {r.activity}
                  </ToneBadge>
                ) : (
                  '—'
                )}
              </td>
              <td className={tdCls}>{dmy(r.login_time)}</td>
              <td className={tdCls}>
                {r.last_screenshot_time ? dmy(r.last_screenshot_time) : '—'}
              </td>
              <td className={tdCls}>{r.screenshots_today}</td>
              <td className={tdCls}>{r.idle_minutes_today} min</td>
              <td className={tdCls}>{r.logout_time ? dmy(r.logout_time) : '—'}</td>
            </tr>
          ))}
        </Table>
      </div>
    </>
  );
}

// ─── Block Website ─────────────────────────────────────────────────────────
function BlockedTab() {
  const staff = useStaff('session');
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ user_id: '', website_url: '' });
  const [edit, setEdit] = useState<{ id: number; website_url: string } | null>(null);
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    crmFetch(`${BASE}/blocked`)
      .then((d) => setRows(d.data || []))
      .catch((e) => setMsg({ tone: 'danger', text: e.message }));
  }, []);
  useEffect(load, [load]);
  const run = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      setMsg({ tone: 'success', text: ok });
      load();
      return true;
    } catch (e: any) {
      setMsg({ tone: 'danger', text: e.message });
      return false;
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select User</label>
          <select
            aria-label="Select User"
            value={form.user_id}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
            className={inputCls}
          >
            <option value="">Select staff</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.username}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-6">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Website Link
          </label>
          <input
            aria-label="Website Link"
            placeholder="www.youtube.com"
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <Button
            variant="add"
            block
            isLoading={busy}
            disabled={!form.user_id || !form.website_url.trim()}
            onClick={async () => {
              if (
                await run(
                  () =>
                    crmFetch(`${BASE}/blocked`, {
                      method: 'POST',
                      body: JSON.stringify({ ...form, user_id: Number(form.user_id) }),
                    }),
                  'Website blocked successfully'
                )
              )
                setForm({ ...form, website_url: '' });
            }}
          >
            Block
          </Button>
        </div>
      </div>
      <p className="text-[11px] text-slate-500">
        The desktop app downloads this list for each staff member
        (blocked-websites/&#123;user_id&#125;).
      </p>
      {msg && <ToneBadge tone={msg.tone}>{msg.text}</ToneBadge>}
      <Table head={['Name', 'Website', 'Added', 'Actions']} empty={!rows.length}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-slate-50">
            <td className={`${tdCls} font-semibold`}>{staffName(r.staff_name, r.user_id)}</td>
            <td className={tdCls}>
              {edit?.id === r.id ? (
                <input
                  aria-label="Edit website"
                  value={edit?.website_url ?? ''}
                  onChange={(e) => setEdit({ id: r.id, website_url: e.target.value })}
                  className={inputCls}
                />
              ) : (
                r.website_url
              )}
            </td>
            <td className={tdCls}>{dmy(r.created_at)}</td>
            <td className={`${tdCls} flex gap-1`}>
              {edit?.id === r.id ? (
                <>
                  <Button
                    size="sm"
                    variant="save"
                    onClick={async () =>
                      (await run(
                        () =>
                          crmFetch(`${BASE}/blocked/${r.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({ website_url: edit?.website_url }),
                          }),
                        'Website updated'
                      )) && setEdit(null)
                    }
                  >
                    Update
                  </Button>
                  <Button size="sm" variant="cancel" onClick={() => setEdit(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="edit"
                    onClick={() => setEdit({ id: r.id, website_url: r.website_url })}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="delete"
                    onClick={() =>
                      window.confirm(
                        `Unblock ${r.website_url} for ${staffName(r.staff_name, r.user_id)}?`
                      ) &&
                      run(
                        () => crmFetch(`${BASE}/blocked/${r.id}`, { method: 'DELETE' }),
                        'Website unblocked successfully'
                      )
                    }
                  >
                    Unblock
                  </Button>
                </>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

// ─── desktop_users (client config: idle limit + screenshot interval) ────────
function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1">{label}</label>
      <input
        aria-label={label}
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  );
}

function DesktopUsersTab() {
  const staff = useStaff('session');
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<{
    id?: number;
    user_id: string;
    username: string;
    idle_time: string;
    screenshot_time: string;
  } | null>(null);
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const load = useCallback(() => {
    crmFetch(`${BASE}/desktop-users`)
      .then((d) => setRows(d.data || []))
      .catch((e) => setMsg({ tone: 'danger', text: e.message }));
  }, []);
  useEffect(load, [load]);
  const save = async () => {
    if (!form) return;
    const body = JSON.stringify({
      ...form,
      user_id: Number(form.user_id),
      idle_time: Number(form.idle_time),
      screenshot_time: Number(form.screenshot_time),
    });
    try {
      await crmFetch(form.id ? `${BASE}/desktop-users/${form.id}` : `${BASE}/desktop-users`, {
        method: form.id ? 'PUT' : 'POST',
        body,
      });
      setMsg({
        tone: 'success',
        text: form.id ? 'Desktop settings updated' : 'Desktop user added',
      });
      setForm(null);
      load();
    } catch (e: any) {
      setMsg({ tone: 'danger', text: e.message });
    }
  };
  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500 max-w-3xl">
          The desktop app reads its idle limit and screenshot interval from here (get-idle-limit /
          get-screenshot-interval). When a staff member has more than one row, only the first one is
          used.
        </p>
        <Button
          size="sm"
          variant="add"
          onClick={() =>
            setForm({ user_id: '', username: '', idle_time: '5', screenshot_time: '5' })
          }
        >
          Add Desktop User
        </Button>
      </div>
      {msg && <ToneBadge tone={msg.tone}>{msg.text}</ToneBadge>}
      {form && (
        <div className="rounded-lg border border-slate-200 p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-slate-50">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Staff</label>
            <select
              aria-label="Staff"
              disabled={!!form.id}
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className={inputCls}
            >
              <option value="">Select staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.username}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Label (PC / name)
            </label>
            <input
              aria-label="Label"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <NumberField
              label="Idle limit"
              value={form.idle_time}
              onChange={(v) => setForm({ ...form, idle_time: v })}
            />
          </div>
          <div className="sm:col-span-2">
            <NumberField
              label="Screenshot interval"
              value={form.screenshot_time}
              onChange={(v) => setForm({ ...form, screenshot_time: v })}
            />
          </div>
          <div className="sm:col-span-1 flex gap-1">
            <Button size="sm" variant="save" onClick={save} disabled={!form.user_id}>
              Save
            </Button>
            <Button size="sm" variant="cancel" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <Table
        head={[
          '#',
          'Label',
          'Staff',
          'Idle limit',
          'Screenshot interval',
          'Used by app',
          'Actions',
        ]}
        empty={!rows.length}
      >
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-slate-50">
            <td className={tdCls}>{r.id}</td>
            <td className={`${tdCls} font-semibold`}>{r.username}</td>
            <td className={tdCls}>
              {r.staff_exists ? (
                r.staff_name
              ) : (
                <ToneBadge tone="danger">No staff #{r.user_id}</ToneBadge>
              )}
            </td>
            <td className={tdCls}>{r.idle_time}</td>
            <td className={tdCls}>{r.screenshot_time}</td>
            <td className={tdCls}>
              {r.effective ? (
                <ToneBadge tone="success">Yes</ToneBadge>
              ) : (
                <ToneBadge tone="secondary" title="Another row for this staff member comes first">
                  Duplicate
                </ToneBadge>
              )}
            </td>
            <td className={tdCls}>
              <Button
                size="sm"
                variant="edit"
                onClick={() =>
                  setForm({
                    id: r.id,
                    user_id: String(r.user_id),
                    username: r.username,
                    idle_time: String(r.idle_time),
                    screenshot_time: String(r.screenshot_time),
                  })
                }
              >
                Edit
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

// ─── Manage IPs ────────────────────────────────────────────────────────────
function IpsTab() {
  const [res, setRes] = useState<any>({ data: [] });
  const [form, setForm] = useState<{
    id?: number;
    ip_address: string;
    username: string;
    idle_time: string;
    screenshot_time: string;
  } | null>(null);
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const load = useCallback(() => {
    crmFetch(`${BASE}/ips`)
      .then(setRes)
      .catch((e) => setMsg({ tone: 'danger', text: e.message }));
  }, []);
  useEffect(load, [load]);
  const call = async (path: string, method: string, body?: any, ok = 'Saved') => {
    try {
      await crmFetch(path, { method, body: body ? JSON.stringify(body) : undefined });
      setMsg({ tone: 'success', text: ok });
      setForm(null);
      load();
    } catch (e: any) {
      setMsg({ tone: 'danger', text: e.message });
    }
  };
  if (res.tableMissing)
    return (
      <div className="p-6" data-testid="desktrack-ips-missing">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 space-y-1">
          <div className="font-bold">IP management is not switched on yet</div>
          <div>
            The old Manage IPs screen used an <code>ips</code> table that was never created in the
            live database, so it never worked on etaxwala.com either. It turns on after the add-only
            SQL file <code>2026-11-18_desktrack_ips_mysql.sql</code> is applied at go-live. Idle
            limit and screenshot interval per staff are already editable under Desktop Users.
          </div>
        </div>
      </div>
    );
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="add"
          onClick={() =>
            setForm({ ip_address: '', username: '', idle_time: '5', screenshot_time: '5' })
          }
        >
          Add IP
        </Button>
      </div>
      {msg && <ToneBadge tone={msg.tone}>{msg.text}</ToneBadge>}
      {form && (
        <div className="rounded-lg border border-slate-200 p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-slate-50">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              IP address
            </label>
            <input
              aria-label="IP address"
              value={form.ip_address}
              onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Name</label>
            <input
              aria-label="Name"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <NumberField
              label="Idle limit"
              value={form.idle_time}
              onChange={(v) => setForm({ ...form, idle_time: v })}
            />
          </div>
          <div className="sm:col-span-2">
            <NumberField
              label="Screenshot interval"
              value={form.screenshot_time}
              onChange={(v) => setForm({ ...form, screenshot_time: v })}
            />
          </div>
          <div className="sm:col-span-2 flex gap-1">
            <Button
              size="sm"
              variant="save"
              onClick={() =>
                call(
                  form.id ? `${BASE}/ips/${form.id}` : `${BASE}/ips`,
                  form.id ? 'PUT' : 'POST',
                  {
                    ...form,
                    idle_time: Number(form.idle_time),
                    screenshot_time: Number(form.screenshot_time),
                  },
                  form.id ? 'IP updated successfully' : 'IP added successfully'
                )
              }
            >
              Save
            </Button>
            <Button size="sm" variant="cancel" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <Table
        head={['Name', 'IP', 'Idle limit', 'Screenshot interval', 'Actions']}
        empty={!res.data.length}
      >
        {res.data.map((r: any) => (
          <tr key={r.id} className="hover:bg-slate-50">
            <td className={`${tdCls} font-semibold`}>{r.username}</td>
            <td className={tdCls}>{r.ip_address}</td>
            <td className={tdCls}>{r.idle_time}</td>
            <td className={tdCls}>{r.screenshot_time}</td>
            <td className={`${tdCls} flex gap-1`}>
              <Button
                size="sm"
                variant="edit"
                onClick={() =>
                  setForm({
                    id: r.id,
                    ip_address: r.ip_address,
                    username: r.username,
                    idle_time: String(r.idle_time),
                    screenshot_time: String(r.screenshot_time),
                  })
                }
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="delete"
                onClick={() =>
                  window.confirm(`Delete ${r.ip_address}?`) &&
                  call(`${BASE}/ips/${r.id}`, 'DELETE', undefined, 'IP deleted successfully')
                }
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export default function CrmDesktopTrackingPage({ defaultTab }: { defaultTab?: DesktrackTab }) {
  const location = useLocation();
  const { staffUser, activeRole } = useAuthStore();
  const allowed = hasUserPermission(
    staffUser?.permissions,
    activeRole,
    'desktop_tracking:view',
    staffUser?.roles
  );
  const tab: DesktrackTab =
    TABS.find((t) => t.path === location.pathname)?.key ?? defaultTab ?? 'tracking';
  return (
    <div className="space-y-4" data-testid="desktrack-page">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-[#1E3A8A] flex items-center gap-2">
          <Monitor className="w-5 h-5" /> Manage Desktrack
        </h1>
      </div>
      {!allowed ? (
        <div
          className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600"
          data-testid="desktrack-no-access"
        >
          Desktrack is available to Admin and Operations Manager (and Super Admin), like on the old
          CRM.
        </div>
      ) : (
        <>
          <nav className="flex flex-wrap gap-2" aria-label="Desktrack sections">
            {TABS.map((t) => (
              <Link
                key={t.key}
                to={t.path}
                className={buttonClass({
                  variant: t.key === tab ? 'primary' : 'outline',
                  size: 'sm',
                })}
                aria-current={t.key === tab ? 'page' : undefined}
              >
                {t.icon}
                <span>{t.label}</span>
              </Link>
            ))}
          </nav>
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {tab === 'tracking' && <TrackingTab />}
            {tab === 'session' && <SessionTab />}
            {tab === 'live' && <LiveTab />}
            {tab === 'blocked' && <BlockedTab />}
            {tab === 'desktop-users' && <DesktopUsersTab />}
            {tab === 'ips' && <IpsTab />}
          </div>
        </>
      )}
    </div>
  );
}
