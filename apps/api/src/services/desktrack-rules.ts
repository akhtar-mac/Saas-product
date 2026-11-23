/**
 * Pure Desktrack rules copied from the old Laravel DesktopController /
 * SystemLogController (etaxwala.com). Kept free of database access so the
 * numbers can be unit-tested against the old behaviour.
 */

export const SYSTEM_LOG_EVENTS = [
  'login',
  'logout',
  'working_start',
  'lunch_start',
  'meeting_start',
  'outside_start',
  'idle',
  'screenshot',
] as const;
export type SystemLogEvent = (typeof SYSTEM_LOG_EVENTS)[number];

export type Activity = 'working' | 'lunch' | 'meeting' | 'outside';

/** Old `map` in calculateActivityTimes(). */
export const ACTIVITY_START: Record<string, Activity> = {
  working_start: 'working',
  lunch_start: 'lunch',
  meeting_start: 'meeting',
  outside_start: 'outside',
};

/** Old idle report: every `idle` row from the desktop client counts as 5 minutes. */
export const IDLE_MINUTES_PER_EVENT = 5;

/** Old auto-logout window: no screenshot for 30+ minutes. */
export const AUTO_LOGOUT_MINUTES = 30;

/** Desktop report "Live" is decided only by events (no wall-clock check), as in the old code. */
export type SessionState = 'logged_out' | 'live' | 'auto_logout';

export interface ActivityEvent {
  event_type: string;
  /** 'YYYY-MM-DD HH:MM:SS' wall-clock (Asia/Kolkata), as stored by Laravel. */
  created_at: string;
}

/** Parse a stored wall-clock string as seconds (timezone-free, so differences are exact). */
export function wallSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(String(value));
  if (!m) return null;
  return (
    Date.UTC(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5]),
      Number(m[6])
    ) / 1000
  );
}

/**
 * Old calculateActivityTimes($userId, $login, $logout): events between login and
 * logout (inclusive), ordered by time. The first activity opens a span; each next
 * activity closes the previous span; a `logout` closes the open span and stops.
 * An activity still open at the end of the window is NOT counted (old behaviour).
 */
export function calculateActivityTimes(events: ActivityEvent[]): Record<Activity, number> {
  const totals: Record<Activity, number> = { working: 0, lunch: 0, meeting: 0, outside: 0 };
  let prevType: Activity | null = null;
  let prevTime: number | null = null;
  for (const ev of events) {
    const t = wallSeconds(ev.created_at);
    if (t === null) continue;
    const mapped = ACTIVITY_START[ev.event_type];
    if (prevType === null && mapped) {
      prevType = mapped;
      prevTime = t;
      continue;
    }
    if (ev.event_type === 'logout' && prevType && prevTime !== null) {
      totals[prevType] += t - prevTime;
      break;
    }
    if (mapped && prevType && prevTime !== null) {
      totals[prevType] += Math.max(0, t - prevTime);
      prevType = mapped;
      prevTime = t;
    }
  }
  return totals;
}

/** Old hms(): gmdate('H:i:s', max(0, seconds)) — wraps at 24 hours like PHP. */
export function hms(seconds: number): string {
  const s = Math.max(0, Math.trunc(Number(seconds) || 0)) % 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}

/**
 * Old desktop_report logout_time_display:
 * 1. a logout event after the login → that time;
 * 2. no screenshot since the login → (Live);
 * 3. a screenshot within 30 min after the last screenshot → (Live)
 *    (in the old SQL this count is always 0 because it looks past MAX());
 * 4. else → last screenshot time + (Auto-logout).
 */
export function sessionState(row: {
  actual_logout_time: string | null;
  last_screenshot_time: string | null;
  has_screenshot_after_30min?: number | null;
}): { state: SessionState; logout_time: string | null } {
  if (row.actual_logout_time) return { state: 'logged_out', logout_time: row.actual_logout_time };
  if (!row.last_screenshot_time) return { state: 'live', logout_time: null };
  if (Number(row.has_screenshot_after_30min || 0) > 0) return { state: 'live', logout_time: null };
  return { state: 'auto_logout', logout_time: row.last_screenshot_time };
}

/** Current activity for the live board = the last *_start event of the session. */
export function currentActivity(events: ActivityEvent[]): Activity | null {
  let cur: Activity | null = null;
  for (const ev of events) {
    const mapped = ACTIVITY_START[ev.event_type];
    if (mapped) cur = mapped;
    if (ev.event_type === 'logout') cur = null;
  }
  return cur;
}

/** Image MIME from magic bytes (old code used finfo->buffer()). */
export function sniffImageMime(buf: Uint8Array | null | undefined): string {
  if (!buf || buf.length < 4) return 'application/octet-stream';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return 'image/webp';
  if (buf[0] === 0x42 && buf[1] === 0x4d) return 'image/bmp';
  return 'application/octet-stream';
}

/** Current wall-clock time in Asia/Kolkata as 'YYYY-MM-DD HH:MM:SS' (Laravel now()). */
export function istNow(d: Date = new Date()): string {
  const ist = new Date(d.getTime() + 330 * 60 * 1000);
  return ist.toISOString().slice(0, 19).replace('T', ' ');
}

export function isYmd(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/**
 * Old block-website validation is Laravel `url`. Staff type "www.youtube.com"
 * (the placeholder in the old form, and the one live row), so accept a bare
 * host too, store it exactly as typed (trimmed) so the desktop client match is unchanged.
 */
export function normaliseBlockedSite(raw: unknown): string | null {
  const v = String(raw ?? '').trim();
  if (!v || v.length > 255 || /\s/.test(v)) return null;
  const withScheme = /^[a-z]+:\/\//i.test(v) ? v : `http://${v}`;
  try {
    const u = new URL(withScheme);
    if (!u.hostname || !u.hostname.includes('.')) return null;
    return v;
  } catch {
    return null;
  }
}

export function isIp(v: unknown): boolean {
  const s = String(v ?? '').trim();
  const v4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const v6 = /^[0-9a-f:]+$/i;
  return v4.test(s) || (s.includes(':') && v6.test(s) && s.length <= 45);
}
