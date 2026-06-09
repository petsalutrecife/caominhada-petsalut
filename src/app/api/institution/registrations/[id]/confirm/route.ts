import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';



export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken({ req: request });
  if (!token || token.role !== 'institution') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const institutionId = token.sub as string;

  const registration = await prisma.registration.update({
    where: { id },
    data: {
      paymentStatus: PaymentStatus.CONFIRMADO,
      confirmedAt: new Date(),
      confirmedByInstitutionId: institutionId,
    },
  });

  return NextResponse.json({ success: true, registrationId: registration.id }, { status: 200 });
}
