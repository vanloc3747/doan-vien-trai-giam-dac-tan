import { apiFetch } from './client';
import type { Commendation, CommendationType } from '../types';

export interface CommendationFormInput {
  memberId: number;
  type: CommendationType;
  decisionDate: string;
  decisionNumber: string | null;
  content: string;
  issuedBy: string | null;
}

export function fetchCommendations() {
  return apiFetch<Commendation[]>('/commendations');
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
