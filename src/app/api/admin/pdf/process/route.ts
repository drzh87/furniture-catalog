import { requireAdmin } from '@/lib/utils/auth-guard';
import { processPdfBuffer } from '@/lib/pdf/process-pdf';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'PDF file required' }, { status: 400 });
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processPdfBuffer(buffer, file.name);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PDF processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
