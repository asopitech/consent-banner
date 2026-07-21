import './consent.css';

type ConsentChoice = 'granted' | 'denied' | 'unknown';
type StoredConsent = { version: string; choice: Exclude<ConsentChoice, 'unknown'>; updatedAt: string };
type ConsentState = 'denied' | 'granted';
type ConsentPayload = { analytics_storage: ConsentState; ad_storage: 'denied'; ad_user_data: 'denied'; ad_personalization: 'denied' };
type LinkerPayload = { domains: string[]; accept_incoming: boolean };
type GtagCommand = ['consent', 'default' | 'update', ConsentPayload] | ['js', Date] | ['config', string] | ['set', 'linker', LinkerPayload];
type Gtag = (...args: GtagCommand) => void;

declare global { interface Window { dataLayer: GtagCommand[]; gtag: Gtag; AsopiConsentBanner: Api } }

type Api = { reset: () => void; showSettings: () => void; getState: () => ConsentChoice };

const STORAGE_KEY = 'asopiTechConsent';
const MEASUREMENT_ID_RE = /^G-[A-Z0-9]+$/;
const LINKER_DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
type Lang = 'ja' | 'en';
const STRINGS: Record<Lang, { region: string; title: string; body: string; policy: string; allow: string; deny: string; dialogTitle: string; dialogBody: string; close: string }> = {
  ja: {
    region: 'Cookieの利用に関する同意',
    title: 'Cookieの利用について',
    body: '当サイトでは、サイト改善のためのアクセス解析（Google Analytics 4）にCookieを使用します。「許可する」を選ぶまでGoogleのタグは読み込まれず、広告目的のCookieは一切使用しません。',
    policy: 'プライバシーポリシー',
    allow: '許可する',
    deny: '拒否する',
    dialogTitle: 'Cookie設定',
    dialogBody: 'アクセス解析Cookieの利用を選択してください。広告関連のストレージは常に無効のままです。',
    close: '閉じる',
  },
  en: {
    region: 'Cookie consent',
    title: 'About cookies on this site',
    body: 'We use cookies for analytics (Google Analytics 4) to improve this site. No Google tags are loaded until you choose "Allow", and we never use advertising cookies.',
    policy: 'Privacy policy',
    allow: 'Allow',
    deny: 'Decline',
    dialogTitle: 'Cookie settings',
    dialogBody: 'Choose whether analytics cookies may be used. Ad-related storage always stays disabled.',
    close: 'Close',
  },
};
const deniedPayload: ConsentPayload = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
const grantedPayload: ConsentPayload = { ...deniedPayload, analytics_storage: 'granted' };
let memoryValue: string | null = null;
let loadPromise: Promise<void> | null = null;
let configured = false;
let banner: HTMLElement | null = null;
let dialog: HTMLDialogElement | null = null;
let lastFocus: Element | null = null;
let currentChoice: ConsentChoice = 'unknown';

// gtag.js only processes commands pushed as Arguments objects; plain arrays are silently ignored
function gtag(...args: GtagCommand): void { window.dataLayer.push(arguments as unknown as GtagCommand); }

function safeGet(): string | null { try { return window.localStorage.getItem(STORAGE_KEY) ?? memoryValue; } catch { return memoryValue; } }
function safeSet(value: string): void { memoryValue = value; try { window.localStorage.setItem(STORAGE_KEY, value); } catch { /* memory fallback */ } }
function safeRemove(): void { memoryValue = null; try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* memory fallback */ } }

function script(): HTMLScriptElement { return document.currentScript instanceof HTMLScriptElement ? document.currentScript : document.querySelector('script[data-asopi-consent]') as HTMLScriptElement; }
function version(): string { return script()?.dataset.consentVersion || '1'; }
function measurementId(): string | null { const id = script()?.dataset.measurementId || ''; return MEASUREMENT_ID_RE.test(id) ? id : null; }
function linkerDomains(): string[] { const raw = script()?.dataset.linkerDomains || ''; return raw.split(',').map((item) => item.trim().toLowerCase()).filter((item) => LINKER_DOMAIN_RE.test(item)); }
function lang(): Lang { const forced = script()?.dataset.lang; if (forced === 'ja' || forced === 'en') return forced; const value = document.documentElement.lang || navigator.language || 'en'; return value.toLowerCase().startsWith('ja') ? 'ja' : 'en'; }
function policyUrl(): string | null { const s = script(); const localized = lang() === 'ja' ? s?.dataset.policyUrlJa : s?.dataset.policyUrlEn; const raw = localized || s?.dataset.policyUrl; if (!raw) return null; try { const url = new URL(raw, location.href); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; } }
function readStored(): StoredConsent | null { const raw = safeGet(); if (!raw) return null; try { const parsed = JSON.parse(raw) as Partial<StoredConsent>; if (parsed.version === version() && (parsed.choice === 'granted' || parsed.choice === 'denied') && typeof parsed.updatedAt === 'string') return parsed as StoredConsent; } catch { return null; } return null; }
function dispatch(choice: Exclude<ConsentChoice, 'unknown'>): void { window.dispatchEvent(new CustomEvent('asopi-consent-change', { detail: { choice, version: version() } })); }

function loadGa(): Promise<void> { const id = measurementId(); if (!id) return Promise.resolve(); if (configured) return Promise.resolve(); if (loadPromise) return loadPromise; const existing = document.querySelector(`script[data-asopi-ga4="${id}"]`); loadPromise = new Promise((resolve, reject) => { if (existing) { resolve(); return; } const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`; s.dataset.asopiGa4 = id; s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load GA4')); document.head.append(s); }); return loadPromise.then(() => { if (!configured) { window.gtag('js', new Date()); const domains = linkerDomains(); if (domains.length > 0) window.gtag('set', 'linker', { domains, accept_incoming: true }); window.gtag('config', id); configured = true; } }); }
function persist(choice: Exclude<ConsentChoice, 'unknown'>): void { currentChoice = choice; safeSet(JSON.stringify({ version: version(), choice, updatedAt: new Date().toISOString() })); window.gtag('consent', 'update', choice === 'granted' ? grantedPayload : deniedPayload); if (choice === 'denied') deleteGaCookies(); if (choice === 'granted') void loadGa(); dispatch(choice); removeBanner(); closeDialog(); }
function deleteGaCookies(): void { for (const item of document.cookie.split(';')) { const name = item.split('=')[0]?.trim(); if (name && /^(_ga(_.*)?|_gid|_gat|_gac_.*|_gcl_.*)$/.test(name)) { document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`; document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname}; SameSite=Lax`; } } }
function el<K extends keyof HTMLElementTagNameMap>(name: K, text?: string): HTMLElementTagNameMap[K] { const node = document.createElement(name); if (text) node.textContent = text; return node; }
function button(text: string, action: () => void, variant?: 'secondary' | 'ghost'): HTMLButtonElement { const b = el('button', text); if (variant) b.dataset.variant = variant; b.type = 'button'; b.addEventListener('click', action); return b; }
function removeBanner(): void { banner?.remove(); banner = null; }
function closeDialog(): void { if (dialog?.open) dialog.close(); dialog?.remove(); dialog = null; if (lastFocus instanceof HTMLElement) lastFocus.focus(); }
function showBanner(): void { if (banner) return; const t = STRINGS[lang()]; const section = el('section'); section.className = 'asopi-consent-banner'; section.role = 'region'; section.ariaLabel = t.region; section.append(el('h2', t.title)); const body = el('p', t.body); const url = policyUrl(); if (url) { body.append(' '); const link = el('a', t.policy); link.href = url; body.append(link); } section.append(body); const actions = el('div'); actions.className = 'asopi-consent-banner__actions'; actions.append(button(t.allow, () => persist('granted')), button(t.deny, () => persist('denied'), 'secondary')); section.append(actions); document.body.append(section); banner = section; }
function showSettings(): void { const t = STRINGS[lang()]; lastFocus = document.activeElement; dialog = el('dialog'); dialog.className = 'asopi-consent-dialog'; dialog.setAttribute('aria-modal', 'true'); dialog.append(el('h2', t.dialogTitle)); dialog.append(el('p', t.dialogBody)); const actions = el('div'); actions.className = 'asopi-consent-dialog__actions'; actions.append(button(t.allow, () => persist('granted')), button(t.deny, () => persist('denied'), 'secondary'), button(t.close, closeDialog, 'ghost')); dialog.append(actions); dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(); }); document.body.append(dialog); dialog.showModal(); (dialog.querySelector('button') as HTMLButtonElement | null)?.focus(); }
function debug(): void { if (script()?.dataset.debug === 'true') console.info('Asopi consent debug', { measurementId: measurementId(), ga4: document.querySelectorAll('script[src*="gtag/js"]').length, gtm: document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]').length }); }
function init(): void { window.dataLayer = window.dataLayer || []; window.gtag = gtag; window.gtag('consent', 'default', deniedPayload); const stored = readStored(); currentChoice = stored?.choice ?? 'unknown'; if (stored?.choice === 'granted') { window.gtag('consent', 'update', grantedPayload); void loadGa(); } if (!stored) showBanner(); debug(); }

const api: Api = { reset: () => { safeRemove(); currentChoice = 'unknown'; configured = false; loadPromise = null; window.gtag('consent', 'update', deniedPayload); deleteGaCookies(); closeDialog(); removeBanner(); showBanner(); }, showSettings, getState: () => currentChoice };
window.AsopiConsentBanner = api;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
export { api as AsopiConsentBanner };
