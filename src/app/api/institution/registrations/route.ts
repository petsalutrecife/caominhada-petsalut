import { NextResponse } from 'next/server';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const token = await getToken({ req: request });
  if (!token || token.role !== 'institution') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const institutionId = token.sub as string; // token.sub is user id
  const registrations = await prisma.registration.findMany({
    where: { institutionId },
    include: { institution: true },
  });
  return NextResponse.json(registrations);
}
