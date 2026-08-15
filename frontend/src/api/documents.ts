import { apiFetch, ApiError, API_BASE_URL } from './client';
import type { DocumentFile } from '../types';

export interface DocumentQuery {
  search?: string;
  category?: string;
  fileType?: string;
}

export function fetchDocuments(query: DocumentQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  if (query.fileType) params.set('fileType', query.fileType);
  const qs = params.toString();
  return apiFetch<DocumentFile[]>(`/documents${qs ? `?${qs}` : ''}`);
}

export function fetchDocumentCategories() {
  return apiFetch<string[]>('/documents/categories');
}

export interface DocumentFormInput {
  title: string;
  category: string | null;
  file?: File;
}

async function submitFormData(path: string, method: string, input: DocumentFormInput) {
  const formData = new FormData();
  formData.append('title', input.title);
  if (input.category) formData.append('category', input.category);
  if (input.file) formData.append('file', input.file);

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
  return res.json() as Promise<DocumentFile>;
}

export function createDocument(input: DocumentFormInput) {
  return submitFormData('/documents', 'POST', input);
}

export function updateDocument(id: number, input: DocumentFormInput) {
  return submitFormData(`/documents/${id}`, 'PUT', input);
}

export function deleteDocument(id: number) {
  return apiFetch<void>(`/documents/${id}`, { method: 'DELETE' });
}
