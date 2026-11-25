/**
 * HR desk — attendance sheet. Daily sheet (mark / edit, bulk save) and monthly register
 * with CSV export. Late is worked out from each person's own shift + grace.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck2,
  CheckCheck,
  Download,
  RefreshCw,
  Save,
  Search,
  Table2,
  Users,
} from 'lucide-react';
import {
  api,
  AttendanceStatus,
  ddmmyyyy,
  DayStatus,
  download,
  MARKABLE,
  MonthSummary,
  STATUS_META,
  time12,
  todayIST,
  UserSource,
} from './hrms-api';
import {
  Avatar,
  Card,
  DateInput,
  Empty,
  inputCls,
  Legend,
  MonthPicker,
  Notice,
  PageHeader,
  StatTile,
  Tabs,
  useToast,
} from './hrms-ui';

interface Rec {
  status: AttendanceStatus;
  check_in: string | null;
  check_out: string | null;
  late_minutes: number | null;
  remarks: string | null;
  source: string;
  marked_by_name: string | null;
  half_day_slot: string | null;
}
interface Row {
  source: UserSource;
  id: number;
  name: string;
  employee_code: string | null;
  department: string | null;
  designation: string | null;
  photo: string | null;
  shift_start: string | null;
  shift_end: string | null;
  grace: number;
  record: Rec | null;
  suggested: AttendanceStatus | null;
  leave: { id: number; status: string; type: string } | null;
}
interface Edit {
  status: AttendanceStatus | '';
  check_in: string;
  check_out: string;
  remarks: string;
  half_day_slot: string;
}
const key = (r: { source: string; id: number }) => `${r.source}:${r.id}`;
const lateFor = (shift: string | null, grace: number, cin: string) => {
  if (!shift || !cin) return null;
  const m = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  return m(cin) > m(shift) + grace ? m(cin) - m(shift) : 0;
};

function DailySheet({ canManage, onChanged }: { canManage: boolean; onChanged: () => void }) {
  const [date, setDate] = useState(todayIST());
  const [dept, setDept] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [data, setData] = useState<{
    rows: Row[];
    departments: string[];
    holiday: string | null;
    weekday: string;
  } | null>(null);
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  useEffect(() => {
    const t = setTimeout(() => setQ(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const load = useCallback(() => {
    api<{ data: any }>('/v1/crm/hrms/attendance/daily', { query: { date, dept, search: q } }).then(
      (r) => {
        setData(r.data);
        setEdits({});
      }
    );
  }, [date, dept, q]);
  useEffect(load, [load]);
  const future = date > todayIST();
  const cur = (r: Row): Edit =>
    edits[key(r)] || {
      // 'late' is worked out by the server from the check-in; HR picks Present
      status: r.record?.status === 'late' ? 'present' : r.record?.status || '',
      check_in: r.record?.check_in || '',
      check_out: r.record?.check_out || '',
      remarks: r.record?.remarks || '',
      half_day_slot: r.record?.half_day_slot || 'first_half',
    };
  const setE = (r: Row, patch: Partial<Edit>) =>
    setEdits((e) => ({ ...e, [key(r)]: { ...cur(r), ...patch } }));
  const dirty = Object.entries(edits).filter(([k, e]) => {
    const r = data?.rows.find((x) => key(x) === k);
    if (!r || !e.status) return false;
    const o = r.record;
    const os = o?.status === 'late' ? 'present' : o?.status;
    return (
      !o ||
      os !== e.status ||
      (o.check_in || '') !== e.check_in ||
      (o.check_out || '') !== e.check_out ||
      (o.remarks || '') !== e.remarks
    );
  });
  const entry = (r: Row, e: Edit) => ({
    user_source: r.source,
    user_id: r.id,
    date,
    status: e.status,
    check_in: e.check_in || null,
    check_out: e.check_out || null,
    remarks: e.remarks || null,
    half_day_slot: e.status === 'half_day' ? e.half_day_slot : null,
    leave_type: e.status === 'leave' ? r.leave?.type || null : null,
  });
  const saveAll = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const entries = dirty.map(([k, e]) =>
        entry(
          data.rows.find((x) => key(x) === k)!,
          e
        )
      );
      const r = await api<{ data: { saved: number; errors: any[] } }>(
        '/v1/crm/hrms/attendance/bulk',
        { method: 'POST', body: { entries } }
      );
      if (r.data.errors.length) toast.err(`${r.data.saved} saved · ${r.data.errors[0].error}`);
      else toast.ok(`Saved attendance for ${r.data.saved} staff`);
      load();
      onChanged();
    } catch (e: any) {
      toast.err(e.message);
    } finally {
      setSaving(false);
    }
  };
  const fillUnmarked = () => {
    if (!data) return;
    const next = { ...edits };
    for (const r of data.rows) {
      if (r.record || next[key(r)]?.status) continue;
      next[key(r)] = {
        status: r.suggested || (future ? '' : 'present'),
        check_in: '',
        check_out: '',
        remarks: '',
        half_day_slot: 'first_half',
      };
    }
    setEdits(next);
  };
  const rows = useMemo(() => data?.rows || [], [data]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) {
      const s = r.record?.status || 'unmarked';
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [rows]);
  return (
    <div className="space-y-3">
      <Card pad>
        <div className="flex flex-wrap items-end gap-2">
          <label>
            <span className="block text-[11px] font-bold text-slate-600 mb-1">Date</span>
            <DateInput
              className="w-40"
              ariaLabel="Date"
              value={date}
              onChange={(v) => setDate(v || todayIST())}
            />
          </label>
          <label>
            <span className="block text-[11px] font-bold text-slate-600 mb-1">Department</span>
            <select
              className={inputCls + ' w-48'}
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            >
              <option value="">All departments</option>
              {data?.departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="flex-1 min-w-[180px]">
            <span className="block text-[11px] font-bold text-slate-600 mb-1">Search</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                className={inputCls + ' pl-8'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, employee ID, email"
              />
            </div>
          </label>
          <div className="flex gap-2 ml-auto">
            <button className="btn-outline btn-sm inline-flex items-center gap-1.5" onClick={load}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            {canManage && (
              <>
                <button
                  className="btn-outline btn-sm inline-flex items-center gap-1.5"
                  onClick={fillUnmarked}
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Fill unmarked
                </button>
                <button
                  className="btn-multicolor btn-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                  disabled={!dirty.length || saving}
                  onClick={saveAll}
                >
                  <Save className="w-3.5 h-3.5" />{' '}
                  {saving ? 'Saving…' : `Save changes${dirty.length ? ` (${dirty.length})` : ''}`}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <span className="font-bold text-[#1B365D]">
            {ddmmyyyy(date)} · {data?.weekday}
          </span>
          {data?.holiday && (
            <span className="text-sky-700 font-semibold">Holiday: {data.holiday}</span>
          )}
          {Object.entries(counts).map(([s, n]) => (
            <span key={s} className="inline-flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${STATUS_META[s as DayStatus].dot}`} />{' '}
              {STATUS_META[s as DayStatus].label} {n}
            </span>
          ))}
        </div>
      </Card>
      {future && (
        <Notice tone="sky">
          This is a future date — only Leave, Holiday or Week Off can be marked.
        </Notice>
      )}
      <Card pad={false}>
        {!rows.length ? (
          <Empty icon={<Users className="w-6 h-6" />} text="No staff match these filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#FCFCFA] z-10">
                <tr className="text-left text-[10.5px] uppercase tracking-wider text-slate-400 border-b border-[#EFECE6]">
                  <th className="px-4 py-2">Employee</th>
                  <th className="px-2 py-2">Shift (IST)</th>
                  <th className="px-2 py-2 w-40">Status</th>
                  <th className="px-2 py-2">In</th>
                  <th className="px-2 py-2">Out</th>
                  <th className="px-2 py-2">Late</th>
                  <th className="px-2 py-2">Remarks</th>
                  <th className="px-4 py-2">Marked by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const e = cur(r);
                  const changed = dirty.some(([k]) => k === key(r));
                  const timed = ['present', 'late', 'wfh', 'half_day'].includes(e.status);
                  const late = timed ? lateFor(r.shift_start, r.grace, e.check_in) : null;
                  return (
                    <tr
                      key={key(r)}
                      className={`border-b border-[#F3F1EC] last:border-0 ${changed ? 'bg-amber-50/50' : ''}`}
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.name} photo={r.photo} size={30} />
                          <div className="min-w-0">
                            <p
                              className="font-bold text-slate-800 truncate max-w-[180px]"
                              data-pii="name"
                            >
                              {r.name}
                            </p>
                            <p className="text-[10.5px] text-slate-400 truncate max-w-[180px]">
                              {r.employee_code || 'No ID'} · {r.department || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-slate-600">
                        {r.shift_start ? (
                          `${time12(r.shift_start)} – ${time12(r.shift_end)}`
                        ) : (
                          <span className="text-slate-400">Not chosen</span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {canManage ? (
                          <div className="space-y-1">
                            <select
                              className={`w-full px-2 py-1.5 rounded-lg border text-[11.5px] font-semibold ${e.status ? STATUS_META[e.status].cls : 'border-dashed border-slate-300 text-slate-400 bg-white'}`}
                              value={e.status}
                              onChange={(ev) =>
                                setE(r, { status: ev.target.value as AttendanceStatus })
                              }
                            >
                              <option value="">
                                {r.suggested
                                  ? `Not marked (${STATUS_META[r.suggested].label}?)`
                                  : 'Not marked'}
                              </option>
                              {MARKABLE.filter((s) => s !== 'late').map((s) => (
                                <option
                                  key={s}
                                  value={s}
                                  disabled={future && !['leave', 'holiday', 'week_off'].includes(s)}
                                >
                                  {STATUS_META[s].label}
                                </option>
                              ))}
                            </select>
                            {e.status === 'half_day' && (
                              <select
                                className="w-full px-2 py-1 rounded-lg border border-[#E6E3DC] text-[10.5px]"
                                value={e.half_day_slot}
                                onChange={(ev) => setE(r, { half_day_slot: ev.target.value })}
                              >
                                <option value="first_half">First half off</option>
                                <option value="second_half">Second half off</option>
                              </select>
                            )}
                            {r.leave && (
                              <p className="text-[10px] text-violet-700">
                                Leave {r.leave.status} ({r.leave.type})
                              </p>
                            )}
                          </div>
                        ) : (
                          <span
                            className={`inline-block border rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_META[r.record?.status || 'unmarked'].cls}`}
                          >
                            {STATUS_META[r.record?.status || 'unmarked'].label}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="time"
                          disabled={!canManage || !timed}
                          className="px-2 py-1 border border-[#E6E3DC] rounded-lg text-[11.5px] w-[104px] disabled:bg-slate-50 disabled:text-slate-300"
                          value={e.check_in}
                          onChange={(ev) => setE(r, { check_in: ev.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="time"
                          disabled={!canManage || !timed}
                          className="px-2 py-1 border border-[#E6E3DC] rounded-lg text-[11.5px] w-[104px] disabled:bg-slate-50 disabled:text-slate-300"
                          value={e.check_out}
                          onChange={(ev) => setE(r, { check_out: ev.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {late ? (
                          <span className="text-amber-700 font-bold">{late} min</span>
                        ) : late === 0 ? (
                          <span className="text-emerald-700">On time</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          disabled={!canManage}
                          className="px-2 py-1 border border-[#E6E3DC] rounded-lg text-[11.5px] w-full min-w-[120px] disabled:bg-transparent disabled:border-transparent"
                          value={e.remarks}
                          placeholder="—"
                          onChange={(ev) => setE(r, { remarks: ev.target.value })}
                        />
                      </td>
                      <td className="px-4 py-2 text-[10.5px] text-slate-400 whitespace-nowrap">
                        {r.record
                          ? r.record.source === 'leave_approved'
                            ? 'Approved leave'
                            : r.record.source === 'holiday'
                              ? 'Holiday calendar'
                              : r.record.marked_by_name || 'HR'
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {toast.node}
    </div>
  );
}

interface GridRow {
  source: UserSource;
  id: number;
  name: string;
  employee_code: string | null;
  department: string | null;
  shift: string | null;
  days: { date: string; status: DayStatus; derived: boolean; late: number | null }[];
  summary: MonthSummary;
}
function MonthlyRegister() {
  const [month, setMonth] = useState(todayIST().slice(0, 7));
  const [search, setSearch] = useState('');
  const [d, setD] = useState<{ dates: string[]; rows: GridRow[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  useEffect(() => {
    setD(null);
    const t = setTimeout(
      () =>
        api<{ data: any }>('/v1/crm/hrms/attendance/monthly', { query: { month, search } }).then(
          (r) => setD(r.data)
        ),
      250
    );
    return () => clearTimeout(t);
  }, [month, search]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <MonthPicker value={month} onChange={setMonth} />
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            className={inputCls + ' pl-8'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Legend />
          <button
            className="btn-multicolor btn-sm inline-flex items-center gap-1.5"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await download(
                  '/v1/crm/hrms/attendance/export',
                  { month, search },
                  `attendance-${month}.csv`
                );
              } catch (e: any) {
                toast.err(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Download className="w-3.5 h-3.5" /> {busy ? 'Preparing…' : 'Export CSV'}
          </button>
        </div>
      </div>
      <Card pad={false}>
        {!d ? (
          <Empty text="Loading register…" />
        ) : (
          <div className="overflow-x-auto">
            <table className="text-[10.5px] border-collapse">
              <thead>
                <tr className="text-slate-400">
                  <th className="sticky left-0 bg-[#FCFCFA] z-10 text-left px-3 py-2 min-w-[190px] border-b border-[#EFECE6]">
                    Employee
                  </th>
                  {d.dates.map((x) => (
                    <th
                      key={x}
                      className="px-0.5 py-2 font-bold border-b border-[#EFECE6] w-7 text-center"
                    >
                      {Number(x.slice(8))}
                    </th>
                  ))}
                  <th className="px-2 py-2 border-b border-[#EFECE6]">Present</th>
                  <th className="px-2 py-2 border-b border-[#EFECE6]">Late</th>
                  <th className="px-2 py-2 border-b border-[#EFECE6]">Leave</th>
                  <th className="px-2 py-2 border-b border-[#EFECE6]">Absent</th>
                  <th className="px-3 py-2 border-b border-[#EFECE6]">%</th>
                </tr>
              </thead>
              <tbody>
                {d.rows.map((r) => (
                  <tr key={key(r)} className="border-b border-[#F3F1EC]">
                    <td className="sticky left-0 bg-[#FCFCFA] z-10 px-3 py-1.5">
                      <p
                        className="font-bold text-slate-700 truncate max-w-[180px] text-[11px]"
                        data-pii="name"
                      >
                        {r.name}
                      </p>
                      <p className="text-slate-400">{r.employee_code || '—'}</p>
                    </td>
                    {r.days.map((x) => (
                      <td key={x.date} className="px-0.5 py-1 text-center">
                        <span
                          title={`${ddmmyyyy(x.date)} · ${STATUS_META[x.status].label}${x.late ? ` · ${x.late} min late` : ''}`}
                          className={`inline-flex w-6 h-6 items-center justify-center rounded-md border text-[9px] font-extrabold ${STATUS_META[x.status].cls} ${x.derived && x.status !== 'unmarked' ? 'opacity-70' : ''}`}
                        >
                          {STATUS_META[x.status].code}
                        </span>
                      </td>
                    ))}
                    <td className="px-2 text-center font-bold text-emerald-700">
                      {r.summary.present_days}
                    </td>
                    <td className="px-2 text-center text-amber-700">{r.summary.late_days}</td>
                    <td className="px-2 text-center text-violet-700">{r.summary.counts.leave}</td>
                    <td className="px-2 text-center text-rose-700">{r.summary.counts.absent}</td>
                    <td className="px-3 text-center font-bold text-slate-700">
                      {r.summary.attendance_rate ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {toast.node}
    </div>
  );
}

export default function HrAttendancePage() {
  const [tab, setTab] = useState<'daily' | 'monthly'>('daily');
  const [o, setO] = useState<any>(null);
  const [me, setMe] = useState<{ hr: Record<string, boolean> } | null>(null);
  const loadO = useCallback(() => {
    api<{ data: any }>('/v1/crm/hrms/overview')
      .then((r) => setO(r.data))
      .catch(() => setO(null));
  }, []);
  useEffect(() => {
    loadO();
    api<{ data: any }>('/v1/crm/profile/me').then((r) => setMe(r.data.access));
  }, [loadO]);
  const canManage = !!me?.hr['hr:attendance_manage'];
  return (
    <div className="space-y-4">
      <PageHeader
        icon={<CalendarCheck2 className="w-5 h-5" />}
        title="Attendance"
        subtitle="Mark daily attendance. Late is worked out from each person's own shift plus the grace minutes. Dates DD-MM-YYYY, times IST."
      />
      {o && !o.tables_ready && (
        <Notice>The HR tables are not added yet — attendance can be viewed but not saved.</Notice>
      )}
      {o && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
          <StatTile
            label="Staff"
            value={o.total_staff}
            tone="navy"
            sub={`${o.with_shift} have chosen a shift`}
          />
          <StatTile
            label="Present today"
            value={o.present_today}
            tone="emerald"
            sub={
              o.attendance_rate === null
                ? o.is_holiday
                  ? `Holiday: ${o.holiday}`
                  : '—'
                : `${o.attendance_rate}% of expected`
            }
          />
          <StatTile label="Late today" value={o.counts.late} tone="amber" />
          <StatTile
            label="On leave"
            value={o.counts.leave + o.counts.half_day}
            tone="sky"
            sub={`${o.counts.half_day} half day`}
          />
          <StatTile label="Absent" value={o.counts.absent} tone="rose" />
          <StatTile
            label="Not marked"
            value={o.unmarked}
            tone="slate"
            sub={`${o.pending_leaves} leave request(s) pending`}
          />
        </div>
      )}
      <Tabs
        tabs={[
          {
            key: 'daily' as const,
            label: 'Daily sheet',
            icon: <CalendarCheck2 className="w-3.5 h-3.5" />,
          },
          {
            key: 'monthly' as const,
            label: 'Monthly register',
            icon: <Table2 className="w-3.5 h-3.5" />,
          },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'daily' ? (
        <DailySheet canManage={canManage} onChanged={loadO} />
      ) : (
        <MonthlyRegister />
      )}
    </div>
  );
}
