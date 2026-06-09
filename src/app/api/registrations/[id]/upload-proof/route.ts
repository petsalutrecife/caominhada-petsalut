import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

import { promises as fs } from 'fs';
import { join } from 'path';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    },
  });

  return NextResponse.json({ success: true, fileUrl }, { status: 200 });
}
