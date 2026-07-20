import type { Language } from './types';

export const MEASUREMENT_ID_RE = /^G-[A-Z0-9]+$/;

export type AppConfig = {
  measurementId: string | null;
  consentVersion: string;
  revision: number;
  language: Language;
  policyUrl: string | null;
  debug: boolean;
};

export function currentScript(): HTMLScriptElement | null {
  if (document.currentScript instanceof HTMLScriptElement) return document.currentScript;
  return document.querySelector('script[data-asopi-consent],script[data-measurement-id]');
}

export function parseConfig(script = currentScript(), locationRef: Location = window.location, navigatorRef: Navigator = window.navigator): AppConfig {
  const measurement = script?.dataset.measurementId ?? '';
  const version = script?.dataset.consentVersion || '1';
  const revision = parseRevision(version, script?.dataset.debug === 'true');
  return {
    measurementId: MEASUREMENT_ID_RE.test(measurement) ? measurement : null,
    consentVersion: version,
    revision,
    language: resolveLanguage(script?.dataset.language, navigatorRef),
    policyUrl: parsePolicyUrl(script?.dataset.policyUrl, locationRef),
    debug: script?.dataset.debug === 'true',
  };
}

export function parseRevision(value: string, debug: boolean): number {
  const revision = Number.parseInt(value, 10);
  if (Number.isFinite(revision) && revision > 0) return revision;
  if (debug) console.warn('AsopiConsent: invalid data-consent-version, using revision 1');
  return 1;
}

export function resolveLanguage(value: string | undefined, navigatorRef: Navigator = window.navigator): Language {
  if (value === 'ja' || value === 'en') return value;
  const lang = navigatorRef.language.toLowerCase();
  return lang.startsWith('ja') ? 'ja' : 'en';
}

export function parsePolicyUrl(value: string | undefined, locationRef: Location = window.location): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, locationRef.href);
    if (url.origin === locationRef.origin) return `${url.pathname}${url.search}${url.hash}`;
    if (url.protocol === 'https:') return url.href;
    return null;
  } catch {
    return null;
  }
}

export function escapeHtmlAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
