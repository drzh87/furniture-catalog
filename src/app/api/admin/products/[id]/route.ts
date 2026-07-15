import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/utils/auth-guard';
import { NextRequest, NextResponse } from 'next/server';

function extractStoragePath(imageUrl: string): string | null {
  const marker = '/storage/v1/object/public/product-images/';
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  return imageUrl.slice(idx + marker.length);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product, error: fetchError } = await supabase
    .from('catalog_products')
    .select('image_url')
    .eq('id', id)
    .single();

  if (fetchError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const storagePath = extractStoragePath(product.image_url);
  if (storagePath) {
    await supabase.storage.from('product-images').remove([storagePath]);
  }

  const { error: deleteError } = await supabase
    .from('catalog_products')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
