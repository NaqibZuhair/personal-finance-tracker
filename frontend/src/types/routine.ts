import type { Account } from './account';

export type AllocationRoutineItem = {
  id: string;
  amount: string | number;
  description?: string;
  routineId: string;
  accountId: string;
  account?: Account;
  toAccountId: string;
  toAccount?: Account;
  createdAt: string;
  updatedAt: string;
};

export type AllocationRoutine = {
  id: string;
  name: string;
  description?: string;
  items: AllocationRoutineItem[];
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateRoutineItemInput = {
  amount: number;
  description?: string;
  accountId: string;
  toAccountId: string;
};

export type CreateRoutineInput = {
  name: string;
  description?: string;
  items: CreateRoutineItemInput[];
};

export type UpdateRoutineInput = CreateRoutineInput;
