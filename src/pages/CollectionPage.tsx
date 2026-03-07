import { useState } from 'react';
import { CollectionView } from '../components/collection/CollectionView';
import { useStorageQuota } from '../hooks/useStorageQuota';
import type { BookFilter } from '../hooks/useCollection';

export function CollectionPage() {
  const { isNearFull } = useStorageQuota();
  const [filter] = useState<BookFilter>({});

  return (
    <div data-testid="collection-page" className="flex flex-col min-h-dvh">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-surface-3)' }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>My Collection</h1>
        <button
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--color-primary)', color: '#fff', minHeight: 44 }}
          onClick={() => {/* Add book modal — wired in US4 */}}
          aria-label="Add book manually"
        >
          + Add Book
        </button>
      </div>

      {isNearFull && (
        <div className="mx-4 mt-3 px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)' }}>
          Storage nearly full — export your collection soon.
        </div>
      )}

      <div className="flex-1 overflow-auto py-4">
        <CollectionView filter={filter} />
      </div>
    </div>
  );
}
