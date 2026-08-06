import { apiFetch } from './client';
import type { DashboardStats, GenderDistributionItem, Birthday, ReportDimension, ReportItem } from '../types';

export function fetchDashboardStats() {
  return apiFetch<DashboardStats>('/dashboard/stats');
}

export function fetchGenderDistribution() {
  return apiFetch<GenderDistributionItem[]>('/dashboard/gender-distribution');
}

export function fetchBirthdays() {
  return apiFetch<Birthday[]>('/dashboard/birthdays');
}

export function fetchReport(groupBy: ReportDimension) {
  return apiFetch<ReportItem[]>(`/dashboard/report?groupBy=${groupBy}`);
}
