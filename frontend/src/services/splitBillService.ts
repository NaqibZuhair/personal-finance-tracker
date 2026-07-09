import { apiClient } from '../lib/apiClient';

export interface SplitBillParticipant {
  id: string;
  name: string;
  shareAmount: number | string;
  isPaid: boolean;
}

export interface SplitBill {
  id: string;
  title: string;
  totalAmount: number | string;
  myShare: number | string;
  taxServicePercent: number | string;
  splitMethod: 'equal' | 'itemized' | 'custom';
  createdAt: string;
  participants?: SplitBillParticipant[];
}

export interface Debt {
  id: string;
  friendName: string;
  amount: number | string;
  type: 'receivable' | 'payable';
  description?: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

export interface CreateSplitBillPayload {
  title: string;
  totalAmount: number;
  taxServicePercent?: number;
  splitMethod: 'equal' | 'itemized' | 'custom';
  participants: { name: string; shareAmount?: number }[];
  items?: { item: string; price: number; assignedTo: string[] }[];
  accountId?: string;
  categoryId?: string;
}

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export const splitBillService = {
  async createSplitBill(data: CreateSplitBillPayload): Promise<SplitBill> {
    const res = await apiClient<ApiResponse<SplitBill>>('/split-bills', {
      method: 'POST',
      body: data,
    });
    return res.data;
  },

  async getSplitBills(): Promise<SplitBill[]> {
    const res = await apiClient<ApiResponse<SplitBill[]>>('/split-bills');
    return res.data;
  },

  async deleteSplitBill(id: string): Promise<void> {
    await apiClient(`/split-bills/${id}`, { method: 'DELETE' });
  },

  async getDebts(filter?: { type?: string; isPaid?: boolean }): Promise<Debt[]> {
    const params = new URLSearchParams();
    if (filter?.type) params.append('type', filter.type);
    if (filter?.isPaid !== undefined) params.append('isPaid', String(filter.isPaid));
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await apiClient<ApiResponse<Debt[]>>(`/debts${query}`);
    return res.data;
  },

  async markDebtPaid(id: string): Promise<Debt> {
    const res = await apiClient<ApiResponse<Debt>>(`/debts/${id}/pay`, {
      method: 'PUT',
    });
    return res.data;
  },

  async deleteDebt(id: string): Promise<void> {
    await apiClient(`/debts/${id}`, { method: 'DELETE' });
  },
};
