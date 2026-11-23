/**
 * Desktrack (desktop tracking) on the shared old-CRM tables:
 * system_logs, desktop_users, blocked_websites, users (+ optional `ips`).
 *
 * Reports reproduce the old DesktopController SQL. All times are returned as
 * the stored wall-clock strings (Asia/Kolkata, as Laravel wrote them) so the
 * figures match etaxwala.com exactly regardless of the API server timezone.
 */
import { prisma } from '../config/db.js';
import {
  AUTO_LOGOUT_MINUTES,
  IDLE_MINUTES_PER_EVENT,
  calculateActivityTimes,
  currentActivity,
  hms,
  istNow,
  sessionState,
  wallSeconds,
  type ActivityEvent,
} from './desktrack-rules.js';

const TS = (col: string) => `DATE_FORMAT(${col}, '%Y-%m-%d %H:%i:%s')`;
const FAR_FUTURE = '2999-01-01 00:00:00';

export interface ReportFilter {
  userId?: number;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  page: number;
  limit: number;
}

function nextDay(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function dateWhere(col: string, f: ReportFilter, params: unknown[]): string {
  let sql = '';
  if (f.from) {
    sql += ` AND ${col} >= ?`;
    params.push(`${f.from} 00:00:00`);
  }
  if (f.to) {
    sql += ` AND ${col} < ?`;
    params.push(`${nextDay(f.to)} 00:00:00`);
  }
  return sql;
}

const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

/** Staff for the filter dropdowns (old: tracking = user_type 6,7,8,3; session report = all users). */
export async function staffOptions(scope: 'tracking' | 'session') {
  const rows = await prisma.$queryRawUnsafe<
    Array<{ id: bigint; username: string; user_type: number }>
  >(
    scope === 'tracking'
      ? 'SELECT id, username, user_type FROM users WHERE user_type IN (6,7,8,3) ORDER BY id DESC'
      : 'SELECT id, username, user_type FROM users ORDER BY username'
  );
  return rows.map((r) => ({ id: Number(r.id), username: r.username, user_type: num(r.user_type) }));
}

/** Old desktop_report / desktop_report_filter: one row per `login` event. */
export async function trackingReport(f: ReportFilter) {
  const params: unknown[] = [];
  let where = "login.event_type = 'login'";
  if (f.userId) {
    where += ' AND login.user_id = ?';
    params.push(f.userId);
  }
  where += dateWhere('login.created_at', f, params);

  const [{ total }] = await prisma.$queryRawUnsafe<Array<{ total: bigint }>>(
    `SELECT COUNT(*) AS total FROM system_logs login WHERE ${where}`,
    ...params
  );

  const nextLogin = `(SELECT MIN(n.created_at) FROM system_logs n WHERE n.user_id = login.user_id
      AND n.event_type = 'login' AND n.created_at > login.created_at)`;
  const rows = await prisma.$queryRawUnsafe<Array<Record<string, any>>>(
    `SELECT login.id AS login_id, login.user_id, u.username, u.user_type,
        ${TS('login.created_at')} AS login_time,
        (SELECT ${TS('MIN(l2.created_at)')} FROM system_logs l2 WHERE l2.user_id = login.user_id
           AND l2.event_type = 'logout' AND l2.created_at > login.created_at) AS actual_logout_time,
        (SELECT ${TS('MAX(s.created_at)')} FROM system_logs s WHERE s.user_id = login.user_id
           AND s.event_type = 'screenshot' AND s.created_at >= login.created_at) AS last_screenshot_any,
        ${TS(nextLogin)} AS next_login_time,
        (SELECT ${TS('MAX(s.created_at)')} FROM system_logs s WHERE s.user_id = login.user_id
           AND s.event_type = 'screenshot' AND s.created_at >= login.created_at
           AND s.created_at < COALESCE(${nextLogin}, '${FAR_FUTURE}')) AS last_screenshot_session,
        (SELECT COUNT(*) FROM system_logs s WHERE s.user_id = login.user_id
           AND s.event_type = 'screenshot' AND s.created_at >= login.created_at
           AND s.created_at < COALESCE(${nextLogin}, '${FAR_FUTURE}')) AS screenshot_count
     FROM system_logs login
     LEFT JOIN users u ON u.id = login.user_id
     WHERE ${where}
     ORDER BY login.created_at DESC, login.id DESC
     LIMIT ? OFFSET ?`,
    ...params,
    f.limit,
    (f.page - 1) * f.limit
  );

  const now = wallSeconds(istNow())!;
  const today = istNow().slice(0, 10);
  const data = rows.map((r) => {
    // Exact old label (screenshots unbounded after login; the 30-min sub-count is always 0).
    const old = sessionState({
      actual_logout_time: r.actual_logout_time,
      last_screenshot_time: r.last_screenshot_any,
      has_screenshot_after_30min: 0,
    });
    const oldDisplay =
      old.state === 'logged_out'
        ? r.actual_logout_time
        : old.state === 'live'
          ? '(Live)'
          : `${r.last_screenshot_any} (Auto-logout)`;

    // New label: the old rule's intent (live only while screenshots keep arriving).
    let state: 'logged_out' | 'live' | 'auto_logout' | 'no_logout' = 'no_logout';
    let logoutTime: string | null = r.actual_logout_time;
    const closedBefore =
      r.next_login_time && r.actual_logout_time && r.actual_logout_time > r.next_login_time;
    if (r.actual_logout_time && !closedBefore) state = 'logged_out';
    else if (r.last_screenshot_session) {
      const last = wallSeconds(r.last_screenshot_session)!;
      if (!r.next_login_time && now - last <= AUTO_LOGOUT_MINUTES * 60) {
        state = 'live';
        logoutTime = null;
      } else {
        state = 'auto_logout';
        logoutTime = r.last_screenshot_session;
      }
    } else if (!r.next_login_time && String(r.login_time).slice(0, 10) === today) {
      state = 'live';
      logoutTime = null;
    } else {
      state = 'no_logout';
      logoutTime = null;
    }
    return {
      login_id: Number(r.login_id),
      user_id: num(r.user_id),
      username: r.username ?? null,
      user_type: r.user_type === null ? null : num(r.user_type),
      login_time: r.login_time,
      logout_time: logoutTime,
      actual_logout_time: r.actual_logout_time,
      logout_other_day:
        !!r.actual_logout_time &&
        String(r.actual_logout_time).slice(0, 10) !== String(r.login_time).slice(0, 10),
      state,
      old_display: oldDisplay,
      last_screenshot_time: r.last_screenshot_session,
      next_login_time: r.next_login_time,
      screenshot_count: num(r.screenshot_count),
    };
  });
  return { data, total: Number(total), page: f.page, limit: f.limit };
}

function idleCte(f: ReportFilter, params: unknown[]): string {
  let filter = '';
  if (f.userId) {
    filter += ' AND s.user_id = ?';
    params.push(f.userId);
  }
  filter += dateWhere('s.created_at', f, params);
  // Verbatim structure of the old idle()/idleReportFilter() CTE.
  return `
    WITH daily_screenshots AS (
      SELECT s.user_id, u.username, s.created_at, DATE(s.created_at) AS log_date
      FROM system_logs s JOIN users u ON u.id = s.user_id
      WHERE s.event_type = 'screenshot' ${filter}
    ),
    screenshot_ranges AS (
      SELECT user_id, username, log_date, MIN(created_at) AS login_time, MAX(created_at) AS last_screenshot
      FROM daily_screenshots GROUP BY user_id, username, log_date
    ),
    logout_time_check AS (
      SELECT sr.*, (
        SELECT MIN(s2.created_at) FROM system_logs s2
        WHERE s2.user_id = sr.user_id AND s2.event_type = 'screenshot'
          AND s2.created_at > sr.last_screenshot AND DATE(s2.created_at) = sr.log_date
          AND TIMESTAMPDIFF(MINUTE, sr.last_screenshot, s2.created_at) <= 30
      ) AS next_screenshot_within_30
      FROM screenshot_ranges sr
    ),
    final_sessions AS (
      SELECT user_id, username, log_date, login_time,
        COALESCE(next_screenshot_within_30, last_screenshot) AS logout_time
      FROM logout_time_check
    ),
    idle_time_calc AS (
      SELECT fs.user_id, fs.username, fs.log_date, fs.login_time, fs.logout_time, (
        SELECT COUNT(*) FROM system_logs i
        WHERE i.user_id = fs.user_id AND i.event_type = 'idle'
          AND i.created_at BETWEEN fs.login_time AND fs.logout_time
      ) * ${IDLE_MINUTES_PER_EVENT} AS idle_minutes
      FROM final_sessions fs
    )`;
}

/** Old desktop_report_idle / idle_report_filter ("Session Report"). */
export async function idleReport(f: ReportFilter) {
  const cp: unknown[] = [];
  const countSql = `${idleCte(f, cp)} SELECT COUNT(*) AS total FROM final_sessions`;
  const [{ total }] = await prisma.$queryRawUnsafe<Array<{ total: bigint }>>(countSql, ...cp);

  const p: unknown[] = [];
  const rows = await prisma.$queryRawUnsafe<Array<Record<string, any>>>(
    `${idleCte(f, p)}
     SELECT user_id, username, DATE_FORMAT(log_date, '%Y-%m-%d') AS log_date,
       ${TS('login_time')} AS login_time, ${TS('logout_time')} AS logout_time,
       idle_minutes,
       CAST(SEC_TO_TIME(idle_minutes * 60) AS CHAR) AS idle_time,
       CAST(TIMEDIFF(logout_time, login_time) AS CHAR) AS session_duration
     FROM idle_time_calc
     ORDER BY log_date DESC, username
     LIMIT ? OFFSET ?`,
    ...p,
    f.limit,
    (f.page - 1) * f.limit
  );

  const data = await Promise.all(
    rows.map(async (r) => {
      const events = await activityEvents(num(r.user_id), r.login_time, r.logout_time);
      const t = calculateActivityTimes(events);
      return {
        user_id: num(r.user_id),
        username: r.username,
        log_date: r.log_date,
        login_time: r.login_time,
        logout_time: r.logout_time,
        lunch_time: hms(t.lunch),
        meeting_time: hms(t.meeting),
        outside_time: hms(t.outside),
        working_status_time: hms(t.working),
        idle_minutes: num(r.idle_minutes),
        idle_time: r.idle_time,
        // Old "Working Time" column is TIMEDIFF(logout, login).
        session_duration: r.session_duration,
      };
    })
  );
  return { data, total: Number(total), page: f.page, limit: f.limit };
}

async function activityEvents(userId: number, from: string, to: string): Promise<ActivityEvent[]> {
  return prisma.$queryRawUnsafe<ActivityEvent[]>(
    `SELECT event_type, ${TS('created_at')} AS created_at FROM system_logs
     WHERE user_id = ? AND created_at BETWEEN ? AND ?
       AND event_type IN ('working_start','lunch_start','meeting_start','outside_start','logout')
     ORDER BY created_at, id`,
    userId,
    from,
    to
  );
}

/** Old getScreenshots($loginId), but paged and metadata-only (images load one by one). */
export async function sessionScreenshots(
  loginId: number,
  opts: { page: number; limit: number; wholeHistory: boolean }
) {
  const [login] = await prisma.$queryRawUnsafe<Array<Record<string, any>>>(
    `SELECT l.id, l.user_id, u.username, ${TS('l.created_at')} AS login_time,
       (SELECT ${TS('MIN(n.created_at)')} FROM system_logs n WHERE n.user_id = l.user_id
          AND n.event_type = 'login' AND n.created_at > l.created_at) AS next_login_time,
       EXISTS(SELECT 1 FROM system_logs o WHERE o.user_id = l.user_id AND o.event_type = 'logout'
          AND o.created_at > l.created_at) AS has_logout
     FROM system_logs l LEFT JOIN users u ON u.id = l.user_id
     WHERE l.id = ? AND l.event_type = 'login'`,
    loginId
  );
  if (!login) return null;
  const until = opts.wholeHistory ? FAR_FUTURE : login.next_login_time || FAR_FUTURE;
  const args = [num(login.user_id), login.login_time, until];
  const [{ total }] = await prisma.$queryRawUnsafe<Array<{ total: bigint }>>(
    `SELECT COUNT(*) AS total FROM system_logs WHERE user_id = ? AND event_type = 'screenshot'
       AND created_at >= ? AND created_at < ?`,
    ...args
  );
  const shots = await prisma.$queryRawUnsafe<Array<Record<string, any>>>(
    `SELECT id, ${TS('created_at')} AS taken_at, LENGTH(screenshot_path) AS bytes
     FROM system_logs WHERE user_id = ? AND event_type = 'screenshot'
       AND created_at >= ? AND created_at < ?
     ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    ...args,
    opts.limit,
    (opts.page - 1) * opts.limit
  );
  return {
    login_id: Number(login.id),
    user_id: num(login.user_id),
    username: login.username ?? null,
    login_time: login.login_time,
    next_login_time: login.next_login_time,
    // Old is_live: no logout event after this login.
    is_live: !Number(login.has_logout),
    total: Number(total),
    page: opts.page,
    limit: opts.limit,
    screenshots: shots.map((s) => ({
      id: Number(s.id),
      taken_at: s.taken_at,
      bytes: num(s.bytes),
    })),
  };
}

export async function screenshotBlob(id: number) {
  const row = await prisma.system_logs.findFirst({
    where: { id, event_type: 'screenshot' },
    select: { screenshot_path: true },
  });
  return row?.screenshot_path ? Buffer.from(row.screenshot_path) : null;
}

/** Live board (polled): every staff member with a login today (IST). */
export async function liveBoard(date?: string) {
  const realNow = istNow();
  // A past day is shown as its end-of-day snapshot.
  const nowStr = date && date < realNow.slice(0, 10) ? `${date} 23:59:59` : realNow;
  const today = nowStr.slice(0, 10);
  const now = wallSeconds(nowStr)!;
  const logins = await prisma.$queryRawUnsafe<Array<Record<string, any>>>(
    `SELECT l.user_id, u.username, u.user_type, ${TS('MAX(l.created_at)')} AS login_time
     FROM system_logs l LEFT JOIN users u ON u.id = l.user_id
     WHERE l.event_type = 'login' AND l.created_at >= ? AND l.created_at < ?
     GROUP BY l.user_id, u.username, u.user_type
     ORDER BY u.username`,
    `${today} 00:00:00`,
    `${nextDay(today)} 00:00:00`
  );
  const data = await Promise.all(
    logins.map(async (r) => {
      const uid = num(r.user_id);
      const events = await prisma.$queryRawUnsafe<ActivityEvent[]>(
        `SELECT event_type, ${TS('created_at')} AS created_at FROM system_logs
         WHERE user_id = ? AND created_at >= ? AND created_at <= ? AND event_type <> 'screenshot'
         ORDER BY created_at, id`,
        uid,
        r.login_time,
        nowStr
      );
      const [shot] = await prisma.$queryRawUnsafe<Array<{ t: string | null; c: bigint }>>(
        `SELECT ${TS('MAX(created_at)')} AS t, COUNT(*) AS c FROM system_logs
         WHERE user_id = ? AND event_type = 'screenshot' AND created_at >= ? AND created_at <= ?`,
        uid,
        r.login_time,
        nowStr
      );
      const logout = events.find((e) => e.event_type === 'logout')?.created_at ?? null;
      const lastIdle =
        [...events].reverse().find((e) => e.event_type === 'idle')?.created_at ?? null;
      const idleCount = events.filter((e) => e.event_type === 'idle').length;
      const lastShot = shot?.t ?? null;
      let state: 'logged_out' | 'live' | 'auto_logout';
      if (logout) state = 'logged_out';
      else if (!lastShot) state = 'live';
      else
        state = now - wallSeconds(lastShot)! <= AUTO_LOGOUT_MINUTES * 60 ? 'live' : 'auto_logout';
      const lastEvent = events.length ? events[events.length - 1].created_at : r.login_time;
      return {
        user_id: uid,
        username: r.username ?? null,
        user_type: r.user_type === null ? null : num(r.user_type),
        login_time: r.login_time,
        logout_time: logout,
        state,
        activity: state === 'logged_out' ? null : currentActivity(events),
        last_screenshot_time: lastShot,
        screenshots_today: Number(shot?.c ?? 0),
        idle_minutes_today: idleCount * IDLE_MINUTES_PER_EVENT,
        last_idle_time: lastIdle,
        last_seen: [lastEvent, lastShot].filter(Boolean).sort().pop() ?? r.login_time,
      };
    })
  );
  return { now: realNow, as_of: nowStr, date: today, data };
}

/** Old DesktopController::logoutEvent — one web "logout" row per user per day. */
export async function recordWebLogout(userId: number) {
  const nowStr = istNow();
  const today = nowStr.slice(0, 10);
  const [{ c }] = await prisma.$queryRawUnsafe<Array<{ c: bigint }>>(
    `SELECT COUNT(*) AS c FROM system_logs WHERE user_id = ? AND event_type = 'logout'
       AND created_at >= ? AND created_at < ?`,
    userId,
    `${today} 00:00:00`,
    `${nextDay(today)} 00:00:00`
  );
  if (Number(c) > 0)
    return { status: 'already' as const, message: 'You already logged out today.' };
  await insertSystemLog({ userId, eventType: 'logout' });
  return { status: 'success' as const, message: 'Logout recorded successfully.' };
}

/** Insert a system_logs row the way Laravel does (created_at/updated_at = IST now()). */
export async function insertSystemLog(input: {
  userId: number;
  eventType: string;
  screenshot?: Buffer | null;
  eventTime?: string | null;
}) {
  const ts = istNow();
  await prisma.$executeRawUnsafe(
    `INSERT INTO system_logs (user_id, event_type, screenshot_path, event_time, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.userId,
    input.eventType,
    input.screenshot ?? null,
    input.eventTime ?? null,
    ts,
    ts
  );
}

// ─── IP management (old manage_ips; the `ips` table is not on live yet) ─────
let ipsTableKnown: boolean | null = null;
export async function ipsTableExists(force = false): Promise<boolean> {
  if (ipsTableKnown !== null && !force) return ipsTableKnown;
  const [{ c }] = await prisma.$queryRawUnsafe<Array<{ c: bigint }>>(
    `SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'ips'`
  );
  ipsTableKnown = Number(c) > 0;
  return ipsTableKnown;
}
