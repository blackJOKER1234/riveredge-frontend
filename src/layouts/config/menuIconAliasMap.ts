import type { ComponentType } from 'react';
import { ManufacturingIcons } from '../../utils/manufacturingIcons';

/**
 * 菜单 icon 字段别名 → ManufacturingIcons
 * 覆盖历史 Ant Design 图标名、部分应用 icon code
 */
export const MENU_ICON_ALIAS_MAP: Record<string, ComponentType<any>> = {
  DashboardOutlined: ManufacturingIcons.industrialDashboard,
  UserOutlined: ManufacturingIcons.user,
  TeamOutlined: ManufacturingIcons.users,
  ApartmentOutlined: ManufacturingIcons.building,
  CrownOutlined: ManufacturingIcons.crown,
  AppstoreOutlined: ManufacturingIcons.factory,
  ControlOutlined: ManufacturingIcons.systemConfig,
  ShopOutlined: ManufacturingIcons.shop,
  FileTextOutlined: ManufacturingIcons.fileText,
  DatabaseOutlined: ManufacturingIcons.database,
  MonitorOutlined: ManufacturingIcons.monitor,
  GlobalOutlined: ManufacturingIcons.languages, // 语言管理使用语言图标
  ApiOutlined: ManufacturingIcons.api,
  CodeOutlined: ManufacturingIcons.code,
  PrinterOutlined: ManufacturingIcons.printer,
  HistoryOutlined: ManufacturingIcons.history,
  UnorderedListOutlined: ManufacturingIcons.list,
  CalendarOutlined: ManufacturingIcons.calendar,
  PlayCircleOutlined: ManufacturingIcons.playCircle,
  InboxOutlined: ManufacturingIcons.inbox,
  SafetyOutlined: ManufacturingIcons.shield, // 安全相关使用盾牌图标
  ShoppingOutlined: ManufacturingIcons.shoppingCart,
  UserSwitchOutlined: ManufacturingIcons.userCog,
  SettingOutlined: ManufacturingIcons.mdSettings,
  BellOutlined: ManufacturingIcons.bell,
  LoginOutlined: ManufacturingIcons.logIn,
  BookOutlined: ManufacturingIcons.bookOpen, // 数据字典
  ClockCircleOutlined: ManufacturingIcons.clock, // 定时任务
  CheckCircleOutlined: ManufacturingIcons.checkCircle, // 审批实例
  // 快格轻制造应用图标映射
  planning: ManufacturingIcons.calendar, // 计划管理使用日历图标
  'shopping-cart': ManufacturingIcons.shoppingCart, // 销售管理使用购物车图标
  'bar-chart': ManufacturingIcons.chartBar, // 分析中心 - 柱状图
  chartBar: ManufacturingIcons.chartBar,
  analytics: ManufacturingIcons.chartBar, // 分析入口图标
  trophy: ManufacturingIcons.trophy, // 绩效管理 - 奖杯图标
  fileSpreadsheet: ManufacturingIcons.fileSpreadsheet, // 报表中心 - 表格图标
  fileBarChart: ManufacturingIcons.fileBarChart, // 自制报表 - 报表/图表图标
  layoutDashboard: ManufacturingIcons.layoutDashboard, // 大屏中心
};
