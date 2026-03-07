import Dexie, { type EntityTable } from 'dexie';
import type { Book, ScanSession } from '../types';

class BookSorterDB extends Dexie {
  books!: EntityTable<Book, 'id'>;
  scanSessions!: EntityTable<ScanSession, 'id'>;

  constructor() {
    super('BookSorterDB');
    this.version(1).stores({
      books: 'id, disposition, genre, subCategory, completedAt, capturedAt, scanSessionId',
      scanSessions: 'id, capturedAt, status',
    });
  }
}

export const db = new BookSorterDB();
