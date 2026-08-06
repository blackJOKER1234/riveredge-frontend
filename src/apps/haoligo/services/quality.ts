/**
 * 好力 GO 质量业务 API（/api/v1/apps/haoligo/quality）
 */

import { apiRequest } from '../../../services/api';
import type { PageResult } from './common';

const PREFIX = '/apps/haoligo';
export type QualityTicketStatus = 'registered' | 'assigned' | 'processing' | 'completed';

export interface QualityTicketBaseRow {
  id: number;
  uuid: string;
  sheet_no?: string | null;
  title?: string | null;
  workshop_id?: number | null;
  workshop_name?: string | null;
  production_line?: string | null;
  work_order_no?: string | null;
  material_code_snapshot?: string | null;
  model_snapshot?: string | null;
  mold_code_snapshot?: string | null;
  equipment_id?: number | null;
  equipment_asset_code?: string | null;
  equipment_name?: string | null;
  problem_description?: string | null;
  immediate_action?: string | null;
  temporary_action?: string | null;
  temporary_due_at?: string | null;
  temporary_action_image_uuids?: string[];
  temporary_submitted_at?: string | null;
  long_term_action?: string | null;
  long_term_due_at?: string | null;
  long_term_action_image_uuids?: string[];
  long_term_submitted_at?: string | null;
  due_at?: string | null;
  completed_at?: string | null;
  status: QualityTicketStatus | string;
  attachment_file_uuids?: string[];
  registrant_user_id?: number | null;
  registrant_name?: string | null;
  responsible_user_id?: number | null;
  responsible_user_ids?: number[];
  overdue_notify_user_ids?: number[];
  temporary_overdue_notify_user_ids?: number[];
  long_term_overdue_notify_user_ids?: number[];
  responsible_name?: string | null;
  notify_user_ids?: number[];
  reported_at?: string | null;
  close_note?: string | null;
  close_confirmed_at?: string | null;
  close_confirmer_user_id?: number | null;
  created_at?: string | null;
}

export interface QualityIssueRow extends QualityTicketBaseRow {
  issue_type_codes?: string[];
  issue_kind?: string | null;
  planned_qty?: string | number | null;
  completed_qty?: string | number | null;
  defect_qty?: string | number | null;
  defect_rate?: string | number | null;
}

export interface LineStopFeedbackRow extends QualityTicketBaseRow {
  stop_kind?: string | null;
  stop_reason?: string | null;
  stop_started_at?: string | null;
  recovered_at?: string | null;
}

export type QualityIssueCreatePayload = {
  title: string;
  workshop_id?: number | null;
  production_line?: string | null;
  work_order_no?: string | null;
  material_code_snapshot?: string | null;
  model_snapshot?: string | null;
  mold_code_snapshot?: string | null;
  equipment_id?: number | null;
  problem_description?: string | null;
  immediate_action?: string | null;
  long_term_action?: string | null;
  due_at?: string | null;
  temporary_due_at?: string | null;
  long_term_due_at?: string | null;
  attachment_file_uuids?: string[];
  registrant_user_id?: number | null;
  responsible_user_id?: number | null;
  responsible_user_ids?: number[];
  overdue_notify_user_ids?: number[];
  notify_user_ids?: number[];
  reported_at?: string | null;
  issue_type_codes?: string[];
  issue_kind?: string | null;
  planned_qty?: number | null;
  completed_qty?: number | null;
  defect_qty?: number | null;
};

export type QualityIssueUpdatePayload = Partial<QualityIssueCreatePayload> & {
  status?: QualityTicketStatus | string;
  completed_at?: string | null;
};

export type LineStopFeedbackCreatePayload = {
  title: string;
  workshop_id?: number | null;
  production_line?: string | null;
  work_order_no?: string | null;
  material_code_snapshot?: string | null;
  model_snapshot?: string | null;
  mold_code_snapshot?: string | null;
  equipment_id?: number | null;
  problem_description?: string | null;
  immediate_action?: string | null;
  long_term_action?: string | null;
  due_at?: string | null;
  temporary_due_at?: string | null;
  long_term_due_at?: string | null;
  attachment_file_uuids?: string[];
  registrant_user_id?: number | null;
  responsible_user_id?: number | null;
  responsible_user_ids?: number[];
  overdue_notify_user_ids?: number[];
  notify_user_ids?: number[];
  reported_at?: string | null;
  stop_kind?: string;
  stop_reason?: string | null;
  stop_started_at?: string | null;
  recovered_at?: string | null;
};

export type LineStopFeedbackUpdatePayload = Partial<LineStopFeedbackCreatePayload> & {
  status?: QualityTicketStatus | string;
  completed_at?: string | null;
};

export interface QualityReportPayload {
  report_key: string;
  points: Array<{ label: string; value: number }>;
  status_distribution?: Array<{ label: string; value: number }>;
  monthly_trend?: Array<{ label: string; value: number }>;
  dimension_ranking?: Array<{ label: string; value: number }>;
  items?: Array<{
    sheet_no: string;
    status: string;
    status_label: string;
    summary: string;
    dimension?: string | null;
    reported_at?: string | null;
    due_at?: string | null;
    is_overdue: boolean;
  }>;
}

export interface QualityWorkOrderScanPayload {
  work_order_no: string;
}

export interface QualityWorkOrderScanOut {
  work_order_no: string;
  workshop_id?: number | null;
  production_line?: string | null;
  equipment_id?: number | null;
  material_code_snapshot?: string | null;
  model_snapshot?: string | null;
  mold_code_snapshot?: string | null;
}

export interface QualityWorkOrderDatasetBindingPayload {
  dataset_uuid?: string | null;
  work_order_param_key?: string | null;
  workshop_name_column?: string | null;
  production_line_column?: string | null;
  equipment_asset_code_column?: string | null;
  mold_code_column?: string | null;
  finished_product_code_column?: string | null;
  finished_product_name_column?: string | null;
}

export function getQualityWorkOrderDatasetBinding(): Promise<QualityWorkOrderDatasetBindingPayload> {
  return apiRequest(`${PREFIX}/quality/work-order-dataset-binding`);
}

export function putQualityWorkOrderDatasetBinding(
  body: QualityWorkOrderDatasetBindingPayload,
): Promise<QualityWorkOrderDatasetBindingPayload> {
  return apiRequest(`${PREFIX}/quality/work-order-dataset-binding`, { method: 'PUT', data: body });
}

export function scanQualityWorkOrder(body: QualityWorkOrderScanPayload): Promise<QualityWorkOrderScanOut> {
  return apiRequest(`${PREFIX}/quality/scan-work-order`, { method: 'POST', data: body });
}

export interface QualityRegisterSubmitPayload {
  responsible_user_ids: number[];
  overdue_notify_user_ids: number[];
}

export interface QualityTemporaryActionPayload {
  responsible_user_ids?: number[];
  overdue_notify_user_ids?: number[];
  temporary_overdue_notify_user_ids?: number[];
  temporary_action: string;
  temporary_due_at: string;
  temporary_action_image_uuids: string[];
}

export interface QualityLongTermActionPayload {
  long_term_action: string;
  long_term_due_at: string;
  long_term_action_image_uuids: string[];
}

export interface QualityHandleMeasuresPayload extends QualityTemporaryActionPayload, QualityLongTermActionPayload {
  responsible_user_ids: number[];
  overdue_notify_user_ids: number[];
  temporary_overdue_notify_user_ids?: number[];
  long_term_overdue_notify_user_ids?: number[];
}

export interface QualityCloseConfirmPayload {
  close_note?: string | null;
  recovered_at?: string | null;
}

export function listQualityIssues(params?: {
  skip?: number;
  limit?: number;
  status?: string;
  keyword?: string;
}): Promise<PageResult<QualityIssueRow>> {
  return apiRequest(`${PREFIX}/quality/issues`, { params });
}

export function getQualityIssue(rowId: number): Promise<QualityIssueRow> {
  return apiRequest(`${PREFIX}/quality/issues/${rowId}`);
}

export function createQualityIssue(body: QualityIssueCreatePayload): Promise<QualityIssueRow> {
  return apiRequest(`${PREFIX}/quality/issues`, { method: 'POST', data: body });
}

export function updateQualityIssue(rowId: number, body: QualityIssueUpdatePayload): Promise<QualityIssueRow> {
  return apiRequest(`${PREFIX}/quality/issues/${rowId}`, { method: 'PATCH', data: body });
}

export function submitQualityIssue(rowId: number): Promise<QualityIssueRow> {
  return apiRequest(`${PREFIX}/quality/issues/${rowId}/submit`, { method: 'POST' });
}

export function completeQualityIssue(rowId: number): Promise<QualityIssueRow> {
  return apiRequest(`${PREFIX}/quality/issues/${rowId}/complete`, { method: 'POST' });
}

export function submitQualityIssueRegister(rowId: number, body: QualityRegisterSubmitPayload): Promise<QualityIssueRow> {
  return apiRequest(`${PREFIX}/quality/issues/${rowId}/workflow/register-submit`, { method: 'POST', data: body });
}

export function submitQualityIssueTemporaryAction(rowId: number, body: QualityTemporaryActionPayload): Promise<QualityIssueRow> {
  return apiRequest(`${PREFIX}/quality/issues/${rowId}/workflow/temporary-action`, { method: 'POST', data: body });
}

export function submitQualityIssueLongTermAction(rowId: number, body: QualityLongTermActionPayload): Promise<QualityIssueRow> {
  return apiRequest(`${PREFIX}/quality/issues/${rowId}/workflow/long-term-action`, { method: 'POST', data: body });
}

export function submitQualityIssueHandleMeasures(rowId: number, body: QualityHandleMeasuresPayload): Promise<QualityIssueRow> {
  return apiRequest(`${PREFIX}/quality/issues/${rowId}/workflow/handle-measures`, { method: 'POST', data: body });
}

export function confirmQualityIssueClose(rowId: number, body: QualityCloseConfirmPayload): Promise<QualityIssueRow> {
  return apiRequest(`${PREFIX}/quality/issues/${rowId}/workflow/confirm-close`, { method: 'POST', data: body });
}

export function deleteQualityIssue(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/quality/issues/${rowId}`, { method: 'DELETE' });
}

export function listLineStopFeedbacks(params?: {
  skip?: number;
  limit?: number;
  status?: string;
  keyword?: string;
}): Promise<PageResult<LineStopFeedbackRow>> {
  return apiRequest(`${PREFIX}/quality/line-stops`, { params });
}

export function getLineStopFeedback(rowId: number): Promise<LineStopFeedbackRow> {
  return apiRequest(`${PREFIX}/quality/line-stops/${rowId}`);
}

export function createLineStopFeedback(body: LineStopFeedbackCreatePayload): Promise<LineStopFeedbackRow> {
  return apiRequest(`${PREFIX}/quality/line-stops`, { method: 'POST', data: body });
}

export function updateLineStopFeedback(
  rowId: number,
  body: LineStopFeedbackUpdatePayload,
): Promise<LineStopFeedbackRow> {
  return apiRequest(`${PREFIX}/quality/line-stops/${rowId}`, { method: 'PATCH', data: body });
}

export function submitLineStopFeedback(rowId: number): Promise<LineStopFeedbackRow> {
  return apiRequest(`${PREFIX}/quality/line-stops/${rowId}/submit`, { method: 'POST' });
}

export function completeLineStopFeedback(rowId: number): Promise<LineStopFeedbackRow> {
  return apiRequest(`${PREFIX}/quality/line-stops/${rowId}/complete`, { method: 'POST' });
}

export function submitLineStopFeedbackRegister(rowId: number, body: QualityRegisterSubmitPayload): Promise<LineStopFeedbackRow> {
  return apiRequest(`${PREFIX}/quality/line-stops/${rowId}/workflow/register-submit`, { method: 'POST', data: body });
}

export function submitLineStopFeedbackTemporaryAction(rowId: number, body: QualityTemporaryActionPayload): Promise<LineStopFeedbackRow> {
  return apiRequest(`${PREFIX}/quality/line-stops/${rowId}/workflow/temporary-action`, { method: 'POST', data: body });
}

export function submitLineStopFeedbackLongTermAction(rowId: number, body: QualityLongTermActionPayload): Promise<LineStopFeedbackRow> {
  return apiRequest(`${PREFIX}/quality/line-stops/${rowId}/workflow/long-term-action`, { method: 'POST', data: body });
}

export function submitLineStopFeedbackHandleMeasures(rowId: number, body: QualityHandleMeasuresPayload): Promise<LineStopFeedbackRow> {
  return apiRequest(`${PREFIX}/quality/line-stops/${rowId}/workflow/handle-measures`, { method: 'POST', data: body });
}

export function confirmLineStopFeedbackClose(rowId: number, body: QualityCloseConfirmPayload): Promise<LineStopFeedbackRow> {
  return apiRequest(`${PREFIX}/quality/line-stops/${rowId}/workflow/confirm-close`, { method: 'POST', data: body });
}

export function deleteLineStopFeedback(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/quality/line-stops/${rowId}`, { method: 'DELETE' });
}

export function getQualityReport(reportKey: 'issue-report' | 'complaint-report' | 'line-stop-report'): Promise<QualityReportPayload> {
  return apiRequest(`${PREFIX}/quality/reports/${reportKey}`);
}
