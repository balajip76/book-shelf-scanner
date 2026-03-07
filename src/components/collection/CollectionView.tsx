import type { Book, Disposition } from '../../types';
import { BookCard } from './BookCard';
import { useCollection, type BookFilter } from '../../hooks/useCollection';

const DISPOSITION_LABELS: Record<Disposition, string> = {
  unassigned: 'Unassigned',
  keep: 'Keep',
  'give-away': 'Give Away',
  'throw-away': 'Throw Away',
};

interface Props {
  filter?: BookFilter;
  onEditBook?: (book: Book) => void;
}

export function CollectionView({ filter = {}, onEditBook }: Props) {
  const { books, updateDisposition, markComplete, unmarkComplete, updateBook } = useCollection({ filter });

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <svg className="w-12 h-12" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <p style={{ color: 'var(--color-text-muted)' }}>No books yet</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>Scan a shelf or add books manually</p>
      </div>
    );
  }

  const hasDispositionFilter = !!filter.disposition;

  if (hasDispositionFilter) {
    return (
      <div className="space-y-3 px-4">
        {books.map(book => (
          <BookCard
            key={book.id}
            book={book}
            onDispositionChange={(id, d) => updateDisposition(id, d)}
            onGenreChange={(id, genre, subCategory) => updateBook(id, { genre, subCategory })}
            onMarkComplete={markComplete}
            onUnmarkComplete={unmarkComplete}
            onEdit={onEditBook}
          />
        ))}
      </div>
    );
  }

  const groups: Disposition[] = ['unassigned', 'keep', 'give-away', 'throw-away'];
  return (
    <div className="space-y-6 px-4">
      {groups.map(disposition => {
        const groupBooks = books.filter(b => b.disposition === disposition);
        if (groupBooks.length === 0) return null;
        return (
          <div key={disposition}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                {DISPOSITION_LABELS[disposition]}
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-muted)' }}
              >
                {groupBooks.length}
              </span>
            </div>
            <div className="space-y-3">
              {groupBooks.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onDispositionChange={(id, d) => updateDisposition(id, d)}
                  onGenreChange={(id, genre, subCategory) => updateBook(id, { genre, subCategory })}
                  onMarkComplete={markComplete}
                  onUnmarkComplete={unmarkComplete}
                  onEdit={onEditBook}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
