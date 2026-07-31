import React from 'react';
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
  if (isMobileOrTablet) {
    return <RouteTransition>{children}</RouteTransition>;
  }
  return (
    <UniTabs
      menuConfig={filteredMenuData}
      isFullscreen={isFullscreen}
      onToggleFullscreen={onToggleFullscreen}
    >
      <>{children}</>
    </UniTabs>
  );
};

export default LayoutPageBody;
