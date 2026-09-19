import { test, expect } from '@playwright/test';

test('packing-table image appears above the story and collection link works', async ({
  page,
}) => {
  await page.route('http://localhost:3001/**', (route) =>
    route.fulfill({ json: [] })
  );
  await page.goto('/about');
  const image = page.locator(
    'img[src="/images/about/concepts/packing-table.png"]'
  );
  await expect
    .poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0))
    .toBe(true);
  const photo = await image.boundingBox();
  const story = await page.locator('.about-story').boundingBox();
  expect(photo.y + photo.height).toBeLessThanOrEqual(story.y);
  await expect(page.locator('.about-values article')).toHaveCount(4);
  await page.getByRole('link', { name: /Explore the collection/ }).click();
  await expect(page).toHaveURL(/\/products$/);
});
