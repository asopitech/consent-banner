import { beforeEach, describe, expect, it } from 'vitest';
import { analyticsLoader } from '../src/analytics-loader';
import { initializeGoogleConsent } from '../src/google-consent';

describe('analytics loader', () => {
  beforeEach(() => { document.head.innerHTML = ''; window.dataLayer = []; initializeGoogleConsent(); });
  it('ignores invalid IDs', async () => { await analyticsLoader.load('BAD'); expect(document.querySelector('script[src*="gtag/js"]')).toBeNull(); });
  it('deduplicates scripts and config', async () => {
    const promise = analyticsLoader.load('G-ABC123');
    expect(analyticsLoader.isLoading()).toBe(true);
    const script = document.querySelector('script[data-asopi-ga4="G-ABC123"]') as HTMLScriptElement;
    script.dispatchEvent(new Event('load'));
    await promise;
    await analyticsLoader.load('G-ABC123');
    expect(document.querySelectorAll('script[data-asopi-ga4="G-ABC123"]')).toHaveLength(1);
    expect(window.dataLayer.filter((item) => item[0] === 'config')).toHaveLength(1);
  });
});
