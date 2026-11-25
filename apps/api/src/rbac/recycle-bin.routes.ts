/**
 * /v1/crm/recycle-bin            — list / view / restore (SA + Admin) / purge (SA only)
 * deleteRoutes (mounted on /v1/crm and /v1/staff before crm.routes.ts) — the
 * existing DELETE endpoints now move rows to the Recycle Bin instead of
 * removing them for good. Responses keep the old shape ({ success, message }).
 */
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { recordAuditLog } from '../services/audit.service.js';
import {
  Actor,
  BinError,
  ENTITY_LABELS,
  EntityType,
  LEAD_TABLES,
  archiveCustomerOrOrders,
  archiveInternalTask,
  archiveOperationTask,
  archiveServiceQuestion,
  archiveStaffUser,
  getBinItem,
  purgeItem,
  restoreItem,
  softDeleteLead,
} from './recycle-bin.service.js';
import { hasTable } from './schema-features.js';
import { getAccessProfile, invalidateAccess } from './rbac.service.js';

const n = (v: any) => (typeof v === 'bigint' ? Number(v) : v);

function actor(req: Request): Actor {
  const p = req.rbac?.profile;
  return {
    id: p?.id ?? Number(req.user?.user_id),
    name: p?.name ?? req.user?.username ?? '',
    source: p?.source ?? 'users',
  };
}

function audit(req: Request, res: Response, p: Parameters<typeof recordAuditLog>[0]) {
  res.locals.auditLogged = true;
  const a = req.rbac?.profile;
  void recordAuditLog({
    actorId: a?.id ?? req.user?.user_id,
    actorEmail: a?.email ?? req.user?.email,
    actorName: a?.name ?? req.user?.username,
    actorRole: a?.roleKey ?? req.user?.role_name,
    actorSource: a?.source,
    statusCode: 200,
    method: req.method,
    path: req.path,
    ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
    userAgent: req.headers['user-agent'],
    ...p,
  });
}

function fail(res: Response, err: any, fallback: string) {
  if (err instanceof BinError)
    return res
      .status(err.status)
      .json({ success: false, error: err.message, message: err.message });
  console.error('[recycle-bin]', err?.message || err);
  return res
    .status(500)
    .json({ success: false, error: fallback, message: err?.message || fallback });
}

const reasonOf = (req: Request) =>
  String((req.body && req.body.reason) || req.query.reason || '').slice(0, 255) || undefined;

// ═══ Recycle Bin screen API ═══════════════════════════════════════════════════
export const recycleBinRouter = Router();
recycleBinRouter.use(verifyJWT);

recycleBinRouter.get('/', async (req, res) => {
  try {
    if (!(await hasTable('recycle_bin_items'))) {
      return res.json({ success: true, data: [], total: 0, counts: {}, ready: false });
    }
    const q = req.query as Record<string, string | undefined>;
    const where = ['1=1'];
    const params: any[] = [];
    const status = q.status || 'in_bin';
    if (status !== 'all') {
      where.push('status = ?');
      params.push(status);
    }
    if (q.type && q.type !== 'all') {
      if (q.type === 'leads') where.push(`entity_type IN ('lead','lead_udyami','lead_sahakar')`);
      else if (q.type === 'customers') where.push(`entity_type IN ('customer','order')`);
      else if (q.type === 'tasks') where.push(`entity_type IN ('operation_task','internal_task')`);
      else {
        where.push('entity_type = ?');
        params.push(q.type);
      }
    }
    if (q.search) {
      const s = `%${q.search.slice(0, 100)}%`;
      where.push('(title LIKE ? OR subtitle LIKE ? OR entity_id LIKE ? OR deleted_by_name LIKE ?)');
      params.push(s, s, s, s);
    }
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(200, Math.max(10, Number(q.limit) || 50));
    const [rows, total, counts]: any[] = await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT id, entity_type, entity_id, title, subtitle, mode, related_counts, deleted_by, deleted_by_name,
                deleted_at, delete_reason, status, restored_by_name, restored_at, purged_by_name, purged_at
         FROM recycle_bin_items WHERE ${where.join(' AND ')} ORDER BY id DESC LIMIT ? OFFSET ?`,
        ...params,
        limit,
        (page - 1) * limit
      ),
      prisma.$queryRawUnsafe(
        `SELECT COUNT(*) c FROM recycle_bin_items WHERE ${where.join(' AND ')}`,
        ...params
      ),
      prisma.$queryRawUnsafe(
        `SELECT entity_type t, COUNT(*) c FROM recycle_bin_items WHERE status = 'in_bin' GROUP BY entity_type`
      ),
    ]);
    res.json({
      success: true,
      ready: true,
      data: rows.map((r: any) => ({
        ...r,
        id: n(r.id),
        deleted_by: n(r.deleted_by),
        type_label: ENTITY_LABELS[r.entity_type as EntityType] || r.entity_type,
        related_counts: r.related_counts ? JSON.parse(r.related_counts) : null,
      })),
      total: n(total[0]?.c) || 0,
      counts: Object.fromEntries(counts.map((c: any) => [c.t, n(c.c)])),
      can_restore: !!req.rbac?.has('recycle_bin:restore'),
      can_purge: !!req.rbac?.has('recycle_bin:purge'),
    });
  } catch (err) {
    fail(res, err, 'Failed to load the Recycle Bin.');
  }
});

recycleBinRouter.get('/:id', async (req, res) => {
  try {
    const item = await getBinItem(Number(req.params.id));
    let linkedCalls = 0;
    if (item.entity_type === 'lead') {
      const c: any[] = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) n FROM call_history WHERE lead_id = ?`,
        Number(item.entity_id)
      );
      linkedCalls = n(c[0]?.n) || 0;
    }
    const { related_snapshot, ...rawRest } = item;
    const rest = Object.fromEntries(
      Object.entries(rawRest).map(([k, v]) => [k, typeof v === 'bigint' ? Number(v) : v])
    );
    res.json({
      success: true,
      data: {
        ...rest,
        id: n(item.id),
        type_label: ENTITY_LABELS[item.entity_type as EntityType] || item.entity_type,
        payload_snapshot: item.payload_snapshot ? JSON.parse(item.payload_snapshot) : null,
        related_counts: item.related_counts ? JSON.parse(item.related_counts) : null,
        linked_calls: linkedCalls,
      },
    });
  } catch (err) {
    fail(res, err, 'Failed to load the item.');
  }
});

recycleBinRouter.post('/:id/restore', async (req, res) => {
  try {
    const item = await restoreItem(Number(req.params.id), actor(req));
    if (item.entity_type === 'staff_user') invalidateAccess('staff_users', Number(item.entity_id));
    audit(req, res, {
      action: 'restore',
      resource: item.entity_type,
      resourceId: item.entity_id,
      module: 'Recycle Bin',
      summary: `Restored ${ENTITY_LABELS[item.entity_type as EntityType] || item.entity_type} "${item.title}" (#${item.entity_id})`,
      oldState: { status: 'in_bin' },
      newState: { status: 'restored' },
    });
    res.json({ success: true, message: 'Restored.' });
  } catch (err) {
    fail(res, err, 'Failed to restore.');
  }
});

recycleBinRouter.delete('/:id', async (req, res) => {
  try {
    // Route guard already requires recycle_bin:purge (Super Admin only); double-check the role.
    if (!req.rbac?.profile.isSuperAdmin) {
      return res
        .status(403)
        .json({ success: false, error: 'Only Super Admin can delete forever.' });
    }
    const { item, removedCalls } = await purgeItem(Number(req.params.id), actor(req));
    audit(req, res, {
      action: 'purge',
      resource: item.entity_type,
      resourceId: item.entity_id,
      module: 'Recycle Bin',
      summary: `Deleted forever: ${ENTITY_LABELS[item.entity_type as EntityType] || item.entity_type} "${item.title}" (#${item.entity_id})${removedCalls ? `, with ${removedCalls} call records` : ''}`,
      oldState: { status: 'in_bin', title: item.title },
      newState: { status: 'purged' },
    });
    res.json({ success: true, message: 'Deleted forever.' });
  } catch (err) {
    fail(res, err, 'Failed to delete.');
  }
});

// ═══ DELETE endpoints -> Recycle Bin ══════════════════════════════════════════
export const deleteRoutes = Router();

/** Until the migration is applied, fall back to the old hard delete (unchanged behaviour). */
async function binReady(_req: Request, _res: Response, next: NextFunction) {
  if (await hasTable('recycle_bin_items')) return next();
  return next('router');
}

deleteRoutes.delete('/leads/:id', verifyJWT, async (req, res) => {
  try {
    const raw = String(req.query.book || req.query.source || 'etax').toLowerCase();
    const book =
      raw.includes('udyam') || raw.includes('uddyomi')
        ? 'udyami'
        : raw.includes('sahakar')
          ? 'sahakar'
          : 'etax';
    const id = Number(req.params.id);
    const r = await softDeleteLead(book, id, actor(req), reasonOf(req));
    audit(req, res, {
      action: 'delete',
      resource: LEAD_TABLES[book].table,
      resourceId: id,
      module: 'Leads',
      summary: `Moved lead "${r.row?.name || id}" (#${id}) to the Recycle Bin`,
      oldState: {
        name: r.row?.name,
        contact: r.row?.contact,
        service: r.row?.service,
        source: r.row?.source,
      },
      newState: { deleted: true, reason: reasonOf(req) || null },
    });
    res.json({ success: true, message: 'Lead moved to the Recycle Bin.', bin_id: r.binId });
  } catch (err) {
    fail(res, err, 'Failed to delete lead.');
  }
});

deleteRoutes.delete('/customers/:id', binReady, verifyJWT, async (req, res) => {
  try {
    const custId = Number(req.params.id);
    const orderId = req.query.order_id ? Number(req.query.order_id) : undefined;
    const packageId = req.query.package_id ? String(req.query.package_id) : undefined;
    const r = await archiveCustomerOrOrders(
      custId,
      { orderId, packageId },
      actor(req),
      reasonOf(req)
    );
    const counts = Object.fromEntries(r.snapshot.tables.map((t) => [t.table, t.rows.length]));
    audit(req, res, {
      action: 'delete',
      resource: r.kind === 'orders' ? 'orders' : 'customers',
      resourceId: r.kind === 'orders' ? (orderId ?? custId) : custId,
      module: 'Customers',
      summary:
        r.kind === 'orders'
          ? `Moved ${r.count} order(s) of customer #${custId} to the Recycle Bin`
          : `Moved customer #${custId} to the Recycle Bin`,
      oldState: counts,
      newState: { deleted: true },
    });
    res.json({
      success: true,
      message: 'Order / Customer moved to the Recycle Bin.',
      bin_id: r.binId,
    });
  } catch (err) {
    fail(res, err, 'Failed to delete customer');
  }
});

deleteRoutes.delete('/tasks/:id', binReady, verifyJWT, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const r = await archiveOperationTask(id, actor(req), reasonOf(req));
    audit(req, res, {
      action: 'delete',
      resource: 'operation_tasks',
      resourceId: id,
      module: 'Tasks',
      summary: `Moved task #${id} to the Recycle Bin`,
      oldState: r.snapshot.tables[0]?.rows[0]
        ? { task_name: r.snapshot.tables[0].rows[0].task_name }
        : null,
      newState: { deleted: true },
    });
    res.json({ success: true, message: 'Task moved to the Recycle Bin.', bin_id: r.binId });
  } catch (err) {
    fail(res, err, 'Failed to delete task');
  }
});

deleteRoutes.delete('/internal-tasks/:id', binReady, verifyJWT, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const r = await archiveInternalTask(id, actor(req), reasonOf(req));
    audit(req, res, {
      action: 'delete',
      resource: 'task_excel',
      resourceId: id,
      module: 'Internal Tasks',
      summary: `Moved internal task #${id} to the Recycle Bin`,
      oldState: r.snapshot.tables[0]?.rows[0]
        ? { task_name: r.snapshot.tables[0].rows[0].task_name }
        : null,
      newState: { deleted: true },
    });
    res.json({ success: true, bin_id: r.binId });
  } catch (err) {
    fail(res, err, 'Failed to delete task');
  }
});

deleteRoutes.delete('/service-questions/:id', binReady, verifyJWT, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const r = await archiveServiceQuestion(id, actor(req), reasonOf(req));
    audit(req, res, {
      action: 'delete',
      resource: 'service_questions',
      resourceId: id,
      module: 'Service Questions',
      summary: `Moved service question #${id} to the Recycle Bin`,
      oldState: r.snapshot.tables[0]?.rows[0]
        ? { question: r.snapshot.tables[0].rows[0].question }
        : null,
      newState: { deleted: true },
    });
    res.json({ success: true, message: 'Question moved to the Recycle Bin.', bin_id: r.binId });
  } catch (err) {
    fail(res, err, 'Failed to delete question');
  }
});

deleteRoutes.delete('/users/:id', binReady, verifyJWT, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const me = req.rbac?.profile;
    const target = await getAccessProfile('staff_users', id, { fresh: true });
    if (!target) throw new BinError(404, 'User not found.');
    if (me && me.source === 'staff_users' && me.id === id)
      throw new BinError(403, 'You cannot delete your own account.');
    if ((target.isSuperAdmin || target.roleIds.includes(2)) && !me?.isSuperAdmin) {
      throw new BinError(403, 'Only a Super Admin can delete a Super Admin or Admin account.');
    }
    const r = await archiveStaffUser(id, actor(req), reasonOf(req));
    invalidateAccess('staff_users', id);
    audit(req, res, {
      action: 'delete',
      resource: 'staff_users',
      resourceId: id,
      module: 'Users & Access',
      summary: `Moved staff user "${target.name}" to the Recycle Bin`,
      oldState: { name: target.name, email: target.email, role: target.roleName },
      newState: { deleted: true },
    });
    res.json({ success: true, message: 'User moved to the Recycle Bin.', bin_id: r.binId });
  } catch (err) {
    fail(res, err, 'Failed to delete user');
  }
});
