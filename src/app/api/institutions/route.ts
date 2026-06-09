import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const institutions = await prisma.institution.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      logoUrl: true,
      pixKey: true,
      pixReceiverName: true,
      pixBankName: true,
    },
  });
  return NextResponse.json(institutions);
}
