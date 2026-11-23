import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
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

// ─── POST /v1/call-logs/sync ─────────────────────────────────────────────────
// Flutter Android app syncs native call log entries
router.post(
  '/sync',
  verifyJWT,
  requireRole([1, 2, 4, 7, 13]),
  async (req: Request, res: Response) => {
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
  }
);

// ─── GET /v1/call-logs/analytics/me ─────────────────────────────────────────
// Sales Employee: own analytics
router.get(
  '/analytics/me',
  verifyJWT,
  requireRole([1, 2, 4, 7, 13]),
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

// ─── GET /v1/call-logs/analytics/team ───────────────────────────────────────
// Sales Manager: team analytics
router.get(
  '/analytics/team',
  verifyJWT,
  requireRole(SALES_MANAGERS),
  async (req: Request, res: Response) => {
    try {
      const { from, to } = req.query;
      const team = await (prisma as any).staff_users
        .findMany({
          where: { role_id: { in: [7, 13] }, is_active: true },
          select: { id: true, name: true },
        })
        .catch(() => []);

      const results = await Promise.all(
        team.map(async (member: any) => ({
          user_id: member.id,
          name: member.name,
          ...(await getEmployeeAnalytics(member.id, from as string, to as string)),
        }))
      );

      res.json({ success: true, data: results });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch team analytics.' });
    }
  }
);

// ─── GET /v1/call-logs/analytics/all ────────────────────────────────────────
// Super Admin / Admin: all employees
router.get(
  '/analytics/all',
  verifyJWT,
  requireRole(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const { from, to, employee_id } = req.query;

      if (employee_id) {
        const analytics = await getEmployeeAnalytics(
          Number(employee_id),
          from as string,
          to as string
        );
        return res.json({ success: true, data: analytics });
      }

      const salesStaff = await (prisma as any).staff_users
        .findMany({
          where: { role_id: { in: [4, 7, 13] }, is_active: true },
          select: { id: true, name: true, role_id: true },
        })
        .catch(() => []);

      const results = await Promise.all(
        salesStaff.map(async (member: any) => ({
          user_id: member.id,
          name: member.name,
          role_id: member.role_id,
          ...(await getEmployeeAnalytics(member.id, from as string, to as string)),
        }))
      );

      res.json({ success: true, data: results });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch analytics.' });
    }
  }
);

// ─── GET /v1/call-logs/staff ─────────────────────────────────────────────────
// Get staff list for filtering call logs
router.get(
  '/staff',
  verifyJWT,
  requireRole([...ADMIN_ROLES, ...SALES_MANAGERS]),
  async (req: Request, res: Response) => {
    try {
      const staff = await prisma.staff_users.findMany({
        where: { is_active: true },
        select: { id: true, name: true, role_id: true },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: staff });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch staff list.' });
    }
  }
);

// ─── Who may see whose calls ──────────────────────────────────────────────────
// Managers/admins (roles 1, 2, 4) may pass ?user_id= (users.id) or see everyone.
// Everyone else (sales/ops employees) only ever sees their own calls.
async function resolveCallScope(req: Request): Promise<{ userId?: number; denied?: boolean }> {
  const roles =
    req.user!.role_ids && req.user!.role_ids.length ? req.user!.role_ids : [req.user!.role_id];
  if (roles.some((r) => SALES_MANAGERS.includes(r))) {
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
  requireRole([1, 2, 4, 7, 13]),
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
      res.status(500).json({ success: false, error: 'Failed to fetch call summary.' });
    }
  }
);

// ─── GET /v1/call-logs/lead-details/:id ───────────────────────────────────────
// Call history for a single lead (own calls only for employees)
router.get(
  '/lead-details/:id',
  verifyJWT,
  requireRole([1, 2, 4, 7, 13]),
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
  requireRole([1, 2, 4, 7, 13]),
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
      const historyWhere: any = { user_id: userId };
      if (from || to) {
        historyWhere.call_date = {};
        if (from) historyWhere.call_date.gte = new Date(from);
        if (to) historyWhere.call_date.lte = new Date(to);
      }
      const calls = await prisma.call_history
        .findMany({
          where: historyWhere,
          select: { call_type: true, duration: true, lead_id: true },
        })
        .catch(() => []);

      if (calls.length > 0) {
        const total_calls = calls.length;
        const answered = calls.filter(
          (c: any) => c.call_type === 'outgoing' || c.call_type === 'incoming'
        ).length;
        const missed = calls.filter(
          (c: any) => c.call_type === 'outgoing_missed' || c.call_type === 'incoming_missed'
        ).length;
        const rejected = calls.filter((c: any) => c.call_type === 'rejected').length;
        const total_duration = calls.reduce((acc: number, c: any) => acc + (c.duration || 0), 0);
        const avg_duration = answered > 0 ? Math.round(total_duration / answered) : 0;
        const unique_leads = new Set(
          calls
            .filter((c: any) => c.lead_id && Number(c.lead_id) > 0)
            .map((c: any) => Number(c.lead_id))
        ).size;

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
