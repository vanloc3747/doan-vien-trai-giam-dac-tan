import { apiFetch, ApiError, API_BASE_URL } from './client';
import type { AppSettings } from '../types';

export function fetchAppSettings() {
  return apiFetch<AppSettings>('/app-settings');
}

export function updateAppSettings(input: { title: string; subtitle: string }) {
  return apiFetch<AppSettings>('/app-settings', { method: 'PUT', body: JSON.stringify(input) });
}

export async function uploadAppLogo(file: File) {
  const formData = new FormData();
  formData.append('logo', file);
  const res = await fetch(`${API_BASE_URL}/app-settings/logo`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    let message = 'Đã xảy ra lỗi khi tải logo lên';
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<AppSettings>;
}
