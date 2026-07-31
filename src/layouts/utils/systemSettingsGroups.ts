import type { MenuDataItem } from '@ant-design/pro-components';
import {
  SYSTEM_SETTINGS_GROUP_ORDER,
  SYSTEM_SETTINGS_GROUP_SPAN,
  SYSTEM_SETTINGS_PANEL_HIDDEN_PATHS,
  calcSystemSettingsPanelWidth,
  TENANT_PLAN_I18N_KEY,
} from '../config/systemSettingsPanel';
import { formatDateTime } from '../../utils/format';

export type SystemSettingsGroup = {
  key: string;
  name: import("react").ReactNode;
  items: MenuDataItem[];
  itemCount: number;
  itemCols: number;
  groupSpan: number;
};

export function buildSystemSettingsGroups(systemMenuEntry?: MenuDataItem | null): SystemSettingsGroup[] {
  const preferredOrder = SYSTEM_SETTINGS_GROUP_ORDER as unknown as string[];
  const spanByKey = SYSTEM_SETTINGS_GROUP_SPAN;
  const groups = (systemMenuEntry?.children ?? []) as MenuDataItem[];
  const visibleGroups = groups
    .filter((group) => !group?.hideInMenu)
    .map((group, index) => {
      const items = (group.children ?? []).filter(
        (child) =>
          !child?.hideInMenu &&
          !!child?.path &&
          // 顶栏已有入口，不在系统配置浮层里重复展示
          !SYSTEM_SETTINGS_PANEL_HIDDEN_PATHS.has(child.path as string),
      );
      const itemCount = items.length;
      // 每个分组固定显示为两行：列数按数量自动计算
      const itemCols = Math.max(2, Math.ceil(itemCount / 2));
      // 组宽度按设计占位，确保每行总占位凑满 12，避免右侧空白列
      const rawKey = String(group.key || group.name || `system-group-${index}`);
      const groupSpan = spanByKey[rawKey] ?? Math.min(6, Math.max(3, itemCols + 1));
      return {
        key: rawKey,
        name: group.name,
        items,
        itemCount,
        itemCols,
        groupSpan,
      };
    })
    .filter((group) => group.itemCount > 0)
    .sort((a, b) => {
      const aOrder = preferredOrder.indexOf(a.key);
      const bOrder = preferredOrder.indexOf(b.key);
      if (aOrder === -1 && bOrder === -1) return 0;
      if (aOrder === -1) return 1;
      if (bOrder === -1) return -1;
      return aOrder - bOrder;
    });
  return visibleGroups;
}

export function calcSystemSettingsPanelGridColumns(systemSettingsGroups: SystemSettingsGroup[]): number {
  if (!systemSettingsGroups.length) return 6;
  let currentRowSpan = 0;
  let maxRowSpan = 0;
  systemSettingsGroups.forEach((group) => {
    const span = Math.max(3, Math.min(24, Number(group.groupSpan) || 6));
    if (currentRowSpan + span > 24) {
      maxRowSpan = Math.max(maxRowSpan, currentRowSpan);
      currentRowSpan = 0;
    }
    currentRowSpan += span;
    maxRowSpan = Math.max(maxRowSpan, currentRowSpan);
  });
  return Math.max(6, Math.min(24, maxRowSpan));
}

export function resolveTenantPlanLabel(
  plan: string | undefined | null,
  t: (key: string, options?: any) => any,
): string | undefined {
  if (!plan) return undefined;
  const labelKey = TENANT_PLAN_I18N_KEY[plan];
  return labelKey ? t(labelKey) : plan;
}

export function resolveTenantExpiresLabel(expiresAt: string | undefined | null): string {
  if (!expiresAt) return '2099-12-31';
  return formatDateTime(expiresAt, 'YYYY-MM-DD HH:mm');
}

export { calcSystemSettingsPanelWidth };
