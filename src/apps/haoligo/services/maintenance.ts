/**
 * 好力 GO 保养参数业务 API（/api/v1/apps/haoligo）
 */

import { apiRequest } from '../../../services/api';

const PREFIX = '/apps/haoligo';
/** 模具保养项 */
export interface MoldUpkeepParamRow {
  id: number;
  uuid: string;
  code: string;
  name: string;
  requirement?: string | null;
  value_type: string;
  default_value?: string | null;
}

export type MoldUpkeepParamCreatePayload = {
  code: string;
  name: string;
  requirement?: string | null;
  value_type?: string;
  default_value?: string | null;
};

export type MoldUpkeepParamUpdatePayload = {
  name?: string;
  requirement?: string | null;
  value_type?: string;
  default_value?: string | null;
};

export function listMoldUpkeepParams(): Promise<MoldUpkeepParamRow[]> {
  return apiRequest(`${PREFIX}/molds/upkeep-params`);
}

export function createMoldUpkeepParam(body: MoldUpkeepParamCreatePayload): Promise<MoldUpkeepParamRow> {
  return apiRequest(`${PREFIX}/molds/upkeep-params`, { method: 'POST', data: body });
}

export function updateMoldUpkeepParam(rowId: number, body: MoldUpkeepParamUpdatePayload): Promise<MoldUpkeepParamRow> {
  return apiRequest(`${PREFIX}/molds/upkeep-params/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteMoldUpkeepParam(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/upkeep-params/${rowId}`, { method: 'DELETE' });
}

/** 模具保养方案 */
export interface MoldUpkeepParamSetRow {
  id: number;
  uuid: string;
  code: string;
  name: string;
}

export type MoldUpkeepParamSetCreatePayload = { code: string; name: string };
export type MoldUpkeepParamSetUpdatePayload = { name?: string };

export interface MoldUpkeepParamSetItemRow {
  id: number;
  param_id: number;
  set_id: number;
  sort_order: number;
  is_required: boolean;
}

export type MoldUpkeepSetItemCreatePayload = {
  param_id: number;
  sort_order?: number;
  is_required?: boolean;
};

export type MoldUpkeepSetItemUpdatePayload = {
  sort_order?: number;
  is_required?: boolean;
};

export type MoldUpkeepParamSetCreateWithItemsPayload = {
  code: string;
  name: string;
  items: MoldUpkeepSetItemCreatePayload[];
};

export function listMoldUpkeepParamSets(): Promise<MoldUpkeepParamSetRow[]> {
  return apiRequest(`${PREFIX}/molds/upkeep-param-sets`);
}

export function createMoldUpkeepParamSet(body: MoldUpkeepParamSetCreatePayload): Promise<MoldUpkeepParamSetRow> {
  return apiRequest(`${PREFIX}/molds/upkeep-param-sets`, { method: 'POST', data: body });
}

export function createMoldUpkeepParamSetWithItems(
  body: MoldUpkeepParamSetCreateWithItemsPayload,
): Promise<MoldUpkeepParamSetRow> {
  return apiRequest(`${PREFIX}/molds/upkeep-param-sets/with-items`, { method: 'POST', data: body });
}

export function updateMoldUpkeepParamSet(
  rowId: number,
  body: MoldUpkeepParamSetUpdatePayload,
): Promise<MoldUpkeepParamSetRow> {
  return apiRequest(`${PREFIX}/molds/upkeep-param-sets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteMoldUpkeepParamSet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/upkeep-param-sets/${rowId}`, { method: 'DELETE' });
}

export function listMoldUpkeepParamSetItems(setId: number): Promise<MoldUpkeepParamSetItemRow[]> {
  return apiRequest(`${PREFIX}/molds/upkeep-param-sets/${setId}/items`);
}

export function addMoldUpkeepParamSetItem(
  setId: number,
  body: MoldUpkeepSetItemCreatePayload,
): Promise<MoldUpkeepParamSetItemRow> {
  return apiRequest(`${PREFIX}/molds/upkeep-param-sets/${setId}/items`, { method: 'POST', data: body });
}

export function updateMoldUpkeepParamSetItem(
  itemId: number,
  body: MoldUpkeepSetItemUpdatePayload,
): Promise<MoldUpkeepParamSetItemRow> {
  return apiRequest(`${PREFIX}/molds/upkeep-param-set-items/${itemId}`, { method: 'PATCH', data: body });
}

export function deleteMoldUpkeepParamSetItem(itemId: number): Promise<void> {
  return apiRequest(`${PREFIX}/molds/upkeep-param-set-items/${itemId}`, { method: 'DELETE' });
}

/** 保养方案展开行（完修单按方案填记录） */
export interface MoldUpkeepSchemeLineRow {
  param_id: number;
  param_code: string;
  param_name: string;
  requirement?: string | null;
  value_type?: string;
  option_values?: string[];
  is_required: boolean;
  sort_order: number;
  record_value?: string | null;
}

export function fetchMoldUpkeepSchemeByMoldCode(moldCode: string): Promise<MoldUpkeepSchemeLineRow[]> {
  return apiRequest(`${PREFIX}/molds/upkeep-scheme-by-code`, { params: { mold_code: moldCode } });
}

export interface MoldUpkeepSchemeContext {
  mold_code: string;
  ledger_upkeep_param_set_id?: number | null;
  lines: MoldUpkeepSchemeLineRow[];
}

export function fetchMoldUpkeepSchemeContext(moldCode: string): Promise<MoldUpkeepSchemeContext> {
  return apiRequest(`${PREFIX}/molds/upkeep-scheme-context`, { params: { mold_code: moldCode } });
}

export function fetchMoldUpkeepSchemeLinesBySet(setId: number): Promise<MoldUpkeepSchemeLineRow[]> {
  return apiRequest(`${PREFIX}/molds/upkeep-param-sets/${setId}/scheme-lines`);
}

/** 设备保养项 */
export interface EquipmentUpkeepParamRow {
  id: number;
  uuid: string;
  code: string;
  name: string;
  requirement?: string | null;
  value_type: string;
  default_value?: string | null;
}

export type EquipmentUpkeepParamCreatePayload = MoldUpkeepParamCreatePayload;
export type EquipmentUpkeepParamUpdatePayload = MoldUpkeepParamUpdatePayload;

export function listEquipmentUpkeepParams(): Promise<EquipmentUpkeepParamRow[]> {
  return apiRequest(`${PREFIX}/equipment/upkeep-params`);
}

export function createEquipmentUpkeepParam(body: EquipmentUpkeepParamCreatePayload): Promise<EquipmentUpkeepParamRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-params`, { method: 'POST', data: body });
}

export function updateEquipmentUpkeepParam(
  rowId: number,
  body: EquipmentUpkeepParamUpdatePayload,
): Promise<EquipmentUpkeepParamRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-params/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteEquipmentUpkeepParam(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/upkeep-params/${rowId}`, { method: 'DELETE' });
}

/** 设备保养方案 */
export interface EquipmentUpkeepParamSetRow {
  id: number;
  uuid: string;
  code: string;
  name: string;
}

export type EquipmentUpkeepParamSetCreatePayload = MoldUpkeepParamSetCreatePayload;
export type EquipmentUpkeepParamSetUpdatePayload = MoldUpkeepParamSetUpdatePayload;
export type EquipmentUpkeepParamSetItemRow = MoldUpkeepParamSetItemRow;
export type EquipmentUpkeepSetItemCreatePayload = MoldUpkeepSetItemCreatePayload;
export type EquipmentUpkeepSetItemUpdatePayload = MoldUpkeepSetItemUpdatePayload;
export type EquipmentUpkeepParamSetCreateWithItemsPayload = MoldUpkeepParamSetCreateWithItemsPayload;

export function listEquipmentUpkeepParamSets(): Promise<EquipmentUpkeepParamSetRow[]> {
  return apiRequest(`${PREFIX}/equipment/upkeep-param-sets`);
}

export function createEquipmentUpkeepParamSet(
  body: EquipmentUpkeepParamSetCreatePayload,
): Promise<EquipmentUpkeepParamSetRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-param-sets`, { method: 'POST', data: body });
}

export function createEquipmentUpkeepParamSetWithItems(
  body: EquipmentUpkeepParamSetCreateWithItemsPayload,
): Promise<EquipmentUpkeepParamSetRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-param-sets/with-items`, { method: 'POST', data: body });
}

export function updateEquipmentUpkeepParamSet(
  rowId: number,
  body: EquipmentUpkeepParamSetUpdatePayload,
): Promise<EquipmentUpkeepParamSetRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-param-sets/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteEquipmentUpkeepParamSet(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/upkeep-param-sets/${rowId}`, { method: 'DELETE' });
}

export function listEquipmentUpkeepParamSetItems(setId: number): Promise<EquipmentUpkeepParamSetItemRow[]> {
  return apiRequest(`${PREFIX}/equipment/upkeep-param-sets/${setId}/items`);
}

export function addEquipmentUpkeepParamSetItem(
  setId: number,
  body: EquipmentUpkeepSetItemCreatePayload,
): Promise<EquipmentUpkeepParamSetItemRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-param-sets/${setId}/items`, { method: 'POST', data: body });
}

export function updateEquipmentUpkeepParamSetItem(
  itemId: number,
  body: EquipmentUpkeepSetItemUpdatePayload,
): Promise<EquipmentUpkeepParamSetItemRow> {
  return apiRequest(`${PREFIX}/equipment/upkeep-param-set-items/${itemId}`, { method: 'PATCH', data: body });
}

export function deleteEquipmentUpkeepParamSetItem(itemId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/upkeep-param-set-items/${itemId}`, { method: 'DELETE' });
}

export type EquipmentUpkeepSchemeLineRow = MoldUpkeepSchemeLineRow;

export interface EquipmentUpkeepSchemeContext {
  equipment_id: number;
  ledger_upkeep_param_set_id?: number | null;
  lines: EquipmentUpkeepSchemeLineRow[];
}

export function fetchEquipmentUpkeepSchemeContext(equipmentId: number): Promise<EquipmentUpkeepSchemeContext> {
  return apiRequest(`${PREFIX}/equipment/upkeep-scheme-context`, { params: { equipment_id: equipmentId } });
}

export function fetchEquipmentUpkeepSchemeLinesBySet(setId: number): Promise<EquipmentUpkeepSchemeLineRow[]> {
  return apiRequest(`${PREFIX}/equipment/upkeep-param-sets/${setId}/scheme-lines`);
}
