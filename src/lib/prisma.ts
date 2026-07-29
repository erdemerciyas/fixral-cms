import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Veritabanı yapılandırması mevcut mu? (eski hasValidMongoUri karşılığı)
 * Prisma lazy-connect olduğu için ayrıca connectDB çağrısı gerekmez.
 */
export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

