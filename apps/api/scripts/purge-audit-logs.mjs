#!/usr/bin/env node
/**
 * Activity Logs retention: remove audit_logs rows older than N days (default 365).
 *
 *   node scripts/purge-audit-logs.mjs                 # dry run: only counts, deletes nothing
 *   node scripts/purge-audit-logs.mjs --apply         # deletes in batches of 5,000
 *   node scripts/purge-audit-logs.mjs --days=400      # other retention window
 *
 * Uses DATABASE_URL from the environment (same as the API).
 * LIVE: do not schedule or run --apply on live without written approval from the owner.
 * Take a backup of audit_logs first (see RUNBOOK-RBAC-LOGS-RECYCLE.md).
 */
import { PrismaClient } from '@prisma/client';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const daysArg = args.find((a) => a.startsWith('--days='));
const days = daysArg ? Number(daysArg.split('=')[1]) : 365;
if (!Number.isInteger(days) || days < 90) {
  console.error('Refusing: --days must be a whole number of at least 90.');
  process.exit(1);
}

const prisma = new PrismaClient();
// created_at is written in UTC by the API.
const cutoffSql = `UTC_TIMESTAMP() - INTERVAL ${days} DAY`;

try {
  const [{ n, oldest }] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS n, MIN(created_at) AS oldest FROM audit_logs WHERE created_at < ${cutoffSql}`
  );
  const count = Number(n);
  console.log(`audit_logs older than ${days} days: ${count}${oldest ? ` (oldest ${new Date(oldest).toISOString()})` : ''}`);
  if (!apply) {
    console.log('Dry run only. Nothing deleted. Re-run with --apply to delete.');
  } else if (count > 0) {
    let total = 0;
    for (;;) {
      const removed = await prisma.$executeRawUnsafe(
        `DELETE FROM audit_logs WHERE created_at < ${cutoffSql} ORDER BY id LIMIT 5000`
      );
      total += Number(removed);
      if (Number(removed) < 5000) break;
    }
    console.log(`Deleted ${total} rows.`);
  }
} catch (err) {
  console.error('Failed:', err?.message || err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
