/**
 * My Profile — every staff member: digital ID card, own details (photo, personal &
 * emergency), own 9-hour shift, own attendance, leave requests and the holiday list.
 * Dates DD-MM-YYYY, times IST.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  CalendarCheck2,
  CalendarDays,
  Camera,
  Clock3,
  Contact as IdCard,
  Lock,
  Mail,
  Phone,
  Plane,
  Save,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  api,
  CalendarDay,
  ddmmyyyy,
  fmtIST,
  Holiday,
  LeaveUsed,
  LeaveRequest,
  LEAVE_LABEL,
  MeResponse,
  MonthSummary,
  shiftLabel,
  StaffProfile,
  time12,
  todayIST,
  uploadPhoto,
  EMPLOYMENT_TYPES,
} from './hrms-api';
import {
  AttendanceCalendar,
  Avatar,
  Card,
  Empty,
  inputCls,
  labelCls,
  Legend,
  MonthPicker,
  Notice,
  PageHeader,
  StatTile,
  StatusBadge,
  TablesMissing,
  Tabs,
  DateInput,
  useToast,
} from './hrms-ui';
import { CrmModal } from '@/components/ui/crm-modal';

type TabKey = 'card' | 'attendance' | 'leave' | 'holidays';

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <dt className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
    <dd className="text-[12.5px] font-semibold text-slate-800 mt-0.5 break-words">
      {value || '—'}
    </dd>
  </div>
);

// ─── ID card ─────────────────────────────────────────────────────────────────
function IdCardView({
  p,
  onPhoto,
  canEdit,
}: {
  p: StaffProfile;
  onPhoto: (f: File) => void;
  canEdit: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const status = p.id_card_status || 'active';
  return (
    <div className="w-full max-w-[320px] mx-auto rounded-[22px] overflow-hidden border border-[#E1DDD3] bg-white shadow-[0_10px_30px_-12px_rgba(0,58,102,0.25)]">
      <div className="h-1 bg-multicolor" />
      <div className="bg-[#003a66] px-4 pt-3 pb-12 text-white relative">
        <div className="flex items-center justify-between">
          <div className="bg-white/95 rounded-md px-2 py-1">
            <img src="/logo_black.png" alt="ETaxwala" className="h-5 w-auto" />
          </div>
          <span className="text-[9.5px] font-bold tracking-[0.18em] uppercase text-white/80">
            Staff ID
          </span>
        </div>
      </div>
      <div className="-mt-10 flex flex-col items-center px-5 pb-5">
        <div className="relative">
          <div className="p-1 bg-white rounded-2xl shadow">
            <Avatar
              name={p.name}
              photo={p.photo}
              source={p.photo_source}
              size={92}
              rounded="rounded-xl"
            />
          </div>
          {canEdit && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-white border border-[#E6E3DC] shadow flex items-center justify-center text-[#1B365D] hover:bg-slate-50"
                title="Change photo (JPG, PNG or WEBP, up to 2 MB)"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPhoto(f);
                  e.target.value = '';
                }}
              />
            </>
          )}
        </div>
        <h2
          className="mt-3 text-[17px] font-extrabold text-[#1B365D] text-center leading-tight"
          data-pii="name"
        >
          {p.name}
        </h2>
        <p className="text-[12px] font-semibold text-slate-600 text-center">
          {p.designation || p.role_name}
        </p>
        <p className="text-[11px] text-slate-400 text-center">{p.department || '—'}</p>
        <div className="mt-3 w-full grid grid-cols-2 gap-x-3 gap-y-2.5 bg-[#F7F6F2] border border-[#EFECE6] rounded-xl p-3">
          <Field label="Employee ID" value={p.employee_code || 'Not assigned'} />
          <Field label="Joined" value={ddmmyyyy(p.joining_date)} />
          <Field
            label="Shift (IST)"
            value={
              p.shift_start ? `${time12(p.shift_start)} – ${time12(p.shift_end)}` : 'Not selected'
            }
          />
          <Field label="Blood group" value={p.blood_group} />
        </div>
        <div className="mt-3 w-full space-y-1 text-[11.5px] text-slate-600">
          <div className="flex items-center gap-2 truncate" data-pii="email">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> {p.email || '—'}
          </div>
          <div className="flex items-center gap-2" data-pii="phone">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.phone || '—'}
          </div>
        </div>
        <div className="mt-3 w-full flex items-center justify-between border-t border-dashed border-[#E6E3DC] pt-2.5">
          <span
            className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
              status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <BadgeCheck className="w-3 h-3" />{' '}
            {status === 'active'
              ? 'Active employee'
              : status === 'suspended'
                ? 'Suspended'
                : 'Exited'}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">{p.role_name}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Shift picker ────────────────────────────────────────────────────────────
function ShiftPicker({ me, onSaved }: { me: MeResponse; onSaved: (p: StaffProfile) => void }) {
  const p = me.profile;
  const [pick, setPick] = useState(p.shift_start || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => setPick(p.shift_start || ''), [p.shift_start]);
  const locked = p.shift_locked;
  const disabled = locked || !me.tables.profiles;
  const save = async () => {
    setSaving(true);
    setErr('');
    try {
      const r = await api<{ data: StaffProfile }>('/v1/crm/profile/me/shift', {
        method: 'PUT',
        body: { shift_start: pick },
      });
      onSaved(r.data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Card
      title="My working shift"
      icon={<Clock3 className="w-4 h-4" />}
      actions={
        locked ? (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> Fixed by HR
          </span>
        ) : null
      }
    >
      <p className="text-[11.5px] text-slate-500 mb-3">
        Office hours are {time12(me.shift.office_open)} – {time12(me.shift.office_close)} IST.
        Choose a {me.shift.hours}-hour shift (lunch included). You are marked late after your start
        time + {p.late_grace_minutes} minutes.
      </p>
      <div
        className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-1.5"
        role="radiogroup"
      >
        {me.shift.options.map((o) => {
          const sel = pick === o.start;
          return (
            <button
              key={o.start}
              type="button"
              role="radio"
              aria-checked={sel}
              disabled={disabled}
              onClick={() => setPick(o.start)}
              className={`rounded-xl border px-2 py-2 text-left transition disabled:cursor-not-allowed ${
                sel
                  ? 'border-[#003a66] bg-[#EEF3F8] ring-2 ring-[#003a66]/15'
                  : 'border-[#E6E3DC] bg-white hover:border-[#003a66]/40'
              } ${disabled && !sel ? 'opacity-50' : ''}`}
            >
              <div className="text-[12px] font-extrabold text-[#1B365D]">{time12(o.start)}</div>
              <div className="text-[10.5px] text-slate-500">to {time12(o.end)}</div>
            </button>
          );
        })}
      </div>
      {err && <p className="text-[11.5px] text-rose-600 mt-2">{err}</p>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">
          Current: <b className="text-slate-700">{shiftLabel(p.shift_start, p.shift_end)}</b>
          {p.shift_updated_at && <> · changed {fmtIST(p.shift_updated_at)}</>}
        </p>
        {!locked && (
          <button
            className="btn-multicolor btn-sm inline-flex items-center gap-1.5 disabled:opacity-50"
            disabled={saving || !pick || pick === p.shift_start || disabled}
            onClick={save}
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save shift'}
          </button>
        )}
      </div>
      {locked && (
        <p className="text-[11px] text-amber-800 mt-2">
          HR has fixed your shift. Please ask HR if you need a change.
        </p>
      )}
    </Card>
  );
}

// ─── Personal details ────────────────────────────────────────────────────────
const SELF: {
  key: keyof StaffProfile;
  label: string;
  type?: string;
  wide?: boolean;
  options?: string[];
}[] = [
  { key: 'dob', label: 'Date of birth', type: 'date' },
  { key: 'gender', label: 'Gender', options: ['', 'Female', 'Male', 'Other', 'Prefer not to say'] },
  {
    key: 'blood_group',
    label: 'Blood group',
    options: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  { key: 'personal_email', label: 'Personal email', type: 'email' },
  { key: 'alt_phone', label: 'Alternate phone', type: 'tel' },
  { key: 'current_address', label: 'Current address', wide: true },
  { key: 'permanent_address', label: 'Permanent address', wide: true },
  { key: 'emergency_contact_name', label: 'Emergency contact name' },
  { key: 'emergency_contact_relation', label: 'Relation' },
  { key: 'emergency_contact_phone', label: 'Emergency phone', type: 'tel' },
  { key: 'about', label: 'About me', wide: true },
];

function DetailsCard({ me, onSaved }: { me: MeResponse; onSaved: (p: StaffProfile) => void }) {
  const p = me.profile;
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const open = () => {
    setF(Object.fromEntries(SELF.map((s) => [s.key, (p[s.key] as string) || ''])));
    setErr('');
    setEdit(true);
  };
  const save = async () => {
    setSaving(true);
    setErr('');
    try {
      const r = await api<{ data: StaffProfile }>('/v1/crm/profile/me', {
        method: 'PATCH',
        body: f,
      });
      onSaved(r.data);
      setEdit(false);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <Card
        title="Official details"
        icon={<ShieldCheck className="w-4 h-4" />}
        actions={<span className="text-[10.5px] text-slate-400">Updated by HR</span>}
      >
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
          <Field label="Employee ID" value={p.employee_code} />
          <Field label="Designation" value={p.designation} />
          <Field label="Department" value={p.department} />
          <Field label="Role" value={p.role_name} />
          <Field
            label="Employment"
            value={p.employment_type ? EMPLOYMENT_TYPES[p.employment_type] : null}
          />
          <Field label="Joining date" value={ddmmyyyy(p.joining_date)} />
          <Field label="Work location" value={p.work_location} />
          <Field label="Weekly off" value={p.weekly_off_days.join(', ')} />
          <Field label="Late after" value={`${p.late_grace_minutes} min grace`} />
        </dl>
      </Card>
      <Card
        title="Personal & emergency"
        icon={<UserRound className="w-4 h-4" />}
        actions={
          me.tables.profiles ? (
            <button className="btn-outline btn-sm" onClick={open}>
              Edit
            </button>
          ) : null
        }
      >
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
          {SELF.map((s) => (
            <div key={s.key} className={s.wide ? 'col-span-2 md:col-span-3' : ''}>
              <Field
                label={s.label}
                value={s.type === 'date' ? ddmmyyyy(p[s.key] as string) : (p[s.key] as string)}
              />
            </div>
          ))}
        </dl>
      </Card>
      <CrmModal
        isOpen={edit}
        onClose={() => setEdit(false)}
        title="Edit my details"
        icon={<UserRound className="w-4 h-4" />}
        size="lg"
      >
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SELF.map((s) => (
            <label key={s.key} className={s.wide ? 'sm:col-span-2' : ''}>
              <span className={labelCls}>{s.label}</span>
              {s.options ? (
                <select
                  className={inputCls}
                  value={f[s.key] || ''}
                  onChange={(e) => setF({ ...f, [s.key]: e.target.value })}
                >
                  {s.options.map((o) => (
                    <option key={o} value={o}>
                      {o || '—'}
                    </option>
                  ))}
                </select>
              ) : s.type === 'date' ? (
                <DateInput value={f[s.key] || ''} onChange={(v) => setF({ ...f, [s.key]: v })} />
              ) : s.wide ? (
                <textarea
                  rows={2}
                  className={inputCls}
                  value={f[s.key] || ''}
                  onChange={(e) => setF({ ...f, [s.key]: e.target.value })}
                />
              ) : (
                <input
                  type={s.type || 'text'}
                  className={inputCls}
                  value={f[s.key] || ''}
                  onChange={(e) => setF({ ...f, [s.key]: e.target.value })}
                />
              )}
            </label>
          ))}
          {err && <p className="sm:col-span-2 text-xs text-rose-600">{err}</p>}
          <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
            <button className="btn-outline btn-sm" onClick={() => setEdit(false)}>
              Cancel
            </button>
            <button
              className="btn-multicolor btn-sm inline-flex items-center gap-1.5"
              disabled={saving}
              onClick={save}
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </CrmModal>
    </>
  );
}

// ─── My attendance ───────────────────────────────────────────────────────────
function MyAttendance({ me }: { me: MeResponse }) {
  const [month, setMonth] = useState(todayIST().slice(0, 7));
  const [d, setD] = useState<{
    days: CalendarDay[];
    summary: MonthSummary;
    tables_ready: boolean;
    holidays: Holiday[];
  } | null>(null);
  const [err, setErr] = useState('');
  const [pick, setPick] = useState<string | null>(null);
  useEffect(() => {
    setErr('');
    api<{ data: any }>('/v1/crm/profile/me/attendance', { query: { month } })
      .then((r) => setD(r.data))
      .catch((e) => setErr(e.message));
  }, [month]);
  const day = d?.days.find((x) => x.date === pick);
  const s = d?.summary;
  return (
    <div className="space-y-4">
      {!me.tables.attendance && <TablesMissing what="Attendance" />}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MonthPicker value={month} onChange={setMonth} />
        <p className="text-[11px] text-slate-500">
          Shift:{' '}
          <b className="text-slate-700">
            {shiftLabel(me.profile.shift_start, me.profile.shift_end)}
          </b>{' '}
          · HR marks attendance
        </p>
      </div>
      {err && <Notice tone="rose">{err}</Notice>}
      {s && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
          <StatTile
            label="Present days"
            value={s.present_days}
            tone="emerald"
            sub={`${s.counts.present} on time · ${s.counts.wfh} WFH`}
          />
          <StatTile
            label="Late"
            value={s.late_days}
            tone="amber"
            sub={s.late_minutes_total ? `${s.late_minutes_total} min in total` : 'No late marks'}
          />
          <StatTile label="Half days" value={s.counts.half_day} tone="sky" />
          <StatTile label="Leave" value={s.counts.leave} tone="navy" />
          <StatTile label="Absent" value={s.counts.absent} tone="rose" />
          <StatTile
            label="Attendance"
            value={s.attendance_rate === null ? '—' : `${s.attendance_rate}%`}
            tone="slate"
            sub={`${s.unmarked} day(s) not marked yet`}
          />
        </div>
      )}
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <Card title="Month view" icon={<CalendarCheck2 className="w-4 h-4" />} actions={<Legend />}>
          {d ? <AttendanceCalendar days={d.days} onPick={setPick} /> : <Empty text="Loading…" />}
        </Card>
        <Card
          title={pick ? ddmmyyyy(pick) : 'Day details'}
          icon={<CalendarDays className="w-4 h-4" />}
        >
          {day ? (
            <dl className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{day.weekday}</span>
                <StatusBadge status={day.status} />
              </div>
              {day.holiday && <Field label="Holiday" value={day.holiday} />}
              {(day.check_in || day.check_out) && (
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Check-in" value={`${time12(day.check_in)} IST`} />
                  <Field
                    label="Check-out"
                    value={day.check_out ? `${time12(day.check_out)} IST` : '—'}
                  />
                </div>
              )}
              {day.status === 'late' && (
                <Field label="Late by" value={`${day.late_minutes} minutes`} />
              )}
              {day.leave_type && (
                <Field label="Leave type" value={LEAVE_LABEL[day.leave_type] || day.leave_type} />
              )}
              {day.half_day_slot && (
                <Field
                  label="Half"
                  value={day.half_day_slot === 'first_half' ? 'First half' : 'Second half'}
                />
              )}
              {day.remarks && <Field label="Remarks" value={day.remarks} />}
              {day.marked_by && <Field label="Marked by" value={day.marked_by} />}
              {day.derived && day.status === 'unmarked' && (
                <p className="text-[11px] text-slate-400">HR has not marked this day yet.</p>
              )}
            </dl>
          ) : (
            <Empty icon={<CalendarDays className="w-6 h-6" />} text="Tap a day to see details." />
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Leave ───────────────────────────────────────────────────────────────────
const LEAVE_TONE: Record<LeaveRequest['status'], string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};
export const LeaveStatus = ({ s }: { s: LeaveRequest['status'] }) => (
  <span
    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border capitalize ${LEAVE_TONE[s]}`}
  >
    {s}
  </span>
);

function LeaveTab({ me, toast }: { me: MeResponse; toast: ReturnType<typeof useToast> }) {
  const [d, setD] = useState<{
    requests: LeaveRequest[];
    used_by_type: LeaveUsed[];
    year: number;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const blank = {
    leave_type: 'CL',
    from_date: todayIST(1),
    to_date: todayIST(1),
    is_half_day: false,
    half_day_slot: 'first_half',
    reason: '',
  };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const load = useCallback(() => {
    api<{ data: any }>('/v1/crm/profile/me/leaves').then((r) => setD(r.data));
  }, []);
  useEffect(load, [load]);
  const submit = async () => {
    setSaving(true);
    setErr('');
    try {
      await api('/v1/crm/profile/me/leaves', {
        method: 'POST',
        body: {
          ...f,
          to_date: f.is_half_day ? f.from_date : f.to_date,
          half_day_slot: f.is_half_day ? f.half_day_slot : null,
        },
      });
      setOpen(false);
      setF(blank);
      toast.ok('Leave request sent to HR');
      load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };
  const cancel = async (id: number) => {
    try {
      await api(`/v1/crm/profile/me/leaves/${id}/cancel`, { method: 'POST' });
      toast.ok('Leave request cancelled');
      load();
    } catch (e: any) {
      toast.err(e.message);
    }
  };
  return (
    <div className="space-y-4">
      {!me.tables.leaves && <TablesMissing what="Leave requests" />}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Apply for leave here. HR approves it and it shows on your attendance automatically.
        </p>
        <button
          className="btn-multicolor btn-sm inline-flex items-center gap-1.5"
          disabled={!me.tables.leaves}
          onClick={() => {
            setErr('');
            setOpen(true);
          }}
        >
          <Plane className="w-3.5 h-3.5" /> Apply for leave
        </button>
      </div>
      {d && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {d.used_by_type.map((b) => (
            <StatTile
              key={b.key}
              label={b.label}
              tone={b.key === 'CL' ? 'navy' : b.key === 'SL' ? 'sky' : 'slate'}
              value={b.used}
              sub={`day(s) used in ${d.year}`}
            />
          ))}
        </div>
      )}
      <Card title="My leave requests" icon={<Plane className="w-4 h-4" />} pad={false}>
        {!d?.requests.length ? (
          <Empty icon={<Plane className="w-6 h-6" />} text="No leave requests yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-wider text-slate-400 border-b border-[#EFECE6]">
                  <th className="px-4 py-2">Type</th>
                  <th className="px-2 py-2">Dates</th>
                  <th className="px-2 py-2">Days</th>
                  <th className="px-2 py-2">Reason</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">HR remark</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {d.requests.map((l) => (
                  <tr key={l.id} className="border-b border-[#F3F1EC] last:border-0 align-top">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">
                      {LEAVE_LABEL[l.leave_type] || l.leave_type}
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap">
                      {ddmmyyyy(l.from_date)}
                      {l.to_date !== l.from_date && <> – {ddmmyyyy(l.to_date)}</>}
                      {l.is_half_day && (
                        <div className="text-[10.5px] text-slate-400">
                          {l.half_day_slot === 'first_half' ? 'First half' : 'Second half'}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2.5">{l.total_days}</td>
                    <td className="px-2 py-2.5 max-w-[220px] text-slate-600">{l.reason}</td>
                    <td className="px-2 py-2.5">
                      <LeaveStatus s={l.status} />
                    </td>
                    <td className="px-2 py-2.5 text-slate-500 max-w-[200px]">
                      {l.review_remark || '—'}
                      {l.reviewed_at && (
                        <div className="text-[10px] text-slate-400">
                          {l.reviewed_by_name} · {fmtIST(l.reviewed_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {l.status === 'pending' && (
                        <button className="btn-outline btn-sm" onClick={() => cancel(l.id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <CrmModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Apply for leave"
        description="HR will review your request."
        icon={<Plane className="w-4 h-4" />}
        size="md"
      >
        <div className="p-5 space-y-3">
          <label className="block">
            <span className={labelCls}>Leave type</span>
            <select
              className={inputCls}
              value={f.leave_type}
              onChange={(e) => setF({ ...f, leave_type: e.target.value })}
            >
              {me.leave_types.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-1.5">
            {[
              [false, 'Full day(s)'],
              [true, 'Half day'],
            ].map(([v, l]) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setF({ ...f, is_half_day: v as boolean })}
                className={`etx-filter-pill py-1 px-3 text-[11.5px] ${f.is_half_day === v ? 'is-selected' : ''}`}
              >
                {l as string}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={labelCls}>{f.is_half_day ? 'Date' : 'From'}</span>
              <DateInput
                ariaLabel="From date"
                value={f.from_date}
                onChange={(v) =>
                  setF({ ...f, from_date: v, to_date: v > f.to_date ? v : f.to_date })
                }
              />
            </label>
            {f.is_half_day ? (
              <label>
                <span className={labelCls}>Which half</span>
                <select
                  className={inputCls}
                  value={f.half_day_slot}
                  onChange={(e) => setF({ ...f, half_day_slot: e.target.value })}
                >
                  <option value="first_half">First half</option>
                  <option value="second_half">Second half</option>
                </select>
              </label>
            ) : (
              <label>
                <span className={labelCls}>To</span>
                <DateInput
                  ariaLabel="To date"
                  value={f.to_date}
                  min={f.from_date}
                  onChange={(v) => setF({ ...f, to_date: v })}
                />
              </label>
            )}
          </div>
          <label className="block">
            <span className={labelCls}>Reason</span>
            <textarea
              rows={3}
              className={inputCls}
              value={f.reason}
              placeholder="A short reason for HR"
              onChange={(e) => setF({ ...f, reason: e.target.value })}
            />
          </label>
          <p className="text-[10.5px] text-slate-400">
            Week offs and holidays inside the dates are not counted.
          </p>
          {err && <p className="text-xs text-rose-600">{err}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button className="btn-outline btn-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-multicolor btn-sm inline-flex items-center gap-1.5"
              disabled={saving}
              onClick={submit}
            >
              <Send className="w-3.5 h-3.5" /> {saving ? 'Sending…' : 'Send to HR'}
            </button>
          </div>
        </div>
      </CrmModal>
    </div>
  );
}

// ─── Holidays ────────────────────────────────────────────────────────────────
export function HolidayList({ items }: { items: Holiday[] }) {
  const today = todayIST();
  if (!items.length)
    return (
      <Empty
        icon={<CalendarDays className="w-6 h-6" />}
        text="No holidays added for this year yet."
      />
    );
  return (
    <ul className="divide-y divide-[#F3F1EC]">
      {items.map((h) => {
        const past = h.holiday_date < today;
        const d = new Date(h.holiday_date + 'T00:00:00Z');
        return (
          <li
            key={h.id}
            className={`flex items-center gap-3 px-4 py-2.5 ${past ? 'opacity-55' : ''}`}
          >
            <div className="w-12 text-center rounded-xl border border-[#E6E3DC] bg-white py-1">
              <div className="text-[9.5px] font-bold uppercase text-rose-600">
                {d.toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' })}
              </div>
              <div className="text-base font-extrabold text-[#1B365D] leading-none">
                {d.getUTCDate()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold text-slate-800 truncate">{h.title}</p>
              <p className="text-[11px] text-slate-500">
                {ddmmyyyy(h.holiday_date)} ·{' '}
                {d.toLocaleString('en-IN', { weekday: 'long', timeZone: 'UTC' })}
                {h.description ? ` · ${h.description}` : ''}
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {h.holiday_type}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function HolidaysTab() {
  const [year, setYear] = useState(Number(todayIST().slice(0, 4)));
  const [items, setItems] = useState<Holiday[]>([]);
  useEffect(() => {
    api<{ data: Holiday[] }>('/v1/crm/profile/holidays', { query: { year } }).then((r) =>
      setItems(r.data)
    );
  }, [year]);
  return (
    <Card
      title={`Holiday calendar ${year}`}
      icon={<CalendarDays className="w-4 h-4" />}
      pad={false}
      actions={
        <div className="flex gap-1">
          {[year - 1, year, year + 1].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`etx-filter-pill py-1 px-3 text-[11.5px] ${y === year ? 'is-selected' : ''}`}
            >
              {y}
            </button>
          ))}
        </div>
      }
    >
      <HolidayList items={items} />
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function MyProfilePage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState<TabKey>(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    return (['card', 'attendance', 'leave', 'holidays'].includes(t || '') ? t : 'card') as TabKey;
  });
  const toast = useToast();
  const load = useCallback(() => {
    api<{ data: MeResponse }>('/v1/crm/profile/me')
      .then((r) => setMe(r.data))
      .catch((e) => setErr(e.message));
  }, []);
  useEffect(load, [load]);
  const setProfile = (p: StaffProfile, msg?: string) => {
    setMe((m) => (m ? { ...m, profile: p } : m));
    if (msg) toast.ok(msg);
  };
  const onPhoto = async (f: File) => {
    if (f.size > 2 * 1024 * 1024) return toast.err('Photo is larger than 2 MB.');
    try {
      setProfile(await uploadPhoto('/v1/crm/profile/me/photo', f), 'Photo updated');
    } catch (e: any) {
      toast.err(e.message);
    }
  };
  const tabs = useMemo(
    () => [
      {
        key: 'card' as const,
        label: 'ID Card & Details',
        icon: <IdCard className="w-3.5 h-3.5" />,
      },
      {
        key: 'attendance' as const,
        label: 'My Attendance',
        icon: <CalendarCheck2 className="w-3.5 h-3.5" />,
      },
      { key: 'leave' as const, label: 'Leave', icon: <Plane className="w-3.5 h-3.5" /> },
      {
        key: 'holidays' as const,
        label: 'Holidays',
        icon: <CalendarDays className="w-3.5 h-3.5" />,
      },
    ],
    []
  );
  if (err) return <Notice tone="rose">{err}</Notice>;
  if (!me) return <Empty text="Loading your profile…" />;
  const p = me.profile;
  return (
    <div className="space-y-4">
      <PageHeader
        icon={<UserRound className="w-5 h-5" />}
        title="My Profile"
        subtitle={
          <>
            Your ID card, details, shift, attendance and leave. Dates are DD-MM-YYYY, times India
            time (IST).
          </>
        }
      />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'card' && (
        <div className="grid lg:grid-cols-[340px_1fr] gap-4 items-start">
          <div className="space-y-3">
            <IdCardView p={p} onPhoto={onPhoto} canEdit={me.tables.profiles} />
            <p className="text-[10.5px] text-slate-400 text-center">
              Photo: JPG, PNG or WEBP, up to 2 MB.
            </p>
          </div>
          <div className="space-y-4">
            {!me.tables.profiles && <TablesMissing what="Editing your profile and shift" />}
            <ShiftPicker me={me} onSaved={(np) => setProfile(np, 'Shift saved')} />
            <DetailsCard me={me} onSaved={(np) => setProfile(np, 'Details saved')} />
          </div>
        </div>
      )}
      {tab === 'attendance' && <MyAttendance me={me} />}
      {tab === 'leave' && <LeaveTab me={me} toast={toast} />}
      {tab === 'holidays' && <HolidaysTab />}
      {toast.node}
    </div>
  );
}
