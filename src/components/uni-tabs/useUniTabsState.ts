/**
 * RiverEdge SaaS - UniTabs 状态逻辑
 *
 * 标签状态、持久化、路由同步、标签操作与右键菜单编排。
 */

import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { App, theme, type MenuProps } from 'antd';
import type { MenuDataItem } from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
import { findMenuTitleWithTranslation } from '../../utils/menuTranslation';
import { removeCustomPageTitle, resolveCustomPageTitle, setCustomPageTitle } from '../../utils/customPageTitle';
import {
  useConfigStore,
  resolveEffectiveHomePath,
} from '../../stores/configStore';
import { useUserPreferenceStore } from '../../stores/userPreferenceStore';
import { useThemeStore } from '../../stores/themeStore';
import { getSavedTabs, setSavedTabs, getSavedActiveKey, setSavedActiveKey } from '../../stores/tabsStorage';
import { getUserInfo, getTenantId, getToken } from '../../utils/auth';
import {
  getEffectiveHome,
  getTenantBackendHome,
  EFFECTIVE_HOME_QUERY_KEY,
  TENANT_BACKEND_HOME_QUERY_KEY,
} from '../../services/menu';
import { isCreateTabKey } from './isCreateTabKey';
import { readUniTabsBorderRadius } from '../../utils/themeBorderRadius';
import { createTabContextMenu } from './tabContextMenu';
import {
  buildTabKey,
  calculateColorBrightness,
  isDashboardLikePage,
  isTenantDefaultHomePath,
  sortTabs,
} from './tabsUtils';
import type { TabItem, UniTabsProps } from './types';

export function useUniTabsState({ menuConfig }: Pick<UniTabsProps, 'menuConfig'>) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { t } = useTranslation(); // 获取翻译函数
  // 辅助：同步获取持久化配置（从用户偏好存储读取，store 未就绪时从 persist 缓存回退）
  const getInitialPersistence = () => {
    if (typeof window === 'undefined') return false;
    try {
      const userInfo = getUserInfo();
      if (!userInfo) return false;
      const tenantId = getTenantId() ?? userInfo?.tenant_id ?? (userInfo as any)?.tenantId;
      const userId = userInfo?.id ?? (userInfo as any)?.user_id ?? (userInfo as any)?.uuid;
      if (tenantId == null || userId == null) return false;
      const key = `user-preference-storage-${tenantId}-${userId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const data = JSON.parse(raw);
      const prefs = data?.state?.preferences ?? data?.preferences;
      return prefs && prefs.tabs_persistence !== undefined ? Boolean(prefs.tabs_persistence) : false;
    } catch {
      return false;
    }
  };

  // 1. 持久化配置：优先从 store 读取，store 未就绪时从 localStorage 回退
  const storeTabsPersistence = useUserPreferenceStore((s) => s.preferences?.tabs_persistence);
  const dashboardQuickEntriesRaw = useUserPreferenceStore((s) => s.preferences?.dashboard_quick_entries);
  const dashboardQuickEntries = useMemo(
    () => (Array.isArray(dashboardQuickEntriesRaw) ? dashboardQuickEntriesRaw : []),
    [dashboardQuickEntriesRaw],
  );
  const updatePreferences = useUserPreferenceStore((s) => s.updatePreferences);
  const tabsPersistence = storeTabsPersistence !== undefined ? Boolean(storeTabsPersistence) : getInitialPersistence();

  /** 站点默认租户首页（工作台 / 应用中心） */
  const configs = useConfigStore((s) => s.configs);
  const tenantIdStrForHome = getTenantId()?.toString() ?? null;
  const { data: tenantBackendHome, isFetched: backendHomeFetched } = useQuery({
    queryKey: [...TENANT_BACKEND_HOME_QUERY_KEY, tenantIdStrForHome],
    queryFn: getTenantBackendHome,
    enabled: !!(getToken() && tenantIdStrForHome),
    staleTime: 60 * 1000,
  });

  const { data: effectiveHome, isFetched: effectiveHomeFetched } = useQuery({
    queryKey: [...EFFECTIVE_HOME_QUERY_KEY, tenantIdStrForHome],
    queryFn: getEffectiveHome,
    enabled: !!(getToken() && tenantIdStrForHome),
    staleTime: 60 * 1000,
  });

  /** 固定标签栏首位「首页」：角色 > 菜单主页 > 工作台 > 兜底页（与 Logo、登录落地一致） */
  const tenantHomePath = useMemo(
    () => resolveEffectiveHomePath(effectiveHome, tenantBackendHome?.path, configs),
    [effectiveHome, tenantBackendHome?.path, configs],
  );

  const homePathReady = backendHomeFetched && effectiveHomeFetched;

  /** 关闭默认首页标签时尚未拉取自定义首页时，延后跳转避免误落应用中心 */
  const pendingDefaultHomeCloseRef = useRef<string | null>(null);

  // 2. 同步初始化标签列表（直接从本地存储读取并过滤）
  const [tabs, setTabs] = useState<TabItem[]>(() => {
    if (typeof window === 'undefined') return [];
    
    // 如果未开启持久化，仅返回空（等待后续逻辑添加默认标签）或直接返回默认标签
    const localPersistence = getInitialPersistence();
    if (!localPersistence) return [];

    try {
      const parsedTabs = getSavedTabs();
      if (parsedTabs.length > 0) {
        const isInfraPage = location.pathname.startsWith('/infra');
           
        const validTabs = parsedTabs.filter((tab) => {
          if (!tab || typeof tab !== 'object' || !tab.key || !tab.path || !tab.label) return false;
          if (isInfraPage) return tab.path.startsWith('/infra');
          return !tab.path.startsWith('/infra') || tab.path.startsWith('/system');
        });

        if (validTabs.length > 0) {
          if (isInfraPage) {
            const hasOperation = validTabs.some((tab) => tab.key === '/infra/operation');
            if (!hasOperation) {
              const opPath = '/infra/operation';
              const opTitle = findMenuTitleWithTranslation(opPath, menuConfig, t);
              validTabs.unshift({
                key: opPath,
                path: opPath,
                label: opTitle,
                closable: false,
                pinned: false,
              });
            }
          } else {
            // 首页标签由路由同步 effect 按 tenantHomePath 注入，不在此处写死工作台/应用中心
          }
          return validTabs;
        }
      }
    } catch (e) { console.warn('Failed to load tabs from cache', e); }
    return [];
  });

  // 3. 同步初始化 activeKey
  const [activeKey, setActiveKey] = useState<string>(() => {
     // 优先使用当前 URL（这最准确）
     // 如果当前 URL 是根路径或重定向路径，才考虑恢复上次的
     // 但实际上 BasicLayout 会处理重定向，这里 location.pathname 已经是准确的
     return location.pathname + location.search;
  });

  // 不再需要 isInitialized，因为初始状态就是 initialized
  // const [isInitialized, setIsInitialized] = useState<boolean>(true);

  const [refreshKey, setRefreshKey] = useState<number>(0);
  const favoriteSavingRef = useRef(false);

  // 从 themeStore 订阅标签栏背景色（单一数据源，无需事件监听）
  const storeTabsBgColor = useThemeStore((s) => s.resolved.tabsBgColor);
  const storeIsDark = useThemeStore((s) => s.resolved.isDark);

  /**
   * 根据路径或完整 tabKey 获取标签标题（key 可能含 query，标题按 pathname 查找）
   */
  const getTabTitle = useCallback(
    (pathOrKey: string): string => {
      const pathname = (pathOrKey || '').split('?')[0];
      const search = pathOrKey.includes('?') ? pathOrKey.slice(pathOrKey.indexOf('?')) : '';
      const custom = resolveCustomPageTitle(pathname, search);
      if (custom) return custom;
      return findMenuTitleWithTranslation(pathname, menuConfig, t);
    },
    [menuConfig, t]
  );

  /**
   * 监听语言/菜单变化，自动更新所有标签的标题
   */
  useEffect(() => {
    setTabs((prevTabs) => {
      // 避免如果不必要的更新
      let hasChanges = false;
      const newTabs = prevTabs.map((tab) => {
        const newLabel = getTabTitle(tab.key);
        if (newLabel !== tab.label) {
          hasChanges = true;
          return { ...tab, label: newLabel };
        }
        return tab;
      });
      return hasChanges ? newTabs : prevTabs;
    });
  }, [t, menuConfig, getTabTitle]);

  /**
   * 添加标签
   */
  const addTab = useCallback(
    (path: string) => {
      // 排除登录页等不需要标签的页面（注册功能已整合到登录页面）
      const excludePaths = ['/login'];
      if (excludePaths.some((p) => path.startsWith(p))) {
        return;
      }

      setTabs((prevTabs) => {
        // 检查标签是否已存在
        const existingTab = prevTabs.find((tab) => tab.key === path);
        if (existingTab) {
          return prevTabs;
        }

        // 添加新标签
        const newTab: TabItem = {
          key: path,
          path,
          label: getTabTitle(path),
          closable: path !== tenantHomePath, // 工作台标签不可关闭
          pinned: false, // 默认不固定
        };

        let newTabs: TabItem[];

        // 排序逻辑：工作台 -> 固定标签 -> 其他标签
        // 如果添加的是工作台，确保它在第一个位置
        if (path === tenantHomePath) {
          // 检查是否已存在工作台标签
          const workplaceTab = prevTabs.find((tab) => tab.key === tenantHomePath);
          if (workplaceTab) {
            return prevTabs;
          }
          let rest = prevTabs;
          if (isTenantDefaultHomePath(tenantHomePath)) {
            rest = prevTabs.filter(
              (tab) => !isTenantDefaultHomePath(tab.key) || tab.key === tenantHomePath,
            );
          } else {
            rest = prevTabs.filter((tab) => !isTenantDefaultHomePath(tab.key));
          }
          rest = rest.filter((tab) => tab.key !== tenantHomePath);
          newTabs = [newTab, ...rest];
        } else {
          // 其他标签：插入到工作台之后，固定标签之后
          const workplaceTab = prevTabs.find((tab) => tab.key === tenantHomePath);
          const pinnedTabs = prevTabs.filter((tab) => tab.pinned && tab.key !== tenantHomePath);
          const unpinnedTabs = prevTabs.filter((tab) => !tab.pinned && tab.key !== tenantHomePath);

          if (workplaceTab) {
            // 有工作台：工作台 -> 固定标签 -> 新标签 -> 其他标签
            newTabs = [workplaceTab, ...pinnedTabs, newTab, ...unpinnedTabs];
          } else {
            // 没有工作台：先添加工作台，再添加新标签
            const workplaceTab: TabItem = {
              key: tenantHomePath,
              path: tenantHomePath,
              label: getTabTitle(tenantHomePath),
              closable: false,
              pinned: false, // 工作台默认不固定（但始终在第一个位置）
            };
            newTabs = [workplaceTab, ...pinnedTabs, newTab, ...unpinnedTabs];
          }
        }

      // 引入配置
      const { getConfig } = useConfigStore.getState();
      const { getPreference } = useUserPreferenceStore.getState();
      // 最大标签数优先级：User Preference > Config Store > Default(20)
      const maxTabs = getPreference('ui.max_tabs', getConfig('ui.max_tabs', 20));

      if (newTabs.length > maxTabs) {
          // 超过数量时保留新的、关闭旧的：在可关闭且非固定的标签中，排除当前新加的 path，移除最旧的一个
          const closableTabs = newTabs.filter((tab) => tab.closable && !tab.pinned && tab.key !== tenantHomePath);
          const closableExceptNew = closableTabs.filter((tab) => tab.key !== path);
          const oldestTab = closableExceptNew[0];
          if (oldestTab) {
            newTabs = newTabs.filter((tab) => tab.key !== oldestTab.key);
          }
        }

        return newTabs;
      });
    },
    [getTabTitle, tenantHomePath]
  );

  /** 始终指向最新 addTab，供「路由同步标签」effect 使用，避免因 getTabTitle/menuConfig 变化导致 addTab 引用变、effect 在无导航时反复执行引发 #185 */
  const addTabRef = useRef(addTab);
  addTabRef.current = addTab;

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    const pendingKey = pendingDefaultHomeCloseRef.current;
    if (!pendingKey || !homePathReady) return;
    pendingDefaultHomeCloseRef.current = null;
    const resolvedHome = resolveEffectiveHomePath(effectiveHome, tenantBackendHome?.path, configs);
    if (pendingKey !== resolvedHome) {
      setActiveKey(resolvedHome);
      navigateRef.current(resolvedHome);
    }
  }, [homePathReady, effectiveHome, tenantBackendHome?.path, configs]);

  /**
   * 租户后台首页路径变化时：移除旧首页标签、去掉与当前模式冲突的默认路径标签，并把新首页固定到第一位且不可关闭。
   * 与 BasicLayout 中 effectiveSystemHomePath 数据源一致（React Query 同 key 缓存共享）。
   */
  const prevTenantHomePathRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevTenantHomePathRef.current;
    if (prev === null) {
      prevTenantHomePathRef.current = tenantHomePath;
      return;
    }
    if (prev === tenantHomePath) return;
    prevTenantHomePathRef.current = tenantHomePath;

    setTabs((prevTabs) => {
      let next = prevTabs.filter((t) => t.key !== prev);
      if (!isTenantDefaultHomePath(tenantHomePath)) {
        next = next.filter((t) => !isTenantDefaultHomePath(t.key));
      } else {
        next = next.filter((t) => !isTenantDefaultHomePath(t.key) || t.key === tenantHomePath);
      }
      const existingHome = next.find((t) => t.key === tenantHomePath);
      const homeTab: TabItem =
        existingHome != null
          ? { ...existingHome, closable: false, pinned: false }
          : {
              key: tenantHomePath,
              path: tenantHomePath,
              label: getTabTitle(tenantHomePath),
              closable: false,
              pinned: false,
            };
      const rest = next.filter((t) => t.key !== tenantHomePath);
      return [homeTab, ...rest];
    });

    setActiveKey((ak) => {
      if (ak === prev) {
        navigateRef.current(tenantHomePath, { replace: true });
        return tenantHomePath;
      }
      return ak;
    });
  }, [tenantHomePath, getTabTitle]);

  /**
   * 移除标签
   */
  const removeTab = useCallback((targetKey: string) => {
    removeCustomPageTitle(targetKey);
    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter((tab) => tab.key !== targetKey);
      return newTabs;
    });
  }, []);

  /**
   * 固定/取消固定标签
   */
  const togglePinTab = useCallback((targetKey: string) => {
    setTabs((prevTabs) => {
      const newTabs = prevTabs.map((tab) => {
        if (tab.key === targetKey) {
          return { ...tab, pinned: !tab.pinned };
        }
        return tab;
      });

      // 排序：固定标签在前，然后是按顺序排列的其他标签
      // 工作台始终在第一个位置（如果存在）
      return sortTabs(newTabs, tenantHomePath);
    });
  }, [tenantHomePath]);

  /**
   * 从本地存储加载并验证标签（供初始化和异步恢复使用）
   */
  const loadTabsFromStorage = useCallback((): TabItem[] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const parsedTabs = getSavedTabs();
      if (!parsedTabs.length) return null;

      const isInfraPage = location.pathname.startsWith('/infra');
      const validTabs = parsedTabs.filter((tab) => {
        if (!tab || typeof tab !== 'object' || !tab.key || !tab.path || !tab.label) return false;
        if (isInfraPage) return tab.path.startsWith('/infra');
        return !tab.path.startsWith('/infra') || tab.path.startsWith('/system');
      });

      if (validTabs.length === 0) return null;
      const wpPath = isInfraPage ? '/infra/operation' : tenantHomePath;
      const hasDefault = validTabs.some((tab) => tab.key === wpPath);
      if (!hasDefault) {
        const title = findMenuTitleWithTranslation(wpPath, menuConfig, t);
        validTabs.unshift({
          key: wpPath,
          path: wpPath,
          label: title,
          closable: false,
          pinned: false,
        });
      }
      return validTabs;
    } catch {
      return null;
    }
  }, [location.pathname, menuConfig, t, tenantHomePath]);

  /** 是否已从异步恢复中加载过标签（避免重复覆盖用户操作） */
  const didRestoreFromSyncRef = useRef(false);
  /** 正在从存储恢复，避免保存 effect 在同周期用错误数据覆盖 */
  const isRestoringRef = useRef(false);
  /**
   * 当 tabsPersistence 异步恢复为 true 时（如登出后再次登录），从本地存储恢复标签
   * 解决 clearForLogout 清除 riveredge_tabs_persistence 导致初始化时 tabs=[] 的问题
   */
  useEffect(() => {
    if (!tabsPersistence || didRestoreFromSyncRef.current) return;
    const restored = loadTabsFromStorage();
    if (restored && restored.length > 0) {
      didRestoreFromSyncRef.current = true;
      isRestoringRef.current = true;
      setTabs(restored);
      const savedActive = getSavedActiveKey();
      if (savedActive && restored.some((tab) => tab.key === savedActive)) {
        setActiveKey(savedActive);
      }
    }
  }, [tabsPersistence, loadTabsFromStorage]);

  /**
   * 保存标签到本地存储（当启用持久化且标签变化时）
   * 每次标签变化时自动保存，刷新页面时就能恢复
   */
  useEffect(() => {
    if (!tabsPersistence) return;
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }
    try {
      setSavedTabs(tabs);
      if (activeKey && !activeKey.startsWith('/apps/')) {
        setSavedActiveKey(activeKey);
      }
    } catch {
      // ignore
    }
  }, [tabs, activeKey, tabsPersistence]);

  /**
   * 监听路由变化，自动添加标签
   * 注意：如果启用了持久化且正在恢复标签，不要立即添加标签，避免覆盖恢复的标签
   */
  useEffect(() => {
    // 移除 isInitialized 检查
    // if (!isInitialized) return;

    if (location.pathname) {
      const add = addTabRef.current;
      // 确保工作台标签始终存在（固定第一个）
      add(tenantHomePath);
      // 使用 pathname+search 作为 tabKey，切换回来时保留 query（如 designer?materialId=xxx）
      // 排除 _refresh 参数，避免右键刷新时因 URL 变化而新建标签
      const searchParams = new URLSearchParams(location.search || '');
      searchParams.delete('_refresh');
      const cleanSearch = searchParams.toString();
      const tabKey = location.pathname + (cleanSearch ? `?${cleanSearch}` : '');
      add(tabKey);
      setActiveKey((prev) => (prev === tabKey ? prev : tabKey));
    }
  }, [location.pathname, location.search, tenantHomePath]);

  /**
   * 监听自定义事件更新标签标题
   */
  useEffect(() => {
    const handleUpdateTabTitle = (event: CustomEvent<{ key?: string; path?: string; title: string }>) => {
      const { key, path, title } = event.detail;
      if (!title) return;

      if (key) setCustomPageTitle(key, title);
      if (path) setCustomPageTitle(path, title);

      setTabs((prevTabs) => {
        return prevTabs.map((tab) => {
          // 优先匹配 key (完整路径+查询参数)
          if (key && tab.key === key) {
            return { ...tab, label: title };
          }
          // 其次匹配 path (仅路径部分)
          if (path && tab.path === path) {
            return { ...tab, label: title };
          }
          // 如果只提供了 path，但 tab.key 包含了 query，我们也尝试匹配 path 部分
          if (path && tab.key.split('?')[0] === path) {
             return { ...tab, label: title };
          }
          return tab;
        });
      });
    };

    window.addEventListener('riveredge:update-tab-title', handleUpdateTabTitle as EventListener);
    return () => {
      window.removeEventListener('riveredge:update-tab-title', handleUpdateTabTitle as EventListener);
    };
  }, []);

  /**
   * 返回时关闭当前标签：当通过 state.closeTab 指定要关闭的标签时，移除该标签并清除 state
   */
  useEffect(() => {
    const state = location.state as { closeTab?: string } | null;
    if (state?.closeTab) {
      removeTab(state.closeTab);
      const search = location.search ? location.search : '';
      navigate(location.pathname + search, { replace: true, state: {} });
    }
  }, [location.pathname, location.search, location.state, removeTab, navigate]);

  /**
   * 监听 refresh 参数，实现局部刷新
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('_refresh')) {
      // 移除 refresh 参数，保持 URL 干净
      searchParams.delete('_refresh');
      const newSearch = searchParams.toString();
      const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
      navigate(newPath, { replace: true });
      // 更新 refreshKey 触发组件重新渲染
      setRefreshKey(prev => prev + 1);
    }
  }, [location.search, location.pathname, navigate]);

  /**
   * 处理标签切换
   */
  const handleTabChange = (key: string) => {
    setActiveKey(key);
    navigate(key);
  };

  /**
   * 解析关闭默认首页占位标签后应跳转的有效首页（需等自定义首页 API 返回后再决定，避免误跳应用中心）
   */
  const resolveHomeAfterClose = useCallback(
    (closedKey: string): string | 'pending' | null => {
      if (!isTenantDefaultHomePath(closedKey)) return null;
      if (!homePathReady) return 'pending';
      const resolvedHome = resolveEffectiveHomePath(effectiveHome, tenantBackendHome?.path, configs);
      return closedKey !== resolvedHome ? resolvedHome : null;
    },
    [homePathReady, effectiveHome, tenantBackendHome?.path, configs],
  );

  /**
   * 处理标签关闭
   */
  const handleTabClose = (targetKey: string) => {
    const targetIndex = tabs.findIndex((tab) => tab.key === targetKey);
    const newTabs = tabs.filter((tab) => tab.key !== targetKey);

    // 如果关闭的是当前激活的标签，切换到相邻标签
    if (targetKey === activeKey) {
      const homeAfterClose = resolveHomeAfterClose(targetKey);
      if (homeAfterClose === 'pending') {
        pendingDefaultHomeCloseRef.current = targetKey;
        removeTab(targetKey);
        return;
      }
      if (typeof homeAfterClose === 'string') {
        setActiveKey(homeAfterClose);
        navigate(homeAfterClose);
      } else if (newTabs.length > 0) {
        // 优先切换到右侧标签，如果没有则切换到左侧
        const nextTab = newTabs[targetIndex] || newTabs[targetIndex - 1] || newTabs[0];
        if (nextTab) {
          setActiveKey(nextTab.key);
          navigate(nextTab.key);
        }
      } else if (homePathReady) {
        navigate(tenantHomePath);
      } else {
        pendingDefaultHomeCloseRef.current = targetKey;
      }
    }

    removeTab(targetKey);
  };

  /**
   * 关闭右侧标签
   */
  const handleCloseRight = (targetKey: string) => {
    const targetIndex = tabs.findIndex((tab) => tab.key === targetKey);
    if (targetIndex === -1) return;

    // 保留目标标签及其左侧的所有标签，以及所有固定标签
    const leftTabs = tabs.slice(0, targetIndex + 1);
    const rightTabs = tabs.slice(targetIndex + 1);
    // 保留右侧的固定标签
    const rightPinnedTabs = rightTabs.filter((tab) => tab.pinned || tab.key === tenantHomePath);
    const newTabs = [...leftTabs, ...rightPinnedTabs];

    // 重新排序：工作台 -> 固定标签 -> 其他标签
    const sortedTabs = sortTabs(newTabs, tenantHomePath);
    setTabs(sortedTabs);

    // 如果当前激活的标签被关闭，切换到目标标签
    if (!sortedTabs.find((tab) => tab.key === activeKey)) {
      setActiveKey(targetKey);
      navigate(targetKey);
    }
  };

  /**
   * 关闭其他标签
   */
  const handleCloseOthers = (targetKey: string) => {
    // 保留目标标签、工作台标签和所有固定标签
    const workplaceTab = tabs.find((tab) => tab.key === tenantHomePath);
    const targetTab = tabs.find((tab) => tab.key === targetKey);
    const pinnedTabs = tabs.filter((tab) => tab.pinned && tab.key !== tenantHomePath && tab.key !== targetKey);
    const newTabs: TabItem[] = [];

    // 先添加工作台标签（如果存在且不是目标标签）
    if (workplaceTab && workplaceTab.key !== targetKey) {
      newTabs.push(workplaceTab);
    }

    // 添加固定标签（不包括目标标签）
    newTabs.push(...pinnedTabs);

    // 添加目标标签（如果存在且不是工作台）
    if (targetTab) {
      newTabs.push(targetTab);
    }

    setTabs(newTabs);
    setActiveKey(targetKey);
    navigate(targetKey);
  };

  /**
   * 全部关闭
   */
  const handleCloseAll = useCallback(() => {
    // 使用 setTimeout 确保在当前事件循环结束后执行，避免竞态条件
    setTimeout(() => {
      // 保留工作台标签和所有固定标签
      const workplaceTab = tabs.find((tab) => tab.key === tenantHomePath);
      const pinnedTabs = tabs.filter((tab) => tab.pinned && tab.key !== tenantHomePath);
      const newTabs: TabItem[] = [];

      // 先添加工作台标签（如果存在）
      if (workplaceTab) {
        newTabs.push(workplaceTab);
      }

      // 添加所有固定标签
      newTabs.push(...pinnedTabs);

      // 批量更新状态，避免竞态条件
      if (newTabs.length > 0) {
        setTabs(newTabs);
        setActiveKey(newTabs[0].key);
        // 延迟导航，确保状态更新完成
        setTimeout(() => navigate(newTabs[0].key), 0);
      } else {
        setTabs([]);
        setActiveKey(tenantHomePath);
        setTimeout(() => navigate(tenantHomePath), 0);
      }
    }, 0);
  }, [tabs, navigate, tenantHomePath]);

  /**
   * 处理标签刷新 - 局部刷新当前标签页
   */
  const handleTabRefresh = useCallback((tabKey: string) => {
    // 计算当前逻辑 tabKey（排除 _refresh），用于判断是否已在目标标签
    const currentTabKey = buildTabKey(location.pathname, location.search || '');
    // 如果当前路径就是目标路径，通过添加 refresh 参数来触发局部刷新
    if (currentTabKey === tabKey) {
      // 添加 refresh 参数，触发路由变化，从而触发组件重新渲染
      const separator = location.search ? '&' : '?';
      navigate(`${tabKey}${separator}_refresh=${Date.now()}`, { replace: true });
    } else {
      // 如果当前路径不是目标路径，先导航到目标路径
      navigate(tabKey, { replace: true });
    }
  }, [navigate, location.pathname, location.search]);

  /** 从 menuConfig 中按 path 查找菜单元数据 */
  const findMenuItemByPath = useCallback((targetPath: string): any | null => {
    const normalizedTarget = (targetPath || '').split('?')[0].replace(/\/$/, '');
    const walk = (items?: any[]): any | null => {
      if (!items?.length) return null;
      for (const item of items) {
        const itemPath = ((item?.path as string) || '').replace(/\/$/, '');
        if (itemPath && itemPath === normalizedTarget) return item;
        const found = walk(item?.children || item?.routes);
        if (found) return found;
      }
      return null;
    };
    return walk(menuConfig as any[]);
  }, [menuConfig]);

  /** 收藏当前标签到工作台快捷入口 */
  const handleFavoriteToQuickEntry = useCallback(async (tabKey: string) => {
    if (favoriteSavingRef.current) return;
    const menuPath = (tabKey || '').split('?')[0];
    if (!menuPath || menuPath === tenantHomePath) {
      message.warning(t('ui.message.notSupportFavorite'));
      return;
    }

    const menuItem = findMenuItemByPath(menuPath);
    const menuUuid = String(menuItem?.uuid || menuItem?.key || menuPath);
    const menuName = String(menuItem?.name || menuItem?.title || getTabTitle(menuPath) || menuPath);
    const exists = dashboardQuickEntries.some(
      (item) => item?.menu_path === menuPath || String(item?.menu_uuid) === menuUuid,
    );
    if (exists) {
      message.info(t('ui.message.alreadyInFavorite'));
      return;
    }

    const nextEntries = [
      ...dashboardQuickEntries,
      {
        menu_uuid: menuUuid,
        menu_name: menuName,
        menu_path: menuPath,
        sort_order: dashboardQuickEntries.length,
      },
    ];
    favoriteSavingRef.current = true;
    try {
      await updatePreferences({ dashboard_quick_entries: nextEntries });
    } finally {
      favoriteSavingRef.current = false;
    }
    message.success(t('ui.message.favoriteSuccess'));
  }, [dashboardQuickEntries, findMenuItemByPath, getTabTitle, message, updatePreferences, tenantHomePath, t]);

  /**
   * 获取标签右键菜单
   */
  const getTabContextMenu = (tabKey: string): MenuProps => createTabContextMenu({
    tabKey,
    tabs,
    tenantHomePath,
    t,
    onRefresh: handleTabRefresh,
    onPin: togglePinTab,
    onFavorite: handleFavoriteToQuickEntry,
    onClose: handleTabClose,
    onCloseRight: handleCloseRight,
    onCloseOthers: handleCloseOthers,
    onCloseAll: handleCloseAll,
  });


  // 计算标签栏背景色（支持透明度）
  const tabsBgColor = useMemo(() => {
    if (storeIsDark) return token.colorBgContainer;
    return storeTabsBgColor || token.colorBgContainer;
  }, [storeTabsBgColor, token.colorBgContainer, storeIsDark]);

  // 根据标签栏背景色计算文字颜色
  const tabsTextColor = useMemo(() => {
    if (storeIsDark) return 'var(--ant-colorText)';

    const customBgColor = storeTabsBgColor;

    if (customBgColor) {
      const brightness = calculateColorBrightness(customBgColor);
      return brightness < 128 ? '#ffffff' : 'var(--ant-colorText)';
    }
    return 'var(--ant-colorText)';
  }, [storeTabsBgColor, storeIsDark]);

  /** 当前是否为 HMI/生产终端类页面（需使用专用内容容器：左右 16px padding + 系统圆角） */
  const isHMIPage = useMemo(() => {
    const key = activeKey || '';
    return key.includes('production-execution/terminal') || key.includes('/kiosk');
  }, [activeKey]);

  /** 标签顶角 / 底内凹圆角：保底 4px，高于 4px 时跟随系统 borderRadius */
  const tabRadius = useMemo(() => readUniTabsBorderRadius(token.borderRadius, 8), [token.borderRadius]);
  const tabCornerDiameter = tabRadius * 2;

  /** 工作台/模块看板：外层 UniTabs 不滚动，由内部 DashboardTemplate / UniDashboard 承担 */
  const isDashboardScrollPage = isDashboardLikePage(location.pathname);

  /** 仅运营分析看板自管四边 inset，其余工作台仍用 UniTabs 统一 16px 边距 */
  const isFlushDashboardOuter =
    location.pathname.replace(/\/$/, '') === '/system/dashboard/analysis';

  const isBusinessBoardAnalysisPage = location.pathname.replace(/\/$/, '') === '/system/dashboard/analysis';

  const createTabKeys = useMemo(
    () => tabs.map((tab) => tab.key).filter(isCreateTabKey),
    [tabs],
  );


  return {
    tabs,
    activeKey,
    refreshKey,
    tenantHomePath,
    token,
    tabsBgColor,
    tabsTextColor,
    tabRadius,
    tabCornerDiameter,
    isHMIPage,
    isDashboardScrollPage,
    isFlushDashboardOuter,
    isBusinessBoardAnalysisPage,
    createTabKeys,
    handleTabChange,
    handleTabClose,
    handleCloseRight,
    handleCloseOthers,
    handleCloseAll,
    handleTabRefresh,
    togglePinTab,
    handleFavoriteToQuickEntry,
    getTabContextMenu,
    isDarkMode: storeIsDark,
  };
}
