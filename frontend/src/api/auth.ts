import { apiFetch } from './client';
import type { AuthUser, PendingAccount, UserAccount } from '../types';

export function login(username: string, password: string) {
  return apiFetch<AuthUser>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export function register(username: string, password: string, fullName: string) {
  return apiFetch<{ message: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, fullName }),
  });
}

export function logout() {
  return apiFetch<void>('/auth/logout', { method: 'POST' });
}

export function fetchMe() {
  return apiFetch<AuthUser>('/auth/me');
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ message: string }>('/auth/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function updateProfile(fullName: string) {
  return apiFetch<AuthUser>('/auth/me/profile', {
    method: 'PATCH',
    body: JSON.stringify({ fullName }),
  });
}

export function fetchPendingAccounts() {
  return apiFetch<PendingAccount[]>('/users?status=pending');
}

export function updateAccountStatus(id: number, status: 'active' | 'rejected') {
  return apiFetch<PendingAccount>(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function fetchAllUsers() {
  return apiFetch<UserAccount[]>('/users/all');
}

export function updateUserManagedChapter(id: number, chapterId: number | null) {
  return apiFetch<UserAccount>(`/users/${id}/managed-chapter`, {
    method: 'PATCH',
    body: JSON.stringify({ chapterId }),
  });
}

export interface CreateUserAccountInput {
  username: string;
  password: string;
  fullName: string;
  role: 'admin' | 'can_bo_doan';
  managedChapterId: number | null;
}

export interface UpdateUserAccountInput {
  fullName: string;
  role: 'admin' | 'can_bo_doan';
  managedChapterId: number | null;
}

export function createUserAccount(input: CreateUserAccountInput) {
  return apiFetch<UserAccount>('/users', { method: 'POST', body: JSON.stringify(input) });
}

export function updateUserAccount(id: number, input: UpdateUserAccountInput) {
  return apiFetch<UserAccount>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteUserAccount(id: number) {
  return apiFetch<void>(`/users/${id}`, { method: 'DELETE' });
}

export function resetUserPassword(id: number, newPassword: string) {
  return apiFetch<{ message: string }>(`/users/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ newPassword }),
  });
}
