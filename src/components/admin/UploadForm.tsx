'use client';

import { useState } from 'react';
import { CATALOG_CATEGORIES, type CatalogCategory } from '@/lib/types/catalog';
import { CATEGORY_LABELS } from '@/lib/constants/categories';
import type { CatalogSupplierRow, PdfExtractedItem } from '@/lib/types/catalog';
import { SupplierSelect } from './SupplierSelect';

type Props = {
  suppliers: CatalogSupplierRow[];
  supplierId: string;
  category: CatalogCategory;
  onSupplierChange: (id: string) => void;
  onCategoryChange: (cat: CatalogCategory) => void;
  onSupplierCreated: (supplier: CatalogSupplierRow) => void;
  onProcessed: (data: {
    items: PdfExtractedItem[];
    warnings: string[];
    sourcePdfName: string;
  }) => void;
};

export function UploadForm({
  suppliers,
  supplierId,
  category,
  onSupplierChange,
  onCategoryChange,
  onSupplierCreated,
  onProcessed,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Выберите поставщика');
      return;
    }

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('pdf') as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setError('Выберите PDF-файл');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/admin/pdf/process', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Ошибка обработки PDF');
        return;
      }

      onProcessed({
        items: data.items,
        warnings: data.warnings ?? [],
        sourcePdfName: data.sourcePdfName,
      });
      fileInput.value = '';
    } catch {
      setError('Не удалось обработать PDF');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
      <h2 className="text-lg font-semibold">Загрузка PDF</h2>

      <SupplierSelect
        suppliers={suppliers}
        value={supplierId}
        onChange={onSupplierChange}
        onSupplierCreated={onSupplierCreated}
      />

      <label className="block text-sm font-medium text-stone-700">
        Категория
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as CatalogCategory)}
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
        >
          {CATALOG_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-stone-700">
        PDF-каталог
        <input
          name="pdf"
          type="file"
          accept="application/pdf,.pdf"
          className="mt-1 block w-full text-sm"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Обработка…' : 'Обработать PDF'}
      </button>
    </form>
  );
}
