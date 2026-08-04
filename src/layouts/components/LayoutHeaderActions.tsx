import React, { useCallback } from 'react'
import { Button, Tooltip, Space, message } from 'antd'
import { BgColorsOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import type { NavigateFunction } from 'react-router-dom'
import type { MenuProps } from 'antd'
import TenantSelector from '../../components/tenant-selector'
import { HeaderQuickEntryPopover } from '../../components/quick-entry'
import { useThemeStore } from '../../stores/themeStore'
import { NotificationDropdown } from './NotificationDropdown'
import { UserAvatarDropdown } from './UserAvatarDropdown'

export interface LayoutHeaderActionsProps {
  isMobileOrTablet: boolean
  isLightModeLightBg: boolean
  token: any
  t: (key: string, options?: any) => any
  navigate: NavigateFunction
  // messages
  messageDropdownOpen: boolean
  setMessageDropdownOpen: (open: boolean) => void
  recentMessages: any
  recentMessagesLoading: boolean
  unreadCount: number
  refetchRecentMessages: () => void
  refetchMessageStats: () => void
  // theme
  onThemeChange: () => void
  // fullscreen
  isFullscreen: boolean
  onToggleFullscreen: () => void
  // user
  currentUser: any
  avatarUrl?: string
  headerTextAvatar: boolean
  setAvatarImageFailed: (failed: boolean) => void
  getUserMenuItems: (t: any) => MenuProps['items']
  handleUserMenuClick: MenuProps['onClick']
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
  const isDarkMode = useThemeStore(s => s.resolved.isDark)
  const applyTheme = useThemeStore(s => s.applyTheme)

  const handleToggleTheme = useCallback(() => {
    try {
      applyTheme(isDarkMode ? 'light' : 'dark', undefined, { persist: true })
      message.success(t('components.themeEditor.message.colorModeSwitched'))
    } catch (error: any) {
      message.error(error?.message || t('components.themeEditor.message.switchFailed'))
    }
  }, [applyTheme, isDarkMode, t])

  const actions: React.ReactNode[] = []

  // COC
  actions.push(
    <Tooltip title={t('ui.coc')}>
      <Button type="text" size="small" onClick={() => {}}>
        ⬅️
      </Button>
    </Tooltip>
  )

  // 快捷入口（按钮样式与右侧其他 icon 按钮保持一致）
  actions.push(
    <HeaderQuickEntryPopover
      key="quick-entry"
      isLightModeLightBg={isLightModeLightBg}
      variant="icon-button"
      placement="bottomRight"
    />
  )

  // 暗色/亮色主题切换（位于通知铃铛前）
  actions.push(
    <Tooltip
      key="theme-toggle"
      title={isDarkMode ? t('ui.theme.toggleToLight') : t('ui.theme.toggleToDark')}
    >
      <Button
        type="text"
        size="small"
        icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
        onClick={handleToggleTheme}
        aria-label={isDarkMode ? t('ui.theme.toggleToLight') : t('ui.theme.toggleToDark')}
      />
    </Tooltip>
  )

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
    />
  )

  if (!isMobileOrTablet) {
    // 完整配色 / 主题编辑入口（桌面端）
    actions.push(
      <Tooltip key="theme" title={t('ui.theme.color')}>
        <Button
          type="text"
          size="small"
          icon={<BgColorsOutlined />}
          // icon={
          //   <svg
          //     width="20"
          //     height="20"
          //     viewBox="0 0 20 20"
          //     fill="none"
          //     xmlns="http://www.w3.org/2000/svg"
          //   >
          //     <path
          //       d="M10 3.5C14.067 3.5 17.5 6.34062 17.5 10C17.5 13.6594 14.067 16.5 10 16.5C9.51935 16.5 9.04877 16.461 8.59277 16.3857C8.01009 16.2895 7.64499 15.8885 7.44043 15.4609C7.23969 15.0413 7.16699 14.5506 7.16699 14.125C7.16699 12.9684 6.18893 12 4.94434 12C4.47568 12 3.92631 11.9246 3.4668 11.7051C2.99565 11.4799 2.56228 11.0678 2.51465 10.4072C2.50498 10.2727 2.5 10.1366 2.5 10C2.5 6.34062 5.93295 3.5 10 3.5ZM10 4.5C6.33506 4.5 3.5 7.03197 3.5 10C3.5 10.1125 3.50377 10.2242 3.51172 10.335C3.52518 10.5224 3.63208 10.6755 3.89844 10.8027C4.17655 10.9355 4.56258 11 4.94434 11C6.70662 11 8.16699 12.3821 8.16699 14.125C8.16699 14.4539 8.22586 14.7849 8.34277 15.0293C8.45594 15.2658 8.59412 15.3717 8.75586 15.3984C9.15822 15.4648 9.57408 15.5 10 15.5C13.6649 15.5 16.5 12.968 16.5 10C16.5 7.03197 13.6649 4.5 10 4.5ZM13 10.5C13.8284 10.5 14.5 11.1716 14.5 12C14.5 12.8284 13.8284 13.5 13 13.5C12.1716 13.5 11.5 12.8284 11.5 12C11.5 11.1716 12.1716 10.5 13 10.5ZM13 11.5C12.7239 11.5 12.5 11.7239 12.5 12C12.5 12.2761 12.7239 12.5 13 12.5C13.2761 12.5 13.5 12.2761 13.5 12C13.5 11.7239 13.2761 11.5 13 11.5ZM12 6.5C12.8284 6.5 13.5 7.17157 13.5 8C13.5 8.82843 12.8284 9.5 12 9.5C11.1716 9.5 10.5 8.82843 10.5 8C10.5 7.17157 11.1716 6.5 12 6.5ZM8 5.5C8.82843 5.5 9.5 6.17157 9.5 7C9.5 7.82843 8.82843 8.5 8 8.5C7.17157 8.5 6.5 7.82843 6.5 7C6.5 6.17157 7.17157 5.5 8 5.5ZM12 7.5C11.7239 7.5 11.5 7.72386 11.5 8C11.5 8.27614 11.7239 8.5 12 8.5C12.2761 8.5 12.5 8.27614 12.5 8C12.5 7.72386 12.2761 7.5 12 7.5ZM8 6.5C7.72386 6.5 7.5 6.72386 7.5 7C7.5 7.27614 7.72386 7.5 8 7.5C8.27614 7.5 8.5 7.27614 8.5 7C8.5 6.72386 8.27614 6.5 8 6.5Z"
          //       fill="#1D1D1E"
          //     />
          //   </svg>
          // }
          onClick={onThemeChange}
        />
      </Tooltip>
    )

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
          }}
        >
          <TenantSelector headerLightText={!isLightModeLightBg} />
        </div>
      )
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
      />
    )
  }

  return (
    <Space size={8} align="center" style={{ flexShrink: 0 }}>
      {actions}
    </Space>
  )
}

export default LayoutHeaderActions
