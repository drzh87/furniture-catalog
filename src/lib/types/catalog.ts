/** Product categories — mirrors Postgres enum catalog_category */
export const CATALOG_CATEGORIES = [
  'sofas',
  'armchairs',
  'tables',
  'chairs',
  'office_tables',
  'tv_stands',
  'lighting',
  'other',
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

/** Full row from catalog_products (admin / server only) */
export type CatalogProductRow = {
  id: string;
  supplier_id: string;
  category: CatalogCategory;
  article: string;
  description: string;
  image_url: string;
  source_pdf_name: string;
  page_number: number;
  created_at: string;
};

/** Public-safe product — supplier fields never included */
export type PublicProduct = {
  id: string;
  category: CatalogCategory;
  article: string;
  description: string;
  image_url: string;
  page_number: number;
  created_at: string;
};

export type CatalogSupplierRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

/** Draft item from PDF processing (preview before save) */
export type PdfExtractedItem = {
  tempId: string;
  pageNumber: number;
  imageBase64: string;
  rawText: string;
  article: string;
  description: string;
  removed?: boolean;
};
