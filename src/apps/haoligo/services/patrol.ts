/**
 * 好力 GO 巡检与隐患业务 API（/api/v1/apps/haoligo/patrol）
 */

import { apiRequest } from '../../../services/api';
import type { PageResult } from './common';

const PREFIX = '/apps/haoligo';
/** 巡检路线（PatrolRouteOut） */
export interface PatrolRouteRow {
  id: number;
  uuid: string;
  code: string;
  name: string;
  workshop_id?: number | null;
}

export interface PatrolStepRow {
  id: number;
  equipment_id: number;
  sequence: number;
}

export type PatrolRouteCreatePayload = {
  code: string;
  name: string;
  workshop_id?: number | null;
};

export type PatrolRouteCreateWithStepsPayload = PatrolRouteCreatePayload & {
  steps: PatrolStepInPayload[];
};

export type PatrolRouteUpdatePayload = {
  name?: string;
  workshop_id?: number | null;
};

export type PatrolStepInPayload = {
  equipment_id: number;
  sequence: number;
};

export function listPatrolRoutes(): Promise<PatrolRouteRow[]> {
  return apiRequest(`${PREFIX}/equipment/patrol-routes`);
}

export function createPatrolRoute(body: PatrolRouteCreatePayload): Promise<PatrolRouteRow> {
  return apiRequest(`${PREFIX}/equipment/patrol-routes`, { method: 'POST', data: body });
}

export function createPatrolRouteWithSteps(body: PatrolRouteCreateWithStepsPayload): Promise<PatrolRouteRow> {
  return apiRequest(`${PREFIX}/equipment/patrol-routes/with-steps`, { method: 'POST', data: body });
}

export function updatePatrolRoute(rowId: number, body: PatrolRouteUpdatePayload): Promise<PatrolRouteRow> {
  return apiRequest(`${PREFIX}/equipment/patrol-routes/${rowId}`, { method: 'PATCH', data: body });
}

export function deletePatrolRoute(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/equipment/patrol-routes/${rowId}`, { method: 'DELETE' });
}

export function listPatrolSteps(routeId: number): Promise<PatrolStepRow[]> {
  return apiRequest(`${PREFIX}/equipment/patrol-routes/${routeId}/steps`);
}

export function replacePatrolSteps(routeId: number, steps: PatrolStepInPayload[]): Promise<PatrolStepRow[]> {
  return apiRequest(`${PREFIX}/equipment/patrol-routes/${routeId}/steps`, { method: 'PUT', data: steps });
}

export interface HazardRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  equipment_id?: number | null;
  equipment_asset_code?: string | null;
  equipment_name?: string | null;
  workshop_id?: number | null;
  workshop_name?: string | null;
  workshop_area?: string | null;
  reported_at?: string | null;
  created_at?: string | null;
  issue_type_code?: string | null;
  issue_type_codes?: string[];
  problem_summary?: string | null;
  solution_note?: string | null;
  status: string;
  before_image_file_ids?: string[] | null;
  after_image_file_ids?: string[] | null;
  handler_name?: string | null;
  handled_at?: string | null;
  registrant_user_id?: number | null;
  registrant_name?: string | null;
  responsible_user_id?: number | null;
  responsible_name?: string | null;
  report_enabled?: boolean;
  report_notify_user_ids?: number[];
}

export function listHazardReports(params?: {
  skip?: number;
  limit?: number;
  status?: string;
  equipment_id?: number;
  /** 巡查/反馈时间起（含，ISO8601） */
  reported_from?: string;
  /** 巡查/反馈时间止（含，ISO8601） */
  reported_to?: string;
  /** 为 true 时仅待治理（已登记）；与 status 同时传时以后端为准（通常只传 status） */
  for_remediation?: boolean;
  sheet_no?: string;
  keyword?: string;
}): Promise<PageResult<HazardRow>> {
  return apiRequest(`${PREFIX}/patrol/hazard-reports`, { params });
}

export type HazardCreatePayload = {
  equipment_id?: number | null;
  workshop_id?: number | null;
  workshop_area?: string | null;
  reported_at?: string | null;
  issue_type_code?: string | null;
  issue_type_codes?: string[];
  problem_summary?: string | null;
  solution_note?: string | null;
  status?: string;
  before_image_file_ids?: string[] | null;
  after_image_file_ids?: string[] | null;
  handler_name?: string | null;
  handled_at?: string | null;
  registrant_user_id?: number | null;
  responsible_user_id?: number | null;
  report_enabled?: boolean;
  report_notify_user_ids?: number[];
};

export function createHazardReport(body: HazardCreatePayload): Promise<HazardRow> {
  return apiRequest(`${PREFIX}/patrol/hazard-reports`, { method: 'POST', data: body });
}

export type HazardUpdatePayload = Partial<HazardCreatePayload>;

export function getHazardReport(rowId: number): Promise<HazardRow> {
  return apiRequest(`${PREFIX}/patrol/hazard-reports/${rowId}`);
}

export function updateHazardReport(rowId: number, body: HazardUpdatePayload): Promise<HazardRow> {
  return apiRequest(`${PREFIX}/patrol/hazard-reports/${rowId}`, { method: 'PATCH', data: body });
}

export function deleteHazardReport(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/patrol/hazard-reports/${rowId}`, { method: 'DELETE' });
}

export interface PatrolReportPoint {
  label: string;
  value: number;
}

export interface PatrolReportSeries {
  name: string;
  data: PatrolReportPoint[];
}

export interface PatrolReportPayload {
  report_key: string;
  points?: PatrolReportPoint[];
  series?: PatrolReportSeries[];
}

export interface PatrolReportKpiSummary {
  total_tasks: number;
  open_tasks: number;
  completed_tasks: number;
  contributor_count: number;
}

export function getPatrolReportKpiSummary(): Promise<PatrolReportKpiSummary> {
  return apiRequest(`${PREFIX}/patrol/reports/kpi-summary`);
}

export function getPatrolReport(
  reportKey: string,
  params?: { months?: number; days?: number },
): Promise<PatrolReportPayload> {
  return apiRequest(`${PREFIX}/patrol/reports/${reportKey}`, { params });
}
