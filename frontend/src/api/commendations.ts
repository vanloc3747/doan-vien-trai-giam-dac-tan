import { apiFetch } from './client';
import type { Commendation, CommendationType, CommendationStats } from '../types';

export interface CommendationFormInput {
  memberId: number;
  type: CommendationType;
  decisionDate: string;
  decisionNumber: string | null;
  content: string;
  issuedBy: string | null;
}

export interface CommendationQuery {
  search?: string;
  chapterId?: number;
  type?: CommendationType;
}

export function fetchCommendations(query: CommendationQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.chapterId) params.set('chapterId', String(query.chapterId));
  if (query.type) params.set('type', query.type);
  const qs = params.toString();
  return apiFetch<Commendation[]>(`/commendations${qs ? `?${qs}` : ''}`);
}

export function fetchCommendationStats() {
  return apiFetch<CommendationStats>('/commendations/stats');
}

export function createCommendation(input: CommendationFormInput) {
  return apiFetch<Commendation>('/commendations', { method: 'POST', body: JSON.stringify(input) });
}

export function updateCommendation(id: number, input: CommendationFormInput) {
  return apiFetch<Commendation>(`/commendations/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteCommendation(id: number) {
  return apiFetch<void>(`/commendations/${id}`, { method: 'DELETE' });
}
