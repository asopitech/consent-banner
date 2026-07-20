import { MEASUREMENT_ID_RE } from './config';

export interface AnalyticsLoader { load(measurementId: string): Promise<void>; isLoaded(): boolean; isLoading(): boolean; }

class Ga4AnalyticsLoader implements AnalyticsLoader {
  private loadedId: string | null = null;
  private loadingId: string | null = null;
  private promise: Promise<void> | null = null;

  load(measurementId: string): Promise<void> {
    if (!MEASUREMENT_ID_RE.test(measurementId)) return Promise.resolve();
    if (this.loadedId === measurementId) return Promise.resolve();
    if (this.promise && this.loadingId === measurementId) return this.promise;
    const existing = document.querySelector(`script[data-asopi-ga4="${measurementId}"]`);
    this.loadingId = measurementId;
    this.promise = new Promise<void>((resolve, reject) => {
      if (existing) { resolve(); return; }
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      script.dataset.asopiGa4 = measurementId;
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('Failed to load GA4')), { once: true });
      document.head.append(script);
    }).then(() => {
      if (this.loadedId !== measurementId) {
        window.gtag('js', new Date());
        window.gtag('config', measurementId);
        this.loadedId = measurementId;
      }
    }).finally(() => {
      this.loadingId = null;
      this.promise = null;
    });
    return this.promise;
  }

  isLoaded(): boolean { return this.loadedId !== null; }
  isLoading(): boolean { return this.promise !== null; }
}

export const analyticsLoader = new Ga4AnalyticsLoader();
