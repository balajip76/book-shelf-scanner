import { exportCollectionAsCSV } from '../../utils/csv-export';
import { useCollection } from '../../hooks/useCollection';

export function ExportButton() {
  const { allBooks } = useCollection();

  return (
    <button
      data-testid="export-button"
      onClick={() => exportCollectionAsCSV(allBooks)}
      disabled={allBooks.length === 0}
      className="p-2 rounded-lg transition-opacity disabled:opacity-40"
      style={{ color: 'var(--color-text-muted)', minHeight: 44, minWidth: 44 }}
      aria-label="Export collection as CSV"
      title="Export CSV"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    </button>
  );
}
