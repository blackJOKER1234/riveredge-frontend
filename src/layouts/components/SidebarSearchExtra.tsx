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

/** 侧栏顶部搜索（ProLayout menuExtraRender） */
export const SidebarSearchExtra: React.FC<SidebarSearchExtraProps> = ({
  filteredMenuData,
  isDarkSiderFooter,
  siderTextColor,
  token,
  t,
}) => {
  // 与侧栏底部分割线一致（深色底栏统一用 isDarkSiderFooter）
  const sidebarSearchBottomBorder = isDarkSiderFooter
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(0, 0, 0, 0.12)';

  return (
    <div
      className="riveredge-sidebar-search-wrapper"
      style={{
        flexShrink: 0,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        margin: '-13px 0 0 0',
        padding: '2px 0 4px 0',
        borderBottom: `1px solid ${sidebarSearchBottomBorder}`,
      }}
    >
      <TopBarSearch
        menuData={filteredMenuData}
        hotMenuPaths={TOPBAR_SEARCH_HOT_MENU_PATHS}
        isLightModeLightBg={siderTextColor !== '#ffffff'}
        token={token}
        placeholder={t('common.searchPlaceholderShort')}
        inputHeight={34}
        borderRadius={17}
        shortcutKey="/"
        transparentBg
      />
    </div>
  );
};

export default SidebarSearchExtra;
