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
        <Button type="text" size="small" icon={<BgColorsOutlined />} onClick={onThemeChange} />
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
