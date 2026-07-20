import type { ConsentPayload, GtagCommand } from './types';

export const deniedConsent: ConsentPayload = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
export const grantedAnalyticsConsent: ConsentPayload = { ...deniedConsent, analytics_storage: 'granted' };

export function initializeGoogleConsent(): void {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: GtagCommand): void { window.dataLayer.push(args); };
  window.gtag('consent', 'default', deniedConsent);
}

export function grantGoogleAnalyticsConsent(): void { window.gtag('consent', 'update', grantedAnalyticsConsent); }
export function denyGoogleAnalyticsConsent(): void { window.gtag('consent', 'update', deniedConsent); }
