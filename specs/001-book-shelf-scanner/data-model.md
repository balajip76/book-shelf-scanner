# Data Model: Book Shelf Scanner & Sorter

**Branch**: `001-book-shelf-scanner` | **Date**: 2026-03-07

## Entities

### Book

The primary entity. Represents a single volume in the user's collection.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | `string` (UUID v4) | Yes | auto-generated | Primary key |
| `title` | `string` | Yes | — | Required; user must provide if scan cannot read it |
| `author` | `string \| null` | No | `null` | Optional; may be null for unknown authors |
| `disposition` | `Disposition` | Yes | `"unassigned"` | Enum: `keep \| give-away \| throw-away \| unassigned` |
| `genre` | `Genre` | Yes | `"uncategorized"` | Enum: `fiction \| non-fiction \| uncategorized` |
| `subCategory` | `SubCategory \| null` | No | `null` | Fixed list; null until classified or manually set |
| `notes` | `string \| null` | No | `null` | Optional free-text user notes |
| `capturedAt` | `number` (epoch ms) | Yes | `Date.now()` | When the book was added to the collection |
| `completedAt` | `number \| null` (epoch ms) | No | `null` | Set when user marks book complete; null otherwise |
| `addedManually` | `boolean` | Yes | `false` | True if added via manual entry, not a scan |
| `scanSessionId` | `string \| null` | No | `null` | Foreign key to `ScanSession.id`; null for manual entries |

**Validation rules**:
- `title` must be non-empty string (trimmed length ≥ 1)
- `completedAt` may only be non-null when `disposition` is `"give-away"` or `"throw-away"`
- Completing a book does not change its `disposition`

**State transitions**:
```
disposition: unassigned → keep | give-away | throw-away (user assigns)
disposition: keep | give-away | throw-away → any other (user edits)
completedAt: null → number   (user marks complete; only for give-away | throw-away)
completedAt: number → null   (user un-marks complete)
```

**Indexes** (Dexie): `disposition`, `genre`, `subCategory`, `completedAt`, `capturedAt`, `scanSessionId`

---

### ScanSession

Represents a single camera capture event.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | `string` (UUID v4) | Yes | auto-generated | Primary key |
| `capturedAt` | `number` (epoch ms) | Yes | `Date.now()` | When the photo was taken |
| `imageThumb` | `string \| null` | No | `null` | Base64 JPEG thumbnail (≤200×150px); for future display use |
| `booksRecognized` | `string[]` | Yes | `[]` | Ordered list of `Book.id` values from this session |
| `status` | `ScanStatus` | Yes | `"pending"` | Enum: `pending \| complete \| failed` |

**Indexes** (Dexie): `capturedAt`, `status`

---

### Collection (logical, not stored)

The user's full local library. Not a stored entity — it is the logical aggregate of all `Book` and `ScanSession` records in IndexedDB. There is no `Collection` table.

---

## TypeScript Types

```typescript
// src/types/index.ts

export type Disposition = 'keep' | 'give-away' | 'throw-away' | 'unassigned';

export type Genre = 'fiction' | 'non-fiction' | 'uncategorized';

export type SubCategory =
  // Fiction
  | 'literary-fiction'
  | 'science-fiction'
  | 'mystery'
  | 'romance'
  | 'fantasy'
  | 'thriller'
  | 'historical-fiction'
  | 'horror'
  | 'short-stories'
  | 'graphic-novel'
  // Non-Fiction
  | 'self-help'
  | 'biography'
  | 'memoir'
  | 'history'
  | 'science'
  | 'business'
  | 'travel'
  | 'cooking'
  | 'philosophy'
  | 'psychology'
  | 'politics'
  | 'true-crime';

export type ScanStatus = 'pending' | 'complete' | 'failed';

export interface Book {
  id: string;
  title: string;
  author: string | null;
  disposition: Disposition;
  genre: Genre;
  subCategory: SubCategory | null;
  notes: string | null;
  capturedAt: number;
  completedAt: number | null;
  addedManually: boolean;
  scanSessionId: string | null;
}

export interface ScanSession {
  id: string;
  capturedAt: number;
  imageThumb: string | null;
  booksRecognized: string[];
  status: ScanStatus;
}
```

---

## Dexie Schema

```typescript
// src/db/index.ts

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
```

---

## Sub-category Fixed List

Sub-categories are defined at build time. Users cannot create new sub-categories.

| Genre | Sub-categories |
|-------|---------------|
| Fiction | Literary Fiction, Science Fiction, Mystery, Romance, Fantasy, Thriller, Historical Fiction, Horror, Short Stories, Graphic Novel |
| Non-Fiction | Self-Help, Biography, Memoir, History, Science, Business, Travel, Cooking, Philosophy, Psychology, Politics, True Crime |

---

## CSV Export Schema

Column order for the exported CSV file (FR-013):

```
id, title, author, genre, subCategory, disposition, completedAt, capturedAt, addedManually
```

- `completedAt`: ISO-8601 string if set, empty string if null
- `capturedAt`: ISO-8601 string
- `addedManually`: `"true"` or `"false"`
- `subCategory`: empty string if null
