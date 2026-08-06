import { TenantPlan } from '../../services/tenant';

/** 系统设置浮层分组展示顺序 */
export const SYSTEM_SETTINGS_GROUP_ORDER = [
  'core-config-group',
  'user-management-group',
  'personal-center-group',
  'data-center-group',
  'process-management-group',
  'monitoring-ops-group',
] as const;

/**
 * 系统设置浮层分组栅格占位（按 24 栅格）
 * 第一行：核心配置(12) + 用户管理(6) + 个人中心(6) = 24
 * 第二行：数据中心(9) + 流程管理(9) + 监控运维(6) = 24
 */
export const SYSTEM_SETTINGS_GROUP_SPAN: Record<string, number> = {
  'core-config-group': 12,
  'user-management-group': 6,
  'personal-center-group': 6,
  'data-center-group': 9,
  'process-management-group': 9,
  'monitoring-ops-group': 6,
};

/** 浮层中不展示、改由顶栏承载的系统菜单 path */
export const SYSTEM_SETTINGS_PANEL_HIDDEN_PATHS = new Set([
  '/system/onboarding-wizard',
  '/system/launch-progress',
]);

/** 租户套餐 → i18n key */
export const TENANT_PLAN_I18N_KEY: Record<string, string> = {
  [TenantPlan.TRIAL]: 'pages.infra.tenant.planTrial',
  [TenantPlan.BASIC]: 'pages.infra.tenant.planBasic',
  [TenantPlan.PROFESSIONAL]: 'pages.infra.tenant.planProfessional',
  [TenantPlan.ENTERPRISE]: 'pages.infra.tenant.planEnterprise',
};

/** 系统设置浮层 path → Fluent Color icon 名 */
export const SYSTEM_PANEL_ICON_MAP: Record<string, string> = {
  '/system/applications': 'fluent-color:apps-24',
  '/system/menus': 'fluent-color:apps-list-detail-24',
  '/system/site-settings': 'fluent-color:settings-24',
  '/system/config-center': 'fluent-color:briefcase-24',
  '/system/data-dictionaries': 'fluent-color:book-open-24',
  '/system/languages': 'fluent-color:globe-24',
  '/system/code-rules': 'fluent-color:code-24',
  '/system/custom-fields': 'fluent-color:form-24',
  '/system/departments': 'fluent-color:building-24',
  '/system/positions': 'fluent-color:people-list-24',
  '/system/roles': 'fluent-color:shield-24',
  '/system/users': 'fluent-color:people-24',
  '/system/files': 'fluent-color:document-folder-24',
  '/system/initial-data': 'fluent-color:text-bullet-list-square-sparkle-16',
  '/system/apis': 'fluent-color:puzzle-piece-16',
  '/system/data-sources': 'fluent-color:database-24',
  '/system/application-connections': 'fluent-color:data-pie-24',
  '/system/datasets': 'fluent-color:table-24',
  '/system/approval-processes': 'fluent-color:clipboard-task-24',
  '/system/approval-instances': 'fluent-color:checkmark-circle-24',
  '/system/messages/template': 'fluent-color:drafts-24',
  '/system/messages/config': 'fluent-color:chat-24',
  '/system/print-devices': 'fluent-color:phone-laptop-16',
  '/system/print-templates': 'fluent-color:document-24',
  '/system/operation-logs': 'fluent-color:history-24',
  '/system/login-logs': 'fluent-color:clock-24',
  '/system/online-users': 'fluent-color:people-team-24',
  '/system/data-backups': 'fluent-color:arrow-clockwise-dashes-24',
  '/personal/profile': 'fluent-color:person-24',
  '/personal/preferences': 'fluent-color:options-24',
  '/personal/messages': 'fluent-color:chat-24',
  '/personal/tasks': 'fluent-color:clipboard-24',
};

export const SYSTEM_PANEL_DEFAULT_ICON = 'fluent-color:apps-24';

/** 面板宽度推算常量（与 24 栅格视觉密度一致） */
export const SYSTEM_PANEL_WIDTH_TRACK = 26;
export const SYSTEM_PANEL_WIDTH_COLUMN_GAP = 12;
export const SYSTEM_PANEL_WIDTH_BODY_PADDING_X = 28;
export const SYSTEM_PANEL_WIDTH_BORDER = 2;

export function calcSystemSettingsPanelWidth(columns: number): number {
  return (
    columns * SYSTEM_PANEL_WIDTH_TRACK +
    (columns - 1) * SYSTEM_PANEL_WIDTH_COLUMN_GAP +
    SYSTEM_PANEL_WIDTH_BODY_PADDING_X +
    SYSTEM_PANEL_WIDTH_BORDER
  );
}

export function resolveSystemPanelIconName(path?: string): string {
  if (!path) return SYSTEM_PANEL_DEFAULT_ICON;
  if (SYSTEM_PANEL_ICON_MAP[path]) return SYSTEM_PANEL_ICON_MAP[path];
  const matchedPrefix = Object.keys(SYSTEM_PANEL_ICON_MAP).find((key) => path.startsWith(key));
  if (matchedPrefix) return SYSTEM_PANEL_ICON_MAP[matchedPrefix];
  return SYSTEM_PANEL_DEFAULT_ICON;
}
