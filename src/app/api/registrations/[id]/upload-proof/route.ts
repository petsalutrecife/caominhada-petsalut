import { NextResponse } from 'next/server';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { promises as fs } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'File not provided' }, { status: 400 });
  }

  // Prepare upload directory
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'proof');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // ignore if exists
  }

  const filename = `${Date.now()}_${(file as any).name}`;
  const filePath = join(uploadDir, filename);
  const arrayBuffer = await (file as Blob).arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  const fileUrl = `/uploads/proof/${filename}`;

  // Update registration record with proof URL and timestamp
  await prisma.registration.update({
    where: { id },
    data: {
      proofFileUrl: fileUrl,
      proofUploadedAt: new Date(),
      // keep current status (could be awaiting confirmation)
    },
  });

  return NextResponse.json({ success: true, fileUrl }, { status: 200 });
}
