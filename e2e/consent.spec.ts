import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/google(tagmanager|analytics)\.com/, (route) =>
    route.fulfill({ status: 200, body: 'window.__gtagLoaded=true;' }),
  );
});

test('unknown has no google request until allow', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto('/demo/');
  await expect(page.getByRole('region')).toBeVisible();
  expect(requests.some((url) => url.includes('googletagmanager.com'))).toBe(false);

  await page.getByRole('button', { name: /許可/ }).click();
  await expect
    .poll(() => requests.filter((url) => url.includes('googletagmanager.com/gtag/js')).length)
    .toBe(1);
  await expect(page.locator('script[data-asopi-ga-loader]')).toHaveCount(1);
});

test('reject prevents google load and saves', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto('/demo/');
  await page.getByRole('button', { name: '拒否' }).click();

  expect(requests.some((url) => url.includes('googletagmanager.com'))).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem('asopitech.analytics-consent'))).toContain(
    'denied',
  );
});

test('normal navigation reuses stored grant', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: /許可/ }).click();
  await page.getByRole('link', { name: 'Privacy' }).click();

  await expect(page.getByRole('heading', { name: 'Page B' })).toBeVisible();
  await expect(page.getByRole('region')).toHaveCount(0);
  await expect(page.locator('script[data-asopi-ga-loader]')).toHaveCount(1);
});
