import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected via Prisma ORM');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}
