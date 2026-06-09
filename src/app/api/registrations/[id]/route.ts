import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { institution: true },
  });
  if (!registration) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }
  return NextResponse.json(registration);
}
