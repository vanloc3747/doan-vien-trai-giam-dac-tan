import { apiFetch } from './client';
import type { ActivityPlan, ActivityPlanStatus } from '../types';

export interface ActivityPlanFormInput {
  title: string;
  startDate: string;
  endDate: string;
  content: string | null;
  chapterId: number | null;
  status: ActivityPlanStatus;
}

export function fetchActivityPlans() {
  return apiFetch<ActivityPlan[]>('/activity-plans');
}

export function createActivityPlan(input: ActivityPlanFormInput) {
  return apiFetch<ActivityPlan>('/activity-plans', { method: 'POST', body: JSON.stringify(input) });
}

export function updateActivityPlan(id: number, input: ActivityPlanFormInput) {
  return apiFetch<ActivityPlan>(`/activity-plans/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteActivityPlan(id: number) {
  return apiFetch<void>(`/activity-plans/${id}`, { method: 'DELETE' });
}
