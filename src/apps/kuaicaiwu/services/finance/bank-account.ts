import { apiRequest } from '../../../../services/api';

function normalizeArrayResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as { data?: unknown }).data)) {
    return (response as { data: T[] }).data;
  }
  return [];
}

export interface BankAccount {
  id: number;
  tenant_id: number;
  account_code: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  currency: string;
  opening_balance: number;
  current_balance: number;
  is_active: boolean;
  notes?: string;
  attachments?: Array<{ uid?: string; name?: string; status?: string; url?: string }>;
}

const API = '/apps/kuaicaiwu/bank-accounts';

export const bankAccountService = {
  list: async (params?: { skip?: number; limit?: number; is_active?: boolean }): Promise<BankAccount[]> => {
    const response = await apiRequest<BankAccount[]>(API, { method: 'GET', params });
    return normalizeArrayResponse<BankAccount>(response);
  },

  get: (id: number) =>
    apiRequest<BankAccount>(`${API}/${id}`, { method: 'GET' }),

  create: (data: Partial<BankAccount>) =>
    apiRequest<BankAccount>(API, { method: 'POST', data }),

  update: (id: number, data: Partial<BankAccount>) =>
    apiRequest<BankAccount>(`${API}/${id}`, { method: 'PUT', data }),

  delete: (id: number) =>
    apiRequest<void>(`${API}/${id}`, { method: 'DELETE' }),

  listTransactions: async (accountId: number, params?: { skip?: number; limit?: number }): Promise<Array<Record<string, unknown>>> => {
    const response = await apiRequest<Array<Record<string, unknown>>>(`${API}/${accountId}/transactions`, { method: 'GET', params });
    return normalizeArrayResponse<Record<string, unknown>>(response);
  },

  importStatement: (accountId: number, csvContent: string) =>
    apiRequest<{ imported_count: number; current_balance: number }>(`${API}/${accountId}/import-statement`, {
      method: 'POST',
      data: { csv_content: csvContent },
    }),
};
