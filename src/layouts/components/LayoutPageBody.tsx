import React from 'react';
import { theme } from 'antd';
import type { MenuDataItem } from '@ant-design/pro-components';
import UniTabs from '../../components/uni-tabs';
import { RouteTransition } from '../../components/route-transition';

export interface LayoutPageBodyProps {
  isMobileOrTablet: boolean;
  filteredMenuData: MenuDataItem[];
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  children: React.ReactNode;
}

/** ProLayout 内容区：移动端路由过渡 / 桌面 UniTabs */
export const LayoutPageBody: React.FC<LayoutPageBodyProps> = ({
  isMobileOrTablet,
  filteredMenuData,
  isFullscreen,
  onToggleFullscreen,
  children,
}) => {
  const { token } = theme.useToken();
  if (isMobileOrTablet) {
    return <RouteTransition>{children}</RouteTransition>;
  }
  return (
    <UniTabs
      menuConfig={filteredMenuData}
      isFullscreen={isFullscreen}
      onToggleFullscreen={onToggleFullscreen}
    >
      <div
        className="box-border p-4"
        style={{
          // borderRadius: token.borderRadius,
          backgroundColor: token.colorBgContainer,
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <div
          className="p-4 overflow-auto"
          style={{
            borderRadius: token.borderRadius,
            backgroundColor: token.colorBgLayout,
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </UniTabs>
  )
};

export default LayoutPageBody;
