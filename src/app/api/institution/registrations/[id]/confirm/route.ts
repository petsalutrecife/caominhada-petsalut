import { NextResponse } from 'next/server';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const token = await getToken({ req: request });
  if (!token || token.role !== 'institution') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const institutionId = token.sub as string;
  const { id } = params;

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
