import { apiClient } from './apiClient';
import type {
  AllocationRoutine,
  CreateRoutineInput,
  UpdateRoutineInput,
} from '../types/routine';

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export async function getRoutines() {
  const response = await apiClient<ApiResponse<AllocationRoutine[]>>('/routines');
  return response.data;
}

export async function createRoutine(payload: CreateRoutineInput) {
  const response = await apiClient<ApiResponse<AllocationRoutine>>('/routines', {
    method: 'POST',
    body: payload,
  });
  return response.data;
}

export async function updateRoutine(id: string, payload: UpdateRoutineInput) {
  const response = await apiClient<ApiResponse<AllocationRoutine>>(`/routines/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return response.data;
}

export async function deleteRoutine(id: string) {
  await apiClient(`/routines/${id}`, {
    method: 'DELETE',
  });
}

export async function executeRoutine(id: string) {
  const response = await apiClient<ApiResponse<unknown>>(`/routines/${id}/execute`, {
    method: 'POST',
  });
  return response.message || 'Routine executed successfully';
}
