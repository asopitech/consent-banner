import { expect, test } from '@playwright/test';

test('denied path uses CookieConsent banner and has no google requests across navigation', async ({ page }) => {
  const google: string[] = [];
  page.on('request', (request) => { if (request.url().includes('google')) google.push(request.url()); });
  await page.goto('/demo/a.html');
  await expect(page.getByRole('dialog', { name: 'Cookie同意' })).toBeVisible();
  await page.getByRole('button', { name: '拒否' }).click();
  await expect(page.evaluate(() => window.AsopiConsent.getState())).resolves.toBe('denied');
  await page.getByRole('link', { name: 'Page B' }).click();
  await expect(page).toHaveURL(/b\.html$/);
  await expect(page.evaluate(() => window.AsopiConsent.getState())).resolves.toBe('denied');
  expect(google).toEqual([]);
});

test('allow loads GA4 only after analytics consent and settings supports escape', async ({ page }) => {
  await page.route('https://www.googletagmanager.com/gtag/js**', async (route) => {
    await route.fulfill({ contentType: 'application/javascript', body: 'window.__mockGtagLoaded = true;' });
  });
  await page.goto('/demo/a.html');
  await page.getByRole('button', { name: '詳細を見る' }).click();
  await expect(page.getByRole('dialog', { name: '同意設定' })).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '同意設定' })).toBeHidden();
  await page.getByRole('button', { name: '分析を許可' }).click();
  await expect(page.evaluate(() => window.AsopiConsent.getState())).resolves.toBe('granted');
  await expect(page.locator('script[data-asopi-ga4="G-ABC123"]')).toHaveCount(1);
  const commands = await page.evaluate(() => window.dataLayer.map((item) => item[0]));
  expect(commands.filter((command) => command === 'config')).toHaveLength(1);
  expect(commands).not.toContain('event');
});
