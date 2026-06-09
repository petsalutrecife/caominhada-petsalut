import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';



const registrationSchema = z.object({
  tutorName: z.string(),
  tutorEmail: z.string().email(),
  tutorPhone: z.string(),
  tutorCpf: z.string(),
  petName: z.string(),
  petBreed: z.string().optional(),
  petAge: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 });
  }
  const data = parsed.data;
  const registration = await prisma.registration.create({
    data: {
      ...data,
      paymentStatus: PaymentStatus.PAGAMENTO_PENDENTE,
    },
  });
  return NextResponse.json({ id: registration.id }, { status: 201 });
}
