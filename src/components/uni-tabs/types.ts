import type { ReactNode } from 'react';
import type { MenuDataItem } from '@ant-design/pro-components';

/**
 * 标签项接口
 */
export interface TabItem {
  key: string;
  path: string;
  label: string;
  closable?: boolean;
  /** 是否固定 */
  pinned?: boolean;
}

/**
 * 统一标签栏组件属性
 */
export interface UniTabsProps {
  menuConfig: MenuDataItem[];
  children: ReactNode;
  /** 是否全屏 */
  isFullscreen?: boolean;
  /** 切换全屏状态 */
  onToggleFullscreen?: () => void;
}
