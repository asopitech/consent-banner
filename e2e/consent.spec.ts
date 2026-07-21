import { expect, test } from '@playwright/test';

test('page navigation and denied path have no google requests', async ({ page }) => {
  const google: string[] = [];
  page.on('request', (request) => { if (request.url().includes('google')) google.push(request.url()); });
  await page.goto('/demo/a.html');
  await expect(page.getByRole('region', { name: 'Cookieの利用に関する同意' })).toBeVisible();
  await page.getByText('拒否する', { exact: true }).click();
  await page.getByRole('link', { name: 'Page B' }).click();
  await expect(page).toHaveURL(/b\.html$/);
  expect(google).toEqual([]);
});

test('settings dialog supports escape and focus return', async ({ page }) => {
  await page.goto('/demo/a.html');
  await expect(page.getByRole('region')).toBeVisible();
  await page.getByRole('link', { name: 'Page B' }).focus();
  await page.evaluate(() => window.AsopiConsentBanner.showSettings());
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('link')).toHaveAttribute('href', 'https://example.com/privacy');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Page B' })).toBeFocused();
});

test('built bundle exposes the public API on window', async ({ page }) => {
  await page.goto('/demo/a.html');
  const api = await page.evaluate(() => ({
    hasApi: typeof window.AsopiConsentBanner === 'object',
    reset: typeof window.AsopiConsentBanner?.reset,
    showSettings: typeof window.AsopiConsentBanner?.showSettings,
    getState: typeof window.AsopiConsentBanner?.getState,
  }));
  expect(api).toEqual({
    hasApi: true,
    reset: 'function',
    showSettings: 'function',
    getState: 'function',
  });
});
