import type { Genre, SubCategory } from '../types';

export const FICTION_SUBCATEGORIES: SubCategory[] = [
  'literary-fiction',
  'science-fiction',
  'mystery',
  'romance',
  'fantasy',
  'thriller',
  'historical-fiction',
  'horror',
  'short-stories',
  'graphic-novel',
];

export const NONFICTION_SUBCATEGORIES: SubCategory[] = [
  'self-help',
  'biography',
  'memoir',
  'history',
  'science',
  'business',
  'travel',
  'cooking',
  'philosophy',
  'psychology',
  'politics',
  'true-crime',
];

export function getSubCategoriesForGenre(genre: Genre): SubCategory[] {
  if (genre === 'fiction') return FICTION_SUBCATEGORIES;
  if (genre === 'non-fiction') return NONFICTION_SUBCATEGORIES;
  return [];
}

export function getSubCategoryLabel(sub: SubCategory): string {
  return sub
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getGenreColor(genre: Genre): string {
  switch (genre) {
    case 'fiction': return 'rgba(20,184,166,0.25)';
    case 'non-fiction': return 'rgba(168,85,247,0.25)';
    default: return 'var(--color-surface-3)';
  }
}

export function getGenreTextColor(genre: Genre): string {
  switch (genre) {
    case 'fiction': return '#2dd4bf';
    case 'non-fiction': return '#c084fc';
    default: return 'var(--color-text-muted)';
  }
}
