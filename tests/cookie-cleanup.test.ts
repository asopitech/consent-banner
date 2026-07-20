import { describe, expect, it } from 'vitest';
import { isGoogleAnalyticsCookie } from '../src/cookie-cleanup';

describe('cookie cleanup', () => {
  it('limits deletion candidates to GA cookies', () => {
    expect(isGoogleAnalyticsCookie('_ga')).toBe(true);
    expect(isGoogleAnalyticsCookie('_ga_ABC')).toBe(true);
    expect(isGoogleAnalyticsCookie('_gid')).toBe(true);
    expect(isGoogleAnalyticsCookie('_gat')).toBe(true);
    expect(isGoogleAnalyticsCookie('_gac_X')).toBe(true);
    expect(isGoogleAnalyticsCookie('_gcl_aw')).toBe(true);
    expect(isGoogleAnalyticsCookie('session')).toBe(false);
  });
});
