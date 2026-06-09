import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';
import { z } from 'zod';



const rejectSchema = z.object({
  reason: z.string().min(1),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req: request });
  if (!token || token.role !== 'institution') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const institutionId = token.sub as string;
  const { id } = await params;

  const body = await request.json();
  const parsed = rejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 });
  }
  const { reason } = parsed.data;

  const registration = await prisma.registration.update({
    where: { id },
    data: {
      paymentStatus: PaymentStatus.RECUSADO,
      rejectedAt: new Date(),
      rejectionReason: reason,
      confirmedByInstitutionId: institutionId,
    },
  });

  return NextResponse.json({ success: true, registrationId: registration.id }, { status: 200 });
}
