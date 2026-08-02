import { apiFetch, ApiError, API_BASE_URL } from './client';
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

export type MemberFormInput = Omit<
  Member,
  'id' | 'chapterName' | 'departmentName' | 'roleTitleName' | 'photoUrl' | 'approvalStatus'
>;

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

export function fetchPendingApprovalMembers() {
  return apiFetch<Member[]>('/members/pending-approval');
}

export function approveMember(id: number) {
  return apiFetch<Member>(`/members/${id}/approve`, { method: 'PATCH' });
}

export async function uploadMemberPhoto(id: number, file: File) {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await fetch(`${API_BASE_URL}/members/${id}/photo`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    let message = 'Đã xảy ra lỗi khi tải ảnh lên';
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<Member>;
}

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolveUploadUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
