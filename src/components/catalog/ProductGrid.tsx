'use client';

import type { PublicProduct } from '@/lib/types/catalog';
import { ProductCard } from './ProductCard';

type Props = {
  products: PublicProduct[];
  onSelect: (product: PublicProduct) => void;
};

export function ProductGrid({ products, onSelect }: Props) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white py-16 text-center text-stone-500">
        Товары не найдены
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onSelect(product)}
        />
      ))}
    </div>
  );
}
