'use client';

import type { PublicProduct } from '@/lib/types/catalog';
import { CATEGORY_LABELS } from '@/lib/constants/categories';
import { useEffect } from 'react';

type Props = {
  product: PublicProduct | null;
  onClose: () => void;
};

export function ProductModal({ product, onClose }: Props) {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div className="relative aspect-[4/3] bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.article || 'Товар'}
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {CATEGORY_LABELS[product.category]}
          </p>
          <h2 id="product-modal-title" className="text-2xl font-semibold">
            {product.article || 'Без артикула'}
          </h2>
          <p className="whitespace-pre-wrap text-stone-700">
            {product.description || 'Описание не указано'}
          </p>
        </div>
      </div>
    </div>
  );
}
