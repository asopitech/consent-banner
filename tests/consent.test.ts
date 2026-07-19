import { beforeEach, describe, expect, it, vi } from 'vitest';

async function boot(attrs = 'data-measurement-id="G-ABC123" data-consent-version="1"') {
  vi.resetModules();
  document.head.innerHTML = '';
  document.body.innerHTML = `<script data-asopi-consent ${attrs}></script>`;
  Object.defineProperty(document, 'currentScript', { value: document.querySelector('script'), configurable: true });
  await import('../src/consent.ts');
}

describe('consent banner', () => {
  beforeEach(() => { localStorage.clear(); document.cookie.split(';').forEach((c) => { document.cookie = `${c.split('=')[0]}=; Max-Age=0; path=/`; }); });

  it('shows banner but does not load GA4 for invalid measurement id', async () => { await boot('data-measurement-id="BAD"'); expect(document.querySelector('[role="region"]')).toBeTruthy(); (document.querySelector('button') as HTMLButtonElement).click(); expect(document.querySelector('script[src*="gtag/js"]')).toBeNull(); });
  it('rejects javascript and data policy URLs', async () => { await boot('data-measurement-id="G-ABC123" data-policy-url="javascript:alert(1)"'); expect(document.querySelector('a')).toBeNull(); document.body.innerHTML = '<script data-asopi-consent data-measurement-id="G-ABC123" data-policy-url="data:text/html,x"></script>'; await boot('data-measurement-id="G-ABC123" data-policy-url="data:text/html,x"'); expect(document.querySelector('a')).toBeNull(); });
  it('loads once for saved granted consent', async () => { localStorage.setItem('asopiTechConsent', JSON.stringify({ version: '1', choice: 'granted', updatedAt: new Date().toISOString() })); await boot(); expect(document.querySelector('[role="region"]')).toBeNull(); expect(document.querySelectorAll('script[src*="gtag/js"]')).toHaveLength(1); });
  it('does not load for saved denied consent', async () => { localStorage.setItem('asopiTechConsent', JSON.stringify({ version: '1', choice: 'denied', updatedAt: new Date().toISOString() })); await boot(); expect(document.querySelector('[role="region"]')).toBeNull(); expect(document.querySelector('script[src*="gtag/js"]')).toBeNull(); });
  it('reshows on version change and revokes consent on reset', async () => {
    localStorage.setItem('asopiTechConsent', JSON.stringify({ version: 'old', choice: 'granted', updatedAt: new Date().toISOString() }));
    await boot();
    expect(document.querySelector('[role="region"]')).toBeTruthy();

    document.cookie = '_ga=1; path=/';
    window.AsopiConsentBanner.reset();

    expect(document.querySelector('[role="region"]')).toBeTruthy();
    expect(window.AsopiConsentBanner.getState()).toBe('unknown');
    expect(window.dataLayer.at(-1)).toEqual(['consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
    expect(document.cookie).not.toContain('_ga=');
  });
  it('deduplicates rapid allow clicks', async () => { await boot(); const allow = document.querySelector('button') as HTMLButtonElement; allow.click(); allow.click(); expect(document.querySelectorAll('script[src*="gtag/js"]')).toHaveLength(1); const configs = window.dataLayer.filter((x) => x[0] === 'config'); expect(configs).toHaveLength(0); });
});
