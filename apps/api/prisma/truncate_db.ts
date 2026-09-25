import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Truncating database tables...');

    // In PostgreSQL, execute TRUNCATE CASCADE on all table names mapped in Prisma
    const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations';
    `;

    for (const { tablename } of tablenames) {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`);
      } catch (error) {
        console.log(`Could not truncate ${tablename}:`, error);
      }
    }

    console.log('✅ Database truncated successfully!');
  } catch (err) {
    console.error('Error truncating:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
