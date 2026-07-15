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

  const { id: supplierId } = await params;
  const supabase = createAdminClient();

  const { data: products, error: fetchError } = await supabase
    .from('catalog_products')
    .select('id, image_url')
    .eq('supplier_id', supplierId);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const paths = (products ?? [])
    .map((p) => extractStoragePath(p.image_url))
    .filter((p): p is string => Boolean(p));

  if (paths.length) {
    await supabase.storage.from('product-images').remove(paths);
  }

  const { error: deleteError } = await supabase
    .from('catalog_products')
    .delete()
    .eq('supplier_id', supplierId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ deletedCount: products?.length ?? 0 });
}
