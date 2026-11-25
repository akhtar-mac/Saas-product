/**
 * Desktrack admin API — parity with the old etaxwala.com DesktopController
 * (desktop_report, desktop_report_idle, get-screenshots, manage_ips,
 * block_websites) plus desktop_users config and a polled live board.
 *
 * Access: Super Admin, Admin and Operations Manager (old sidebar shows
 * "Manage Desktrack" to Admin and OM; Super Admin keeps full access).
 * No WebSockets: the UI polls these endpoints over HTTP.
 */
import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/db.js';
import { verifyJWT, requireRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import * as desk from '../services/desktrack.service.js';
import {
  isIp,
  isYmd,
  istNow,
  normaliseBlockedSite,
  sniffImageMime,
} from '../services/desktrack-rules.js';

/** Laravel stores IST wall-clock in TIMESTAMP columns; write and read them the same way. */
const istStamp = () => new Date(`${istNow().replace(' ', 'T')}Z`);
const wall = (d: Date | null | undefined) =>
  d ? d.toISOString().slice(0, 19).replace('T', ' ') : null;

export const DESKTRACK_ROLE_IDS = [1, 2, 3];

const router = Router();
router.use(verifyJWT);

// Any signed-in staff member: old POST /user/logout-event (AdminLogin only).
router.post(
  '/logout-event',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await desk.recordWebLogout(Number(req.user!.user_id));
    res.json({ success: true, ...result });
  })
);

router.use(requireRole(DESKTRACK_ROLE_IDS));

function bad(res: Response, error: string, status = 400) {
  res.status(status).json({ success: false, error });
}

function reportFilter(req: Request): desk.ReportFilter | string {
  const q = req.query as Record<string, string | undefined>;
  const userId = Number(q.user_id || q.employee_id || 0) || undefined;
  const from = q.from_date || q.from || q.fromDate;
  const to = q.to_date || q.to || q.toDate;
  if (from && !isYmd(from)) return 'from date must be YYYY-MM-DD';
  if (to && !isYmd(to)) return 'to date must be YYYY-MM-DD';
  if (from && to && from > to) return 'from date is after to date';
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 25));
  return { userId, from: from || undefined, to: to || undefined, page, limit };
}

router.get(
  '/staff',
  asyncHandler(async (req, res) => {
    const scope = req.query.scope === 'session' ? 'session' : 'tracking';
    res.json({ success: true, data: await desk.staffOptions(scope) });
  })
);

// Tracking Report (old desktop_report + desktop_report_filter)
router.get(
  '/tracking',
  asyncHandler(async (req, res) => {
    const f = reportFilter(req);
    if (typeof f === 'string') return bad(res, f);
    res.json({ success: true, ...(await desk.trackingReport(f)) });
  })
);

// Session / idle report (old desktop_report_idle + idle_report_filter)
router.get(
  '/sessions',
  asyncHandler(async (req, res) => {
    const f = reportFilter(req);
    if (typeof f === 'string') return bad(res, f);
    res.json({ success: true, ...(await desk.idleReport(f)) });
  })
);
router.get(
  '/idle',
  asyncHandler(async (req, res) => {
    const f = reportFilter(req);
    if (typeof f === 'string') return bad(res, f);
    res.json({ success: true, ...(await desk.idleReport(f)) });
  })
);

// Live board, polled by the UI every 30 s
router.get(
  '/live',
  asyncHandler(async (req, res) => {
    const date = req.query.date;
    if (date !== undefined && !isYmd(date)) return bad(res, 'date must be YYYY-MM-DD');
    res.json({ success: true, ...(await desk.liveBoard(date as string | undefined)) });
  })
);

// Screenshot viewer (old get-screenshots/{loginId}); paged metadata
router.get(
  '/logins/:loginId/screenshots',
  asyncHandler(async (req, res) => {
    const loginId = Number(req.params.loginId);
    if (!loginId) return bad(res, 'Invalid login id');
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 12));
    const out = await desk.sessionScreenshots(loginId, {
      page,
      limit,
      wholeHistory: req.query.scope === 'all',
    });
    if (!out) return bad(res, 'Login log not found.', 404);
    res.json({ success: true, ...out });
  })
);

// One screenshot image (BLOB in system_logs.screenshot_path, served as-is)
router.get(
  '/screenshots/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return bad(res, 'Invalid screenshot id');
    const blob = await desk.screenshotBlob(id);
    if (!blob) return bad(res, 'Screenshot not found', 404);
    res.setHeader('Content-Type', sniffImageMime(blob));
    res.setHeader('Content-Length', String(blob.length));
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(blob);
  })
);

// ─── desktop_users: what the desktop client reads (idle limit, screenshot interval)
router.get(
  '/desktop-users',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.desktop_users.findMany({ orderBy: { id: 'asc' } });
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const users = ids.length
      ? await prisma.users.findMany({
          where: { id: { in: ids.map((i) => BigInt(i)) } },
          select: { id: true, username: true, user_type: true },
        })
      : [];
    const byId = new Map(users.map((u) => [Number(u.id), u]));
    // The client calls ->value(): the FIRST row for a user_id wins.
    const effective = new Set<number>();
    const seen = new Set<number>();
    for (const r of rows) {
      if (!seen.has(r.user_id)) {
        seen.add(r.user_id);
        effective.add(r.id);
      }
    }
    res.json({
      success: true,
      data: rows.map((r) => ({
        ...r,
        staff_name: byId.get(r.user_id)?.username ?? null,
        staff_exists: byId.has(r.user_id),
        effective: effective.has(r.id),
      })),
    });
  })
);

function desktopUserInput(body: any): { data?: any; error?: string } {
  const user_id = Number(body?.user_id);
  const idle_time = Number(body?.idle_time);
  const screenshot_time = Number(body?.screenshot_time);
  if (!user_id) return { error: 'Choose a staff member' };
  if (!Number.isInteger(idle_time) || idle_time < 1 || idle_time > 99999)
    return { error: 'Idle limit must be a whole number (1–99999)' };
  if (!Number.isInteger(screenshot_time) || screenshot_time < 1 || screenshot_time > 99999)
    return { error: 'Screenshot interval must be a whole number (1–99999)' };
  return { data: { user_id, idle_time, screenshot_time } };
}

router.post(
  '/desktop-users',
  asyncHandler(async (req, res) => {
    const { data, error } = desktopUserInput(req.body);
    if (error) return bad(res, error);
    const user = await prisma.users.findUnique({ where: { id: BigInt(data.user_id) } });
    if (!user) return bad(res, 'Staff member not found', 404);
    const row = await prisma.desktop_users.create({
      data: { ...data, username: String(req.body?.username || user.username).slice(0, 100) },
    });
    res.json({ success: true, data: row });
  })
);

router.put(
  '/desktop-users/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.desktop_users.findUnique({ where: { id } });
    if (!existing) return bad(res, 'Desktop user not found', 404);
    const { data, error } = desktopUserInput({ user_id: existing.user_id, ...req.body });
    if (error) return bad(res, error);
    const row = await prisma.desktop_users.update({
      where: { id },
      data: {
        ...data,
        username: String(req.body?.username || existing.username).slice(0, 100),
      },
    });
    res.json({ success: true, data: row });
  })
);

// ─── Blocked websites (old /block-website, /unblock-website, /blocked-websites/{user_id})
router.get(
  '/blocked',
  asyncHandler(async (req, res) => {
    const userId = Number(req.query.user_id) || undefined;
    const rows = await prisma.blocked_websites.findMany({
      where: userId ? { user_id: userId } : undefined,
      orderBy: { id: 'desc' },
    });
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const users = ids.length
      ? await prisma.users.findMany({
          where: { id: { in: ids.map((i) => BigInt(i)) } },
          select: { id: true, username: true },
        })
      : [];
    const names = new Map(users.map((u) => [Number(u.id), u.username]));
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: Number(r.id),
        user_id: r.user_id,
        staff_name: names.get(r.user_id) ?? null,
        staff_exists: names.has(r.user_id),
        website_url: r.website_url,
        created_at: wall(r.created_at),
        // Same list the Windows client gets from etaxwala.com/api/blocked-websites/{user_id}
        client_path: `/api/blocked-websites/${r.user_id}`,
      })),
    });
  })
);

router.post(
  '/blocked',
  asyncHandler(async (req, res) => {
    const userId = Number(req.body?.user_id);
    const url = normaliseBlockedSite(req.body?.website_url ?? req.body?.url);
    if (!userId) return bad(res, 'Choose a staff member');
    if (!url) return bad(res, 'Enter a website like www.youtube.com');
    const user = await prisma.users.findUnique({ where: { id: BigInt(userId) } });
    if (!user) return bad(res, 'Staff member not found', 404);
    const dup = await prisma.blocked_websites.findFirst({
      where: { user_id: userId, website_url: url },
    });
    if (dup) return bad(res, 'This website is already blocked for this staff member', 409);
    // Write the same columns the old client API reads: user_id + website_url.
    // (The old Manage IPs form wrote device_ip, which this table does not have.)
    // This schema's blocked_websites model has no id default (the column is
    // AUTO_INCREMENT in the database), so insert with bound raw SQL.
    const stamp = istStamp();
    await prisma.$executeRaw`
      INSERT INTO blocked_websites (user_id, website_url, created_at, updated_at)
      VALUES (${userId}, ${url}, ${stamp}, ${stamp})`;
    const row = await prisma.blocked_websites.findFirst({
      where: { user_id: userId, website_url: url },
      orderBy: { id: 'desc' },
    });
    if (!row) return bad(res, 'Could not block this website', 500);
    res.json({
      success: true,
      data: {
        ...row,
        id: Number(row.id),
        created_at: wall(row.created_at),
        updated_at: wall(row.updated_at),
      },
      message: 'Website blocked successfully',
    });
  })
);

router.put(
  '/blocked/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id) || 0;
    const existing = await prisma.blocked_websites.findUnique({ where: { id } });
    if (!existing) return bad(res, 'Blocked website not found', 404);
    const url = normaliseBlockedSite(req.body?.website_url ?? existing.website_url);
    const userId = Number(req.body?.user_id ?? existing.user_id);
    if (!url) return bad(res, 'Enter a website like www.youtube.com');
    const row = await prisma.blocked_websites.update({
      where: { id },
      data: { website_url: url, user_id: userId, updated_at: istStamp() },
    });
    res.json({
      success: true,
      data: {
        ...row,
        id: Number(row.id),
        created_at: wall(row.created_at),
        updated_at: wall(row.updated_at),
      },
    });
  })
);

router.delete(
  '/blocked/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id) || 0;
    const existing = await prisma.blocked_websites.findUnique({ where: { id } });
    if (!existing) return bad(res, 'Blocked website not found', 404);
    await prisma.blocked_websites.delete({ where: { id } });
    res.json({ success: true, message: 'Website unblocked successfully' });
  })
);

// ─── IP management (old manage_ips / add-ip-address; needs the add-only `ips` table)
async function ipsGuard(res: Response): Promise<boolean> {
  if (await desk.ipsTableExists()) return true;
  res.json({
    success: true,
    tableMissing: true,
    data: [],
    message:
      'The ips table does not exist in this database (it is missing on etaxwala.com too). Apply apps/api/prisma/sql/2026-11-18_desktrack_ips_mysql.sql to enable IP management.',
  });
  return false;
}

function ipInput(body: any): { data?: any; error?: string } {
  const ip_address = String(body?.ip_address ?? '').trim();
  const username = String(body?.username ?? '').trim();
  const idle_time = Number(body?.idle_time);
  const screenshot_time = Number(body?.screenshot_time);
  if (!isIp(ip_address)) return { error: 'Enter a valid IP address' };
  if (!username || username.length > 100) return { error: 'Enter a name for this device' };
  if (!Number.isInteger(idle_time) || idle_time < 1)
    return { error: 'Idle limit must be a whole number' };
  if (!Number.isInteger(screenshot_time) || screenshot_time < 1)
    return { error: 'Screenshot interval must be a whole number' };
  return { data: { ip_address, username, idle_time, screenshot_time } };
}

router.get(
  '/ips',
  asyncHandler(async (_req, res) => {
    if (!(await ipsGuard(res))) return;
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, any>>>(
      'SELECT id, ip_address, username, idle_time, screenshot_time FROM ips ORDER BY id DESC'
    );
    res.json({
      success: true,
      tableMissing: false,
      data: rows.map((r) => ({
        id: Number(r.id),
        ip_address: r.ip_address,
        username: r.username,
        idle_time: Number(r.idle_time),
        screenshot_time: Number(r.screenshot_time),
      })),
    });
  })
);

router.post(
  '/ips',
  asyncHandler(async (req, res) => {
    if (!(await desk.ipsTableExists(true)))
      return bad(res, 'IP management is not enabled (ips table missing)', 409);
    const { data, error } = ipInput(req.body);
    if (error) return bad(res, error);
    await prisma.$executeRawUnsafe(
      'INSERT INTO ips (ip_address, username, idle_time, screenshot_time) VALUES (?, ?, ?, ?)',
      data.ip_address,
      data.username,
      data.idle_time,
      data.screenshot_time
    );
    res.json({ success: true, message: 'IP added successfully' });
  })
);

router.put(
  '/ips/:id',
  asyncHandler(async (req, res) => {
    if (!(await desk.ipsTableExists(true)))
      return bad(res, 'IP management is not enabled (ips table missing)', 409);
    const { data, error } = ipInput(req.body);
    if (error) return bad(res, error);
    const n = await prisma.$executeRawUnsafe(
      'UPDATE ips SET ip_address = ?, username = ?, idle_time = ?, screenshot_time = ? WHERE id = ?',
      data.ip_address,
      data.username,
      data.idle_time,
      data.screenshot_time,
      Number(req.params.id)
    );
    if (!n) return bad(res, 'IP not found', 404);
    res.json({ success: true, message: 'IP updated successfully' });
  })
);

router.delete(
  '/ips/:id',
  asyncHandler(async (req, res) => {
    if (!(await desk.ipsTableExists(true)))
      return bad(res, 'IP management is not enabled (ips table missing)', 409);
    const n = await prisma.$executeRawUnsafe('DELETE FROM ips WHERE id = ?', Number(req.params.id));
    if (!n) return bad(res, 'IP not found', 404);
    res.json({ success: true, message: 'IP deleted successfully' });
  })
);

export default router;
