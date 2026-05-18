import type { Category, CategoryType } from './category';

export type Transaction = {
  id: string;
  type: CategoryType;
  amount: string;
  description: string | null;
  transactionDate: string;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
};