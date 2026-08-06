import { LEGACY_TENANT_DEFAULT_HOME_PATHS } from '../../stores/configStore';
import type { TabItem } from './types';

export function isTenantDefaultHomePath(p: string): boolean {
  return (LEGACY_TENANT_DEFAULT_HOME_PATHS as readonly string[]).includes(p);
}

/** 工作台 / 模块看板：外层 UniTabs 不滚动，由 DashboardTemplate / UniDashboard 内部承担 */
export function isDashboardLikePage(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/system/dashboard/workplace' || p === '/system/dashboard/analysis') {
    return true;
  }
  if (!p.startsWith('/apps/')) return false;
  if (p.endsWith('/workspace')) return true;
  if (p.endsWith('/dashboard')) return true;
  if (p.endsWith('/inspection-center')) return true;
  if (p.endsWith('/management-dashboard')) return true;
  if (p.endsWith('/analysis-center')) return true;
  return false;
}

/**
 * 计算颜色的亮度值
 * @param color - 颜色值（十六进制或 rgb/rgba 格式）
 * @returns 亮度值（0-255）
 */
export function calculateColorBrightness(color: string): number {
  if (!color || typeof color !== 'string') return 255; // 默认返回浅色

  // 处理十六进制颜色
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    // 处理 3 位十六进制（如 #fff）
    const fullHex = hex.length === 3
      ? hex.split('').map(c => c + c).join('')
      : hex;
    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);
    // 计算亮度 (使用相对亮度公式)
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  // 处理 rgb/rgba 格式
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0]);
      const g = parseInt(match[1]);
      const b = parseInt(match[2]);
      return (r * 299 + g * 587 + b * 114) / 1000;
    }
  }

  return 255; // 默认返回浅色
}

/** 排除 _refresh 参数，生成可作为标签 key 的完整路径 */
export function buildTabKey(pathname: string, search: string): string {
  const searchParams = new URLSearchParams(search || '');
  searchParams.delete('_refresh');
  const cleanSearch = searchParams.toString();
  return pathname + (cleanSearch ? `?${cleanSearch}` : '');
}

/** 标签排序：工作台 -> 固定标签 -> 其他标签 */
export function sortTabs(tabs: TabItem[], tenantHomePath: string): TabItem[] {
  const workplaceTab = tabs.find((tab) => tab.key === tenantHomePath);
  const pinnedTabs = tabs.filter((tab) => tab.pinned && tab.key !== tenantHomePath);
  const unpinnedTabs = tabs.filter((tab) => !tab.pinned && tab.key !== tenantHomePath);

  const sortedTabs: TabItem[] = [];
  if (workplaceTab) {
    sortedTabs.push(workplaceTab);
  }
  sortedTabs.push(...pinnedTabs);
  sortedTabs.push(...unpinnedTabs);

  return sortedTabs;
}
