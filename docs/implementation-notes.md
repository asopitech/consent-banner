# Implementation notes

This repository is still implementing the first Asopi Tech consent banner deployment. There is no production self-built banner to carry forward, so the code intentionally avoids old storage import logic, old event aliases, and old API aliases.

## Scope

- Consuming sites use the bundled `consent/v1/consent.js` script directly.
- The only public API is `window.AsopiConsent`.
- The public events are `asopi-consent:ready` and `asopi-consent:change`.
- CookieConsent owns UI, settings, category state, consent storage, revision handling, and basic accessibility behavior.
- Asopi Tech code owns script attribute parsing, Consent Mode v2, Basic Consent Mode GA4 gating, GA4 loading, duplicate prevention, debug logs, and GA cookie cleanup helpers.
