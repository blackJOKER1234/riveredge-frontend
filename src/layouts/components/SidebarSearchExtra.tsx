import React from 'react';
import TopBarSearch from '../../components/TopBarSearch';
import type { MenuDataItem } from '@ant-design/pro-components';
import { TOPBAR_SEARCH_HOT_MENU_PATHS } from '../config/menuBadges';

export interface SidebarSearchExtraProps {
  filteredMenuData: MenuDataItem[];
  isDarkSiderFooter: boolean;
  siderTextColor: string;
  token: any;
  t: (key: string, options?: any) => any;
}

/** 侧栏顶部搜索（ProLayout menuExtraRender）——浅灰胶囊形 */
export const SidebarSearchExtra: React.FC<SidebarSearchExtraProps> = ({
  filteredMenuData,
  isDarkSiderFooter: _isDarkSiderFooter,
  siderTextColor,
  token,
  t,
}) => {
  // 浅色侧栏：浅灰胶囊；深色侧栏：半透明白底
  const isLightSider = siderTextColor !== '#ffffff';
  const pillBg = isLightSider
    ? (token?.colorFillTertiary ?? '#f0f0f0')
    : 'rgba(255, 255, 255, 0.12)';
  const pillBgHover = isLightSider
    ? (token?.colorFillSecondary ?? '#e8e8e8')
    : 'rgba(255, 255, 255, 0.16)';

  const wrapperStyle = {
    flexShrink: 0,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    padding: '0px',
    boxSizing: 'border-box',
    // 供 LayoutStyles 读取默认/hover 背景
    '--sidebar-search-pill-bg': pillBg,
    '--sidebar-search-pill-bg-hover': pillBgHover,
  } as React.CSSProperties;

  return (
    <div className="riveredge-sidebar-search-wrapper" style={wrapperStyle}>
      <TopBarSearch
        menuData={filteredMenuData}
        hotMenuPaths={TOPBAR_SEARCH_HOT_MENU_PATHS}
        isLightModeLightBg={isLightSider}
        token={token}
        placeholder={t('common.searchPlaceholderShort')}
        inputHeight={40}
        borderRadius={24}
      />
    </div>
  );
};

export default SidebarSearchExtra;
