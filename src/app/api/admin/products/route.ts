import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/utils/auth-guard';
import { CATALOG_CATEGORIES } from '@/lib/types/catalog';
import type { CatalogCategory } from '@/lib/types/catalog';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 300;

type SaveItem = {
  pageNumber: number;
  article: string;
  description: string;
  imageBase64: string;
};

function decodeBase64Image(dataUrl: string): Buffer {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64, 'base64');
}

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const supplierId = request.nextUrl.searchParams.get('supplier_id');

  const supabase = createAdminClient();
  let query = supabase
    .from('catalog_products')
    .select(
      'id, supplier_id, category, article, description, image_url, source_pdf_name, page_number, created_at, catalog_suppliers(name)',
    )
    .order('created_at', { ascending: false });

  if (supplierId) {
    query = query.eq('supplier_id', supplierId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data ?? []).map((row) => ({
    id: row.id,
    supplier_id: row.supplier_id,
    supplier_name:
      row.catalog_suppliers &&
      typeof row.catalog_suppliers === 'object' &&
      'name' in row.catalog_suppliers
        ? (row.catalog_suppliers as { name: string }).name
        : '',
    category: row.category,
    article: row.article,
    description: row.description,
    image_url: row.image_url,
    source_pdf_name: row.source_pdf_name,
    page_number: row.page_number,
    created_at: row.created_at,
  }));

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const supplierId = body.supplierId as string;
  const category = body.category as CatalogCategory;
  const sourcePdfName = (body.sourcePdfName as string) ?? '';
  const items = (body.items as SaveItem[]) ?? [];

  if (!supplierId) {
    return NextResponse.json({ error: 'supplierId required' }, { status: 400 });
  }
  if (!CATALOG_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  if (!items.length) {
    return NextResponse.json({ error: 'No items to save' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: supplier, error: supplierError } = await supabase
    .from('catalog_suppliers')
    .select('id')
    .eq('id', supplierId)
    .single();

  if (supplierError || !supplier) {
    return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
  }

  const saved: string[] = [];
  const errors: string[] = [];

  for (const item of items) {
    try {
      const imageBuffer = decodeBase64Image(item.imageBase64);
      const fileName = `${supplierId}/${crypto.randomUUID()}.png`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: false,
        });

      if (uploadError) {
        errors.push(`Page ${item.pageNumber}: ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      const { data: product, error: insertError } = await supabase
        .from('catalog_products')
        .insert({
          supplier_id: supplierId,
          category,
          article: item.article ?? '',
          description: item.description ?? '',
          image_url: urlData.publicUrl,
          source_pdf_name: sourcePdfName,
          page_number: item.pageNumber,
        })
        .select('id')
        .single();

      if (insertError) {
        errors.push(`Page ${item.pageNumber}: ${insertError.message}`);
        continue;
      }

      saved.push(product.id);
    } catch (err) {
      errors.push(
        `Page ${item.pageNumber}: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
    }
  }

  return NextResponse.json({
    savedCount: saved.length,
    savedIds: saved,
    errors,
  });
}
