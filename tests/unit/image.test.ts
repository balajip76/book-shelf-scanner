import { describe, it, expect, vi, afterEach } from 'vitest';

describe('downsampleImage', () => {
  const origImage = globalThis.Image;
  const origURL = globalThis.URL;

  afterEach(() => {
    vi.stubGlobal('Image', origImage);
    vi.stubGlobal('URL', origURL);
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('returns base64 JPEG with dimensions <= 1280x720', async () => {
    // Create a fake blob
    const blob = new Blob(['fake-image'], { type: 'image/jpeg' });

    // Mock Image constructor
    vi.stubGlobal('Image', class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      width = 3840;
      height = 2160;
      private _src = '';
      get src() { return this._src; }
      set src(v: string) {
        this._src = v;
        // Fire onload synchronously in microtask
        Promise.resolve().then(() => this.onload?.());
      }
    });

    vi.stubGlobal('URL', {
      ...origURL,
      createObjectURL: () => 'blob:test',
      revokeObjectURL: vi.fn(),
    });

    // Mock canvas getContext and toDataURL
    const mockCtx = { drawImage: vi.fn() };
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        const c = origCreate('canvas');
        vi.spyOn(c, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
        vi.spyOn(c, 'toDataURL').mockReturnValue('data:image/jpeg;base64,/9j/TEST');
        return c;
      }
      return origCreate(tag);
    });

    const { downsampleImage } = await import('../../src/utils/image');
    const result = await downsampleImage(blob);

    expect(result.mediaType).toBe('image/jpeg');
    expect(result.base64).toBe('/9j/TEST');
    expect(result.width).toBeLessThanOrEqual(1280);
    expect(result.height).toBeLessThanOrEqual(720);
  });
});
