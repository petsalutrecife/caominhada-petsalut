import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




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
