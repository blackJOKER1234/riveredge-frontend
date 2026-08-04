import React from 'react';
import { Breadcrumb, Button, Tooltip } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import type { NavigateFunction } from 'react-router-dom';
import type { LayoutBreadcrumbItem } from '../utils/layoutBreadcrumb';

export interface LayoutHeaderContentProps {
  isMobileOrTablet: boolean;
  breadcrumbRef: React.RefObject<HTMLDivElement | null>;
  breadcrumbVisible: boolean;
  breadcrumbItems: LayoutBreadcrumbItem[];
  navigate: NavigateFunction;
  collapsed: boolean;
  onToggleCollapsed: (collapsed: boolean) => void;
  t: (key: string, options?: any) => any;
}

/** 顶栏中部：侧边栏开关 + 面包屑 */
export const LayoutHeaderContent: React.FC<LayoutHeaderContentProps> = ({
  isMobileOrTablet,
  breadcrumbRef,
  breadcrumbVisible,
  breadcrumbItems,
  navigate,
  collapsed,
  onToggleCollapsed,
  t,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 6}}>
      {!isMobileOrTablet && (
        <Tooltip title={collapsed ? t('ui.sidebar.expand') : t('ui.sidebar.collapse')}>
          <Button
            type="text"
            size="small"
            className='bg-transparent!'
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => onToggleCollapsed(!collapsed)}
            aria-label={collapsed ? t('ui.sidebar.expand') : t('ui.sidebar.collapse')}
          />
        </Tooltip>
      )}
      <div ref={breadcrumbRef as React.RefObject<HTMLDivElement>} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Breadcrumb
          style={{
            display: breadcrumbVisible ? 'flex' : 'none',
            alignItems: 'center',
            maxHeight: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
          items={breadcrumbItems.map((item, index) => ({
            title: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, lineHeight: '1.5', verticalAlign: 'middle' }}>
                {index === breadcrumbItems.length - 1 || index === 0 ? (
                  <span
                    className={index === breadcrumbItems.length - 1 ? 'riveredge-breadcrumb-active' : undefined}
                    style={{
                      color: index === 0 ? 'var(--ant-colorTextSecondary)' : 'var(--ant-colorText)',
                      fontWeight: 400,
                      lineHeight: '1.5',
                      verticalAlign: 'middle',
                    }}
                  >
                    {item.title}
                  </span>
                ) : (
                  <a
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      }
                    }}
                    style={{ cursor: 'pointer', lineHeight: '1.5', verticalAlign: 'middle' }}
                  >
                    {item.title}
                  </a>
                )}
              </span>
            ),
            menu: item.menu,
          }))}
        />
      </div>
    </div>
  );
};

export default LayoutHeaderContent;
