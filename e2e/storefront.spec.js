import { test, expect } from '@playwright/test';

const products = [
  {
    id: 1,
    name: 'Maple mug',
    description: 'A handmade mug',
    category: 'Home',
    price: 20,
    image: '/images/about/store-front-2.png',
    isOnSale: false,
    stockQuantity: 10,
  },
  {
    id: 2,
    name: 'Linen tote',
    description: 'Reusable shopping bag',
    category: 'Everyday',
    price: 30,
    image: '/images/about/store-front-2.png',
    isOnSale: false,
    stockQuantity: 10,
  },
];

test.beforeEach(async ({ page }) => {
  // Fail closed: browser tests never contact the real backend or create orders.
  await page.route('http://localhost:3001/**', async (route) => {
    if (new URL(route.request().url()).pathname === '/api/products')
      return route.fulfill({ json: products });
    return route.fulfill({
      status: 501,
      json: { error: 'Unmocked API request' },
    });
  });
});

test('search, bag totals, login guard and keyboard dismissal', async ({
  page,
}) => {
  await page.goto('/products');
  await page.getByRole('searchbox', { name: 'Search products' }).fill('Maple');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Add Maple mug to bag' }).click();
  const bag = page.getByRole('button', { name: 'Open shopping bag, 1 items' });
  await bag.click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByRole('button', { name: 'Increase Maple mug quantity' })
    .click();
  await expect(dialog.locator('.cart-total')).toHaveText('Total:$40.00');
  await dialog.getByRole('button', { name: 'Proceed to Checkout' }).click();
  await expect(dialog.getByRole('alert')).toHaveText(
    'Please log in before checking out.'
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Open shopping bag, 2 items' })
  ).toBeFocused();
});

test('login and successful checkout send the selected quantity and clear the bag', async ({
  page,
}) => {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      json: {
        token: 'browser-test-token',
        user: { id: 1, name: 'Test Shopper', role: 'user' },
      },
    })
  );
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('shopper@example.test');
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Profile', exact: true })
  ).toBeVisible();
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add Maple mug to bag' }).click();
  await page
    .getByRole('button', { name: 'Open shopping bag, 1 items' })
    .click();
  await page
    .getByRole('button', { name: 'Increase Maple mug quantity' })
    .click();
  let payload;
  await page.route('**/api/checkout', (route) => {
    payload = route.request().postDataJSON();
    return route.fulfill({ json: { receipt: { id: 1, total: 40 } } });
  });
  await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(payload).toEqual({
    items: [{ productId: 1, quantity: 2, pricingTier: 'regular' }],
  });
  await expect(
    page.getByRole('button', { name: 'Open shopping bag, 0 items' })
  ).toBeVisible();
});

test('main pages fit the viewport and the About image loads', async ({
  page,
}) => {
  for (const path of ['/', '/products', '/about']) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  }
  const image = page.locator('main img').first();
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0))
    .toBe(true);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Shop all' })
    .click();
  await expect(page).toHaveURL(/\/products$/);
});

test('image dialog traps focus, ignores image clicks, and restores focus on Escape', async ({
  page,
}) => {
  await page.goto('/products');
  const trigger = page.getByRole('button', { name: 'View Maple mug image' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Maple mug' });
  const close = dialog.getByRole('button', { name: 'Close product image' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await dialog.getByRole('img', { name: 'Maple mug' }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
