/**
 * Detects which add-only RBAC / logs / recycle-bin tables and columns exist.
 * Lets the same build run before and after MIGRATION-RBAC-LOGS-RECYCLE.sql is
 * applied: features that need a missing table fall back to safe defaults.
 */
import { prisma } from '../config/db.js';

let cache: { at: number; cols: Map<string, Set<string>> } | null = null;
let loading: Promise<Map<string, Set<string>>> | null = null;
const TTL_MS = 5 * 60 * 1000;
const WATCHED = [
  'rbac_user_access',
  'rbac_user_permission_overrides',
  'recycle_bin_items',
  'audit_logs',
  'leads',
  'leads_udyamikisan',
  'leads_sahakarsamridhi',
];

async function load(): Promise<Map<string, Set<string>>> {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT TABLE_NAME AS t, COLUMN_NAME AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (${WATCHED.map(() => '?').join(',')})`,
    ...WATCHED
  );
  const cols = new Map<string, Set<string>>();
  for (const r of rows) {
    const t = String(r.t ?? r.TABLE_NAME);
    if (!cols.has(t)) cols.set(t, new Set());
    cols.get(t)!.add(String(r.c ?? r.COLUMN_NAME));
  }
  return cols;
}

export async function schemaColumns(): Promise<Map<string, Set<string>>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.cols;
  if (!loading) {
    loading = load()
      .then((cols) => {
        cache = { at: Date.now(), cols };
        return cols;
      })
      .catch(() => cache?.cols ?? new Map())
      .finally(() => {
        loading = null;
      });
  }
  return loading;
}

export async function hasTable(table: string): Promise<boolean> {
  return (await schemaColumns()).has(table);
}

export async function hasColumn(table: string, column: string): Promise<boolean> {
  return (await schemaColumns()).get(table)?.has(column) ?? false;
}

export function resetSchemaCache() {
  cache = null;
}
