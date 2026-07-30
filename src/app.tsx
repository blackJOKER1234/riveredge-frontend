/**
 * RiverEdge SaaS 多组织框架 - 前端应用入口
 *
 * 使用现代化 React 生态技术栈：
 * - React 18.3.1 + TypeScript 5.6.3
 * - React Router DOM 6.26.2 (路由管理)
 * - Ant Design 6.1.0 + Pro Components 2.8.2 (UI组件)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { GLOBAL_SPIN_INDICATOR } from './initSpinIndicator';
import { buildResponsiveThemeConfig } from './config/themeTokens';
import { syncLanguageFromPreferences } from './config/i18n';
import { useAppShellReady } from './hooks/useAppShellReady';
import { useUserPreferenceStore } from './stores/userPreferenceStore';
import { useThemeStore } from './stores/themeStore';
import { useTouchScreen } from './hooks/useTouchScreen';
import { getUserInfo } from './utils/auth';
import { prefetchAvatarUrl } from './utils/avatar';
import { ANT_LOCALE_MAP } from './constants/antd-locale';
import { AppShellLoading, AppContent } from './components/app-shell';
import { buildComponentTokens } from './theme/components-token';

// ⚠️ 关键修复：将 Ant Design App 组件的 message 实例注入到全局，供工具函数使用
// 这样可以避免 Ant Design 6.0 的警告："Static function can not consume context like dynamic theme"
// 注意：这个实例会在 AppContent 组件渲染后通过 useApp() hook 设置
if (typeof window !== 'undefined') {
  (window as any).__ANTD_MESSAGE__ = null;
}

export default function App() {
  const { i18n } = useTranslation();
  const touchScreen = useTouchScreen();

  // 移除 index.html 静态首屏占位（旧 #app-loading / data-app-first-paint），避免与内层 Spin 叠显或长期不卸
  useEffect(() => {
    document.getElementById('app-loading')?.remove();
    document.querySelector('[data-app-first-paint]')?.remove();
  }, []);

  const appShellReady = useAppShellReady();
  const subscribeToSystemTheme = useThemeStore((s) => s.subscribeToSystemTheme);
  const themeMode = useThemeStore((s) => s.theme);

  // 壳层就绪后预取头像 URL，缩短顶栏头像显示延迟
  useEffect(() => {
    if (!appShellReady) return;
    const userInfo = getUserInfo();
    const avatarUuid = (userInfo as any)?.avatar;
    if (avatarUuid) prefetchAvatarUrl(avatarUuid);
  }, [appShellReady]);

  // 当 language 偏好变化时同步 i18n（与 theme 订阅策略一致）
  useEffect(() => {
    const languageSig = (prefs: Record<string, unknown> | undefined) =>
      typeof prefs?.language === 'string' ? prefs.language : '';
    let lastSig = languageSig(useUserPreferenceStore.getState().preferences as Record<string, unknown>);
    const unsub = useUserPreferenceStore.subscribe((state) => {
      const prefs = state.preferences;
      if (!prefs || typeof prefs !== 'object' || Object.keys(prefs).length === 0) return;
      const next = languageSig(prefs as Record<string, unknown>);
      if (next === lastSig) return;
      lastSig = next;
      syncLanguageFromPreferences(prefs as Record<string, unknown>).catch((err) => {
        console.warn('Failed to sync language from preferences:', err);
      });
    });
    return unsub;
  }, []);

  // 当「主题相关」偏好变化时同步 themeStore。勿在 ui.tables 等变更时触发：UniTable 列持久化会频繁 updatePreferences，
  // 若此处每次都 syncFromPreferences（内部会请求 site-settings），会与 user-preferences 交替形成请求风暴。
  useEffect(() => {
    const themeSig = (prefs: Record<string, unknown> | undefined) =>
      JSON.stringify({
        theme: prefs?.theme,
        theme_config: prefs?.theme_config,
      });
    let lastSig = themeSig(useUserPreferenceStore.getState().preferences as Record<string, unknown>);
    const unsub = useUserPreferenceStore.subscribe((state) => {
      const prefs = state.preferences;
      if (!prefs || typeof prefs !== 'object' || Object.keys(prefs).length === 0) return;
      const next = themeSig(prefs as Record<string, unknown>);
      if (next === lastSig) return;
      lastSig = next;
      useThemeStore.getState().syncFromPreferences(prefs);
    });
    return unsub;
  }, []);

  // 监听系统主题变化（当 theme=auto 时）
  useEffect(() => {
    return subscribeToSystemTheme();
  }, [themeMode, subscribeToSystemTheme]);

  const resolved = useThemeStore((s) => s.resolved);
  const finalThemeConfig = React.useMemo(() => {
    const plainSemanticTokens =
      resolved.themeStyle === 'plain'
        ? {
            // 简约模式保留基础语义色，避免徽章/状态提示全部灰化后不可辨识
            colorSuccess: '#52c41a',
            colorWarning: '#faad14',
            colorError: '#ff4d4f',
            colorInfo: resolved.token.colorPrimary ?? '#1677ff',
          }
        : {};
    return {
      algorithm: resolved.algorithm,
      token: { ...resolved.token, ...plainSemanticTokens },
    };
  }, [resolved.algorithm, resolved.isDark, resolved.themeStyle, resolved.token]);

  // 响应式布局优化：针对小屏设备（平板/手机）自动缩小组件尺寸和边距
  const [screenSize, setScreenSize] = React.useState({
    isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
    isTablet: typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const responsiveThemeConfig = React.useMemo(
    () =>
      buildResponsiveThemeConfig({
        algorithm: finalThemeConfig.algorithm,
        token: finalThemeConfig.token,
        isSmall: screenSize.isMobile || screenSize.isTablet,
        isEnglishLocale: i18n.language?.startsWith('en') ?? false,
      }),
    [finalThemeConfig, screenSize, i18n.language],
  );

  const componentTokens = React.useMemo(
    () => buildComponentTokens({
      colorPrimary: resolved.token.colorPrimary ?? '#0958D9',
      isDark: resolved.isDark,
    }),
    [resolved.isDark, resolved.token.colorPrimary],
  );

  // 合并响应式组件 token（来自 themeTokens.ts）和组件级覆盖 token（来自 components-token.ts）
  const mergedThemeConfig = React.useMemo(() => {
    const respComponents = responsiveThemeConfig.components ?? {};
    const allKeys = new Set([...Object.keys(respComponents), ...Object.keys(componentTokens)]);
    const merged: Record<string, object> = {};
    for (const key of allKeys) {
      merged[key] = { ...(respComponents as any)[key], ...(componentTokens as any)[key] };
    }
    return {
      ...responsiveThemeConfig,
      components: merged,
    };
  }, [responsiveThemeConfig, componentTokens]);

  const antLocale = React.useMemo(
    () => ANT_LOCALE_MAP[i18n.language] || ANT_LOCALE_MAP[i18n.language?.split('-')[0]] || zhCN,
    [i18n.language]
  );

  // 触屏模式下，即使是手机也建议使用 middle 尺寸，配合 CSS 优化确保触控精准
  // 仅在非触屏模式的小屏（如 PC 缩放窗口）才使用 small 以获得最大内容密度
  const componentSize = touchScreen.isTouchScreenMode ? 'middle' : (screenSize.isMobile ? 'small' : 'middle');

  return (
    
    <ConfigProvider
      theme={mergedThemeConfig}
      locale={antLocale}
      componentSize={componentSize}
      spin={{ indicator: GLOBAL_SPIN_INDICATOR }}
    >
      <AntdApp>
        {appShellReady ? (
          <AppContent touchScreen={touchScreen} />
        ) : (
          <AppShellLoading isDark={resolved.isDark} />
        )}
      </AntdApp>
    </ConfigProvider>
  );
}
