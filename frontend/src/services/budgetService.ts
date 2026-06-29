import { apiClient } from '../lib/apiClient';
import type { Category } from '../types/category';

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string;
  category: Category;
  spentAmount: number;
  createdAt: string;
  updatedAt: string;
}

export const budgetService = {
  getBudgets: async (month: string): Promise<Budget[]> => {
    const response = await apiClient<{ data: Budget[] }>(`/budgets?month=${month}`);
    return response.data;
  },

  upsertBudget: async (data: {
    amount: number;
    month: number;
    year: number;
    categoryId: string;
  }): Promise<Budget> => {
    const response = await apiClient<{ data: Budget }>('/budgets', {
      method: 'POST',
      body: data,
    });
    return response.data;
  },
};
