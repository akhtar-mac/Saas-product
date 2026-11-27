import { Router } from 'express';
import { prisma } from '../config/db.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { getPublicBrand } from '../services/tenant-settings.service.js';
import {
  CHANNELS,
  DEMO_APPROVALS,
  DEMO_BRAND_BRAIN,
  DEMO_CAMPAIGNS,
  DEMO_FUNNEL,
  DEMO_GUARDRAILS,
  DEMO_WORKFLOWS,
  regenerateCopy,
  spendBlocked,
  type ApprovalDraft,
  type BrandBrain,
  type GuardrailState,
  type PaidCampaignDraft,
  type WorkflowRule,
} from '../services/marketing-automation.data.js';

const router = Router();
router.use(verifyJWT);

const DDL = [
  `CREATE TABLE IF NOT EXISTS ma_brand_brain (
    id INT NOT NULL PRIMARY KEY,
    business_name VARCHAR(200) NOT NULL,
    offers TEXT NULL,
    icp TEXT NULL,
    tone TEXT NULL,
    faqs TEXT NULL,
    disclaimers TEXT NULL,
    proof_points TEXT NULL,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS ma_approvals (
    id INT NOT NULL PRIMARY KEY,
    channel VARCHAR(40) NOT NULL,
    kind VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    confidence DECIMAL(4,2) NOT NULL,
    stage VARCHAR(20) NOT NULL,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS ma_workflows (
    id INT NOT NULL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    trigger_name VARCHAR(80) NOT NULL,
    stage VARCHAR(20) NOT NULL,
    channels VARCHAR(120) NOT NULL,
    quiet_hours TINYINT NOT NULL DEFAULT 1,
    enabled TINYINT NOT NULL DEFAULT 1,
    description VARCHAR(500) NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS ma_campaigns (
    id INT NOT NULL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    platform VARCHAR(80) NOT NULL,
    daily_cap INT NOT NULL,
    proposed_daily INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    launched TINYINT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS ma_guardrails (
    id INT NOT NULL PRIMARY KEY,
    daily_spend_cap INT NOT NULL,
    monthly_spend_cap INT NOT NULL,
    launch_requires_approval TINYINT NOT NULL DEFAULT 1,
    quiet_hours_start VARCHAR(5) NOT NULL,
    quiet_hours_end VARCHAR(5) NOT NULL,
    timezone_name VARCHAR(40) NOT NULL,
    promo_cooldown_hours INT NOT NULL,
    min_auto_send_confidence DECIMAL(4,2) NOT NULL,
    dlt_required TINYINT NOT NULL DEFAULT 1,
    wa_template_required TINYINT NOT NULL DEFAULT 1,
    email_unsubscribe_required TINYINT NOT NULL DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

let ready: Promise<boolean> | null = null;

async function ensure(): Promise<boolean> {
  if (!ready) {
    ready = (async () => {
      for (const sql of DDL) await prisma.$executeRawUnsafe(sql);
      const brain = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id FROM ma_brand_brain WHERE id = 1`
      );
      if (!brain.length) {
        const b = DEMO_BRAND_BRAIN;
        await prisma.$executeRawUnsafe(
          `INSERT INTO ma_brand_brain (id, business_name, offers, icp, tone, faqs, disclaimers, proof_points)
           VALUES (1,?,?,?,?,?,?,?)`,
          b.businessName,
          b.offers,
          b.icp,
          b.tone,
          b.faqs,
          b.disclaimers,
          b.proofPoints
        );
      }
      const approvals = await prisma.$queryRawUnsafe<any[]>(
        `SELECT COUNT(*) AS c FROM ma_approvals`
      );
      if (Number(approvals[0]?.c || 0) === 0) {
        for (const row of DEMO_APPROVALS) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO ma_approvals (id, channel, kind, title, body, status, confidence, stage)
             VALUES (?,?,?,?,?,?,?,?)`,
            row.id,
            row.channel,
            row.kind,
            row.title,
            row.body,
            row.status,
            row.confidence,
            row.stage
          );
        }
      }
      const flows = await prisma.$queryRawUnsafe<any[]>(`SELECT COUNT(*) AS c FROM ma_workflows`);
      if (Number(flows[0]?.c || 0) === 0) {
        for (const row of DEMO_WORKFLOWS) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO ma_workflows (id, name, trigger_name, stage, channels, quiet_hours, enabled, description)
             VALUES (?,?,?,?,?,?,?,?)`,
            row.id,
            row.name,
            row.trigger,
            row.stage,
            row.channels,
            row.quietHours ? 1 : 0,
            row.enabled ? 1 : 0,
            row.description
          );
        }
      }
      const campaigns = await prisma.$queryRawUnsafe<any[]>(
        `SELECT COUNT(*) AS c FROM ma_campaigns`
      );
      if (Number(campaigns[0]?.c || 0) === 0) {
        for (const row of DEMO_CAMPAIGNS) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO ma_campaigns (id, name, platform, daily_cap, proposed_daily, status, launched)
             VALUES (?,?,?,?,?,?,0)`,
            row.id,
            row.name,
            row.platform,
            row.dailyCap,
            row.proposedDaily,
            row.status
          );
        }
      }
      const guards = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id FROM ma_guardrails WHERE id = 1`
      );
      if (!guards.length) {
        const g = DEMO_GUARDRAILS;
        await prisma.$executeRawUnsafe(
          `INSERT INTO ma_guardrails
            (id, daily_spend_cap, monthly_spend_cap, launch_requires_approval, quiet_hours_start,
             quiet_hours_end, timezone_name, promo_cooldown_hours, min_auto_send_confidence,
             dlt_required, wa_template_required, email_unsubscribe_required)
           VALUES (1,?,?,1,?,?,?,?,?,?,?,?)`,
          g.dailySpendCap,
          g.monthlySpendCap,
          g.quietHoursStart,
          g.quietHoursEnd,
          g.timezone,
          g.promoCooldownHours,
          g.minAutoSendConfidence,
          g.dltRequiredForSms ? 1 : 0,
          g.whatsappTemplateRequired ? 1 : 0,
          g.emailUnsubscribeRequired ? 1 : 0
        );
      }
      return true;
    })().catch((err) => {
      ready = null;
      console.warn('marketing automation tables unavailable:', (err as Error).message);
      return false;
    });
  }
  return ready;
}

function mapApproval(row: any): ApprovalDraft {
  return {
    id: Number(row.id),
    channel: row.channel,
    kind: row.kind,
    title: row.title,
    body: row.body,
    status: row.status,
    confidence: Number(row.confidence),
    stage: row.stage,
  };
}

function mapWorkflow(row: any): WorkflowRule {
  return {
    id: Number(row.id),
    name: row.name,
    trigger: row.trigger_name,
    stage: row.stage,
    channels: row.channels,
    quietHours: Boolean(row.quiet_hours),
    enabled: Boolean(row.enabled),
    description: row.description || '',
  };
}

function mapCampaign(row: any): PaidCampaignDraft {
  return {
    id: Number(row.id),
    name: row.name,
    platform: row.platform,
    dailyCap: Number(row.daily_cap),
    proposedDaily: Number(row.proposed_daily),
    status: row.status,
    launched: Boolean(row.launched),
  };
}

function mapGuard(row: any): GuardrailState {
  return {
    executionMode: 'dry_run',
    dailySpendCap: Number(row.daily_spend_cap),
    monthlySpendCap: Number(row.monthly_spend_cap),
    launchRequiresApproval: Boolean(row.launch_requires_approval),
    quietHoursStart: row.quiet_hours_start,
    quietHoursEnd: row.quiet_hours_end,
    timezone: row.timezone_name,
    promoCooldownHours: Number(row.promo_cooldown_hours),
    minAutoSendConfidence: Number(row.min_auto_send_confidence),
    dltRequiredForSms: Boolean(row.dlt_required),
    whatsappTemplateRequired: Boolean(row.wa_template_required),
    emailUnsubscribeRequired: Boolean(row.email_unsubscribe_required),
  };
}

async function approvals(): Promise<ApprovalDraft[]> {
  if (!(await ensure())) return DEMO_APPROVALS;
  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM ma_approvals ORDER BY id`);
  return rows.map(mapApproval);
}

async function workflows(): Promise<WorkflowRule[]> {
  if (!(await ensure())) return DEMO_WORKFLOWS;
  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM ma_workflows ORDER BY id`);
  return rows.map(mapWorkflow);
}

async function campaigns(): Promise<PaidCampaignDraft[]> {
  if (!(await ensure())) return DEMO_CAMPAIGNS;
  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM ma_campaigns ORDER BY id`);
  return rows.map(mapCampaign);
}

async function guardrails(): Promise<GuardrailState> {
  if (!(await ensure())) return DEMO_GUARDRAILS;
  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM ma_guardrails WHERE id = 1`);
  return rows[0] ? mapGuard(rows[0]) : DEMO_GUARDRAILS;
}

async function brain(): Promise<BrandBrain> {
  if (!(await ensure())) return DEMO_BRAND_BRAIN;
  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM ma_brand_brain WHERE id = 1`);
  const row = rows[0];
  if (!row) return DEMO_BRAND_BRAIN;
  return {
    businessName: row.business_name,
    offers: row.offers || '',
    icp: row.icp || '',
    tone: row.tone || '',
    faqs: row.faqs || '',
    disclaimers: row.disclaimers || '',
    proofPoints: row.proof_points || '',
  };
}

router.get('/overview', async (_req, res) => {
  const [items, flows, ads, guard, brand] = await Promise.all([
    approvals(),
    workflows(),
    campaigns(),
    guardrails(),
    brain(),
  ]);
  const pending = items.filter((item) => item.status === 'pending').length;
  const blocked = ads.filter((ad) => spendBlocked(ad.proposedDaily, guard.dailySpendCap)).length;
  res.json({
    success: true,
    data: {
      executionMode: 'dry_run',
      externalCall: false,
      brandName: brand.businessName,
      pendingApprovals: pending,
      activeWorkflows: flows.filter((flow) => flow.enabled).length,
      paidDrafts: ads.length,
      overCapDrafts: blocked,
      funnel: DEMO_FUNNEL,
      quietHours: `${guard.quietHoursStart}–${guard.quietHoursEnd} ${guard.timezone}`,
      dailySpendCap: guard.dailySpendCap,
    },
  });
});

router.get('/channels', (_req, res) => {
  res.json({ success: true, data: CHANNELS, executionMode: 'dry_run' });
});

router.get('/funnel', (_req, res) => {
  res.json({ success: true, data: DEMO_FUNNEL, executionMode: 'dry_run' });
});

router.get('/inbox', async (_req, res) => {
  res.json({ success: true, data: await approvals(), executionMode: 'dry_run' });
});

router.post('/inbox/:id/approve', async (req, res) => {
  const id = Number(req.params.id);
  if (await ensure()) {
    await prisma.$executeRawUnsafe(`UPDATE ma_approvals SET status = 'approved' WHERE id = ?`, id);
  }
  res.json({
    success: true,
    executionMode: 'dry_run',
    externalCall: false,
    message: 'Approved for the local schedule. Nothing was published or sent.',
  });
});

router.post('/inbox/:id/edit', async (req, res) => {
  const id = Number(req.params.id);
  const body = String(req.body?.body || '').slice(0, 4000);
  if (!body.trim()) {
    res.status(400).json({ success: false, error: 'Edited copy is required.' });
    return;
  }
  if (await ensure()) {
    await prisma.$executeRawUnsafe(
      `UPDATE ma_approvals SET body = ?, status = 'edited' WHERE id = ?`,
      body,
      id
    );
  }
  res.json({ success: true, executionMode: 'dry_run', externalCall: false, body });
});

router.post('/inbox/:id/regenerate', async (req, res) => {
  const id = Number(req.params.id);
  const rows = await approvals();
  const current = rows.find((row) => row.id === id);
  if (!current) {
    res.status(404).json({ success: false, error: 'Draft not found.' });
    return;
  }
  const body = regenerateCopy(current.body, id + current.body.length);
  if (await ensure()) {
    await prisma.$executeRawUnsafe(
      `UPDATE ma_approvals SET body = ?, status = 'regenerated' WHERE id = ?`,
      body,
      id
    );
  }
  res.json({
    success: true,
    executionMode: 'dry_run',
    externalCall: false,
    body,
    note: 'Rewritten by the local template. No language-model API was called.',
  });
});

router.get('/brand-brain', async (_req, res) => {
  const company = await getPublicBrand();
  const data = await brain();
  res.json({
    success: true,
    data: { ...data, companyName: company.companyName },
    executionMode: 'dry_run',
  });
});

router.put('/brand-brain', async (req, res) => {
  const current = await brain();
  const next: BrandBrain = {
    businessName: String(req.body?.businessName || current.businessName).slice(0, 200),
    offers: String(req.body?.offers ?? current.offers),
    icp: String(req.body?.icp ?? current.icp),
    tone: String(req.body?.tone ?? current.tone),
    faqs: String(req.body?.faqs ?? current.faqs),
    disclaimers: String(req.body?.disclaimers ?? current.disclaimers),
    proofPoints: String(req.body?.proofPoints ?? current.proofPoints),
  };
  if (await ensure()) {
    await prisma.$executeRawUnsafe(
      `UPDATE ma_brand_brain
       SET business_name=?, offers=?, icp=?, tone=?, faqs=?, disclaimers=?, proof_points=?
       WHERE id = 1`,
      next.businessName,
      next.offers,
      next.icp,
      next.tone,
      next.faqs,
      next.disclaimers,
      next.proofPoints
    );
  }
  res.json({ success: true, data: next, executionMode: 'dry_run' });
});

router.get('/workflows', async (_req, res) => {
  res.json({ success: true, data: await workflows(), executionMode: 'dry_run' });
});

router.post('/workflows/:id/toggle', async (req, res) => {
  const id = Number(req.params.id);
  const rows = await workflows();
  const current = rows.find((row) => row.id === id);
  if (!current) {
    res.status(404).json({ success: false, error: 'Workflow not found.' });
    return;
  }
  const enabled = req.body?.enabled === undefined ? !current.enabled : Boolean(req.body.enabled);
  if (await ensure()) {
    await prisma.$executeRawUnsafe(
      `UPDATE ma_workflows SET enabled = ? WHERE id = ?`,
      enabled ? 1 : 0,
      id
    );
  }
  res.json({ success: true, enabled, executionMode: 'dry_run', externalCall: false });
});

router.get('/campaigns', async (_req, res) => {
  const guard = await guardrails();
  const rows = await campaigns();
  res.json({
    success: true,
    executionMode: 'dry_run',
    dailySpendCap: guard.dailySpendCap,
    data: rows.map((row) => ({
      ...row,
      capViolation: spendBlocked(row.proposedDaily, guard.dailySpendCap),
    })),
  });
});

router.post('/campaigns/:id/approve', async (req, res) => {
  const id = Number(req.params.id);
  const guard = await guardrails();
  const rows = await campaigns();
  const current = rows.find((row) => row.id === id);
  if (!current) {
    res.status(404).json({ success: false, error: 'Campaign not found.' });
    return;
  }
  const violation = spendBlocked(current.proposedDaily, guard.dailySpendCap);
  if (violation) {
    res.status(400).json({ success: false, error: violation, executionMode: 'dry_run' });
    return;
  }
  if (await ensure()) {
    await prisma.$executeRawUnsafe(`UPDATE ma_campaigns SET status = 'approved' WHERE id = ?`, id);
  }
  res.json({
    success: true,
    executionMode: 'dry_run',
    externalCall: false,
    message: 'Approved inside the cap. The campaign is still not launched.',
  });
});

router.post('/campaigns/:id/launch', async (req, res) => {
  const guard = await guardrails();
  if (guard.launchRequiresApproval) {
    const rows = await campaigns();
    const current = rows.find((row) => row.id === Number(req.params.id));
    if (!current || current.status !== 'approved') {
      res.status(403).json({
        success: false,
        error: 'Launch is locked until the draft is approved and inside the spend cap.',
        executionMode: 'dry_run',
      });
      return;
    }
  }
  res.json({
    success: true,
    executionMode: 'dry_run',
    externalCall: false,
    launched: false,
    message: 'Dry-run only. No ad account was contacted and no money was spent.',
  });
});

router.get('/guardrails', async (_req, res) => {
  res.json({ success: true, data: await guardrails() });
});

router.put('/guardrails', async (req, res) => {
  const current = await guardrails();
  const daily = Number(req.body?.dailySpendCap ?? current.dailySpendCap);
  const monthly = Number(req.body?.monthlySpendCap ?? current.monthlySpendCap);
  if (daily <= 0 || monthly < daily) {
    res.status(400).json({
      success: false,
      error: 'Daily cap must be positive and not higher than the monthly cap.',
    });
    return;
  }
  if (await ensure()) {
    await prisma.$executeRawUnsafe(
      `UPDATE ma_guardrails
       SET daily_spend_cap=?, monthly_spend_cap=?, quiet_hours_start=?, quiet_hours_end=?,
           promo_cooldown_hours=?, min_auto_send_confidence=?, launch_requires_approval=1
       WHERE id = 1`,
      daily,
      monthly,
      String(req.body?.quietHoursStart || current.quietHoursStart).slice(0, 5),
      String(req.body?.quietHoursEnd || current.quietHoursEnd).slice(0, 5),
      Number(req.body?.promoCooldownHours ?? current.promoCooldownHours),
      Number(req.body?.minAutoSendConfidence ?? current.minAutoSendConfidence)
    );
  }
  res.json({ success: true, data: await guardrails(), executionMode: 'dry_run' });
});

export default router;
