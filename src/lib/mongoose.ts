import { prisma } from '@/lib/prisma';

export function hasValidMongoUri() {
  return Boolean(process.env.DATABASE_URL);
}

async function connectDB() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  await prisma.$queryRaw`SELECT 1`;
  return prisma;
}

export default connectDB;
