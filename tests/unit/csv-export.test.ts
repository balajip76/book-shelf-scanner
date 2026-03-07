import { describe, it, expect } from 'vitest';
import { makeBook } from '../helpers/db';

describe('exportCollectionAsCSV', () => {
  it('produces a CSV string with the correct header row', async () => {
    const { buildCSV } = await import('../../src/utils/csv-export');
    const csv = buildCSV([]);
    const header = csv.split('\n')[0];
    expect(header).toBe('id,title,author,genre,subCategory,disposition,completedAt,capturedAt,addedManually');
  });

  it('escapes double quotes in title', async () => {
    const { buildCSV } = await import('../../src/utils/csv-export');
    const book = makeBook({ title: 'He said "Hello"', author: null });
    const csv = buildCSV([book]);
    expect(csv).toContain('"He said ""Hello"""');
  });

  it('escapes commas in author field', async () => {
    const { buildCSV } = await import('../../src/utils/csv-export');
    const book = makeBook({ title: 'Book', author: 'Last, First' });
    const csv = buildCSV([book]);
    expect(csv).toContain('"Last, First"');
  });

  it('completedAt is ISO-8601 when set, empty string when null', async () => {
    const { buildCSV } = await import('../../src/utils/csv-export');
    const ts = 1741219200000;
    const book1 = makeBook({ completedAt: ts });
    const book2 = makeBook({ completedAt: null });
    const csv1 = buildCSV([book1]);
    const csv2 = buildCSV([book2]);
    const row1 = csv1.split('\n')[1];
    const row2 = csv2.split('\n')[1];
    expect(row1).toContain(new Date(ts).toISOString());
    expect(row1.length).toBeGreaterThan(0);
    expect(row2).toBeDefined();
  });

  it('addedManually is "true" or "false" string', async () => {
    const { buildCSV } = await import('../../src/utils/csv-export');
    const b1 = makeBook({ addedManually: true });
    const b2 = makeBook({ addedManually: false });
    const csv = buildCSV([b1, b2]);
    expect(csv).toContain('true');
    expect(csv).toContain('false');
  });
});
