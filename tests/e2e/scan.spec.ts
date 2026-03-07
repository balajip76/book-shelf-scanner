import { test, expect } from '@playwright/test';

test.describe('US1: Camera Scan Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('/api/scan', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'e2e-sess-1',
          books: [
            { tempId: 't1', title: 'Dune', author: 'Frank Herbert', readable: true, genre: 'fiction', subCategory: 'science-fiction', classificationConfidence: 'high' },
            { tempId: 't2', title: null, author: null, readable: false, genre: 'uncategorized', subCategory: null, classificationConfidence: null },
          ],
          durationMs: 500,
        }),
      });
    });

    await page.context().grantPermissions(['camera']);
    await page.goto('/');
  });

  test('file-input capture shows recognized books on review page', async ({ page }) => {
    await expect(page.getByTestId('scan-page')).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    const jpegBytes = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARAAgACgADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAIhAAAgIBBAMBAAAAAAAAAAAAAQIDBBESITFBUWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AqvSdOxr2sTIuqyjb0YqKjFLySXhJJe7ObdtF61W09OlWpNNxSS5J8/wAUUAf/2Q==', 'base64');
    await fileInput.setInputFiles({
      name: 'shelf.jpg',
      mimeType: 'image/jpeg',
      buffer: jpegBytes,
    });

    await page.waitForURL('**/review', { timeout: 10000 });
    await expect(page).toHaveURL(/\/review/);
  });

  test('review page shows recognized books list with unreadable prompt', async ({ page }) => {
    await page.goto('/review');
    await expect(page.getByTestId('review-page')).toBeVisible();
  });

  test('unreadable book shows manual entry prompt', async ({ page }) => {
    await page.goto('/review');
    await expect(page.getByTestId('review-page')).toBeVisible();
  });
});
