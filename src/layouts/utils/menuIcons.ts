import React from 'react';
import { ManufacturingIcons } from '../../utils/manufacturingIcons';
import * as LucideIcons from 'lucide-react'; // 全量导入 Lucide Icons，支持动态访问所有图标
void LucideIcons;

export const getMenuIcon = (menuName: string, menuPath?: string): React.ReactNode => {
  // 根据菜单路径和名称映射到制造业图标
  // 优先使用路径匹配（路径是固定的，不受翻译影响）
  // 先按路径映射；未命中时再按名称映射

  // 路径映射（优先使用，因为路径是固定的，不受翻译影响）
  if (menuPath) {
    const pathMap: Record<string, React.ComponentType<any>> = {
      '/system': ManufacturingIcons.systemConfig,
      '/system/dashboard': ManufacturingIcons.industrialDashboard,
      '/system/dashboard/workplace': ManufacturingIcons.production,
      '/system/dashboard/analysis': ManufacturingIcons.chartLine,
      '/system/roles': ManufacturingIcons.shield, // 角色权限管理 - 使用盾牌图标
      '/system/departments': ManufacturingIcons.building, // 部门管理 - 使用建筑图标
      '/system/positions': ManufacturingIcons.userCog, // 职位管理 - 使用用户配置图标
      '/system/users': ManufacturingIcons.user, // 账户管理 - 使用单用户图标，和在线用户区分
      '/system/applications': ManufacturingIcons.layout, // 应用中心 - 使用应用入口/布局图标
      '/system/menus': ManufacturingIcons.menu, // 菜单管理 - 使用菜单图标
      '/system/site-settings': ManufacturingIcons.mdSettings, // 站点设置 - 使用设置图标
      '/system/config-center': ManufacturingIcons.mdConfiguration, // 业务配置 - 使用设置2图标，区别于站点设置
      '/system/business-config': ManufacturingIcons.mdConfiguration, // 重定向到 config-center
      '/system/system-parameters': ManufacturingIcons.mdConfiguration, // 重定向到 config-center
      '/system/data-dictionaries': ManufacturingIcons.bookOpen, // 数据字典 - 使用打开的书本图标
      '/system/code-rules': ManufacturingIcons.code, // 编号规则 - 使用代码图标
      '/system/integration-configs': ManufacturingIcons.network, // 数据连接 - 使用网络图标
      '/system/languages': ManufacturingIcons.languages, // 语言管理 - 使用语言图标
      '/system/custom-fields': ManufacturingIcons.toolbox, // 自定义字段 - 使用工具箱图标
      '/system/files': ManufacturingIcons.folder, // 文件管理 - 使用文件夹图标
      '/system/apis': ManufacturingIcons.api, // API管理 - 使用API图标
      '/system/data-sources': ManufacturingIcons.database, // 数据源 - 使用数据库图标
      '/system/application-connections': ManufacturingIcons.gitBranch, // 应用连接器 - 使用分支连接图标
      '/system/datasets': ManufacturingIcons.inventory, // 数据集 - 使用库存图标
      '/system/initial-data': ManufacturingIcons['arrow-down-to-line'], // 期初数据导入（导入入库）
      '/system/onboarding-wizard': ManufacturingIcons.compass, // 上线向导 - 指引/向导
      '/system/messages/config': ManufacturingIcons.bell, // 消息配置 - 使用铃铛图标
      '/system/messages/template': ManufacturingIcons.fileText, // 消息模板 - 使用文件文本图标
      '/system/approval-processes': ManufacturingIcons.workflow, // 审批流程 - 使用工作流图标
      '/system/approval-instances': ManufacturingIcons.checkCircle, // 审批实例 - 使用检查圆圈图标
      '/system/print-templates': ManufacturingIcons.fileSpreadsheet, // 打印模板 - 使用模板文档图标
      '/system/report-templates': ManufacturingIcons.chartBar, // 报表模板 - 使用柱状图图标
      '/system/print-devices': ManufacturingIcons.printer, // 打印设备 - 使用打印机图标
      '/personal': ManufacturingIcons.userCircle, // 个人中心 - 使用用户圆圈图标
      '/personal/profile': ManufacturingIcons.user, // 个人资料 - 使用用户图标
      '/personal/preferences': ManufacturingIcons.pencil, // 偏好设置 - 使用编辑图标，区别系统设置
      '/personal/messages': ManufacturingIcons.bell, // 我的消息 - 使用铃铛图标
      '/personal/tasks': ManufacturingIcons.checklist, // 我的任务 - 使用清单图标
      '/system/operation-logs': ManufacturingIcons.history, // 操作日志 - 使用历史图标
      '/system/login-logs': ManufacturingIcons.logIn, // 登录日志 - 使用登录图标
      '/system/online-users': ManufacturingIcons.users, // 在线用户 - 使用用户组图标
      '/system/data-backups': ManufacturingIcons.hardDrive, // 数据备份 - 使用硬盘图标
      '/infra/operation': ManufacturingIcons.analytics, // 运营中心 - 使用分析图标
      '/infra/tenants': ManufacturingIcons.building, // 租户管理 - 使用建筑图标（保持）
      '/infra/packages': ManufacturingIcons.package, // 应用包管理 - 使用包裹图标
      '/infra/scripts': ManufacturingIcons.fileCode, // 脚本管理
      '/infra/scheduled-tasks': ManufacturingIcons.clock, // 定时任务
      '/infra/admin': ManufacturingIcons.shield, // 平台管理 - 使用盾牌图标

      // 应用菜单路径图标映射（使用前缀匹配，支持 /apps/{app-code}/... 格式）
      '/apps/kuaizhizao/plan-management': ManufacturingIcons.calendar, // 计划管理 - 使用日历图标
      '/apps/kuaizhizao/production-execution': ManufacturingIcons.activity, // 生产执行 - 使用活动/执行图标
      '/apps/kuaizhizao/purchase-management': ManufacturingIcons.shoppingBag, // 采购管理 - 使用购物袋图标
      '/apps/kuaizhizao/sales-management': ManufacturingIcons.chartLine, // 销售管理 - 使用趋势上升图标（销售增长）
      '/apps/kuaizhizao/warehouse-management': ManufacturingIcons.warehouse, // 仓储管理 - 使用仓库图标
      '/apps/kuaizhizao/quality-management': ManufacturingIcons.quality, // 质量管理 - 使用质量图标
      '/apps/kuaizhizao/cost-management': ManufacturingIcons.calculator, // 成本管理 - 使用计算器图标
      '/apps/kuaizhizao/equipment-management': ManufacturingIcons.wrench, // 设备管理 - 扳手图标（与系统设置齿轮区分）
      '/apps/kuaizhizao/finance-management': ManufacturingIcons.wallet, // 财务管理 - 使用钱包图标
      '/apps/kuaireport/analysis-center': ManufacturingIcons.chartBar, // 分析中心（已迁至快报表）- 柱状图
      '/apps/kuaicrm': ManufacturingIcons.users, // 快客户
      '/apps/kuaipdm': ManufacturingIcons.layers, // 快研发
      '/apps/kuaicaiwu': ManufacturingIcons.wallet, // 快财务
      '/apps/kuaichain': ManufacturingIcons.gitBranch, // 快协同
      '/apps/kuaicaiwu/finance-management': ManufacturingIcons.wallet, // 财务管理
      '/apps/kuaicaiwu/cost-management': ManufacturingIcons.calculator, // 成本管理
      '/apps/kuaizhizao/performance': ManufacturingIcons.trophy, // 绩效管理 - 奖杯图标（与分析中心区分）
      '/apps/master-data': ManufacturingIcons.database, // 主数据 - 使用数据库图标
      '/apps/master-data/warehouse': ManufacturingIcons.archive, // 主数据-仓库数据 - 使用归档图标（区别于仓储管理）
      '/apps/master-data/supply-chain': ManufacturingIcons.handshake, // 主数据-客户供应商（客户+供应商）- 握手/合作图标
      '/apps/kuaireport': ManufacturingIcons.fileBarChart, // 快报表 - 报表/图表图标（与仪表盘、大屏中心区分）
      '/apps/kuaireport/reports': ManufacturingIcons.fileBarChart, // 报表中心
      '/apps/kuaireport/dashboards': ManufacturingIcons.layoutDashboard, // 大屏中心
      '/apps/kuaiai': ManufacturingIcons.sparkles, // KU-AI - 顶栏 AI 助手（无侧栏菜单）
      '/apps/haoligo/workspace': ManufacturingIcons.layoutDashboard, // 好力 GO 工作台（仪表板分组下）
      '/apps/haoligo/equipment': ManufacturingIcons.wrench, // 好力 GO 设备管理
      '/apps/haoligo/molds': ManufacturingIcons.package, // 好力 GO 模具管理
      '/apps/haoligo/patrol': ManufacturingIcons.clipboardCheck, // 好力 GO 现场巡查（点检/记录）
      '/apps/haoligo/quality': ManufacturingIcons['shield-check'], // 好力 GO 品质管理
    };

    // 精确路径匹配
    if (pathMap[menuPath]) {
      const IconComponent = pathMap[menuPath];
      return React.createElement(IconComponent, { size: 16 });
    }

    // 前缀路径匹配（用于父级菜单）
    const matchedPath = Object.keys(pathMap).find(path => menuPath.startsWith(path));
    if (matchedPath) {
      const IconComponent = pathMap[matchedPath];
      return React.createElement(IconComponent, { size: 16 });
    }
  }

  // 名称映射（路径未命中时使用，支持中英文）
  // 注意：菜单名称可能已翻译，路径匹配始终优先
  const nameMap: Record<string, React.ComponentType<any>> = {
    // 常见的中文和英文名称映射
    'Dashboard': ManufacturingIcons.industrialDashboard,
    'Workplace': ManufacturingIcons.production,
    'Analysis': ManufacturingIcons.chartLine,
    'Operations Dashboard': ManufacturingIcons.analytics,
    'Operations Center': ManufacturingIcons.operationsCenter,
    'User Management': ManufacturingIcons.users, // 用户管理 - 使用用户组图标
    'Users': ManufacturingIcons.users,
    'System Configuration': ManufacturingIcons.systemConfig,
    'Settings': ManufacturingIcons.systemConfig,
    'Personal Center': ManufacturingIcons.userCircle, // 个人中心 - 使用用户圆圈图标
    'Personal': ManufacturingIcons.userCircle,
    // 应用菜单名称映射
    'Plan Management': ManufacturingIcons.calendar,
    'Planning': ManufacturingIcons.calendar,
    'Production Execution': ManufacturingIcons.activity, // 生产执行 - 使用活动/执行图标
    'Production': ManufacturingIcons.activity,
    'Purchase Management': ManufacturingIcons.shoppingBag,
    'Purchasing': ManufacturingIcons.shoppingBag,
    'Sales Management': ManufacturingIcons.chartLine, // 销售管理 - 使用趋势上升图标（销售增长）
    'Sales': ManufacturingIcons.chartLine,
    'Warehouse Management': ManufacturingIcons.warehouse,
    'Warehouse': ManufacturingIcons.warehouse,
    'Quality Management': ManufacturingIcons.quality,
    'Quality': ManufacturingIcons.quality,
    '品质管理': ManufacturingIcons['shield-check'],
    'Cost Management': ManufacturingIcons.calculator,
    'Cost': ManufacturingIcons.calculator,
    'Equipment Management': ManufacturingIcons.wrench,
    'Equipment': ManufacturingIcons.wrench,
    'Finance Management': ManufacturingIcons.wallet, // 财务管理 - 使用钱包图标
    'Finance': ManufacturingIcons.wallet,
    'Tooling Management': ManufacturingIcons.wrench,
    'Tooling': ManufacturingIcons.wrench,
    'Analysis Center': ManufacturingIcons.analytics,
    'Analytics': ManufacturingIcons.analytics,
    // 基础数据管理相关
    '仓库数据': ManufacturingIcons.archive, // 基础数据管理-仓库数据 - 使用归档图标
    'Warehouse Data': ManufacturingIcons.archive, // 基础数据管理-仓库数据（英文）
    'Report Center': ManufacturingIcons.fileBarChart, // 报表中心
    'Dashboard Center': ManufacturingIcons.layoutDashboard, // 大屏中心
    '报表中心': ManufacturingIcons.fileBarChart,
    '大屏中心': ManufacturingIcons.layoutDashboard,
    // 自制报表（与仪表盘 Gauge 区分，避免重复）
    '自制报表': ManufacturingIcons.fileBarChart,
    'Reports & Dashboards': ManufacturingIcons.fileBarChart,
    'app.kuaireport.name': ManufacturingIcons.fileBarChart,
    // ... 其他常见的英文名称可以在这里添加
  };

  if (nameMap[menuName]) {
    const IconComponent = nameMap[menuName];
    return React.createElement(IconComponent, { size: 16 });
  }

  // 如果找不到匹配的图标，返回默认的 Lucide 图标
  return React.createElement(ManufacturingIcons.dashboard, { size: 16 });
};
