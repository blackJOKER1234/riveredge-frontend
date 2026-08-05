/**
 * RiverEdge SaaS - UniTabs 标签栏头部
 */

import {
  CaretLeftFilled,
  CaretRightFilled,
  FullscreenOutlined,
  FullscreenExitOutlined,
  MenuOutlined,
  PushpinFilled,
} from '@ant-design/icons'
import { Button, Dropdown, Menu, Popover, Tabs, Tooltip, type MenuProps } from 'antd'
import type { MenuDataItem } from '@ant-design/pro-components'
import type { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TabItem } from './types'

interface TabHeaderProps {
  tabs: TabItem[]
  activeKey: string
  tenantHomePath: string
  menuConfig: MenuDataItem[]
  isFullscreen: boolean
  onToggleFullscreen?: () => void
  tabsNavRef: RefObject<HTMLDivElement>
  canScrollLeft: boolean
  canScrollRight: boolean
  onTabChange: (key: string) => void
  onTabClose: (key: string) => void
  onScroll: (direction: 'left' | 'right') => void
  getTabContextMenu: (key: string) => MenuProps
  popoverMenuClass?: string
}

export function TabHeader({
  tabs,
  activeKey,
  tenantHomePath,
  menuConfig,
  isFullscreen,
  onToggleFullscreen,
  tabsNavRef,
  canScrollLeft,
  canScrollRight,
  onTabChange,
  onTabClose,
  onScroll,
  getTabContextMenu,
  popoverMenuClass,
}: TabHeaderProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="uni-tabs-header">
      <div
        className={`flex items-center uni-tabs-header-wrapper ${canScrollLeft ? 'can-scroll-left' : ''} ${canScrollRight ? 'can-scroll-right' : ''}`}
        ref={tabsNavRef}
      >
        {/* 全屏模式：最左侧主菜单入口 */}
        {isFullscreen && (
          <div className="uni-tabs-menu-button-wrapper">
            <Popover
              placement="bottomLeft"
              trigger="hover"
              arrow={false}
              classNames={{ root: `uni-tabs-nav-popover-menu ${popoverMenuClass ?? ''}` }}
              styles={{ root: { width: 240, padding: 0 } }}
              content={
                <Menu
                  mode="inline"
                  selectedKeys={[activeKey.split('?')[0]]}
                  defaultOpenKeys={[]}
                  style={{ border: 'none', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
                  items={(menuConfig as any[]).map(function buildItem(item: any): any {
                    const children = item.children || item.routes
                    return {
                      key: item.path || item.key || item.name,
                      icon: item.icon ? <span className="anticon">{item.icon}</span> : undefined,
                      label: item.name || item.title || '',
                      children: children?.length ? children.map(buildItem) : undefined,
                      onClick: children?.length
                        ? undefined
                        : () => {
                            if (item.path) navigate(item.path)
                          },
                    }
                  })}
                />
              }
            >
              <Button
                type="text"
                className="uni-tabs-menu-button"
                icon={<MenuOutlined />}
                title="主菜单"
              />
            </Popover>
          </div>
        )}
        {/* 左侧滚动箭头 - 仅在需要时显示 */}
        {canScrollLeft && (
          <div className="uni-tabs-scroll-button-wrapper">
            <Button
              type="text"
              size="small"
              icon={<CaretLeftFilled />}
              onClick={() => onScroll('left')}
              disabled={!canScrollLeft}
              className="uni-tabs-scroll-button uni-tabs-scroll-button-left"
            />
          </div>
        )}
        <Tabs
          activeKey={activeKey}
          onChange={onTabChange}
          type="editable-card"
          hideAdd
          onEdit={(targetKey, action) => {
            if (action === 'remove') {
              onTabClose(targetKey as string)
            }
          }}
          items={tabs.map(tab => ({
            key: tab.key,
            label: (
              <Dropdown menu={getTabContextMenu(tab.key)} trigger={['contextMenu']}>
                <span
                  onDoubleClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    // 仪表盘标签和固定标签不可双击关闭
                    if (tab.key !== tenantHomePath && tab.closable && !tab.pinned) {
                      onTabClose(tab.key)
                    }
                  }}
                  style={{ userSelect: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {tab.label}
                  {tab.pinned && (
                    <PushpinFilled
                      style={{
                        fontSize: 12,
                        color: '#3b82f6',
                        transform: 'rotate(-45deg)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </span>
              </Dropdown>
            ),
            closable: tab.closable && !tab.pinned, // 固定标签不可关闭
          }))}
          size="small"
          className="uni-tabs-container"
        />
        {/* 右侧滚动箭头 - 仅在需要时显示 */}
        {canScrollRight && (
          <div className="uni-tabs-scroll-button-wrapper">
            <Button
              type="text"
              size="small"
              icon={<CaretRightFilled />}
              onClick={() => onScroll('right')}
              disabled={!canScrollRight}
              className="uni-tabs-scroll-button uni-tabs-scroll-button-right"
            />
          </div>
        )}
        {/* 全屏按钮 */}
        {onToggleFullscreen && (
          <div className="uni-tabs-scroll-button-wrapper uni-tabs-fullscreen-button-wrapper">
            <Tooltip
              title={isFullscreen ? t('tabs.exitFullscreen') : t('tabs.fullscreen')}
              placement="left"
            >
              <Button
                type="text"
                size="small"
                // icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                icon={
                  isFullscreen ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 13.5C5.38071 13.5 6.5 14.6193 6.5 16V17C6.5 17.2761 6.27614 17.5 6 17.5C5.72386 17.5 5.5 17.2761 5.5 17V16C5.5 15.1716 4.82843 14.5 4 14.5H3C2.72386 14.5 2.5 14.2761 2.5 14C2.5 13.7239 2.72386 13.5 3 13.5H4ZM17 13.5C17.2761 13.5 17.5 13.7239 17.5 14C17.5 14.2761 17.2761 14.5 17 14.5H16C15.1716 14.5 14.5 15.1716 14.5 16V17C14.5 17.2761 14.2761 17.5 14 17.5C13.7239 17.5 13.5 17.2761 13.5 17V16C13.5 14.6193 14.6193 13.5 16 13.5H17ZM11.5 7C12.3284 7 13 7.67157 13 8.5V11.5C13 12.3284 12.3284 13 11.5 13H8.5C7.67157 13 7 12.3284 7 11.5V8.5C7 7.67157 7.67157 7 8.5 7H11.5ZM8.5 8C8.22386 8 8 8.22386 8 8.5V11.5C8 11.7761 8.22386 12 8.5 12H11.5C11.7761 12 12 11.7761 12 11.5V8.5C12 8.22386 11.7761 8 11.5 8H8.5ZM6 2.5C6.27614 2.5 6.5 2.72386 6.5 3V4C6.5 5.38071 5.38071 6.5 4 6.5H3C2.72386 6.5 2.5 6.27614 2.5 6C2.5 5.72386 2.72386 5.5 3 5.5H4C4.82843 5.5 5.5 4.82843 5.5 4V3C5.5 2.72386 5.72386 2.5 6 2.5ZM14 2.5C14.2761 2.5 14.5 2.72386 14.5 3V4C14.5 4.82843 15.1716 5.5 16 5.5H17C17.2761 5.5 17.5 5.72386 17.5 6C17.5 6.27614 17.2761 6.5 17 6.5H16C14.6193 6.5 13.5 5.38071 13.5 4V3C13.5 2.72386 13.7239 2.5 14 2.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 12.5C4.27614 12.5 4.5 12.7239 4.5 13V14C4.5 14.8284 5.17157 15.5 6 15.5H7C7.27614 15.5 7.5 15.7239 7.5 16C7.5 16.2761 7.27614 16.5 7 16.5H6C4.61929 16.5 3.5 15.3807 3.5 14V13C3.5 12.7239 3.72386 12.5 4 12.5ZM16 12.5C16.2761 12.5 16.5 12.7239 16.5 13V14C16.5 15.3807 15.3807 16.5 14 16.5H13C12.7239 16.5 12.5 16.2761 12.5 16C12.5 15.7239 12.7239 15.5 13 15.5H14C14.8284 15.5 15.5 14.8284 15.5 14V13C15.5 12.7239 15.7239 12.5 16 12.5ZM11.5 7C12.3284 7 13 7.67157 13 8.5V11.5C13 12.3284 12.3284 13 11.5 13H8.5C7.67157 13 7 12.3284 7 11.5V8.5C7 7.67157 7.67157 7 8.5 7H11.5ZM8.5 8C8.22386 8 8 8.22386 8 8.5V11.5C8 11.7761 8.22386 12 8.5 12H11.5C11.7761 12 12 11.7761 12 11.5V8.5C12 8.22386 11.7761 8 11.5 8H8.5ZM7 3.5C7.27614 3.5 7.5 3.72386 7.5 4C7.5 4.27614 7.27614 4.5 7 4.5H6C5.17157 4.5 4.5 5.17157 4.5 6V7C4.5 7.27614 4.27614 7.5 4 7.5C3.72386 7.5 3.5 7.27614 3.5 7V6C3.5 4.61929 4.61929 3.5 6 3.5H7ZM14 3.5C15.3807 3.5 16.5 4.61929 16.5 6V7C16.5 7.27614 16.2761 7.5 16 7.5C15.7239 7.5 15.5 7.27614 15.5 7V6C15.5 5.17157 14.8284 4.5 14 4.5H13C12.7239 4.5 12.5 4.27614 12.5 4C12.5 3.72386 12.7239 3.5 13 3.5H14Z"
                        fill="currentColor"
                      />
                    </svg>
                  )
                }
                onClick={onToggleFullscreen}
                className="uni-tabs-scroll-button uni-tabs-fullscreen-button"
              />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}
