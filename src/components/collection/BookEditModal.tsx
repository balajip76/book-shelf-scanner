import { useState, useEffect } from 'react';
import type { Book, Disposition, Genre, SubCategory } from '../../types';
import { getSubCategoriesForGenre, getSubCategoryLabel } from '../../utils/genre';

const DISPOSITIONS: Disposition[] = ['unassigned', 'keep', 'give-away', 'throw-away'];
const DISPOSITION_LABELS: Record<Disposition, string> = {
  unassigned: 'Unassigned',
  keep: 'Keep',
  'give-away': 'Give Away',
  'throw-away': 'Throw Away',
};
const GENRES: Genre[] = ['fiction', 'non-fiction', 'uncategorized'];
const GENRE_LABELS: Record<Genre, string> = {
  fiction: 'Fiction',
  'non-fiction': 'Non-Fiction',
  uncategorized: 'Uncategorized',
};

interface Props {
  book: Book | null;
  onSave: (id: string, patch: Partial<Omit<Book, 'id'>>) => void;
  onClose: () => void;
}

export function BookEditModal({ book, onSave, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [disposition, setDisposition] = useState<Disposition>('unassigned');
  const [genre, setGenre] = useState<Genre>('uncategorized');
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author ?? '');
      setDisposition(book.disposition);
      setGenre(book.genre);
      setSubCategory(book.subCategory);
    }
  }, [book]);

  if (!book) return null;

  const subCategories = getSubCategoriesForGenre(genre);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(book.id, {
      title: title.trim(),
      author: author.trim() || null,
      disposition,
      genre,
      subCategory: subCategories.length > 0 ? subCategory : null,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        className="w-full max-w-lg rounded-t-2xl p-6 space-y-4"
        style={{ background: 'var(--color-surface-2)', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between">
          <h2 id="edit-modal-title" className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Edit Book</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ color: 'var(--color-text-muted)', minHeight: 44, minWidth: 44 }}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Title *</label>
            <input
              data-testid="edit-title-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--color-surface-3)', color: 'var(--color-text)', border: 'none' }}
              placeholder="Book title"
            />
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Author</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--color-surface-3)', color: 'var(--color-text)', border: 'none' }}
              placeholder="Author name (optional)"
            />
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Pile</label>
            <select
              value={disposition}
              onChange={e => setDisposition(e.target.value as Disposition)}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--color-surface-3)', color: 'var(--color-text)', border: 'none' }}
            >
              {DISPOSITIONS.map(d => (
                <option key={d} value={d}>{DISPOSITION_LABELS[d]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Genre</label>
            <select
              value={genre}
              onChange={e => {
                setGenre(e.target.value as Genre);
                setSubCategory(null);
              }}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--color-surface-3)', color: 'var(--color-text)', border: 'none' }}
            >
              {GENRES.map(g => (
                <option key={g} value={g}>{GENRE_LABELS[g]}</option>
              ))}
            </select>
          </div>

          {subCategories.length > 0 && (
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Sub-category</label>
              <select
                value={subCategory ?? ''}
                onChange={e => setSubCategory((e.target.value || null) as SubCategory | null)}
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{ background: 'var(--color-surface-3)', color: 'var(--color-text)', border: 'none' }}
              >
                <option value="">None</option>
                {subCategories.map(sub => (
                  <option key={sub} value={sub}>{getSubCategoryLabel(sub)}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium"
            style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-muted)', minHeight: 44 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--color-primary)', minHeight: 44 }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
