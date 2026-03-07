import { useState } from 'react';
import type { RecognizedBook } from '../../types';
import { UnreadableBookPrompt } from './UnreadableBookPrompt';

interface EditableBook extends RecognizedBook {
  editedTitle?: string;
  editedAuthor?: string;
  resolved?: boolean;
}

interface Props {
  books: RecognizedBook[];
  onConfirm: (books: EditableBook[]) => void;
}

export function ScanResultList({ books: initialBooks, onConfirm }: Props) {
  const [books, setBooks] = useState<EditableBook[]>(initialBooks);

  const updateBook = (tempId: string, patch: Partial<EditableBook>) => {
    setBooks(prev => prev.map(b => b.tempId === tempId ? { ...b, ...patch } : b));
  };

  const handleUnreadableConfirm = (tempId: string, title: string, author: string | null) => {
    updateBook(tempId, { editedTitle: title, editedAuthor: author ?? undefined, resolved: true });
  };

  const allResolved = books.every(b => b.readable || b.resolved || b.editedTitle);

  return (
    <div data-testid="scan-result-list" className="space-y-3">
      {books.map(book => (
        <div key={book.tempId}>
          {!book.readable && !book.resolved ? (
            <UnreadableBookPrompt
              tempId={book.tempId}
              onConfirm={handleUnreadableConfirm}
            />
          ) : (
            <div
              className="rounded-lg p-3 space-y-2"
              style={{ background: 'var(--color-surface-2)' }}
            >
              <input
                data-testid={`book-title-${book.tempId}`}
                type="text"
                value={book.editedTitle ?? book.title ?? ''}
                onChange={e => updateBook(book.tempId, { editedTitle: e.target.value })}
                placeholder="Title"
                className="w-full px-3 py-2 rounded-md text-sm font-medium"
                style={{ background: 'var(--color-surface-3)', color: 'var(--color-text)', border: 'none' }}
              />
              <input
                type="text"
                value={book.editedAuthor ?? book.author ?? ''}
                onChange={e => updateBook(book.tempId, { editedAuthor: e.target.value })}
                placeholder="Author"
                className="w-full px-3 py-2 rounded-md text-sm"
                style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-muted)', border: 'none' }}
              />
              {book.genre !== 'uncategorized' && (
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded-full"
                  style={{ background: book.genre === 'fiction' ? 'var(--color-primary)' : 'var(--color-accent)', color: '#fff' }}
                >
                  {book.genre} {book.subCategory ? `· ${book.subCategory.replace(/-/g, ' ')}` : ''}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
      <button
        data-testid="confirm-scan-button"
        onClick={() => onConfirm(books)}
        disabled={!allResolved && books.some(b => !b.readable && !b.resolved)}
        className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ background: 'var(--color-primary)', minHeight: 44 }}
      >
        Confirm & Save ({books.length} {books.length === 1 ? 'book' : 'books'})
      </button>
    </div>
  );
}
