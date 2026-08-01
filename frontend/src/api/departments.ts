import { apiFetch } from './client';
import type { Department } from '../types';

export function fetchDepartments() {
  return apiFetch<Department[]>('/departments');
}

export function createDepartment(name: string) {
  return apiFetch<Department>('/departments', { method: 'POST', body: JSON.stringify({ name }) });
}

export function updateDepartment(id: number, name: string) {
  return apiFetch<Department>(`/departments/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
}

export function deleteDepartment(id: number) {
  return apiFetch<void>(`/departments/${id}`, { method: 'DELETE' });
}
