import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';




export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { institution: true },
  });
  if (!registration) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }
  return NextResponse.json(registration);
}
