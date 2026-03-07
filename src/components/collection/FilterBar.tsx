import type { Disposition, Genre } from '../../types';
import type { BookFilter } from '../../hooks/useCollection';

const DISPOSITIONS: { value: Disposition | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'keep', label: 'Keep' },
  { value: 'give-away', label: 'Give Away' },
  { value: 'throw-away', label: 'Throw Away' },
];

const GENRES: { value: Genre | 'all'; label: string }[] = [
  { value: 'all', label: 'All Genres' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'uncategorized', label: 'Uncategorized' },
];

interface Props {
  filter: BookFilter;
  showCompleted: boolean;
  onFilterChange: (filter: BookFilter) => void;
  onToggleCompleted: () => void;
}

export function FilterBar({ filter, showCompleted, onFilterChange, onToggleCompleted }: Props) {
  return (
    <div className="space-y-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-surface-3)' }}>
      {/* Disposition pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Filter by pile"
        style={{ scrollbarWidth: 'none' }}
      >
        {DISPOSITIONS.map(({ value, label }) => {
          const active = (value === 'all' && !filter.disposition) || filter.disposition === value;
          return (
            <button
              key={value}
              onClick={() => onFilterChange({ ...filter, disposition: value === 'all' ? undefined : value })}
              className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: active ? '#fff' : 'var(--color-text-muted)',
                minHeight: 36,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Genre select + Show Completed toggle */}
      <div className="flex items-center gap-3">
        <select
          value={filter.genre ?? 'all'}
          onChange={e => {
            const v = e.target.value as Genre | 'all';
            onFilterChange({ ...filter, genre: v === 'all' ? undefined : v });
          }}
          className="flex-1 px-3 py-2 rounded-lg text-sm"
          style={{
            background: 'var(--color-surface-2)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-surface-3)',
            minHeight: 40,
          }}
          aria-label="Filter by genre"
        >
          {GENRES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <button
          onClick={onToggleCompleted}
          className="shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: showCompleted ? 'var(--color-surface-3)' : 'var(--color-surface-2)',
            color: showCompleted ? 'var(--color-text)' : 'var(--color-text-muted)',
            border: '1px solid var(--color-surface-3)',
            minHeight: 40,
          }}
          aria-label={showCompleted ? 'Hide completed' : 'Show completed'}
        >
          {showCompleted ? 'Hide Done' : 'Show Done'}
        </button>
      </div>
    </div>
  );
}
