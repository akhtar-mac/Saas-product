import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Applying Phase 5 Migration: 20260918000005_add_infrastructure_and_ai_schema...');
  const sqlPath = path.join(
    __dirname,
    '../apps/api/prisma/migrations/20260918000005_add_infrastructure_and_ai_schema/migration.sql'
  );
  let sql = fs.readFileSync(sqlPath, 'utf8');

  // Strip single-line comments
  const sanitizedSql = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  // Split into individual statements
  const statements = sanitizedSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    console.log('Executing:', statement.slice(0, 60).replace(/\n/g, ' ') + '...');
    await prisma.$executeRawUnsafe(statement);
  }

  console.log('Registering migration in _prisma_migrations...');
  await prisma.$executeRawUnsafe(`
    INSERT INTO "_prisma_migrations" (
      id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      '20260918000005_add_infrastructure_and_ai_schema',
      'phase5_infrastructure_and_ai_v1',
      NOW(),
      '20260918000005_add_infrastructure_and_ai_schema',
      NULL,
      NULL,
      NOW(),
      1
    ) ON CONFLICT (id) DO NOTHING;
  `);

  const tables: any[] = await prisma.$queryRawUnsafe(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
  `);

  console.log(`Total public tables now in PostgreSQL: ${tables.length}`);
  const hasHealth = tables.some(t => t.tablename === 'system_health_snapshots');
  const hasAi = tables.some(t => t.tablename === 'ai_automation_tasks');
  console.log(`system_health_snapshots exists: ${hasHealth}`);
  console.log(`ai_automation_tasks exists: ${hasAi}`);

  if (hasHealth && hasAi) {
    console.log('✅ Phase 5 Migration applied successfully!');
  } else {
    console.error('❌ Missing Phase 5 tables!');
    process.exit(1);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
