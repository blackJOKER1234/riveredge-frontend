import { useMemo } from 'react';
import { theme } from 'antd';
import { useThemeStore } from '../../stores/themeStore';
import { calculateColorBrightness } from '../utils/colorUtils';

export function useLayoutThemeTokens(token: any) {
  // 从 themeStore 订阅主题相关状态（单一数据源，无需事件监听）
  // 注意：必须分别订阅，避免选择器返回新对象导致无限重渲染
  const storeSiderBg = useThemeStore((s) => s.resolved.siderBgColor);
  const storeHeaderBg = useThemeStore((s) => s.resolved.headerBgColor);
  const isDarkMode = useThemeStore((s) => s.resolved.isDark);

  const siderBgColor = useMemo(() => {
    if (isDarkMode) return token.colorBgContainer;
    return storeSiderBg || token.colorBgContainer;
  }, [storeSiderBg, token.colorBgContainer, isDarkMode]);

  const headerBgColor = useMemo(() => {
    if (isDarkMode) return token.colorBgContainer;
    return storeHeaderBg || token.colorBgContainer;
  }, [storeHeaderBg, token.colorBgContainer, isDarkMode]);

  const headerTextColor = useMemo(() => {
    if (isDarkMode) {
      return 'var(--ant-colorText)';
    }

    const customBgColor = storeHeaderBg;

    if (customBgColor) {
      const brightness = calculateColorBrightness(customBgColor);
      return brightness < 128 ? '#ffffff' : 'var(--ant-colorText)';
    } else {
      return 'var(--ant-colorText)';
    }
  }, [storeHeaderBg, isDarkMode]);

  const isLightModeLightBg = useMemo(() => {
    return !isDarkMode && headerTextColor !== '#ffffff';
  }, [isDarkMode, headerTextColor]);

  const siderTextColor = useMemo(() => {
    if (isDarkMode) {
      return 'var(--ant-colorText)';
    }

    const customBgColor = storeSiderBg;

    if (customBgColor) {
      const brightness = calculateColorBrightness(customBgColor);
      return brightness < 128 ? '#ffffff' : 'var(--ant-colorText)';
    }
    return 'var(--ant-colorText)';
  }, [storeSiderBg, isDarkMode]);

  const isLightModeDarkSider = useMemo(
    () => !isDarkMode && siderTextColor === '#ffffff',
    [isDarkMode, siderTextColor],
  );

  const isDarkSiderFooter = useMemo(
    () => isDarkMode || siderTextColor === '#ffffff',
    [isDarkMode, siderTextColor],
  );

  const siderFooterToken = useMemo(
    () =>
      theme.getDesignToken({
        algorithm: isDarkSiderFooter ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: token.colorPrimary },
      }),
    [isDarkSiderFooter, token.colorPrimary],
  );

  const startMenuBaseRadius = useMemo(
    () => Math.max(4, Number(token.borderRadius ?? 6)),
    [token.borderRadius],
  );
  const startMenuPanelRadius = useMemo(
    () => Math.max(4, Number(token.borderRadiusLG ?? token.borderRadius ?? 8)),
    [token.borderRadiusLG, token.borderRadius],
  );

  const startMenuTheme = useMemo(() => {
    const primary = String(token.colorPrimary);
    if (isDarkSiderFooter) {
      return {
        settingsBtnBg: 'rgba(255, 255, 255, 0.08)',
        settingsBtnBgHover: 'rgba(255, 255, 255, 0.12)',
        settingsBtnBgActive: 'rgba(255, 255, 255, 0.16)',
        settingsBtnBorder: 'rgba(255, 255, 255, 0.14)',
        settingsBtnColor: '#ffffff',
        /** L1 托盘：唯一 backdrop-filter（与 L2 配色对调试验） */
        panelBg: `color-mix(in srgb, ${primary} 8%, rgba(255, 255, 255, 0.05))`,
        panelBgFallback: '#1f2128',
        panelBorder: `color-mix(in srgb, ${primary} 14%, rgba(255, 255, 255, 0.10))`,
        panelShadow: '0 16px 48px rgba(0, 0, 0, 0.48)',
        panelBlur: true,
        panelBlurAmount: '24px',
        panelBlurSaturate: '180%',
        panelHeaderBorder: 'rgba(255, 255, 255, 0.08)',
        panelTitleColor: 'rgba(255, 255, 255, 0.92)',
        panelCloseColor: 'rgba(255, 255, 255, 0.85)',
        panelCloseHoverBg: 'rgba(255, 255, 255, 0.1)',
        /** L2 分组 */
        panelGroupBg: 'rgba(22, 24, 30, 0.62)',
        panelGroupBorder: 'rgba(255, 255, 255, 0.14)',
        panelGroupInsetShadow: `inset 0 1px 0 color-mix(in srgb, ${primary} 6%, rgba(255, 255, 255, 0.08))`,
        panelGroupTitle: `color-mix(in srgb, ${primary} 28%, rgba(255, 255, 255, 0.78))`,
        /** L3 图标磁贴：最内层，hover 再提亮 */
        panelItemColor: 'rgba(255, 255, 255, 0.88)',
        panelItemBg: 'rgba(255, 255, 255, 0.04)',
        panelItemBorder: 'rgba(255, 255, 255, 0.08)',
        panelItemHoverBg: 'rgba(255, 255, 255, 0.11)',
        panelItemHoverBorder: 'rgba(255, 255, 255, 0.14)',
      };
    }
    return {
      settingsBtnBg: String(siderFooterToken.colorPrimaryBg),
      settingsBtnBgHover: String(siderFooterToken.colorPrimaryBgHover),
      settingsBtnBgActive: String(siderFooterToken.colorPrimaryBorder),
      settingsBtnBorder: String(siderFooterToken.colorPrimaryBorder),
      settingsBtnColor: primary,
      /** L1 托盘（与 L2 配色对调试验） */
      panelBg: `color-mix(in srgb, ${primary} 6%, rgba(255, 255, 255, 0.48))`,
      panelBgFallback: String(token.colorBgElevated),
      panelBorder: `color-mix(in srgb, ${primary} 12%, rgba(15, 23, 42, 0.08))`,
      panelShadow:
        `0 0 0 1px rgba(15, 23, 42, 0.06), 0 16px 48px rgba(15, 23, 42, 0.14), inset 0 1px 0 color-mix(in srgb, ${primary} 5%, rgba(255, 255, 255, 0.75))`,
      panelBlur: true,
      panelBlurAmount: '24px',
      panelBlurSaturate: '180%',
      panelHeaderBorder: 'rgba(0, 0, 0, 0.06)',
      panelTitleColor: String(token.colorText),
      panelCloseColor: String(token.colorTextSecondary),
      panelCloseHoverBg: 'rgba(0, 0, 0, 0.04)',
      /** L2 分组 */
      panelGroupBg: 'rgba(255, 255, 255, 0.58)',
      panelGroupBorder: 'rgba(15, 23, 42, 0.16)',
      panelGroupInsetShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.72)',
      panelGroupTitle: String(siderFooterToken.colorPrimaryText ?? token.colorTextSecondary),
      /** L3 图标磁贴 */
      panelItemColor: String(token.colorText),
      panelItemBg: 'rgba(255, 255, 255, 0.22)',
      panelItemBorder: 'rgba(255, 255, 255, 0.40)',
      panelItemHoverBg: 'rgba(255, 255, 255, 0.48)',
      panelItemHoverBorder: 'rgba(255, 255, 255, 0.62)',
    };
  }, [isDarkSiderFooter, token, siderFooterToken]);

  return {
    isDarkMode,
    storeSiderBg,
    storeHeaderBg,
    siderBgColor,
    headerBgColor,
    headerTextColor,
    isLightModeLightBg,
    siderTextColor,
    isLightModeDarkSider,
    isDarkSiderFooter,
    siderFooterToken,
    startMenuBaseRadius,
    startMenuPanelRadius,
    startMenuTheme,
  };
}
