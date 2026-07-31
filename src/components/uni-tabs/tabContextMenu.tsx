import { ReloadOutlined, PushpinFilled, StarFilled } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { TFunction } from 'i18next';
import type { TabItem } from './types';

export interface CreateTabContextMenuParams {
  tabKey: string;
  tabs: TabItem[];
  tenantHomePath: string;
  t: TFunction;
  onRefresh: (tabKey: string) => void;
  onPin: (tabKey: string) => void;
  onFavorite: (tabKey: string) => Promise<void>;
  onClose: (tabKey: string) => void;
  onCloseRight: (tabKey: string) => void;
  onCloseOthers: (tabKey: string) => void;
  onCloseAll: () => void;
}

/** 构建标签右键菜单 */
export function createTabContextMenu({
  tabKey,
  tabs,
  tenantHomePath,
  t,
  onRefresh,
  onPin,
  onFavorite,
  onClose,
  onCloseRight,
  onCloseOthers,
  onCloseAll,
}: CreateTabContextMenuParams): MenuProps {
  const targetIndex = tabs.findIndex((tab) => tab.key === tabKey);
  const targetTab = tabs.find((tab) => tab.key === tabKey);
  const isWorkplace = tabKey === tenantHomePath;
  const hasRightTabs = targetIndex < tabs.length - 1;
  const hasOtherTabs = tabs.length > 1;
  const isPinned = targetTab?.pinned || false;

  const menuItems: MenuProps['items'] = [
    {
      key: 'refresh',
      label: t('tabs.refresh'),
      icon: <ReloadOutlined style={{ color: '#10b981' }} />, // 2026 Emerald Green
    },
    {
      type: 'divider',
      style: { height: 1, backgroundColor: 'rgba(0, 0, 0, 0.04)', margin: '4px 0' },
    },
    {
      key: 'pin',
      label: isPinned ? t('tabs.unpin') : t('tabs.pin'),
      icon: <PushpinFilled style={{ color: '#3b82f6', transform: isPinned ? 'rotate(-45deg)' : 'none' }} />, // 2026 Electric Blue
    },
    {
      key: 'favoriteToQuickEntry',
      label: t('ui.tabs.favoriteToQuickEntry'),
      icon: <StarFilled style={{ color: '#f59e0b' }} />, // 2026 Amber Gold
      disabled: isWorkplace,
    },
    {
      type: 'divider',
      style: { height: 1, backgroundColor: 'rgba(0, 0, 0, 0.04)', margin: '4px 0' },
    },
    {
      key: 'close',
      label: t('tabs.close'),
      disabled: isWorkplace || isPinned, // 工作台和固定标签不可关闭
    },
    {
      key: 'closeRight',
      label: t('tabs.closeRight'),
      disabled: !hasRightTabs || isWorkplace,
    },
    {
      key: 'closeOthers',
      label: t('tabs.closeOthers'),
      disabled: !hasOtherTabs || isWorkplace,
    },
    {
      key: 'closeAll',
      label: t('tabs.closeAll'),
      disabled: tabs.length <= 1 || (tabs.length === 1 && isWorkplace),
    },
  ];

  return {
    items: menuItems,
    onClick: async ({ key }) => {
      switch (key) {
        case 'refresh':
          onRefresh(tabKey);
          break;
        case 'pin':
          onPin(tabKey);
          break;
        case 'favoriteToQuickEntry':
          await onFavorite(tabKey);
          break;
        case 'close':
          onClose(tabKey);
          break;
        case 'closeRight':
          onCloseRight(tabKey);
          break;
        case 'closeOthers':
          onCloseOthers(tabKey);
          break;
        case 'closeAll':
          onCloseAll();
          break;
      }
    },
  };
}
