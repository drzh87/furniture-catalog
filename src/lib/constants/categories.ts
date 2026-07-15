import type { CatalogCategory } from '@/lib/types/catalog';

export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  sofas: 'Диваны',
  armchairs: 'Кресла',
  tables: 'Столы',
  chairs: 'Стулья',
  office_tables: 'Офисные столы',
  tv_stands: 'ТВ-тумбы',
  lighting: 'Освещение',
  other: 'Прочее',
};

export const PDF_MAX_BYTES = 50 * 1024 * 1024; // 50 MB
export const PDF_MAX_PAGES = 100;

/** Heuristic article pattern: [A-ZА-Я]{1,4}[-/]?\d{2,6}[A-ZА-Я]? */
export const ARTICLE_REGEX = /[A-ZА-Я]{1,4}[-/]?\d{2,6}[A-ZА-Я]?/g;
