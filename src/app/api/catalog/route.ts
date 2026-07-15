import { createAdminClient } from '@/lib/supabase/admin';
import { toPublicProducts } from '@/lib/catalog/public-mapper';
import { CATALOG_CATEGORIES } from '@/lib/types/catalog';
import type { CatalogCategory } from '@/lib/types/catalog';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_COLUMNS =
  'id, category, article, description, image_url, page_number, created_at';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const q = searchParams.get('q')?.trim() ?? '';

  if (category && !CATALOG_CATEGORIES.includes(category as CatalogCategory)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  const supabase = createAdminClient();
  let query = supabase
    .from('catalog_products')
    .select(PUBLIC_COLUMNS)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (q) {
    query = query.or(`article.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: toPublicProducts(data ?? []) });
}
