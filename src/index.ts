import * as CookieConsent from 'vanilla-cookieconsent';
import { analyticsLoader } from './analytics-loader';
import { clearGoogleAnalyticsCookies } from './cookie-cleanup';
import { createAsopiConsentApi, emitConsentChange, emitReady } from './public-api';
import { parseConfig } from './config';
import { buildCookieConsentConfig } from './cookieconsent-config';
import { denyGoogleAnalyticsConsent, grantGoogleAnalyticsConsent, initializeGoogleConsent } from './google-consent';
import './styles/overrides.css';

let initialized = false;

async function synchronizeAnalyticsConsent(): Promise<void> {
  const config = parseConfig();
  const accepted = CookieConsent.acceptedCategory('analytics');
  if (accepted && config.measurementId) {
    grantGoogleAnalyticsConsent();
    await analyticsLoader.load(config.measurementId);
  } else {
    denyGoogleAnalyticsConsent();
    if (analyticsLoader.isLoaded()) clearGoogleAnalyticsCookies();
  }
  emitConsentChange(config, analyticsLoader);
}

async function boot(): Promise<void> {
  if (initialized) return;
  initialized = true;
  const config = parseConfig();
  initializeGoogleConsent();
  if (config.debug) {
    console.info('AsopiConsent debug', {
      measurementId: config.measurementId,
      ga4Scripts: document.querySelectorAll('script[src*="gtag/js"]').length,
      gtmScripts: document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]').length,
    });
  }
  window.AsopiConsent = createAsopiConsentApi(config, analyticsLoader, synchronizeAnalyticsConsent);
  await CookieConsent.run(buildCookieConsentConfig(config, synchronizeAnalyticsConsent));
  await synchronizeAnalyticsConsent();
  emitReady(config, analyticsLoader);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void boot(); }, { once: true });
else void boot();
