# Asopi Tech consent-banner

Self-hosted consent banner for static Asopi Tech sites that use Google Analytics 4. It is not a CMP and does not guarantee legal compliance.

## Consent Mode

This library implements Basic Consent Mode: `dataLayer` and `gtag` are created first, the default consent command denies `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization`, and Google tags are loaded only after the user grants analytics consent. Advanced Consent Mode differs because Google tags may load before consent and send cookieless pings; this project intentionally does not do that. It never sends manual `page_view` events and does not set `send_page_view: false`; standard GA4 page view behavior is used after consent.

## Scope

Supported: static HTML documents where navigation reloads the entire page. Not supported: SPA routing, History API monitoring, virtual page views, GTM management, or manual page-view tracking.

## Install

Publish these files:

- `https://assets.asopi.tech/consent/v1/consent.js`
- `https://assets.asopi.tech/consent/v1/consent.css`

```html
<script
  data-asopi-consent
  data-measurement-id="G-XXXXXXXX"
  data-consent-version="1"
  data-policy-url="https://example.com/privacy"
  data-debug="false"
  src="https://assets.asopi.tech/consent/v1/consent.js"
  defer></script>
```

Attributes: `data-measurement-id` must match `^G-[A-Z0-9]+$`; `data-consent-version` forces redisplay when changed; `data-policy-url` accepts only `http:` and `https:`; `data-debug="true"` logs existing GA4/GTM candidates without modifying them; `data-linker-domains` (optional) is a comma-separated domain list for cross-domain measurement; `data-lang="ja|en"` (optional) forces the UI language.

## Language

The banner and dialog render in Japanese when the document language (`<html lang>`) starts with `ja`, and in English otherwise; `navigator.language` is the fallback when the attribute is missing, and `data-lang` overrides both. Button labels are 許可する / 拒否する / 設定 (Allow / Decline / Settings), and the policy link renders inline at the end of the body text.

## Cross-domain measurement

Set `data-linker-domains="asopi.tech,example.github.io"` to enable the gtag linker across sites that share the same measurement ID. After analytics consent is granted, the banner pushes `gtag('set', 'linker', { domains, accept_incoming: true })` before the `config` command, so outbound links to the listed domains are decorated with the `_gl` parameter and incoming decorated navigations are accepted. Invalid entries are dropped; the attribute has no effect before consent because Google tags are not loaded at all.

## Examples

Static HTML and GitHub Pages use the script tag above. In Astro, put the same tag in the shared layout head. The Pages workflow publishes `dist/` and writes `dist/CNAME` as `assets.asopi.tech`.

## API and events

`window.AsopiConsentBanner.reset()` clears saved consent and shows the banner. `window.AsopiConsentBanner.showSettings()` reopens settings. `window.AsopiConsentBanner.getState()` returns `unknown`, `granted`, or `denied`. A `CustomEvent` named `asopi-consent-change` is dispatched with `{ choice, version }` after decisions.

## Withdrawal and storage

Consent is stored per-site in localStorage and is not shared between sites. localStorage failures fall back to memory for the current page. Withdrawal from granted to denied updates Consent Mode to denied and performs best-effort deletion limited to `_ga`, `_ga_*`, `_gid`, `_gat`, `_gac_*`, and `_gcl_*` cookies on the current host/path; parent-domain guessing and Public Suffix List logic are intentionally not included.

## Verification

Use Tag Assistant, DevTools Network, and Application/Cookies. Before consent or after denial, confirm there are no `google-analytics.com` or `googletagmanager.com/gtag/js` requests and no GA cookies. After granting, confirm `analytics_storage` is `granted`, ad-related storage remains `denied`, `gtag.js` loads after the consent update, and the page view occurs once.

## CSP

Example: `script-src 'self' https://assets.asopi.tech https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com; img-src 'self' https://www.google-analytics.com; style-src 'self' https://assets.asopi.tech 'unsafe-inline';`.

## GitHub Pages deployment setup

Set up GitHub Pages from the repository settings first, then adapt the generated workflow. In GitHub, open **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**, select the generated **Static HTML** workflow rather than Jekyll, and then keep this repository's `pages` workflow as the customized version. The customization adds Node setup, linting, tests, Vite build, distribution verification, Playwright checks, and publishes the generated `dist/` artifact.

If GitHub Pages is disabled or the source is not set to GitHub Actions, `actions/configure-pages` can fail with `Get Pages site failed: Not Found` before artifact upload or deployment. This is a repository setting issue, not a build issue.

## Build, test, release

Run `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm run verify`, and `npx playwright test`. Versioned assets live under `consent/v1/`; breaking public API or behavior changes should use a new path such as `v2`.

## Existing GA4/GTM warning

Do not install another GA4 script or GTM container that loads GA4 before this banner. The debug option reports candidates but never removes or edits GTM.
