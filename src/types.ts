export type ConsentState = 'unknown' | 'granted' | 'denied';
export type ConsentStatus = 'denied' | 'granted';
export type ConsentPayload = {
  analytics_storage: ConsentStatus;
  ad_storage: 'denied';
  ad_user_data: 'denied';
  ad_personalization: 'denied';
};
export type GtagCommand = ['consent', 'default' | 'update', ConsentPayload] | ['js', Date] | ['config', string];
export type Gtag = (...args: GtagCommand) => void;
export type Language = 'ja' | 'en';
export type ConsentDetails = { state: ConsentState; version: string; updatedAt: string | null; analyticsLoaded: boolean };
export interface AsopiConsentApi {
  getState(): ConsentState;
  getDetails(): ConsentDetails;
  grant(): Promise<void>;
  deny(): void;
  reset(): void;
  openSettings(): void;
  closeSettings(): void;
  onChange(callback: (details: ConsentDetails) => void): () => void;
}
declare global {
  interface Window { dataLayer: GtagCommand[]; gtag: Gtag; AsopiConsent: AsopiConsentApi; }
}
