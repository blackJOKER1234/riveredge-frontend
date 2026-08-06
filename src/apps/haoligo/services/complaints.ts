/**
 * 好力 GO 客户投诉业务 API（/api/v1/apps/haoligo/quality/complaints）
 */

import { apiRequest } from '../../../services/api';
import type { PageResult } from './common';
import type {
  QualityCloseConfirmPayload,
  QualityHandleMeasuresPayload,
  QualityLongTermActionPayload,
  QualityRegisterSubmitPayload,
  QualityTemporaryActionPayload,
  QualityTicketBaseRow,
  QualityTicketStatus,
} from './quality';

const PREFIX = '/apps/haoligo';
export interface CustomerComplaintRow extends QualityTicketBaseRow {
  customer_name?: string | null;
  material_code?: string | null;
  model?: string | null;
  batch_no?: string | null;
  quantity?: string | number | null;
  claim_amount?: string | number | null;
}
export type CustomerComplaintCreatePayload = {
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
  customer_name?: string | null;
  material_code?: string | null;
  model?: string | null;
  batch_no?: string | null;
  quantity?: number | null;
  claim_amount?: number | null;
};

export type CustomerComplaintUpdatePayload = Partial<CustomerComplaintCreatePayload> & {
  status?: QualityTicketStatus | string;
  completed_at?: string | null;
};
export function listCustomerComplaints(params?: {
  skip?: number;
  limit?: number;
  status?: string;
  keyword?: string;
}): Promise<PageResult<CustomerComplaintRow>> {
  return apiRequest(`${PREFIX}/quality/complaints`, { params });
}

export function getCustomerComplaint(rowId: number): Promise<CustomerComplaintRow> {
  return apiRequest(`${PREFIX}/quality/complaints/${rowId}`);
}

export function createCustomerComplaint(body: CustomerComplaintCreatePayload): Promise<CustomerComplaintRow> {
  return apiRequest(`${PREFIX}/quality/complaints`, { method: 'POST', data: body });
}

export function updateCustomerComplaint(
  rowId: number,
  body: CustomerComplaintUpdatePayload,
): Promise<CustomerComplaintRow> {
  return apiRequest(`${PREFIX}/quality/complaints/${rowId}`, { method: 'PATCH', data: body });
}

export function submitCustomerComplaint(rowId: number): Promise<CustomerComplaintRow> {
  return apiRequest(`${PREFIX}/quality/complaints/${rowId}/submit`, { method: 'POST' });
}

export function completeCustomerComplaint(rowId: number): Promise<CustomerComplaintRow> {
  return apiRequest(`${PREFIX}/quality/complaints/${rowId}/complete`, { method: 'POST' });
}

export function submitCustomerComplaintRegister(rowId: number, body: QualityRegisterSubmitPayload): Promise<CustomerComplaintRow> {
  return apiRequest(`${PREFIX}/quality/complaints/${rowId}/workflow/register-submit`, { method: 'POST', data: body });
}

export function submitCustomerComplaintTemporaryAction(rowId: number, body: QualityTemporaryActionPayload): Promise<CustomerComplaintRow> {
  return apiRequest(`${PREFIX}/quality/complaints/${rowId}/workflow/temporary-action`, { method: 'POST', data: body });
}

export function submitCustomerComplaintLongTermAction(rowId: number, body: QualityLongTermActionPayload): Promise<CustomerComplaintRow> {
  return apiRequest(`${PREFIX}/quality/complaints/${rowId}/workflow/long-term-action`, { method: 'POST', data: body });
}

export function submitCustomerComplaintHandleMeasures(rowId: number, body: QualityHandleMeasuresPayload): Promise<CustomerComplaintRow> {
  return apiRequest(`${PREFIX}/quality/complaints/${rowId}/workflow/handle-measures`, { method: 'POST', data: body });
}

export function confirmCustomerComplaintClose(rowId: number, body: QualityCloseConfirmPayload): Promise<CustomerComplaintRow> {
  return apiRequest(`${PREFIX}/quality/complaints/${rowId}/workflow/confirm-close`, { method: 'POST', data: body });
}

export function deleteCustomerComplaint(rowId: number): Promise<void> {
  return apiRequest(`${PREFIX}/quality/complaints/${rowId}`, { method: 'DELETE' });
}
