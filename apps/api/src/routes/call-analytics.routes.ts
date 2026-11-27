import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { reqHas } from '../rbac/route-guard.js';
import {
  getCallStats,
  getCallHistory,
  istToday,
  isLegacyUser,
} from '../services/call-history.service.js';
import {
  verifyJWT,
  requireRole,
  ADMIN_ROLES,
  SALES_MANAGERS,
} from '../middleware/auth.middleware.js';

const router = Router();

function missingTable(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message || '');
  const code = String((err as { code?: string })?.code || '');
  return (
    code === 'P2021' ||
    /doesn't exist|does not exist|ER_NO_SUCH_TABLE|Unknown table|\b1146\b/i.test(msg)
  );
}

// Roles allowed to view call reports across all staff & filter by ?user_id=
// 1: super_admin, 2: admin, 3: operations_manager, 4: sales_manager
const CALL_MANAGERS = [1, 2, 3, 4];
// Roles allowed on call endpoints (managers + sales/ops callers)
const CALL_VIEWERS = [1, 2, 3, 4, 7, 13];

// ─── POST /v1/call-logs/sync ─────────────────────────────────────────────────
// Flutter Android app syncs native call log entries
router.post('/sync', verifyJWT, requireRole(CALL_VIEWERS), async (req: Request, res: Response) => {
  try {
    const { calls } = req.body; // Array of call log entries
    if (!Array.isArray(calls) || calls.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'calls array is required and must be non-empty.' });
    }

    let saved = 0;
    let duplicates = 0;

    for (const call of calls) {
      try {
        const { phone_number, direction, status, duration_seconds, called_at, device_call_id } =
          call;

        // Normalize phone number for matching (strip spaces, dashes, country code variations)
        const normalized = normalizePhone(phone_number);

        // Match to a lead assigned to this user (by phone)
        const matchedLead = await prisma.leads.findFirst({
          where: {
            contact: { contains: normalized.slice(-10) }, // last 10 digits
            is_assign: 1,
          },
          select: { id: true },
        });

        // Check for duplicate (same user + same called_at + same number)
        const existing = await (prisma as any).call_logs
          ?.findFirst?.({
            where: {
              user_id: req.user!.user_id,
              called_at: new Date(called_at),
              phone_number: { contains: normalized.slice(-10) },
            },
          })
          .catch(() => null);

        if (existing) {
          duplicates++;
          continue;
        }

        await (prisma as any).call_logs.create({
          data: {
            user_id: req.user!.user_id,
            lead_id: matchedLead?.id || null,
            phone_number: normalized,
            direction: direction || 'outgoing',
            status: status || 'unknown',
            duration_seconds: Number(duration_seconds) || 0,
            called_at: new Date(called_at),
            synced_at: new Date(),
            device_call_id: device_call_id || null,
          },
        });
        saved++;
      } catch (rowErr: any) {
        // Skip individual row errors (e.g., unique constraint)
        if (rowErr.code !== 'P2002') console.warn('Call log row error:', rowErr.message);
        else duplicates++;
      }
    }

    res.json({
      success: true,
      message: `Synced ${saved} call log entries. ${duplicates} duplicates skipped.`,
      data: { saved, duplicates, total: calls.length },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Call log sync failed.' });
  }
});

// ─── GET /v1/call-logs/analytics/me ─────────────────────────────────────────
// Sales Employee: own analytics
router.get(
  '/analytics/me',
  verifyJWT,
  requireRole(CALL_VIEWERS),
  async (req: Request, res: Response) => {
    try {
      const { from, to } = req.query;
      const analytics = await getEmployeeAnalytics(req.user!.user_id, from as string, to as string);
      res.json({ success: true, data: analytics });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch analytics.' });
    }
  }
);

// ─── Helper: Per-employee breakdown aggregated directly from call_history + users ─
// Matches legacy CallController::index() (users.user_type = 6, status = 1) plus any user
// present in call_history, so user_id matches call_history.user_id (= users.id).
async function getTeamCallAnalytics(from?: string, to?: string, leadSource?: string) {
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const fromDate =
    typeof from === 'string' && DATE_RE.test(from.trim().slice(0, 10))
      ? from.trim().slice(0, 10)
      : undefined;
  const toDate =
    typeof to === 'string' && DATE_RE.test(to.trim().slice(0, 10))
      ? to.trim().slice(0, 10)
      : undefined;
  const joinConds: Prisma.Sql[] = [Prisma.sql`ch.user_id = u.id`];
  if (fromDate) joinConds.push(Prisma.sql`ch.call_date >= ${fromDate}`);
  if (toDate) joinConds.push(Prisma.sql`ch.call_date <= ${toDate}`);
  const src = (leadSource || '').trim().toUpperCase();
  if (src) {
    if (src.startsWith('ETAX')) joinConds.push(Prisma.sql`ch.lead_source LIKE 'ETAX%'`);
    else if (src.startsWith('SAHAKAR')) joinConds.push(Prisma.sql`ch.lead_source LIKE 'SAHAKAR%'`);
    else if (src.startsWith('UDYAMI') || src.startsWith('UDDYOMI') || src.startsWith('UDAYAMI')) {
      joinConds.push(Prisma.sql`(ch.lead_source LIKE 'UDYAMI%' OR ch.lead_source LIKE 'UDDYOMI%')`);
    } else {
      joinConds.push(Prisma.sql`ch.lead_source = ${leadSource!.trim()}`);
    }
  }

  const rows: any[] = await prisma.$queryRaw`
    SELECT
      u.id AS user_id,
      u.username AS name,
      u.user_type AS role_id,
      COUNT(ch.id) AS total_calls,
      COALESCE(SUM(ch.call_type = 'incoming'), 0) AS incoming_calls,
      COALESCE(SUM(ch.call_type = 'outgoing'), 0) AS outgoing_calls,
      COALESCE(SUM(ch.call_type IN ('incoming', 'outgoing')), 0) AS answered,
      COALESCE(SUM(ch.call_type IN ('incoming_missed', 'outgoing_missed', 'missed')), 0) AS missed,
      COALESCE(SUM(ch.call_type = 'rejected'), 0) AS rejected,
      COALESCE(SUM(CASE WHEN ch.call_type IN ('incoming', 'outgoing') THEN ch.duration ELSE 0 END), 0) AS total_duration,
      COUNT(DISTINCT CASE WHEN ch.lead_id > 0 THEN ch.lead_id ELSE NULL END) AS unique_leads
    FROM users u
    LEFT JOIN call_history ch ON ${Prisma.join(joinConds, ' AND ')}
    WHERE (u.user_type = 6 AND u.status = 1)
       OR EXISTS (SELECT 1 FROM call_history ch2 WHERE ch2.user_id = u.id)
    GROUP BY u.id, u.username, u.user_type
    ORDER BY total_calls DESC, u.username ASC
  `;

  return rows.map((r) => {
    const total_calls = Number(r.total_calls ?? 0) || 0;
    const incoming_calls = Number(r.incoming_calls ?? 0) || 0;
    const outgoing_calls = Number(r.outgoing_calls ?? 0) || 0;
    const answered = Number(r.answered ?? 0) || 0;
    const missed = Number(r.missed ?? 0) || 0;
    const rejected = Number(r.rejected ?? 0) || 0;
    const not_answered = missed + rejected;
    const total_talk_time_seconds = Number(r.total_duration ?? 0) || 0;
    const avg_call_duration_seconds =
      answered > 0 ? Math.round(total_talk_time_seconds / answered) : 0;
    const unique_leads_called = Number(r.unique_leads ?? 0) || 0;
    const answer_rate = total_calls > 0 ? Math.round((answered / total_calls) * 100) : 0;
    return {
      user_id: Number(r.user_id),
      name: r.name || `User #${Number(r.user_id)}`,
      role_id: Number(r.role_id ?? 6),
      total_calls,
      incoming_calls,
      outgoing_calls,
      answered,
      missed,
      rejected,
      not_answered,
      total_talk_time_seconds,
      avg_call_duration_seconds,
      unique_leads_called,
      answer_rate,
    };
  });
}

// ─── GET /v1/call-logs/analytics/team ───────────────────────────────────────
// Managers (Admin, Super Admin, Operations Manager, Sales Manager): per-employee call stats
router.get(
  '/analytics/team',
  verifyJWT,
  requireRole(CALL_MANAGERS),
  async (req: Request, res: Response) => {
    try {
      const { from, to, lead_source } = req.query;
      const results = await getTeamCallAnalytics(
        from as string,
        to as string,
        lead_source as string
      );
      res.json({ success: true, data: results });
    } catch (err) {
      console.error('team analytics failed:', (err as Error).message);
      if (missingTable(err)) {
        res.json({ success: true, data: [], warning: 'Call history is not available yet.' });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch team analytics.' });
    }
  }
);

// ─── GET /v1/call-logs/analytics/all ────────────────────────────────────────
// Super Admin / Admin / Managers: all employees
router.get(
  '/analytics/all',
  verifyJWT,
  requireRole(CALL_MANAGERS),
  async (req: Request, res: Response) => {
    try {
      const { from, to, employee_id, lead_source } = req.query;

      if (employee_id) {
        const analytics = await getEmployeeAnalytics(
          Number(employee_id),
          from as string,
          to as string
        );
        return res.json({ success: true, data: analytics });
      }

      const results = await getTeamCallAnalytics(
        from as string,
        to as string,
        lead_source as string
      );
      res.json({ success: true, data: results });
    } catch (err) {
      console.error('all analytics failed:', (err as Error).message);
      if (missingTable(err)) {
        res.json({ success: true, data: [], warning: 'Call history is not available yet.' });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch analytics.' });
    }
  }
);

// ─── GET /v1/call-logs/staff ─────────────────────────────────────────────────
// Get sales staff list from `users` (matching call_history.user_id = users.id)
router.get('/staff', verifyJWT, requireRole(CALL_MANAGERS), async (req: Request, res: Response) => {
  try {
    const rows: any[] = await prisma.$queryRaw`
        SELECT u.id, u.username AS name, u.user_type AS role_id
        FROM users u
        WHERE (u.user_type = 6 AND u.status = 1)
           OR EXISTS (SELECT 1 FROM call_history ch WHERE ch.user_id = u.id)
        ORDER BY u.username ASC
      `;
    const staff = rows.map((r) => ({
      id: Number(r.id),
      name: r.name || `User #${Number(r.id)}`,
      role_id: Number(r.role_id ?? 6),
    }));
    res.json({ success: true, data: staff });
  } catch (err) {
    console.error('staff list failed:', (err as Error).message);
    if (missingTable(err)) {
      res.json({ success: true, data: [], warning: 'Staff call list is not available yet.' });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to fetch staff list.' });
  }
});

// ─── Who may see whose calls ──────────────────────────────────────────────────
// Managers/admins (roles 1, 2, 3, 4) may pass ?user_id= (users.id) or see everyone.
// Everyone else (sales/ops employees) only ever sees their own calls, unless an admin
// gave them the "See all calls" option (calls:view_all) on the Users & Access page.
async function resolveCallScope(req: Request): Promise<{ userId?: number; denied?: boolean }> {
  const roles =
    req.user!.role_ids && req.user!.role_ids.length ? req.user!.role_ids : [req.user!.role_id];
  if (roles.some((r) => CALL_MANAGERS.includes(r)) || reqHas(req, 'calls:view_all')) {
    const q = Number(req.query.user_id);
    return { userId: Number.isInteger(q) && q > 0 ? q : undefined };
  }
  const own = Number(req.user!.user_id);
  const ok = await isLegacyUser(own, req.user!.username).catch(() => false);
  return ok ? { userId: own } : { denied: true };
}

const EMPTY_STATS = {
  total_calls: 0,
  incoming_calls: 0,
  outgoing_calls: 0,
  missed_calls: 0,
  answered_calls: 0,
  total_duration: 0,
};

const q = (v: unknown) => (typeof v === 'string' ? v : undefined);

// ─── GET /v1/call-logs/summary ───────────────────────────────────────────────
// Total & Today call cards, same numbers as the old CRM dashboard (call_history).
// "total" is all-time unless ?from/&to are given; "today" is today's date in India.
router.get(
  '/summary',
  verifyJWT,
  requireRole(CALL_VIEWERS),
  async (req: Request, res: Response) => {
    try {
      const scope = await resolveCallScope(req);
      const today = istToday();
      if (scope.denied) {
        return res.json({
          success: true,
          data: { total: EMPTY_STATS, today: EMPTY_STATS, today_date: today },
        });
      }
      const base = { userId: scope.userId, leadSource: q(req.query.lead_source) };
      const [total, todayStats] = await Promise.all([
        getCallStats({ ...base, from: q(req.query.from), to: q(req.query.to) }),
        getCallStats({ ...base, from: today, to: today }),
      ]);
      res.json({ success: true, data: { total, today: todayStats, today_date: today } });
    } catch (err) {
      console.error('call summary failed:', (err as Error).message);
      if (missingTable(err)) {
        const today = istToday();
        res.json({
          success: true,
          data: { total: EMPTY_STATS, today: EMPTY_STATS, today_date: today },
          warning: 'Call history is not available yet.',
        });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch call summary.' });
    }
  }
);

// ─── GET /v1/call-logs/lead-details/:id ───────────────────────────────────────
// Call history for a single lead (own calls only for employees)
router.get(
  '/lead-details/:id',
  verifyJWT,
  requireRole(CALL_VIEWERS),
  async (req: Request, res: Response) => {
    try {
      const leadId = Number(req.params.id);
      if (!Number.isInteger(leadId) || leadId <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid lead id.' });
      }
      const scope = await resolveCallScope(req);
      if (scope.denied) return res.status(403).json({ success: false, error: 'Access denied.' });

      const lead = await prisma.leads
        .findUnique({
          where: { id: leadId },
          select: { id: true, name: true, contact: true, email: true },
        })
        .catch(() => null);
      if (!lead) return res.status(404).json({ success: false, error: 'Lead not found.' });

      const userWhere = scope.userId ? Prisma.sql`AND user_id = ${scope.userId}` : Prisma.empty;
      const calls: any[] = await prisma.$queryRaw`
      SELECT id, call_type, duration, DATE_FORMAT(call_timestamp, '%Y-%m-%dT%H:%i:%s') AS ts
      FROM call_history
      WHERE lead_id = ${leadId} ${userWhere}
      ORDER BY call_timestamp DESC, id DESC
      LIMIT 50`;

      const label = (t: string) =>
        t === 'incoming'
          ? 'Incoming'
          : t === 'outgoing'
            ? 'Outgoing'
            : t === 'incoming_missed'
              ? 'Incoming Missed'
              : t === 'outgoing_missed'
                ? 'Outgoing Missed'
                : 'Missed';
      res.json({
        success: true,
        lead,
        calls: calls.map((c) => ({
          id: Number(c.id),
          call_type: label(String(c.call_type || '').toLowerCase()),
          duration: Number(c.duration || 0),
          call_timestamp: c.ts ? `${c.ts}+05:30` : null,
        })),
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch lead call details.' });
    }
  }
);

// ─── GET /v1/call-logs/history ───────────────────────────────────────────────
// Call history table (call_history joined to leads/users), newest first.
// Filters: from/to (YYYY-MM-DD, India date), call_type (incoming|outgoing|missed|answered|
// incoming_missed|outgoing_missed), lead_source (ETax1 / SAHAKAR01 / UDDYOMI001 or ETax /
// Sahakar / Udyami), search (lead name or number), user_id (managers only).
router.get(
  '/history',
  verifyJWT,
  requireRole(CALL_VIEWERS),
  async (req: Request, res: Response) => {
    try {
      const pageNum = Math.max(1, parseInt(q(req.query.page) || '1') || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(q(req.query.limit) || '50') || 50));
      const scope = await resolveCallScope(req);
      if (scope.denied) {
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: limitNum, totalPages: 0 },
        });
      }
      const { rows, total } = await getCallHistory(
        {
          userId: scope.userId,
          from: q(req.query.from),
          to: q(req.query.to),
          callType: q(req.query.call_type),
          leadSource: q(req.query.lead_source),
          search: q(req.query.search),
        },
        pageNum,
        limitNum
      );
      res.json({
        success: true,
        data: rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err) {
      console.error('call history failed:', (err as Error).message);
      if (missingTable(err)) {
        res.json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
          warning: 'Call history is not available yet.',
        });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch call history.' });
    }
  }
);

// ─── Helper: per-employee analytics aggregation ───────────────────────────────
async function getEmployeeAnalytics(userId: number, from?: string, to?: string) {
  try {
    const where: any = { user_id: userId };
    if (from || to) {
      where.called_at = {};
      if (from) where.called_at.gte = new Date(from);
      if (to) where.called_at.lte = new Date(to);
    }

    const logs = await (prisma as any).call_logs
      .findMany({
        where,
        select: { status: true, duration_seconds: true, lead_id: true, called_at: true },
      })
      .catch(() => []);

    if (logs.length === 0) {
      const stats = await getCallStats({ userId, from, to });
      if (stats.total_calls > 0) {
        const uniqRows = await prisma.$queryRaw<any[]>`
          SELECT COUNT(DISTINCT CASE WHEN lead_id > 0 THEN lead_id ELSE NULL END) AS u
          FROM call_history
          WHERE user_id = ${userId}
        `.catch(() => [{ u: 0 }]);
        const unique_leads = Number(uniqRows[0]?.u ?? 0) || 0;
        const answered = stats.answered_calls;
        const missed = stats.missed_calls;
        const total_duration = stats.total_duration;
        const avg_duration = answered > 0 ? Math.round(total_duration / answered) : 0;
        return {
          total_calls: stats.total_calls,
          incoming_calls: stats.incoming_calls,
          outgoing_calls: stats.outgoing_calls,
          answered,
          missed,
          rejected: 0,
          not_answered: missed,
          total_talk_time_seconds: total_duration,
          avg_call_duration_seconds: avg_duration,
          unique_leads_called: unique_leads,
          answer_rate: stats.total_calls > 0 ? Math.round((answered / stats.total_calls) * 100) : 0,
        };
      }
    }

    const total_calls = logs.length;
    const answered = logs.filter((c: any) => c.status === 'answered').length;
    const missed = logs.filter((c: any) => c.status === 'missed').length;
    const rejected = logs.filter((c: any) => c.status === 'rejected').length;
    const total_duration = logs.reduce((acc: number, c: any) => acc + (c.duration_seconds || 0), 0);
    const avg_duration = answered > 0 ? Math.round(total_duration / answered) : 0;
    const unique_leads = new Set(logs.filter((c: any) => c.lead_id).map((c: any) => c.lead_id))
      .size;

    return {
      total_calls,
      answered,
      missed,
      rejected,
      not_answered: missed + rejected,
      total_talk_time_seconds: total_duration,
      avg_call_duration_seconds: avg_duration,
      unique_leads_called: unique_leads,
      answer_rate: total_calls > 0 ? Math.round((answered / total_calls) * 100) : 0,
    };
  } catch {
    // call_logs table may not exist yet
    return {
      total_calls: 0,
      answered: 0,
      missed: 0,
      rejected: 0,
      not_answered: 0,
      total_talk_time_seconds: 0,
      avg_call_duration_seconds: 0,
      unique_leads_called: 0,
      answer_rate: 0,
    };
  }
}

function normalizePhone(phone: string): string {
  // Strip everything except digits
  let digits = phone.replace(/\D/g, '');
  // Remove leading country code (91 for India)
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  return digits;
}

export default router;
