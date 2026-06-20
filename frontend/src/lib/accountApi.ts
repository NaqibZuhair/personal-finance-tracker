import { apiClient } from './apiClient';
import type {
  Account,
  AccountBalance,
  CreateAccountInput,
  UpdateAccountInput,
} from '../types/account';

type ApiResponse<T> = {
  data: T;
};

export async function getAccounts() {
  const response = await apiClient<ApiResponse<Account[]>>('/accounts');
  return response.data;
}

export async function getAccountBalances() {
  const response = await apiClient<ApiResponse<AccountBalance[]>>(
    '/accounts/balances',
  );

  return response.data;
}

export async function createAccount(payload: CreateAccountInput) {
  const response = await apiClient<ApiResponse<Account>>('/accounts', {
    method: 'POST',
    body: payload,
  });

  return response.data;
}

export async function updateAccount(id: string, payload: UpdateAccountInput) {
  const response = await apiClient<ApiResponse<Account>>(`/accounts/${id}`, {
    method: 'PUT',
    body: payload,
  });

  return response.data;
}

export async function deleteAccount(id: string) {
  await apiClient(`/accounts/${id}`, {
    method: 'DELETE',
  });
}