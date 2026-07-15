'use client';

import type { PublicProduct } from '@/lib/types/catalog';
import { CATEGORY_LABELS } from '@/lib/constants/categories';

type Props = {
  product: PublicProduct;
  onClick: () => void;
};

export function ProductCard({ product, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-stone-200 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.article || 'Товар'}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
          {CATEGORY_LABELS[product.category]}
        </span>
        <h3 className="font-semibold text-stone-900">
          {product.article || 'Без артикула'}
        </h3>
        <p className="line-clamp-2 text-sm text-stone-600">
          {product.description || '—'}
        </p>
      </div>
    </button>
  );
}
