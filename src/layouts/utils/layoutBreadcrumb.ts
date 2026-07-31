import type { MenuDataItem } from '@ant-design/pro-components';
import {
  translateMenuName,
  translatePathTitle,
  translateAppMenuItemName,
} from '../../utils/menuTranslation';
import { resolveCustomPageTitle } from '../../utils/customPageTitle';
import { isUUID } from './colorUtils';

type TFunc = (key: string, options?: any) => any;

export type LayoutBreadcrumbItem = {
  title: string;
  path?: string;
  icon?: import("react").ReactNode;
  menu?: { items: Array<{ key: string; label: string; onClick: () => void }> };
};

export function buildLayoutBreadcrumb(options: {
  pathname: string;
  search: string;
  breadcrumbMenuData: MenuDataItem[];
  navigate: (path: string) => void;
  t: TFunc;
  customPageLabel?: string | null;
}): LayoutBreadcrumbItem[] {
  const { pathname, search, breadcrumbMenuData, navigate, t, customPageLabel } = options;
  const breadcrumbItems: LayoutBreadcrumbItem[] = [];

  const findMenuPath = (
    items: MenuDataItem[] | undefined,
    targetPath: string,
    path: MenuDataItem[] = [],
  ): MenuDataItem[] | null => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return null;
    }

    for (const item of items) {
      const currentPath = [...path, item];

      if (item.path === targetPath) {
        return currentPath;
      }

      if (item.children) {
        const found = findMenuPath(item.children, targetPath, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  let menuPath = findMenuPath(breadcrumbMenuData, pathname);

  if (!menuPath) {
    let tempPath = pathname;
    while (tempPath.includes('/') && !menuPath) {
      tempPath = tempPath.substring(0, tempPath.lastIndexOf('/'));
      if (tempPath) {
        const parentPath = findMenuPath(breadcrumbMenuData, tempPath);
        if (parentPath) {
          const currentTitle = translatePathTitle(pathname, t);
          menuPath = [...parentPath, { path: pathname, name: currentTitle }];
        }
      }
    }
  }

  const findFirstActualMenuItem = (items: MenuDataItem[] | undefined): MenuDataItem | null => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    const firstItem = items[0];
    if (firstItem.type === 'group' && firstItem.children) {
      return findFirstActualMenuItem(firstItem.children);
    }
    if (firstItem.path && firstItem.name) {
      return firstItem;
    }
    if (firstItem.children) {
      return findFirstActualMenuItem(firstItem.children);
    }
    return null;
  };

  if (menuPath) {
    menuPath.forEach((item, index) => {
      if (!item.name) return;
      if (isUUID(item.name as string)) return;

      let menu: { items: Array<{ key: string; label: string; onClick: () => void }> } | undefined;

      let actualPath = item.path;
      if (!actualPath && item.children && item.children.length > 0) {
        const firstLeaf = findFirstActualMenuItem(item.children);
        if (firstLeaf?.path) {
          actualPath = firstLeaf.path;
        }
      }

      if (index === 0 && item.children && item.children.length > 0) {
        const firstChild = item.children[0];
        if (firstChild.type === 'group' && firstChild.children) {
          const firstMenuItem = findFirstActualMenuItem(firstChild.children);
          if (firstMenuItem && firstMenuItem.path) {
            actualPath = firstMenuItem.path;
          }
        }
      }

      if (index > 0) {
        const parentItem = menuPath![index - 1];
        if (parentItem.children && parentItem.children.length > 1) {
          menu = {
            items: parentItem.children
              .filter((child) => child.name && !child.hideInMenu && !isUUID(child.name as string))
              .map((child) => {
                const childPath = child.path || findFirstActualMenuItem(child.children)?.path;
                if (!childPath) return null;
                const isAppMenu = childPath.startsWith('/apps/');
                const label = isAppMenu
                  ? translateAppMenuItemName(child.name as string, child.path, t)
                  : translateMenuName(child.name as string, t, childPath);
                return {
                  key: childPath,
                  label: label,
                  onClick: () => {
                    navigate(childPath);
                  },
                };
              })
              .filter(Boolean) as Array<{ key: string; label: string; onClick: () => void }>,
          };
        }
      }

      const isAppMenu = (actualPath || '')?.startsWith('/apps/');
      const nodeKey = typeof item.key === 'string' ? item.key : '';
      const isAppRootNode =
        isAppMenu &&
        ((item as any).isAppRoot === true ||
          nodeKey.startsWith('breadcrumb-app-') ||
          !item.path ||
          (item.path as string).match(/^\/apps\/[^/]+$/) !== null);
      const breadcrumbTitle = isAppRootNode
        ? (item.name as string)
        : isAppMenu
          ? translateAppMenuItemName(item.name as string, item.path, t)
          : translateMenuName(item.name as string, t, actualPath);

      breadcrumbItems.push({
        title: breadcrumbTitle,
        path: actualPath,
        icon: item.icon,
        menu: menu?.items && menu.items.length > 0 ? menu : undefined,
      });
    });
  }

  if (breadcrumbItems.length === 0) {
    const translatedTitle = translatePathTitle(pathname, t);
    if (translatedTitle) {
      breadcrumbItems.push({
        title: translatedTitle,
        path: pathname,
      });
    }
  }

  const labelOverride = customPageLabel ?? resolveCustomPageTitle(pathname, search);
  if (labelOverride && breadcrumbItems.length > 0) {
    const lastIdx = breadcrumbItems.length - 1;
    breadcrumbItems[lastIdx] = { ...breadcrumbItems[lastIdx], title: labelOverride };
  }

  return breadcrumbItems.filter((item) => item.title);
}

/** 只选中精确匹配当前路径的菜单 key，不选中父级 */
export function calculateSelectedKeys(menuItems: MenuDataItem[], currentPath: string): string[] {
  const selectedKeys: string[] = [];

  const findExactMatch = (items: MenuDataItem[], path: string): boolean => {
    for (const item of items) {
      const itemKey = item.key || item.path;
      if (!itemKey) continue;

      if (item.path === path) {
        selectedKeys.push(itemKey as string);
        return true;
      }

      if (item.children && item.children.length > 0) {
        const hasMatch = findExactMatch(item.children, path);
        if (hasMatch) {
          return true;
        }
      }
    }
    return false;
  };

  findExactMatch(menuItems, currentPath);
  return selectedKeys;
}
