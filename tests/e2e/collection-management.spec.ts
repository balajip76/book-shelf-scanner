import { test, expect } from '@playwright/test';

test.describe('US4: Collection Management', () => {
  test('collection page has Add Book button', async ({ page }) => {
    await page.goto('/collection');
    await expect(page.getByTestId('collection-page')).toBeVisible();
    await expect(page.getByRole('button', { name: /add book/i })).toBeVisible();
  });

  test('export button is visible in collection header', async ({ page }) => {
    await page.goto('/collection');
    await expect(page.getByTestId('collection-page')).toBeVisible();
    await expect(page.getByTestId('export-button')).toBeVisible();
  });
});
