import { apiFetch } from './client';
import type { Member, PaginatedResponse } from '../types';

export interface MemberQuery {
  search?: string;
  departmentId?: number;
  chapterId?: number;
  memberType?: string;
  page?: number;
  pageSize?: number;
}

export function fetchMembers(query: MemberQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.departmentId) params.set('departmentId', String(query.departmentId));
  if (query.chapterId) params.set('chapterId', String(query.chapterId));
  if (query.memberType) params.set('memberType', query.memberType);
  params.set('page', String(query.page ?? 1));
  params.set('pageSize', String(query.pageSize ?? 10));
  return apiFetch<PaginatedResponse<Member>>(`/members?${params.toString()}`);
}

export function fetchMember(id: number) {
  return apiFetch<Member>(`/members/${id}`);
}

export type MemberFormInput = Omit<Member, 'id' | 'chapterName' | 'departmentName' | 'photoUrl'>;

export function createMember(input: MemberFormInput) {
  return apiFetch<Member>('/members', { method: 'POST', body: JSON.stringify(input) });
}

export function updateMember(id: number, input: MemberFormInput) {
  return apiFetch<Member>(`/members/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteMember(id: number) {
  return apiFetch<void>(`/members/${id}`, { method: 'DELETE' });
}

export function updateMemberType(id: number, memberType: string) {
  return apiFetch<Member>(`/members/${id}/member-type`, {
    method: 'PATCH',
    body: JSON.stringify({ memberType }),
  });
}

export function transferMember(id: number, chapterId: number) {
  return apiFetch<Member>(`/members/${id}/transfer`, {
    method: 'PATCH',
    body: JSON.stringify({ chapterId }),
  });
}
