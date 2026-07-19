export const deniedConsent={analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'} as const;
export const grantedAnalyticsConsent={analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'} as const;
export function initGtag():void{window.dataLayer=window.dataLayer||[]; window.gtag=window.gtag||function gtag(){window.dataLayer!.push(arguments)}; window.gtag('consent','default',deniedConsent)}
export function updateGranted():void{window.gtag?.('consent','update',grantedAnalyticsConsent)}
export function updateDenied():void{window.gtag?.('consent','update',deniedConsent)}
