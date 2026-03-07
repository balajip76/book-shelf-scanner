import type { Book } from '../types';

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = [
  'id', 'title', 'author', 'genre', 'subCategory',
  'disposition', 'completedAt', 'capturedAt', 'addedManually',
] as const;

export function buildCSV(books: Book[]): string {
  const rows: string[] = [HEADERS.join(',')];
  for (const b of books) {
    rows.push([
      escapeCSV(b.id),
      escapeCSV(b.title),
      escapeCSV(b.author),
      escapeCSV(b.genre),
      escapeCSV(b.subCategory),
      escapeCSV(b.disposition),
      b.completedAt ? new Date(b.completedAt).toISOString() : '',
      new Date(b.capturedAt).toISOString(),
      String(b.addedManually),
    ].join(','));
  }
  return rows.join('\n');
}

export function exportCollectionAsCSV(books: Book[]): void {
  const csv = buildCSV(books);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'books-export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
