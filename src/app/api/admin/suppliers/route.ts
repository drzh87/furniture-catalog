import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/utils/auth-guard';
import { slugify } from '@/lib/utils/slug';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('catalog_suppliers')
    .select('id, name, slug, created_at')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suppliers: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  let slug = slugify(name);

  const { data: existing } = await supabase
    .from('catalog_suppliers')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const { data, error } = await supabase
    .from('catalog_suppliers')
    .insert({ name, slug })
    .select('id, name, slug, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ supplier: data });
}
