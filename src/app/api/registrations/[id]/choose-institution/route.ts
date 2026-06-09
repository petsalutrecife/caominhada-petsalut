import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';



const schema = z.object({
  institutionId: z.string().uuid(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 });
  }
  const { institutionId } = parsed.data;

  // Verify institution exists
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) {
    return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
  }

  // Update registration with chosen institution and move status to awaiting confirmation
  const registration = await prisma.registration.update({
    where: { id },
    data: {
      institutionId,
      paymentStatus: PaymentStatus.AGUARDANDO_CONFIRMACAO,
    },
  });

  return NextResponse.json({ success: true, registrationId: registration.id }, { status: 200 });
}


