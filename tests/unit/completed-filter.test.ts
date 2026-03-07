import { describe, it, expect } from 'vitest';
import { filterBooks } from '../../src/hooks/useCollection';
import { makeBook } from '../helpers/db';

describe('filterBooks: completed visibility', () => {
  const books = [
    makeBook({ title: 'Active Give Away', disposition: 'give-away', completedAt: null }),
    makeBook({ title: 'Completed Give Away', disposition: 'give-away', completedAt: Date.now() }),
    makeBook({ title: 'Keep Book', disposition: 'keep', completedAt: null }),
  ];

  it('showCompleted: undefined — shows all books including completed', () => {
    expect(filterBooks(books, {})).toHaveLength(3);
  });

  it('showCompleted: false — hides completed books', () => {
    const result = filterBooks(books, { showCompleted: false });
    expect(result).toHaveLength(2);
    expect(result.every(b => !b.completedAt)).toBe(true);
  });

  it('showCompleted: true — shows all books including completed', () => {
    expect(filterBooks(books, { showCompleted: true })).toHaveLength(3);
  });

  it('disposition filter + showCompleted: false hides completed in that pile', () => {
    const result = filterBooks(books, { disposition: 'give-away', showCompleted: false });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Active Give Away');
  });
});
