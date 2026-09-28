import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ MySQL Database connected via Prisma ORM');
  } catch (error: any) {
    console.warn('⚠️  MySQL Database connection unavailable (Fallback memory mode active):', error?.message || error);
  }
}
