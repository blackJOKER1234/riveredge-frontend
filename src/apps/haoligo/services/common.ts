/**
 * 好力 GO 业务 API（/api/v1/apps/haoligo）
 */

import { apiRequest } from '../../../services/api';

const PREFIX = '/apps/haoligo';

export interface PageResult<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface HaoligoMeta {
  app_key: string;
  display_name: string;
  api_prefix: string;
}

export function fetchHaoligoMeta(): Promise<HaoligoMeta> {
  return apiRequest(`${PREFIX}/meta`);
}

export type MaintenanceReminderSummary = {
  total_ledger: number;
  actionable: number;
  filtered_total?: number;
  by_kind?: Record<string, number>;
  by_level?: Record<string, number>;
};
/** 为当前租户创建缺失的好力 GO 维保完成单打印模板预设（幂等） */
export function loadHaoligoPrintTemplatePresets(): Promise<{ created: number }> {
  return apiRequest(`${PREFIX}/print/load-presets`, { method: 'POST' });
}

/** 加载好力 GO 消息提醒规则预设（幂等；已有规则仅合并缺失的收件范围） */
export function loadHaoligoNotificationRulePresets(): Promise<{
  created: number;
  updated: number;
  skipped_duplicate: number;
  skipped_missing_template: number;
  total_rules: number;
}> {
  return apiRequest(`${PREFIX}/config/notification-rules/load-presets`, { method: 'POST' });
}
