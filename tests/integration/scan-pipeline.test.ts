import { describe, it, expect, vi } from 'vitest';
import type { ScanResult } from '../../src/types';

describe('scan pipeline integration', () => {
  it('orchestrator integrates with mocked /api/scan: 2 readable + 1 unreadable', async () => {
    const mockResult: ScanResult = {
      sessionId: 'int-sess-1',
      books: [
        { tempId: 't1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', readable: true, genre: 'fiction', subCategory: 'literary-fiction', classificationConfidence: 'high' },
        { tempId: 't2', title: '1984', author: 'George Orwell', readable: true, genre: 'fiction', subCategory: 'science-fiction', classificationConfidence: 'high' },
        { tempId: 't3', title: null, author: null, readable: false, genre: 'uncategorized', subCategory: null, classificationConfidence: null },
      ],
      durationMs: 800,
    };

    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResult }) as unknown as typeof fetch;

    vi.doMock('../../src/utils/image', () => ({
      downsampleImage: vi.fn().mockResolvedValue({ base64: 'test', mediaType: 'image/jpeg' }),
    }));

    const { runScan } = await import('../../src/agents/orchestrator');
    const result = await runScan(new Blob(['x'], { type: 'image/jpeg' }), 'int-sess-1');

    expect(result.books).toHaveLength(3);
    expect(result.books.filter(b => b.readable)).toHaveLength(2);
    expect(result.books.filter(b => !b.readable)).toHaveLength(1);
    expect(result.books.every(b => 'tempId' in b)).toBe(true);

    globalThis.fetch = origFetch;
    vi.restoreAllMocks();
  });
});
