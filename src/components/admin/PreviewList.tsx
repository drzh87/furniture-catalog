'use client';

import type { PdfExtractedItem } from '@/lib/types/catalog';

type Props = {
  items: PdfExtractedItem[];
  warnings: string[];
  saving: boolean;
  onUpdate: (tempId: string, field: 'article' | 'description', value: string) => void;
  onRemove: (tempId: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function PreviewList({
  items,
  warnings,
  saving,
  onUpdate,
  onRemove,
  onSave,
  onCancel,
}: Props) {
  const active = items.filter((i) => !i.removed);

  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Предпросмотр ({active.length} стр.)
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm ring-1 ring-stone-200"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !active.length}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Сохранение…' : 'Сохранить всё'}
          </button>
        </div>
      </div>

      {warnings.map((w) => (
        <p key={w} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {w}
        </p>
      ))}

      <div className="space-y-6">
        {items.map((item) =>
          item.removed ? (
            <div
              key={item.tempId}
              className="flex items-center justify-between rounded-lg bg-stone-50 px-4 py-3 text-sm text-stone-500"
            >
              <span>Стр. {item.pageNumber} — удалена</span>
              <button
                type="button"
                onClick={() => onRemove(item.tempId)}
                className="text-stone-700 underline"
              >
                Вернуть
              </button>
            </div>
          ) : (
            <div
              key={item.tempId}
              className="grid gap-4 rounded-xl border border-stone-200 p-4 sm:grid-cols-[160px_1fr]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageBase64}
                alt={`Страница ${item.pageNumber}`}
                className="w-full rounded-lg object-cover"
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-500">
                    Стр. {item.pageNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(item.tempId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
                <label className="block text-sm">
                  Артикул
                  <input
                    value={item.article}
                    onChange={(e) => onUpdate(item.tempId, 'article', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
                    placeholder="Заполните вручную, если скан без текста"
                  />
                </label>
                <label className="block text-sm">
                  Описание
                  <textarea
                    value={item.description}
                    onChange={(e) => onUpdate(item.tempId, 'description', e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
                  />
                </label>
                {item.rawText && (
                  <details className="text-xs text-stone-500">
                    <summary className="cursor-pointer">Извлечённый текст</summary>
                    <p className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap">
                      {item.rawText}
                    </p>
                  </details>
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
