/**
 * Recycle Bin.
 *
 * Two ways an item goes to the bin:
 *  - "flag" (leads, leads_udyamikisan, leads_sahakarsamridhi): the row stays and
 *    gets deleted_at / deleted_by. Leads must stay in place because call_history
 *    and lead_answers have ON DELETE CASCADE foreign keys to leads.id, and new
 *    lead ids are made with MAX(id)+1 (a removed top id would be reused).
 *  - "archive" (customers / orders, operation tasks, internal tasks, service
 *    questions, staff_users): the rows are copied in full (with their linked
 *    rows) into recycle_bin_items, then removed exactly as the old delete did.
 *    Restore re-inserts the same rows with the same ids.
 *
 * Restore: Super Admin + Admin. Delete forever: Super Admin only.
 */
import { prisma } from '../config/db.js';
import { hasColumn, hasTable } from './schema-features.js';

export type EntityType =
  | 'lead'
  | 'lead_udyami'
  | 'lead_sahakar'
  | 'customer'
  | 'order'
  | 'operation_task'
  | 'internal_task'
  | 'service_question'
  | 'staff_user';

export const ENTITY_LABELS: Record<EntityType, string> = {
  lead: 'Lead',
  lead_udyami: 'Lead (Udyami)',
  lead_sahakar: 'Lead (Sahakar)',
  customer: 'Customer',
  order: 'Order',
  operation_task: 'Operation task',
  internal_task: 'Internal task',
  service_question: 'Service question',
  staff_user: 'Staff user',
};

export const LEAD_TABLES: Record<string, { table: string; type: EntityType }> = {
  etax: { table: 'leads', type: 'lead' },
  udyami: { table: 'leads_udyamikisan', type: 'lead_udyami' },
  sahakar: { table: 'leads_sahakarsamridhi', type: 'lead_sahakar' },
};

export interface Actor {
  id: number;
  name: string;
  source: string;
}

type Rows = Record<string, any[]>;
interface Snapshot {
  /** table -> rows, in insert order (parents first) */
  tables: Array<{ table: string; pk: string; rows: any[] }>;
}

const DATE_TYPES = new Set(['date', 'datetime', 'timestamp']);
const colTypeCache = new Map<string, Map<string, string>>();

async function columnTypes(table: string): Promise<Map<string, string>> {
  if (colTypeCache.has(table)) return colTypeCache.get(table)!;
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT COLUMN_NAME c, DATA_TYPE t FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    table
  );
  const m = new Map(rows.map((r) => [String(r.c), String(r.t).toLowerCase()]));
  colTypeCache.set(table, m);
  return m;
}

function jsonSafe(v: any): any {
  return JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? x.toString() : x)));
}

async function select(table: string, where: string, ...params: any[]): Promise<any[]> {
  return prisma.$queryRawUnsafe(`SELECT * FROM \`${table}\` WHERE ${where}`, ...params);
}

function titleOf(type: EntityType, row: any): { title: string; subtitle: string } {
  const r = row || {};
  switch (type) {
    case 'lead':
    case 'lead_udyami':
    case 'lead_sahakar':
      return {
        title: r.name || `Lead #${r.id}`,
        subtitle: [r.service, r.city, r.source].filter(Boolean).join(' · '),
      };
    case 'customer':
      return {
        title: r.name || r.business || `Customer #${r.id}`,
        subtitle: [r.business, r.service].filter(Boolean).join(' · '),
      };
    case 'order':
      return {
        title: `${r._orders ? r._orders + ' orders (first #' + r.id + ')' : 'Order #' + r.id}${r.company_name && r.company_name !== 'NA' ? ' · ' + r.company_name : ''}`,
        subtitle: `Customer #${r.customer_id} · ₹${r.total_amount ?? 0}`,
      };
    case 'operation_task':
      return { title: r.task_name || `Task #${r.task_id}`, subtitle: `Customer #${r.cust_id}` };
    case 'internal_task':
      return {
        title: r.task_name || `Internal task #${r.id}`,
        subtitle: `Assigned to #${r.assign_to}`,
      };
    case 'service_question':
      return { title: r.question || `Question #${r.id}`, subtitle: `Service #${r.service_id}` };
    case 'staff_user':
      return {
        title: r.name || r.email || `User #${r.id}`,
        subtitle: r.position || r.department || '',
      };
  }
}

async function addBinItem(args: {
  type: EntityType;
  entityId: number | string;
  mode: 'flag' | 'archive';
  row: any;
  snapshot: Snapshot | null;
  actor: Actor;
  reason?: string;
  context?: any;
}): Promise<number | null> {
  if (!(await hasTable('recycle_bin_items'))) return null;
  const { title, subtitle } = titleOf(args.type, args.row);
  const counts = args.snapshot
    ? Object.fromEntries(args.snapshot.tables.map((t) => [t.table, t.rows.length]))
    : null;
  await prisma.$executeRawUnsafe(
    `INSERT INTO recycle_bin_items
      (entity_type, entity_id, title, subtitle, mode, payload_snapshot, related_snapshot, related_counts,
       deleted_by, deleted_by_name, deleted_by_source, delete_reason, status, deleted_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?, 'in_bin', UTC_TIMESTAMP(3))`,
    args.type,
    String(args.entityId),
    String(title).slice(0, 255),
    String(subtitle || '').slice(0, 255),
    args.mode,
    JSON.stringify(jsonSafe(args.row ?? null)),
    args.snapshot ? JSON.stringify(jsonSafe(args.snapshot)) : null,
    counts ? JSON.stringify(counts) : null,
    args.actor.id,
    args.actor.name?.slice(0, 150) ?? null,
    args.actor.source,
    args.reason?.slice(0, 255) ?? null
  );
  const r: any[] = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`);
  return Number(r[0]?.id ?? 0) || null;
}

export class BinError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

async function requireBinTable() {
  if (!(await hasTable('recycle_bin_items'))) {
    throw new BinError(
      503,
      'Recycle Bin is not set up on this database yet (run the RBAC migration first).'
    );
  }
}

// ─── Leads (flag) ───────────────────────────────────────────────────────────
export async function softDeleteLead(book: string, id: number, actor: Actor, reason?: string) {
  const def = LEAD_TABLES[book] || LEAD_TABLES.etax;
  await requireBinTable();
  if (!(await hasColumn(def.table, 'deleted_at'))) {
    throw new BinError(503, `${def.table}.deleted_at is missing (run the RBAC migration first).`);
  }
  const rows = await select(def.table, 'id = ?', id);
  if (!rows[0]) throw new BinError(404, 'Lead not found.');
  if (rows[0].deleted_at) throw new BinError(409, 'Lead is already in the Recycle Bin.');
  await prisma.$executeRawUnsafe(
    `UPDATE \`${def.table}\` SET deleted_at = UTC_TIMESTAMP(), deleted_by = ? WHERE id = ? AND deleted_at IS NULL`,
    actor.id,
    id
  );
  const calls: any[] =
    def.table === 'leads'
      ? await prisma.$queryRawUnsafe(`SELECT COUNT(*) n FROM call_history WHERE lead_id = ?`, id)
      : [{ n: 0 }];
  const binId = await addBinItem({
    type: def.type,
    entityId: id,
    mode: 'flag',
    row: rows[0],
    snapshot: null,
    actor,
    reason,
    context: { table: def.table },
  });
  return { binId, row: rows[0], linkedCalls: Number(calls[0]?.n ?? 0) };
}

// ─── Archive helpers ────────────────────────────────────────────────────────
async function archive(
  type: EntityType,
  entityId: number | string,
  mainRow: any,
  plan: Array<{ table: string; pk: string; where: string; params: any[] }>,
  deleteOrder: string[],
  actor: Actor,
  reason?: string
) {
  await requireBinTable();
  const snapshot: Snapshot = { tables: [] };
  const rows: Rows = {};
  for (const p of plan) {
    const r = await select(p.table, p.where, ...p.params);
    rows[p.table] = (rows[p.table] || []).concat(r);
    snapshot.tables.push({ table: p.table, pk: p.pk, rows: r });
  }
  await prisma.$transaction(async (tx) => {
    for (const table of deleteOrder) {
      const entry = snapshot.tables.filter((t) => t.table === table);
      for (const e of entry) {
        const ids = e.rows.map((r) => r[e.pk]);
        if (!ids.length) continue;
        await tx.$executeRawUnsafe(
          `DELETE FROM \`${table}\` WHERE \`${e.pk}\` IN (${ids.map(() => '?').join(',')})`,
          ...ids.map((x) => (typeof x === 'bigint' ? x.toString() : x))
        );
      }
    }
  });
  const binId = await addBinItem({
    type,
    entityId,
    mode: 'archive',
    row: mainRow,
    snapshot,
    actor,
    reason,
  });
  return { binId, snapshot };
}

/** Same rows as the old DELETE /v1/crm/customers/:id, but kept in the bin. */
export async function archiveCustomerOrOrders(
  custId: number,
  opts: { orderId?: number; packageId?: string },
  actor: Actor,
  reason?: string
) {
  let orders: any[] = [];
  if (opts.orderId) orders = await select('orders', 'id = ?', opts.orderId);
  else if (opts.packageId)
    orders = await select(
      'orders',
      'customer_id = ? AND package_id = ?',
      String(custId),
      opts.packageId
    );
  else orders = await select('orders', 'customer_id = ?', String(custId));

  // Safer than the old handler: asking for one order/package that is not there must not
  // fall through to deleting the whole customer.
  if (!orders.length && (opts.orderId || opts.packageId)) {
    throw new BinError(404, 'Order not found for this customer.');
  }

  if (orders.length) {
    const ids = orders.map((o) => o.id);
    const ph = ids.map(() => '?').join(',');
    const tasks = await select('operation_tasks', `order_id IN (${ph})`, ...ids);
    const taskIds = tasks.map((t) => t.task_id);
    const plan = [
      { table: 'orders', pk: 'id', where: `id IN (${ph})`, params: ids },
      { table: 'operation_tasks', pk: 'task_id', where: `order_id IN (${ph})`, params: ids },
      { table: 'customer_emi', pk: 'emi_id', where: `order_id IN (${ph})`, params: ids },
    ];
    if (taskIds.length) {
      plan.push({
        table: 'task_assign',
        pk: 'ta_id',
        where: `task_id IN (${taskIds.map(() => '?').join(',')})`,
        params: taskIds,
      });
    }
    // old handler did not delete task_assign rows; we keep them too (snapshot only, not deleted)
    const main = orders.length === 1 ? orders[0] : { ...orders[0], _orders: ids.length };
    const res = await archive(
      'order',
      ids.length === 1 ? ids[0] : `${custId}:${ids.join(',')}`,
      main,
      plan.filter((p) => p.table !== 'task_assign'),
      ['customer_emi', 'operation_tasks', 'orders'],
      actor,
      reason
    );
    return { ...res, kind: 'orders' as const, count: ids.length };
  }
  const cust = await select('customers', 'id = ?', custId);
  if (!cust[0]) throw new BinError(404, 'Customer not found.');
  const res = await archive(
    'customer',
    custId,
    cust[0],
    [
      { table: 'customers', pk: 'id', where: 'id = ?', params: [custId] },
      { table: 'operation_tasks', pk: 'task_id', where: 'cust_id = ?', params: [custId] },
      { table: 'customer_emi', pk: 'emi_id', where: 'customer_id = ?', params: [custId] },
    ],
    ['operation_tasks', 'customer_emi', 'customers'],
    actor,
    reason
  );
  return { ...res, kind: 'customer' as const, count: 1 };
}

export async function archiveOperationTask(taskId: number, actor: Actor, reason?: string) {
  const t = await select('operation_tasks', 'task_id = ?', taskId);
  if (!t[0]) throw new BinError(404, 'Task not found.');
  return archive(
    'operation_task',
    taskId,
    t[0],
    [
      { table: 'operation_tasks', pk: 'task_id', where: 'task_id = ?', params: [taskId] },
      { table: 'task_assign', pk: 'ta_id', where: 'task_id = ?', params: [taskId] },
    ],
    ['task_assign', 'operation_tasks'],
    actor,
    reason
  );
}

export async function archiveInternalTask(id: number, actor: Actor, reason?: string) {
  const t = await select('task_excel', 'id = ?', id);
  if (!t[0]) throw new BinError(404, 'Task not found.');
  return archive(
    'internal_task',
    id,
    t[0],
    [
      { table: 'task_excel', pk: 'id', where: 'id = ?', params: [id] },
      { table: 'task_comments', pk: 'id', where: 'task_id = ?', params: [id] },
    ],
    ['task_comments', 'task_excel'],
    actor,
    reason
  );
}

export async function archiveServiceQuestion(id: number, actor: Actor, reason?: string) {
  const q = await select('service_questions', 'id = ?', id);
  if (!q[0]) throw new BinError(404, 'Question not found.');
  return archive(
    'service_question',
    id,
    q[0],
    [{ table: 'service_questions', pk: 'id', where: 'id = ?', params: [id] }],
    ['service_questions'],
    actor,
    reason
  );
}

export async function archiveStaffUser(id: number, actor: Actor, reason?: string) {
  const u = await select('staff_users', 'id = ?', id);
  if (!u[0]) throw new BinError(404, 'User not found.');
  return archive(
    'staff_user',
    id,
    { ...u[0], password_hash: '[kept, hidden]' },
    [
      { table: 'staff_users', pk: 'id', where: 'id = ?', params: [id] },
      { table: 'staff_user_roles', pk: 'id', where: 'user_id = ?', params: [id] },
    ],
    ['staff_user_roles', 'staff_users'],
    actor,
    reason
  );
}

// ─── Bin listing / restore / purge ──────────────────────────────────────────
export async function getBinItem(id: number) {
  await requireBinTable();
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT * FROM recycle_bin_items WHERE id = ?`,
    id
  );
  if (!rows[0]) throw new BinError(404, 'Item not found in the Recycle Bin.');
  return rows[0];
}

function reviveRow(row: any, types: Map<string, string>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    if (!types.has(k)) continue; // column no longer exists
    const t = types.get(k)!;
    out[k] = v !== null && DATE_TYPES.has(t) && typeof v === 'string' ? new Date(v) : v;
  }
  return out;
}

export async function restoreItem(id: number, actor: Actor) {
  const item = await getBinItem(id);
  if (item.status !== 'in_bin') throw new BinError(409, `This item was already ${item.status}.`);
  const type = item.entity_type as EntityType;

  if (item.mode === 'flag') {
    const def = Object.values(LEAD_TABLES).find((d) => d.type === type);
    if (!def) throw new BinError(400, 'Unknown item type.');
    await prisma.$executeRawUnsafe(
      `UPDATE \`${def.table}\` SET deleted_at = NULL, deleted_by = NULL WHERE id = ?`,
      Number(item.entity_id)
    );
  } else {
    const snap: Snapshot = JSON.parse(item.related_snapshot || '{"tables":[]}');
    // Refuse if any id has been taken by a newer row (ids are reused by MAX(id)+1 code).
    for (const t of snap.tables) {
      const ids = t.rows.map((r) => r[t.pk]);
      if (!ids.length) continue;
      const taken: any[] = await prisma.$queryRawUnsafe(
        `SELECT \`${t.pk}\` AS id FROM \`${t.table}\` WHERE \`${t.pk}\` IN (${ids.map(() => '?').join(',')})`,
        ...ids
      );
      if (taken.length) {
        throw new BinError(
          409,
          `Cannot restore: ${t.table} id ${taken.map((x) => String(x.id)).join(', ')} is already used by a newer record.`
        );
      }
    }
    await prisma.$transaction(async (tx) => {
      for (const t of snap.tables) {
        if (!t.rows.length) continue;
        const types = await columnTypes(t.table);
        for (const raw of t.rows) {
          const row = reviveRow(raw, types);
          const cols = Object.keys(row);
          await tx.$executeRawUnsafe(
            `INSERT INTO \`${t.table}\` (${cols.map((c) => `\`${c}\``).join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
            ...cols.map((c) => row[c])
          );
        }
      }
    });
  }
  await prisma.$executeRawUnsafe(
    `UPDATE recycle_bin_items SET status = 'restored', restored_by = ?, restored_by_name = ?, restored_at = UTC_TIMESTAMP() WHERE id = ?`,
    actor.id,
    actor.name?.slice(0, 150) ?? null,
    id
  );
  return item;
}

export async function purgeItem(id: number, actor: Actor) {
  const item = await getBinItem(id);
  if (item.status !== 'in_bin') throw new BinError(409, `This item was already ${item.status}.`);
  let removedCalls = 0;
  if (item.mode === 'flag') {
    const def = Object.values(LEAD_TABLES).find((d) => d.type === item.entity_type);
    if (!def) throw new BinError(400, 'Unknown item type.');
    if (def.table === 'leads') {
      const c: any[] = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) n FROM call_history WHERE lead_id = ?`,
        Number(item.entity_id)
      );
      removedCalls = Number(c[0]?.n ?? 0);
    }
    // Same as the old app's hard delete; the database cascades call_history / lead_answers.
    await prisma.$executeRawUnsafe(
      `DELETE FROM \`${def.table}\` WHERE id = ? AND deleted_at IS NOT NULL`,
      Number(item.entity_id)
    );
  }
  // archive mode: rows are already gone; drop the stored copy.
  await prisma.$executeRawUnsafe(
    `UPDATE recycle_bin_items SET status = 'purged', purged_by = ?, purged_by_name = ?, purged_at = UTC_TIMESTAMP(),
       related_snapshot = NULL, payload_snapshot = NULL WHERE id = ?`,
    actor.id,
    actor.name?.slice(0, 150) ?? null,
    id
  );
  return { item, removedCalls };
}
