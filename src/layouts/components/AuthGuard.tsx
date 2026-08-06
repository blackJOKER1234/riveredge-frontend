import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PageLoadingFullscreen } from '../../components/page-loading-lottie';
import { getCurrentUser } from '../../services/auth';
import { getCurrentInfraSuperAdmin } from '../../services/infraAdmin';
import { getToken, clearAuth, getUserInfo, getTenantId, isInfraSuperAdminUser, isInfraSuperAdminFromToken } from '../../utils/auth';
import { useGlobalStore } from '../../stores';
import { useConfigStore, getDefaultTenantHomePath } from '../../stores/configStore';
import { useSafeTranslation } from '../utils/safeTranslation';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const currentUser = useGlobalStore((s) => s.currentUser);
  const loading = useGlobalStore((s) => s.loading);
  const setCurrentUser = useGlobalStore((s) => s.setCurrentUser);
  const setLoading = useGlobalStore((s) => s.setLoading);
  const { t } = useSafeTranslation(); // 使用安全的翻译 hook

  // 检查用户类型（平台超级管理员还是系统级用户）
  const userInfo = getUserInfo();
  const isInfraSuperAdmin = isInfraSuperAdminUser(userInfo) || isInfraSuperAdminFromToken();

  // 获取组织 ID
  const currentTenantId = getTenantId();


  // 如果 currentUser 已存在且信息完整，不需要重新获取
  // 只有在以下情况才需要获取用户信息：
  // 1. 有 token 但没有 currentUser
  // 注意：避免在 currentUser 已存在时重复获取，防止无限循环
  // 租户用户由 App AuthGuard 定期拉取 /auth/me；此处仅平台超管在无 currentUser 时补拉
  const shouldFetchUser = !!getToken() && !currentUser && isInfraSuperAdmin;

  // 根据用户类型调用不同的接口
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['currentUser', isInfraSuperAdmin],
    queryFn: async () => {
      // 优先使用 userInfo 判断用户类型
      const shouldUsePlatformAPI = isInfraSuperAdmin;

      if (shouldUsePlatformAPI) {
        // 平台超级管理员：调用平台接口
        const infraUser = await getCurrentInfraSuperAdmin();
        const tenantId = getTenantId();
        return {
          id: infraUser.id,
          username: infraUser.username,
          email: infraUser.email,
          full_name: infraUser.full_name,
          is_infra_admin: true,
          is_tenant_admin: false,
          tenant_id: tenantId ?? undefined,
          user_type: 'infra_superadmin' as const,
        };
      } else {
        // 系统级用户：调用系统接口
        return await getCurrentUser();
      }
    },
    enabled: shouldFetchUser,
    retry: false,
    staleTime: useConfigStore.getState().getConfig('security.user_cache_time', 300) * 1000, // 使用配置缓存时间
  });

  // 处理查询错误
  useEffect(() => {
    if (error && getToken()) {
      const savedUserInfo = getUserInfo();
      if (savedUserInfo) {
        // 从 localStorage 恢复用户信息
        const restoredUser = {
          id: savedUserInfo.id || 1,
          username: savedUserInfo.username || 'admin',
          email: savedUserInfo.email,
          full_name: savedUserInfo.full_name,
          is_infra_admin: isInfraSuperAdminUser(savedUserInfo) || savedUserInfo.is_infra_admin || false,
          is_tenant_admin: savedUserInfo.is_tenant_admin || false,
          tenant_id: savedUserInfo.tenant_id,
          tenant_name: savedUserInfo.tenant_name,
          permissions: Array.isArray(savedUserInfo.permissions) ? savedUserInfo.permissions : [],
          permission_version: savedUserInfo.permission_version || 1,
          department: savedUserInfo.department,
          position: savedUserInfo.position,
          roles: Array.isArray(savedUserInfo.roles) ? savedUserInfo.roles : [],
        };
        setCurrentUser(restoredUser);

        // 如果是平台超级管理员，但后端接口失败，记录警告但不阻止访问
        if (isInfraSuperAdminUser(savedUserInfo)) {
          console.warn('⚠️ 获取平台超级管理员信息失败，使用本地缓存:', error);
        } else {
          console.warn('⚠️ 获取用户信息失败，使用本地缓存:', error);
        }
      } else {
        // 没有本地缓存时，如果是401错误且不在应用页面，则清理认证信息
        // 在应用页面时不清除认证信息，避免跳转
        const isInApp = window.location.pathname.startsWith('/apps/');
        if ((error as any)?.response?.status === 401 && !isInApp) {
          console.error('❌ 认证已过期，请重新登录:', error);
          clearAuth();
          setCurrentUser(undefined);
        } else if ((error as any)?.response?.status === 401 && isInApp) {
          console.warn('⚠️ 应用页面用户信息获取失败（401），跳过清除认证信息:', error);
        } else {
          console.warn('⚠️ 获取用户信息失败，但保留当前状态，允许继续访问:', error);
        }
      }
    } else if (!getToken()) {
      // 没有 token，清理认证信息
      clearAuth();
      setCurrentUser(undefined);
    }
  }, [error, setCurrentUser]);

  // 处理成功获取用户数据
  useEffect(() => {
    if (userData) {
      setCurrentUser(userData);
    }
  }, [userData, setCurrentUser]);

  const publicPaths = ['/login', '/debug/'];
  const isInfraLoginPage = location.pathname === '/infra/login';
  const isSharedReportOrDashboard =
    location.pathname === '/apps/kuaireport/dashboards/shared' ||
    location.pathname === '/apps/kuaireport/reports/shared';
  const isPublicPath =
    publicPaths.some((path) => location.pathname.startsWith(path)) ||
    isInfraLoginPage ||
    isSharedReportOrDashboard;

  React.useEffect(() => {
    if (isPublicPath) {
      setLoading(false);
      return;
    }
    if (currentUser && isLoading) {
      return;
    }
    setLoading(isLoading);
  }, [isLoading, isPublicPath, setLoading, currentUser]);

  const renderAuthLoading = () => <PageLoadingFullscreen />;

  // ⚠️ 关键修复：如果是平台超级管理员访问系统级页面，但没有选择组织，则重定向到平台首页
  // 必须放在所有 Hook 之后，避免 Hook 顺序问题
  const isSystemPage = location.pathname.startsWith('/system/');
  if (isInfraSuperAdmin && isSystemPage && !currentTenantId) {
    message.warning(t('common.selectOrganizationFirst', { defaultValue: '请先选择要管理的组织' }));
    return <Navigate to="/infra/login" replace />;
  }

  // ⚠️ 关键修复：如果是调试页面，直接渲染内容，不受加载状态影响
  if (location.pathname.startsWith('/debug/')) {
    return <>{children}</>;
  }

  // 如果正在加载，显示全屏 Lottie（与 App AuthGuard 一致，避免 Spin 叠 Lottie）
  if (!currentUser && (loading || isLoading)) {
    return renderAuthLoading();
  }

  // 有 token 但 currentUser 尚未就绪（仅平台超管补拉 /auth/me）
  if (getToken() && !currentUser && shouldFetchUser) {
    return renderAuthLoading();
  }

  // 如果是公开页面且已登录，根据用户类型重定向
  if (isPublicPath && currentUser) {
    // 平台超管登录后，如果访问的是登录页，重定向到平台运营看板
    if (isInfraLoginPage && currentUser.is_infra_admin) {
      return <Navigate to="/infra/operation" replace />;
    }
    // 普通用户登录后，如果访问的是登录页，立刻跳到本地默认首页
    if (location.pathname === '/login' && !currentUser.is_infra_admin) {
      return <Navigate to={getDefaultTenantHomePath()} replace />;
    }
  }

  // 如果不是公开页面且未登录，自动重定向到登录页（SPA 内部跳转，避免 dev 下 /login MPA 缺 Provider 白屏）
  if (!isPublicPath && !currentUser && !getToken()) {
    if (location.pathname.startsWith('/infra')) {
      return <Navigate to="/infra/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


export default AuthGuard;
