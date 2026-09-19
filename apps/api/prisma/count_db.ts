import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countAll() {
  const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  let totalRows = 0;
  let summary: string[] = [];
  for (const model of models) {
    if ((prisma as any)[model]?.count) {
      try {
        const count = await (prisma as any)[model].count();
        if (count > 0) {
          summary.push(`${model}: ${count}`);
          totalRows += count;
        }
      } catch (e) {}
    }
  }
  console.log('Populated tables count:', summary.length);
  console.log('Total seeded records in DB:', totalRows);
  console.log('Details:');
  console.log(summary.join('\n'));
}

countAll().finally(() => prisma.$disconnect());
