import React from 'react';
import type { MenuDataItem } from '@ant-design/pro-components';
import * as LucideIcons from 'lucide-react';
import { ManufacturingIcons } from '../../utils/manufacturingIcons';
import { translateMenuName, translateAppMenuItemName } from '../../utils/menuTranslation';
import type { MenuTree } from '../../services/menu';
import { getMenuIcon } from './menuIcons';
import { MENU_ICON_ALIAS_MAP } from '../config/menuIconAliasMap';

type TFunc = (key: string, options?: any) => any;

/**
 * 将 MenuTree 转换为 MenuDataItem
 * 支持应用菜单的国际化翻译
 */
export function convertMenuTreeToMenuDataItem(
  menu: MenuTree,
  t: TFunc,
  isAppMenu: boolean = false,
  depth: number = 0,
): MenuDataItem {

    // 处理图标：一级菜单必显图标，有 icon 的二级菜单（如主数据-客户供应商）也显示
    // 统一图标大小：16px
    let iconElement: React.ReactNode = undefined;

    // 同等级菜单：优先使用固定的 path 映射（避免 menu.icon 数据不一致）
    if (depth === 0 && menu.path) {
      const normalizedMenuPath = typeof menu.path === 'string' ? menu.path.replace(/\/$/, '') : menu.path;
      const iconFromPath = getMenuIcon(menu.name ?? '', normalizedMenuPath as string);
      // getMenuIcon 找不到匹配时会返回 dashboard 默认图标，这里用它来判断是否命中映射
      if (React.isValidElement(iconFromPath) && (iconFromPath as any).type !== ManufacturingIcons.dashboard) {
        iconElement = iconFromPath;
      }
    }

    if (!iconElement && menu.icon) {
      // 首先尝试从预定义的 ManufacturingIcons 中获取
      const iconKey = menu.icon as keyof typeof ManufacturingIcons;
      const IconComponent = ManufacturingIcons[iconKey];
      if (IconComponent) {
        iconElement = React.createElement(IconComponent, { size: 16 });
      } else {
        // 如果预定义映射中没有，尝试直接从 Lucide Icons 中获取（全量导入支持）
        // 需要动态导入 Lucide Icons（因为全量导入会增加打包体积，所以按需导入）
        // 注意：这里使用同步方式，因为 convertMenuTreeToMenuDataItem 是同步函数
        // 实际上，由于 manufacturingIcons.tsx 已经全量导入了，我们可以直接使用
        // 但为了更好的性能，这里先尝试从预定义映射获取，失败后再尝试直接访问

        // 尝试映射 Ant Design / 应用 icon 别名
        const IconComponent = MENU_ICON_ALIAS_MAP[menu.icon];
        if (IconComponent) {
          iconElement = React.createElement(IconComponent, { size: 16 });
        } else {
          // 如果预定义映射和 Ant Design 映射都没有，尝试直接从 Lucide Icons 中获取
          // 支持 PascalCase 图标名（如 "Factory", "Home"）或 kebab-case（如 "factory", "home"）
          const iconName = menu.icon as string;

          // 尝试直接访问（PascalCase）
          let DirectIcon = (LucideIcons as any)[iconName];

          // 如果直接访问失败，尝试转换为 PascalCase
          if (!DirectIcon) {
            const pascalCaseName = iconName
              .split(/[-_]/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join('');
            DirectIcon = (LucideIcons as any)[pascalCaseName];
          }

          if (DirectIcon && DirectIcon !== React.Fragment && typeof DirectIcon === 'function') {
            iconElement = React.createElement(DirectIcon, { size: 16 });
          } else if (process.env.NODE_ENV === 'development') {
            console.warn(`Icon not found: ${menu.icon} for menu: ${menu.name || menu.path}. Tip: You can use Lucide icon names (PascalCase) directly, such as "Factory", "Home", etc.`);
          }
        }
      }
    }

    // 一级菜单：若 icon 未匹配，再尝试根据名称和路径获取
    if (depth === 0 && !iconElement) {
      if (menu.name) {
        iconElement = getMenuIcon(menu.name, menu.path);
      } else if (menu.path) {
        iconElement = getMenuIcon('', menu.path);
      }
      if (!iconElement) {
        iconElement = React.createElement(ManufacturingIcons.dashboard, { size: 16 });
      }
    }

    // 处理菜单名称翻译
    let menuName = menu.name;
    if (isAppMenu && menuName) {
      // 应用菜单使用应用菜单翻译函数
      // 对于分组菜单（没有path），传递子菜单以便从子菜单路径提取应用code
      menuName = translateAppMenuItemName(menuName, menu.path, t, menu.children);
    } else if (menuName) {
      // 系统菜单使用通用菜单翻译函数
      menuName = translateMenuName(menuName, t, menu.path);
    }

    const menuItem: MenuDataItem = {
      path: menu.path == null ? undefined : menu.path, // 确保 path 不为 null，避免 @umijs/route-utils mergePath 报错
      name: menuName,
      icon: iconElement,
      key: menu.uuid || menu.path, // 添加 key 字段，ProLayout 需要
      // 如果菜单有子项，确保子项也有 key（应用菜单的子项也是应用菜单）
      children: menu.children && menu.children.length > 0
        ? menu.children.map(child => convertMenuTreeToMenuDataItem(child, t, isAppMenu, depth + 1))
        : undefined,
    };
    if (menu.permission_code) {
      (menuItem as any).permissionCodes = [menu.permission_code];
    }

    // 如果菜单没有 path，说明是分组标题，需要特殊处理
    if (!menu.path && menu.children && menu.children.length > 0) {
      // 对于有子菜单但没有 path 的菜单项，ProLayout 会将其作为分组标题处理
      // 但我们需要确保子菜单能正确显示
      menuItem.path = undefined; // 明确设置为 undefined
    }

    // 从 meta 同步 type、className、hideInMenu（数据库系统菜单入库后使用）
    const meta = (menu as { meta?: Record<string, any> }).meta;
    if (meta) {
      if (meta.type === 'group') menuItem.type = 'group';
      if (meta.className) menuItem.className = meta.className;
      if (meta.hideInMenu === true) menuItem.hideInMenu = true;
    }

    return menuItem;
  
}
