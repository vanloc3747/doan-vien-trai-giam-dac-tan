import { apiFetch } from './client';
import type { RoleTitle } from '../types';

export function fetchRoleTitles() {
  return apiFetch<RoleTitle[]>('/role-titles');
}

export function createRoleTitle(name: string) {
  return apiFetch<RoleTitle>('/role-titles', { method: 'POST', body: JSON.stringify({ name }) });
}

export function updateRoleTitle(id: number, name: string) {
  return apiFetch<RoleTitle>(`/role-titles/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
}

export function deleteRoleTitle(id: number) {
  return apiFetch<void>(`/role-titles/${id}`, { method: 'DELETE' });
}
