import { apiFetch, ApiError, API_BASE_URL } from './client';
import type { ActivityReport } from '../types';

export function fetchActivityReports(planId?: number) {
  const qs = planId ? `?planId=${planId}` : '';
  return apiFetch<ActivityReport[]>(`/activity-reports${qs}`);
}

async function submitFormData(path: string, method: string, formData: FormData) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    let message = 'Đã xảy ra lỗi';
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<ActivityReport>;
}

export function createActivityReport(planId: number, content: string, images: File[]) {
  const formData = new FormData();
  formData.append('planId', String(planId));
  formData.append('content', content);
  images.forEach((file) => formData.append('images', file));
  return submitFormData('/activity-reports', 'POST', formData);
}

export function updateActivityReport(id: number, planId: number, content: string, images: File[]) {
  const formData = new FormData();
  formData.append('planId', String(planId));
  formData.append('content', content);
  images.forEach((file) => formData.append('images', file));
  return submitFormData(`/activity-reports/${id}`, 'PUT', formData);
}

export function deleteActivityReport(id: number) {
  return apiFetch<void>(`/activity-reports/${id}`, { method: 'DELETE' });
}

export function deleteActivityReportImage(imageId: number) {
  return apiFetch<void>(`/activity-reports/images/${imageId}`, { method: 'DELETE' });
}
