'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CatalogSupplierRow, PdfExtractedItem, CatalogCategory } from '@/lib/types/catalog';
import { UploadForm } from '@/components/admin/UploadForm';
import { PreviewList } from '@/components/admin/PreviewList';
import { ProductTable, type AdminProduct } from '@/components/admin/ProductTable';

export function AdminPanel() {
  const [suppliers, setSuppliers] = useState<CatalogSupplierRow[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [category, setCategory] = useState<CatalogCategory>('sofas');
  const [previewItems, setPreviewItems] = useState<PdfExtractedItem[] | null>(null);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [sourcePdfName, setSourcePdfName] = useState('');
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [productsLoading, setProductsLoading] = useState(true);

  const loadSuppliers = useCallback(async () => {
    const res = await fetch('/api/admin/suppliers');
    const data = await res.json();
    setSuppliers(data.suppliers ?? []);
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    const params = supplierFilter ? `?supplier_id=${supplierFilter}` : '';
    const res = await fetch(`/api/admin/products${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setProductsLoading(false);
  }, [supplierFilter]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }

  function handleProcessed(data: {
    items: PdfExtractedItem[];
    warnings: string[];
    sourcePdfName: string;
  }) {
    setPreviewItems(data.items);
    setPreviewWarnings(data.warnings);
    setSourcePdfName(data.sourcePdfName);
  }

  function updatePreviewItem(tempId: string, field: 'article' | 'description', value: string) {
    setPreviewItems((prev) =>
      prev?.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i)) ?? null,
    );
  }

  function toggleRemove(tempId: string) {
    setPreviewItems((prev) =>
      prev?.map((i) =>
        i.tempId === tempId ? { ...i, removed: !i.removed } : i,
      ) ?? null,
    );
  }

  async function handleSaveAll() {
    if (!previewItems || !supplierId) return;
    const active = previewItems.filter((i) => !i.removed);
    if (!active.length) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          category,
          sourcePdfName,
          items: active.map((i) => ({
            pageNumber: i.pageNumber,
            article: i.article,
            description: i.description,
            imageBase64: i.imageBase64,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? 'Ошибка сохранения');
        return;
      }
      if (data.errors?.length) {
        alert(`Сохранено: ${data.savedCount}. Ошибки:\n${data.errors.join('\n')}`);
      }
      setPreviewItems(null);
      loadProducts();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Удалить товар?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    loadProducts();
  }

  async function handleDeleteAllBySupplier(id: string, name: string) {
    if (!confirm(`Удалить ВСЕ товары поставщика «${name}»?`)) return;
    await fetch(`/api/admin/suppliers/${id}/products`, { method: 'DELETE' });
    loadProducts();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Админ-панель</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-stone-600 hover:underline"
        >
          Выйти
        </button>
      </div>

      <UploadForm
        suppliers={suppliers}
        supplierId={supplierId}
        category={category}
        onSupplierChange={setSupplierId}
        onCategoryChange={setCategory}
        onSupplierCreated={(s) => setSuppliers((prev) => [...prev, s])}
        onProcessed={handleProcessed}
      />

      {previewItems && (
        <PreviewList
          items={previewItems}
          warnings={previewWarnings}
          saving={saving}
          onUpdate={updatePreviewItem}
          onRemove={toggleRemove}
          onSave={handleSaveAll}
          onCancel={() => setPreviewItems(null)}
        />
      )}

      <ProductTable
        products={products}
        supplierFilter={supplierFilter}
        onSupplierFilterChange={setSupplierFilter}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        onDeleteProduct={handleDeleteProduct}
        onDeleteAllBySupplier={handleDeleteAllBySupplier}
        loading={productsLoading}
      />
    </div>
  );
}
