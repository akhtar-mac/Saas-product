/**
 * One-time helper for a NEW tenant database that still has plaintext passwords.
 *
 * What it does
 *   - Widens customers.password to VARCHAR(255) when that table exists.
 *   - Replaces non-bcrypt values in users.password, staff_users.password_hash,
 *     and customers.password with bcrypt hashes of the same characters.
 *   - Prints only counts. It never prints a password or a hash.
 *
 * What it does not do
 *   - It does not connect to etaxwala.com or dnyanvedh.com. It uses DATABASE_URL.
 *   - It cannot recover a password that was never stored. Those accounts must be
 *     reset by an administrator (Users & Access, or a new bcrypt hash you set).
 *
 * Usage (from the repo root, after DATABASE_URL is set to the tenant database):
 *   pnpm --filter @etaxwala/api db:hash-legacy-passwords
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword, isBcryptHash } from '../src/services/password.js';

const prisma = new PrismaClient();

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT 1 AS ok FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    table,
    column
  );
  return rows.length > 0;
}

async function upgrade(table: string, column: string, idColumn: string) {
  if (!(await columnExists(table, column))) {
    console.log(`${table}.${column}: column not present, skipped`);
    return;
  }
  if (table === 'customers') {
    await prisma.$executeRawUnsafe(`ALTER TABLE customers MODIFY password VARCHAR(255) NOT NULL`);
  }
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT ${idColumn} AS id, ${column} AS secret FROM ${table}`
  );
  let hashed = 0;
  let already = 0;
  let empty = 0;
  for (const row of rows) {
    const secret = row.secret == null ? '' : String(row.secret);
    if (!secret) {
      empty += 1;
      continue;
    }
    if (isBcryptHash(secret)) {
      already += 1;
      continue;
    }
    const next = await hashPassword(secret);
    await prisma.$executeRawUnsafe(
      `UPDATE ${table} SET ${column} = ? WHERE ${idColumn} = ?`,
      next,
      row.id
    );
    hashed += 1;
  }
  console.log(
    `${table}.${column}: hashed ${hashed}, already bcrypt ${already}, empty ${empty} (reset those)`
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Point it at the new tenant database only.');
  }
  await upgrade('users', 'password', 'id');
  await upgrade('staff_users', 'password_hash', 'id');
  await upgrade('customers', 'password', 'id');
  console.log('Done. Plaintext comparison is no longer accepted by the API.');
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
