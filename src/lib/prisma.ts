import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function makePrismaClient() {
  const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
