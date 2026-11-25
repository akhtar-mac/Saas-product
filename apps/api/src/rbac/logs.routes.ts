/**
 * /v1/crm/audit-logs — all-user activity log (Admin: logs:view, CSV: logs:export)
 * Retention: 1 year. Old rows are removed only by the manual purge script
 * (apps/api/scripts/purge-audit-logs.mjs), never automatically.
 */
import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { hasColumn } from './schema-features.js';
import { recordAuditLog } from '../services/audit.service.js';

const router = Router();
router.use(verifyJWT);

const n = (v: any) => (typeof v === 'bigint' ? Number(v) : v);

/** 'YYYY-MM-DDTHH:mm:ss' in India time -> 'YYYY-MM-DD HH:mm:ss' UTC. */
const istToUtc = (local: string) =>
  new Date(new Date(`${local}+05:30`).getTime()).toISOString().slice(0, 19).replace('T', ' ');

async function cols() {
  const extended = await hasColumn('audit_logs', 'module');
  return extended
    ? `id, actor_id, actor_email, actor_role, actor_name, actor_source, action, resource, resource_id,
       module, summary, status_code, method, path, ip_address, created_at`
    : `id, actor_id, actor_email, actor_role, NULL AS actor_name, NULL AS actor_source, action, resource,
       resource_id, NULL AS module, NULL AS summary, NULL AS status_code, NULL AS method, NULL AS path,
       ip_address, created_at`;
}

async function buildWhere(req: Request) {
  const q = req.query as Record<string, string | undefined>;
  const extended = await hasColumn('audit_logs', 'module');
  const where: string[] = ['1=1'];
  const params: any[] = [];
  if (q.actor_id) {
    where.push('actor_id = ?');
    params.push(Number(q.actor_id));
  }
  if (q.actor_source && extended) {
    where.push('actor_source = ?');
    params.push(q.actor_source);
  }
  if (q.module && extended) {
    where.push('module = ?');
    params.push(q.module);
  }
  if (q.action) {
    where.push('action = ?');
    params.push(q.action);
  }
  if (q.status === 'failed' && extended) where.push('status_code >= 400');
  if (q.status === 'ok' && extended) where.push('(status_code IS NULL OR status_code < 400)');
  if (q.from && /^\d{4}-\d{2}-\d{2}$/.test(q.from)) {
    // Dates are picked in India time; created_at is stored in UTC.
    where.push('created_at >= ?');
    params.push(istToUtc(`${q.from}T00:00:00`));
  }
  if (q.to && /^\d{4}-\d{2}-\d{2}$/.test(q.to)) {
    where.push('created_at <= ?');
    params.push(istToUtc(`${q.to}T23:59:59`));
  }
  if (q.search) {
    const s = `%${String(q.search).slice(0, 100)}%`;
    where.push(
      extended
        ? '(summary LIKE ? OR actor_name LIKE ? OR actor_email LIKE ? OR resource_id LIKE ? OR path LIKE ?)'
        : '(actor_email LIKE ? OR resource_id LIKE ? OR action LIKE ? OR resource LIKE ? OR payload LIKE ?)'
    );
    params.push(s, s, s, s, s);
  }
  return { sql: where.join(' AND '), params };
}

function shape(r: any) {
  return {
    id: n(r.id),
    actor_id: n(r.actor_id),
    actor_name: r.actor_name || r.actor_email || (r.actor_id ? `User #${n(r.actor_id)}` : 'System'),
    actor_email: r.actor_email,
    actor_role: r.actor_role,
    actor_source: r.actor_source,
    action: r.action,
    resource: r.resource,
    resource_id: r.resource_id,
    module: r.module || r.resource,
    summary: r.summary || `${r.action} ${r.resource}${r.resource_id ? ' #' + r.resource_id : ''}`,
    status_code: n(r.status_code),
    method: r.method,
    path: r.path,
    ip_address: r.ip_address,
    created_at: r.created_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Math.max(10, Number(req.query.limit) || 50));
    const { sql, params } = await buildWhere(req);
    const [rows, total]: any[] = await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT ${await cols()} FROM audit_logs WHERE ${sql} ORDER BY id DESC LIMIT ? OFFSET ?`,
        ...params,
        limit,
        (page - 1) * limit
      ),
      prisma.$queryRawUnsafe(`SELECT COUNT(*) c FROM audit_logs WHERE ${sql}`, ...params),
    ]);
    res.json({ success: true, data: rows.map(shape), total: n(total[0]?.c) || 0, page, limit });
  } catch (err: any) {
    console.error('[audit-logs]', err?.message);
    res.status(500).json({ success: false, error: 'Failed to load logs.' });
  }
});

router.get('/facets', async (_req, res) => {
  try {
    const extended = await hasColumn('audit_logs', 'module');
    const since = `created_at >= UTC_TIMESTAMP() - INTERVAL 365 DAY`;
    const [actors, modules, actions]: any[] = await Promise.all([
      prisma.$queryRawUnsafe(
        extended
          ? `SELECT actor_id, actor_source, MAX(actor_name) name, MAX(actor_email) email, COUNT(*) c
             FROM audit_logs WHERE ${since} AND actor_id IS NOT NULL GROUP BY actor_id, actor_source ORDER BY name LIMIT 500`
          : `SELECT actor_id, NULL actor_source, MAX(actor_email) name, MAX(actor_email) email, COUNT(*) c
             FROM audit_logs WHERE ${since} AND actor_id IS NOT NULL GROUP BY actor_id ORDER BY name LIMIT 500`
      ),
      prisma.$queryRawUnsafe(
        extended
          ? `SELECT module v, COUNT(*) c FROM audit_logs WHERE ${since} AND module IS NOT NULL GROUP BY module ORDER BY module`
          : `SELECT resource v, COUNT(*) c FROM audit_logs WHERE ${since} GROUP BY resource ORDER BY resource`
      ),
      prisma.$queryRawUnsafe(
        `SELECT action v, COUNT(*) c FROM audit_logs WHERE ${since} GROUP BY action ORDER BY action LIMIT 200`
      ),
    ]);
    res.json({
      success: true,
      data: {
        actors: actors.map((a: any) => ({
          actor_id: n(a.actor_id),
          actor_source: a.actor_source,
          name: a.name || a.email || `User #${n(a.actor_id)}`,
          count: n(a.c),
        })),
        modules: modules.map((m: any) => ({ value: m.v, count: n(m.c) })),
        actions: actions.map((m: any) => ({ value: m.v, count: n(m.c) })),
        retention_days: 365,
      },
    });
  } catch (err: any) {
    console.error('[audit-logs facets]', err?.message);
    res.status(500).json({ success: false, error: 'Failed to load filters.' });
  }
});

const ist = (d: any) => {
  const t = d instanceof Date ? d : new Date(d);
  if (isNaN(t.getTime())) return '';
  return new Date(t.getTime() + 330 * 60000).toISOString().replace('T', ' ').slice(0, 19) + ' IST';
};

const csvCell = (v: any) => {
  if (v === null || v === undefined) return '';
  const s = v instanceof Date ? v.toISOString() : String(v);
  // neutralise spreadsheet formulas
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

router.get('/export', async (req: Request, res: Response) => {
  try {
    const { sql, params } = await buildWhere(req);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT ${await cols()} FROM audit_logs WHERE ${sql} ORDER BY id DESC LIMIT 50000`,
      ...params
    );
    const head = [
      'id',
      'time',
      'user',
      'email',
      'role',
      'module',
      'action',
      'summary',
      'record',
      'status',
      'ip',
    ];
    const lines = [head.join(',')].concat(
      rows
        .map(shape)
        .map((r) =>
          [
            r.id,
            ist(r.created_at),
            r.actor_name,
            r.actor_email,
            r.actor_role,
            r.module,
            r.action,
            r.summary,
            r.resource_id,
            r.status_code,
            r.ip_address,
          ]
            .map(csvCell)
            .join(',')
        )
    );
    res.locals.auditLogged = true;
    const a = req.rbac?.profile;
    void recordAuditLog({
      actorId: a?.id,
      actorEmail: a?.email,
      actorName: a?.name,
      actorRole: a?.roleKey,
      actorSource: a?.source,
      action: 'export',
      resource: 'audit_logs',
      module: 'Logs',
      summary: `Exported ${rows.length} log rows to CSV`,
      statusCode: 200,
      method: 'GET',
      path: req.path,
      payload: { query: req.query },
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="activity-logs-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send('\uFEFF' + lines.join('\r\n'));
  } catch (err: any) {
    console.error('[audit-logs export]', err?.message);
    res.status(500).json({ success: false, error: 'Failed to export logs.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const extended = await hasColumn('audit_logs', 'module');
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT ${await cols()}, payload, ${extended ? 'changes' : 'NULL AS changes'}, user_agent FROM audit_logs WHERE id = ?`,
      Number(req.params.id)
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Log entry not found.' });
    const parse = (s: any) => {
      if (!s) return null;
      try {
        return JSON.parse(s);
      } catch {
        return s;
      }
    };
    const payload = parse(rows[0].payload);
    let changes = parse(rows[0].changes);
    if (
      !changes &&
      payload &&
      typeof payload === 'object' &&
      ('before' in payload || 'oldState' in payload)
    ) {
      changes = {
        before: payload.before ?? payload.oldState ?? null,
        after: payload.after ?? payload.newState ?? null,
      };
    }
    res.json({
      success: true,
      data: { ...shape(rows[0]), payload, changes, user_agent: rows[0].user_agent },
    });
  } catch (err: any) {
    console.error('[audit-logs detail]', err?.message);
    res.status(500).json({ success: false, error: 'Failed to load log entry.' });
  }
});

export default router;
