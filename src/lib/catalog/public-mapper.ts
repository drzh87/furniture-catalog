import type { PublicProduct } from '@/lib/types/catalog';

/** Strip supplier fields — safe even if row accidentally includes them */
export function toPublicProduct(row: Record<string, unknown>): PublicProduct {
  return {
    id: String(row.id),
    category: row.category as PublicProduct['category'],
    article: String(row.article ?? ''),
    description: String(row.description ?? ''),
    image_url: String(row.image_url),
    page_number: Number(row.page_number ?? 1),
    created_at: String(row.created_at),
  };
}

export function toPublicProducts(rows: Record<string, unknown>[]): PublicProduct[] {
  return rows.map(toPublicProduct);
}
