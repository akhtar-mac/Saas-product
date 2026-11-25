/**
 * Pure HRMS rules (no database): shifts, late minutes, leave day counting,
 * monthly summary and input validation. Kept separate so it is unit-tested.
 *
 * All dates are IST calendar dates as 'YYYY-MM-DD'; times are 'HH:MM' (IST).
 */
import { z } from 'zod';

// ─── Shifts ──────────────────────────────────────────────────────────────────
/** Office window 08:30–19:30 IST. A shift is 9 hours including lunch. */
export const OFFICE_OPEN = '08:30';
export const OFFICE_CLOSE = '19:30';
export const SHIFT_HOURS = 9;
export const SHIFT_STEP_MINUTES = 15;
export const DEFAULT_LATE_GRACE_MINUTES = (() => {
  const n = Number(process.env.HR_LATE_GRACE_MINUTES);
  return Number.isFinite(n) && n >= 0 && n <= 120 ? Math.round(n) : 15;
})();

export const toMinutes = (hhmm: string): number => {
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(String(hhmm || '').trim());
  if (!m) return NaN;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h > 23 || mm > 59) return NaN;
  return h * 60 + mm;
};
export const fromMinutes = (n: number): string =>
  `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

/** Allowed start times: 08:30, 08:45 … 10:30 (end = start + 9h ≤ 19:30). */
export function shiftStartOptions(): string[] {
  const out: string[] = [];
  const last = toMinutes(OFFICE_CLOSE) - SHIFT_HOURS * 60;
  for (let t = toMinutes(OFFICE_OPEN); t <= last; t += SHIFT_STEP_MINUTES) out.push(fromMinutes(t));
  return out;
}

export function shiftEndFor(start: string): string {
  return fromMinutes(toMinutes(start) + SHIFT_HOURS * 60);
}

export function isValidShiftStart(start: string): boolean {
  return shiftStartOptions().includes(normTime(start) || '');
}

/** '9:30' / '09:30:00' -> '09:30'; invalid -> null */
export function normTime(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null;
  const n = toMinutes(String(v));
  return Number.isNaN(n) ? null : fromMinutes(n);
}

/** 12-hour label for a 'HH:MM' time: '09:30' -> '09:30 am' */
export function time12(hhmm: string | null | undefined): string {
  if (!hhmm) return '—';
  const n = toMinutes(hhmm);
  if (Number.isNaN(n)) return '—';
  const h = Math.floor(n / 60);
  const m = n % 60;
  const ap = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`;
}

/**
 * Minutes late = check-in after (own shift start + grace). Grace is a cut-off,
 * not a deduction: 09:30 shift, 15 min grace, in at 09:50 -> 20 min late.
 * No shift chosen or no check-in -> null (cannot tell).
 */
export function lateMinutes(
  shiftStart: string | null | undefined,
  checkIn: string | null | undefined,
  graceMinutes: number = DEFAULT_LATE_GRACE_MINUTES
): number | null {
  if (!shiftStart || !checkIn) return null;
  const s = toMinutes(shiftStart);
  const c = toMinutes(checkIn);
  if (Number.isNaN(s) || Number.isNaN(c)) return null;
  if (c <= s + graceMinutes) return 0;
  return c - s;
}

// ─── Statuses ────────────────────────────────────────────────────────────────
export const ATTENDANCE_STATUSES = [
  'present',
  'half_day',
  'absent',
  'leave',
  'holiday',
  'week_off',
  'wfh',
  'late',
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'Present',
  half_day: 'Half Day',
  absent: 'Absent',
  leave: 'Leave',
  holiday: 'Holiday',
  week_off: 'Week Off',
  wfh: 'Work From Home',
  late: 'Late',
};
export const STATUS_CODE: Record<AttendanceStatus, string> = {
  present: 'P',
  half_day: 'HD',
  absent: 'A',
  leave: 'L',
  holiday: 'H',
  week_off: 'WO',
  wfh: 'WFH',
  late: 'LATE',
};

export const LEAVE_TYPES = [
  { key: 'CL', label: 'Casual Leave' },
  { key: 'SL', label: 'Sick Leave' },
  { key: 'EL', label: 'Earned Leave' },
  { key: 'LWP', label: 'Leave Without Pay' },
  { key: 'COMP_OFF', label: 'Comp Off' },
  { key: 'OTHER', label: 'Other' },
] as const;
export const LEAVE_TYPE_KEYS = LEAVE_TYPES.map((l) => l.key) as string[];

/**
 * Yearly leave quota used for the "balance" display. Proposal only (owner to
 * confirm); override with HR_LEAVE_QUOTAS="CL:12,SL:6,EL:15". Types not listed
 * show "used" only, no balance.
 */
export function leaveQuotas(): Record<string, number> {
  const raw = process.env.HR_LEAVE_QUOTAS ?? 'CL:12,SL:6';
  const out: Record<string, number> = {};
  for (const part of raw.split(',')) {
    const [k, v] = part.split(':').map((s) => s.trim().toUpperCase());
    const n = Number(v);
    if (k && LEAVE_TYPE_KEYS.includes(k) && Number.isFinite(n) && n >= 0) out[k] = n;
  }
  return out;
}

/**
 * When HR saves a mark: a 'present' with a late check-in becomes 'late';
 * a 'late' that turns out on time becomes 'present'. Other statuses unchanged.
 */
export function resolveStatus(
  status: AttendanceStatus,
  late: number | null
): { status: AttendanceStatus; late_minutes: number | null } {
  if ((status === 'present' || status === 'late') && late !== null) {
    return { status: late > 0 ? 'late' : 'present', late_minutes: late };
  }
  if (status === 'wfh' && late !== null) return { status, late_minutes: late };
  return { status, late_minutes: status === 'late' ? late : null };
}

// ─── Dates ───────────────────────────────────────────────────────────────────
export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const isISODate = (s: unknown): s is string =>
  typeof s === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s + 'T00:00:00Z')) &&
  new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s;

export function todayIST(now: Date = new Date()): string {
  return new Date(now.getTime() + 330 * 60000).toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(iso: string): string {
  return WEEKDAYS[new Date(iso + 'T00:00:00Z').getUTCDay()];
}

export function eachDate(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to && out.length < 400; d = addDays(d, 1)) out.push(d);
  return out;
}

/** 'YYYY-MM' -> first and last day */
export function monthRange(month: string): { from: string; to: string } | null {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const [y, m] = month.split('-').map(Number);
  if (m < 1 || m > 12 || y < 2000 || y > 2100) return null;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` };
}

/** 'YYYY-MM-DD' -> 'DD-MM-YYYY' */
export function ddmmyyyy(iso: string | null | undefined): string {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : String(iso);
}

export function parseWeeklyOffs(v: string | null | undefined): string[] {
  if (!v) return ['Sunday'];
  const out = v
    .split(',')
    .map((s) => s.trim())
    .map((s) => WEEKDAYS.find((w) => w.toLowerCase() === s.toLowerCase()))
    .filter(Boolean) as string[];
  return out.length ? [...new Set(out)] : ['Sunday'];
}

/** Working days in a leave request (week offs and holidays do not count). */
export function countLeaveDays(
  from: string,
  to: string,
  opts: { halfDay?: boolean; weeklyOffs?: string[]; holidays?: Set<string> } = {}
): { days: number; dates: string[] } {
  const offs = opts.weeklyOffs ?? ['Sunday'];
  const hol = opts.holidays ?? new Set<string>();
  const dates = eachDate(from, to).filter((d) => !offs.includes(weekdayOf(d)) && !hol.has(d));
  if (opts.halfDay) return { days: dates.length ? 0.5 : 0, dates };
  return { days: dates.length, dates };
}

// ─── Monthly summary ─────────────────────────────────────────────────────────
export interface DayRecord {
  date: string;
  status: AttendanceStatus;
}

/**
 * Present-equivalent days = present + late + wfh + 0.5 × half day.
 * Rate = present-equivalent / working days marked (excludes holiday/week off).
 */
export function summarize(records: DayRecord[]) {
  const c: Record<AttendanceStatus, number> = {
    present: 0,
    half_day: 0,
    absent: 0,
    leave: 0,
    holiday: 0,
    week_off: 0,
    wfh: 0,
    late: 0,
  };
  for (const r of records) if (r.status in c) c[r.status] += 1;
  const presentEq = c.present + c.late + c.wfh + c.half_day * 0.5;
  const working = c.present + c.late + c.wfh + c.half_day + c.absent + c.leave;
  return {
    counts: c,
    present_days: presentEq,
    working_days_marked: working,
    attendance_rate: working ? Math.round((presentEq / working) * 1000) / 10 : null,
  };
}

// ─── Validation ──────────────────────────────────────────────────────────────
const timeStr = z
  .union([z.string(), z.null()])
  .optional()
  .refine((v) => v === undefined || v === null || v === '' || normTime(v) !== null, {
    message: 'Time must be HH:MM',
  });

export const markSchema = z.object({
  user_source: z.enum(['users', 'staff_users']),
  user_id: z.coerce.number().int().positive(),
  date: z.string().refine(isISODate, 'Date must be YYYY-MM-DD'),
  status: z.enum(ATTENDANCE_STATUSES),
  leave_type: z
    .union([z.string(), z.null()])
    .optional()
    .refine((v) => !v || LEAVE_TYPE_KEYS.includes(v), 'Unknown leave type'),
  half_day_slot: z.union([z.enum(['first_half', 'second_half']), z.null()]).optional(),
  check_in: timeStr,
  check_out: timeStr,
  remarks: z.union([z.string().max(500), z.null()]).optional(),
});
export type MarkInput = z.infer<typeof markSchema>;

export const bulkMarkSchema = z.object({
  entries: z.array(markSchema).min(1).max(300),
});

export const leaveApplySchema = z
  .object({
    leave_type: z.string().refine((v) => LEAVE_TYPE_KEYS.includes(v), 'Pick a leave type'),
    from_date: z.string().refine(isISODate, 'From date must be YYYY-MM-DD'),
    to_date: z.string().refine(isISODate, 'To date must be YYYY-MM-DD'),
    is_half_day: z.boolean().optional().default(false),
    half_day_slot: z.union([z.enum(['first_half', 'second_half']), z.null()]).optional(),
    reason: z.string().trim().min(3, 'Please write a short reason').max(1000),
  })
  .refine((v) => v.to_date >= v.from_date, {
    message: 'To date cannot be before from date',
    path: ['to_date'],
  })
  .refine((v) => !v.is_half_day || v.from_date === v.to_date, {
    message: 'A half day must be a single date',
    path: ['is_half_day'],
  })
  .refine((v) => !v.is_half_day || !!v.half_day_slot, {
    message: 'Pick first half or second half',
    path: ['half_day_slot'],
  })
  .refine((v) => eachDate(v.from_date, v.to_date).length <= 60, {
    message: 'One request can cover at most 60 days',
    path: ['to_date'],
  });

export const holidaySchema = z.object({
  holiday_date: z.string().refine(isISODate, 'Date must be YYYY-MM-DD'),
  title: z.string().trim().min(2).max(150),
  holiday_type: z.enum(['public', 'company', 'optional']).default('public'),
  description: z.union([z.string().max(500), z.null()]).optional(),
});

const optStr = (max: number) => z.union([z.string().trim().max(max), z.null()]).optional();
const optDate = z
  .union([z.string(), z.null()])
  .optional()
  .refine((v) => !v || isISODate(v), 'Date must be YYYY-MM-DD');

/** Fields a staff member may change on their own profile. */
export const selfProfileSchema = z.object({
  dob: optDate,
  gender: optStr(20),
  blood_group: optStr(10),
  personal_email: z.union([z.string().trim().email().max(150), z.literal(''), z.null()]).optional(),
  alt_phone: z
    .union([
      z
        .string()
        .trim()
        .regex(/^[+\d][\d\s-]{6,18}$/, 'Phone looks wrong'),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  current_address: optStr(500),
  permanent_address: optStr(500),
  emergency_contact_name: optStr(120),
  emergency_contact_relation: optStr(60),
  emergency_contact_phone: z
    .union([
      z
        .string()
        .trim()
        .regex(/^[+\d][\d\s-]{6,18}$/, 'Phone looks wrong'),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  about: optStr(2000),
});
export const SELF_FIELDS = Object.keys(selfProfileSchema.shape);

/** Extra fields only HR / Admin may change. */
export const hrProfileSchema = selfProfileSchema.extend({
  employee_code: z
    .union([
      z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9-]{2,30}$/, 'Letters, digits and - only'),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  designation: optStr(120),
  department: optStr(100),
  work_location: optStr(120),
  employment_type: z
    .union([z.enum(['full_time', 'part_time', 'intern', 'contract', 'partner']), z.null()])
    .optional(),
  joining_date: optDate,
  shift_start: z
    .union([z.string(), z.null()])
    .optional()
    .refine((v) => !v || isValidShiftStart(v), 'Shift must start between 08:30 and 10:30'),
  shift_locked: z.boolean().optional(),
  late_grace_minutes: z.union([z.coerce.number().int().min(0).max(120), z.null()]).optional(),
  weekly_off_days: z
    .union([z.array(z.enum(WEEKDAYS as [string, ...string[]])).max(3), z.null()])
    .optional(),
  id_card_status: z.enum(['active', 'suspended', 'exited']).optional(),
});
