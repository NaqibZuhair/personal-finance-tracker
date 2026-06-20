import type { Category, CategoryType } from './category';
import type { Account } from './account';

export type Transaction = {
  id: string;
  accountId: string;
  account: Account;
  type: CategoryType;
  amount: string;
  description: string | null;
  transactionDate: string;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
};