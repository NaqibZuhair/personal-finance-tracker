import { apiClient } from '../lib/apiClient';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  color: string | null;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export const goalService = {
  getGoals: async (): Promise<SavingsGoal[]> => {
    const response = await apiClient<{ data: SavingsGoal[] }>('/goals');
    return response.data;
  },

  createGoal: async (data: {
    name: string;
    targetAmount: number;
    deadline?: string | null;
    color?: string | null;
  }): Promise<SavingsGoal> => {
    const response = await apiClient<{ data: SavingsGoal }>('/goals', {
      method: 'POST',
      body: data,
    });
    return response.data;
  },

  updateGoal: async (
    id: string,
    data: {
      name?: string;
      targetAmount?: number;
      deadline?: string | null;
      color?: string | null;
    }
  ): Promise<SavingsGoal> => {
    const response = await apiClient<{ data: SavingsGoal }>(`/goals/${id}`, {
      method: 'PUT',
      body: data,
    });
    return response.data;
  },

  deleteGoal: async (id: string): Promise<void> => {
    await apiClient(`/goals/${id}`, { method: 'DELETE' });
  },
};
