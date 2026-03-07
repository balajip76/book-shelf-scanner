import { useState } from 'react';
import { CollectionView } from '../components/collection/CollectionView';
import { FilterBar } from '../components/collection/FilterBar';
import { BookEditModal } from '../components/collection/BookEditModal';
import { ExportButton } from '../components/collection/ExportButton';
import { useCollection, type BookFilter } from '../hooks/useCollection';
import type { Book } from '../types';

export function CollectionPage() {
  const [filter, setFilter] = useState<BookFilter>({});
  const [showCompleted, setShowCompleted] = useState(true);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addAuthor, setAddAuthor] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  const { updateBook, addBookWithDuplicateCheck } = useCollection();

  const effectiveFilter: BookFilter = {
    ...filter,
    showCompleted: showCompleted ? undefined : false,
  };

  const handleAddBook = async (force = false) => {
    const t = addTitle.trim();
    if (!t) return;
    const a = addAuthor.trim() || null;
    const { isDuplicate } = await addBookWithDuplicateCheck({
      title: t,
      author: a,
      disposition: 'unassigned',
      genre: 'uncategorized',
      subCategory: null,
      notes: null,
      completedAt: null,
      addedManually: true,
      scanSessionId: null,
    });
    if (isDuplicate && !force) {
      setDuplicateWarning(true);
      return;
    }
    setAddTitle('');
    setAddAuthor('');
    setShowAddModal(false);
    setDuplicateWarning(false);
  };

  return (
    <div data-testid="collection-page" className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 flex items-center justify-between gap-2"
        style={{ borderBottom: '1px solid var(--color-surface-3)' }}
      >
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>My Collection</h1>
        <div className="flex items-center gap-1">
          <ExportButton />
          <button
            onClick={() => { setShowAddModal(true); setDuplicateWarning(false); setAddTitle(''); setAddAuthor(''); }}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: '#fff', minHeight: 44 }}
            aria-label="Add book manually"
          >
            + Add Book
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        filter={filter}
        showCompleted={showCompleted}
        onFilterChange={setFilter}
        onToggleCompleted={() => setShowCompleted(p => !p)}
      />

      {/* Collection list */}
      <div className="flex-1 overflow-auto py-4">
        <CollectionView
          filter={effectiveFilter}
          onEditBook={setEditingBook}
        />
      </div>

      {/* Edit modal */}
      <BookEditModal
        book={editingBook}
        onSave={(id, patch) => updateBook(id, patch)}
        onClose={() => setEditingBook(null)}
      />

      {/* Add book manually modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-t-2xl p-6 space-y-4"
            style={{
              background: 'var(--color-surface-2)',
              paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Add Book</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg"
                style={{ color: 'var(--color-text-muted)', minHeight: 44, minWidth: 44 }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              data-testid="add-book-title"
              type="text"
              placeholder="Title (required)"
              value={addTitle}
              onChange={e => { setAddTitle(e.target.value); setDuplicateWarning(false); }}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--color-surface-3)', color: 'var(--color-text)', border: 'none' }}
            />
            <input
              type="text"
              placeholder="Author (optional)"
              value={addAuthor}
              onChange={e => setAddAuthor(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--color-surface-3)', color: 'var(--color-text)', border: 'none' }}
            />

            {duplicateWarning && (
              <div className="rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)' }}>
                A book with this title already exists. Add anyway?
                <button
                  onClick={() => handleAddBook(true)}
                  className="ml-2 underline font-medium"
                  style={{ color: 'var(--color-warning)' }}
                >
                  Add anyway
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl font-medium"
                style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-muted)', minHeight: 44 }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddBook(false)}
                disabled={!addTitle.trim()}
                className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--color-primary)', minHeight: 44 }}
              >
                Add Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
