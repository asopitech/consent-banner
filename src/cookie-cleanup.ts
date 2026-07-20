export const GA_COOKIE_PATTERNS = [/^_ga/, '_gid', /^_gat/, /^_gac_/, /^_gcl_/] as const;

export function isGoogleAnalyticsCookie(name: string): boolean {
  return GA_COOKIE_PATTERNS.some((pattern) => typeof pattern === 'string' ? pattern === name : pattern.test(name));
}

export function clearGoogleAnalyticsCookies(): void {
  for (const item of document.cookie.split(';')) {
    const name = item.split('=')[0]?.trim();
    if (!name || !isGoogleAnalyticsCookie(name)) continue;
    try { document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`; } catch { /* best effort */ }
  }
}
