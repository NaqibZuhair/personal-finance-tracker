import { apiClient } from '../lib/apiClient';
import type { Category } from '../types/category';
import type { Account } from '../types/account';
import type { TransactionType } from '../types/transaction';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  frequency: RecurringFrequency;
  nextRunDate: string;
  isActive: boolean;
  categoryId: string | null;
  category?: Category;
  accountId: string;
  account?: Account;
  toAccountId: string | null;
  toAccount?: Account;
  createdAt: string;
}

export type CreateRecurringDTO = {
  type: TransactionType;
  amount: number;
  description?: string;
  frequency: RecurringFrequency;
  nextRunDate: string;
  categoryId?: string | null;
  accountId: string;
  toAccountId?: string | null;
};

export type UpdateRecurringDTO = CreateRecurringDTO & {
  isActive?: boolean;
};

export const recurringService = {
  async getRecurringTransactions() {
    const response = await apiClient<{ data: RecurringTransaction[] }>('/recurring');
    return response.data;
  },

  async createRecurringTransaction(data: CreateRecurringDTO) {
    const response = await apiClient<{ data: RecurringTransaction }>('/recurring', {
      method: 'POST',
      body: data,
    });
    return response.data;
  },

  async updateRecurringTransaction(id: string, data: UpdateRecurringDTO) {
    const response = await apiClient<{ data: RecurringTransaction }>(`/recurring/${id}`, {
      method: 'PUT',
      body: data,
    });
    return response.data;
  },

  async deleteRecurringTransaction(id: string) {
    await apiClient(`/recurring/${id}`, {
      method: 'DELETE',
    });
  },
};
