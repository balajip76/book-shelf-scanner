import { useLocation, useNavigate } from 'react-router-dom';
import { ScanResultList } from '../components/scan-review/ScanResultList';
import { db } from '../db';
import type { ScanResult, Book, RecognizedBook } from '../types';

interface EditableBook extends RecognizedBook {
  editedTitle?: string;
  editedAuthor?: string;
  resolved?: boolean;
}

export function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const scanResult = location.state?.scanResult as ScanResult | undefined;

  if (!scanResult) {
    return (
      <div data-testid="review-page" className="flex flex-col items-center justify-center gap-4 p-6 min-h-[60dvh] text-center">
        <p style={{ color: 'var(--color-text-muted)' }}>No scan result found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl font-medium"
          style={{ background: 'var(--color-primary)', color: '#fff', minHeight: 44 }}
        >
          Go to Scanner
        </button>
      </div>
    );
  }

  const handleConfirm = async (editedBooks: EditableBook[]) => {
    const now = Date.now();
    const bookIds: string[] = [];

    await db.transaction('rw', db.books, db.scanSessions, async () => {
      for (const eb of editedBooks) {
        const title = eb.editedTitle ?? eb.title;
        if (!title?.trim()) continue;

        const id = crypto.randomUUID();
        bookIds.push(id);

        const book: Book = {
          id,
          title: title.trim(),
          author: (eb.editedAuthor ?? eb.author)?.trim() || null,
          disposition: 'unassigned',
          genre: eb.genre,
          subCategory: eb.subCategory,
          notes: null,
          capturedAt: now,
          completedAt: null,
          addedManually: false,
          scanSessionId: scanResult.sessionId,
        };
        await db.books.add(book);
      }

      await db.scanSessions.add({
        id: scanResult.sessionId,
        capturedAt: now,
        imageThumb: null,
        booksRecognized: bookIds,
        status: 'complete',
      });
    });

    navigate('/collection');
  };

  return (
    <div data-testid="review-page" className="flex flex-col gap-4 p-4">
      <div className="text-center pt-2">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Review Books</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {scanResult.books.length} {scanResult.books.length === 1 ? 'book' : 'books'} found — edit and confirm
        </p>
      </div>

      <ScanResultList books={scanResult.books} onConfirm={handleConfirm} />
    </div>
  );
}
