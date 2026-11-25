/** Small shared pieces for My Profile and the HR desk (calm MNC theme). */
import React from 'react';
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DayStatus,
  STATUS_META,
  initials,
  monthLabel,
  shiftMonth,
  useStaffPhoto,
} from './hrms-api';

export const NAVY = '#1B365D';
export const inputCls =
  'w-full px-3 py-2 text-xs border border-[#E6E3DC] rounded-lg bg-[#FCFCFA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003a66]/15 disabled:opacity-60';
export const labelCls = 'block text-[11px] font-bold text-slate-600 mb-1';

export function Card({
  title,
  icon,
  actions,
  children,
  className = '',
  pad = true,
}: {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={`bg-[#FCFCFA] rounded-2xl border border-[#E6E3DC] shadow-sm ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#EFECE6]">
          <h3 className="text-[13px] font-extrabold text-[#1B365D] flex items-center gap-2">
            {icon}
            {title}
          </h3>
          {actions}
        </header>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </section>
  );
}

export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-lg font-extrabold text-[#1B365D] flex items-center gap-2">
          {icon} {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  icon,
  tone = 'slate',
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'emerald' | 'sky' | 'amber' | 'rose' | 'slate' | 'navy';
}) {
  return (
    <div className={`etx-stat-tile etx-tone-${tone} p-3.5 rounded-2xl flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <p className="text-xl font-extrabold leading-tight">{value}</p>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

export function StatusBadge({ status, small }: { status: DayStatus; small?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full font-semibold whitespace-nowrap ${m.cls} ${
        small ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-[11px]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function Avatar({
  name,
  photo,
  source,
  size = 36,
  rounded = 'rounded-full',
}: {
  name: string;
  photo?: string | null;
  source?: string | null;
  size?: number;
  rounded?: string;
}) {
  const src = useStaffPhoto(photo, source);
  return src ? (
    <img
      src={src}
      alt=""
      className={`${rounded} object-cover border border-[#E6E3DC] bg-white shrink-0`}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={`${rounded} bg-[#EEF2F7] text-[#1B365D] font-extrabold flex items-center justify-center border border-[#E1E7EF] shrink-0`}
      style={{ width: size, height: size, fontSize: Math.max(10, size / 2.8) }}
    >
      {initials(name)}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: T; label: string; icon?: React.ReactNode; count?: number }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 p-1 bg-[#F1EFEA] border border-[#E6E3DC] rounded-xl w-fit">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition ${
            value === t.key
              ? 'bg-white text-[#1B365D] shadow-sm border border-[#E6E3DC]'
              : 'text-slate-500 hover:text-[#1B365D]'
          }`}
        >
          {t.icon}
          {t.label}
          {t.count !== undefined && (
            <span className="ml-0.5 px-1.5 rounded-full bg-[#EEF2F7] text-[10px] text-[#1B365D]">
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function MonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-[#E6E3DC] rounded-full px-1 py-0.5">
      <button
        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center"
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4 text-slate-500" />
      </button>
      <span className="text-xs font-bold text-[#1B365D] min-w-[110px] text-center">
        {monthLabel(value)}
      </span>
      <button
        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center"
        onClick={() => onChange(shiftMonth(value, 1))}
        aria-label="Next month"
      >
        <ChevronRight className="w-4 h-4 text-slate-500" />
      </button>
    </div>
  );
}

export function Notice({
  tone = 'amber',
  children,
}: {
  tone?: 'amber' | 'rose' | 'sky' | 'emerald';
  children: React.ReactNode;
}) {
  const cls = {
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-800',
    sky: 'bg-sky-50 border-sky-200 text-sky-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  }[tone];
  return (
    <div className={`flex items-start gap-2 border rounded-xl px-3 py-2 text-xs ${cls}`}>
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 opacity-70" />
      <div>{children}</div>
    </div>
  );
}

export function TablesMissing({ what = 'HR features' }: { what?: string }) {
  return (
    <Notice>
      {what} will switch on once the HR tables are added to the database
      (MIGRATION-HRMS-PROFILE.sql). Your existing details are shown below.
    </Notice>
  );
}

export function Empty({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div className="py-10 flex flex-col items-center text-center text-slate-400 gap-2">
      {icon}
      <p className="text-xs">{text}</p>
    </div>
  );
}

export function Toast({
  msg,
  tone = 'emerald',
  onDone,
}: {
  msg: string;
  tone?: 'emerald' | 'rose';
  onDone: () => void;
}) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  return (
    <div
      className={`fixed bottom-5 right-5 z-[60] px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold border ${
        tone === 'emerald'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-rose-50 border-rose-200 text-rose-700'
      }`}
    >
      {msg}
    </div>
  );
}

export function useToast() {
  const [t, setT] = React.useState<{ msg: string; tone: 'emerald' | 'rose' } | null>(null);
  const node = t ? <Toast msg={t.msg} tone={t.tone} onDone={() => setT(null)} /> : null;
  return {
    node,
    ok: (msg: string) => setT({ msg, tone: 'emerald' }),
    err: (msg: string) => setT({ msg, tone: 'rose' }),
  };
}

/** Month calendar of day statuses (used on My Profile and the employee drawer). */
export function AttendanceCalendar({
  days,
  onPick,
}: {
  days: {
    date: string;
    weekday: string;
    status: DayStatus;
    holiday?: string | null;
    late_minutes?: number | null;
    check_in?: string | null;
  }[];
  onPick?: (date: string) => void;
}) {
  if (!days.length) return null;
  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const lead = order.indexOf(days[0].weekday);
  const cells: ((typeof days)[number] | null)[] = [...Array(lead).fill(null), ...days];
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {order.map((d) => (
          <div
            key={d}
            className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center"
          >
            {d.slice(0, 3)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) =>
          c ? (
            <button
              key={c.date}
              type="button"
              onClick={() => onPick?.(c.date)}
              title={`${c.date.split('-').reverse().join('-')} · ${STATUS_META[c.status].label}${c.holiday ? ` · ${c.holiday}` : ''}`}
              className={`h-14 rounded-xl border text-left px-2 py-1 flex flex-col justify-between ${STATUS_META[c.status].cls} ${
                onPick ? 'hover:ring-2 hover:ring-[#003a66]/15' : 'cursor-default'
              }`}
            >
              <span className="text-[11px] font-extrabold">{Number(c.date.slice(8))}</span>
              <span className="text-[9.5px] font-semibold truncate">
                {c.status === 'upcoming'
                  ? ''
                  : c.status === 'late'
                    ? `Late ${c.late_minutes ?? ''}m`
                    : c.status === 'holiday' && c.holiday
                      ? c.holiday
                      : STATUS_META[c.status].label}
              </span>
            </button>
          ) : (
            <div key={`x${i}`} />
          )
        )}
      </div>
    </div>
  );
}

export function Legend() {
  const keys: DayStatus[] = [
    'present',
    'late',
    'half_day',
    'wfh',
    'leave',
    'absent',
    'holiday',
    'week_off',
    'unmarked',
  ];
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {keys.map((k) => (
        <span key={k} className="inline-flex items-center gap-1 text-[10.5px] text-slate-500">
          <span className={`w-2 h-2 rounded-full ${STATUS_META[k].dot}`} />
          {STATUS_META[k].label}
        </span>
      ))}
    </div>
  );
}

/** Date field that always shows DD-MM-YYYY (the native picker opens on click). */
export function DateInput({
  value,
  onChange,
  min,
  max,
  className = '',
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const show = value ? value.split('-').reverse().join('-') : 'DD-MM-YYYY';
  return (
    <div className={`relative ${className}`}>
      <div
        className={`${inputCls} flex items-center justify-between pointer-events-none ${value ? 'text-slate-800' : 'text-slate-400'}`}
      >
        <span>{show}</span>
        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <input
        type="date"
        aria-label={ariaLabel}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => (e.currentTarget as any).showPicker?.()}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}
