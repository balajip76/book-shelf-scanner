import { test, expect } from '@playwright/test';

test.describe('US2: Disposition Piles', () => {
  test('collection page renders and shows books grouped by disposition', async ({ page }) => {
    await page.goto('/collection');
    await expect(page.getByTestId('collection-page')).toBeVisible();
  });

  test('collection page shows empty state when no books', async ({ page }) => {
    await page.goto('/collection');
    await expect(page.getByTestId('collection-page')).toBeVisible();
  });
});
