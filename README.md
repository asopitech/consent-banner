# Asopi Tech consent-banner

Asopi Tech consent-banner is a self-hosted GA4 consent helper for static sites. It uses `vanilla-cookieconsent` `3.1.0` for the banner UI, settings modal, category selection, consent storage, revision handling, and baseline accessibility behavior. It is not a custom CMP, is not a Google-certified CMP, and does not guarantee legal compliance.

## Consent model

The package implements a GA4-only Basic Consent Mode style flow. Before any Google script is loaded, it initializes `window.dataLayer`, defines `window.gtag`, and sends Consent Mode v2 default consent with `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` all set to `denied`. If the user accepts the `analytics` category, only `analytics_storage` is updated to `granted`; the three advertising-related fields always remain `denied`. If consent is unknown or denied, `gtag.js` is not loaded and no cookieless pings are intentionally sent.

The implementation relies on GA4's standard automatic page view after `gtag('config', measurementId)`. It does not send manual `page_view` events and does not set `send_page_view: false`.

## Scope

Supported sites are static pages where navigation reloads the full HTML document, including GitHub Pages, static HTML, Astro normal page transitions, Jekyll, Hugo, MkDocs, and static hosting. SPA routing, History API monitoring, virtual page views, client-side routers, Astro View Transitions, GTM management, Google Ads, Advanced Consent Mode, and router integration APIs are intentionally out of scope.

## Install

Publish the bundled files from `dist/`:

- `https://assets.asopi.tech/consent/v1/consent.js`
- `https://assets.asopi.tech/consent/v1/consent.css`
- `https://assets.asopi.tech/consent/v1/THIRD_PARTY_LICENSES.txt`

Use the same script-tag shape on consuming sites; no site-side CookieConsent configuration is required:

```html
<script
  src="https://assets.asopi.tech/consent/v1/consent.js"
  data-measurement-id="G-XXXXXXXXXX"
  data-policy-url="/privacy/"
  data-language="auto"
  data-consent-version="1"
  defer
></script>
```

## Data attributes

| Attribute | Description |
| --- | --- |
| `data-measurement-id` | Required for GA4 loading. Must match `^G-[A-Z0-9]+$`; invalid values keep the consent UI available but prevent GA4 loading. |
| `data-policy-url` | Optional. Allows same-origin relative URLs and `https:` URLs. Rejects `javascript:`, `data:`, invalid URLs, and HTTPS-page `http:` links. |
| `data-language` | `ja`, `en`, or `auto`. `auto` uses the browser language and defaults to English unless it starts with Japanese. |
| `data-consent-version` | Converted to CookieConsent `revision`. Invalid values fall back to `1` and only warn in debug mode. |
| `data-debug` | `true` enables debug logs for parsed Measurement ID and existing GA4/GTM script candidates. |

## CookieConsent categories

Only two categories are configured:

- `necessary`: enabled and read-only; used for required site behavior and consent storage.
- `analytics`: optional; controls GA4 loading.

Advertising, marketing, personalization, functionality, social, and preferences categories are not present.

## JavaScript API

The public API is exposed as `window.AsopiConsent`. No old-name alias is included because this script has not yet been installed on production Asopi Tech sites.

```ts
type ConsentState = "unknown" | "granted" | "denied";

window.AsopiConsent.getState(): ConsentState;
window.AsopiConsent.getDetails(): {
  state: ConsentState;
  version: string;
  updatedAt: string | null;
  analyticsLoaded: boolean;
};
window.AsopiConsent.grant(): Promise<void>;
window.AsopiConsent.deny(): void;
window.AsopiConsent.reset(): void;
window.AsopiConsent.openSettings(): void;
window.AsopiConsent.closeSettings(): void;
window.AsopiConsent.onChange(callback): () => void;
```

`openSettings()` and `closeSettings()` delegate to CookieConsent preferences modal APIs. `grant()` and `deny()` delegate category state changes to CookieConsent and then synchronize GA4 consent.

## CustomEvent

The library dispatches:

- `asopi-consent:ready`
- `asopi-consent:change`

Event `detail` contains `{ state, version, updatedAt, analyticsLoaded }`.

## Revision

`data-consent-version` is converted to CookieConsent `revision`. When the revision changes, CookieConsent requests consent again. Because this is the first production implementation, no old localStorage import path is included.

## Withdrawal and cookie deletion

Withdrawing analytics consent updates Consent Mode back to denied. CookieConsent `autoClear` removes `_ga*`, `_gid`, `_gat*`, and `_gac_*` candidates for the analytics category. Asopi Tech's best-effort helper additionally limits manual cleanup to GA-related cookies including `_gcl_*`. It does not implement Public Suffix List logic, parent-domain guessing, or cross-site consent sharing.

## Privacy policy and CSP

Update each site's privacy policy to describe GA4 usage and the consent mechanism. Suggested CSP baseline:

```text
script-src 'self' https://assets.asopi.tech https://www.googletagmanager.com;
style-src 'self' https://assets.asopi.tech;
connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com;
```

CookieConsent is bundled into `assets.asopi.tech` assets; no jsDelivr or other CDN domain is required for production. Confirm actual Google endpoints in the browser Network tab for each site.

## Verification

Use Tag Assistant and DevTools Network/Application. Before consent and after rejection, confirm no `googletagmanager.com/gtag/js`, no `google-analytics.com` requests, and no GA cookies. After granting, confirm the consent update precedes `gtag.js`, `analytics_storage` is `granted`, ad-related consent remains `denied`, and exactly one `config` command is issued.

## Development

```bash
npm ci
npm run lint
npm test
npm run build
npm run verify
npx playwright install --with-deps chromium
npx playwright test
```

The Pages workflow publishes `dist/` and sets `dist/CNAME` to `assets.asopi.tech`. Versioned public assets stay under `consent/v1/`; breaking public API or URL changes should be considered for `v2`.

## OSS license notice

`vanilla-cookieconsent` `3.1.0` is MIT licensed. The bundled third-party notice is generated at `dist/consent/v1/THIRD_PARTY_LICENSES.txt` during build.
