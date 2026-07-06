import type { Category } from './category';
import type { Account } from './account';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type Transaction = {
  id: string;
  accountId: string;
  account: Account;
  type: TransactionType;
  amount: string;
  description: string | null;
  tags?: string[];
  transactionDate: string;
  categoryId?: string | null;
  category?: Category | null;
  toAccountId?: string | null;
  toAccount?: Account | null;
  createdAt: string;
  updatedAt: string;
};