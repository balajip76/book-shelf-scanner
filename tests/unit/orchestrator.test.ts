import { describe, it, expect, vi, afterEach } from 'vitest';
import type { ScanResult } from '../../src/types';

const mockScanResult: ScanResult = {
  sessionId: 'sess-1',
  books: [
    { tempId: 'tmp-1', title: 'Dune', author: 'Frank Herbert', readable: true, genre: 'fiction', subCategory: 'science-fiction', classificationConfidence: 'high' },
    { tempId: 'tmp-2', title: null, author: null, readable: false, genre: 'uncategorized', subCategory: null, classificationConfidence: null },
  ],
  durationMs: 1200,
};

describe('orchestrator.runScan', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('calls /api/scan with POST and returns ScanResult', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockScanResult,
    }));

    vi.doMock('../../src/utils/image', () => ({
      downsampleImage: vi.fn().mockResolvedValue({ base64: 'abc123', mediaType: 'image/jpeg' }),
    }));

    const { runScan } = await import('../../src/agents/orchestrator');
    const blob = new Blob(['fake'], { type: 'image/jpeg' });
    const result = await runScan(blob, 'sess-1');

    expect(fetch).toHaveBeenCalledWith('/api/scan', expect.objectContaining({ method: 'POST' }));
    expect(result.books).toHaveLength(2);
    expect(result.books[0].readable).toBe(true);
    expect(result.books[1].readable).toBe(false);
    expect(result.books[1].title).toBeNull();
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => 'Internal Server Error',
    }));

    vi.doMock('../../src/utils/image', () => ({
      downsampleImage: vi.fn().mockResolvedValue({ base64: 'abc123', mediaType: 'image/jpeg' }),
    }));

    const { runScan } = await import('../../src/agents/orchestrator');
    const blob = new Blob(['fake'], { type: 'image/jpeg' });
    await expect(runScan(blob, 'sess-err')).rejects.toThrow('Scan API error');
  });
});
