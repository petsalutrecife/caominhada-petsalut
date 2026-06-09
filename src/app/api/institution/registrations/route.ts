import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';



export async function GET(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token || token.role !== 'institution') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const institutionId = token.sub as string;
  const registrations = await prisma.registration.findMany({
    where: { institutionId },
    include: { institution: true },
  });
  return NextResponse.json(registrations);
}
