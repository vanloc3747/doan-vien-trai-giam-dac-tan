import { apiFetch } from './client';
import type { Chapter } from '../types';

export function fetchChapters() {
  return apiFetch<Chapter[]>('/chapters');
}

export function createChapter(name: string) {
  return apiFetch<Chapter>('/chapters', { method: 'POST', body: JSON.stringify({ name }) });
}

export function updateChapter(id: number, name: string) {
  return apiFetch<Chapter>(`/chapters/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
}

export function deleteChapter(id: number) {
  return apiFetch<void>(`/chapters/${id}`, { method: 'DELETE' });
}
