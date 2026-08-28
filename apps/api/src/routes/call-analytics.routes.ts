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
