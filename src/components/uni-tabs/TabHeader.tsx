/**
 * RiverEdge SaaS - UniTabs 标签栏头部
 */

import { CaretLeftFilled, CaretRightFilled, FullscreenOutlined, FullscreenExitOutlined, MenuOutlined, PushpinFilled } from '@ant-design/icons';
import { Button, Dropdown, Menu, Popover, Tabs, Tooltip, type MenuProps } from 'antd';
import type { MenuDataItem } from '@ant-design/pro-components';
import type { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TabItem } from './types';

interface TabHeaderProps {
  tabs: TabItem[];
  activeKey: string;
  tenantHomePath: string;
  menuConfig: MenuDataItem[];
  isFullscreen: boolean;
  onToggleFullscreen?: () => void;
  tabsNavRef: RefObject<HTMLDivElement>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onTabChange: (key: string) => void;
  onTabClose: (key: string) => void;
  onScroll: (direction: 'left' | 'right') => void;
  getTabContextMenu: (key: string) => MenuProps;
  popoverMenuClass?: string;
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
  const navigate = useNavigate();
  const { t } = useTranslation();

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
                        const children = item.children || item.routes;
                        return {
                          key: item.path || item.key || item.name,
                          icon: item.icon ? <span className="anticon">{item.icon}</span> : undefined,
                          label: item.name || item.title || '',
                          children: children?.length
                            ? children.map(buildItem)
                            : undefined,
                          onClick: children?.length ? undefined : () => {
                            if (item.path) navigate(item.path);
                          },
                        };
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
                  onTabClose(targetKey as string);
                }
              }}
              items={tabs.map((tab) => ({
                key: tab.key,
                label: (
                  <Dropdown
                    menu={getTabContextMenu(tab.key)}
                    trigger={['contextMenu']}
                  >
                    <span
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // 仪表盘标签和固定标签不可双击关闭
                        if (tab.key !== tenantHomePath && tab.closable && !tab.pinned) {
                          onTabClose(tab.key);
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
              className="mb-3! uni-tabs-container"
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
                <Tooltip title={isFullscreen ? t('tabs.exitFullscreen') : t('tabs.fullscreen')} placement="left">
                  <Button
                    type="text"
                    size="small"
                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    onClick={onToggleFullscreen}
                    className="uni-tabs-scroll-button uni-tabs-fullscreen-button"
                  />
                </Tooltip>
              </div>
            )}
          </div>
    </div>
  );
}
