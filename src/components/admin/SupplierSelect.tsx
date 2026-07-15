'use client';

import { useState } from 'react';
import type { CatalogSupplierRow } from '@/lib/types/catalog';

type Props = {
  suppliers: CatalogSupplierRow[];
  value: string;
  onChange: (id: string) => void;
  onSupplierCreated: (supplier: CatalogSupplierRow) => void;
};

export function SupplierSelect({
  suppliers,
  value,
  onChange,
  onSupplierCreated,
}: Props) {
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.supplier) {
        onSupplierCreated(data.supplier);
        onChange(data.supplier.id);
        setNewName('');
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-stone-700">
        Поставщик
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
        >
          <option value="">— выберите —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Новый поставщик…"
          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}
