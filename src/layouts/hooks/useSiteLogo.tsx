import React, { useEffect, useMemo, useState } from 'react';
import { useConfigStore } from '../../stores/configStore';
import {
  DEFAULT_SITE_LOGO_URL,
  SITE_LOGO_FALLBACK_SVG_URL,
  nextSiteLogoUrlAfterImageError,
} from '../../constants/siteAssets';
import { getSiteLogoPreview, isSiteLogoUuidKnownMissing } from '../../services/file';
import { toRelativeIfLocalhost } from '../../utils/avatar';
import { isUUID } from '../utils/colorUtils';
import {
  getCachedSiteLogoUrl,
  setCachedSiteLogoUrl,
  clearCachedSiteLogoUrl,
} from '../utils/siteLogoCache';

export function useSiteLogo() {
  const siteLogoValue =
    (useConfigStore((s) => (s.getConfig('site_logo', '') as string)?.trim()) || '') || '';

  const [siteLogoUrl, setSiteLogoUrl] = useState<string>(() => {
    const logoValue = (useConfigStore.getState().getConfig('site_logo', '') as string)?.trim() || '';

    if (logoValue) {
      if (isUUID(logoValue)) {
        if (isSiteLogoUuidKnownMissing(logoValue)) {
          return DEFAULT_SITE_LOGO_URL;
        }
        // 预览 URL 未就绪时先用极小 SVG，避免先拉 34KB 默认 PNG 再切换
        return SITE_LOGO_FALLBACK_SVG_URL;
      }
      return logoValue;
    }

    return DEFAULT_SITE_LOGO_URL;
  });

  // 处理LOGO URL（UUID 需通过 getFilePreview 获取，带 TTL 缓存并转为相对路径）
  useEffect(() => {
    const loadSiteLogo = async () => {
      try {
        if (!siteLogoValue) {
          setSiteLogoUrl(DEFAULT_SITE_LOGO_URL);
          return;
        }

        if (isUUID(siteLogoValue)) {
          if (isSiteLogoUuidKnownMissing(siteLogoValue)) {
            clearCachedSiteLogoUrl(siteLogoValue);
            setSiteLogoUrl(DEFAULT_SITE_LOGO_URL);
            return;
          }
          const previewInfo = await getSiteLogoPreview(siteLogoValue, { forAvatar: true });
          if (!previewInfo?.preview_url) {
            clearCachedSiteLogoUrl(siteLogoValue);
            setSiteLogoUrl(DEFAULT_SITE_LOGO_URL);
            return;
          }
          const newUrl = toRelativeIfLocalhost(previewInfo.preview_url);
          setSiteLogoUrl(newUrl);
          setCachedSiteLogoUrl(siteLogoValue, newUrl);
        } else {
          setSiteLogoUrl(siteLogoValue);
        }
      } catch {
        setSiteLogoUrl(DEFAULT_SITE_LOGO_URL);
      }
    };

    loadSiteLogo();
  }, [siteLogoValue]);

  // 传入 ReactNode，避免 ProLayout 对 string 固定渲染 alt="logo"；加载失败：自定义 → /img/logo.png → /favicon.svg → 内置 data URI
  const siteLogo = useMemo(
    () => (
      <img
        src={siteLogoUrl}
        alt=""
        width="auto"
        height={22}
        fetchPriority="high"
        decoding="async"
        onError={() => {
          setSiteLogoUrl((prev) => nextSiteLogoUrlAfterImageError(prev));
        }}
      />
    ),
    [siteLogoUrl],
  );

  return { siteLogo, siteLogoUrl, siteLogoValue };
}
