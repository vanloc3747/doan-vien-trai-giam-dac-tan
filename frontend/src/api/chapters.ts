import { apiFetch } from './client';
import type { Chapter } from '../types';

export function fetchChapters() {
  return apiFetch<Chapter[]>('/chapters');
}
