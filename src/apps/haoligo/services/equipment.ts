/**
 * 好力 GO 设备业务 API（/api/v1/apps/haoligo/equipment）
 */

import { apiRequest } from '../../../services/api';
import type { MaintenanceReminderSummary, PageResult } from './common';
import type { EquipmentUpkeepSchemeLineRow } from './maintenance';

const PREFIX = '/apps/haoligo';
export interface WorkshopRow {
  id: number;
  uuid: string;
  code: string;
  name: string;
}

export function listWorkshops(): Promise<WorkshopRow[]> {
  return apiRequest(`${PREFIX}/equipment/workshops`);
}

export interface EquipmentRow {
  id: number;
  uuid: string;
  asset_code: string;
  name: string;
  category_id: number;
  workshop_id: number;
  manufacturer_id?: number | null;
  manufacture_date?: string | null;
  inspection_param_set_id?: number | null;
  inspection_param_set_ids?: number[];
  upkeep_param_set_id?: number | null;
  criticality?: string | null;
  operational_status?: string | null;
  /** 进入当前运行状态的时间（ISO），用于看板停机时长等 */
  operational_status_since?: string | null;
  maintenance_cycle_by_yield?: string | null;
  maintenance_cycle_by_days?: number | null;
  used_yield?: string | null;
  remark?: string | null;
  image_file_uuids?: string[];
}

export interface CategoryRow {
  id: number;
  uuid: string;
  code: string;
  level1_category: string;
  level2_category: string;
  name: string;
  default_inspection_param_set_id?: number | null;
}

export function formatCategoryDisplayName(
  c: Pick<CategoryRow, 'level1_category' | 'level2_category' | 'name'>,
): string {
  const l1 = (c.level1_category ?? '').trim();
  const l2 = (c.level2_category ?? '').trim();
  if (l1 && l2 && l1 !== l2) return `${l1} / ${l2}`;
  return l2 || l1 || (c.name ?? '').trim();
}

export function formatCategoryLabel(c: Pick<CategoryRow, 'code' | 'level1_category' | 'level2_category' | 'name'>): string {
  return `${c.code} · ${formatCategoryDisplayName(c)}`;
}

export function listCategories(): Promise<CategoryRow[]> {
  return apiRequest(`${PREFIX}/equipment/categories`);
}

export type CategoryCreatePayload = {
  code: string;
  level1_category?: string;
  level2_category: string;
  default_inspection_param_set_id?: number | null;
};

export type CategoryUpdatePayload = {
  level1_category?: string;
  level2_category?: string;
  default_inspection_param_set_id?: number | null;
};

export function createCategory(body: CategoryCreatePayload): Promise<CategoryRow> {
  return apiRequest(`${PREFIX}/equipment/categories`, { method: 'POST', data: body });
}

export function updateCategory(rowId: number, body: CategoryUpdatePayload): Promise<CategoryRow> {
  return apiRequest(`${PREFIX}/equipment/categories/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteCategory(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/categories/${rowId}`, { method: 'DELETE' });
}

export type EquipmentCreatePayload = {
  asset_code: string;
  name: string;
  category_id: number;
  workshop_id: number;
  manufacturer_id?: number | null;
  manufacture_date?: string | null;
  inspection_param_set_ids?: number[];
  upkeep_param_set_id?: number | null;
  criticality?: string | null;
  operational_status?: string | null;
  maintenance_cycle_by_yield?: string | number | null;
  maintenance_cycle_by_days?: number | null;
  remark?: string | null;
  image_file_uuids?: string[] | null;
};

export type EquipmentUpdatePayload = {
  name?: string;
  category_id?: number;
  workshop_id?: number;
  manufacturer_id?: number | null;
  manufacture_date?: string | null;
  inspection_param_set_ids?: number[];
  upkeep_param_set_id?: number | null;
  criticality?: string | null;
  operational_status?: string | null;
  maintenance_cycle_by_yield?: string | number | null;
  maintenance_cycle_by_days?: number | null;
  remark?: string | null;
  image_file_uuids?: string[] | null;
};

/** 设备保养计划表：各设备最近保养完修时间 */
export function fetchMaintenanceUpkeepLastByEquipment(): Promise<{ items: Record<string, string> }> {
  return apiRequest(`${PREFIX}/equipment/reports/maintenance-upkeep-last-by-equipment`);
}

export type EquipmentMaintenanceReminderItem = {
  id: number;
  asset_code: string;
  name: string;
  operational_status?: string | null;
  maintenance_cycle_by_yield?: string | null;
  maintenance_cycle_by_days?: number | null;
  used_yield?: string | null;
  alert_level: 'critical' | 'warning' | 'ok';
  alert_reasons: string[];
  reminder_kind: 'manual_maintenance' | 'cycle_plan' | 'setup_no_cycle' | 'setup_no_baseline';
  dominant_dimension?: 'yield' | 'days' | null;
  dominant_ratio: number;
  last_upkeep_at?: string | null;
  days_since_upkeep?: number | null;
  yield_usage_pct?: number | null;
  days_usage_pct?: number | null;
  remaining_days?: number | null;
};

export type EquipmentOperationalStatusSummary = {
  total: number;
  counts: Record<string, number>;
};

/** 工作台环图：按运行状态聚合，避免分页拉全量设备台账 */
export function fetchEquipmentOperationalStatusSummary(): Promise<EquipmentOperationalStatusSummary> {
  return apiRequest(`${PREFIX}/equipment/reports/operational-status-summary`);
}

export function fetchEquipmentMaintenanceReminders(params?: {
  keyword?: string;
  severity_min?: string;
  actionable_only?: boolean;
  reminder_kinds?: string;
  limit?: number;
  offset?: number;
  /** 工作台 Top N：后端仅排序保留最紧急若干条 */
  preview?: boolean;
}): Promise<{ items: EquipmentMaintenanceReminderItem[]; summary: MaintenanceReminderSummary }> {
  return apiRequest(`${PREFIX}/equipment/reports/maintenance-reminders`, { params });
}

export function listEquipments(params?: {
  workshop_id?: number;
  level1_category?: string;
  keyword?: string;
  asset_code?: string;
  name?: string;
  skip?: number;
  limit?: number;
}): Promise<PageResult<EquipmentRow>> {
  return apiRequest(`${PREFIX}/equipment/equipments`, { params });
}

export function getEquipment(rowId: number): Promise<EquipmentRow> {
  return apiRequest(`${PREFIX}/equipment/equipments/${rowId}`);
}

export function createEquipment(body: EquipmentCreatePayload): Promise<EquipmentRow> {
  return apiRequest(`${PREFIX}/equipment/equipments`, { method: 'POST', data: body });
}

export function updateEquipment(rowId: number, body: EquipmentUpdatePayload): Promise<EquipmentRow> {
  return apiRequest(`${PREFIX}/equipment/equipments/${rowId}`, { method: 'PATCH', data: body });
}

export interface EquipmentOperationalStatusLogRow {
  id: number;
  created_at: string;
  old_status?: string | null;
  new_status: string;
  changed_by_user_id: number;
}

export function listEquipmentOperationalStatusHistory(
  equipmentId: number,
  params?: { limit?: number },
): Promise<EquipmentOperationalStatusLogRow[]> {
  return apiRequest(`${PREFIX}/equipment/equipments/${equipmentId}/operational-status-history`, { params });
}

export function deleteEquipment(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/equipments/${rowId}`, { method: 'DELETE' });
}

/** 设备制造厂商（与后端 ManufacturerOut 对齐） */
export interface ManufacturerRow {
  id: number;
  uuid: string;
  code: string;
  name: string;
}

export type ManufacturerCreatePayload = {
  code: string;
  name: string;
};

export type ManufacturerUpdatePayload = {
  name?: string;
};

export function listManufacturers(): Promise<ManufacturerRow[]> {
  return apiRequest(`${PREFIX}/equipment/manufacturers`);
}

export function createManufacturer(body: ManufacturerCreatePayload): Promise<ManufacturerRow> {
  return apiRequest(`${PREFIX}/equipment/manufacturers`, { method: 'POST', data: body });
}

export function updateManufacturer(rowId: number, body: ManufacturerUpdatePayload): Promise<ManufacturerRow> {
  return apiRequest(`${PREFIX}/equipment/manufacturers/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteManufacturer(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/manufacturers/${rowId}`, { method: 'DELETE' });
}

export interface EquipmentUpkeepSheetRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  service_type?: string;
  applicant_user_id?: number | null;
  applicant_name?: string | null;
  department_uuid?: string | null;
  department_name?: string | null;
  header_attachment_file_uuids: string[];
  equipment_id: number;
  equipment_asset_code?: string | null;
  equipment_name?: string | null;
  description?: string | null;
  upkeep_param_set_id?: number | null;
  upkeep_param_set_code?: string | null;
  upkeep_param_set_name?: string | null;
  reporter_user_id: number;
  complete_notify_user_ids?: number[];
  created_at: string;
  /** 是否可发起维保完成：尚无未删除的关联完成单 */
  can_complete?: boolean;
}

export type EquipmentUpkeepSheetCreatePayload = {
  service_type?: '维修' | '保养';
  applicant_user_id: number;
  department_uuid: string;
  equipment_id: number;
  description?: string | null;
  upkeep_param_set_id?: number | null;
  header_attachment_file_uuids?: string[] | null;
  complete_notify_user_ids?: number[];
};

export type EquipmentUpkeepSheetUpdatePayload = {
  service_type?: '维修' | '保养';
  applicant_user_id?: number;
  department_uuid?: string;
  equipment_id?: number;
  description?: string;
  upkeep_param_set_id?: number | null;
  header_attachment_file_uuids?: string[] | null;
  complete_notify_user_ids?: number[];
};

export function listEquipmentUpkeepSheets(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
  service_type?: string;
  open_for_complete?: boolean;
}): Promise<PageResult<EquipmentUpkeepSheetRow>> {
  return apiRequest(`${PREFIX}/equipment/upkeep-sheets`, { params });
}

export function getEquipmentUpkeepSheet(rowId: number): Promise<EquipmentUpkeepSheetRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-sheets/${rowId}`);
}

export function createEquipmentUpkeepSheet(
  body: EquipmentUpkeepSheetCreatePayload,
): Promise<EquipmentUpkeepSheetRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-sheets`, { method: 'POST', data: body });
}

export function updateEquipmentUpkeepSheet(
  rowId: number,
  body: EquipmentUpkeepSheetUpdatePayload,
): Promise<EquipmentUpkeepSheetRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-sheets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteEquipmentUpkeepSheet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/upkeep-sheets/${rowId}`, { method: 'DELETE' });
}

export interface EquipmentUpkeepCompleteSheetRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  service_type?: string;
  source_upkeep_sheet_id?: number | null;
  source_order_no: string;
  applicant_user_id?: number | null;
  applicant_name?: string | null;
  department_uuid?: string | null;
  department_name?: string | null;
  header_attachment_file_uuids: string[];
  source_header_attachment_file_uuids: string[];
  equipment_id?: number | null;
  equipment_asset_code?: string | null;
  equipment_name?: string | null;
  source_description?: string | null;
  source_service_type?: string | null;
  completion_content?: string | null;
  upkeep_param_set_id?: number | null;
  upkeep_record_lines?: EquipmentUpkeepSchemeLineRow[];
  repair_content?: string | null;
  repair_result?: string | null;
  source_upkeep_param_set_id?: number | null;
  source_upkeep_param_set_code?: string | null;
  source_upkeep_param_set_name?: string | null;
  /** 保养完修：是否清空累计产量 */
  clear_total_production?: boolean;
  reporter_user_id: number;
  complete_notify_user_ids?: number[];
  created_at: string;
}

export type EquipmentUpkeepRecordLinePayload = {
  param_id: number;
  record_value?: string | null;
};

export type EquipmentUpkeepCompleteSheetCreatePayload = {
  source_upkeep_sheet_id: number;
  applicant_user_id?: number | null;
  department_uuid?: string | null;
  header_attachment_file_uuids?: string[] | null;
  completion_content?: string | null;
  upkeep_param_set_id?: number | null;
  upkeep_record_lines?: EquipmentUpkeepRecordLinePayload[];
  repair_content?: string | null;
  repair_result?: string | null;
  clear_total_production?: boolean;
  complete_notify_user_ids?: number[];
};

export type EquipmentUpkeepCompleteSheetUpdatePayload = {
  applicant_user_id?: number;
  department_uuid?: string;
  header_attachment_file_uuids?: string[] | null;
  completion_content?: string | null;
  upkeep_param_set_id?: number | null;
  upkeep_record_lines?: EquipmentUpkeepRecordLinePayload[];
  repair_content?: string | null;
  repair_result?: string | null;
  clear_total_production?: boolean;
  complete_notify_user_ids?: number[];
};

export function listEquipmentUpkeepCompleteSheets(params?: {
  skip?: number;
  limit?: number;
  keyword?: string;
  service_type?: string;
  created_from?: string;
  created_to?: string;
}): Promise<PageResult<EquipmentUpkeepCompleteSheetRow>> {
  return apiRequest(`${PREFIX}/equipment/upkeep-complete-sheets`, { params });
}

export function getEquipmentUpkeepCompleteSheet(rowId: number): Promise<EquipmentUpkeepCompleteSheetRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-complete-sheets/${rowId}`);
}

export function createEquipmentUpkeepCompleteSheet(
  body: EquipmentUpkeepCompleteSheetCreatePayload,
): Promise<EquipmentUpkeepCompleteSheetRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-complete-sheets`, { method: 'POST', data: body });
}

export function updateEquipmentUpkeepCompleteSheet(
  rowId: number,
  body: EquipmentUpkeepCompleteSheetUpdatePayload,
): Promise<EquipmentUpkeepCompleteSheetRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-complete-sheets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteEquipmentUpkeepCompleteSheet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/upkeep-complete-sheets/${rowId}`, { method: 'DELETE' });
}

export interface HaoligoNotifyUserOption {
  id: number;
  label: string;
  username?: string | null;
  full_name?: string | null;
}

export function listHaoligoNotifyUserOptions(params?: {
  keyword?: string;
  limit?: number;
  selected_user_ids?: number[];
}): Promise<HaoligoNotifyUserOption[]> {
  return apiRequest(`${PREFIX}/notify-users/options`, { params });
}

export interface EquipmentUpkeepCompleteNotifyUserOption {
  id: number;
  label: string;
  username?: string | null;
  full_name?: string | null;
}

export function listEquipmentUpkeepCompleteNotifyUserOptions(params?: {
  keyword?: string;
  limit?: number;
  selected_user_ids?: number[];
}): Promise<EquipmentUpkeepCompleteNotifyUserOption[]> {
  return apiRequest(`${PREFIX}/equipment/upkeep-complete-sheets/notify-user-options`, { params });
}

export interface EquipmentOutputRecordRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  recorded_at: string;
  equipment_id: number;
  equipment_asset_code?: string;
  equipment_name?: string;
  work_order_no?: string | null;
  customer_name?: string | null;
  product_name?: string | null;
  finished_product_code?: string | null;
  finished_product_name?: string | null;
  planned_qty?: string | number | null;
  completed_qty: string | number;
  startup_at?: string | null;
  completed_at?: string | null;
  operator_name?: string | null;
  team_leader_name?: string | null;
  remark?: string | null;
  notify_user_ids?: number[];
  reporter_user_id: number;
  dataset_snapshot?: Record<string, unknown> | null;
  created_at: string;
}

export type EquipmentOutputRecordCreatePayload = {
  equipment_id: number;
  work_order_no?: string | null;
  recorded_at?: string | null;
  customer_name?: string | null;
  product_name?: string | null;
  finished_product_code?: string | null;
  finished_product_name?: string | null;
  planned_qty?: string | number | null;
  completed_qty?: string | number;
  startup_at?: string | null;
  completed_at?: string | null;
  operator_name?: string | null;
  team_leader_name?: string | null;
  remark?: string | null;
  notify_user_ids?: number[];
  dataset_snapshot?: Record<string, unknown> | null;
};

export type EquipmentOutputRecordUpdatePayload = Partial<
  Omit<EquipmentOutputRecordCreatePayload, 'equipment_id' | 'work_order_no'>
> & { work_order_no?: string | null };

export function listEquipmentOutputRecords(params?: {
  skip?: number;
  limit?: number;
  equipment_id?: number;
  sheet_no?: string;
  work_order_no?: string;
  recorded_from?: string;
  recorded_to?: string;
  keyword?: string;
}): Promise<PageResult<EquipmentOutputRecordRow>> {
  return apiRequest(`${PREFIX}/equipment/output-records`, { params });
}

export function getEquipmentOutputRecord(rowId: number): Promise<EquipmentOutputRecordRow> {
  return apiRequest(`${PREFIX}/equipment/output-records/${rowId}`);
}

export function createEquipmentOutputRecord(
  body: EquipmentOutputRecordCreatePayload,
): Promise<EquipmentOutputRecordRow> {
  return apiRequest(`${PREFIX}/equipment/output-records`, { method: 'POST', data: body });
}

export function updateEquipmentOutputRecord(
  rowId: number,
  body: EquipmentOutputRecordUpdatePayload,
): Promise<EquipmentOutputRecordRow> {
  return apiRequest(`${PREFIX}/equipment/output-records/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteEquipmentOutputRecord(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/output-records/${rowId}`, { method: 'DELETE' });
}

export interface EquipmentCapacitySummary {
  record_count: number;
  planned_qty_total?: string | number | null;
  completed_qty_total: string | number;
  achievement_rate_pct?: number | null;
}

export interface EquipmentCapacityByEquipmentRow {
  equipment_id: number;
  equipment_asset_code?: string;
  equipment_name?: string;
  record_count: number;
  planned_qty_total?: string | number | null;
  completed_qty_total: string | number;
  achievement_rate_pct?: number | null;
}

export interface EquipmentCapacityByWorkshopRow {
  workshop_id?: number | null;
  workshop_name?: string;
  record_count: number;
  planned_qty_total?: string | number | null;
  completed_qty_total: string | number;
  achievement_rate_pct?: number | null;
}

export interface EquipmentCapacityReportResult {
  summary: EquipmentCapacitySummary;
  group_by: 'detail' | 'equipment' | 'workshop' | string;
  items: EquipmentOutputRecordRow[];
  equipment_items: EquipmentCapacityByEquipmentRow[];
  workshop_items: EquipmentCapacityByWorkshopRow[];
  total: number;
  skip: number;
  limit: number;
}

export function getEquipmentCapacityReport(params?: {
  skip?: number;
  limit?: number;
  equipment_id?: number;
  workshop_id?: number;
  sheet_no?: string;
  work_order_no?: string;
  finished_product_code?: string;
  finished_product_name?: string;
  operator_name?: string;
  team_leader_name?: string;
  recorded_from?: string;
  recorded_to?: string;
  startup_from?: string;
  startup_to?: string;
  completed_from?: string;
  completed_to?: string;
  keyword?: string;
  group_by?: 'detail' | 'equipment' | 'workshop';
}): Promise<EquipmentCapacityReportResult> {
  return apiRequest(`${PREFIX}/equipment/reports/capacity`, { params });
}

export interface EquipmentOutputDatasetBindingPayload {
  dataset_uuid?: string | null;
  work_order_param_key?: string | null;
  customer_column?: string | null;
  product_name_column?: string | null;
  finished_product_code_column?: string | null;
  finished_product_name_column?: string | null;
  planned_qty_column?: string | null;
}

export function getEquipmentOutputDatasetBinding(): Promise<EquipmentOutputDatasetBindingPayload> {
  return apiRequest(`${PREFIX}/equipment/output-dataset-binding`);
}

export function putEquipmentOutputDatasetBinding(
  body: EquipmentOutputDatasetBindingPayload,
): Promise<EquipmentOutputDatasetBindingPayload> {
  return apiRequest(`${PREFIX}/equipment/output-dataset-binding`, { method: 'PUT', data: body });
}

export interface EquipmentStatusAdjustmentRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  recorded_at: string;
  equipment_id: number;
  equipment_asset_code?: string | null;
  equipment_name?: string | null;
  old_operational_status?: string | null;
  new_operational_status: string;
  remark?: string | null;
  reporter_user_id: number;
  created_at: string;
}

export type EquipmentStatusAdjustmentCreatePayload = {
  equipment_id: number;
  new_operational_status: string;
  recorded_at?: string | null;
  remark?: string | null;
};

export type EquipmentStatusAdjustmentUpdatePayload = {
  recorded_at?: string | null;
  remark?: string | null;
};

export function listEquipmentStatusAdjustments(params?: {
  skip?: number;
  limit?: number;
  equipment_id?: number;
  sheet_no?: string;
  recorded_from?: string;
  recorded_to?: string;
  keyword?: string;
}): Promise<PageResult<EquipmentStatusAdjustmentRow>> {
  return apiRequest(`${PREFIX}/equipment/status-adjustments`, { params });
}

export function getEquipmentStatusAdjustment(rowId: number): Promise<EquipmentStatusAdjustmentRow> {
  return apiRequest(`${PREFIX}/equipment/status-adjustments/${rowId}`);
}

export function createEquipmentStatusAdjustment(
  body: EquipmentStatusAdjustmentCreatePayload,
): Promise<EquipmentStatusAdjustmentRow> {
  return apiRequest(`${PREFIX}/equipment/status-adjustments`, { method: 'POST', data: body });
}

export function updateEquipmentStatusAdjustment(
  rowId: number,
  body: EquipmentStatusAdjustmentUpdatePayload,
): Promise<EquipmentStatusAdjustmentRow> {
  return apiRequest(`${PREFIX}/equipment/status-adjustments/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteEquipmentStatusAdjustment(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/status-adjustments/${rowId}`, { method: 'DELETE' });
}

export type EquipmentAcceptanceWorkflowStatus =
  | 'draft'
  | 'commissioning'
  | 'pending_trial'
  | 'trial_recording'
  | 'accepted'
  | 'closed';

export interface EquipmentAcceptanceRoundRow {
  id: number;
  uuid: string;
  round_no: number;
  commissioning_content?: string | null;
  commissioning_result?: string | null;
  commissioning_submitted_at?: string | null;
  product_name?: string | null;
  material_no?: string | null;
  quantity?: string | number | null;
  defect_qty?: string | number | null;
  defect_reason?: string | null;
  running_time?: string | number | null;
  fault_time?: string | number | null;
  capacity_per_hour?: string | number | null;
  trial_result?: string | null;
  pass_rate?: string | number | null;
  commissioning_attachment_file_uuids?: string[];
  trial_attachment_file_uuids?: string[];
}

export interface EquipmentAcceptanceSheetRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  manufacturer_id?: number | null;
  manufacturer_name?: string | null;
  arrived_at?: string | null;
  install_location?: string | null;
  equipment_name?: string | null;
  commissioning_user_ids?: number[];
  submitted_notify_user_ids?: number[];
  equipment_id?: number | null;
  equipment_asset_code?: string | null;
  workflow_status: EquipmentAcceptanceWorkflowStatus | string;
  current_round: number;
  accepted_at?: string | null;
  accepted_by_user_id?: number | null;
  ledger_action?: string | null;
  reporter_user_id: number;
  created_at: string;
  rounds?: EquipmentAcceptanceRoundRow[];
}

export type EquipmentAcceptanceSheetCreatePayload = {
  manufacturer_id?: number | null;
  manufacturer_name?: string | null;
  arrived_at?: string | null;
  install_location?: string | null;
  equipment_name: string;
  commissioning_user_ids?: number[];
  submitted_notify_user_ids?: number[];
};

export function listEquipmentAcceptanceSheets(params?: {
  skip?: number;
  limit?: number;
  workflow_status?: string;
  keyword?: string;
  arrived_from?: string;
  arrived_to?: string;
}): Promise<PageResult<EquipmentAcceptanceSheetRow>> {
  return apiRequest(`${PREFIX}/equipment/acceptance-sheets`, { params });
}

export function getEquipmentAcceptanceSheet(rowId: number): Promise<EquipmentAcceptanceSheetRow> {
  return apiRequest(`${PREFIX}/equipment/acceptance-sheets/${rowId}`);
}

export function createEquipmentAcceptanceSheet(
  body: EquipmentAcceptanceSheetCreatePayload,
): Promise<EquipmentAcceptanceSheetRow> {
  return apiRequest(`${PREFIX}/equipment/acceptance-sheets`, { method: 'POST', data: body });
}

export function deleteEquipmentAcceptanceSheet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/acceptance-sheets/${rowId}`, { method: 'DELETE' });
}

export type EquipmentAcceptanceRoundCommissioningPayload = {
  commissioning_content?: string | null;
  commissioning_result?: string | null;
  commissioning_attachment_file_uuids?: string[] | null;
};

export type EquipmentAcceptanceRoundTrialPayload = {
  product_name?: string | null;
  material_no?: string | null;
  quantity?: number | null;
  defect_qty?: number | null;
  defect_reason?: string | null;
  running_time?: number | null;
  fault_time?: number | null;
  capacity_per_hour?: number | null;
  trial_result?: string | null;
  trial_attachment_file_uuids?: string[] | null;
};

export function updateEquipmentAcceptanceRoundCommissioning(
  sheetId: number,
  roundNo: number,
  body: EquipmentAcceptanceRoundCommissioningPayload,
): Promise<EquipmentAcceptanceSheetRow> {
  return apiRequest(`${PREFIX}/equipment/acceptance-sheets/${sheetId}/rounds/${roundNo}`, {
    method: 'PATCH',
    data: body,
  });
}

export function submitEquipmentAcceptanceCommissioning(
  sheetId: number,
  body?: { submitted_notify_user_ids?: number[] },
): Promise<EquipmentAcceptanceSheetRow> {
  return apiRequest(`${PREFIX}/equipment/acceptance-sheets/${sheetId}/submit-commissioning`, {
    method: 'POST',
    data: body ?? {},
  });
}

export function startEquipmentAcceptanceTrial(sheetId: number): Promise<EquipmentAcceptanceSheetRow> {
  return apiRequest(`${PREFIX}/equipment/acceptance-sheets/${sheetId}/start-trial`, { method: 'POST' });
}

export function updateEquipmentAcceptanceRoundTrial(
  sheetId: number,
  roundNo: number,
  body: EquipmentAcceptanceRoundTrialPayload,
): Promise<EquipmentAcceptanceSheetRow> {
  return apiRequest(`${PREFIX}/equipment/acceptance-sheets/${sheetId}/rounds/${roundNo}/trial`, {
    method: 'PATCH',
    data: body,
  });
}

export function completeEquipmentAcceptanceTrial(
  sheetId: number,
  body?: { submitted_notify_user_ids?: number[] },
): Promise<EquipmentAcceptanceSheetRow> {
  return apiRequest(`${PREFIX}/equipment/acceptance-sheets/${sheetId}/complete-trial`, {
    method: 'POST',
    data: body ?? {},
  });
}

export type EquipmentAcceptanceFinalizeLedgerPayload =
  | {
      mode: 'create';
      asset_code: string;
      name?: string | null;
      category_id?: number | null;
      workshop_id?: number | null;
      manufacturer_id?: number | null;
      manufacture_date?: string | null;
      inspection_param_set_ids?: number[];
      upkeep_param_set_id?: number | null;
      criticality?: string | null;
      operational_status?: string | null;
      remark?: string | null;
      image_file_uuids?: string[];
      maintenance_cycle_by_yield?: number | string | null;
      maintenance_cycle_by_days?: number | null;
    }
  | { mode: 'link'; equipment_id?: number | null };

export function finalizeEquipmentAcceptanceLedger(
  sheetId: number,
  body: EquipmentAcceptanceFinalizeLedgerPayload,
): Promise<EquipmentAcceptanceSheetRow> {
  return apiRequest(`${PREFIX}/equipment/acceptance-sheets/${sheetId}/finalize-ledger`, {
    method: 'POST',
    data: body,
  });
}

export function previewEquipmentOutputByWorkOrder(body: {
  work_order_no?: string | null;
}): Promise<{
  work_order_no?: string | null;
  finished_product_code?: string | null;
  finished_product_name?: string | null;
  planned_qty?: string | number | null;
  dataset_row?: Record<string, unknown> | null;
}> {
  return apiRequest(`${PREFIX}/equipment/output-records/preview-by-work-order`, { method: 'POST', data: body });
}
