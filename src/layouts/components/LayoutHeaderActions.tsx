import React, { useCallback } from 'react'
import { Button, Dropdown, Tooltip, Space, message } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import type { NavigateFunction } from 'react-router-dom'
import type { MenuProps } from 'antd'
import TenantSelector from '../../components/tenant-selector'
import { HeaderQuickEntryPopover } from '../../components/quick-entry'
import { useThemeStore } from '../../stores/themeStore'
import { NotificationDropdown } from './NotificationDropdown'
import { UserAvatarDropdown } from './UserAvatarDropdown'
import MobilePopover from './MobilePopover'

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
  onLockScreen: () => void
  // theme
  onThemeChange: () => void
  languageMenuItems: MenuProps['items']

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
  onLockScreen,
  onThemeChange,
  languageMenuItems,
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
    <Tooltip key="back-to-coc" title={t('ui.coc')}>
      <Button
        type="text"
        size="small"
        className="px-5! rounded-[22px]! w-auto!  max-w-none! "
        onClick={() => navigate('/')}
        aria-label={t('ui.coc')}
      >
        {t('ui.coc')}
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

  // 移动端
  actions.push(<MobilePopover />)

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

  if (!isMobileOrTablet) {
    // 完整配色 / 主题编辑入口（桌面端）
    actions.push(
      <Tooltip key="theme" title={t('ui.theme.color')}>
        <Button
          type="text"
          size="small"
          // icon={<BgColorsOutlined />}
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 3.5C14.067 3.5 17.5 6.34062 17.5 10C17.5 13.6594 14.067 16.5 10 16.5C9.51935 16.5 9.04877 16.461 8.59277 16.3857C8.01009 16.2895 7.64499 15.8885 7.44043 15.4609C7.23969 15.0413 7.16699 14.5506 7.16699 14.125C7.16699 12.9684 6.18893 12 4.94434 12C4.47568 12 3.92631 11.9246 3.4668 11.7051C2.99565 11.4799 2.56228 11.0678 2.51465 10.4072C2.50498 10.2727 2.5 10.1366 2.5 10C2.5 6.34062 5.93295 3.5 10 3.5ZM10 4.5C6.33506 4.5 3.5 7.03197 3.5 10C3.5 10.1125 3.50377 10.2242 3.51172 10.335C3.52518 10.5224 3.63208 10.6755 3.89844 10.8027C4.17655 10.9355 4.56258 11 4.94434 11C6.70662 11 8.16699 12.3821 8.16699 14.125C8.16699 14.4539 8.22586 14.7849 8.34277 15.0293C8.45594 15.2658 8.59412 15.3717 8.75586 15.3984C9.15822 15.4648 9.57408 15.5 10 15.5C13.6649 15.5 16.5 12.968 16.5 10C16.5 7.03197 13.6649 4.5 10 4.5ZM13 10.5C13.8284 10.5 14.5 11.1716 14.5 12C14.5 12.8284 13.8284 13.5 13 13.5C12.1716 13.5 11.5 12.8284 11.5 12C11.5 11.1716 12.1716 10.5 13 10.5ZM13 11.5C12.7239 11.5 12.5 11.7239 12.5 12C12.5 12.2761 12.7239 12.5 13 12.5C13.2761 12.5 13.5 12.2761 13.5 12C13.5 11.7239 13.2761 11.5 13 11.5ZM12 6.5C12.8284 6.5 13.5 7.17157 13.5 8C13.5 8.82843 12.8284 9.5 12 9.5C11.1716 9.5 10.5 8.82843 10.5 8C10.5 7.17157 11.1716 6.5 12 6.5ZM8 5.5C8.82843 5.5 9.5 6.17157 9.5 7C9.5 7.82843 8.82843 8.5 8 8.5C7.17157 8.5 6.5 7.82843 6.5 7C6.5 6.17157 7.17157 5.5 8 5.5ZM12 7.5C11.7239 7.5 11.5 7.72386 11.5 8C11.5 8.27614 11.7239 8.5 12 8.5C12.2761 8.5 12.5 8.27614 12.5 8C12.5 7.72386 12.2761 7.5 12 7.5ZM8 6.5C7.72386 6.5 7.5 6.72386 7.5 7C7.5 7.27614 7.72386 7.5 8 7.5C8.27614 7.5 8.5 7.27614 8.5 7C8.5 6.72386 8.27614 6.5 8 6.5Z"
                fill="var(--ant-color-text)"
              />
            </svg>
          }
          onClick={onThemeChange}
        />
      </Tooltip>
    )

    actions.push(
      <Dropdown
        key="language"
        menu={{ items: languageMenuItems }}
        trigger={['hover']}
        placement="bottomRight"
      >
        <Tooltip title={t('pages.personal.preferences.language')}>
          <Button
            type="text"
            size="small"
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 3.5C13.5899 3.5 16.5 6.41015 16.5 10C16.5 13.5899 13.5899 16.5 10 16.5C6.41015 16.5 3.5 13.5899 3.5 10C3.5 6.41015 6.41015 3.5 10 3.5ZM8.50781 10.5C8.54789 11.9146 8.75529 13.1692 9.06055 14.085C9.23173 14.5984 9.42443 14.9778 9.61426 15.2188C9.80862 15.4654 9.94272 15.5 10 15.5C10.0573 15.5 10.1914 15.4654 10.3857 15.2188C10.5756 14.9778 10.7683 14.5984 10.9395 14.085C11.2447 13.1692 11.4521 11.9146 11.4922 10.5H8.50781ZM4.52344 10.5C4.72963 12.7876 6.33608 14.6696 8.47949 15.2852C8.34164 15.0202 8.21854 14.722 8.11133 14.4004C7.7663 13.3652 7.54893 12 7.50879 10.5H4.52344ZM12.4912 10.5C12.4511 12 12.2337 13.3652 11.8887 14.4004C11.7814 14.7222 11.6575 15.0201 11.5195 15.2852C13.6634 14.6699 15.2703 12.788 15.4766 10.5H12.4912ZM8.47949 4.71387C6.33595 5.32931 4.72963 7.21227 4.52344 9.5H7.50879C7.54893 8.00002 7.7663 6.63485 8.11133 5.59961C8.21864 5.27767 8.34147 4.97897 8.47949 4.71387ZM10 4.5C9.94272 4.5 9.80862 4.53462 9.61426 4.78125C9.42443 5.02217 9.23173 5.40162 9.06055 5.91504C8.75529 6.83081 8.54789 8.0854 8.50781 9.5H11.4922C11.4521 8.0854 11.2447 6.83081 10.9395 5.91504C10.7683 5.40162 10.5756 5.02217 10.3857 4.78125C10.1914 4.53462 10.0573 4.5 10 4.5ZM11.5195 4.71387C11.6576 4.97907 11.7813 5.27751 11.8887 5.59961C12.2337 6.63485 12.4511 8.00002 12.4912 9.5H15.4766C15.2703 7.21194 13.6635 5.32904 11.5195 4.71387Z"
                  fill="var(--ant-color-text)"
                />
              </svg>
            }
            aria-label={t('pages.personal.preferences.language')}
          />
        </Tooltip>
      </Dropdown>
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

    // 锁定屏幕
    actions.push(
      <Tooltip key="lock-screen" title={t('ui.lock.screen')}>
        <Button
          type="text"
          size="small"
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 3.5C11.3807 3.5 12.5 4.61929 12.5 6V7.5H13C14.3807 7.5 15.5 8.61929 15.5 10V14C15.5 15.3807 14.3807 16.5 13 16.5H7C5.61929 16.5 4.5 15.3807 4.5 14V10C4.5 8.61929 5.61929 7.5 7 7.5H7.5V6C7.5 4.61929 8.61929 3.5 10 3.5ZM7 8.5C6.17157 8.5 5.5 9.17157 5.5 10V14C5.5 14.8284 6.17157 15.5 7 15.5H13C13.8284 15.5 14.5 14.8284 14.5 14V10C14.5 9.17157 13.8284 8.5 13 8.5H7ZM10 4.5C9.17157 4.5 8.5 5.17157 8.5 6V7.5H11.5V6C11.5 5.17157 10.8284 4.5 10 4.5Z"
                fill="var(--ant-color-text)"
                // fillOpacity="0.88"
              />
            </svg>
          }
          onClick={onLockScreen}
          aria-label={t('ui.lock.screen')}
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
