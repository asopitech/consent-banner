import { describe, expect, it } from 'vitest';
import { parsePolicyUrl, parseRevision, resolveLanguage } from '../src/config';

describe('config parsing', () => {
  const locationRef = new URL('https://example.com/page/') as unknown as Location;
  it('validates policy URLs', () => {
    expect(parsePolicyUrl('/privacy/', locationRef)).toBe('/privacy/');
    expect(parsePolicyUrl('https://asopi.tech/privacy', locationRef)).toBe('https://asopi.tech/privacy');
    expect(parsePolicyUrl('javascript:alert(1)', locationRef)).toBeNull();
    expect(parsePolicyUrl('data:text/html,x', locationRef)).toBeNull();
    expect(parsePolicyUrl('http://example.net/privacy', locationRef)).toBeNull();
  });
  it('resolves language and revision safely', () => {
    expect(resolveLanguage('ja')).toBe('ja');
    expect(resolveLanguage('en')).toBe('en');
    expect(parseRevision('2', false)).toBe(2);
    expect(parseRevision('bad', false)).toBe(1);
  });
});
