/**
 * Telecaller call summary / history, read straight from the legacy `call_history` table.
 *
 * The Android dialer app posts calls to the old Laravel API (POST /api/calls/store on
 * etaxwala.com), which writes `call_history`. The old dashboards (Admin/dashboard.blade.php
 * for user_type 6, CallController::getDashboardStats / getCallHistory) read the same table,
 * so these queries mirror that code:
 *
 *   user        call_history.user_id = users.id (the JWT user_id for users-table logins)
 *   call_type   'incoming' | 'outgoing' (connected) | 'incoming_missed' | 'outgoing_missed'
 *   duration    seconds; the Duration card sums connected calls only (missed rows carry 1s)
 *   call_date   DATE, written in Asia/Kolkata by Laravel; used for every date filter
 *   call_timestamp  IST wall-clock time stored in a TIMESTAMP column (Laravel ran with the
 *               MySQL session in UTC, so the stored value is the IST clock reading)
 *
 * "Answered" = incoming + outgoing (connected calls), i.e. Total - Missed. The old
 * dashboard has no such card; the old controller's `answered_calls` used the same rule.
 *
 * Read-only: SELECTs only.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';

export const IST_TIMEZONE = 'Asia/Kolkata';
const CONNECTED = ['incoming', 'outgoing'];
const MISSED = ['incoming_missed', 'outgoing_missed', 'missed', 'rejected'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface CallStats {
  total_calls: number;
  incoming_calls: number;
  outgoing_calls: number;
  missed_calls: number;
  answered_calls: number;
  total_duration: number;
}

export interface CallFilters {
  userId?: number;
  from?: string;
  to?: string;
  callType?: string;
  leadSource?: string;
  search?: string;
}

/** Today's date (YYYY-MM-DD) in India, whatever the server clock zone is. */
export function istToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function dateParam(v: unknown): string | undefined {
  const s = typeof v === 'string' ? v.trim().slice(0, 10) : '';
  return DATE_RE.test(s) ? s : undefined;
}

/** Lead source filter: accepts the stored codes (ETax1, SAHAKAR01, UDDYOMI001...) or labels. */
function sourceCondition(src?: string): Prisma.Sql | null {
  const s = (src || '').trim();
  if (!s) return null;
  const u = s.toUpperCase();
  if (u === 'NONE' || u === 'UNKNOWN' || u === '-') {
    return Prisma.sql`(ch.lead_source IS NULL OR ch.lead_source = '')`;
  }
  if (u.startsWith('ETAX')) return Prisma.sql`ch.lead_source LIKE 'ETAX%'`;
  if (u.startsWith('SAHAKAR')) return Prisma.sql`ch.lead_source LIKE 'SAHAKAR%'`;
  if (u.startsWith('UDYAMI') || u.startsWith('UDDYOMI') || u.startsWith('UDAYAMI')) {
    return Prisma.sql`(ch.lead_source LIKE 'UDYAMI%' OR ch.lead_source LIKE 'UDDYOMI%')`;
  }
  return Prisma.sql`ch.lead_source = ${s}`;
}

export function sourceLabel(src: string | null | undefined): string {
  const u = (src || '').toUpperCase();
  if (!u) return '-';
  if (u.startsWith('ETAX')) return 'ETax';
  if (u.startsWith('SAHAKAR')) return 'Sahakar';
  if (u.startsWith('UDYAMI') || u.startsWith('UDDYOMI')) return 'Udyami';
  return src as string;
}

function whereClause(f: CallFilters): Prisma.Sql {
  const parts: Prisma.Sql[] = [];
  if (f.userId) parts.push(Prisma.sql`ch.user_id = ${f.userId}`);
  const from = dateParam(f.from);
  const to = dateParam(f.to);
  if (from) parts.push(Prisma.sql`ch.call_date >= ${from}`);
  if (to) parts.push(Prisma.sql`ch.call_date <= ${to}`);
  const type = (f.callType || '').trim().toLowerCase();
  if (type === 'missed') parts.push(Prisma.sql`ch.call_type IN (${Prisma.join(MISSED)})`);
  else if (type === 'answered') parts.push(Prisma.sql`ch.call_type IN (${Prisma.join(CONNECTED)})`);
  else if (type) parts.push(Prisma.sql`ch.call_type = ${type}`);
  const src = sourceCondition(f.leadSource);
  if (src) parts.push(src);
  const q = (f.search || '').trim().slice(0, 100);
  if (q) {
    const like = `%${q}%`;
    parts.push(
      Prisma.sql`(ch.name LIKE ${like} OR ch.contact LIKE ${like} OR l.name LIKE ${like} OR l.contact LIKE ${like})`
    );
  }
  return parts.length ? Prisma.sql`WHERE ${Prisma.join(parts, ' AND ')}` : Prisma.empty;
}

const n = (v: unknown) => Number(v ?? 0) || 0;

export async function getCallStats(f: CallFilters): Promise<CallStats> {
  // search needs the leads join; plain stats do not
  const join = f.search ? Prisma.sql`LEFT JOIN leads l ON l.id = ch.lead_id` : Prisma.empty;
  const rows: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) AS total_calls,
           SUM(ch.call_type = 'incoming') AS incoming_calls,
           SUM(ch.call_type = 'outgoing') AS outgoing_calls,
           SUM(ch.call_type IN (${Prisma.join(MISSED)})) AS missed_calls,
           SUM(ch.call_type IN (${Prisma.join(CONNECTED)})) AS answered_calls,
           COALESCE(SUM(CASE WHEN ch.call_type IN (${Prisma.join(CONNECTED)}) THEN ch.duration ELSE 0 END), 0) AS total_duration
    FROM call_history ch ${join}
    ${whereClause(f)}`;
  const r = rows[0] || {};
  return {
    total_calls: n(r.total_calls),
    incoming_calls: n(r.incoming_calls),
    outgoing_calls: n(r.outgoing_calls),
    missed_calls: n(r.missed_calls),
    answered_calls: n(r.answered_calls),
    total_duration: n(r.total_duration),
  };
}

export interface CallHistoryRow {
  id: number;
  lead_id: number | null;
  lead_name: string;
  lead_contact: string;
  lead_source: string | null;
  lead_source_label: string;
  phone_number: string;
  call_type: string;
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed';
  duration_seconds: number;
  user_id: number;
  user_name: string;
  call_date: string;
  /** ISO 8601 with the India offset, e.g. 2026-11-23T15:19:29+05:30 */
  called_at: string;
}

export async function getCallHistory(
  f: CallFilters,
  page: number,
  limit: number
): Promise<{ rows: CallHistoryRow[]; total: number }> {
  const where = whereClause(f);
  const offset = (page - 1) * limit;
  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<any[]>`
      SELECT ch.id, ch.lead_id, ch.user_id, ch.call_type, ch.duration, ch.lead_source,
             COALESCE(NULLIF(ch.name, ''), l.name) AS lead_name,
             COALESCE(NULLIF(ch.contact, ''), l.contact) AS lead_contact,
             DATE_FORMAT(ch.call_timestamp, '%Y-%m-%dT%H:%i:%s') AS ts,
             DATE_FORMAT(ch.call_date, '%Y-%m-%d') AS call_date,
             u.username AS user_name
      FROM call_history ch
      LEFT JOIN leads l ON l.id = ch.lead_id
      LEFT JOIN users u ON u.id = ch.user_id
      ${where}
      ORDER BY ch.call_timestamp DESC, ch.id DESC
      LIMIT ${limit} OFFSET ${offset}`,
    prisma.$queryRaw<any[]>`
      SELECT COUNT(*) AS c FROM call_history ch
      ${f.search ? Prisma.sql`LEFT JOIN leads l ON l.id = ch.lead_id` : Prisma.empty}
      ${where}`,
  ]);
  return {
    total: n(countRows[0]?.c),
    rows: rows.map((r) => {
      const type = String(r.call_type || '').toLowerCase();
      const missed = !CONNECTED.includes(type);
      return {
        id: n(r.id),
        lead_id: r.lead_id ? n(r.lead_id) : null,
        lead_name: r.lead_name || 'Unknown Lead',
        lead_contact: r.lead_contact || '',
        lead_source: r.lead_source ?? null,
        lead_source_label: sourceLabel(r.lead_source),
        phone_number: r.lead_contact || '',
        call_type: type,
        direction: type.startsWith('incoming') ? 'incoming' : 'outgoing',
        status: missed ? 'missed' : 'answered',
        duration_seconds: n(r.duration),
        user_id: n(r.user_id),
        user_name: r.user_name || `User #${n(r.user_id)}`,
        call_date: r.call_date,
        called_at: r.ts ? `${r.ts}+05:30` : '',
      };
    }),
  };
}

/**
 * user_id from a users-table login is users.id; a staff_users login carries staff_users.id,
 * which can collide with an unrelated users.id. Only trust the id when the users row has the
 * same username as the token.
 */
export async function isLegacyUser(userId: number, username?: string): Promise<boolean> {
  if (!userId || !username) return false;
  const rows: any[] = await prisma.$queryRaw`
    SELECT id FROM users WHERE id = ${userId} AND username = ${username} LIMIT 1`;
  return rows.length > 0;
}
