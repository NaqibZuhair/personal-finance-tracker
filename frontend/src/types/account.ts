export type AccountType = 'bank' | 'ewallet' | 'cash';

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AccountBalance = {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAccountInput = {
  name: string;
  type: AccountType;
  initialBalance: number;
  isActive?: boolean;
};

export type UpdateAccountInput = {
  name: string;
  type: AccountType;
  initialBalance: number;
  isActive: boolean;
};