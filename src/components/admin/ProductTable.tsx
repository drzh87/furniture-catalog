'use client';

import { CATEGORY_LABELS } from '@/lib/constants/categories';
import type { CatalogCategory } from '@/lib/types/catalog';

export type AdminProduct = {
  id: string;
  supplier_id: string;
  supplier_name: string;
  category: CatalogCategory;
  article: string;
  description: string;
  image_url: string;
  source_pdf_name: string;
  page_number: number;
  created_at: string;
};

type Props = {
  products: AdminProduct[];
  supplierFilter: string;
  onSupplierFilterChange: (id: string) => void;
  suppliers: { id: string; name: string }[];
  onDeleteProduct: (id: string) => void;
  onDeleteAllBySupplier: (supplierId: string, supplierName: string) => void;
  loading: boolean;
};

export function ProductTable({
  products,
  supplierFilter,
  onSupplierFilterChange,
  suppliers,
  onDeleteProduct,
  onDeleteAllBySupplier,
  loading,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Все товары ({products.length})</h2>
        <select
          value={supplierFilter}
          onChange={(e) => onSupplierFilterChange(e.target.value)}
          className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
        >
          <option value="">Все поставщики</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-stone-500">Загрузка…</p>
      ) : !products.length ? (
        <p className="text-stone-500">Нет товаров</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-2 pr-4">Фото</th>
                <th className="py-2 pr-4">Поставщик</th>
                <th className="py-2 pr-4">Артикул</th>
                <th className="py-2 pr-4">Категория</th>
                <th className="py-2 pr-4">PDF / стр.</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-stone-100">
                  <td className="py-3 pr-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image_url}
                      alt=""
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>
                  <td className="py-3 pr-4 font-medium">{p.supplier_name}</td>
                  <td className="py-3 pr-4">{p.article || '—'}</td>
                  <td className="py-3 pr-4">{CATEGORY_LABELS[p.category]}</td>
                  <td className="py-3 pr-4 text-stone-500">
                    {p.source_pdf_name} · {p.page_number}
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {supplierFilter && (
        <div className="mt-4 border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={() => {
              const name = suppliers.find((s) => s.id === supplierFilter)?.name ?? '';
              onDeleteAllBySupplier(supplierFilter, name);
            }}
            className="text-sm text-red-700 hover:underline"
          >
            Удалить всё от этого поставщика
          </button>
        </div>
      )}
    </div>
  );
}
