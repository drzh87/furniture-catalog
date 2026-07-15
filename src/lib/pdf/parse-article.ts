import { ARTICLE_REGEX } from '@/lib/constants/categories';

export function extractArticle(text: string): string {
  if (!text.trim()) return '';
  const matches = text.match(ARTICLE_REGEX);
  return matches?.[0] ?? '';
}

export function extractDescription(text: string, article: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (!article) return cleaned.slice(0, 500);
  return cleaned.replace(article, '').replace(/\s+/g, ' ').trim().slice(0, 500);
}
