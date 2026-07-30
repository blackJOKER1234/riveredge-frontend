import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { getCurrentUser } from '../services/auth';
import { getCurrentInfraSuperAdmin } from '../services/infraAdmin';
import { getToken, clearAuth, getUserInfo, setUserInfo, setTenantId, getTenantId, isTokenExpired, getTokenRemainingTime, isInfraSuperAdminUser, isInfraSuperAdminFromToken } from '../utils/auth';
import { buildRestoredUserFromStorage } from '../utils/restoredUser';
import { refreshAccessTokenSilently } from '../utils/tokenRefresh';
import { prefetchAvatarUrl } from '../utils/avatar';
import { initDocumentStatusCache } from '../services/enums';
import { updateLastActivity, getLastActivityTime, hasPendingRequests } from '../utils/activityUtils';
import { useGlobalStore } from '../stores';
import { getDefaultTenantHomePath, useConfigStore } from '../stores/configStore';
import PageSkeleton, { PageSkeletonProps } from './page-skeleton';
import { PageLoadingFullscreen } from './page-loading-lottie';

// ====== DelayedFallback ======

const DelayedFallback: React.FC<{
  variant?: PageSkeletonProps['variant'];
  delayMs?: number;
  fullHeight?: boolean;
}> = ({
  variant = 'content',
  delayMs = 150,
  fullHeight = false,
}) => {
  const [show, setShow] = useState(delayMs === 0);
  useEffect(() => {
    if (delayMs === 0) return;
    const t = window.setTimeout(() => setShow(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  if (!show) return null;

  if (fullHeight) {
    return <PageLoadingFullscreen />;
  }

  return <PageSkeleton variant={variant} />;
};

/**
 * ⚠️ 关键：必须定义在 App 函数外部（模块级别）
 * 若定义在 App 内部，每次 App 重渲染时 React 会认为这是一个全新的组件类型，
 * 导致整个子树卸载并重挂载，引发无限循环。
 */
/** 主题与语言就绪前的全屏 Spin，避免英文界面先渲染中文文案 */

// ====== AuthGuard ======

const AuthGuard = React.memo<{ children: React.ReactNode }>(({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useGlobalStore((s) => s.currentUser);
  const loading = useGlobalStore((s) => s.loading);
  const setCurrentUser = useGlobalStore((s) => s.setCurrentUser);
  const setLoading = useGlobalStore((s) => s.setLoading);

  // ⚠️ 关键修复：将所有路径检查移到 Hook 调用之前，避免 Hook 顺序问题
  const isMasterDataPath = location.pathname.startsWith('/apps/master-data');
  const isDebugPath = location.pathname.startsWith('/debug/');

  // 使用 useRef 跟踪是否已经初始化，避免重复执行
  const initializedRef = React.useRef(false);

  // 初始化时，如果有 token 但没有 currentUser，尝试从 localStorage 恢复用户信息
  React.useEffect(() => {
    // 只在首次挂载时执行一次
    if (initializedRef.current) {
      return;
    }

    const token = getToken();
    const restoredUser = buildRestoredUserFromStorage();

    if ((token || restoredUser) && !currentUser && restoredUser) {
      setCurrentUser(restoredUser);
      setUserInfo(restoredUser);
      if (restoredUser.tenant_id != null) {
        setTenantId(restoredUser.tenant_id);
      }
    }

    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次，使用 initializedRef 确保只执行一次

  // 公开页面：根路径、登录、初始化向导等，无需鉴权即可访问
  const pathname = location.pathname;
  const resolveTenantDomainFromPathname = (path: string): string | null => {
    const segments = path.split('/').filter(Boolean);
    if (!segments.length) return null;
    const reserved = new Set([
      'login',
      'infra',
      'apps',
      'system',
      'personal',
      'init',
      'lock-screen',
      'docs',
      'debug',
      'qrcode',
    ]);
    if (!reserved.has(segments[0])) return segments[0].toLowerCase();
    if (segments[0] === 'login' && segments[1] && !reserved.has(segments[1])) return segments[1].toLowerCase();
    return null;
  };
  const tenantDomainFromPath = resolveTenantDomainFromPathname(pathname);
  const isPublicPath = pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname === '/infra/login' ||
    pathname.startsWith('/lock-screen') ||
    pathname.startsWith('/init/') ||
    pathname.startsWith('/docs') ||
    pathname.startsWith('/debug/') ||
    pathname.startsWith('/qrcode/');
  const isInfraLoginPage = pathname === '/infra/login';

  // ⚠️ 修复：公开页面若存在过期 token，立即清除，避免触发需认证的请求导致短暂错误提示（如 "Token缺失"）
  // 使用 useLayoutEffect 在首屏绘制前同步执行，减少闪烁
  React.useLayoutEffect(() => {
    if (isPublicPath) {
      const token = getToken();
      if (token && isTokenExpired(token)) {
        clearAuth();
        setCurrentUser(undefined);
      }
    }
  }, [isPublicPath, setCurrentUser]);

  // 使用 useMemo 计算是否应该获取用户信息，避免重复计算
  // ⚠️ 关键修复：在公开页面（如登录页）不应该尝试获取用户信息，避免后端未运行时出现连接错误
  const shouldFetchUser = React.useMemo(() => {
    const token = getToken();
    if (isPublicPath) {
      return false;
    }
    // 有 token 即拉取 /auth/me，避免 persist 中的 permissions 在角色授权后长期过期
    return !!token;
  }, [isPublicPath]);

  const isInfraSuperAdmin = isInfraSuperAdminUser(getUserInfo()) || isInfraSuperAdminFromToken();

  const { data: userData, isLoading, isError, error } = useQuery({
    queryKey: ['currentUser', isInfraSuperAdmin],
    queryFn: async () => {
      if (isInfraSuperAdmin) {
        const infraUser = await getCurrentInfraSuperAdmin();
        const tenantId = getTenantId();
        return {
          id: infraUser.id,
          uuid: infraUser.uuid,
          username: infraUser.username,
          email: infraUser.email,
          full_name: infraUser.full_name,
          avatar: infraUser.avatar,
          is_infra_admin: true,
          is_tenant_admin: false,
          tenant_id: tenantId ?? undefined,
          user_type: 'infra_superadmin' as const,
        };
      }
      return getCurrentUser();
    },
    enabled: shouldFetchUser,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // 处理用户信息加载成功（唯一数据源：/auth/me）
  useEffect(() => {
    if (userData) {
      setCurrentUser(userData);
      setUserInfo(userData);
      if (userData.avatar) prefetchAvatarUrl(userData.avatar);
    }
  }, [userData, setCurrentUser]);

  // 用户就绪（无论来自 API 成功还是 localStorage 恢复）后统一预加载枚举缓存；
  // initDocumentStatusCache 内部对 in-flight 请求做单例防并发。
  useEffect(() => {
    if (currentUser && !isPublicPath) {
      initDocumentStatusCache().catch(() => {});
    }
  }, [currentUser, isPublicPath]);

  // 拉取当前用户失败的兜底：优先从 localStorage 恢复；否则退出到登录页
  useEffect(() => {
    if (!isError) return;
    const token = getToken();
    if (!token) {
      clearAuth();
      setCurrentUser(undefined);
      return;
    }
    const restoredUser = buildRestoredUserFromStorage();
    if (restoredUser) {
      setCurrentUser(restoredUser);
      setUserInfo(restoredUser);
      console.warn('获取用户信息失败，使用本地缓存:', error);
    } else {
      clearAuth();
      setCurrentUser(undefined);
    }
  }, [isError, error, setCurrentUser]);

  useEffect(() => {
    // 公开页面不拉取用户信息，直接清除 loading，避免登录页循环加载
    if (isPublicPath) {
      setLoading(false);
      return;
    }
    // 登录后 store/localStorage 已有用户时，/auth/me 后台刷新不阻塞 UI
    if (currentUser && isLoading) {
      return;
    }
    setLoading(isLoading);
  }, [isLoading, isPublicPath, setLoading, currentUser]);

  // 引入 useConfigStore
  const fetchConfigs = useConfigStore((s) => s.fetchConfigs);
  const getConfig = useConfigStore((s) => s.getConfig);
  /** 拆出具体项作依赖，避免 fetchConfigs 更新后定时器仍闭包旧阈值 */
  const tokenCheckIntervalSec = useConfigStore((s) => s.configs['security.token_check_interval']);
  const inactivityTimeoutSec = useConfigStore((s) => s.configs['security.inactivity_timeout']);
  const tenantId = getTenantId();
  /** 记录上次已拉取站点配置的租户：切换租户时必须 fetchConfigs(true)，避免 initialized 短路沿用上一租户内存 */
  const lastSiteSettingTenantRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (!currentUser || !tenantId || isPublicPath) return;
    const prev = lastSiteSettingTenantRef.current;
    const tenantChanged = prev !== tenantId;
    lastSiteSettingTenantRef.current = tenantId;
    fetchConfigs(tenantChanged);
  }, [currentUser, tenantId, isPublicPath, fetchConfigs]);

  // 监听用户活动；API 请求由 api.ts 在请求结束（含失败）时强制刷新活动时间
  useEffect(() => {
    if (isPublicPath) return;

    // 进入受保护页面时重置活动时间（清除可能来自上一会话的旧数据）
    updateLastActivity(true);

    const onActivity = () => updateLastActivity();
    const onVisible = () => {
      if (document.visibilityState === 'visible') updateLastActivity(true);
    };

    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('click', onActivity);
    window.addEventListener('scroll', onActivity, { passive: true });
    window.addEventListener('wheel', onActivity, { passive: true });
    window.addEventListener('touchstart', onActivity);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('scroll', onActivity);
      window.removeEventListener('wheel', onActivity);
      window.removeEventListener('touchstart', onActivity);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isPublicPath]);

  // TOKEN 过期与不活动检测
  React.useEffect(() => {
    // 如果是公开页面，不需要检测
    if (isPublicPath) {
      return;
    }

    const token = getToken();
    if (!token) {
      return;
    }

    const parseCheckIntervalMs = (raw: unknown): number => {
      const n = Number(raw);
      const sec = !Number.isFinite(n) ? 60 : Math.max(5, Math.min(3600, n));
      return sec * 1000;
    };
    const parseInactivityMs = (raw: unknown): number => {
      const n = Number(raw);
      if (raw === 0 || n === 0) return 0;
      if (!Number.isFinite(n) || n < 0) return 1800 * 1000;
      return n * 1000;
    };

    const checkInterval = parseCheckIntervalMs(
      tokenCheckIntervalSec !== undefined ? tokenCheckIntervalSec : getConfig('security.token_check_interval', 60),
    );
    const inactivityTimeout = parseInactivityMs(
      inactivityTimeoutSec !== undefined ? inactivityTimeoutSec : getConfig('security.inactivity_timeout', 1800),
    );

    const proactiveRefreshMs = 5 * 60 * 1000;

    // 定时器 ref 需在 handleLogout 之前声明，避免 handleLogout 被首次检查调用时访问未初始化变量
    const checkTimerRef = { current: null as NodeJS.Timeout | null };

    // 检查 TOKEN：先主动续期（临近过期），已过期则尝试静默刷新（与后端 grace 对齐），失败再登出
    const checkAuthStatus = async (): Promise<boolean> => {
      const currentToken = getToken();
      if (!currentToken) {
        return false;
      }

      const remaining = getTokenRemainingTime(currentToken);
      if (remaining > 0 && remaining < proactiveRefreshMs) {
        await refreshAccessTokenSilently();
      }

      const tokenAfterProactive = getToken() || currentToken;
      if (isTokenExpired(tokenAfterProactive)) {
        const ok = await refreshAccessTokenSilently();
        if (!ok) {
          console.warn('⚠️ TOKEN 已过期且无法续期，清除认证信息并跳转到登录页');
          handleLogout();
          return false;
        }
      }

      if (inactivityTimeout > 0) {
        if (hasPendingRequests()) {
          return true;
        }
        const lastActivityTime = getLastActivityTime();
        const inactiveTime = Date.now() - lastActivityTime;
        if (inactiveTime > inactivityTimeout) {
          console.warn(`⚠️ 用户已不活动 ${inactiveTime / 1000} 秒，超过阈值 ${inactivityTimeout / 1000} 秒，自动退出`);
          message.warning(t('common.autoLogoutInactivity'));
          handleLogout();
          return false;
        }
      }

      return true;
    };

    // 统一处理退出逻辑
    const handleLogout = () => {
      clearAuth();
      setCurrentUser(undefined);
      
      // 清除定时器
      if (checkTimerRef.current) {
        clearInterval(checkTimerRef.current);
      }

      // SPA 内部跳转登录页（避免 dev 下全页 /login → login.html MPA 缺 Provider 白屏）
      if (location.pathname.startsWith('/infra')) {
        navigate('/infra/login', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    };

    let cancelled = false;

    const onTokenVisibility = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }
      void (async () => {
        if (cancelled) {
          return;
        }
        // 回到前台时立即执行一次完整检查（含 inactivity、token 续期等）
        const stillOk = await checkAuthStatus();
        if (!stillOk && checkTimerRef.current) {
          clearInterval(checkTimerRef.current);
          checkTimerRef.current = null;
        }
      })();
    };
    document.addEventListener('visibilitychange', onTokenVisibility);

    void (async () => {
      const ok = await checkAuthStatus();
      if (cancelled || !ok) {
        return;
      }
      checkTimerRef.current = setInterval(() => {
        // Tab 隐藏时不轮询，由 visibilitychange 负责在回到前台时检查
        if (document.visibilityState === 'hidden') return;

        void (async () => {
          const stillOk = await checkAuthStatus();
          if (!stillOk && checkTimerRef.current) {
            clearInterval(checkTimerRef.current);
            checkTimerRef.current = null;
          }
        })();
      }, checkInterval);
    })();

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onTokenVisibility);
      if (checkTimerRef.current) {
        window.clearInterval(checkTimerRef.current);
        checkTimerRef.current = null;
      }
    };
  }, [
    isPublicPath,
    location.pathname,
    setCurrentUser,
    getConfig,
    t,
    tokenCheckIntervalSec,
    inactivityTimeoutSec,
    navigate,
  ]);

  // 检查是否有 token（这是判断是否登录的唯一标准）
  const token = getToken();
  const hasToken = !!token;

  // 使用 useMemo 稳定重定向逻辑，避免无限循环
  const redirectTarget = useMemo(() => {
    // ⚠️ 核心逻辑：只有真正已登录（有 token 且 currentUser 存在）时才重定向
    // 如果只有 token 但没有 currentUser，说明可能还在加载中，不重定向
    const isAuthenticated = hasToken && currentUser;

    // 如果是公开页面且已登录，重定向到对应的仪表盘
    if (isPublicPath && isAuthenticated) {
      // 平台超管登录后，如果访问的是登录页，重定向到平台运营看板
      if (isInfraLoginPage && currentUser.is_infra_admin) {
        return '/infra/operation';
      }
      // 普通用户已登录仍访问登录页：立刻落本地默认首页（与 Git 原逻辑一致，不等待 effective-home）
      if (location.pathname === '/login' && !currentUser.is_infra_admin) {
        return getDefaultTenantHomePath();
      }
    }

    // ⚠️ 核心逻辑：只有没有 token 时才跳转到登录页
    // 有 token = 已登录，允许访问所有页面（包括功能菜单）
    if (!isPublicPath && !hasToken) {
      // 平台级路由重定向到平台登录页
      if (location.pathname.startsWith('/infra')) {
        return '/infra/login';
      }
      if (tenantDomainFromPath) {
        return `/login?tenant_domain=${encodeURIComponent(tenantDomainFromPath)}`;
      }
      // 系统级路由重定向到用户登录页
      return '/login';
    }

    return null;
  }, [isPublicPath, currentUser, isInfraLoginPage, location.pathname, hasToken, tenantDomainFromPath]);

  // ⚠️ 关键修复：公开页面且无 token 时，直接渲染，跳过 loading/redirect，避免登录页循环加载
  if (isPublicPath && !hasToken) {
    return <>{children}</>;
  }

  const shouldBypassAuth = isMasterDataPath || isDebugPath;
  const hasAuthenticatedUser = currentUser || buildRestoredUserFromStorage();
  const shouldShowLoading =
    hasToken && !isPublicPath && !hasAuthenticatedUser && (loading || isLoading);
  const shouldRedirect = redirectTarget !== null;

  if (shouldBypassAuth) {
    return <>{children}</>;
  }

  if (shouldRedirect) {
    return <Navigate to={redirectTarget} replace />;
  }

  if (shouldShowLoading) {
    return <DelayedFallback delayMs={0} fullHeight />;
  }

  return (
    <Suspense fallback={<DelayedFallback variant="content" delayMs={200} />}>
      {children}
    </Suspense>
  );
});

/**
 * 延迟加载的 Spin / Lottie 包装器（fullHeight 为全屏 Lottie）
 * 针对首屏和应用切入点优化
 */

export default AuthGuard;
export { DelayedFallback };
