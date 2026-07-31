import React from 'react';
import { Button, Tooltip, Space } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import type { NavigateFunction } from 'react-router-dom';
import type { MenuProps } from 'antd';
import TenantSelector from '../../components/tenant-selector';
import { NotificationDropdown } from './NotificationDropdown';
import { UserAvatarDropdown } from './UserAvatarDropdown';

export interface LayoutHeaderActionsProps {
  isMobileOrTablet: boolean;
  isLightModeLightBg: boolean;
  token: any;
  t: (key: string, options?: any) => any;
  navigate: NavigateFunction;
  // messages
  messageDropdownOpen: boolean;
  setMessageDropdownOpen: (open: boolean) => void;
  recentMessages: any;
  recentMessagesLoading: boolean;
  unreadCount: number;
  refetchRecentMessages: () => void;
  refetchMessageStats: () => void;
  // theme
  onThemeChange: () => void;
  // user
  currentUser: any;
  avatarUrl?: string;
  headerTextAvatar: boolean;
  setAvatarImageFailed: (failed: boolean) => void;
  getUserMenuItems: (t: any) => MenuProps['items'];
  handleUserMenuClick: MenuProps['onClick'];
}

/** 顶栏右侧 actionsRender */
export const LayoutHeaderActions: React.FC<LayoutHeaderActionsProps> = ({
  isMobileOrTablet,
  isLightModeLightBg,
  token,
  t,
  navigate,
  messageDropdownOpen,
  setMessageDropdownOpen,
  recentMessages,
  recentMessagesLoading,
  unreadCount,
  refetchRecentMessages,
  refetchMessageStats,
  onThemeChange,
  currentUser,
  avatarUrl,
  headerTextAvatar,
  setAvatarImageFailed,
  getUserMenuItems,
  handleUserMenuClick,
}) => {
  const actions: React.ReactNode[] = [];

  // if (!isMobileOrTablet && hasAiAssistantEntry) {
  // // AI 助手入口：仅 Lottie 图标 48x48，无文字、无背景、无动效
  // actions.push(
  //   <Tooltip key="aiAssistant" title={t('ui.aiAssistant.tooltip')}>
  //   <span className="ai-assistant-lottie-btn-wrapper">
  //     <span
  //       role="button"
  //       tabIndex={0}
  //       onClick={() => setAiAssistantOpen(true)}
  //       onKeyDown={(e) => e.key === 'Enter' && setAiAssistantOpen(true)}
  //       className="ai-assistant-lottie-btn"
  //     >
  //       <Lottie ... />
  //     </span>
  //   </span>
  //   </Tooltip>
  // );
  // }

  // 上线向导：工作台欢迎条右侧展示；其他页面保留顶栏入口
  // if (launchWizardEnabled && location.pathname !== '/system/dashboard/workplace') {
  //   actions.push(
  //     <OnboardingWizardEntry ... />,
  //   );
  // }

  // 租户可下载客户端（扫码安装）- 置于消息铃铛前
  // actions.push(<HeaderClientDownloadButton key="client-download" />);

  // 消息提醒（带数量徽标）- 平板/手机也显示
  actions.push(
    <NotificationDropdown
      key="notifications"
      open={messageDropdownOpen}
      onOpenChange={setMessageDropdownOpen}
      recentMessages={recentMessages}
      loading={recentMessagesLoading}
      unreadCount={unreadCount}
      refetchRecentMessages={refetchRecentMessages}
      refetchMessageStats={refetchMessageStats}
      token={token}
      t={t}
      navigate={navigate}
    />,
  );

  if (!isMobileOrTablet) {
    // 语言切换下拉菜单（保留注释块语义，逻辑仍在主文件历史注释中）

    // 颜色配置
    actions.push(
      <Tooltip key="theme" title={t('ui.theme.color')}>
        <Button
          type="text"
          size="small"
          icon={<BgColorsOutlined />}
          onClick={onThemeChange}
        />
      </Tooltip>,
    );

    // 租户切换选择框 - 优化样式，不显示图标（仅桌面）
    if (currentUser) {
      actions.push(
        <div
          key="tenant"
          className="tenant-selector-wrapper"
          data-header-light-text={!isLightModeLightBg}
          style={{
            display: 'flex',
            alignItems: 'center',
            // borderRadius: '16px'
          }}
        >
          <TenantSelector headerLightText={!isLightModeLightBg} />
        </div>,
      );
    }
  }

  // 用户头像和下拉菜单 - 平板/手机也显示
  if (currentUser) {
    actions.push(
      <UserAvatarDropdown
        key="user"
        currentUser={currentUser}
        avatarUrl={avatarUrl}
        headerTextAvatar={headerTextAvatar}
        setAvatarImageFailed={setAvatarImageFailed}
        isLightModeLightBg={isLightModeLightBg}
        token={token}
        getUserMenuItems={getUserMenuItems}
        handleUserMenuClick={handleUserMenuClick}
        t={t}
      />,
    );
  }

  // 锁定屏幕按钮 - 移到最后一个防止误点
  // actions.push(...);

  return <Space size={8} align="center" style={{ flexShrink: 0 }}>{actions}</Space>;
};

export default LayoutHeaderActions;
