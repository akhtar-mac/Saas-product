/** HRMS read models shared by My Profile, the HR desk and the old dashboard endpoints. */
import {
  ATTENDANCE_STATUSES,
  AttendanceStatus,
  addDays,
  countLeaveDays,
  eachDate,
  leaveQuotas,
  monthRange,
  summarize,
  todayIST,
  weekdayOf,
  LEAVE_TYPES,
} from './hrms-core.js';
import {
  attendanceFor,
  holidaysBetween,
  hrmsTables,
  leaveUsed,
  leavesQuery,
  loadStaff,
  pkey,
  Principal,
  StaffRow,
} from './hrms-data.js';

export interface CalendarDay {
  date: string;
  weekday: string;
  status: AttendanceStatus | 'unmarked' | 'upcoming';
  /** true when filled from the holiday calendar / weekly off, not a saved mark */
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

/** One person's month: saved marks + holidays + weekly offs, newest rules first. */
export async function monthCalendar(staff: StaffRow, month: string) {
  const range = monthRange(month);
  if (!range) throw Object.assign(new Error('Month must be YYYY-MM'), { statusCode: 400 });
  const who: Principal = { source: staff.source, id: staff.id };
  const [records, holidays] = await Promise.all([
    attendanceFor(range.from, range.to, who),
    holidaysBetween(range.from, range.to),
  ]);
  const byDate = new Map(records.map((r) => [r.date, r]));
  const hol = new Map(holidays.map((h) => [h.holiday_date, h.title]));
  const today = todayIST();
  const days: CalendarDay[] = eachDate(range.from, range.to).map((d) => {
    const r = byDate.get(d);
    const weekday = weekdayOf(d);
    if (r) {
      return {
        date: d,
        weekday,
        status: r.status,
        derived: false,
        holiday: hol.get(d) ?? null,
        leave_type: r.leave_type,
        half_day_slot: r.half_day_slot,
        check_in: r.check_in,
        check_out: r.check_out,
        late_minutes: r.late_minutes,
        remarks: r.remarks,
        marked_by: r.marked_by_name,
      };
    }
    if (hol.has(d))
      return { date: d, weekday, status: 'holiday', derived: true, holiday: hol.get(d) };
    if (staff.weekly_off_days.includes(weekday))
      return { date: d, weekday, status: 'week_off', derived: true };
    return { date: d, weekday, status: d > today ? 'upcoming' : 'unmarked', derived: true };
  });
  const counted = days
    .filter((d) => (ATTENDANCE_STATUSES as readonly string[]).includes(d.status) && d.date <= today)
    .map((d) => ({ date: d.date, status: d.status as AttendanceStatus }));
  const sum = summarize(counted);
  const late = days.filter((d) => d.status === 'late');
  return {
    month,
    days,
    holidays,
    summary: {
      ...sum,
      unmarked: days.filter((d) => d.status === 'unmarked').length,
      late_days: late.length,
      late_minutes_total: late.reduce((a, d) => a + (d.late_minutes || 0), 0),
    },
  };
}

export async function leaveBalance(who: Principal, year: number) {
  const used = await leaveUsed(who, year);
  const quota = leaveQuotas();
  return LEAVE_TYPES.map((t) => ({
    key: t.key,
    label: t.label,
    quota: quota[t.key] ?? null,
    used: used[t.key] ?? 0,
    balance: quota[t.key] === undefined ? null : Math.max(0, quota[t.key] - (used[t.key] ?? 0)),
  }));
}

/** Working days for a leave request, using the person's weekly offs + holiday calendar. */
export async function leaveDaysFor(staff: StaffRow, from: string, to: string, halfDay: boolean) {
  const hol = await holidaysBetween(from, to);
  return countLeaveDays(from, to, {
    halfDay,
    weeklyOffs: staff.weekly_off_days,
    holidays: new Set(hol.map((h) => h.holiday_date)),
  });
}

/** Today's company picture (HR overview, old /attendance and /workforce-summary). */
export async function overview(date: string = todayIST()) {
  const t = await hrmsTables();
  const staff = await loadStaff();
  const [records, holidaysToday, upcoming, pending, onLeave] = await Promise.all([
    attendanceFor(date, date),
    holidaysBetween(date, date),
    holidaysBetween(addDays(date, 1), addDays(date, 90)),
    leavesQuery({ status: 'pending' }),
    leavesQuery({ status: 'approved', from: date, to: date }),
  ]);
  const active = new Set(staff.map((s) => pkey({ source: s.source, id: s.id })));
  const todays = records.filter((r) => active.has(`${r.user_source}:${r.user_id}`));
  const counts: Record<string, number> = Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s, 0]));
  for (const r of todays) counts[r.status] += 1;
  const weekday = weekdayOf(date);
  const offToday = staff.filter(
    (s) =>
      s.weekly_off_days.includes(weekday) &&
      !todays.some((r) => r.user_source === s.source && r.user_id === s.id)
  ).length;
  const isHoliday = holidaysToday.length > 0;
  const present = counts.present + counts.late + counts.wfh + counts.half_day;
  const expected = isHoliday ? 0 : staff.length - offToday;
  const byDept = new Map<string, { department: string; total: number; present: number }>();
  for (const s of staff) {
    const k = s.department || 'Other';
    if (!byDept.has(k)) byDept.set(k, { department: k, total: 0, present: 0 });
    const g = byDept.get(k)!;
    g.total += 1;
    const r = todays.find((x) => x.user_source === s.source && x.user_id === s.id);
    if (r && ['present', 'late', 'wfh', 'half_day'].includes(r.status)) g.present += 1;
  }
  return {
    tables_ready: t.all,
    tables: t,
    date,
    weekday,
    is_holiday: isHoliday,
    holiday: holidaysToday[0]?.title ?? null,
    total_staff: staff.length,
    expected_today: expected,
    marked: todays.length,
    unmarked: Math.max(
      0,
      expected - todays.filter((r) => r.status !== 'week_off' && r.status !== 'holiday').length
    ),
    counts,
    present_today: present,
    attendance_rate: expected ? Math.round((present / expected) * 1000) / 10 : null,
    with_shift: staff.filter((s) => !!s.shift_start).length,
    pending_leaves: pending.length,
    on_leave_today: onLeave.length,
    upcoming_holidays: upcoming.slice(0, 5),
    departments: [...byDept.values()].sort((a, b) => b.total - a.total),
  };
}
