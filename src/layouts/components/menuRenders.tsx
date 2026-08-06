import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Skeleton } from 'antd';
import type { MenuDataItem } from '@ant-design/pro-components';
import type { QueryClient } from '@tanstack/react-query';
import {
  translateMenuName,
  translateAppMenuItemName,
  extractAppCodeFromPath,
  getAppDisplayName,
} from '../../utils/menuTranslation';
import { prefetchPlugin } from '../../utils/pluginLoader';
import { prefetchKuaizhizaoRoute } from '../../apps/kuaizhizao/routePrefetch';
import { prefetchMasterDataRoute } from '../../apps/master-data/routePrefetch';
import { prefetchSystemRoute, prefetchSystemRoutes } from '../../routes/systemRoutePrefetch';
import { getMenuBadgeKey } from '../config/menuBadges';

type TFunc = (key: string, options?: any) => any;

/** 过滤系统菜单并插入 APP 骨架 */
export function renderMenuData(
  filteredMenuData: MenuDataItem[],
  appMenuSkeletonItems: MenuDataItem[],
): MenuDataItem[] {
  // 过滤系统设置项并插入加载骨架（收起态仅显示原生图标，无简称文字）。
  const data = filteredMenuData.filter((item) => item.path !== '/system');
  if (appMenuSkeletonItems.length) {
    // 与 useUnifiedMenuData 一致：插在系统配置之前，保留仪表板标题+子项连续
    const systemRootIdx = data.findIndex((i) => i.path === '/system');
    const insertAt = systemRootIdx >= 0 ? systemRootIdx : data.length;
    return [
      ...data.slice(0, insertAt),
      ...appMenuSkeletonItems,
      ...data.slice(insertAt),
    ];
  }
  return data;
}

/** 阻止 Menu 默认 a 标签整页跳转 */
export function handleMenuClickPreventFullReload(info: any) {
  // 如果菜单项有 path，阻止默认的链接跳转行为
  // 使用 type assertion 绕过 ReactInstance 类型限制
  const menuItem = info.item as any;
  if (menuItem && menuItem.props && menuItem.props.path) {
    const path = menuItem.props.path;
    // 外部链接已经在 menuItemRender 中处理，这里只阻止内部路由的默认行为
    if (path && !path.startsWith('http://') && !path.startsWith('https://')) {
      // 完全阻止默认行为，让 Link 组件处理路由
      info.domEvent.preventDefault();
      info.domEvent.stopPropagation();
    }
  }
}

/** 父分组悬停预取 */
export function renderSubMenuItem(item: any, defaultDom: React.ReactNode): React.ReactNode {
  // 父分组悬停：一次性预取其下全部子项 chunk，展开即可见、点击即渲染
  const collectLeafPaths = (node: any, acc: string[]): string[] => {
    if (!node) return acc;
    if (Array.isArray(node.children) && node.children.length > 0) {
      for (const child of node.children) collectLeafPaths(child, acc);
    } else if (typeof node.path === 'string') {
      acc.push(node.path);
    }
    return acc;
  };
  const paths = collectLeafPaths(item, []);
  const handleEnter = () => {
    if (paths.length === 0) return;
    const systemPaths: string[] = [];
    const pluginCodes = new Set<string>();
    const kuaiPaths: string[] = [];
    const masterDataPaths: string[] = [];
    for (const p of paths) {
      if (p.startsWith('/apps/')) {
        const code = extractAppCodeFromPath(p);
        if (code) pluginCodes.add(code);
        if (p.startsWith('/apps/kuaizhizao')) kuaiPaths.push(p);
        if (p.startsWith('/apps/master-data')) masterDataPaths.push(p);
      } else {
        systemPaths.push(p);
      }
    }
    pluginCodes.forEach((code) => prefetchPlugin(code));
    kuaiPaths.forEach((p) => prefetchKuaizhizaoRoute(p));
    masterDataPaths.forEach((p) => prefetchMasterDataRoute(p));
    if (systemPaths.length > 0) prefetchSystemRoutes(systemPaths);
  };
  // 保持 ProLayout 原生结构，仅克隆挂上悬停预取（不包裹额外节点、不叠布局样式）。
  return React.isValidElement(defaultDom)
    ? React.cloneElement(defaultDom as React.ReactElement, { onMouseEnter: handleEnter })
    : defaultDom;
}

export function renderMenuItem(
  item: any,
  dom: React.ReactNode,
  options: {
    t: TFunc;
    menuBadgeCounts: Record<string, any>;
    queryClient: QueryClient;
    collapsed?: boolean;
  },
): React.ReactNode {
  const { t, menuBadgeCounts, queryClient, collapsed } = options;

  // APP 菜单加载占位：首次拉取 navigation-tree 期间的骨架行
  if (item.isAppMenuSkeleton) {
    return (
      <div
        className="app-menu-skeleton-item"
        style={{ width: '100%', padding: '4px 0', pointerEvents: 'none' }}
      >
        <Skeleton.Input active size="small" block style={{ height: 16, borderRadius: 4 }} />
      </div>
    );
  }
  // 处理外部链接
  if (item.path && (item.path.startsWith('http://') || item.path.startsWith('https://'))) {
    return (
      <a href={item.path} target={item.target || '_blank'} rel="noopener noreferrer">
        {dom}
      </a>
    );
  }
  // 应用/仪表板分区标题（快制造、快研发、仪表板…）
  // 检查条件：className 含 menu-group-title-app，或 key 以 app-group- 开头
  const itemKey = String(item.key ?? '');
  const isAppGroupTitle =
    itemKey.startsWith('app-group-') ||
    Boolean(
      item.className &&
        (item.className.includes('menu-group-title-app') ||
          item.className.includes('app-menu-container-start')),
    );
  if (isAppGroupTitle) {
    // 应用名唯一来源：仅用 locale 的 app.${appCode}.name，与 useUnifiedMenuData 一致
    const firstChildPath = item.children?.[0]?.path;
    const fallback = item.name || item.label || '';
    const appCode = firstChildPath ? extractAppCodeFromPath(firstChildPath) : null;
    const groupTitle = appCode ? getAppDisplayName(appCode, t, fallback) : fallback;

    return (
      <div
        className="menu-group-title-app"
        style={{
          fontSize: '12px',
          color: 'rgba(0, 0, 0, 0.2)',
          fontWeight: 500,
          padding: '0', // 减小上下 padding
          margin: 0,
          lineHeight: '1.2',
          height: '16px',
          minHeight: '16px',
          maxHeight: '16px',
          cursor: 'default',
          userSelect: 'none',
          pointerEvents: 'none',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={(e) => {
          // 阻止hover效果传播到父元素
          e.stopPropagation();
          const parent = e.currentTarget.closest('.ant-menu-item') as HTMLElement;
          if (parent) {
            parent.style.backgroundColor = 'transparent';
          }
        }}
        onMouseLeave={(e) => {
          const parent = e.currentTarget.closest('.ant-menu-item') as HTMLElement;
          if (parent) {
            parent.style.backgroundColor = 'transparent';
          }
        }}
      >
        {groupTitle}
      </div>
    );
  }

  // 如果是系统级菜单的分组标题（type: 'group'），确保使用翻译后的名称
  // 注意：系统级菜单的分组标题在菜单配置中已经使用 t() 函数翻译，但 dom 参数可能还未翻译
  if (item.type === 'group' && item.name) {
    // 检查是否是应用菜单（通过路径判断）
    const firstChildPath = item.children?.[0]?.path;
    const isAppMenu = firstChildPath?.startsWith('/apps/');
    const translatedName = isAppMenu
      ? translateAppMenuItemName(item.name as string, undefined, t, item.children)
      : translateMenuName(item.name as string, t, firstChildPath);
    // 如果翻译后的名称与 dom 不一致，返回翻译后的名称
    // 否则直接返回 dom（因为 dom 可能已经是翻译后的）
    if (translatedName !== item.name && translatedName !== dom) {
      return (
        <span>
          {translatedName}
        </span>
      );
    }
  }

  // ⚠️ 关键修复：使用 ProLayout 原生方式，返回 React Router 的 Link 组件
  // Link 组件会自动处理 SPA 路由，不会整页刷新
  if (item.path && !item.disabled) {
    const path = item.path as string;

    // 左侧菜单小徽标：仅业务单据显示未完成数量
    const badgeKey = getMenuBadgeKey(path);
    const badgeData = (badgeKey ? menuBadgeCounts[badgeKey] : null) as any;

    let badgeEl: React.ReactNode = null;
    if (badgeData) {
      if (typeof badgeData === 'number' && badgeData > 0) {
        // 传统形式：仅数字，默认红色（antd Badge 默认）
        badgeEl = <Badge count={badgeData} size="small" className="menu-item-badge-count" />;
      } else if (typeof badgeData === 'object') {
        // 拟物化分类徽标，优先级：逾期 (red) > 待审核 (orange) > 进行中 (green)
        if (badgeData.overdue > 0) {
          badgeEl = <Badge count={badgeData.overdue} size="small" color="#f5222d" className="menu-item-badge-count" />;
        } else if (badgeData.pending > 0) {
          badgeEl = <Badge count={badgeData.pending} size="small" color="#fa8c16" className="menu-item-badge-count" />;
        } else if (badgeData.in_progress > 0) {
          badgeEl = <Badge count={badgeData.in_progress} size="small" color="#52c41a" className="menu-item-badge-count" />;
        }
      }
    }

    // 折叠态：同样用 Link 保持 SPA 导航；文字由 LayoutStyles 隐藏，图标居中
    if (collapsed) {
      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{ display: 'block', width: '100%' }}
        >
          <Link
            to={item.path}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
          >
            {dom}
          </Link>
        </div>
      );
    }

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        onMouseEnter={() => {
          if (path.startsWith('/apps/')) {
            const appCode = extractAppCodeFromPath(path);
            if (appCode) prefetchPlugin(appCode);
            if (path.startsWith('/apps/kuaizhizao')) prefetchKuaizhizaoRoute(path);
            if (path.startsWith('/apps/master-data')) prefetchMasterDataRoute(path);
            const menuPath = path.split('?')[0];
            if (
              menuPath.includes('/apps/kuaizhizao/') &&
              menuPath.includes('production-execution/work-orders') &&
              !menuPath.includes('/kiosk')
            ) {
              void import('../../apps/kuaizhizao/pages/production-execution/work-orders/workOrderListTable').then(
                (m) => m.prefetchDefaultWorkOrderList(queryClient, 20)
              );
            }
          } else {
            // 系统级/平台级/个人中心路由：悬停即预取目标 chunk，点击即渲染
            prefetchSystemRoute(path);
          }
        }}
        style={{ display: 'block', width: '100%' }}
      >
        <Link to={item.path} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 6 }}>
          {dom}
          {badgeEl}
        </Link>
      </div>
    );
  }
  // 没有 path 或 disabled 的菜单项：直接返回 dom
  return dom;
}
