/**
 * 好力 GO 模具业务 API（/api/v1/apps/haoligo/molds）
 */

import { apiRequest } from '../../../services/api';
import type { MaintenanceReminderSummary, PageResult } from './common';

const PREFIX = '/apps/haoligo';
/** 模具仓库（与后端 MoldWarehouseOut 对齐） */
export interface MoldWarehouseRow {
  id: number;
  uuid: string;
  warehouse_code: string;
  warehouse_name: string;
  warehouse_type: '内部' | '外部';
  supplier_uuid?: string | null;
  supplier_code?: string | null;
  supplier_name?: string | null;
  workshop_id?: number | null;
  workshop_code?: string | null;
  workshop_name?: string | null;
}

export type MoldWarehouseCreatePayload = {
  warehouse_code: string;
  warehouse_name: string;
  warehouse_type: '内部' | '外部';
  workshop_id?: number | null;
  supplier_uuid?: string | null;
};

export type MoldWarehouseUpdatePayload = {
  warehouse_code?: string;
  warehouse_name?: string;
  warehouse_type?: '内部' | '外部';
  workshop_id?: number | null;
  supplier_uuid?: string | null;
};

export function listMoldWarehouses(params?: {
  keyword?: string;
  warehouse_type?: string;
}): Promise<MoldWarehouseRow[]> {
  return apiRequest(`${PREFIX}/molds/warehouses`, { params });
}

export function getMoldWarehouse(rowId: number): Promise<MoldWarehouseRow> {
  return apiRequest(`${PREFIX}/molds/warehouses/${rowId}`);
}

export function createMoldWarehouse(body: MoldWarehouseCreatePayload): Promise<MoldWarehouseRow> {
  return apiRequest(`${PREFIX}/molds/warehouses`, { method: 'POST', data: body });
}

export function updateMoldWarehouse(rowId: number, body: MoldWarehouseUpdatePayload): Promise<MoldWarehouseRow> {
  return apiRequest(`${PREFIX}/molds/warehouses/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteMoldWarehouse(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/warehouses/${rowId}`, { method: 'DELETE' });
}

/** 模具台账（与后端 MoldOut 对齐） */
export interface MoldRow {
  id: number;
  uuid: string;
  mold_code: string;
  name: string;
  unit: string;
  mold_capacity: string;
  processing_time_min?: number | null;
  /** 模具寿命（累计产量上限） */
  service_life_years?: string | number | null;
  usable_times?: number | null;
  usable_yield?: string | null;
  maintenance_cycle_by_yield?: string | null;
  allow_repeated_borrow: boolean;
  purchase_vendor_name?: string | null;
  factory_entry_at?: string | null;
  status: string;
  total_manufacture_qty: string;
  outsource_vendor_code?: string | null;
  outsource_vendor_name?: string | null;
  mold_warehouse_id?: number | null;
  mold_warehouse_code?: string | null;
  mold_warehouse_name?: string | null;
  erp_material_code?: string | null;
  remark?: string | null;
  /** 来源：sync=数据集同步，manual=手工创建/导入 */
  ledger_source?: string;
  /** 已使用次数（每笔还入单 +1，存于台账） */
  used_times?: number;
  /** 已使用产量（还入制造数量累计） */
  used_yield?: string;
  /** 试模不合格待处理：记忆的消息提醒人员 */
  trial_pending_notify_user_ids?: number[];
  upkeep_param_set_id?: number | null;
}

export type MoldCreatePayload = {
  mold_code: string;
  name: string;
  unit: string;
  mold_capacity: string | number;
  service_life_years?: string | number | null;
  usable_times?: number | null;
  usable_yield?: string | number | null;
  maintenance_cycle_by_yield?: string | number | null;
  allow_repeated_borrow: boolean;
  purchase_vendor_name?: string | null;
  factory_entry_at?: string | null;
  status: string;
  total_manufacture_qty?: string | number;
  outsource_vendor_code?: string | null;
  outsource_vendor_name?: string | null;
  mold_warehouse_id?: number | null;
  erp_material_code?: string | null;
  remark?: string | null;
  upkeep_param_set_id?: number | null;
};

export type MoldUpdatePayload = Partial<Omit<MoldCreatePayload, 'mold_code'>>;

export function listMolds(params?: {
  skip?: number;
  limit?: number;
  status?: string;
  mold_code?: string;
  name?: string;
  /** sync | manual */
  ledger_source?: string;
  /** 模糊：代号/名称/单位/厂商与物料编码/备注（后端 icontains OR） */
  keyword?: string;
}): Promise<PageResult<MoldRow>> {
  return apiRequest(`${PREFIX}/molds`, { params });
}

/** 保养预警表：各模具最近保养完修时间（厂内 + 外协已通过） */
export function fetchMaintenanceUpkeepLastByMold(): Promise<{ items: Record<string, string> }> {
  return apiRequest(`${PREFIX}/molds/reports/maintenance-upkeep-last-by-mold`);
}

export type MoldMaintenanceReminderItem = {
  id: number;
  mold_code: string;
  name: string;
  status?: string | null;
  maintenance_cycle_by_yield?: string | null;
  used_yield?: string | null;
  total_manufacture_qty?: string | null;
  usable_yield?: string | null;
  alert_level: 'critical' | 'warning' | 'ok';
  alert_reasons: string[];
  reminder_kind: 'manual_maintenance' | 'cycle_plan' | 'setup_no_cycle' | 'setup_no_baseline';
  dominant_dimension?: 'yield' | 'yield_total' | null;
  dominant_ratio: number;
  last_upkeep_at?: string | null;
  yield_usage_pct?: number | null;
  total_yield_usage_pct?: number | null;
  remaining_yield_pct?: number | null;
};

export function fetchMoldMaintenanceReminders(params?: {
  keyword?: string;
  severity_min?: string;
  actionable_only?: boolean;
  reminder_kinds?: string;
  status?: string;
  limit?: number;
  offset?: number;
  preview?: boolean;
}): Promise<{ items: MoldMaintenanceReminderItem[]; summary: MaintenanceReminderSummary }> {
  return apiRequest(`${PREFIX}/molds/reports/maintenance-reminders`, { params });
}

export function getMold(rowId: number): Promise<MoldRow> {
  return apiRequest(`${PREFIX}/molds/${rowId}`);
}

/** 模具台账详情 — 操作记录（与后端 MoldOperationRecordOut 对齐） */
export type MoldOperationRecordKind =
  | 'borrow'
  | 'return'
  | 'trial'
  | 'maintenance'
  | 'maintenance_complete'
  | 'outsource_maintenance'
  | 'outsource_maintenance_complete';

export interface MoldOperationRecordRow {
  kind: MoldOperationRecordKind;
  occurred_at: string;
  record_id: number;
  uuid: string;
  title: string;
  detail: string;
  /** 标准业务单号；历史数据可能为空 */
  sheet_no?: string | null;
}

export function listMoldOperationRecords(rowId: number): Promise<{ items: MoldOperationRecordRow[] }> {
  return apiRequest(`${PREFIX}/molds/${rowId}/operation-records`);
}

export function createMold(body: MoldCreatePayload): Promise<MoldRow> {
  return apiRequest(`${PREFIX}/molds`, { method: 'POST', data: body });
}

export function updateMold(rowId: number, body: MoldUpdatePayload): Promise<MoldRow> {
  return apiRequest(`${PREFIX}/molds/${rowId}`, { method: 'PATCH', data: body });
}

/** 批量更新寿命/维修周期/状态等（与列表筛选一致） */
export type MoldBatchLifecycleScope = 'selected' | 'all_filtered';

export interface MoldBatchLifecyclePayload {
  scope: MoldBatchLifecycleScope;
  mold_ids?: number[];
  filter_status?: string;
  filter_keyword?: string;
  service_life_years?: string | number;
  usable_times?: number;
  maintenance_cycle_by_yield?: string | number;
  status?: string;
  /** 显式传 null 表示批量清空所在仓库 */
  mold_warehouse_id?: number | null;
}

export function batchMoldsLifecycle(body: MoldBatchLifecyclePayload): Promise<{ updated: number }> {
  return apiRequest(`${PREFIX}/molds/batch-lifecycle`, { method: 'POST', data: body });
}

export function deleteMold(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/${rowId}`, { method: 'DELETE' });
}

/** 模具台账 ↔ 数据集关联（同步代号/名称/单位；可选映射单模产能、入厂时间） */
export interface MoldLedgerDatasetBindingPayload {
  dataset_uuid?: string | null;
  mold_code_column?: string | null;
  mold_name_column?: string | null;
  unit_column?: string | null;
  mold_capacity_column?: string | null;
  factory_entry_at_column?: string | null;
}

export function getMoldLedgerDatasetBinding(): Promise<MoldLedgerDatasetBindingPayload> {
  return apiRequest(`${PREFIX}/molds/ledger/dataset-binding`);
}

export function putMoldLedgerDatasetBinding(
  body: MoldLedgerDatasetBindingPayload,
): Promise<MoldLedgerDatasetBindingPayload> {
  return apiRequest(`${PREFIX}/molds/ledger/dataset-binding`, { method: 'PUT', data: body });
}

export interface MoldLedgerSyncResult {
  created: number;
  updated: number;
  skipped: number;
}

export function syncMoldLedgerFromDataset(): Promise<MoldLedgerSyncResult> {
  return apiRequest(`${PREFIX}/molds/ledger/sync-from-dataset`, { method: 'POST' });
}

/** 试模单（与后端 MoldTrialSheetOut 对齐） */
export interface MoldTrialSheetRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  purchase_order_no?: string | null;
  supplier_name?: string | null;
  mold_code?: string | null;
  mold_name?: string | null;
  trial_times?: number | null;
  trial_user_id?: number | null;
  trial_user_name?: string | null;
  failure_handling?: string | null;
  pending_notify_user_ids?: number[];
  pending_notify_users?: Array<{ id: number; name: string }>;
  submitted_notify_user_ids?: number[];
  submitted_notify_users?: Array<{ id: number; name: string }>;
  repair_warehouse_id?: number | null;
  dispatch_origin_warehouse_id?: number | null;
  result_attachment_file_uuids: string[];
  inspection_attachment_file_uuids: string[];
  trial_result: string;
  /** 试模 / 试模合格待试产 / 已结案 */
  workflow_phase?: string | null;
  production_trial_result?: string | null;
  production_trial_user_id?: number | null;
  production_trial_user_name?: string | null;
  adjustment_points?: string | null;
  sheet_status: string;
  audited_at?: string | null;
  audited_by_user_id?: number | null;
  created_at?: string | null;
}

export type MoldTrialSheetCreatePayload = {
  purchase_order_no?: string | null;
  supplier_name?: string | null;
  mold_code?: string | null;
  mold_name?: string | null;
  /** 创建时由后端按模具代号（或采购订单号）自动累计，勿传 */
  result_attachment_file_uuids?: string[];
  inspection_attachment_file_uuids?: string[];
  trial_result: '合格' | '不合格';
  trial_user_id?: number;
  failure_handling?: '待处理' | '立即送修' | null;
  pending_notify_user_ids?: number[];
  submitted_notify_user_ids?: number[];
  repair_warehouse_id?: number | null;
  production_trial_result?: '合格' | '不合格' | null;
  production_trial_user_id?: number;
  adjustment_points?: string | null;
};

export type MoldTrialSheetUpdatePayload = Partial<MoldTrialSheetCreatePayload>;

export function previewTrialSupplierNotifyUsers(params?: {
  supplier_name?: string;
}): Promise<{ items: { id: number; name: string }[] }> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/supplier-notify-preview`, { params });
}

export function previewTrialRepairNotifyUsers(params?: {
  supplier_name?: string;
  trial_user_id?: number;
}): Promise<{ items: { id: number; name: string }[] }> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/repair-notify-preview`, { params });
}

/** 试模单表单人员搜索（create/update 权限即可，不依赖 system:user:read） */
export function searchMoldTrialOperators(params?: {
  page?: number;
  page_size?: number;
  keyword?: string;
  department_uuid?: string;
  is_active?: boolean;
}): Promise<{
  items: Array<{ id: number; uuid: string; username: string; full_name?: string | null; label: string }>;
  total: number;
  page: number;
  page_size: number;
}> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/operator-search`, { params });
}

/** 试模单表单人员回显解析 */
export function resolveMoldTrialOperators(payload: {
  user_ids?: number[];
  user_uuids?: string[];
}): Promise<{
  items: Array<{ id: number; uuid: string; username: string; full_name?: string | null; label: string }>;
}> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/operator-resolve`, {
    method: 'POST',
    data: payload,
  });
}

export function listMoldTrialSheets(params?: {
  skip?: number;
  limit?: number;
  sheet_status?: string;
  trial_result?: string;
  keyword?: string;
  /** ISO8601，含边界由前端按日起止传入 */
  created_from?: string;
  created_to?: string;
}): Promise<PageResult<MoldTrialSheetRow>> {
  return apiRequest(`${PREFIX}/molds/trial-sheets`, { params });
}

export function getMoldTrialSheet(rowId: number): Promise<MoldTrialSheetRow> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/${rowId}`);
}

/** 新建试模单前预览：本单为第几次试模（与创建时自动计数规则一致） */
export function getNextMoldTrialTimes(params?: {
  mold_code?: string;
  purchase_order_no?: string;
}): Promise<{
  trial_times: number;
  can_create: boolean;
  blocking_sheet_no?: string | null;
}> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/next-trial-times`, { params });
}

/** 仍有未完结试模流程的模具（待启用选用列表过滤） */
export function getMoldTrialIncompleteMolds(): Promise<{
  items: { mold_code: string; blocking_sheet_no?: string | null; blocking_sheet_id: number }[];
}> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/incomplete-molds`);
}

export function createMoldTrialSheet(body: MoldTrialSheetCreatePayload): Promise<MoldTrialSheetRow> {
  return apiRequest(`${PREFIX}/molds/trial-sheets`, { method: 'POST', data: body });
}

export function updateMoldTrialSheet(rowId: number, body: MoldTrialSheetUpdatePayload): Promise<MoldTrialSheetRow> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteMoldTrialSheet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/${rowId}`, { method: 'DELETE' });
}

export function approveMoldTrialSheet(rowId: number): Promise<MoldTrialSheetRow> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/${rowId}/approve`, { method: 'POST' });
}

export function rejectMoldTrialSheet(rowId: number): Promise<MoldTrialSheetRow> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/${rowId}/reject`, { method: 'POST' });
}

export function revokeMoldTrialSheetApproval(rowId: number): Promise<MoldTrialSheetRow> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/${rowId}/revoke-approval`, { method: 'POST' });
}

export function getMoldTrialViewerContext(): Promise<{
  is_external_partner: boolean;
}> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/viewer-context`);
}

export function dispatchMoldTrialSheet(
  rowId: number,
  body: { target_warehouse_id: number },
): Promise<MoldTrialSheetRow> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/${rowId}/dispatch`, { method: 'POST', data: body });
}

export function markMoldTrialSheetAdjustmentComplete(rowId: number): Promise<MoldTrialSheetRow> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/${rowId}/mark-adjustment-complete`, { method: 'POST' });
}

export function recallMoldTrialSheet(
  rowId: number,
  body?: { target_warehouse_id?: number | null },
): Promise<MoldTrialSheetRow> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/${rowId}/recall`, { method: 'POST', data: body ?? {} });
}

/** 试模单 ↔ 数据集关联（按采购订单号执行查询并映射列） */
export interface MoldTrialDatasetBindingPayload {
  dataset_uuid?: string | null;
  /** 与 SQL 中 :参数名 一致，不填则不在「采购订单号」失焦时自动查询 */
  order_param_key?: string | null;
  supplier_column?: string | null;
  mold_code_column?: string | null;
  mold_name_column?: string | null;
  /** 查询结果里采购订单号列的别名，用于列表选单与带出 */
  purchase_order_column?: string | null;
}

export function getMoldTrialDatasetBinding(): Promise<MoldTrialDatasetBindingPayload> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/dataset-binding`);
}

export function putMoldTrialDatasetBinding(
  body: MoldTrialDatasetBindingPayload,
): Promise<MoldTrialDatasetBindingPayload> {
  return apiRequest(`${PREFIX}/molds/trial-sheets/dataset-binding`, { method: 'PUT', data: body });
}

/** 外协维保单 — 明细行 */
export interface OutsourceMaintLineRow {
  mold_code: string;
  mold_name?: string | null;
  repair_reason: string;
  repair_cost?: string | null;
  attachment_file_uuids: string[];
  mold_warehouse_id?: number | null;
  mold_warehouse_code?: string | null;
  mold_warehouse_name?: string | null;
  before_outsource_warehouse_id?: number | null;
}

/** 外协维保单（与后端 MoldOutsourceMaintenanceSheetOut 对齐） */
export interface MoldOutsourceMaintenanceSheetRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  applicant_user_id?: number | null;
  applicant_name?: string | null;
  department_uuid?: string | null;
  department_name?: string | null;
  outsourced_unit_code?: string | null;
  outsourced_unit_name: string;
  service_type: string;
  source_order_no?: string | null;
  urgency_level?: string;
  header_attachment_file_uuids: string[];
  submitted_notify_user_ids?: number[];
  line_items: OutsourceMaintLineRow[];
  primary_mold_code?: string | null;
  primary_mold_name?: string | null;
  primary_mold_warehouse_name?: string | null;
  sheet_status: string;
  audited_at?: string | null;
  audited_by_user_id?: number | null;
  created_at?: string | null;
  /** 是否可发起完修（维修类且尚无未驳回的关联完修单） */
  can_complete?: boolean;
  /** 维修进度：维修中 / 完修待审 / 维修完成 */
  repair_status?: string | null;
}

export type OutsourceMaintLinePayload = {
  mold_code: string;
  mold_name?: string | null;
  repair_reason: string;
  repair_cost?: string | number | null;
  attachment_file_uuids?: string[];
};

export type MoldOutsourceMaintenanceSheetCreatePayload = {
  outsourced_unit_code?: string | null;
  outsourced_unit_name: string;
  applicant_user_id: number;
  department_uuid: string;
  service_type: '维修' | '保养';
  source_order_no?: string | null;
  urgency_level?: '一般' | '紧急';
  header_attachment_file_uuids?: string[];
  submitted_notify_user_ids?: number[];
  line_items: OutsourceMaintLinePayload[];
};

export type MoldOutsourceMaintenanceSheetUpdatePayload = Partial<MoldOutsourceMaintenanceSheetCreatePayload>;

export function listMoldOutsourceMaintenanceSheets(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
  sheet_status?: string;
  repair_status?: string;
  /** 仅返回尚未关联未删除外协维保完修单的外协维保单（完修单选源） */
  open_for_complete?: boolean;
}): Promise<PageResult<MoldOutsourceMaintenanceSheetRow>> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-sheets`, { params });
}

/** 外协维修单「外协单位」下拉（走 haoligo 权限，不依赖主数据供应商菜单） */
export function listOutsourceMaintenanceSupplierOptions(params?: {
  limit?: number;
}): Promise<Array<{ uuid: string; code: string; name: string }>> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-sheets/supplier-options`, { params });
}

export function getMoldOutsourceMaintenanceSheet(rowId: number): Promise<MoldOutsourceMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-sheets/${rowId}`);
}

export function createMoldOutsourceMaintenanceSheet(
  body: MoldOutsourceMaintenanceSheetCreatePayload,
): Promise<MoldOutsourceMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-sheets`, { method: 'POST', data: body });
}

export function updateMoldOutsourceMaintenanceSheet(
  rowId: number,
  body: MoldOutsourceMaintenanceSheetUpdatePayload,
): Promise<MoldOutsourceMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-sheets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteMoldOutsourceMaintenanceSheet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-sheets/${rowId}`, { method: 'DELETE' });
}

export function approveMoldOutsourceMaintenanceSheet(
  rowId: number,
): Promise<MoldOutsourceMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-sheets/${rowId}/approve`, { method: 'POST' });
}

export function rejectMoldOutsourceMaintenanceSheet(
  rowId: number,
): Promise<MoldOutsourceMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-sheets/${rowId}/reject`, { method: 'POST' });
}

export function revokeMoldOutsourceMaintenanceSheetApproval(
  rowId: number,
): Promise<MoldOutsourceMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-sheets/${rowId}/revoke-approval`, {
    method: 'POST',
  });
}

/** 厂内维保单 — 明细行（与外协维保单行字段一致） */
export interface MoldMaintLineRow {
  mold_code: string;
  mold_name?: string | null;
  repair_reason: string;
  repair_cost?: string | null;
  attachment_file_uuids: string[];
}

export interface MoldMaintenanceSheetRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  applicant_user_id?: number | null;
  applicant_name?: string | null;
  department_uuid?: string | null;
  department_name?: string | null;
  service_type: string;
  source_order_no?: string | null;
  urgency_level?: string;
  header_attachment_file_uuids: string[];
  submitted_notify_user_ids?: number[];
  line_items: MoldMaintLineRow[];
  primary_mold_code?: string | null;
  primary_mold_name?: string | null;
  sheet_status: string;
  audited_at?: string | null;
  audited_by_user_id?: number | null;
  created_at?: string | null;
  /** 是否可发起完修/完成保养：已通过且尚无未删除的关联完修单 */
  can_complete?: boolean;
}

export type MoldMaintLinePayload = {
  mold_code: string;
  mold_name?: string | null;
  repair_reason: string;
  repair_cost?: string | number | null;
  attachment_file_uuids?: string[];
};

export type MoldMaintenanceSheetCreatePayload = {
  applicant_user_id: number;
  /** 须为末级部门 UUID，与表单下拉一致 */
  department_uuid: string;
  service_type: '维修' | '保养';
  source_order_no?: string | null;
  urgency_level?: '一般' | '紧急';
  header_attachment_file_uuids?: string[];
  submitted_notify_user_ids?: number[];
  line_items: MoldMaintLinePayload[];
};

export type MoldMaintenanceSheetUpdatePayload = Partial<MoldMaintenanceSheetCreatePayload>;

export function listMoldMaintenanceSheets(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
  sheet_status?: string;
  /** 维修 / 保养 */
  service_type?: string;
  /** 仅返回尚未关联未删除维保完修单的维保单（完修单选源） */
  open_for_complete?: boolean;
}): Promise<PageResult<MoldMaintenanceSheetRow>> {
  return apiRequest(`${PREFIX}/molds/maintenance-sheets`, { params });
}

export function getMoldMaintenanceSheet(rowId: number): Promise<MoldMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/maintenance-sheets/${rowId}`);
}

export function createMoldMaintenanceSheet(body: MoldMaintenanceSheetCreatePayload): Promise<MoldMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/maintenance-sheets`, { method: 'POST', data: body });
}

export function updateMoldMaintenanceSheet(
  rowId: number,
  body: MoldMaintenanceSheetUpdatePayload,
): Promise<MoldMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/maintenance-sheets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteMoldMaintenanceSheet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/maintenance-sheets/${rowId}`, { method: 'DELETE' });
}

export function approveMoldMaintenanceSheet(rowId: number): Promise<MoldMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/maintenance-sheets/${rowId}/approve`, { method: 'POST' });
}

export function rejectMoldMaintenanceSheet(rowId: number): Promise<MoldMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/maintenance-sheets/${rowId}/reject`, { method: 'POST' });
}

export function revokeMoldMaintenanceSheetApproval(rowId: number): Promise<MoldMaintenanceSheetRow> {
  return apiRequest(`${PREFIX}/molds/maintenance-sheets/${rowId}/revoke-approval`, { method: 'POST' });
}

/** 维保完修单 — 模具行 */
export interface MoldUpkeepRecordLineRow {
  param_id: number;
  param_code: string;
  param_name: string;
  requirement?: string | null;
  is_required: boolean;
  sort_order: number;
  record_value?: string | null;
}

export interface MoldCompleteLineRow {
  mold_code: string;
  mold_name?: string | null;
  repair_reason?: string | null;
  /** 保养完修：该模具是否重置总产量（维修单恒为 false） */
  clear_total_production?: boolean;
  upkeep_content?: string | null;
  upkeep_param_set_id?: number | null;
  upkeep_record_lines?: MoldUpkeepRecordLineRow[];
  repair_content?: string | null;
  repair_result?: string | null;
  /** 完修单上传：模具图片（保养后 / 维修后） */
  attachment_file_uuids?: string[];
  /** 来源维保单该行模具图（保养前 / 维修前，接口只读，用于对比） */
  source_attachment_file_uuids?: string[];
}

/** 维保完修单·维修结果选项（须与后端 `MOLD_MAINTENANCE_COMPLETE_REPAIR_RESULTS` 一致） */
export const HAOLIGO_MAINTENANCE_COMPLETE_REPAIR_RESULTS = [
  '维修完成',
  '待观察',
  '需返修',
  '报废',
  '转外协',
  '无法修复',
] as const;

export interface MoldMaintenanceCompleteSheetRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  source_maintenance_sheet_id?: number | null;
  source_order_no: string;
  applicant_user_id?: number | null;
  applicant_name?: string | null;
  department_uuid?: string | null;
  department_name?: string | null;
  service_type: string;
  clear_total_production: boolean;
  header_attachment_file_uuids: string[];
  /** 来源维保单表头附件（保养前 / 维修前，只读，用于对比） */
  source_header_attachment_file_uuids?: string[];
  line_items: MoldCompleteLineRow[];
  primary_mold_code?: string | null;
  complete_notify_user_ids?: number[];
  created_at?: string | null;
}

export type MoldUpkeepRecordLinePayload = {
  param_id: number;
  record_value?: string | null;
};

export type MoldCompleteLinePayload = {
  mold_code: string;
  mold_name?: string | null;
  repair_reason?: string | null;
  clear_total_production?: boolean;
  upkeep_content?: string | null;
  upkeep_param_set_id?: number | null;
  upkeep_record_lines?: MoldUpkeepRecordLinePayload[];
  repair_content?: string | null;
  repair_result?: string | null;
  attachment_file_uuids?: string[];
};

/** 新建维保完修单：须指定维保单；`line_items` 与维保单模具一致且含每模完修项 */
export type MoldMaintenanceCompleteSheetCreatePayload = {
  source_maintenance_sheet_id: number;
  /** 缺省由后端从来源维保单带出 */
  applicant_user_id?: number;
  department_uuid?: string;
  line_items: MoldCompleteLinePayload[];
  header_attachment_file_uuids?: string[];
  complete_notify_user_ids?: number[];
};

export type MoldMaintenanceCompleteSheetUpdatePayload = {
  source_maintenance_sheet_id?: number | null;
  source_order_no?: string;
  applicant_user_id?: number;
  department_uuid?: string;
  service_type?: '维修' | '保养';
  header_attachment_file_uuids?: string[];
  line_items?: MoldCompleteLinePayload[];
  complete_notify_user_ids?: number[];
};

export function listMoldMaintenanceCompleteSheets(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
  service_type?: string;
  created_from?: string;
  created_to?: string;
}): Promise<PageResult<MoldMaintenanceCompleteSheetRow>> {
  return apiRequest(`${PREFIX}/molds/maintenance-complete-sheets`, { params });
}

export function getMoldMaintenanceCompleteSheet(rowId: number): Promise<MoldMaintenanceCompleteSheetRow> {
  return apiRequest(`${PREFIX}/molds/maintenance-complete-sheets/${rowId}`);
}

export function createMoldMaintenanceCompleteSheet(
  body: MoldMaintenanceCompleteSheetCreatePayload,
): Promise<MoldMaintenanceCompleteSheetRow> {
  return apiRequest(`${PREFIX}/molds/maintenance-complete-sheets`, { method: 'POST', data: body });
}

export function updateMoldMaintenanceCompleteSheet(
  rowId: number,
  body: MoldMaintenanceCompleteSheetUpdatePayload,
): Promise<MoldMaintenanceCompleteSheetRow> {
  return apiRequest(`${PREFIX}/molds/maintenance-complete-sheets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteMoldMaintenanceCompleteSheet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/maintenance-complete-sheets/${rowId}`, { method: 'DELETE' });
}

/** 外协维保完修单 — 模具行 */
export interface MoldOutsourceCompleteLineRow {
  mold_code: string;
  mold_name?: string | null;
  repair_reason?: string | null;
  repair_content?: string | null;
  repair_result?: string | null;
  repair_cost?: string | number | null;
  attachment_file_uuids: string[];
  /** 来源外协维保单该行附件（维修前，只读对比） */
  source_attachment_file_uuids?: string[];
  mold_warehouse_id?: number | null;
  mold_warehouse_code?: string | null;
  mold_warehouse_name?: string | null;
}

export interface MoldOutsourceMaintenanceCompleteSheetRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  source_outsource_maintenance_sheet_id?: number | null;
  source_order_no: string;
  applicant_user_id?: number | null;
  applicant_name?: string | null;
  department_uuid?: string | null;
  department_name?: string | null;
  outsourced_unit_code?: string | null;
  outsourced_unit_name: string;
  service_type: string;
  clear_total_production: boolean;
  header_attachment_file_uuids: string[];
  source_header_attachment_file_uuids?: string[];
  line_items: MoldOutsourceCompleteLineRow[];
  primary_mold_code?: string | null;
  primary_mold_warehouse_name?: string | null;
  sheet_status?: string;
  audited_at?: string | null;
  audited_by_user_id?: number | null;
  complete_notify_user_ids?: number[];
  created_at?: string | null;
}

export type MoldOutsourceCompleteLinePayload = {
  mold_code: string;
  mold_name?: string | null;
  repair_reason?: string | null;
  repair_content?: string | null;
  repair_result?: string | null;
  repair_cost?: string | number | null;
  attachment_file_uuids?: string[];
};

/** 新建外协维保完修单：须指定外协维保单；`line_items` 与维保单模具一致 */
export type MoldOutsourceMaintenanceCompleteSheetCreatePayload = {
  source_outsource_maintenance_sheet_id: number;
  applicant_user_id?: number;
  department_uuid?: string;
  header_attachment_file_uuids?: string[];
  line_items: MoldOutsourceCompleteLinePayload[];
  complete_notify_user_ids?: number[];
};

export type MoldOutsourceMaintenanceCompleteSheetUpdatePayload = {
  source_outsource_maintenance_sheet_id?: number | null;
  source_order_no?: string;
  applicant_user_id?: number;
  department_uuid?: string;
  outsourced_unit_code?: string | null;
  outsourced_unit_name?: string;
  header_attachment_file_uuids?: string[];
  line_items?: MoldOutsourceCompleteLinePayload[];
  complete_notify_user_ids?: number[];
};

export function listMoldOutsourceMaintenanceCompleteSheets(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
  sheet_status?: string;
  created_from?: string;
  created_to?: string;
}): Promise<PageResult<MoldOutsourceMaintenanceCompleteSheetRow>> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets`, { params });
}

export function getMoldOutsourceMaintenanceCompleteSheet(
  rowId: number,
): Promise<MoldOutsourceMaintenanceCompleteSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets/${rowId}`);
}

export function createMoldOutsourceMaintenanceCompleteSheet(
  body: MoldOutsourceMaintenanceCompleteSheetCreatePayload,
): Promise<MoldOutsourceMaintenanceCompleteSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets`, { method: 'POST', data: body });
}

export function updateMoldOutsourceMaintenanceCompleteSheet(
  rowId: number,
  body: MoldOutsourceMaintenanceCompleteSheetUpdatePayload,
): Promise<MoldOutsourceMaintenanceCompleteSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets/${rowId}`, {
    method: 'PATCH',
    data: body,
  });
}

export function deleteMoldOutsourceMaintenanceCompleteSheet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets/${rowId}`, { method: 'DELETE' });
}

export function listPendingMoldOutsourceMaintenanceCompleteSheetsMine(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
}): Promise<PageResult<MoldOutsourceMaintenanceCompleteSheetRow>> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets/pending-mine`, { params });
}

/** 外协维保完修单待审核（需审核权限） */
export function listPendingAuditMoldOutsourceMaintenanceCompleteSheets(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
}): Promise<PageResult<MoldOutsourceMaintenanceCompleteSheetRow>> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets/pending-audit`, { params });
}

/** 委外审核：当前用户为申请人的全部外协维保完修单（含待审核/已通过/已驳回） */
export function listAuditMoldOutsourceMaintenanceCompleteSheetsMine(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
  sheet_status?: string;
}): Promise<PageResult<MoldOutsourceMaintenanceCompleteSheetRow>> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets/audit-mine`, { params });
}

export function approveMoldOutsourceMaintenanceCompleteSheet(
  rowId: number,
): Promise<MoldOutsourceMaintenanceCompleteSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets/${rowId}/approve`, { method: 'POST' });
}

export function rejectMoldOutsourceMaintenanceCompleteSheet(
  rowId: number,
): Promise<MoldOutsourceMaintenanceCompleteSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets/${rowId}/reject`, { method: 'POST' });
}

export function revokeApprovalMoldOutsourceMaintenanceCompleteSheet(
  rowId: number,
): Promise<MoldOutsourceMaintenanceCompleteSheetRow> {
  return apiRequest(`${PREFIX}/molds/outsource-maintenance-complete-sheets/${rowId}/revoke-approval`, {
    method: 'POST',
  });
}

/** 领用单（与后端 MoldBorrowSheetOut 对齐） */
export interface MoldBorrowSheetRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  source_order_no?: string | null;
  department_uuid?: string | null;
  department_name: string;
  mold_code: string;
  mold_name: string;
  finished_product_code?: string | null;
  finished_product_name?: string | null;
  planned_qty?: string | null;
  created_at?: string | null;
}

export type MoldBorrowSheetCreatePayload = {
  source_order_no?: string | null;
  department_uuid?: string | null;
  department_name: string;
  mold_code: string;
  mold_name: string;
  finished_product_code?: string | null;
  finished_product_name?: string | null;
  planned_qty?: string | number | null;
};

export type MoldBorrowSheetUpdatePayload = Partial<MoldBorrowSheetCreatePayload>;

export function listMoldBorrowSheets(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
}): Promise<PageResult<MoldBorrowSheetRow>> {
  return apiRequest(`${PREFIX}/molds/borrow-sheets`, { params });
}

/** 按制令单号判断是否已有未删除的领用单；编辑时可传 exclude_sheet_id 排除当前行 */
export function getMoldBorrowSourceOrderUsage(params: {
  source_order_no: string;
  exclude_sheet_id?: number;
}): Promise<{ exists: boolean; count: number }> {
  return apiRequest(`${PREFIX}/molds/borrow-sheets/source-order-usage`, { params });
}

export function getMoldBorrowSheet(rowId: number): Promise<MoldBorrowSheetRow> {
  return apiRequest(`${PREFIX}/molds/borrow-sheets/${rowId}`);
}

export function createMoldBorrowSheet(body: MoldBorrowSheetCreatePayload): Promise<MoldBorrowSheetRow> {
  return apiRequest(`${PREFIX}/molds/borrow-sheets`, { method: 'POST', data: body });
}

export function updateMoldBorrowSheet(rowId: number, body: MoldBorrowSheetUpdatePayload): Promise<MoldBorrowSheetRow> {
  return apiRequest(`${PREFIX}/molds/borrow-sheets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteMoldBorrowSheet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/borrow-sheets/${rowId}`, { method: 'DELETE' });
}

/** 领用单 — 数据集绑定（制令单号为查询参数） */
export interface MoldBorrowDatasetBindingPayload {
  dataset_uuid?: string;
  work_order_param_key?: string;
  department_uuid_column?: string;
  department_name_column?: string;
  mold_code_column?: string;
  mold_name_column?: string;
  finished_product_code_column?: string;
  finished_product_name_column?: string;
  planned_qty_column?: string;
}

export interface MoldBorrowPrefillFromDatasetPayload {
  source_order_no: string;
}

export type MoldBorrowPrefillFromDatasetResult = {
  source_order_no: string;
  department_uuid?: string | null;
  department_name: string;
  mold_code?: string | null;
  mold_name?: string | null;
  finished_product_code?: string | null;
  finished_product_name?: string | null;
  planned_qty?: string | number | null;
};

export function getMoldBorrowDatasetBinding(): Promise<MoldBorrowDatasetBindingPayload> {
  return apiRequest(`${PREFIX}/molds/borrow-sheets/dataset-binding`);
}

export function putMoldBorrowDatasetBinding(
  body: MoldBorrowDatasetBindingPayload,
): Promise<MoldBorrowDatasetBindingPayload> {
  return apiRequest(`${PREFIX}/molds/borrow-sheets/dataset-binding`, { method: 'PUT', data: body });
}

export function prefillMoldBorrowSheetFromDataset(
  body: MoldBorrowPrefillFromDatasetPayload,
): Promise<MoldBorrowPrefillFromDatasetResult> {
  return apiRequest(`${PREFIX}/molds/borrow-sheets/prefill-from-dataset`, { method: 'POST', data: body });
}

/** 还入单（移动端：制令单、领用单、领出部门、模具/成品、制造数量） */
export interface MoldReturnSheetRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  production_order_no?: string | null;
  borrow_sheet_no?: string | null;
  issue_department_uuid?: string | null;
  issue_department_name?: string | null;
  mold_code: string;
  mold_name: string;
  finished_product_code?: string | null;
  finished_product_name?: string | null;
  planned_qty?: string | null;
  manufacture_qty: string;
  created_at?: string | null;
}

export type MoldReturnSheetCreatePayload = {
  production_order_no?: string | null;
  borrow_sheet_no?: string | null;
  issue_department_uuid?: string | null;
  issue_department_name?: string | null;
  mold_code: string;
  mold_name: string;
  finished_product_code?: string | null;
  finished_product_name?: string | null;
  planned_qty?: string | number | null;
  manufacture_qty: string | number;
};

export type MoldReturnSheetUpdatePayload = Partial<MoldReturnSheetCreatePayload>;

export function listMoldReturnSheets(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
}): Promise<PageResult<MoldReturnSheetRow>> {
  return apiRequest(`${PREFIX}/molds/return-sheets`, { params });
}

export type MoldReturnBorrowLookupResult = {
  borrow_sheet_id: number;
  borrow_sheet_no: string;
  production_order_no?: string | null;
  issue_department_uuid?: string | null;
  issue_department_name?: string | null;
  mold_code: string;
  mold_name: string;
  finished_product_code?: string | null;
  finished_product_name?: string | null;
  planned_qty?: string | number | null;
};

export function getMoldReturnBorrowLookup(params: {
  production_order_no?: string;
  mold_code?: string;
}): Promise<MoldReturnBorrowLookupResult> {
  return apiRequest(`${PREFIX}/molds/return-sheets/borrow-lookup`, { params });
}

export function getMoldReturnSheet(rowId: number): Promise<MoldReturnSheetRow> {
  return apiRequest(`${PREFIX}/molds/return-sheets/${rowId}`);
}

export function createMoldReturnSheet(body: MoldReturnSheetCreatePayload): Promise<MoldReturnSheetRow> {
  return apiRequest(`${PREFIX}/molds/return-sheets`, { method: 'POST', data: body });
}

export function updateMoldReturnSheet(rowId: number, body: MoldReturnSheetUpdatePayload): Promise<MoldReturnSheetRow> {
  return apiRequest(`${PREFIX}/molds/return-sheets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteMoldReturnSheet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/return-sheets/${rowId}`, { method: 'DELETE' });
}
