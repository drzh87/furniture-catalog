-- Furniture Catalog schema (isolated from Fabrica via catalog_ prefix)
-- Project: nkjwbocqbncvkxjwtgqq

-- ---------------------------------------------------------------------------
-- Enum: product categories
-- ---------------------------------------------------------------------------
CREATE TYPE catalog_category AS ENUM (
  'sofas',
  'armchairs',
  'tables',
  'chairs',
  'office_tables',
  'tv_stands',
  'lighting',
  'other'
);

-- ---------------------------------------------------------------------------
-- Suppliers
-- ---------------------------------------------------------------------------
CREATE TABLE catalog_suppliers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catalog_suppliers_slug ON catalog_suppliers (slug);

-- ---------------------------------------------------------------------------
-- Products (always tied to exactly one supplier)
-- ---------------------------------------------------------------------------
CREATE TABLE catalog_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id     UUID NOT NULL REFERENCES catalog_suppliers (id) ON DELETE CASCADE,
  category        catalog_category NOT NULL,
  article         TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  image_url       TEXT NOT NULL,
  source_pdf_name TEXT NOT NULL DEFAULT '',
  page_number     INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT catalog_products_supplier_required CHECK (supplier_id IS NOT NULL)
);

CREATE INDEX idx_catalog_products_category ON catalog_products (category);
CREATE INDEX idx_catalog_products_supplier ON catalog_products (supplier_id);
CREATE INDEX idx_catalog_products_article ON catalog_products (article);
CREATE INDEX idx_catalog_products_created ON catalog_products (created_at DESC);

-- Full-text search helper (article + description)
CREATE INDEX idx_catalog_products_search ON catalog_products
  USING gin (to_tsvector('simple', coalesce(article, '') || ' ' || coalesce(description, '')));

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE catalog_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;

-- Public read: products WITHOUT supplier fields (handled in API layer)
-- Direct anon access blocked — only service role / authenticated admin via API
CREATE POLICY "catalog_suppliers_admin_all"
  ON catalog_suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "catalog_products_admin_all"
  ON catalog_products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role bypasses RLS by default in Supabase

-- ---------------------------------------------------------------------------
-- Storage bucket: product-images
-- Run in Supabase Dashboard SQL or via storage API if bucket doesn't exist
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10 MB per image
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read only — writes go through API with service role (bypasses RLS)
CREATE POLICY "product_images_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- No INSERT/UPDATE/DELETE policies for anon/authenticated.
-- Backend API routes use SUPABASE_SERVICE_ROLE_KEY for uploads.
