import React from 'react';
import { useNavigate } from 'react-router-dom';
import { App as AntdApp, Spin } from 'antd';
import { setNavigateRef } from '../utils/navigation';
import { getPlatformSettingsPublic } from '../services/platformSettings';
import { applyFavicon } from '../utils/favicon';
import { GLOBAL_SPIN_INDICATOR } from '../initSpinIndicator';
import AuthGuard from './auth-guard';
import ErrorBoundary from './error-boundary';
import MainRoutes from '../routes';

/**
 * ⚠️ 关键：必须定义在 App 函数外部（模块级别）
 * 若定义在 App 内部，每次 App 重渲染时 React 会认为这是一个全新的组件类型，
 * 导致整个子树卸载并重挂载，引发无限循环。
 */
/** 主题与语言就绪前的全屏 Spin，避免英文界面先渲染中文文案 */
export const AppShellLoading: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? '#141414' : '#f5f5f5',
    }}
  >
    <Spin indicator={GLOBAL_SPIN_INDICATOR} size="large" />
  </div>
);

export const AppContent: React.FC<{ touchScreen: any }> = ({ touchScreen }) => {
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();

  // 将 message 实例设置到全局，供工具函数使用
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__ANTD_MESSAGE__ = message;
    }
  }, [message]);

  // 将 navigate 注入到全局，供 QuickNavigation 等工具在非组件上下文中使用
  React.useEffect(() => {
    setNavigateRef(navigate as any);
  }, [navigate]);

  // 应用触屏模式样式类
  React.useEffect(() => {
    const rootElement = document.documentElement;
    if (touchScreen.isTouchScreenMode) {
      rootElement.classList.add('touchscreen-mode');
    } else {
      rootElement.classList.remove('touchscreen-mode');
    }
  }, [touchScreen.isTouchScreenMode]);

  // 应用平台 Favicon（从平台设置加载）
  React.useEffect(() => {
    getPlatformSettingsPublic()
      .then((settings) => applyFavicon(settings?.favicon))
      .catch(() => applyFavicon(undefined));
  }, []);

  const routesElement = React.useMemo(() => <MainRoutes />, []);
  return (
    <ErrorBoundary>
      <AuthGuard>
        {routesElement}
      </AuthGuard>
    </ErrorBoundary>
  );
};
