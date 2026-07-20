import * as CookieConsent from 'vanilla-cookieconsent';
import type { AnalyticsLoader } from './analytics-loader';
import type { AppConfig } from './config';
import type { AsopiConsentApi, ConsentDetails, ConsentState } from './types';

const listeners = new Set<(details: ConsentDetails) => void>();

export function getConsentState(): ConsentState {
  if (!CookieConsent.validConsent()) return 'unknown';
  return CookieConsent.acceptedCategory('analytics') ? 'granted' : 'denied';
}

export function buildDetails(config: AppConfig, loader: AnalyticsLoader): ConsentDetails {
  let updatedAt: string | null = null;
  try { updatedAt = CookieConsent.getCookie('lastConsentTimestamp') ?? null; } catch { updatedAt = null; }
  return { state: getConsentState(), version: config.consentVersion, updatedAt, analyticsLoaded: loader.isLoaded() };
}

export function emitConsentChange(config: AppConfig, loader: AnalyticsLoader): void {
  const details = buildDetails(config, loader);
  window.dispatchEvent(new CustomEvent('asopi-consent:change', { detail: details }));
  for (const listener of listeners) listener(details);
}

export function emitReady(config: AppConfig, loader: AnalyticsLoader): void {
  window.dispatchEvent(new CustomEvent('asopi-consent:ready', { detail: buildDetails(config, loader) }));
}

export function createAsopiConsentApi(config: AppConfig, loader: AnalyticsLoader, sync: () => Promise<void>): AsopiConsentApi {
  return {
    getState: getConsentState,
    getDetails: () => buildDetails(config, loader),
    grant: async () => { CookieConsent.acceptCategory(['necessary', 'analytics']); await sync(); },
    deny: () => { CookieConsent.acceptCategory(['necessary']); void sync(); },
    reset: () => { CookieConsent.reset(true); CookieConsent.show(true); void sync(); },
    openSettings: () => { CookieConsent.showPreferences(); },
    closeSettings: () => { CookieConsent.hidePreferences(); },
    onChange: (callback) => { listeners.add(callback); return () => { listeners.delete(callback); }; },
  };
}
