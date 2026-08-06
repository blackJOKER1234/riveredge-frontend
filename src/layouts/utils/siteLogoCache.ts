import { toRelativeIfLocalhost } from '../../utils/avatar';

/** LOGO 缓存 TTL：25 分钟（token 1 小时过期，提前刷新避免 403） */
export const SITE_LOGO_CACHE_TTL_MS = 25 * 60 * 1000;

export function getCachedSiteLogoUrl(logoUuid: string): string | undefined {
  try {
    const raw = localStorage.getItem(`siteLogoUrlCache_${logoUuid}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const { url, ts } = typeof parsed === 'object' ? parsed : { url: raw, ts: 0 };
    if (!url || typeof url !== 'string') return undefined;
    if (typeof ts === 'number' && Date.now() - ts > SITE_LOGO_CACHE_TTL_MS) return undefined;
    return toRelativeIfLocalhost(url);
  } catch {
    return undefined;
  }
}

export function setCachedSiteLogoUrl(logoUuid: string, url: string): void {
  try {
    localStorage.setItem(`siteLogoUrlCache_${logoUuid}`, JSON.stringify({ url, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function clearCachedSiteLogoUrl(logoUuid: string): void {
  try {
    localStorage.removeItem(`siteLogoUrlCache_${logoUuid}`);
  } catch {
    /* ignore */
  }
}
