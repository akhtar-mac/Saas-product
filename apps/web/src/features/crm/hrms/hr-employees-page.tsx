/** HR desk — employee records: official details, shift override / lock, weekly off, grace, photo. */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Contact, Lock, Save, Search, Unlock, Users } from 'lucide-react';
import {
  api,
  ddmmyyyy,
  EMPLOYMENT_TYPES,
  fmtIST,
  shiftLabel,
  StaffProfile,
  time12,
  uploadPhoto,
  WEEKDAYS,
} from './hrms-api';
import {
  Avatar,
  Card,
  DateInput,
  Empty,
  inputCls,
  labelCls,
  Notice,
  PageHeader,
  StatTile,
  useToast,
} from './hrms-ui';
import { CrmModal } from '@/components/ui/crm-modal';

const START_OPTIONS = [
  '08:30',
  '08:45',
  '09:00',
  '09:15',
  '09:30',
  '09:45',
  '10:00',
  '10:15',
  '10:30',
];
const plus9 = (s: string) => {
  const m = Number(s.slice(0, 2)) * 60 + Number(s.slice(3)) + 540;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

function EditEmployee({
  row,
  onClose,
  onSaved,
  onPhoto,
}: {
  row: StaffProfile;
  onClose: () => void;
  onSaved: (p: StaffProfile) => void;
  onPhoto: (p: StaffProfile) => void;
}) {
  const [f, setF] = useState(() => ({
    employee_code: row.employee_code || '',
    designation: row.designation || '',
    department: row.department || '',
    work_location: row.work_location || '',
    employment_type: row.employment_type || '',
    joining_date: row.joining_date || '',
    shift_start: row.shift_start || '',
    shift_locked: row.shift_locked,
    late_grace_minutes: row.late_grace_custom ? String(row.late_grace_minutes) : '',
    weekly_off_days: row.weekly_off_days,
    id_card_status: row.id_card_status || 'active',
  }));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [p, setP] = useState(row);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });
  const save = async () => {
    setBusy(true);
    setErr('');
    try {
      const body = {
        ...f,
        employment_type: f.employment_type || null,
        joining_date: f.joining_date || null,
        shift_start: f.shift_start || null,
        late_grace_minutes: f.late_grace_minutes === '' ? null : Number(f.late_grace_minutes),
      };
      const r = await api<{ data: StaffProfile }>(
        `/v1/crm/hrms/employees/${row.source}/${row.id}`,
        { method: 'PATCH', body }
      );
      onSaved(r.data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <CrmModal
      isOpen
      onClose={onClose}
      title={`Edit employee · ${row.name}`}
      description={`${row.role_name} · ${row.email || ''}`}
      icon={<Contact className="w-4 h-4" />}
      size="lg"
    >
      <div className="p-5 grid md:grid-cols-[170px_1fr] gap-5">
        <div className="flex flex-col items-center gap-2">
          <Avatar
            name={p.name}
            photo={p.photo}
            source={p.photo_source}
            size={120}
            rounded="rounded-2xl"
          />
          <button
            className="btn-outline btn-sm inline-flex items-center gap-1.5"
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="w-3.5 h-3.5" /> Change photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              try {
                const np = await uploadPhoto(
                  `/v1/crm/hrms/employees/${row.source}/${row.id}/photo`,
                  file
                );
                setP(np);
                onPhoto(np);
                toast.ok('Photo updated');
              } catch (er: any) {
                toast.err(er.message);
              }
            }}
          />
          <p className="text-[10px] text-slate-400 text-center">JPG, PNG or WEBP · up to 2 MB</p>
          <div className="w-full mt-2 text-[10.5px] text-slate-500 space-y-0.5">
            <p>Joined: {ddmmyyyy(row.joining_date)}</p>
            <p>Updated: {row.updated_at ? fmtIST(row.updated_at) : '—'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={labelCls}>Employee ID</span>
              <input
                className={inputCls}
                value={f.employee_code}
                onChange={set('employee_code')}
                placeholder="e.g. DV-0042"
              />
            </label>
            <label>
              <span className={labelCls}>Designation</span>
              <input className={inputCls} value={f.designation} onChange={set('designation')} />
            </label>
            <label>
              <span className={labelCls}>Department</span>
              <input className={inputCls} value={f.department} onChange={set('department')} />
            </label>
            <label>
              <span className={labelCls}>Work location</span>
              <input
                className={inputCls}
                value={f.work_location}
                onChange={set('work_location')}
                placeholder="e.g. Pune HQ"
              />
            </label>
            <label>
              <span className={labelCls}>Employment type</span>
              <select
                className={inputCls}
                value={f.employment_type}
                onChange={set('employment_type')}
              >
                <option value="">—</option>
                {Object.entries(EMPLOYMENT_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelCls}>Joining date</span>
              <DateInput
                ariaLabel="Joining date"
                value={f.joining_date}
                onChange={(v) => setF({ ...f, joining_date: v })}
              />
            </label>
          </div>
          <div className="rounded-xl border border-[#E6E3DC] bg-[#F7F6F2] p-3 space-y-3">
            <p className="text-[11px] font-extrabold text-[#1B365D]">Shift & attendance rules</p>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={labelCls}>Shift (9 hours, IST)</span>
                <select className={inputCls} value={f.shift_start} onChange={set('shift_start')}>
                  <option value="">Not selected</option>
                  {START_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {time12(s)} – {time12(plus9(s))}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelCls}>Late after (grace minutes)</span>
                <input
                  type="number"
                  min={0}
                  max={120}
                  className={inputCls}
                  value={f.late_grace_minutes}
                  onChange={set('late_grace_minutes')}
                  placeholder="Company default (15)"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => setF({ ...f, shift_locked: !f.shift_locked })}
              className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left ${
                f.shift_locked ? 'border-amber-300 bg-amber-50' : 'border-[#E6E3DC] bg-white'
              }`}
            >
              <span className="text-xs">
                <b className="text-slate-800">
                  {f.shift_locked ? 'Shift locked by HR' : 'Employee can change own shift'}
                </b>
                <span className="block text-[10.5px] text-slate-500">
                  {f.shift_locked
                    ? 'The employee sees “Fixed by HR” and cannot change it.'
                    : 'Lock it to stop the employee changing it.'}
                </span>
              </span>
              {f.shift_locked ? (
                <Lock className="w-4 h-4 text-amber-700" />
              ) : (
                <Unlock className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <div>
              <span className={labelCls}>Weekly off</span>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((d) => {
                  const on = f.weekly_off_days.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        setF({
                          ...f,
                          weekly_off_days: on
                            ? f.weekly_off_days.filter((x) => x !== d)
                            : [...f.weekly_off_days, d].slice(-3),
                        })
                      }
                      className={`etx-filter-pill py-1 px-3 text-[11.5px] ${on ? 'is-selected' : ''}`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <label className="block w-1/2">
            <span className={labelCls}>ID card status</span>
            <select className={inputCls} value={f.id_card_status} onChange={set('id_card_status')}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="exited">Exited</option>
            </select>
          </label>
          {err && <p className="text-xs text-rose-600">{err}</p>}
          <div className="flex justify-end gap-2">
            <button className="btn-outline btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-multicolor btn-sm inline-flex items-center gap-1.5"
              disabled={busy}
              onClick={save}
            >
              <Save className="w-3.5 h-3.5" /> {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
          <p className="text-[10.5px] text-slate-400">
            Every change is recorded in Activity Logs with the old and new values.
          </p>
        </div>
      </div>
      {toast.node}
    </CrmModal>
  );
}

export default function HrEmployeesPage() {
  const [rows, setRows] = useState<StaffProfile[] | null>(null);
  const [ready, setReady] = useState(true);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('');
  const [edit, setEdit] = useState<StaffProfile | null>(null);
  const toast = useToast();
  useEffect(() => {
    const t = setTimeout(() => setQ(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const load = useCallback(() => {
    api<{ data: StaffProfile[]; tables_ready: boolean }>('/v1/crm/hrms/employees', {
      query: { search: q },
    }).then((r) => {
      setRows(r.data);
      setReady(r.tables_ready);
    });
  }, [q]);
  useEffect(load, [load]);
  const depts = [...new Set((rows || []).map((r) => r.department || 'Other'))].sort();
  const list = (rows || []).filter((r) => !dept || (r.department || 'Other') === dept);
  return (
    <div className="space-y-4">
      <PageHeader
        icon={<Users className="w-5 h-5" />}
        title="Employees"
        subtitle="Official details, shifts and ID cards. Staff update their own personal details on My Profile."
      />
      {!ready && (
        <Notice>The HR tables are not added yet — records can be viewed but not edited.</Notice>
      )}
      {rows && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <StatTile label="Active staff" value={rows.length} tone="navy" />
          <StatTile
            label="Shift chosen"
            value={rows.filter((r) => r.shift_start).length}
            tone="emerald"
            sub={`${rows.filter((r) => r.shift_locked).length} locked by HR`}
          />
          <StatTile
            label="Employee ID set"
            value={rows.filter((r) => r.employee_code).length}
            tone="sky"
          />
          <StatTile label="With photo" value={rows.filter((r) => r.photo).length} tone="slate" />
        </div>
      )}
      <Card pad={false}>
        <div className="p-3 flex flex-wrap gap-2 border-b border-[#EFECE6]">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              className={inputCls + ' pl-8'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, employee ID, email"
            />
          </div>
          <select
            className={inputCls + ' w-52'}
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="">All departments</option>
            {depts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        {!rows ? (
          <Empty text="Loading…" />
        ) : !list.length ? (
          <Empty icon={<Users className="w-6 h-6" />} text="No staff match." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-wider text-slate-400 border-b border-[#EFECE6]">
                  <th className="px-4 py-2">Employee</th>
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Designation · Dept</th>
                  <th className="px-2 py-2">Role</th>
                  <th className="px-2 py-2">Shift</th>
                  <th className="px-2 py-2">Joined</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr
                    key={`${r.source}:${r.id}`}
                    className="border-b border-[#F3F1EC] last:border-0"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.name} photo={r.photo} source={r.photo_source} size={32} />
                        <div className="min-w-0">
                          <p
                            className="font-bold text-slate-800 truncate max-w-[200px]"
                            data-pii="name"
                          >
                            {r.name}
                          </p>
                          <p
                            className="text-[10.5px] text-slate-400 truncate max-w-[200px]"
                            data-pii="email"
                          >
                            {r.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 font-semibold text-slate-600">
                      {r.employee_code || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-2 py-2 text-slate-600">
                      {r.designation || '—'}
                      <div className="text-[10.5px] text-slate-400">{r.department}</div>
                    </td>
                    <td className="px-2 py-2 text-slate-600">{r.role_name}</td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {r.shift_start ? (
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          {shiftLabel(r.shift_start, r.shift_end).replace(' IST', '')}
                          {r.shift_locked && <Lock className="w-3 h-3 text-amber-600" />}
                        </span>
                      ) : (
                        <span className="text-slate-300">Not chosen</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-slate-600 whitespace-nowrap">
                      {ddmmyyyy(r.joining_date)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="btn-outline btn-sm"
                        disabled={!ready}
                        onClick={() => setEdit(r)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {edit && (
        <EditEmployee
          row={edit}
          onClose={() => setEdit(null)}
          onPhoto={(p) =>
            setRows((rs) =>
              rs ? rs.map((x) => (x.source === p.source && x.id === p.id ? p : x)) : rs
            )
          }
          onSaved={(p) => {
            setRows((rs) =>
              rs ? rs.map((x) => (x.source === p.source && x.id === p.id ? p : x)) : rs
            );
            setEdit(null);
            toast.ok(`Saved ${p.name}`);
          }}
        />
      )}
      {toast.node}
    </div>
  );
}
