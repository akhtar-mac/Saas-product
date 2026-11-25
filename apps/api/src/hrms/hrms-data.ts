/**
 * HRMS data access (raw SQL against the shared MariaDB).
 *
 * Staff are keyed by (user_source, user_id) like the RBAC tables. A staff_users
 * account whose email also exists in the old `users` table is the same person:
 * `canonical()` maps it to ('users', users.id), matching the Users & Access list.
 *
 * Every function checks that its add-only table exists (MIGRATION-HRMS-PROFILE.sql)
 * and falls back to old data / empty results when it does not.
 */
import { prisma } from '../config/db.js';
import { hasTable } from '../rbac/schema-features.js';
import { ROLE_BY_ID, USER_TYPE_TO_ROLE } from '../rbac/catalog.js';
import type { UserSource } from '../rbac/rbac.service.js';
import {
  AttendanceStatus,
  DEFAULT_LATE_GRACE_MINUTES,
  parseWeeklyOffs,
  shiftEndFor,
} from './hrms-core.js';

export const HRMS_TABLES = [
  'staff_profiles',
  'hr_attendance_records',
  'hr_holidays',
  'hr_leave_requests',
] as const;

export async function hrmsTables() {
  const [profiles, attendance, holidays, leaves] = await Promise.all(
    HRMS_TABLES.map((t) => hasTable(t))
  );
  return {
    profiles,
    attendance,
    holidays,
    leaves,
    all: profiles && attendance && holidays && leaves,
  };
}

const n = (v: any) =>
  typeof v === 'bigint' ? Number(v) : v === null || v === undefined ? v : Number(v);
const s = (v: any) => (v === null || v === undefined ? null : String(v));

export interface Principal {
  source: UserSource;
  id: number;
}
export const pkey = (p: Principal) => `${p.source}:${p.id}`;

export async function canonical(p: Principal): Promise<Principal> {
  if (p.source === 'users') return p;
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT u.id FROM users u JOIN staff_users s ON LOWER(u.email) = LOWER(s.email)
       WHERE s.id = ? ORDER BY u.status DESC, u.id ASC LIMIT 1`,
      p.id
    );
    if (rows[0]) return { source: 'users', id: n(rows[0].id) };
  } catch {
    /* keep as is */
  }
  return p;
}

// ─── Staff directory ─────────────────────────────────────────────────────────
export interface StaffRow {
  source: UserSource;
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role_id: number;
  role_name: string;
  role_category: string;
  active: boolean;
  /** merged: staff_profiles over old profile / staff_users */
  employee_code: string | null;
  designation: string | null;
  department: string | null;
  work_location: string | null;
  employment_type: string | null;
  joining_date: string | null;
  reporting_manager_source: string | null;
  reporting_manager_id: number | null;
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

const PROFILE_COLS = `sp.user_source, sp.user_id, sp.employee_code, sp.profile_photo, sp.designation,
  sp.department, sp.work_location, sp.employment_type, DATE_FORMAT(sp.joining_date,'%Y-%m-%d') joining_date,
  sp.reporting_manager_source, sp.reporting_manager_id,
  TIME_FORMAT(sp.shift_start,'%H:%i') shift_start, TIME_FORMAT(sp.shift_end,'%H:%i') shift_end,
  sp.shift_locked, DATE_FORMAT(sp.shift_updated_at,'%Y-%m-%dT%H:%i:%sZ') shift_updated_at,
  sp.late_grace_minutes, sp.weekly_off_days, DATE_FORMAT(sp.dob,'%Y-%m-%d') dob, sp.gender,
  sp.blood_group, sp.personal_email, sp.alt_phone, sp.current_address, sp.permanent_address,
  sp.emergency_contact_name, sp.emergency_contact_relation, sp.emergency_contact_phone, sp.about,
  sp.id_card_status, DATE_FORMAT(sp.updated_at,'%Y-%m-%dT%H:%i:%sZ') updated_at`;

function photoOf(
  newPhoto: any,
  legacyPhoto: any
): { photo: string | null; src: StaffRow['photo_source'] } {
  if (newPhoto) return { photo: String(newPhoto), src: 'new' };
  const lp = legacyPhoto ? String(legacyPhoto).trim() : '';
  if (!lp) return { photo: null, src: null };
  if (/^https?:\/\//i.test(lp)) return { photo: lp, src: 'url' };
  const base = lp.split(/[\\/]/).pop() || '';
  return base ? { photo: base, src: 'legacy' } : { photo: null, src: null };
}

/**
 * All staff (active by default), or only the listed principals.
 * Old `users` rows first; staff_users rows whose email is in `users` are skipped.
 */
export async function loadStaff(
  opts: { only?: Principal[]; includeInactive?: boolean } = {}
): Promise<StaffRow[]> {
  const t = await hrmsTables();
  const onlyUsers = opts.only?.filter((p) => p.source === 'users').map((p) => p.id);
  const onlyStaff = opts.only?.filter((p) => p.source === 'staff_users').map((p) => p.id);
  const inList = (ids: number[] | undefined, col: string) =>
    ids === undefined
      ? ''
      : ids.length
        ? ` AND ${col} IN (${ids.map(() => '?').join(',')})`
        : ' AND 1=0';

  const legacy: any[] = await prisma.$queryRawUnsafe(
    `SELECT u.id, u.username AS name, u.email, u.contact AS phone, u.user_type, u.status,
            p.profile_photo AS l_photo, p.position AS l_position, DATE_FORMAT(p.dob,'%Y-%m-%d') AS l_dob,
            p.address AS l_address, p.about AS l_about
       FROM users u
       LEFT JOIN (SELECT user_id, MAX(id) AS id FROM profile GROUP BY user_id) pm ON pm.user_id = u.id
       LEFT JOIN profile p ON p.id = pm.id
      WHERE 1=1 ${opts.includeInactive ? '' : 'AND u.status = 1'} ${inList(onlyUsers, 'u.id')}
      ORDER BY u.username ASC LIMIT 3000`,
    ...(onlyUsers || [])
  );
  const staff: any[] = await prisma.$queryRawUnsafe(
    `SELECT s.id, s.name, s.email, s.phone, s.role_id, s.is_active, s.profile_photo AS l_photo,
            s.position AS l_position, s.department AS l_department
       FROM staff_users s
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(s.email))
        ${opts.includeInactive ? '' : 'AND s.is_active = 1'} ${inList(onlyStaff, 's.id')}
      ORDER BY s.name ASC LIMIT 3000`,
    ...(onlyStaff || [])
  );

  const profiles = new Map<string, any>();
  if (t.profiles) {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT ${PROFILE_COLS} FROM staff_profiles sp`
    );
    for (const r of rows) profiles.set(`${r.user_source}:${n(r.user_id)}`, r);
  }
  const roleOverride = new Map<string, number>();
  if (await hasTable('rbac_user_access')) {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT user_source, user_id, role_id FROM rbac_user_access`
    );
    for (const r of rows) roleOverride.set(`${r.user_source}:${n(r.user_id)}`, n(r.role_id));
  }

  const build = (source: UserSource, r: any, baseRole: number, active: boolean): StaffRow => {
    const key = `${source}:${n(r.id)}`;
    const sp = profiles.get(key);
    const roleId = roleOverride.get(key) || baseRole || 16;
    const role = ROLE_BY_ID.get(roleId) || ROLE_BY_ID.get(16)!;
    const ph = photoOf(sp?.profile_photo, r.l_photo);
    const grace = sp?.late_grace_minutes;
    return {
      source,
      id: n(r.id),
      name: String(r.name || '').trim() || `Staff #${n(r.id)}`,
      email: s(r.email),
      phone: s(r.phone),
      role_id: roleId,
      role_name: role.name,
      role_category: role.category,
      active,
      employee_code: s(sp?.employee_code),
      designation: s(sp?.designation) || s(r.l_position),
      department: s(sp?.department) || s(r.l_department) || role.category,
      work_location: s(sp?.work_location),
      employment_type: s(sp?.employment_type),
      joining_date: s(sp?.joining_date),
      reporting_manager_source: s(sp?.reporting_manager_source),
      reporting_manager_id: sp?.reporting_manager_id ? n(sp.reporting_manager_id) : null,
      shift_start: s(sp?.shift_start),
      shift_end: sp?.shift_start ? s(sp?.shift_end) || shiftEndFor(sp.shift_start) : null,
      shift_locked: Boolean(n(sp?.shift_locked)),
      shift_updated_at: s(sp?.shift_updated_at),
      late_grace_minutes:
        grace === null || grace === undefined ? DEFAULT_LATE_GRACE_MINUTES : n(grace),
      late_grace_custom: !(grace === null || grace === undefined),
      weekly_off_days: parseWeeklyOffs(sp?.weekly_off_days),
      photo: ph.photo,
      photo_source: ph.src,
      dob: s(sp?.dob) || s(r.l_dob),
      gender: s(sp?.gender),
      blood_group: s(sp?.blood_group),
      personal_email: s(sp?.personal_email),
      alt_phone: s(sp?.alt_phone),
      current_address: s(sp?.current_address) || s(r.l_address),
      permanent_address: s(sp?.permanent_address),
      emergency_contact_name: s(sp?.emergency_contact_name),
      emergency_contact_relation: s(sp?.emergency_contact_relation),
      emergency_contact_phone: s(sp?.emergency_contact_phone),
      about: s(sp?.about) || s(r.l_about),
      id_card_status: s(sp?.id_card_status) || 'active',
      has_hr_profile: !!sp,
      updated_at: s(sp?.updated_at),
    };
  };

  return [
    ...legacy.map((r) =>
      build('users', r, USER_TYPE_TO_ROLE[n(r.user_type)] ?? 16, n(r.status) === 1)
    ),
    ...staff.map((r) => build('staff_users', r, n(r.role_id), Boolean(n(r.is_active)))),
  ];
}

export async function loadOne(p: Principal): Promise<StaffRow | null> {
  const rows = await loadStaff({ only: [p], includeInactive: true });
  return rows[0] || null;
}

/** Which staff_profiles columns a caller may write (others are ignored). */
export const PROFILE_WRITABLE = new Set([
  'employee_code',
  'profile_photo',
  'designation',
  'department',
  'work_location',
  'employment_type',
  'joining_date',
  'reporting_manager_source',
  'reporting_manager_id',
  'shift_start',
  'shift_end',
  'shift_locked',
  'shift_updated_at',
  'shift_updated_by_source',
  'shift_updated_by_id',
  'late_grace_minutes',
  'weekly_off_days',
  'dob',
  'gender',
  'blood_group',
  'personal_email',
  'alt_phone',
  'current_address',
  'permanent_address',
  'emergency_contact_name',
  'emergency_contact_relation',
  'emergency_contact_phone',
  'about',
  'id_card_status',
  'updated_by_source',
  'updated_by_id',
]);

/** Insert-or-update one staff_profiles row with the given column values. */
export async function upsertProfile(p: Principal, values: Record<string, unknown>) {
  const cols = Object.keys(values).filter((k) => PROFILE_WRITABLE.has(k));
  if (!cols.length) return;
  const vals = cols.map((c) => (values[c] === '' ? null : values[c]));
  await prisma.$executeRawUnsafe(
    `INSERT INTO staff_profiles (user_source, user_id, ${cols.map((c) => `\`${c}\``).join(', ')})
     VALUES (?, ?, ${cols.map(() => '?').join(', ')})
     ON DUPLICATE KEY UPDATE ${cols.map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(', ')}`,
    p.source,
    p.id,
    ...vals
  );
}

// ─── Holidays ────────────────────────────────────────────────────────────────
export interface HolidayRow {
  id: number;
  holiday_date: string;
  title: string;
  holiday_type: string;
  description: string | null;
}

export async function holidaysBetween(from: string, to: string): Promise<HolidayRow[]> {
  if (!(await hasTable('hr_holidays'))) return [];
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, DATE_FORMAT(holiday_date,'%Y-%m-%d') holiday_date, title, holiday_type, description
       FROM hr_holidays WHERE is_active = 1 AND holiday_date BETWEEN ? AND ? ORDER BY holiday_date, id`,
    from,
    to
  );
  return rows.map((r) => ({
    id: n(r.id),
    holiday_date: String(r.holiday_date),
    title: String(r.title),
    holiday_type: String(r.holiday_type),
    description: s(r.description),
  }));
}

// ─── Attendance ──────────────────────────────────────────────────────────────
export interface AttendanceRow {
  user_source: UserSource;
  user_id: number;
  date: string;
  status: AttendanceStatus;
  leave_type: string | null;
  half_day_slot: string | null;
  check_in: string | null;
  check_out: string | null;
  late_minutes: number | null;
  remarks: string | null;
  source: string;
  leave_request_id: number | null;
  marked_by_name: string | null;
  updated_at: string | null;
}

const ATT_COLS = `user_source, user_id, DATE_FORMAT(attendance_date,'%Y-%m-%d') d, status, leave_type,
  half_day_slot, TIME_FORMAT(check_in_time,'%H:%i') cin, TIME_FORMAT(check_out_time,'%H:%i') cout,
  late_minutes, remarks, source, leave_request_id, marked_by_name,
  DATE_FORMAT(updated_at,'%Y-%m-%dT%H:%i:%sZ') upd`;

const mapAtt = (r: any): AttendanceRow => ({
  user_source: r.user_source,
  user_id: n(r.user_id),
  date: String(r.d),
  status: r.status,
  leave_type: s(r.leave_type),
  half_day_slot: s(r.half_day_slot),
  check_in: s(r.cin),
  check_out: s(r.cout),
  late_minutes: r.late_minutes === null || r.late_minutes === undefined ? null : n(r.late_minutes),
  remarks: s(r.remarks),
  source: String(r.source),
  leave_request_id: r.leave_request_id ? n(r.leave_request_id) : null,
  marked_by_name: s(r.marked_by_name),
  updated_at: s(r.upd),
});

export async function attendanceFor(
  from: string,
  to: string,
  who?: Principal
): Promise<AttendanceRow[]> {
  if (!(await hasTable('hr_attendance_records'))) return [];
  const rows: any[] = who
    ? await prisma.$queryRawUnsafe(
        `SELECT ${ATT_COLS} FROM hr_attendance_records
          WHERE user_source = ? AND user_id = ? AND attendance_date BETWEEN ? AND ? ORDER BY attendance_date`,
        who.source,
        who.id,
        from,
        to
      )
    : await prisma.$queryRawUnsafe(
        `SELECT ${ATT_COLS} FROM hr_attendance_records WHERE attendance_date BETWEEN ? AND ?`,
        from,
        to
      );
  return rows.map(mapAtt);
}

export async function attendanceOne(p: Principal, date: string): Promise<AttendanceRow | null> {
  const rows = await attendanceFor(date, date, p);
  return rows[0] || null;
}

export interface AttendanceWrite {
  status: AttendanceStatus;
  leave_type?: string | null;
  half_day_slot?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  late_minutes?: number | null;
  remarks?: string | null;
  source?: 'hr_manual' | 'holiday' | 'leave_approved' | 'system';
  leave_request_id?: number | null;
}

export async function writeAttendance(
  p: Principal,
  date: string,
  w: AttendanceWrite,
  actor: { source: UserSource; id: number; name: string }
) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO hr_attendance_records
       (user_source, user_id, attendance_date, status, leave_type, half_day_slot, check_in_time,
        check_out_time, late_minutes, remarks, source, leave_request_id, marked_by_source, marked_by_id, marked_by_name)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE status=VALUES(status), leave_type=VALUES(leave_type),
       half_day_slot=VALUES(half_day_slot), check_in_time=VALUES(check_in_time),
       check_out_time=VALUES(check_out_time), late_minutes=VALUES(late_minutes), remarks=VALUES(remarks),
       source=VALUES(source), leave_request_id=VALUES(leave_request_id),
       marked_by_source=VALUES(marked_by_source), marked_by_id=VALUES(marked_by_id),
       marked_by_name=VALUES(marked_by_name)`,
    p.source,
    p.id,
    date,
    w.status,
    w.leave_type ?? null,
    w.half_day_slot ?? null,
    w.check_in ?? null,
    w.check_out ?? null,
    w.late_minutes ?? null,
    w.remarks ?? null,
    w.source ?? 'hr_manual',
    w.leave_request_id ?? null,
    actor.source,
    actor.id,
    actor.name?.slice(0, 150) ?? null
  );
}

// ─── Leave requests ──────────────────────────────────────────────────────────
export interface LeaveRow {
  id: number;
  user_source: UserSource;
  user_id: number;
  user_name: string | null;
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

const LEAVE_COLS = `id, user_source, user_id, user_name, leave_type, DATE_FORMAT(from_date,'%Y-%m-%d') f,
  DATE_FORMAT(to_date,'%Y-%m-%d') t, is_half_day, half_day_slot, total_days, reason, status,
  reviewed_by_name, DATE_FORMAT(reviewed_at,'%Y-%m-%dT%H:%i:%sZ') ra, review_remark,
  DATE_FORMAT(created_at,'%Y-%m-%dT%H:%i:%sZ') ca`;

const mapLeave = (r: any): LeaveRow => ({
  id: n(r.id),
  user_source: r.user_source,
  user_id: n(r.user_id),
  user_name: s(r.user_name),
  leave_type: String(r.leave_type),
  from_date: String(r.f),
  to_date: String(r.t),
  is_half_day: Boolean(n(r.is_half_day)),
  half_day_slot: s(r.half_day_slot),
  total_days: Number(r.total_days),
  reason: String(r.reason),
  status: r.status,
  reviewed_by_name: s(r.reviewed_by_name),
  reviewed_at: s(r.ra),
  review_remark: s(r.review_remark),
  created_at: String(r.ca),
});

export async function leavesQuery(
  where: { who?: Principal; status?: string; from?: string; to?: string; id?: number } = {}
): Promise<LeaveRow[]> {
  if (!(await hasTable('hr_leave_requests'))) return [];
  const conds: string[] = [];
  const args: unknown[] = [];
  if (where.id) {
    conds.push('id = ?');
    args.push(where.id);
  }
  if (where.who) {
    conds.push('user_source = ? AND user_id = ?');
    args.push(where.who.source, where.who.id);
  }
  if (where.status) {
    conds.push('status = ?');
    args.push(where.status);
  }
  if (where.from && where.to) {
    conds.push('from_date <= ? AND to_date >= ?');
    args.push(where.to, where.from);
  }
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT ${LEAVE_COLS} FROM hr_leave_requests ${conds.length ? 'WHERE ' + conds.join(' AND ') : ''}
     ORDER BY (status = 'pending') DESC, from_date DESC, id DESC LIMIT 500`,
    ...args
  );
  return rows.map(mapLeave);
}

/** Days used per leave type in a calendar year (approved requests). */
export async function leaveUsed(who: Principal, year: number): Promise<Record<string, number>> {
  if (!(await hasTable('hr_leave_requests'))) return {};
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT leave_type, SUM(total_days) d FROM hr_leave_requests
      WHERE user_source = ? AND user_id = ? AND status = 'approved'
        AND from_date BETWEEN ? AND ? GROUP BY leave_type`,
    who.source,
    who.id,
    `${year}-01-01`,
    `${year}-12-31`
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[String(r.leave_type)] = Number(r.d) || 0;
  return out;
}
