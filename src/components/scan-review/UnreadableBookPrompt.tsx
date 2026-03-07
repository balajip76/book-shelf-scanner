import { useState } from 'react';

interface Props {
  tempId: string;
  onConfirm: (tempId: string, title: string, author: string | null) => void;
}

export function UnreadableBookPrompt({ tempId, onConfirm }: Props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  return (
    <div
      data-testid="unreadable-book-prompt"
      className="rounded-lg p-3 space-y-2"
      style={{ background: 'var(--color-surface-3)', border: '1px dashed var(--color-text-muted)' }}
    >
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Could not read spine — enter details manually
      </p>
      <input
        data-testid="unreadable-title-input"
        type="text"
        placeholder="Title (required)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-sm"
        style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-surface-3)' }}
      />
      <input
        type="text"
        placeholder="Author (optional)"
        value={author}
        onChange={e => setAuthor(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-sm"
        style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-surface-3)' }}
      />
      <button
        onClick={() => {
          const t = title.trim();
          if (!t) return;
          onConfirm(tempId, t, author.trim() || null);
        }}
        disabled={!title.trim()}
        className="w-full py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ background: 'var(--color-primary)', color: '#fff' }}
      >
        Add Book
      </button>
    </div>
  );
}
