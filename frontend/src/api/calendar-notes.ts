import { apiFetch } from './client';
import type { CalendarNote } from '../types';

export function fetchCalendarNotes(year: number, month: number) {
  return apiFetch<CalendarNote[]>(`/calendar-notes?year=${year}&month=${month}`);
}

export function fetchTodayCalendarNotes() {
  return apiFetch<CalendarNote[]>('/calendar-notes/today');
}

export function createCalendarNote(noteDate: string, content: string) {
  return apiFetch<CalendarNote>('/calendar-notes', {
    method: 'POST',
    body: JSON.stringify({ noteDate, content }),
  });
}

export function updateCalendarNote(id: number, noteDate: string, content: string) {
  return apiFetch<CalendarNote>(`/calendar-notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ noteDate, content }),
  });
}

export function deleteCalendarNote(id: number) {
  return apiFetch<void>(`/calendar-notes/${id}`, { method: 'DELETE' });
}
