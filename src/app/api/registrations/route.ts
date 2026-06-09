import { NextResponse } from 'next/server';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const registrationSchema = z.object({
  tutorName: z.string(),
  tutorEmail: z.string().email(),
  tutorPhone: z.string(),
  tutorCpf: z.string(),
  petName: z.string(),
  petBreed: z.string().optional(),
  petAge: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
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
