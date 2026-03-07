import { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import type { Book, Disposition, Genre, SubCategory } from '../../types';
import { getGenreColor, getGenreTextColor, getSubCategoryLabel, FICTION_SUBCATEGORIES, NONFICTION_SUBCATEGORIES } from '../../utils/genre';

const DISPOSITION_LABELS: Record<Disposition, string> = {
  unassigned: 'Unassigned',
  keep: 'Keep',
  'give-away': 'Give Away',
  'throw-away': 'Throw Away',
};

const DISPOSITION_COLORS: Record<Disposition, string> = {
  unassigned: 'var(--color-surface-3)',
  keep: 'var(--color-success)',
  'give-away': 'var(--color-primary)',
  'throw-away': 'var(--color-danger)',
};

function GenrePicker({
  book,
  onGenreChange,
}: {
  book: Book;
  onGenreChange?: (id: string, genre: Genre, subCategory: SubCategory | null) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setShowPicker(p => !p); }}
        className="text-xs px-2 py-0.5 rounded-full transition-opacity"
        style={{
          background: getGenreColor(book.genre),
          color: getGenreTextColor(book.genre),
          minHeight: 24,
        }}
        aria-label={`Genre: ${book.genre}`}
      >
        {book.genre === 'uncategorized'
          ? 'Set Genre'
          : book.subCategory
          ? getSubCategoryLabel(book.subCategory)
          : book.genre}
      </button>
      {showPicker && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-xl shadow-xl overflow-auto"
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-surface-3)',
            maxHeight: 240,
            width: 200,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2">
            <p className="text-xs font-semibold px-2 py-1" style={{ color: 'var(--color-text-muted)' }}>
              Fiction
            </p>
            {FICTION_SUBCATEGORIES.map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  onGenreChange?.(book.id, 'fiction', sub);
                  setShowPicker(false);
                }}
                className="w-full text-left text-xs px-2 py-1.5 rounded-lg"
                style={{ color: 'var(--color-text)', minHeight: 32 }}
              >
                {getSubCategoryLabel(sub)}
              </button>
            ))}
            <p
              className="text-xs font-semibold px-2 py-1 mt-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Non-Fiction
            </p>
            {NONFICTION_SUBCATEGORIES.map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  onGenreChange?.(book.id, 'non-fiction', sub);
                  setShowPicker(false);
                }}
                className="w-full text-left text-xs px-2 py-1.5 rounded-lg"
                style={{ color: 'var(--color-text)', minHeight: 32 }}
              >
                {getSubCategoryLabel(sub)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  book: Book;
  onDispositionChange: (id: string, disposition: Disposition) => void;
  onGenreChange?: (id: string, genre: Genre, subCategory: SubCategory | null) => void;
  onMarkComplete?: (id: string) => void;
  onUnmarkComplete?: (id: string) => void;
  onEdit?: (book: Book) => void;
}

export function BookCard({ book, onDispositionChange, onGenreChange, onMarkComplete, onUnmarkComplete, onEdit }: Props) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-120, -60, 0, 60, 120],
    [
      'rgba(239,68,68,0.2)',
      'rgba(239,68,68,0.1)',
      'transparent',
      'rgba(20,184,166,0.1)',
      'rgba(20,184,166,0.2)',
    ]
  );

  const isCompleted = !!book.completedAt;
  const canComplete = book.disposition === 'give-away' || book.disposition === 'throw-away';

  const handleDragEnd = (_e: PointerEvent, info: { offset: { x: number } }) => {
    const threshold = 80;
    if (info.offset.x > threshold) {
      onDispositionChange(book.id, 'keep');
    } else if (info.offset.x < -threshold) {
      onDispositionChange(book.id, 'throw-away');
    }
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
  };

  return (
    <motion.div
      style={{ x, background }}
      drag="x"
      dragConstraints={{ left: -150, right: 150 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
      data-testid={`book-card-${book.id}`}
      role="button"
      aria-label={`Book: ${book.title}`}
      className="rounded-xl p-4 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className={`font-medium truncate ${isCompleted ? 'line-through' : ''}`}
            style={{ color: 'var(--color-text)', opacity: isCompleted ? 0.5 : 1 }}
          >
            {book.title}
          </p>
          {book.author && (
            <p className="text-sm truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {book.author}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const order: Disposition[] = ['unassigned', 'keep', 'give-away', 'throw-away'];
                const next = order[(order.indexOf(book.disposition) + 1) % order.length];
                onDispositionChange(book.id, next);
              }}
              className="text-xs px-2 py-0.5 rounded-full font-medium transition-opacity"
              style={{
                background: DISPOSITION_COLORS[book.disposition],
                color: book.disposition === 'unassigned' ? 'var(--color-text-muted)' : '#fff',
                minHeight: 24,
              }}
              aria-label={`Disposition: ${DISPOSITION_LABELS[book.disposition]}`}
            >
              {DISPOSITION_LABELS[book.disposition]}
            </button>
            <GenrePicker book={book} onGenreChange={onGenreChange} />
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(book); }}
              className="p-1.5 rounded-lg"
              style={{ color: 'var(--color-text-muted)', minHeight: 36, minWidth: 36 }}
              aria-label="Edit book"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {canComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                isCompleted ? onUnmarkComplete?.(book.id) : onMarkComplete?.(book.id);
              }}
              className="p-1.5 rounded-lg text-xs"
              style={{
                color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-success)',
                minHeight: 36,
                minWidth: 36,
              }}
              aria-label={isCompleted ? 'Undo complete' : 'Mark complete'}
            >
              <svg className="w-4 h-4" fill={isCompleted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-2 pointer-events-none">
        <span className="text-xs" style={{ color: 'var(--color-danger)', opacity: 0.6 }}>Throw Away</span>
        <span className="text-xs" style={{ color: 'var(--color-success)', opacity: 0.6 }}>Keep</span>
      </div>
    </motion.div>
  );
}
