/**
 * Old desktop-client API (etaxwala.com routes/api.php → SystemLogController /
 * BlockedWebsiteController), same paths and JSON shapes, mounted at /api.
 *
 * Disabled unless DESKTRACK_CLIENT_API_ENABLED=true. The installed Desktrack
 * client keeps calling etaxwala.com/api/*, which writes the same shared
 * system_logs table, so the new dashboard sees its data either way. Enable
 * this only if the client's base URL is pointed at the new API.
 *
 * Differences from the old code (security/bug fixes, same success shapes):
 *  - user-desktop-login checks the password with bcrypt only and answers 401
 *    on a wrong or legacy plaintext password (the old code returned an empty 200).
 *  - user_id must be an existing staff member.
 *  - GET /api/screenshots/{id} is not exposed (the old method did not exist and
 *    would serve staff screens without auth); the dashboard serves them behind login.
 */
import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { verifyPassword } from '../services/password.js';
import { authRateLimit } from '../middleware/rate-limit.middleware.js';
import { insertSystemLog } from '../services/desktrack.service.js';
import { SYSTEM_LOG_EVENTS, sniffImageMime } from '../services/desktrack-rules.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const CLIENT_PATHS = [
  '/user-desktop-login',
  '/log-event',
  '/upload-screenshot',
  '/idle-notification',
  '/get-idle-limit',
  '/get-screenshot-interval',
  '/block-website',
  '/unblock-website',
];

router.use((req: Request, res: Response, next: NextFunction) => {
  const p = req.path;
  const ours = CLIENT_PATHS.includes(p) || p.startsWith('/blocked-websites/');
  if (!ours) return next();
  if (!env.DESKTRACK_CLIENT_API_ENABLED) {
    res.status(404).json({ error: 'Desktop client API is not enabled on this server.' });
    return;
  }
  next();
});

// Same check as the staff web login: bcrypt only. Plaintext never matches.
async function checkUserPassword(stored: string | null | undefined, password: string) {
  return verifyPassword(stored, password);
}

async function staffExists(userId: number): Promise<boolean> {
  if (!userId) return false;
  const u = await prisma.users.findUnique({ where: { id: BigInt(userId) }, select: { id: true } });
  return !!u;
}

function validation(res: Response, errors: Record<string, string[]>) {
  res.status(422).json({ message: Object.values(errors)[0][0], errors });
}

router.post(
  '/user-desktop-login',
  authRateLimit,
  asyncHandler(async (req, res) => {
    const email = String(req.body?.user_email ?? '').trim();
    const password = String(req.body?.user_password ?? '');
    if (!email || !/^\S+@\S+$/.test(email))
      return validation(res, {
        user_email: ['The user email field must be a valid email address.'],
      });
    if (!password)
      return validation(res, { user_password: ['The user password field is required.'] });
    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) return void res.status(404).json({ error: 'User not found' });
    const ok = await checkUserPassword((user as any).password, password);
    if (!ok) return void res.status(401).json({ error: 'Invalid password' });
    res.json({ message: 'User login successful', user_id: Number(user.id) });
  })
);

router.post(
  '/log-event',
  upload.single('screenshot'),
  asyncHandler(async (req, res) => {
    const userId = Number(req.body?.user_id);
    const eventType = String(req.body?.event_type ?? '');
    if (!req.body?.user_id) return validation(res, { user_id: ['The user id field is required.'] });
    if (!(SYSTEM_LOG_EVENTS as readonly string[]).includes(eventType))
      return validation(res, { event_type: ['The selected event type is invalid.'] });
    if (!(await staffExists(userId))) return void res.status(404).json({ error: 'User not found' });
    // Old storeEvent() passed the file as `screenshot`, which is not fillable,
    // so it was never stored; keep that (screenshots go through /upload-screenshot).
    const eventTime = req.body?.event_time ? String(req.body.event_time).slice(0, 19) : null;
    await insertSystemLog({ userId, eventType, eventTime });
    res.json({ message: 'Event stored successfully' });
  })
);

router.post(
  '/upload-screenshot',
  upload.single('screenshot'),
  asyncHandler(async (req, res) => {
    const userId = Number(req.body?.user_id);
    if (!req.body?.user_id) return validation(res, { user_id: ['The user id field is required.'] });
    const file = req.file;
    if (!file) return validation(res, { screenshot: ['The screenshot field is required.'] });
    const mime = sniffImageMime(file.buffer);
    if (mime !== 'image/jpeg' && mime !== 'image/png')
      return validation(res, {
        screenshot: ['The screenshot field must be a file of type: jpeg, png, jpg.'],
      });
    if (!(await staffExists(userId))) return void res.status(404).json({ error: 'User not found' });
    await insertSystemLog({ userId, eventType: 'screenshot', screenshot: file.buffer });
    res.json({ message: 'Screenshot stored successfully in database' });
  })
);

router.post(
  '/idle-notification',
  asyncHandler(async (req, res) => {
    const userId = Number(req.body?.user_id);
    if (!req.body?.user_id) return validation(res, { user_id: ['The user id field is required.'] });
    if (!req.body?.event_type)
      return validation(res, { event_type: ['The event type field is required.'] });
    if (!(await staffExists(userId))) return void res.status(404).json({ error: 'User not found' });
    await insertSystemLog({ userId, eventType: 'idle' });
    res.json({ message: 'Idle notification recorded' });
  })
);

async function firstDesktopUser(userId: number) {
  return prisma.desktop_users.findFirst({ where: { user_id: userId }, orderBy: { id: 'asc' } });
}

router.get(
  '/get-idle-limit',
  asyncHandler(async (req, res) => {
    const row = await firstDesktopUser(Number(req.query.user_id) || 0);
    if (!row?.idle_time) return void res.status(404).json({ error: 'Idle limit not found' });
    res.json({ idle_limit: row.idle_time });
  })
);

router.get(
  '/get-screenshot-interval',
  asyncHandler(async (req, res) => {
    const row = await firstDesktopUser(Number(req.query.user_id) || 0);
    if (!row?.screenshot_time)
      return void res.status(404).json({ error: 'Screenshot interval not found' });
    res.json({ screenshot_interval: row.screenshot_time });
  })
);

router.get(
  '/blocked-websites/:user_id',
  asyncHandler(async (req, res) => {
    const rows = await prisma.blocked_websites.findMany({
      where: { user_id: Number(req.params.user_id) || 0 },
      select: { website_url: true },
      orderBy: { id: 'asc' },
    });
    res.json(rows.map((r) => r.website_url));
  })
);

// Old /block-website and /unblock-website had no auth at all; on the new API
// they are not open to the public — manage the list in the dashboard instead.
router.post('/block-website', (_req, res) => {
  res
    .status(403)
    .json({ error: 'Manage blocked websites from the CRM (Desktrack → Block Website).' });
});
router.post('/unblock-website', (_req, res) => {
  res
    .status(403)
    .json({ error: 'Manage blocked websites from the CRM (Desktrack → Block Website).' });
});

export default router;
