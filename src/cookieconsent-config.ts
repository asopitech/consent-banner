import type { CookieConsentConfig } from 'vanilla-cookieconsent';
import { escapeHtmlAttribute, type AppConfig } from './config';
import { enTranslation } from './i18n/en';
import { jaTranslation } from './i18n/ja';

export type SynchronizeAnalyticsConsent = () => Promise<void>;

function policyFooter(url: string | null, language: AppConfig['language']): string {
  if (!url) return '';
  const text = language === 'ja' ? 'プライバシーポリシー' : 'Privacy policy';
  return `<a href="${escapeHtmlAttribute(url)}">${text}</a>`;
}

export function buildCookieConsentConfig(config: AppConfig, sync: SynchronizeAnalyticsConsent): CookieConsentConfig {
  const footer = policyFooter(config.policyUrl, config.language);
  return {
    mode: 'opt-in',
    revision: config.revision,
    manageScriptTags: false,
    autoClearCookies: true,
    disablePageInteraction: false,
    hideFromBots: false,
    guiOptions: {
      consentModal: { layout: 'box', position: 'bottom right', equalWeightButtons: true },
      preferencesModal: { layout: 'box', equalWeightButtons: true },
    },
    cookie: { name: 'asopi_cookieconsent', path: '/', sameSite: 'Lax', secure: location.protocol === 'https:', useLocalStorage: true },
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: {
        enabled: false,
        readOnly: false,
        autoClear: { cookies: [{ name: /^_ga/ }, { name: '_gid' }, { name: /^_gat/ }, { name: /^_gac_/ }] },
      },
    },
    onFirstConsent: () => { void sync(); },
    onConsent: () => { void sync(); },
    onChange: () => { void sync(); },
    language: {
      default: config.language,
      autoDetect: config.language === 'ja' ? undefined : 'browser',
      translations: { ja: jaTranslation(footer), en: enTranslation(footer) },
    },
  };
}
