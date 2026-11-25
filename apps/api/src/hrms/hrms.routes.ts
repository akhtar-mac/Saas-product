/**
 * HR desk (HRMS): attendance sheet, leave approvals, holiday calendar, employee records.
 * Mounted at /v1/crm/hrms (and /v1/staff/hrms). The route guard checks the HR keys
 * first; every handler checks again (defence in depth). Every write is audit logged.
 */
import { Router, Request } from 'express';
import { prisma } from '../config/db.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
  STATUS_CODE,
  STATUS_LABEL,
  bulkMarkSchema,
  ddmmyyyy,
  eachDate,
  holidaySchema,
  hrProfileSchema,
  isISODate,
  lateMinutes,
  markSchema,
  MarkInput,
  monthRange,
  normTime,
  resolveStatus,
  shiftEndFor,
  time12,
  todayIST,
  weekdayOf,
} from './hrms-core.js';
import {
  attendanceFor,
  attendanceOne,
  holidaysBetween,
  hrmsTables,
  leavesQuery,
  loadOne,
  loadStaff,
  pkey,
  Principal,
  StaffRow,
  upsertProfile,
  writeAttendance,
} from './hrms-data.js';
import { audit, h, HttpError, Me, meOf, requirePerm, tablesMissing } from './hrms-http.js';
import { leaveBalance, leaveDaysFor, monthCalendar, overview } from './hrms-service.js';
import { saveStaffPhoto, staffPhotoUpload } from './staff-photos.js';

const router = Router();
router.use(verifyJWT);

const VIEW = ['hr:attendance_view', 'hr:attendance_manage'];
const isSource = (s: any): s is 'users' | 'staff_users' => s === 'users' || s === 'staff_users';

async function need(req: Request, ...perms: string[]): Promise<Me> {
  const me = await meOf(req);
  requirePerm(me, ...perms);
  return me;
}
async function needTable(key: 'profiles' | 'attendance' | 'holidays' | 'leaves', what: string) {
  if (!(await hrmsTables())[key]) throw tablesMissing(what);
}
function targetOf(req: Request): Principal {
  const { source, id } = req.params as any;
  if (!isSource(source) || !Number(id)) throw new HttpError(400, 'Unknown staff member.');
  return { source, id: Number(id) };
}
const actorOf = (me: Me) => ({
  source: me.ctx.profile.source,
  id: me.ctx.profile.id,
  name: me.name,
});

// ─── Overview ────────────────────────────────────────────────────────────────
router.get(
  '/overview',
  h(async (req, res) => {
    await need(req, 'hr:view', ...VIEW, 'hr:leaves_approve', 'hr:employees_manage');
    const date = isISODate(req.query.date) ? (req.query.date as string) : todayIST();
    res.json({ success: true, data: await overview(date) });
  })
);

// ─── Attendance ──────────────────────────────────────────────────────────────
function filterStaff(staff: StaffRow[], q: any) {
  const dept = String(q.dept || '').trim();
  const search = String(q.search || '')
    .trim()
    .toLowerCase();
  return staff.filter(
    (s) =>
      (!dept || (s.department || 'Other') === dept) &&
      (!search ||
        s.name.toLowerCase().includes(search) ||
        (s.employee_code || '').toLowerCase().includes(search) ||
        (s.email || '').toLowerCase().includes(search))
  );
}

router.get(
  '/attendance/daily',
  h(async (req, res) => {
    await need(req, ...VIEW);
    const date = isISODate(req.query.date) ? (req.query.date as string) : todayIST();
    const t = await hrmsTables();
    const all = await loadStaff();
    const staff = filterStaff(all, req.query);
    const [records, hol, leaves] = await Promise.all([
      attendanceFor(date, date),
      holidaysBetween(date, date),
      leavesQuery({ from: date, to: date }),
    ]);
    const rec = new Map(records.map((r) => [`${r.user_source}:${r.user_id}`, r]));
    const weekday = weekdayOf(date);
    const rows = staff.map((s) => {
      const k = pkey({ source: s.source, id: s.id });
      const r = rec.get(k) || null;
      const leave = leaves.find(
        (l) =>
          l.user_source === s.source &&
          l.user_id === s.id &&
          ['pending', 'approved'].includes(l.status)
      );
      return {
        source: s.source,
        id: s.id,
        name: s.name,
        employee_code: s.employee_code,
        department: s.department,
        designation: s.designation,
        photo: s.photo,
        shift_start: s.shift_start,
        shift_end: s.shift_end,
        grace: s.late_grace_minutes,
        record: r,
        suggested: r
          ? null
          : hol.length
            ? 'holiday'
            : s.weekly_off_days.includes(weekday)
              ? 'week_off'
              : leave?.status === 'approved'
                ? 'leave'
                : null,
        leave: leave ? { id: leave.id, status: leave.status, type: leave.leave_type } : null,
      };
    });
    const depts = [...new Set(all.map((s) => s.department || 'Other'))].sort();
    res.json({
      success: true,
      data: {
        date,
        weekday,
        holiday: hol[0]?.title ?? null,
        rows,
        departments: depts,
        tables_ready: t.attendance,
      },
    });
  })
);

async function applyMark(input: MarkInput, me: Me) {
  const who = { source: input.user_source, id: input.user_id };
  const staff = await loadOne(who);
  if (!staff) throw new HttpError(404, 'Staff member not found.');
  const today = todayIST();
  if (input.date > today && !['leave', 'holiday', 'week_off'].includes(input.status)) {
    throw new HttpError(
      400,
      `${STATUS_LABEL[input.status]} cannot be marked for a future date (${ddmmyyyy(input.date)}).`
    );
  }
  const inT = normTime(input.check_in);
  const outT = normTime(input.check_out);
  if (inT && outT && outT <= inT) throw new HttpError(400, 'Check-out must be after check-in.');
  const timed = ['present', 'late', 'wfh', 'half_day'].includes(input.status);
  const late = timed ? lateMinutes(staff.shift_start, inT, staff.late_grace_minutes) : null;
  const resolved = resolveStatus(input.status, late);
  const before = await attendanceOne(who, input.date);
  const after = {
    status: resolved.status,
    leave_type: ['leave', 'half_day'].includes(resolved.status) ? input.leave_type || null : null,
    half_day_slot: resolved.status === 'half_day' ? input.half_day_slot || 'first_half' : null,
    check_in: timed ? inT : null,
    check_out: timed ? outT : null,
    late_minutes: resolved.late_minutes,
    remarks: input.remarks?.trim() || null,
    source: 'hr_manual' as const,
    leave_request_id: null,
  };
  await writeAttendance(who, input.date, after, actorOf(me));
  return { staff, before, after };
}

router.put(
  '/attendance/mark',
  h(async (req, res) => {
    const me = await need(req, 'hr:attendance_manage');
    await needTable('attendance', 'Marking attendance');
    const input = markSchema.parse(req.body ?? {});
    const { staff, before, after } = await applyMark(input, me);
    audit(req, res, me, {
      module: 'HR',
      action: before ? 'attendance.update' : 'attendance.mark',
      resource: 'hr_attendance_records',
      resourceId: `${input.user_source}:${input.user_id}:${input.date}`,
      summary: `Marked ${staff.name} ${STATUS_LABEL[after.status]} on ${ddmmyyyy(input.date)}${
        after.late_minutes ? ` (${after.late_minutes} min late)` : ''
      }`,
      oldState: before,
      newState: after,
    });
    res.json({
      success: true,
      data: await attendanceOne({ source: input.user_source, id: input.user_id }, input.date),
    });
  })
);

router.post(
  '/attendance/bulk',
  h(async (req, res) => {
    const me = await need(req, 'hr:attendance_manage');
    await needTable('attendance', 'Marking attendance');
    const { entries } = bulkMarkSchema.parse(req.body ?? {});
    const done: any[] = [];
    const errors: any[] = [];
    for (const e of entries) {
      try {
        const r = await applyMark(e, me);
        done.push({
          who: `${e.user_source}:${e.user_id}`,
          name: r.staff.name,
          date: e.date,
          before: r.before?.status ?? null,
          after: r.after.status,
        });
      } catch (err: any) {
        errors.push({
          who: `${e.user_source}:${e.user_id}`,
          date: e.date,
          error: err?.message || 'Failed',
        });
      }
    }
    audit(req, res, me, {
      module: 'HR',
      action: 'attendance.bulk_mark',
      resource: 'hr_attendance_records',
      summary: `Bulk marked attendance for ${done.length} staff${errors.length ? ` (${errors.length} skipped)` : ''}`,
      newState: { done, errors },
    });
    res.json({ success: true, data: { saved: done.length, errors } });
  })
);

async function monthlyGrid(month: string, q: any) {
  const range = monthRange(month);
  if (!range) throw new HttpError(400, 'Month must be YYYY-MM.');
  const staff = filterStaff(await loadStaff(), q);
  const rows = [];
  for (const s of staff) {
    const cal = await monthCalendar(s, month);
    rows.push({
      source: s.source,
      id: s.id,
      name: s.name,
      employee_code: s.employee_code,
      department: s.department,
      shift: s.shift_start ? `${s.shift_start}-${s.shift_end}` : null,
      days: cal.days.map((d) => ({
        date: d.date,
        status: d.status,
        derived: d.derived,
        late: d.late_minutes ?? null,
      })),
      summary: cal.summary,
    });
  }
  return { month, dates: eachDate(range.from, range.to), rows };
}

router.get(
  '/attendance/monthly',
  h(async (req, res) => {
    await need(req, ...VIEW);
    const month = String(req.query.month || todayIST().slice(0, 7));
    res.json({ success: true, data: await monthlyGrid(month, req.query) });
  })
);

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; // no spreadsheet formulas
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

router.get(
  '/attendance/export',
  h(async (req, res) => {
    const me = await need(req, ...VIEW);
    const month = String(req.query.month || todayIST().slice(0, 7));
    const grid = await monthlyGrid(month, req.query);
    const head = [
      'Employee Code',
      'Name',
      'Department',
      'Shift (IST)',
      ...grid.dates.map((d) => ddmmyyyy(d).slice(0, 5)),
      'Present days',
      'Late days',
      'Half days',
      'Leave',
      'Absent',
      'Attendance %',
    ];
    const lines = [head.map(csvCell).join(',')];
    for (const r of grid.rows) {
      lines.push(
        [
          r.employee_code,
          r.name,
          r.department,
          r.shift,
          ...r.days.map((d) =>
            d.status in STATUS_CODE
              ? STATUS_CODE[d.status as keyof typeof STATUS_CODE]
              : d.status === 'unmarked'
                ? '-'
                : ''
          ),
          r.summary.present_days,
          r.summary.late_days,
          r.summary.counts.half_day,
          r.summary.counts.leave,
          r.summary.counts.absent,
          r.summary.attendance_rate ?? '',
        ]
          .map(csvCell)
          .join(',')
      );
    }
    audit(req, res, me, {
      module: 'HR',
      action: 'attendance.export',
      resource: 'hr_attendance_records',
      summary: `Exported attendance for ${month} (${grid.rows.length} staff)`,
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="attendance-${month}.csv"`);
    res.send('\uFEFF' + lines.join('\r\n'));
  })
);

// ─── Leave approvals ─────────────────────────────────────────────────────────
router.get(
  '/leaves',
  h(async (req, res) => {
    const me = await need(req, 'hr:leaves_approve', 'hr:attendance_view');
    const status = ['pending', 'approved', 'rejected', 'cancelled'].includes(
      String(req.query.status)
    )
      ? String(req.query.status)
      : undefined;
    const list = await leavesQuery({ status });
    const counts = { pending: 0, approved: 0, rejected: 0, cancelled: 0 } as Record<string, number>;
    for (const l of await leavesQuery()) counts[l.status] += 1;
    const staff = await loadStaff({
      only: [
        ...new Map(
          list.map((l) => [
            `${l.user_source}:${l.user_id}`,
            { source: l.user_source, id: l.user_id },
          ])
        ).values(),
      ],
      includeInactive: true,
    });
    const byKey = new Map(staff.map((s) => [pkey({ source: s.source, id: s.id }), s]));
    res.json({
      success: true,
      data: {
        requests: list.map((l) => {
          const s = byKey.get(`${l.user_source}:${l.user_id}`);
          return {
            ...l,
            name: s?.name || l.user_name,
            department: s?.department ?? null,
            employee_code: s?.employee_code ?? null,
            photo: s?.photo ?? null,
          };
        }),
        counts,
        viewer: { source: me.who.source, id: me.who.id, can_approve_own: me.ctx.profile.isAdmin },
        can_approve: me.ctx.has('hr:leaves_approve'),
        tables_ready: (await hrmsTables()).leaves,
      },
    });
  })
);

router.post(
  '/leaves/:id/approve',
  h(async (req, res) => {
    const me = await need(req, 'hr:leaves_approve');
    await needTable('leaves', 'Leave approvals');
    const id = Number(req.params.id);
    const [l] = await leavesQuery({ id });
    if (!l) throw new HttpError(404, 'Leave request not found.');
    if (l.status !== 'pending') throw new HttpError(409, `This request is already ${l.status}.`);
    const who = { source: l.user_source, id: l.user_id };
    if (who.source === me.who.source && who.id === me.who.id && !me.ctx.profile.isAdmin) {
      throw new HttpError(
        403,
        'You cannot approve your own leave. Another HR person or an admin must do it.'
      );
    }
    const staff = await loadOne(who);
    if (!staff) throw new HttpError(404, 'Staff member not found.');
    const remark =
      String(req.body?.remark ?? '')
        .trim()
        .slice(0, 500) || null;
    const changed: any = await prisma.$executeRawUnsafe(
      `UPDATE hr_leave_requests SET status='approved', reviewed_by_source=?, reviewed_by_id=?, reviewed_by_name=?,
         reviewed_at=UTC_TIMESTAMP(), review_remark=? WHERE id=? AND status='pending'`,
      me.ctx.profile.source,
      me.ctx.profile.id,
      me.name.slice(0, 150),
      remark,
      id
    );
    if (!Number(changed)) throw new HttpError(409, 'This request was already reviewed.');
    // Mark the leave days on the attendance sheet (never over a day HR marked present/WFH).
    const marked: string[] = [];
    const skipped: string[] = [];
    if ((await hrmsTables()).attendance) {
      const { dates } = await leaveDaysFor(staff, l.from_date, l.to_date, l.is_half_day);
      for (const d of dates) {
        const cur = await attendanceOne(who, d);
        if (cur && cur.source === 'hr_manual' && ['present', 'late', 'wfh'].includes(cur.status)) {
          skipped.push(d);
          continue;
        }
        await writeAttendance(
          who,
          d,
          {
            status: l.is_half_day ? 'half_day' : 'leave',
            leave_type: l.leave_type,
            half_day_slot: l.is_half_day ? l.half_day_slot : null,
            remarks: `Approved leave #${l.id}`,
            source: 'leave_approved',
            leave_request_id: l.id,
          },
          actorOf(me)
        );
        marked.push(d);
      }
    }
    audit(req, res, me, {
      module: 'HR',
      action: 'leave.approve',
      resource: 'hr_leave_requests',
      resourceId: id,
      summary: `Approved ${staff.name}'s ${l.total_days} day(s) ${l.leave_type} leave (${ddmmyyyy(l.from_date)} – ${ddmmyyyy(l.to_date)})`,
      oldState: { status: 'pending' },
      newState: { status: 'approved', remark, attendance_marked: marked, attendance_kept: skipped },
    });
    res.json({ success: true, data: { id, attendance_marked: marked, attendance_kept: skipped } });
  })
);

router.post(
  '/leaves/:id/reject',
  h(async (req, res) => {
    const me = await need(req, 'hr:leaves_approve');
    await needTable('leaves', 'Leave approvals');
    const id = Number(req.params.id);
    const remark = String(req.body?.remark ?? '')
      .trim()
      .slice(0, 500);
    if (remark.length < 3) throw new HttpError(400, 'Please write a short reason for rejecting.');
    const [l] = await leavesQuery({ id });
    if (!l) throw new HttpError(404, 'Leave request not found.');
    if (l.status !== 'pending') throw new HttpError(409, `This request is already ${l.status}.`);
    await prisma.$executeRawUnsafe(
      `UPDATE hr_leave_requests SET status='rejected', reviewed_by_source=?, reviewed_by_id=?, reviewed_by_name=?,
         reviewed_at=UTC_TIMESTAMP(), review_remark=? WHERE id=? AND status='pending'`,
      me.ctx.profile.source,
      me.ctx.profile.id,
      me.name.slice(0, 150),
      remark,
      id
    );
    audit(req, res, me, {
      module: 'HR',
      action: 'leave.reject',
      resource: 'hr_leave_requests',
      resourceId: id,
      summary: `Rejected ${l.user_name || 'staff'}'s ${l.leave_type} leave (${ddmmyyyy(l.from_date)} – ${ddmmyyyy(l.to_date)})`,
      oldState: { status: 'pending' },
      newState: { status: 'rejected', remark },
    });
    res.json({ success: true });
  })
);

// ─── Holidays ────────────────────────────────────────────────────────────────
router.get(
  '/holidays',
  h(async (req, res) => {
    await need(req, 'hr:holidays_manage', 'hr:attendance_view', 'hr:view');
    const year = Number(req.query.year) || Number(todayIST().slice(0, 4));
    res.json({
      success: true,
      data: await holidaysBetween(`${year}-01-01`, `${year}-12-31`),
      tables_ready: (await hrmsTables()).holidays,
    });
  })
);

async function holidayById(id: number) {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, DATE_FORMAT(holiday_date,'%Y-%m-%d') holiday_date, title, holiday_type, description, is_active
       FROM hr_holidays WHERE id = ?`,
    id
  );
  if (!rows[0] || !Number(rows[0].is_active)) throw new HttpError(404, 'Holiday not found.');
  return { ...rows[0], id: Number(rows[0].id), is_active: Number(rows[0].is_active) };
}
async function dupHoliday(date: string, exceptId = 0) {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id FROM hr_holidays WHERE holiday_date = ? AND is_active = 1 AND id <> ? LIMIT 1`,
    date,
    exceptId
  );
  if (rows.length) throw new HttpError(409, `There is already a holiday on ${ddmmyyyy(date)}.`);
}

router.post(
  '/holidays',
  h(async (req, res) => {
    const me = await need(req, 'hr:holidays_manage');
    await needTable('holidays', 'The holiday calendar');
    const b = holidaySchema.parse(req.body ?? {});
    await dupHoliday(b.holiday_date);
    await prisma.$executeRawUnsafe(
      `INSERT INTO hr_holidays (holiday_date, title, holiday_type, description, is_active, created_by_source, created_by_id)
       VALUES (?,?,?,?,1,?,?)`,
      b.holiday_date,
      b.title,
      b.holiday_type,
      b.description || null,
      me.ctx.profile.source,
      me.ctx.profile.id
    );
    const [row] = (await holidaysBetween(b.holiday_date, b.holiday_date)).filter(
      (x) => x.title === b.title
    );
    audit(req, res, me, {
      module: 'HR',
      action: 'holiday.create',
      resource: 'hr_holidays',
      resourceId: row?.id,
      summary: `Added holiday "${b.title}" on ${ddmmyyyy(b.holiday_date)}`,
      newState: b,
    });
    res.status(201).json({ success: true, data: row });
  })
);

router.patch(
  '/holidays/:id',
  h(async (req, res) => {
    const me = await need(req, 'hr:holidays_manage');
    await needTable('holidays', 'The holiday calendar');
    const id = Number(req.params.id);
    const before = await holidayById(id);
    const b = holidaySchema.parse({ ...before, ...(req.body ?? {}) });
    await dupHoliday(b.holiday_date, id);
    await prisma.$executeRawUnsafe(
      `UPDATE hr_holidays SET holiday_date=?, title=?, holiday_type=?, description=? WHERE id=?`,
      b.holiday_date,
      b.title,
      b.holiday_type,
      b.description || null,
      id
    );
    audit(req, res, me, {
      module: 'HR',
      action: 'holiday.update',
      resource: 'hr_holidays',
      resourceId: id,
      summary: `Updated holiday "${b.title}" (${ddmmyyyy(b.holiday_date)})`,
      oldState: before,
      newState: b,
    });
    res.json({ success: true, data: await holidayById(id) });
  })
);

/** Soft remove: is_active = 0 (row kept for history). */
router.delete(
  '/holidays/:id',
  h(async (req, res) => {
    const me = await need(req, 'hr:holidays_manage');
    await needTable('holidays', 'The holiday calendar');
    const id = Number(req.params.id);
    const before = await holidayById(id);
    await prisma.$executeRawUnsafe(`UPDATE hr_holidays SET is_active = 0 WHERE id = ?`, id);
    audit(req, res, me, {
      module: 'HR',
      action: 'holiday.remove',
      resource: 'hr_holidays',
      resourceId: id,
      summary: `Removed holiday "${before.title}" (${ddmmyyyy(before.holiday_date)})`,
      oldState: before,
      newState: { is_active: 0 },
    });
    res.json({ success: true });
  })
);

/** Marks the holiday on everyone's sheet who has no mark yet for that day. */
router.post(
  '/holidays/:id/apply',
  h(async (req, res) => {
    const me = await need(req, 'hr:holidays_manage');
    await needTable('attendance', 'Marking attendance');
    const id = Number(req.params.id);
    const hol = await holidayById(id);
    const staff = await loadStaff();
    const existing = new Set(
      (await attendanceFor(hol.holiday_date, hol.holiday_date)).map(
        (r) => `${r.user_source}:${r.user_id}`
      )
    );
    let marked = 0;
    for (const s of staff) {
      if (existing.has(pkey({ source: s.source, id: s.id }))) continue;
      await writeAttendance(
        { source: s.source, id: s.id },
        hol.holiday_date,
        { status: 'holiday', remarks: hol.title, source: 'holiday' },
        actorOf(me)
      );
      marked += 1;
    }
    audit(req, res, me, {
      module: 'HR',
      action: 'holiday.apply',
      resource: 'hr_attendance_records',
      resourceId: id,
      summary: `Marked "${hol.title}" (${ddmmyyyy(hol.holiday_date)}) as holiday for ${marked} staff`,
      newState: { marked, kept_existing: existing.size },
    });
    res.json({ success: true, data: { marked, kept_existing: existing.size } });
  })
);

// ─── Employees ───────────────────────────────────────────────────────────────
router.get(
  '/employees',
  h(async (req, res) => {
    await need(req, 'hr:employees_manage', 'hr:attendance_view');
    const staff = filterStaff(
      await loadStaff({ includeInactive: req.query.inactive === '1' }),
      req.query
    );
    res.json({ success: true, data: staff, tables_ready: (await hrmsTables()).profiles });
  })
);

router.get(
  '/employees/:source/:id',
  h(async (req, res) => {
    await need(req, 'hr:employees_manage', 'hr:attendance_view');
    const who = targetOf(req);
    const row = await loadOne(who);
    if (!row) throw new HttpError(404, 'Staff member not found.');
    const month = String(req.query.month || todayIST().slice(0, 7));
    const year = Number(month.slice(0, 4));
    res.json({
      success: true,
      data: {
        profile: row,
        attendance: await monthCalendar(row, month),
        leaves: await leavesQuery({ who }),
        balance: await leaveBalance(who, year),
      },
    });
  })
);

function guardTarget(me: Me, row: StaffRow) {
  if (row.role_id === 1 && !me.ctx.profile.isSuperAdmin) {
    throw new HttpError(403, 'Only a Super Admin can change a Super Admin record.');
  }
}

router.patch(
  '/employees/:source/:id',
  h(async (req, res) => {
    const me = await need(req, 'hr:employees_manage');
    await needTable('profiles', 'Editing employee records');
    const who = targetOf(req);
    const row = await loadOne(who);
    if (!row) throw new HttpError(404, 'Staff member not found.');
    guardTarget(me, row);
    const b = hrProfileSchema.parse(req.body ?? {});
    const changes: Record<string, unknown> = {};
    const before: Record<string, unknown> = {};
    const cur: any = row;
    for (const [k, v] of Object.entries(b)) {
      if (v === undefined) continue;
      let nv: any = v === '' ? null : v;
      let ov: any = cur[k] ?? null;
      if (k === 'shift_start') nv = nv ? normTime(nv) : null;
      if (k === 'shift_locked') nv = nv ? 1 : 0;
      if (k === 'shift_locked') ov = ov ? 1 : 0;
      if (k === 'weekly_off_days') {
        nv = nv && nv.length ? (nv as string[]).join(',') : null;
        ov = (cur.weekly_off_days as string[]).join(',');
        if ((nv ?? 'Sunday') === ov) continue;
      }
      if (k === 'late_grace_minutes') ov = row.late_grace_custom ? row.late_grace_minutes : null;
      if (k === 'employee_code' && nv) nv = String(nv).toUpperCase();
      if (nv !== ov) {
        changes[k] = nv;
        before[k] = ov;
      }
    }
    if (changes.employee_code) {
      const dup: any[] = await prisma.$queryRawUnsafe(
        `SELECT user_source, user_id FROM staff_profiles WHERE employee_code = ? AND NOT (user_source = ? AND user_id = ?) LIMIT 1`,
        changes.employee_code,
        who.source,
        who.id
      );
      if (dup.length)
        throw new HttpError(409, `Employee code ${changes.employee_code} is already used.`);
    }
    if (!Object.keys(changes).length)
      return res.json({ success: true, data: row, unchanged: true });
    const write: Record<string, unknown> = {
      ...changes,
      updated_by_source: me.ctx.profile.source,
      updated_by_id: me.ctx.profile.id,
    };
    if ('shift_start' in changes) {
      write.shift_end = changes.shift_start ? shiftEndFor(changes.shift_start as string) : null;
      write.shift_updated_at = new Date();
      write.shift_updated_by_source = me.ctx.profile.source;
      write.shift_updated_by_id = me.ctx.profile.id;
    }
    await upsertProfile(who, write);
    const parts = Object.keys(changes).map((k) =>
      k === 'shift_start'
        ? `shift ${changes.shift_start ? `${time12(changes.shift_start as string)} – ${time12(shiftEndFor(changes.shift_start as string))}` : 'cleared'}`
        : k === 'shift_locked'
          ? changes.shift_locked
            ? 'shift locked'
            : 'shift unlocked'
          : k
    );
    audit(req, res, me, {
      module: 'HR',
      action: 'employee.update',
      resource: 'staff_profiles',
      resourceId: `${who.source}:${who.id}`,
      summary: `Updated ${row.name}'s employee record (${parts.join(', ')})`,
      oldState: before,
      newState: changes,
    });
    res.json({ success: true, data: await loadOne(who) });
  })
);

router.post(
  '/employees/:source/:id/photo',
  (req, res, next) =>
    staffPhotoUpload.single('photo')(req, res, (err: any) => {
      if (!err) return next();
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Photo is larger than 2 MB.' : err.message;
      res.status(400).json({ success: false, error: msg });
    }),
  h(async (req, res) => {
    const me = await need(req, 'hr:employees_manage');
    await needTable('profiles', 'Changing photos');
    const who = targetOf(req);
    const row = await loadOne(who);
    if (!row) throw new HttpError(404, 'Staff member not found.');
    guardTarget(me, row);
    const filename = saveStaffPhoto((req as any).file, who);
    await upsertProfile(who, {
      profile_photo: filename,
      updated_by_source: me.ctx.profile.source,
      updated_by_id: me.ctx.profile.id,
    });
    audit(req, res, me, {
      module: 'HR',
      action: 'employee.photo_change',
      resource: 'staff_profiles',
      resourceId: `${who.source}:${who.id}`,
      summary: `Changed ${row.name}'s profile photo`,
      oldState: { profile_photo: row.photo },
      newState: { profile_photo: filename },
    });
    res.json({ success: true, data: await loadOne(who) });
  })
);

export default router;
