import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import {
  listCalendarNotes,
  listTodayCalendarNotes,
  getCalendarNoteById,
  createCalendarNote,
  updateCalendarNote,
  deleteCalendarNote,
} from '../repositories/calendar-notes.repository';

const noteSchema = z.object({
  noteDate: z.string(),
  content: z.string().min(1),
});

export async function getCalendarNotes(req: AuthedRequest, res: Response) {
  const now = new Date();
  const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();
  const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'year/month không hợp lệ' });
  }
  res.json(await listCalendarNotes(year, month));
}

export async function getTodayCalendarNotes(req: AuthedRequest, res: Response) {
  res.json(await listTodayCalendarNotes());
}

export async function postCalendarNote(req: AuthedRequest, res: Response) {
  const { noteDate, content } = noteSchema.parse(req.body);
  const note = await createCalendarNote(noteDate, content, req.user!.id);
  res.status(201).json(note);
}

export async function putCalendarNote(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getCalendarNoteById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });

  const { noteDate, content } = noteSchema.parse(req.body);
  const note = await updateCalendarNote(id, noteDate, content);
  res.json(note);
}

export async function removeCalendarNote(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getCalendarNoteById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
  await deleteCalendarNote(id);
  res.status(204).send();
}
