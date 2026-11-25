/**
 * Client + shared types for My Profile and the HR desk (HRMS).
 * Auth header is added by lib/staff-auth-fetch for every /v1/crm call.
 */
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api-base';
export { api, download, fmtIST, todayIST, ApiError } from '../access/access-api';

export type UserSource = 'users' | 'staff_users';
export type AttendanceStatus =
  'present' | 'half_day' | 'absent' | 'leave' | 'holiday' | 'week_off' | 'wfh' | 'late';
export type DayStatus = AttendanceStatus | 'unmarked' | 'upcoming';

export interface StaffProfile {
  source: UserSource;
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role_id: number;
  role_name: string;
  role_category: string;
  active: boolean;
  employee_code: string | null;
  designation: string | null;
  department: string | null;
  work_location: string | null;
  employment_type: string | null;
  joining_date: string | null;
  shift_start: string | null;
  shift_end: string | null;
  shift_locked: boolean;
  shift_updated_at: string | null;
  late_grace_minutes: number;
  late_grace_custom: boolean;
  weekly_off_days: string[];
  photo: string | null;
  photo_source: 'new' | 'legacy' | 'url' | null;
  dob: string | null;
  gender: string | null;
  blood_group: string | null;
  personal_email: string | null;
  alt_phone: string | null;
  current_address: string | null;
  permanent_address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relation: string | null;
  emergency_contact_phone: string | null;
  about: string | null;
  id_card_status: string;
  has_hr_profile: boolean;
  updated_at: string | null;
}

export interface ShiftOption {
  start: string;
  end: string;
  label: string;
}
export interface MeResponse {
  profile: StaffProfile;
  access: { role_name: string; hr: Record<string, boolean> };
  shift: {
    office_open: string;
    office_close: string;
    hours: number;
    options: ShiftOption[];
    default_grace_minutes: number;
  };
  leave_types: { key: string; label: string }[];
  status_labels: Record<AttendanceStatus, string>;
  tables: {
    profiles: boolean;
    attendance: boolean;
    holidays: boolean;
    leaves: boolean;
    all: boolean;
  };
  today: string;
}
export interface CalendarDay {
  date: string;
  weekday: string;
  status: DayStatus;
  derived: boolean;
  holiday?: string | null;
  leave_type?: string | null;
  half_day_slot?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  late_minutes?: number | null;
  remarks?: string | null;
  marked_by?: string | null;
}
export interface MonthSummary {
  counts: Record<AttendanceStatus, number>;
  present_days: number;
  working_days_marked: number;
  attendance_rate: number | null;
  unmarked: number;
  late_days: number;
  late_minutes_total: number;
}
export interface Holiday {
  id: number;
  holiday_date: string;
  title: string;
  holiday_type: 'public' | 'company' | 'optional';
  description: string | null;
}
export interface LeaveRequest {
  id: number;
  user_source: UserSource;
  user_id: number;
  user_name: string | null;
  name?: string;
  department?: string | null;
  employee_code?: string | null;
  photo?: string | null;
  leave_type: string;
  from_date: string;
  to_date: string;
  is_half_day: boolean;
  half_day_slot: string | null;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_remark: string | null;
  created_at: string;
}
/** Days used per leave type this year (no quota / balance — none exists). */
export interface LeaveUsed {
  key: string;
  label: string;
  used: number;
}

// ─── Formatting (India) ──────────────────────────────────────────────────────
export const ddmmyyyy = (iso?: string | null) => {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : iso;
};
export const time12 = (hhmm?: string | null) => {
  if (!hhmm) return '—';
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h)) return '—';
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${
    h >= 12 ? 'pm' : 'am'
  }`;
};
export const shiftLabel = (s?: string | null, e?: string | null) =>
  s ? `${time12(s)} – ${time12(e)} IST` : 'Not selected';
export const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};
export const shiftMonth = (ym: string, n: number) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
};
export const initials = (name: string) =>
  name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

export const LEAVE_LABEL: Record<string, string> = {
  CL: 'Casual Leave',
  SL: 'Sick Leave',
  EL: 'Earned Leave',
  LWP: 'Leave Without Pay',
  COMP_OFF: 'Comp Off',
  OTHER: 'Other',
};
export const EMPLOYMENT_TYPES: Record<string, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  intern: 'Intern',
  contract: 'Contract',
  partner: 'Partner',
};
export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/** Status look: soft tint + dark text (calm MNC theme). */
export const STATUS_META: Record<
  DayStatus,
  { label: string; code: string; cls: string; dot: string }
> = {
  present: {
    label: 'Present',
    code: 'P',
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  late: {
    label: 'Late',
    code: 'LT',
    cls: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  half_day: {
    label: 'Half Day',
    code: 'HD',
    cls: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    dot: 'bg-yellow-400',
  },
  absent: {
    label: 'Absent',
    code: 'A',
    cls: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  leave: {
    label: 'Leave',
    code: 'L',
    cls: 'bg-violet-50 text-violet-700 border-violet-200',
    dot: 'bg-violet-500',
  },
  holiday: {
    label: 'Holiday',
    code: 'H',
    cls: 'bg-sky-50 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
  },
  week_off: {
    label: 'Week Off',
    code: 'WO',
    cls: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  wfh: {
    label: 'Work From Home',
    code: 'WFH',
    cls: 'bg-teal-50 text-teal-800 border-teal-200',
    dot: 'bg-teal-500',
  },
  unmarked: {
    label: 'Not marked',
    code: '–',
    cls: 'bg-white text-slate-400 border-dashed border-slate-300',
    dot: 'bg-slate-300',
  },
  upcoming: {
    label: 'Upcoming',
    code: '',
    cls: 'bg-transparent text-slate-300 border-transparent',
    dot: 'bg-transparent',
  },
};
export const MARKABLE: AttendanceStatus[] = [
  'present',
  'late',
  'half_day',
  'wfh',
  'absent',
  'leave',
  'holiday',
  'week_off',
];

// ─── Photos (streamed with the auth header, never a public URL) ─────────────
const photoCache = new Map<string, Promise<string | null>>();
export function photoUrl(name: string | null | undefined, source?: string | null) {
  if (!name) return null;
  if (source === 'url' || /^https?:\/\//.test(name)) return name;
  return `${API_BASE_URL}/v1/crm/profile/photo/${encodeURIComponent(name)}`;
}
export function useStaffPhoto(name: string | null | undefined, source?: string | null) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const url = photoUrl(name, source);
    if (!url) {
      setSrc(null);
      return;
    }
    if (source === 'url') {
      setSrc(url);
      return;
    }
    if (!photoCache.has(url)) {
      photoCache.set(
        url,
        fetch(url)
          .then((r) => (r.ok ? r.blob() : null))
          .then((b) => (b ? URL.createObjectURL(b) : null))
          .catch(() => null)
      );
    }
    photoCache.get(url)!.then((u) => live && setSrc(u));
    return () => {
      live = false;
    };
  }, [name, source]);
  return src;
}

export async function uploadPhoto(path: string, file: File): Promise<StaffProfile> {
  const fd = new FormData();
  fd.append('photo', file);
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', body: fd });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) throw new Error(data?.error || `Upload failed (${res.status})`);
  return data.data;
}
