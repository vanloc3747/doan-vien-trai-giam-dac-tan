import { apiFetch } from './client';
import type { DashboardStats, GenderDistributionItem, DepartmentDistributionItem, Birthday } from '../types';

export function fetchDashboardStats() {
  return apiFetch<DashboardStats>('/dashboard/stats');
}

export function fetchGenderDistribution() {
  return apiFetch<GenderDistributionItem[]>('/dashboard/gender-distribution');
}

export function fetchDepartmentDistribution() {
  return apiFetch<DepartmentDistributionItem[]>('/dashboard/department-distribution');
}

export function fetchBirthdays() {
  return apiFetch<Birthday[]>('/dashboard/birthdays');
}
