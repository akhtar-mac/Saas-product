/**
 * My Profile — every signed-in staff member, own data only.
 * Mounted at /v1/crm/profile (and /v1/staff/profile).
 */
import { Router } from 'express';
import fs from 'fs';
import { prisma } from '../config/db.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
  DEFAULT_LATE_GRACE_MINUTES,
  LEAVE_TYPES,
  OFFICE_CLOSE,
  OFFICE_OPEN,
  SELF_FIELDS,
  SHIFT_HOURS,
  STATUS_LABEL,
  isValidShiftStart,
  leaveApplySchema,
  normTime,
  selfProfileSchema,
  shiftEndFor,
  shiftStartOptions,
  time12,
  todayIST,
} from './hrms-core.js';
import { holidaysBetween, hrmsTables, leavesQuery, loadOne, upsertProfile } from './hrms-data.js';
import { audit, h, HttpError, meOf, tablesMissing } from './hrms-http.js';
import { leaveUsedByType, leaveDaysFor, monthCalendar } from './hrms-service.js';
import { resolveStaffPhoto, saveStaffPhoto, staffPhotoUpload } from './staff-photos.js';

const router = Router();
router.use(verifyJWT);

const HR_KEYS = [
  'hr:view',
  'hr:attendance_view',
  'hr:attendance_manage',
  'hr:leaves_approve',
  'hr:holidays_manage',
  'hr:employees_manage',
];

async function myRow(req: any) {
  const me = await meOf(req);
  const row = await loadOne(me.who);
  if (!row) throw new HttpError(404, 'Your staff record was not found.');
  return { me, row };
}

router.get(
  '/me',
  h(async (req, res) => {
    const { me, row } = await myRow(req);
    const t = await hrmsTables();
    res.json({
      success: true,
      data: {
        profile: row,
        access: {
          role_name: me.ctx.profile.roleName,
          hr: Object.fromEntries(HR_KEYS.map((k) => [k, me.ctx.has(k)])),
        },
        shift: {
          office_open: OFFICE_OPEN,
          office_close: OFFICE_CLOSE,
          hours: SHIFT_HOURS,
          options: shiftStartOptions().map((s) => ({
            start: s,
            end: shiftEndFor(s),
            label: `${time12(s)} – ${time12(shiftEndFor(s))}`,
          })),
          default_grace_minutes: DEFAULT_LATE_GRACE_MINUTES,
        },
        leave_types: LEAVE_TYPES,
        status_labels: STATUS_LABEL,
        self_fields: SELF_FIELDS,
        tables: t,
        today: todayIST(),
      },
    });
  })
);

router.patch(
  '/me',
  h(async (req, res) => {
    const { me, row } = await myRow(req);
    if (!(await hrmsTables()).profiles) throw tablesMissing('Editing your profile');
    const body = selfProfileSchema.parse(req.body ?? {});
    const changes: Record<string, unknown> = {};
    const before: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (v === undefined) continue;
      const nv = v === '' ? null : v;
      if ((row as any)[k] !== nv) {
        changes[k] = nv;
        before[k] = (row as any)[k] ?? null;
      }
    }
    if (!Object.keys(changes).length)
      return res.json({ success: true, data: row, unchanged: true });
    await upsertProfile(me.who, {
      ...changes,
      updated_by_source: me.ctx.profile.source,
      updated_by_id: me.ctx.profile.id,
    });
    audit(req, res, me, {
      module: 'Profile',
      action: 'profile.update_self',
      resource: 'staff_profiles',
      resourceId: `${me.who.source}:${me.who.id}`,
      summary: `Updated own profile (${Object.keys(changes).join(', ')})`,
      oldState: before,
      newState: changes,
    });
    res.json({ success: true, data: await loadOne(me.who) });
  })
);

router.put(
  '/me/shift',
  h(async (req, res) => {
    const { me, row } = await myRow(req);
    if (!(await hrmsTables()).profiles) throw tablesMissing('Choosing a shift');
    if (row.shift_locked) {
      throw new HttpError(
        403,
        'Your shift has been fixed by HR. Please ask HR to change it.',
        'SHIFT_LOCKED'
      );
    }
    const start = normTime(req.body?.shift_start);
    if (!start || !isValidShiftStart(start)) {
      throw new HttpError(
        400,
        `Pick a start time between ${OFFICE_OPEN} and 10:30 (every 15 minutes).`
      );
    }
    const end = shiftEndFor(start);
    if (row.shift_start === start) return res.json({ success: true, data: row, unchanged: true });
    await upsertProfile(me.who, {
      shift_start: start,
      shift_end: end,
      shift_updated_at: new Date(),
      shift_updated_by_source: me.ctx.profile.source,
      shift_updated_by_id: me.ctx.profile.id,
    });
    audit(req, res, me, {
      module: 'Profile',
      action: 'profile.shift_change',
      resource: 'staff_profiles',
      resourceId: `${me.who.source}:${me.who.id}`,
      summary: `Changed own shift to ${time12(start)} – ${time12(end)}`,
      oldState: { shift_start: row.shift_start, shift_end: row.shift_end },
      newState: { shift_start: start, shift_end: end },
    });
    res.json({ success: true, data: await loadOne(me.who) });
  })
);

router.post(
  '/me/photo',
  (req, res, next) =>
    staffPhotoUpload.single('photo')(req, res, (err: any) => {
      if (!err) return next();
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Photo is larger than 2 MB.' : err.message;
      res.status(400).json({ success: false, error: msg });
    }),
  h(async (req, res) => {
    const { me, row } = await myRow(req);
    if (!(await hrmsTables()).profiles) throw tablesMissing('Changing your photo');
    const filename = saveStaffPhoto((req as any).file, me.who);
    await upsertProfile(me.who, {
      profile_photo: filename,
      updated_by_source: me.ctx.profile.source,
      updated_by_id: me.ctx.profile.id,
    });
    audit(req, res, me, {
      module: 'Profile',
      action: 'profile.photo_change',
      resource: 'staff_profiles',
      resourceId: `${me.who.source}:${me.who.id}`,
      summary: 'Changed own profile photo',
      oldState: { profile_photo: row.photo },
      newState: { profile_photo: filename },
    });
    res.json({ success: true, data: await loadOne(me.who) });
  })
);

/** Streams a staff photo to any signed-in staff member (ID cards, lists). */
router.get(
  '/photo/:filename',
  h(async (req, res) => {
    await meOf(req);
    const f = resolveStaffPhoto(req.params.filename);
    if (!f) throw new HttpError(404, 'Photo not found.');
    res.setHeader('Content-Type', f.contentType);
    res.setHeader('Cache-Control', 'private, max-age=600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    fs.createReadStream(f.fullPath).pipe(res);
  })
);

router.get(
  '/me/attendance',
  h(async (req, res) => {
    const { row } = await myRow(req);
    const month = String(req.query.month || todayIST().slice(0, 7));
    const t = await hrmsTables();
    const cal = await monthCalendar(row, month);
    const leaves = (await leavesQuery({ who: { source: row.source, id: row.id } })).filter(
      (l) => l.from_date.slice(0, 7) <= month && l.to_date.slice(0, 7) >= month
    );
    res.json({
      success: true,
      data: {
        ...cal,
        leaves,
        shift: { start: row.shift_start, end: row.shift_end, grace: row.late_grace_minutes },
        tables_ready: t.attendance,
      },
    });
  })
);

router.get(
  '/holidays',
  h(async (req, res) => {
    await meOf(req);
    const year = Number(req.query.year) || Number(todayIST().slice(0, 4));
    if (!(await hrmsTables()).holidays)
      return res.json({ success: true, data: [], tables_ready: false });
    res.json({
      success: true,
      data: await holidaysBetween(`${year}-01-01`, `${year}-12-31`),
      tables_ready: true,
    });
  })
);

router.get(
  '/me/leaves',
  h(async (req, res) => {
    const { row } = await myRow(req);
    const year = Number(req.query.year) || Number(todayIST().slice(0, 4));
    const who = { source: row.source, id: row.id };
    res.json({
      success: true,
      data: {
        requests: await leavesQuery({ who }),
        used_by_type: await leaveUsedByType(who, year),
        year,
        tables_ready: (await hrmsTables()).leaves,
      },
    });
  })
);

router.post(
  '/me/leaves',
  h(async (req, res) => {
    const { me, row } = await myRow(req);
    if (!(await hrmsTables()).leaves) throw tablesMissing('Leave requests');
    const body = leaveApplySchema.parse(req.body ?? {});
    const minFrom = todayIST().slice(0, 4) + '-01-01';
    if (body.from_date < minFrom)
      throw new HttpError(400, 'Leave can only be requested for this year onwards.');
    const who = { source: row.source, id: row.id };
    const clash = (await leavesQuery({ who, from: body.from_date, to: body.to_date })).filter(
      (l) => l.status === 'pending' || l.status === 'approved'
    );
    if (clash.length) {
      throw new HttpError(409, 'You already have a pending or approved leave on these dates.');
    }
    const { days } = await leaveDaysFor(row, body.from_date, body.to_date, body.is_half_day);
    if (days <= 0)
      throw new HttpError(400, 'These dates are all week offs or holidays — no leave needed.');
    const result: any = await prisma.$executeRawUnsafe(
      `INSERT INTO hr_leave_requests
         (user_source, user_id, user_name, leave_type, from_date, to_date, is_half_day, half_day_slot, total_days, reason, status)
       VALUES (?,?,?,?,?,?,?,?,?,?, 'pending')`,
      who.source,
      who.id,
      row.name.slice(0, 150),
      body.leave_type,
      body.from_date,
      body.to_date,
      body.is_half_day ? 1 : 0,
      body.is_half_day ? body.half_day_slot : null,
      days,
      body.reason
    );
    const created = (await leavesQuery({ who })).find(
      (l) => l.from_date === body.from_date && l.to_date === body.to_date && l.status === 'pending'
    );
    audit(req, res, me, {
      module: 'Profile',
      action: 'leave.apply',
      resource: 'hr_leave_requests',
      resourceId: created?.id,
      summary: `Applied for ${days} day(s) ${body.leave_type} leave`,
      newState: { ...body, total_days: days },
    });
    res.status(201).json({ success: true, data: created, inserted: Number(result) });
  })
);

router.post(
  '/me/leaves/:id/cancel',
  h(async (req, res) => {
    const { me, row } = await myRow(req);
    if (!(await hrmsTables()).leaves) throw tablesMissing('Leave requests');
    const id = Number(req.params.id);
    const [l] = await leavesQuery({ id, who: { source: row.source, id: row.id } });
    if (!l) throw new HttpError(404, 'Leave request not found.');
    if (l.status !== 'pending')
      throw new HttpError(409, 'Only a pending request can be cancelled. Please contact HR.');
    await prisma.$executeRawUnsafe(
      `UPDATE hr_leave_requests SET status = 'cancelled' WHERE id = ? AND status = 'pending'`,
      id
    );
    audit(req, res, me, {
      module: 'Profile',
      action: 'leave.cancel',
      resource: 'hr_leave_requests',
      resourceId: id,
      summary: `Cancelled own leave request #${id}`,
      oldState: { status: 'pending' },
      newState: { status: 'cancelled' },
    });
    res.json({ success: true });
  })
);

export default router;
