import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Book, Disposition, Genre } from '../types';

const DISPOSITION_ORDER: Disposition[] = ['unassigned', 'keep', 'give-away', 'throw-away'];

export function sortBooks(books: Book[]): Book[] {
  return [...books].sort((a, b) => {
    const ai = DISPOSITION_ORDER.indexOf(a.disposition);
    const bi = DISPOSITION_ORDER.indexOf(b.disposition);
    if (ai !== bi) return ai - bi;
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  });
}

export interface BookFilter {
  disposition?: Disposition;
  genre?: Genre;
  showCompleted?: boolean;
}

export function filterBooks(books: Book[], filter: BookFilter): Book[] {
  return books.filter(book => {
    if (filter.disposition && book.disposition !== filter.disposition) return false;
    if (filter.genre && book.genre !== filter.genre) return false;
    if (filter.showCompleted === false && book.completedAt != null) return false;
    return true;
  });
}

export interface UseCollectionOptions {
  filter?: BookFilter;
}

export function useCollection(options: UseCollectionOptions = {}) {
  const allBooks = useLiveQuery(() => db.books.toArray(), []) ?? [];

  const { filter = {} } = options;
  const hasDispositionFilter = !!filter.disposition;

  let displayed = filterBooks(allBooks, filter);
  if (!hasDispositionFilter) {
    displayed = sortBooks(displayed);
  } else {
    displayed = [...displayed].sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    );
  }

  async function addBook(book: Omit<Book, 'id' | 'capturedAt'> & { id?: string; capturedAt?: number }) {
    const id = book.id ?? crypto.randomUUID();
    await db.books.add({ ...book, id, capturedAt: book.capturedAt ?? Date.now() } as Book);
    return id;
  }

  async function addBookWithDuplicateCheck(book: Omit<Book, 'id' | 'capturedAt'>) {
    const normalized = book.title.trim().toLowerCase();
    const existing = allBooks.find(
      b =>
        b.title.trim().toLowerCase() === normalized &&
        (book.author == null || b.author?.trim().toLowerCase() === book.author.trim().toLowerCase())
    );
    const id = await addBook(book);
    return { id, isDuplicate: !!existing };
  }

  async function updateBook(id: string, patch: Partial<Omit<Book, 'id'>>) {
    await db.books.update(id, patch);
  }

  async function updateDisposition(id: string, disposition: Disposition) {
    const patch: Partial<Book> = { disposition };
    if (disposition === 'keep' || disposition === 'unassigned') {
      patch.completedAt = null;
    }
    await db.books.update(id, patch);
  }

  async function markComplete(id: string) {
    const book = await db.books.get(id);
    if (!book) return;
    if (book.disposition !== 'give-away' && book.disposition !== 'throw-away') return;
    await db.books.update(id, { completedAt: Date.now() });
  }

  async function unmarkComplete(id: string) {
    await db.books.update(id, { completedAt: null });
  }

  return {
    books: displayed,
    allBooks,
    addBook,
    addBookWithDuplicateCheck,
    updateBook,
    updateDisposition,
    markComplete,
    unmarkComplete,
  };
}
