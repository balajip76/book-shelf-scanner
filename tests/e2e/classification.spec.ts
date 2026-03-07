import { test, expect } from '@playwright/test';

test.describe('US3: Genre Classification', () => {
  test('collection page loads and shows collection view', async ({ page }) => {
    await page.goto('/collection');
    await expect(page.getByTestId('collection-page')).toBeVisible();
  });
});
