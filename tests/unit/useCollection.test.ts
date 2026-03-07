import { describe, it, expect } from 'vitest';
import { makeBook } from '../helpers/db';

import { sortBooks, filterBooks } from '../../src/hooks/useCollection';
import type { Book } from '../../src/types';

describe('sortBooks', () => {
  it('sorts by disposition group then A-Z within group', () => {
    const books: Book[] = [
      makeBook({ title: 'Zebra', disposition: 'keep' }),
      makeBook({ title: 'Apple', disposition: 'keep' }),
      makeBook({ title: 'Mango', disposition: 'unassigned' }),
      makeBook({ title: 'Banana', disposition: 'throw-away' }),
    ];
    const sorted = sortBooks(books);
    expect(sorted[0].disposition).toBe('unassigned');
    expect(sorted[1].title).toBe('Apple');
    expect(sorted[2].title).toBe('Zebra');
    expect(sorted[3].disposition).toBe('throw-away');
  });

  it('sorts A-Z within same disposition group', () => {
    const books: Book[] = [
      makeBook({ title: 'Z Book', disposition: 'keep' }),
      makeBook({ title: 'A Book', disposition: 'keep' }),
      makeBook({ title: 'M Book', disposition: 'keep' }),
    ];
    const sorted = sortBooks(books);
    expect(sorted.map(b => b.title)).toEqual(['A Book', 'M Book', 'Z Book']);
  });
});

describe('filterBooks', () => {
  const books: Book[] = [
    makeBook({ title: 'Fiction Keep', disposition: 'keep', genre: 'fiction', completedAt: null }),
    makeBook({ title: 'NF Give', disposition: 'give-away', genre: 'non-fiction', completedAt: null }),
    makeBook({ title: 'Completed', disposition: 'give-away', genre: 'fiction', completedAt: Date.now() }),
    makeBook({ title: 'Unassigned', disposition: 'unassigned', genre: 'uncategorized', completedAt: null }),
  ];

  it('returns all books with no filter', () => {
    expect(filterBooks(books, {})).toHaveLength(4);
  });

  it('filters by disposition', () => {
    const result = filterBooks(books, { disposition: 'give-away' });
    expect(result).toHaveLength(2);
    expect(result.every(b => b.disposition === 'give-away')).toBe(true);
  });

  it('filters by genre', () => {
    const result = filterBooks(books, { genre: 'fiction' });
    expect(result).toHaveLength(2);
  });

  it('combined disposition + genre filter', () => {
    const result = filterBooks(books, { disposition: 'give-away', genre: 'fiction' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Completed');
  });

  it('hides completed books when showCompleted is false', () => {
    const result = filterBooks(books, { showCompleted: false });
    expect(result).toHaveLength(3);
    expect(result.every(b => !b.completedAt)).toBe(true);
  });

  it('shows completed books when showCompleted is true', () => {
    const result = filterBooks(books, { showCompleted: true });
    expect(result).toHaveLength(4);
  });
});
