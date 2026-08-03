/**:
 * RiverEdge SaaS 多组织框架 - 基础布局组件
 * 
 * 使用 ProLayout 实现现代化页面布局，集成状态管理和权限控制
 */

import { ProLayout } from '@ant-design/pro-components';
import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { theme, message, Grid } from 'antd';
import type { MenuProps } from 'antd';
import type { MenuDataItem } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addCollection } from '@iconify/react/dist/offline';
import fluentColorIcons from '@iconify-json/fluent-color/icons.json';

addCollection(fluentColorIcons);

import { getToken, getTenantId } from '../utils/auth';
import { useGlobalStore } from '../stores';
import { getLanguageList, Language } from '../services/language';
import { LANGUAGE_MAP, applyLanguageWithPersist } from '../config/i18n';
import i18n from '../config/i18n';
import {
  MenuTree,
  getEffectiveHome,
  getTenantBackendHome,
  EFFECTIVE_HOME_QUERY_KEY,
  TENANT_BACKEND_HOME_QUERY_KEY,
} from '../services/menu';
import { useUnifiedMenuData } from '../hooks/useUnifiedMenuData';
import { clearSessionScopedQueries } from '../utils/clearSessionQueries';
import { getInstalledApplicationList } from '../services/application';
import { getChatIntegrationStatus } from '../apps/kuaiai/services/chat';
import { buildChatIntegrationStatusQueryKey } from '../hooks/useChatIntegrationStatus';
import { hasPermission, resolveUserForMenuPermission } from '../utils/permission';
import { useSafeTranslation } from './utils/safeTranslation';
import { getMenuConfig } from './config/menuConfig';
import { LayoutStyles } from './components/LayoutStyles';
import { SidebarSearchExtra } from './components/SidebarSearchExtra';
import { LayoutHeaderContent } from './components/LayoutHeaderContent';
import { LayoutHeaderActions } from './components/LayoutHeaderActions';
import {
  renderMenuData,
  handleMenuClickPreventFullReload,
  renderSubMenuItem,
  renderMenuItem,
} from './components/menuRenders';
import { LayoutOverlays } from './components/LayoutOverlays';
import { LayoutPageBody } from './components/LayoutPageBody';
import { SidebarFooter } from './components/SidebarFooter';
import { getUserMenuItems } from './config/userMenu';
import { convertMenuTreeToMenuDataItem as convertMenuTreeToMenuDataItemUtil } from './utils/convertMenuTree';
import { buildLayoutBreadcrumb, calculateSelectedKeys } from './utils/layoutBreadcrumb';
import { useLayoutThemeTokens } from './hooks/useLayoutThemeTokens';
import { useSiteLogo } from './hooks/useSiteLogo';
import { useUserAvatar } from './hooks/useUserAvatar';
import { useHeaderMessages } from './hooks/useHeaderMessages';
import { useSystemSettingsPanelController } from './hooks/useSystemSettingsPanelController';
import { useLayoutKeyboardShortcuts } from './hooks/useLayoutKeyboardShortcuts';
import { useLayoutDomChromeEffects } from './hooks/useLayoutDomChromeEffects';
import { useDocumentTitleSync } from './hooks/useDocumentTitleSync';
import { useMenuInvalidationOnAuthChange } from './hooks/useMenuInvalidationOnAuthChange';
import { useUserPreferenceStore } from '../stores/userPreferenceStore';
import { useConfigStore, resolveEffectiveHomePath } from '../stores/configStore';
import { getMenuBadgeCounts } from '../services/dashboard';
import { verifyCopyright } from '../utils/copyrightIntegrity';
import { useTouchScreen } from '../hooks/useTouchScreen';

/**
 * 基础布局组件
 */
export default function BasicLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken(); // 获取主题 token
  const { i18n: i18nInstance, t } = useSafeTranslation(); // 获取 i18n 实例和翻译函数（安全的）
  
  // 精确订阅：只读取 BasicLayout 需要的 sidebar_collapsed 字段
  // 避免订阅整个 preferences 对象，防止无关偏好更新导致整个布局重渲染
  const sidebarCollapsedPref = useUserPreferenceStore((s) => {
    const prefs = s.preferences;
    if (prefs?.ui?.sidebar_collapsed !== undefined) return prefs.ui.sidebar_collapsed;
    if (prefs?.['ui.sidebar_collapsed'] !== undefined) return prefs['ui.sidebar_collapsed'];
    return undefined;
  });
  const updatePreferences = useUserPreferenceStore((s) => s.updatePreferences);

  // 侧边栏折叠状态
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (sidebarCollapsedPref !== undefined) {
      setCollapsed(Boolean(sidebarCollapsedPref));
    }
  }, [sidebarCollapsedPref]);

  // 处理侧边栏折叠切换
  const handleSetCollapsed = (payload: boolean) => {
    setCollapsed(payload);
    // 更新用户偏好
    updatePreferences({ 'ui.sidebar_collapsed': payload });
  };

  const screens = Grid.useBreakpoint?.() ?? {};
  const touchScreen = useTouchScreen();
  
  // 决定是否使用移动端/平板布局
  // 如果开启了触屏模式且是竖屏，强制使用移动端布局
  // 否则，根据分辨率判断（lg = 992px）
  const isMobileOrTablet = touchScreen.isTouchScreenMode 
    ? touchScreen.isPortrait 
    : (screens.lg === false);

  // 工作区最大化模式 (由 UniTab 控制)
  const [isFullscreen, setIsFullscreen] = useState(false);
  // 浏览器全屏模式 (由顶栏控制)
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [techStackModalOpen, setTechStackModalOpen] = useState(false);
  const [themeEditorOpen, setThemeEditorOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [breadcrumbVisible, setBreadcrumbVisible] = useState(true);
  const breadcrumbRef = useRef<HTMLDivElement>(null);

  const currentUser = useGlobalStore((s) => s.currentUser);
  const logout = useGlobalStore((s) => s.logout);
  const isLocked = useGlobalStore((s) => s.isLocked);
  const lockScreen = useGlobalStore((s) => s.lockScreen);
  const { avatarUrl, avatarImageFailed, setAvatarImageFailed, headerTextAvatar } = useUserAvatar(currentUser, t);

  // 获取可用语言列表
  const { data: languageListData } = useQuery({
    queryKey: ['availableLanguages'],
    queryFn: () => getLanguageList({ is_active: true }),
    staleTime: 5 * 60 * 1000, // 5 分钟缓存
  });

  // 组织初始化提醒已移至上线助手中，不再全局展示


  const queryClient = useQueryClient();

  /** 登出前清理租户相关 Query 缓存，避免重新登录后仍显示旧侧边栏菜单（applicationMenus staleTime 内不 refetch） */
  const performLogout = useCallback(() => {
    clearSessionScopedQueries(queryClient);
    logout();
    // SPA 内部跳转：dev 下 /login 会映射到 login.html MPA，LoginPage 依赖 QueryClientProvider，全页跳转易白屏
    navigate('/login', { replace: true });
  }, [queryClient, logout, navigate]);

  // 站点设置：统一从 configStore 获取（app.tsx 初始化时已 fetchConfigs，site-settings 保存时会 refresh）
  const siteName = (useConfigStore((s) => (s.getConfig('site_name', '') as string)?.trim()) || '') || 'RiverEdge SaaS';
  const launchWizardEnabled = useConfigStore((s) => s.configs.enable_launch_wizard !== false);
  const configs = useConfigStore((s) => s.configs);

  const tenantIdStrForHome = getTenantId()?.toString() ?? null;
  const { data: tenantBackendHome } = useQuery({
    queryKey: [...TENANT_BACKEND_HOME_QUERY_KEY, tenantIdStrForHome],
    queryFn: getTenantBackendHome,
    enabled: !!(getToken() && tenantIdStrForHome && currentUser),
    staleTime: 60 * 1000,
  });

  const { data: effectiveHome } = useQuery({
    queryKey: [...EFFECTIVE_HOME_QUERY_KEY, tenantIdStrForHome],
    queryFn: getEffectiveHome,
    enabled: !!(getToken() && tenantIdStrForHome && currentUser),
    staleTime: 60 * 1000,
  });

  const effectiveSystemHomePath = useMemo(
    () => resolveEffectiveHomePath(effectiveHome, tenantBackendHome?.path, configs),
    [effectiveHome, tenantBackendHome?.path, configs],
  );

  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const {
    messageDropdownOpen,
    setMessageDropdownOpen,
    refetchMessageStats,
    recentMessages,
    recentMessagesLoading,
    refetchRecentMessages,
    unreadCount,
  } = useHeaderMessages(currentUser);



  const { siteLogo } = useSiteLogo();

  // 站点设置更新由 site-settings 等页面保存时直接 invalidateQueries，不再依赖 siteThemeUpdated

  const convertMenuTreeToMenuDataItem = React.useCallback(
    (menu: MenuTree, isAppMenu: boolean = false, depth: number = 0) =>
      convertMenuTreeToMenuDataItemUtil(menu, t, isAppMenu, depth),
    [t],
  );

  // 稳定引用：避免每次渲染创建新函数导致 useUnifiedMenuData 重复计算
  const getSystemMenuConfig = React.useCallback(() => getMenuConfig(t), [t]);

  const {
    sidebarMenuData: filteredMenuData,
    breadcrumbMenuData,
    isLoading: appMenusLoading,
  } = useUnifiedMenuData({
    getSystemMenuConfig,
    convertMenuTreeToMenuDataItem,
    t,
    collapsed,
  });

  // APP 菜单来自 navigation-tree（异步），系统菜单为同步硬编码即时渲染。
  // 首次加载（缓存未命中）时在 APP 菜单将出现的位置展示骨架占位，避免「系统菜单先出、
  // APP 菜单稍后无征兆弹出」的突兀感。命中缓存时 isLoading 为 false，不显示骨架。
  const showAppMenuSkeleton = useMemo(() => {
    if (!appMenusLoading) return false;
    const hasAppMenu = filteredMenuData.some(
      (item) =>
        (typeof item.className === 'string' && item.className.includes('app-menu-item')) ||
        item.path?.startsWith('/apps/'),
    );
    return !hasAppMenu;
  }, [appMenusLoading, filteredMenuData]);

  const appMenuSkeletonItems = useMemo<MenuDataItem[]>(() => {
    if (!showAppMenuSkeleton) return [];
    return Array.from({ length: 4 }, (_, i) => ({
      key: `__app-menu-skeleton-${i}`,
      name: '',
      isAppMenuSkeleton: true,
      className: 'app-menu-skeleton-item',
    }) as MenuDataItem);
  }, [showAppMenuSkeleton]);

  const {
    systemSettingsPanelMounted,
    systemSettingsPanelExiting,
    systemSettingsPanelRef,
    systemSettingsTriggerRef,
    closeSystemSettingsPanelAnimated,
    openSystemSettingsPanel,
    handleSystemSettingsPanelAnimationEnd,
    systemSettingsGroups,
    systemSettingsPanelGridColumns,
    systemSettingsPlanLabel,
    systemSettingsExpiresLabel,
    showSystemSettingsTenantMeta,
    systemSettingsPanelWidth,
    handleSystemSettingsNavigate,
    getSystemPanelIcon,
  } = useSystemSettingsPanelController({
    filteredMenuData,
    currentUser,
    navigate,
    pathname: location.pathname,
    t,
  });

  const { data: installedApps } = useQuery({
    queryKey: ['installedApplications', { is_active: true }],
    queryFn: () => getInstalledApplicationList({ is_active: true }),
    staleTime: 60_000,
  });

  const hasAiAssistantEntry = useMemo(() => {
    const kuaiaiApp = (installedApps ?? []).find((app) => app.code === 'kuaiai');
    if (!kuaiaiApp) return false;
    if (kuaiaiApp.is_pro && kuaiaiApp.can_access === false) return false;
    const user = resolveUserForMenuPermission(currentUser);
    if (!user) return false;
    if (user.is_tenant_admin || user.is_infra_admin) return true;
    return hasPermission(user, 'kuaiai:entry:read');
  }, [installedApps, currentUser]);

  const aiAssistantMountedRef = useRef(false);
  if (hasAiAssistantEntry) {
    aiAssistantMountedRef.current = true;
  }

  useEffect(() => {
    if (!hasAiAssistantEntry || currentUser?.tenant_id == null) return;
    void queryClient.prefetchQuery({
      queryKey: buildChatIntegrationStatusQueryKey(currentUser.tenant_id),
      queryFn: getChatIntegrationStatus,
      staleTime: 5 * 60 * 1000,
    });
  }, [hasAiAssistantEntry, currentUser?.tenant_id, queryClient]);

  const { data: menuBadgeCounts = {} } = useQuery({
    queryKey: ['menuBadgeCounts'],
    queryFn: getMenuBadgeCounts,
    enabled: !!currentUser?.id,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  useMenuInvalidationOnAuthChange({
    currentUserId: currentUser?.id,
    currentTenantId: currentUser?.tenant_id,
    queryClient,
  });

  // 当前语言代码
  const currentLanguage = i18nInstance.language || 'zh-CN';
  const isEnglishLocale = currentLanguage.startsWith('en');

  /**
   * 计算颜色的亮度值
   * @param color - 颜色值（十六进制或 rgb/rgba 格式）
   * @returns 亮度值（0-255）
   */

  const {
    isDarkMode,
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
  } = useLayoutThemeTokens(token);

  useLayoutDomChromeEffects({
    breadcrumbRef,
    pathname: location.pathname,
    setBreadcrumbVisible,
    currentUserId: currentUser?.id,
    currentTenantId: currentUser?.tenant_id,
    isDarkMode,
    isLightModeLightBg,
  });


  /**
   * 检查锁屏状态，如果已锁定则重定向到锁屏页
   */
  useEffect(() => {
    if (isLocked && location.pathname !== '/lock-screen') {
      navigate('/lock-screen', { replace: true });
    }
  }, [isLocked, location.pathname, navigate]);

  /**
   * 处理搜索
   */


  useLayoutKeyboardShortcuts({
    hasAiAssistantEntry,
    setAiAssistantOpen,
    setShortcutHelpOpen,
  });

  const { customPageLabel } = useDocumentTitleSync({
    pathname: location.pathname,
    search: location.search,
    breadcrumbMenuData,
    t,
    siteName,
    currentUser,
  });

  // 处理用户菜单点击
  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        // 导航到个人资料页面
        navigate('/personal/profile');
        break;
      case 'copyright':
        verifyCopyright();
        setTechStackModalOpen(true);
        break;
      case 'clear-menu-cache':
        queryClient.invalidateQueries({ queryKey: ['navigationMenuTree'] });
        queryClient.invalidateQueries({ queryKey: ['applicationMenus'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-menu-tree'] });
        message.success(t('ui.clearCacheSuccess'));
        break;
      case 'lock-screen':
        handleLockScreen();
        break;
      case 'logout':
        performLogout();
        break;
    }
  };

  const generateBreadcrumb = useMemo(
    () =>
      buildLayoutBreadcrumb({
        pathname: location.pathname,
        search: location.search,
        breadcrumbMenuData,
        navigate,
        t,
        customPageLabel,
      }),
    [location.pathname, location.search, breadcrumbMenuData, navigate, t, customPageLabel],
  );

  const selectedKeys = useMemo(
    () => calculateSelectedKeys(filteredMenuData, location.pathname),
    [filteredMenuData, location.pathname],
  );


  /**
   * 处理全屏切换 (浏览器级别，顶栏触发)
   */
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);


  /**
   * 处理语言切换
   * 
   * @param languageCode - 语言代码（如 'zh-CN', 'en-US'）
   */
  const handleLanguageChange = React.useCallback(async (languageCode: string) => {
    try {
      await applyLanguageWithPersist(languageCode);
      message.success(t('common.switchLanguageSuccess', { language: LANGUAGE_MAP[languageCode] || languageCode }));
    } catch (error: any) {
      console.error(t('common.switchLanguageFailed'), error);
      message.error(error?.message || t('common.switchLanguageFailed'));
    }
  }, [t]);

  /**
   * 构建语言切换下拉菜单
   */
  const languageMenuItems: MenuProps['items'] = React.useMemo(() => {
    // 从后端获取的语言列表
    const backendLanguages = languageListData?.items || [];

    // 如果后端有语言列表，优先使用后端的
    if (backendLanguages.length > 0) {
      return backendLanguages
        .filter((lang: Language) => lang.is_active)
        .map((lang: Language) => ({
          key: lang.code,
          label: lang.native_name || lang.name || LANGUAGE_MAP[lang.code] || lang.code,
          onClick: () => handleLanguageChange(lang.code),
        }));
    }

    // 如果没有后端语言列表，使用默认的语言映射
    return Object.entries(LANGUAGE_MAP).map(([code, name]) => ({
      key: code,
      label: name,
      onClick: () => handleLanguageChange(code),
    }));
  }, [languageListData, handleLanguageChange]);

  /**
   * 处理主题颜色切换
   */
  const handleThemeChange = () => {
    setThemeEditorOpen(true);
  };

  /**
   * 处理锁定屏幕
   */
  const handleLockScreen = () => {
    // 保存当前路径
    lockScreen(location.pathname);
    // 导航到锁屏页
    navigate('/lock-screen', { replace: true });
  };

  /**
   * 全屏状态管理
   * 
   * 验证方案3：同时使用 collapsed + siderWidth + menuRender
   * - 全屏时：collapsed={true} + siderWidth={0} + menuRender={() => null}
   *   - collapsed={true}：收起侧边栏
   *   - siderWidth={0}：设置侧边栏宽度为0
   *   - menuRender={() => null}：不渲染菜单，确保折叠的侧边栏也不占据空间
   * - 退出全屏时：恢复所有 props
   * 
   * 关键问题：即使 collapsed={true}，折叠的侧边栏仍然占据空间（通常 48-80px）
   * 解决方案：使用 menuRender={() => null} 完全不渲染菜单，配合 CSS 确保侧边栏不占据空间
   * 
   * 同时保留 CSS 作为辅助，确保顶部导航栏也被隐藏
   */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const fullscreenClass = 'riveredge-fullscreen-mode';

    if (isFullscreen) {
      // 进入全屏：
      // 1. 添加 CSS class（用于隐藏顶部导航栏）
      html.classList.add(fullscreenClass);
      body.classList.add(fullscreenClass);
      // 2. 收起侧边栏（通过 ProLayout 的 collapsed prop）
      // 注意：这里不直接设置 collapsed，而是通过 CSS 和 siderWidth 控制
    } else {
      // 退出全屏：移除 class 并恢复布局
      html.classList.remove(fullscreenClass);
      body.classList.remove(fullscreenClass);

      // 退出全屏时，需要确保 ProLayout 重新计算布局
      // 使用多重延迟确保 DOM 更新、样式应用和 props 变化都完成
      // 注意：移除 class 后，所有全屏 CSS 样式会自动失效
      // 但 ProLayout 需要时间重新计算布局，所以需要多次触发 resize
      const timer1 = requestAnimationFrame(() => {
        // 第一次：触发 resize 事件，让 ProLayout 开始重新计算布局
        window.dispatchEvent(new Event('resize'));

        const timer2 = requestAnimationFrame(() => {
          // 第二次：再次触发 resize，确保布局计算完成
          window.dispatchEvent(new Event('resize'));

          const timer3 = setTimeout(() => {
            // 第三次：延迟触发，确保所有状态都已恢复
            window.dispatchEvent(new Event('resize'));
            // 额外触发一次，确保 ProLayout 完全重新计算
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 50);
          }, 150);

          return () => {
            if (timer3) clearTimeout(timer3);
          };
        });

        return () => {
          if (timer2) cancelAnimationFrame(timer2);
        };
      });

      return () => {
        if (timer1) cancelAnimationFrame(timer1);
      };
    }

    // 组件卸载时清理
    return () => {
      html.classList.remove(fullscreenClass);
      body.classList.remove(fullscreenClass);
    };
  }, [isFullscreen]);

  /**
   * 切换全屏状态
   */
  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <>
      {/* 动态设置全局背景色，确保浅色和深色模式下都正确应用 */}
      <LayoutStyles
        token={token}
        isDarkMode={isDarkMode}
        isLightModeLightBg={isLightModeLightBg}
        isLightModeDarkSider={isLightModeDarkSider}
        isDarkSiderFooter={isDarkSiderFooter}
        siderTextColor={siderTextColor}
        headerTextColor={headerTextColor}
        headerBgColor={headerBgColor}
        siderBgColor={siderBgColor}
        siderFooterToken={siderFooterToken}
        startMenuTheme={startMenuTheme}
        startMenuBaseRadius={startMenuBaseRadius}
        startMenuPanelRadius={startMenuPanelRadius}
        isEnglishLocale={isEnglishLocale}
      />
      <ProLayout
        title={siteName}
        logo={siteLogo}
        headerTitleRender={isMobileOrTablet ? (logo) => (
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => navigate(effectiveSystemHomePath)}
          >
            {logo}
          </div>
        ) : undefined}
        menuHeaderRender={isMobileOrTablet ? undefined : undefined} // 保持 PC 端默认，手机端由 headerTitleRender 处理
        layout="mix" // 固定使用 MIX 布局模式
        navTheme={isDarkMode ? "realDark" : "light"}
        collapsedButtonRender={(collapsed) => (
          <SidebarFooter
            collapsed={!!collapsed}
            startMenuTheme={startMenuTheme}
            siderFooterToken={siderFooterToken}
            siderTextColor={siderTextColor}
            isDarkSiderFooter={isDarkSiderFooter}
            systemSettingsTriggerRef={systemSettingsTriggerRef}
            systemSettingsPanelMounted={systemSettingsPanelMounted}
            systemSettingsPanelExiting={systemSettingsPanelExiting}
            closeSystemSettingsPanelAnimated={closeSystemSettingsPanelAnimated}
            openSystemSettingsPanel={openSystemSettingsPanel}
            onToggleCollapsed={handleSetCollapsed}
            t={t}
          />
        )}
        contentWidth="Fluid"
        fixedHeader
        fixSiderbar
        breadcrumbRender={isMobileOrTablet ? () => [] : undefined}
        breadcrumbProps={isMobileOrTablet ? { style: { display: 'none' } } : undefined}
        // 验证方案3：同时使用 collapsed + siderWidth + menuRender
        // 全屏时：collapsed={true} + siderWidth={0} + menuRender={() => null} 完全隐藏侧边栏
        // 退出全屏时：恢复所有 props，确保 ProLayout 重新计算布局
        collapsed={isFullscreen ? true : collapsed}
        onCollapse={isFullscreen ? undefined : handleSetCollapsed}
        location={location}
        siderWidth={isFullscreen ? 0 : undefined}
        // 全屏时：不渲染菜单，确保折叠的侧边栏也不占据空间
        menuRender={isFullscreen ? () => null : undefined}
        // 侧栏顶部固定搜索框：浅灰胶囊形，简短文案「搜索菜单」
        menuExtraRender={isFullscreen || collapsed ? undefined : () => (
          <SidebarSearchExtra
            filteredMenuData={filteredMenuData}
            isDarkSiderFooter={isDarkSiderFooter}
            siderTextColor={siderTextColor}
            token={token}
            t={t}
          />
        )}
        // 退出全屏时，强制 ProLayout 重新计算布局
        // 使用 location 作为 key 的一部分，确保路由变化时重新渲染
        // 但这里不使用 key，因为会导致标签丢失
        // 内容区域样式
        contentStyle={{
          // 统一使用非简写属性，避免与简写属性冲突
          paddingTop: 0,
          paddingBottom: 0,
          paddingInline: 0,
          paddingInlineStart: 0,
          paddingInlineEnd: 0,
          background: token.colorBgLayout || (isDarkMode ? '#141414' : '#f5f5f5'),
          // 建立 flex 高度链，让内容区（LayoutPageBody）占满剩余空间
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minHeight: 0,
          // 全屏时：确保内容区域占据全屏，覆盖 ProLayout 的默认 padding-inline: 40px
          ...(isFullscreen ? {
            marginLeft: 0,
            width: '100%',
            maxWidth: '100%',
          } : {
            // 退出全屏时：保持统一的padding设置
          }),
        }}
        headerContentRender={() => (
          <LayoutHeaderContent
            isMobileOrTablet={isMobileOrTablet}
            breadcrumbRef={breadcrumbRef}
            breadcrumbVisible={breadcrumbVisible}
            breadcrumbItems={generateBreadcrumb}
            navigate={navigate}
            collapsed={collapsed}
            onToggleCollapsed={handleSetCollapsed}
            t={t}
          />
        )}
        actionsRender={() => (
          <LayoutHeaderActions
            isMobileOrTablet={isMobileOrTablet}
            isLightModeLightBg={isLightModeLightBg}
            token={token}
            t={t}
            navigate={navigate}
            messageDropdownOpen={messageDropdownOpen}
            setMessageDropdownOpen={setMessageDropdownOpen}
            recentMessages={recentMessages}
            recentMessagesLoading={recentMessagesLoading}
            unreadCount={unreadCount}
            refetchRecentMessages={refetchRecentMessages}
            refetchMessageStats={refetchMessageStats}
            onThemeChange={handleThemeChange}
            currentUser={currentUser}
            avatarUrl={avatarUrl}
            headerTextAvatar={headerTextAvatar}
            setAvatarImageFailed={setAvatarImageFailed}
            getUserMenuItems={getUserMenuItems}
            handleUserMenuClick={handleUserMenuClick}
          />
        )}
        menuDataRender={() => renderMenuData(filteredMenuData, appMenuSkeletonItems)}
        menuProps={{
          mode: 'inline',
          className: 'px-1!',
          // openKeys / onOpenChange 交由 ProLayout BaseMenu 原生管理：路由变化时按 matchMenuKeys 自动收起其它分组（autoClose 默认开启）
          selectedKeys: selectedKeys, // 只选中精确匹配的路径，不选中父级菜单
          // ⚠️ 关键修复：阻止 Ant Design Menu 的默认链接行为，防止整页刷新
          // Menu 会为有 path 的菜单项自动创建 <a> 标签，需要阻止默认行为
          onClick: handleMenuClickPreventFullReload,
        }}
        onMenuHeaderClick={() => navigate(effectiveSystemHomePath)}
        subMenuItemRender={(item: any, defaultDom) => renderSubMenuItem(item, defaultDom)}
        menuItemRender={(item: any, dom) =>
          renderMenuItem(item, dom, { t, menuBadgeCounts, queryClient, collapsed })
        }
      >
        <LayoutPageBody
          isMobileOrTablet={isMobileOrTablet}
          filteredMenuData={filteredMenuData}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        >
          {children}
        </LayoutPageBody>
      </ProLayout>
      <LayoutOverlays
        techStackModalOpen={techStackModalOpen}
        setTechStackModalOpen={setTechStackModalOpen}
        themeEditorOpen={themeEditorOpen}
        setThemeEditorOpen={setThemeEditorOpen}
        aiAssistantMounted={!!aiAssistantMountedRef.current}
        aiAssistantOpen={aiAssistantOpen}
        setAiAssistantOpen={setAiAssistantOpen}
        shortcutHelpOpen={shortcutHelpOpen}
        setShortcutHelpOpen={setShortcutHelpOpen}
        isDarkMode={isDarkMode}
        t={t}
        systemSettingsPanelMounted={systemSettingsPanelMounted}
        systemSettingsPanelExiting={systemSettingsPanelExiting}
        systemSettingsPanelRef={systemSettingsPanelRef}
        systemSettingsPanelGridColumns={systemSettingsPanelGridColumns}
        systemSettingsPanelWidth={systemSettingsPanelWidth}
        systemSettingsGroups={systemSettingsGroups}
        showSystemSettingsTenantMeta={showSystemSettingsTenantMeta}
        systemSettingsPlanLabel={systemSettingsPlanLabel}
        systemSettingsExpiresLabel={systemSettingsExpiresLabel}
        handleSystemSettingsPanelAnimationEnd={handleSystemSettingsPanelAnimationEnd}
        closeSystemSettingsPanelAnimated={closeSystemSettingsPanelAnimated}
        handleSystemSettingsNavigate={handleSystemSettingsNavigate}
        getSystemPanelIcon={getSystemPanelIcon}
      />
    </>
  );
}
