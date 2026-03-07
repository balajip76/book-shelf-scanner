import type { Book, ScanSession } from '../../src/types';

export function createTestDB() {
  return null;
}

export function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: crypto.randomUUID(),
    title: 'Test Book',
    author: 'Test Author',
    disposition: 'unassigned',
    genre: 'uncategorized',
    subCategory: null,
    notes: null,
    capturedAt: Date.now(),
    completedAt: null,
    addedManually: false,
    scanSessionId: null,
    ...overrides,
  };
}

export function makeScanSession(overrides: Partial<ScanSession> = {}): ScanSession {
  return {
    id: crypto.randomUUID(),
    capturedAt: Date.now(),
    imageThumb: null,
    booksRecognized: [],
    status: 'pending',
    ...overrides,
  };
}
