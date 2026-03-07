import { describe, it, expect } from 'vitest';
import { getGenreColor, getSubCategoryLabel, FICTION_SUBCATEGORIES, NONFICTION_SUBCATEGORIES } from '../../src/utils/genre';

describe('genre utilities', () => {
  it('FICTION_SUBCATEGORIES contains expected values', () => {
    expect(FICTION_SUBCATEGORIES).toContain('science-fiction');
    expect(FICTION_SUBCATEGORIES).toContain('mystery');
    expect(FICTION_SUBCATEGORIES).toContain('fantasy');
  });

  it('NONFICTION_SUBCATEGORIES contains expected values', () => {
    expect(NONFICTION_SUBCATEGORIES).toContain('biography');
    expect(NONFICTION_SUBCATEGORIES).toContain('self-help');
    expect(NONFICTION_SUBCATEGORIES).toContain('history');
  });

  it('getGenreColor returns distinct colors for fiction vs non-fiction', () => {
    expect(getGenreColor('fiction')).not.toBe(getGenreColor('non-fiction'));
  });

  it('getSubCategoryLabel converts kebab-case to Title Case', () => {
    expect(getSubCategoryLabel('science-fiction')).toBe('Science Fiction');
    expect(getSubCategoryLabel('self-help')).toBe('Self Help');
    expect(getSubCategoryLabel('true-crime')).toBe('True Crime');
  });
});
