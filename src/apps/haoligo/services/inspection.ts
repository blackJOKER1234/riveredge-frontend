/**
 * 好力 GO 点检业务 API（/api/v1/apps/haoligo/equipment）
 */

import { apiRequest } from '../../../services/api';
import type { PageResult } from './common';

const PREFIX = '/apps/haoligo';
/** 点检项（与后端 InspectionParamOut 对齐） */
export interface InspectionParamRow {
  id: number;
  uuid: string;
  code: string;
  name: string;
  level1_category?: string | null;
  requirement?: string | null;
  unit?: string | null;
  value_type: string;
  default_value?: string | null;
  numeric_min?: number | string | null;
  numeric_max?: number | string | null;
}

export type InspectionParamCreatePayload = {
  code: string;
  name: string;
  level1_category?: string | null;
  requirement?: string | null;
  unit?: string | null;
  value_type?: string;
  default_value?: string | null;
  numeric_min?: number | string | null;
  numeric_max?: number | string | null;
};

export type InspectionParamUpdatePayload = {
  name?: string;
  level1_category?: string | null;
  requirement?: string | null;
  unit?: string | null;
  value_type?: string;
  default_value?: string | null;
  numeric_min?: number | string | null;
  numeric_max?: number | string | null;
};

export function listInspectionParams(): Promise<InspectionParamRow[]> {
  return apiRequest(`${PREFIX}/equipment/inspection-params`);
}

export function createInspectionParam(body: InspectionParamCreatePayload): Promise<InspectionParamRow> {
  return apiRequest(`${PREFIX}/equipment/inspection-params`, { method: 'POST', data: body });
}

export function updateInspectionParam(rowId: number, body: InspectionParamUpdatePayload): Promise<InspectionParamRow> {
  return apiRequest(`${PREFIX}/equipment/inspection-params/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteInspectionParam(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/inspection-params/${rowId}`, { method: 'DELETE' });
}

export type InspectionParamBatchLevel1Payload = {
  ids: number[];
  level1_category?: string | null;
};

export type InspectionParamBatchLevel1Result = {
  updated: number;
};

export function batchUpdateInspectionParamLevel1(
  body: InspectionParamBatchLevel1Payload,
): Promise<InspectionParamBatchLevel1Result> {
  return apiRequest(`${PREFIX}/equipment/inspection-params/batch-level1-category`, {
    method: 'POST',
    data: body,
  });
}

/** 点检方案 / 参数集 */
export interface InspectionParamSetRow {
  id: number;
  uuid: string;
  code: string;
  name: string;
}

export type InspectionParamSetCreatePayload = { code: string; name: string };
export type InspectionParamSetUpdatePayload = { name?: string };

export function listInspectionParamSets(): Promise<InspectionParamSetRow[]> {
  return apiRequest(`${PREFIX}/equipment/inspection-param-sets`);
}

export function createInspectionParamSet(body: InspectionParamSetCreatePayload): Promise<InspectionParamSetRow> {
  return apiRequest(`${PREFIX}/equipment/inspection-param-sets`, { method: 'POST', data: body });
}

export function updateInspectionParamSet(rowId: number, body: InspectionParamSetUpdatePayload): Promise<InspectionParamSetRow> {
  return apiRequest(`${PREFIX}/equipment/inspection-param-sets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteInspectionParamSet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/inspection-param-sets/${rowId}`, { method: 'DELETE' });
}

export type InspectionParamSetImportRowPayload = {
  set_code: string;
  set_name: string;
  param_code?: string | null;
  param_name: string;
  level1_category?: string | null;
  requirement?: string | null;
  value_type?: string;
  default_value?: string | null;
  numeric_min?: number | string | null;
  numeric_max?: number | string | null;
  unit?: string | null;
  is_required?: boolean;
};

export type InspectionParamSetImportResult = {
  plans_created: number;
  plans_updated: number;
  params_created: number;
  params_updated: number;
  plan_codes: string[];
};

export function importInspectionParamSets(rows: InspectionParamSetImportRowPayload[]): Promise<InspectionParamSetImportResult> {
  return apiRequest(`${PREFIX}/equipment/inspection-param-sets/import`, { method: 'POST', data: { rows } });
}

export interface InspectionParamSetItemRow {
  id: number;
  param_id: number;
  set_id: number;
  sort_order: number;
  is_required: boolean;
}

export type SetItemCreatePayload = { param_id: number; sort_order?: number; is_required?: boolean };
export type InspectionParamSetCreateWithItemsPayload = {
  code: string;
  name: string;
  items: SetItemCreatePayload[];
};
export type SetItemUpdatePayload = { sort_order?: number; is_required?: boolean };

export function createInspectionParamSetWithItems(
  body: InspectionParamSetCreateWithItemsPayload,
): Promise<InspectionParamSetRow> {
  return apiRequest(`${PREFIX}/equipment/inspection-param-sets/with-items`, { method: 'POST', data: body });
}

export function listInspectionParamSetItems(setId: number): Promise<InspectionParamSetItemRow[]> {
  return apiRequest(`${PREFIX}/equipment/inspection-param-sets/${setId}/items`);
}

export function addInspectionParamSetItem(setId: number, body: SetItemCreatePayload): Promise<InspectionParamSetItemRow> {
  return apiRequest(`${PREFIX}/equipment/inspection-param-sets/${setId}/items`, { method: 'POST', data: body });
}

export function updateInspectionParamSetItem(itemId: number, body: SetItemUpdatePayload): Promise<InspectionParamSetItemRow> {
  return apiRequest(`${PREFIX}/equipment/inspection-param-set-items/${itemId}`, { method: 'PATCH', data: body });
}

export function deleteInspectionParamSetItem(itemId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/inspection-param-set-items/${itemId}`, { method: 'DELETE' });
}

/** --- 设备运行单据（点检 / 路线巡检 / 维保 / 产出）--- */

export interface EquipmentSpotCheckLineRow {
  id: number;
  inspection_param_id?: number | null;
  param_code: string;
  param_name: string;
  param_requirement?: string | null;
  sort_order: number;
  value_type: string;
  unit?: string | null;
  is_required: boolean;
  numeric_min?: number | string | null;
  numeric_max?: number | string | null;
  measured_value?: string | null;
  result: string;
  remark?: string | null;
  attachment_file_ids?: string[] | null;
}

export interface EquipmentSpotCheckRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  recorded_at: string;
  equipment_id: number;
  equipment_asset_code?: string;
  equipment_name?: string;
  inspection_param_set_id?: number | null;
  inspection_param_set_code?: string | null;
  inspection_param_set_name?: string | null;
  reporter_user_id: number;
  abnormal_description?: string | null;
  applied_operational_status?: string | null;
  report_enabled: boolean;
  report_notify_user_ids: number[];
  created_at: string;
  lines?: EquipmentSpotCheckLineRow[];
}

export type EquipmentSpotCheckCreatePayload = {
  equipment_id: number;
  inspection_param_set_id?: number | null;
  recorded_at?: string | null;
  abnormal_description?: string | null;
  applied_operational_status?: string | null;
  report_enabled?: boolean;
  report_notify_user_ids?: number[];
};

export type EquipmentSpotCheckLinePatch = {
  id: number;
  result: string;
  remark?: string | null;
  measured_value?: string | null;
  attachment_file_ids?: string[] | null;
};
export type EquipmentSpotCheckUpdatePayload = {
  recorded_at?: string | null;
  abnormal_description?: string | null;
  applied_operational_status?: string | null;
  report_enabled?: boolean;
  report_notify_user_ids?: number[];
  lines?: EquipmentSpotCheckLinePatch[];
};

export interface EquipmentSpotCheckPreviewLine {
  inspection_param_id?: number | null;
  param_code: string;
  param_name: string;
  param_requirement?: string | null;
  sort_order: number;
  value_type: string;
  unit?: string | null;
  is_required: boolean;
  default_value?: string | null;
  numeric_min?: number | string | null;
  numeric_max?: number | string | null;
}

export interface EquipmentSpotCheckPreviewResult {
  equipment_id: number;
  inspection_param_set_id: number;
  inspection_param_set_code: string;
  inspection_param_set_name: string;
  lines: EquipmentSpotCheckPreviewLine[];
}

export function previewEquipmentSpotCheckLines(params: {
  equipment_id: number;
  inspection_param_set_id?: number;
}): Promise<EquipmentSpotCheckPreviewResult> {
  return apiRequest(`${PREFIX}/equipment/spot-checks/preview-lines`, { params });
}

export function listEquipmentSpotChecks(params?: {
  skip?: number;
  limit?: number;
  equipment_id?: number;
  inspection_param_set_id?: number;
  sheet_no?: string;
  recorded_from?: string;
  recorded_to?: string;
  keyword?: string;
}): Promise<PageResult<EquipmentSpotCheckRow>> {
  return apiRequest(`${PREFIX}/equipment/spot-checks`, { params });
}

export function getEquipmentSpotCheck(rowId: number): Promise<EquipmentSpotCheckRow> {
  return apiRequest(`${PREFIX}/equipment/spot-checks/${rowId}`);
}

export function createEquipmentSpotCheck(body: EquipmentSpotCheckCreatePayload): Promise<EquipmentSpotCheckRow> {
  return apiRequest(`${PREFIX}/equipment/spot-checks`, { method: 'POST', data: body });
}

export function updateEquipmentSpotCheck(
  rowId: number,
  body: EquipmentSpotCheckUpdatePayload,
): Promise<EquipmentSpotCheckRow> {
  return apiRequest(`${PREFIX}/equipment/spot-checks/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteEquipmentSpotCheck(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/spot-checks/${rowId}`, { method: 'DELETE' });
}

export interface EquipmentRoutePatrolLineRow {
  id: number;
  equipment_id: number;
  asset_code: string;
  equipment_name: string;
  sequence: number;
  line_status: string;
  abnormal_description?: string | null;
  applied_operational_status?: string | null;
  attachment_file_ids?: string[] | null;
}

export interface EquipmentRoutePatrolPreviewLine {
  equipment_id: number;
  asset_code: string;
  equipment_name: string;
  sequence: number;
}

export interface EquipmentRoutePatrolRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  recorded_at: string;
  patrol_route_id: number;
  patrol_route_code?: string;
  patrol_route_name?: string;
  patrol_route_workshop_id?: number | null;
  patrol_route_workshop_name?: string | null;
  reporter_user_id: number;
  report_enabled: boolean;
  report_notify_user_ids: number[];
  created_at: string;
  lines?: EquipmentRoutePatrolLineRow[];
}

export type EquipmentRoutePatrolCreatePayload = {
  patrol_route_id: number;
  recorded_at?: string | null;
  report_enabled?: boolean;
  report_notify_user_ids?: number[];
};

export type EquipmentRoutePatrolLinePatch = {
  id: number;
  line_status: string;
  abnormal_description?: string | null;
  applied_operational_status?: string | null;
  attachment_file_ids?: string[] | null;
};
export type EquipmentRoutePatrolUpdatePayload = {
  recorded_at?: string | null;
  report_enabled?: boolean;
  report_notify_user_ids?: number[];
  lines?: EquipmentRoutePatrolLinePatch[];
};

export function previewEquipmentRoutePatrolLines(params: {
  patrol_route_id: number;
}): Promise<EquipmentRoutePatrolPreviewLine[]> {
  return apiRequest(`${PREFIX}/equipment/route-patrols/preview-lines`, { params });
}

export function listEquipmentRoutePatrols(params?: {
  skip?: number;
  limit?: number;
  patrol_route_id?: number;
  sheet_no?: string;
  recorded_from?: string;
  recorded_to?: string;
  keyword?: string;
}): Promise<PageResult<EquipmentRoutePatrolRow>> {
  return apiRequest(`${PREFIX}/equipment/route-patrols`, { params });
}

export function getEquipmentRoutePatrol(rowId: number): Promise<EquipmentRoutePatrolRow> {
  return apiRequest(`${PREFIX}/equipment/route-patrols/${rowId}`);
}

export function createEquipmentRoutePatrol(
  body: EquipmentRoutePatrolCreatePayload,
): Promise<EquipmentRoutePatrolRow> {
  return apiRequest(`${PREFIX}/equipment/route-patrols`, { method: 'POST', data: body });
}

export function updateEquipmentRoutePatrol(
  rowId: number,
  body: EquipmentRoutePatrolUpdatePayload,
): Promise<EquipmentRoutePatrolRow> {
  return apiRequest(`${PREFIX}/equipment/route-patrols/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteEquipmentRoutePatrol(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/route-patrols/${rowId}`, { method: 'DELETE' });
}
