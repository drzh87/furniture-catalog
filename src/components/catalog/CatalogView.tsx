'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PublicProduct, CatalogCategory } from '@/lib/types/catalog';
import { CategoryFilter } from './CategoryFilter';
import { SearchBar } from './SearchBar';
import { ProductGrid } from './ProductGrid';
import { ProductModal } from './ProductModal';

export function CatalogView() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CatalogCategory | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState<PublicProduct | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (debouncedSearch) params.set('q', debouncedSearch);

    try {
      const res = await fetch(`/api/catalog?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <>
      <div className="mb-6 space-y-4">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      {loading ? (
        <div className="py-16 text-center text-stone-500">Загрузка…</div>
      ) : (
        <ProductGrid products={products} onSelect={setSelected} />
      )}

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
