import { beforeEach, describe, expect, it } from 'vitest';
import { denyGoogleAnalyticsConsent, grantGoogleAnalyticsConsent, initializeGoogleConsent } from '../src/google-consent';

describe('google consent mode', () => {
  beforeEach(() => { delete (window as Partial<Window>).gtag; window.dataLayer = []; });
  it('sets denied default before any GA command', () => {
    initializeGoogleConsent();
    expect(window.dataLayer[0]).toEqual(['consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
  });
  it('updates analytics only and keeps ads denied', () => {
    initializeGoogleConsent();
    grantGoogleAnalyticsConsent();
    denyGoogleAnalyticsConsent();
    expect(window.dataLayer[1]).toEqual(['consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
    expect(window.dataLayer[2]).toEqual(['consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
  });
});
