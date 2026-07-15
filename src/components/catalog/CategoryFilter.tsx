'use client';

import { CATALOG_CATEGORIES, type CatalogCategory } from '@/lib/types/catalog';
import { CATEGORY_LABELS } from '@/lib/constants/categories';

type Props = {
  active: CatalogCategory | null;
  onChange: (category: CatalogCategory | null) => void;
};

export function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          active === null
            ? 'bg-stone-900 text-white'
            : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50'
        }`}
      >
        Все
      </button>
      {CATALOG_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            active === cat
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50'
          }`}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}
