import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import {
  verifyJWT,
  requireRole,
  ADMIN_ROLES,
  SALES_MANAGERS,
} from '../middleware/auth.middleware.js';

const router = Router();

// Helper to normalize phone numbers
function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  return digits;
}

// Map of staff_user id to legacy call_history user_id
const STAFF_TO_CALLER_ID_MAP: Record<number, number[]> = {
  4: [4, 82], // Netra Divekar
  13: [13, 170], // Shreya Joshi
  1: [1, 82, 169], // Super Admin test view
  7: [7, 168], // Sales Exec -> Shraddha Jaybhaye
};

// ─── POST /v1/call-logs/sync ─────────────────────────────────────────────────
// Flutter Android app syncs native call log entries
router.post(
  '/sync',
  verifyJWT,
  requireRole([1, 2, 4, 7, 13]),
  async (req: Request, res: Response) => {
    try {
      const { calls } = req.body;
      if (!Array.isArray(calls) || calls.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: 'calls array is required and must be non-empty.' });
      }

      let saved = 0;
      let duplicates = 0;

      const maxCall = await prisma.call_history.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });
      let currentId = maxCall?.id || 0n;

      for (const call of calls) {
        try {
          const {
            phone_number,
            direction,
            status,
            duration_seconds,
            called_at,
            device_call_id,
            lead_name,
          } = call;

          const normalized = normalizePhone(phone_number || '');

          const matchedLead = await prisma.leads.findFirst({
            where: {
              contact: { contains: normalized.slice(-10) },
            },
            select: { id: true, name: true },
          });

          // Determine call_type
          let call_type = 'outgoing';
          if (direction === 'incoming') {
            call_type = Number(duration_seconds) > 0 ? 'incoming' : 'incoming_missed';
          } else {
            call_type = Number(duration_seconds) > 0 ? 'outgoing' : 'outgoing_missed';
          }

          const callTime = called_at ? new Date(called_at) : new Date();
          currentId += 1n;

          await prisma.call_history.create({
            data: {
              id: currentId,
              lead_id: matchedLead?.id || 0,
              user_id: req.user!.user_id as any,
              contact: normalized,
              name: lead_name || matchedLead?.name || 'Inbound / Outbound Lead',
              call_type,
              duration: Number(duration_seconds) || 0,
              call_timestamp: callTime,
              call_date: new Date(callTime.toISOString().split('T')[0]),
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
          saved++;
        } catch (rowErr: any) {
          duplicates++;
        }
      }

      res.json({
        success: true,
        message: `Synced ${saved} call log entries. ${duplicates} duplicates/errors skipped.`,
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
      const userIds = STAFF_TO_CALLER_ID_MAP[req.user!.user_id] || [req.user!.user_id];
      const analytics = await getEmployeeAnalytics(userIds, from as string, to as string);
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
      const results = await getAllCallersAnalytics(from as string, to as string);
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
        const uId = Number(employee_id);
        const userIds = STAFF_TO_CALLER_ID_MAP[uId] || [uId];
        const analytics = await getEmployeeAnalytics(userIds, from as string, to as string);
        return res.json({ success: true, data: analytics });
      }

      const results = await getAllCallersAnalytics(from as string, to as string);
      res.json({ success: true, data: results });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch analytics.' });
    }
  }
);

// ─── GET /v1/call-logs/staff ─────────────────────────────────────────────────
// Get staff list for filtering call logs
router.get('/staff', verifyJWT, requireRole([...ADMIN_ROLES, ...SALES_MANAGERS]), async (req: Request, res: Response) => {
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
});

// ─── GET /v1/call-logs/summary ───────────────────────────────────────────────
// Detailed call summary breakdown (Total & Today) like old CRM Call Report
router.get('/summary', verifyJWT, requireRole([1, 2, 4, 7, 13]), async (req: Request, res: Response) => {
  try {
    const { from, to, user_id, lead_source } = req.query;

    const targetUserId = req.user!.role_id === 7 || req.user!.role_id === 13 ? req.user!.user_id : user_id ? Number(user_id) : undefined;

    // Build base filter for call_logs
    const baseWhere: any = {};
    if (targetUserId) baseWhere.user_id = targetUserId;
    if (from || to) {
      baseWhere.called_at = {};
      if (from) baseWhere.called_at.gte = new Date(from as string);
      if (to)   baseWhere.called_at.lte = new Date(to as string);
    }

    const logs = await (prisma as any).call_logs.findMany({
      where: baseWhere,
      select: { direction: true, status: true, duration_seconds: true, called_at: true },
    }).catch(() => []);

    // Filter for today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStart = new Date(todayStr);
    const todayEnd = new Date(todayStr + 'T23:59:59.999Z');

    const todayLogs = logs.filter((l: any) => {
      const d = new Date(l.called_at);
      return d >= todayStart && d <= todayEnd;
    });

    const calculateStats = (logList: any[]) => {
      const total_calls = logList.length;
      const incoming_calls = logList.filter((l: any) => l.direction === 'incoming').length;
      const outgoing_calls = logList.filter((l: any) => l.direction === 'outgoing').length;
      const missed_calls = logList.filter((l: any) => l.status === 'missed' || l.status === 'rejected').length;
      const total_duration = logList.reduce((acc: number, l: any) => acc + (l.duration_seconds || 0), 0);
      return { total_calls, incoming_calls, outgoing_calls, missed_calls, total_duration };
    };

    res.json({
      success: true,
      data: {
        total: calculateStats(logs),
        today: calculateStats(todayLogs),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch call summary.' });
  }
});

// ─── GET /v1/call-logs/history ───────────────────────────────────────────────
// Detailed call history log table (from call_logs & call_history)
router.get('/history', verifyJWT, requireRole([1, 2, 4, 7, 13]), async (req: Request, res: Response) => {
  try {
    const { from, to, user_id, call_type, lead_source, search, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;

    const targetUserId = (req.user!.role_id === 7 || req.user!.role_id === 13)
      ? req.user!.user_id
      : user_id ? Number(user_id) : undefined;

    const where: any = {};
    if (targetUserId) where.user_id = targetUserId;
    if (call_type) {
      if (call_type === 'incoming') where.direction = 'incoming';
      else if (call_type === 'outgoing') where.direction = 'outgoing';
      else if (call_type === 'missed') where.status = { in: ['missed', 'rejected'] };
    }
    if (from || to) {
      where.called_at = {};
      if (from) where.called_at.gte = new Date(from as string);
      if (to)   where.called_at.lte = new Date(to as string);
    }
    if (search) {
      where.OR = [
        { phone_number: { contains: search as string } },
      ];
    }

    const [logs, total] = await Promise.all([
      (prisma as any).call_logs.findMany({
        where,
        orderBy: { called_at: 'desc' },
        skip,
        take: limitNum,
      }).catch(() => []),
      (prisma as any).call_logs.count({ where }).catch(() => 0),
    ]);

    // Fetch associated lead and staff user details
    const leadIds = [...new Set(logs.map((l: any) => l.lead_id).filter(Boolean))];
    const userIds = [...new Set(logs.map((l: any) => l.user_id).filter(Boolean))];

    const [leads, users] = await Promise.all([
      leadIds.length ? prisma.leads.findMany({
        where: { id: { in: leadIds as number[] } },
        select: { id: true, name: true, contact: true, source: true },
      }) : [],
      userIds.length ? prisma.staff_users.findMany({
        where: { id: { in: userIds as number[] } },
        select: { id: true, name: true },
      }) : [],
    ]);

    const leadMap = new Map(leads.map((l: any) => [l.id, l]));
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const formattedData = logs.map((l: any) => {
      const lead = l.lead_id ? leadMap.get(l.lead_id) : null;
      const user = userMap.get(l.user_id);
      return {
        id: l.id,
        lead_id: l.lead_id,
        lead_name: lead?.name || 'Unknown Lead',
        lead_contact: lead?.contact || l.phone_number,
        lead_source: lead?.source || 'Direct',
        phone_number: l.phone_number,
        direction: l.direction,
        status: l.status,
        call_type: l.status === 'missed' ? 'incoming_missed' : l.direction === 'outgoing' ? 'outgoing' : 'incoming',
        duration_seconds: l.duration_seconds || 0,
        user_id: l.user_id,
        user_name: user?.name || 'Staff #' + l.user_id,
        called_at: l.called_at,
      };
    });

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch call history.' });
  }
});

// ─── Helper: Aggregation over call_history ──────────────────────────────────
async function getEmployeeAnalytics(userIds: number[], from?: string, to?: string) {
  try {
    const where: any = { user_id: { in: userIds.map((id) => id as any) } };
    if (from || to) {
      where.call_date = {};
      if (from) where.call_date.gte = new Date(from);
      if (to) where.call_date.lte = new Date(to);
    }

    // Query call history records
    const calls = await prisma.call_history.findMany({
      where,
      select: {
        id: true,
        call_type: true,
        duration: true,
        lead_id: true,
        call_timestamp: true,
      },
    });

    const total_calls = calls.length;
    const answered = calls.filter(
      (c) => c.call_type === 'outgoing' || c.call_type === 'incoming'
    ).length;
    const missed = calls.filter(
      (c) => c.call_type === 'outgoing_missed' || c.call_type === 'incoming_missed'
    ).length;
    const rejected = calls.filter((c) => c.call_type === 'rejected').length;
    const total_duration = calls.reduce((acc, c) => acc + (c.duration || 0), 0);
    const avg_duration = answered > 0 ? Math.round(total_duration / answered) : 0;
    const unique_leads = new Set(
      calls.filter((c) => c.lead_id && Number(c.lead_id) > 0).map((c) => Number(c.lead_id))
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
  } catch (err) {
    console.error('getEmployeeAnalytics error:', err);
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

async function getAllCallersAnalytics(from?: string, to?: string) {
  // Query all active callers in call_history
  const topCallerGroups = await prisma.call_history.groupBy({
    by: ['user_id'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  // Convert decimal IDs to number
  const userIds = topCallerGroups
    .map((g) => (g.user_id ? Number(g.user_id) : 0))
    .filter((id) => id > 0);

  const [legacyUsers, staffUsers] = await Promise.all([
    prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, email: true },
    }),
    prisma.staff_users.findMany({
      select: { id: true, name: true, email: true, role_id: true },
    }),
  ]);

  const userMap = new Map<number, string>();
  legacyUsers.forEach((u) => userMap.set(u.id, u.username || `Agent #${u.id}`));
  staffUsers.forEach((s) => userMap.set(s.id, s.name));

  const results = await Promise.all(
    topCallerGroups.map(async (group) => {
      const uId = group.user_id ? Number(group.user_id) : 0;
      const stats = await getEmployeeAnalytics([uId], from, to);
      return {
        user_id: uId,
        name: userMap.get(uId) || `Telecaller #${uId}`,
        ...stats,
      };
    })
  );

  return results;
}

export default router;
