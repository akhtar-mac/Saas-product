import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import {
  verifyJWT,
  requireRole,
  ADMIN_ROLES,
  SALES_MANAGERS,
} from '../middleware/auth.middleware.js';

const router = Router();

// ─── POST /v1/call-logs/sync ─────────────────────────────────────────────────
// Flutter Android app syncs native call log entries
router.post('/sync', verifyJWT, requireRole([1, 2, 4, 7, 13]), async (req: Request, res: Response) => {
  try {
    const { calls } = req.body; // Array of call log entries
    if (!Array.isArray(calls) || calls.length === 0) {
      return res.status(400).json({ success: false, error: 'calls array is required and must be non-empty.' });
    }

    let saved = 0;
    let duplicates = 0;

    for (const call of calls) {
      try {
        const {
          phone_number, direction, status, duration_seconds,
          called_at, device_call_id,
        } = call;

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
        const existing = await (prisma as any).call_logs?.findFirst?.({
          where: {
            user_id: req.user!.user_id,
            called_at: new Date(called_at),
            phone_number: { contains: normalized.slice(-10) },
          },
        }).catch(() => null);

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
router.get('/analytics/me', verifyJWT, requireRole([1, 2, 4, 7, 13]), async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const analytics = await getEmployeeAnalytics(req.user!.user_id, from as string, to as string);
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch analytics.' });
  }
});

// ─── GET /v1/call-logs/analytics/team ───────────────────────────────────────
// Sales Manager: team analytics
router.get('/analytics/team', verifyJWT, requireRole(SALES_MANAGERS), async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const team = await (prisma as any).staff_users.findMany({
      where: { role_id: { in: [7, 13] }, is_active: true },
      select: { id: true, name: true },
    }).catch(() => []);

    const results = await Promise.all(
      team.map(async (member: any) => ({
        user_id: member.id,
        name: member.name,
        ...await getEmployeeAnalytics(member.id, from as string, to as string),
      }))
    );

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch team analytics.' });
  }
});

// ─── GET /v1/call-logs/analytics/all ────────────────────────────────────────
// Super Admin / Admin: all employees
router.get('/analytics/all', verifyJWT, requireRole(ADMIN_ROLES), async (req: Request, res: Response) => {
  try {
    const { from, to, employee_id } = req.query;

    if (employee_id) {
      const analytics = await getEmployeeAnalytics(Number(employee_id), from as string, to as string);
      return res.json({ success: true, data: analytics });
    }

    const salesStaff = await (prisma as any).staff_users.findMany({
      where: { role_id: { in: [4, 7, 13] }, is_active: true },
      select: { id: true, name: true, role_id: true },
    }).catch(() => []);

    const results = await Promise.all(
      salesStaff.map(async (member: any) => ({
        user_id: member.id,
        name: member.name,
        role_id: member.role_id,
        ...await getEmployeeAnalytics(member.id, from as string, to as string),
      }))
    );

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch analytics.' });
  }
});

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
      const incoming_calls = logList.filter(l => l.direction === 'incoming').length;
      const outgoing_calls = logList.filter(l => l.direction === 'outgoing').length;
      const missed_calls = logList.filter(l => l.status === 'missed' || l.status === 'rejected').length;
      const answered_calls = logList.filter(l => l.status === 'answered' || (l.duration_seconds && l.duration_seconds > 0)).length;
      const total_duration = logList.reduce((acc, l) => acc + (l.duration_seconds || 0), 0);
      return { total_calls, incoming_calls, outgoing_calls, missed_calls, answered_calls, total_duration };
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

// ─── GET /v1/call-logs/lead-details/:id ───────────────────────────────────────
// Get call history details for a single lead
router.get('/lead-details/:id', verifyJWT, requireRole([1, 2, 4, 7, 13]), async (req: Request, res: Response) => {
  try {
    const leadId = Number(req.params.id);
    let lead: any = null;
    try {
      lead = await prisma.leads.findUnique({
        where: { id: leadId },
        select: { id: true, name: true, contact: true, email: true },
      });
    } catch {
      lead = null;
    }

    if (!lead) {
      lead = {
        id: leadId,
        name: `Lead #${leadId}`,
        contact: '+91 98200 12345',
        email: `lead${leadId}@etaxwala.in`,
      };
    }

    const calls = await (prisma as any).call_logs.findMany({
      where: { lead_id: leadId },
      orderBy: { called_at: 'desc' },
      take: 20,
    }).catch(() => []);

    res.json({
      success: true,
      lead,
      calls: calls.map((c: any) => ({
        id: c.id,
        call_type: c.status === 'missed' ? 'Missed' : c.direction === 'outgoing' ? 'Outgoing' : 'Incoming',
        duration: c.duration_seconds || 0,
        call_timestamp: c.called_at,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch lead call details.' });
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

    const leadMap = new Map(leads.map(l => [l.id, l]));
    const userMap = new Map(users.map(u => [u.id, u]));

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

// ─── Helper: per-employee analytics aggregation ───────────────────────────────
async function getEmployeeAnalytics(userId: number, from?: string, to?: string) {
  try {
    const where: any = { user_id: userId };
    if (from || to) {
      where.called_at = {};
      if (from) where.called_at.gte = new Date(from);
      if (to)   where.called_at.lte = new Date(to);
    }

    const logs = await (prisma as any).call_logs.findMany({
      where,
      select: { status: true, duration_seconds: true, lead_id: true, called_at: true },
    }).catch(() => []);

    if (logs.length === 0) {
      const historyWhere: any = { user_id: userId };
      if (from || to) {
        historyWhere.call_date = {};
        if (from) historyWhere.call_date.gte = new Date(from);
        if (to) historyWhere.call_date.lte = new Date(to);
      }
      const calls = await prisma.call_history.findMany({
        where: historyWhere,
        select: { call_type: true, duration: true, lead_id: true },
      }).catch(() => []);

      if (calls.length > 0) {
        const total_calls = calls.length;
        const answered = calls.filter((c: any) => c.call_type === 'outgoing' || c.call_type === 'incoming').length;
        const missed = calls.filter((c: any) => c.call_type === 'outgoing_missed' || c.call_type === 'incoming_missed').length;
        const rejected = calls.filter((c: any) => c.call_type === 'rejected').length;
        const total_duration = calls.reduce((acc: number, c: any) => acc + (c.duration || 0), 0);
        const avg_duration = answered > 0 ? Math.round(total_duration / answered) : 0;
        const unique_leads = new Set(calls.filter((c: any) => c.lead_id && Number(c.lead_id) > 0).map((c: any) => Number(c.lead_id))).size;

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
    const missed   = logs.filter((c: any) => c.status === 'missed').length;
    const rejected = logs.filter((c: any) => c.status === 'rejected').length;
    const total_duration = logs.reduce((acc: number, c: any) => acc + (c.duration_seconds || 0), 0);
    const avg_duration = answered > 0 ? Math.round(total_duration / answered) : 0;
    const unique_leads = new Set(logs.filter((c: any) => c.lead_id).map((c: any) => c.lead_id)).size;

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
      total_calls: 0, answered: 0, missed: 0, rejected: 0,
      not_answered: 0, total_talk_time_seconds: 0,
      avg_call_duration_seconds: 0, unique_leads_called: 0, answer_rate: 0,
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
