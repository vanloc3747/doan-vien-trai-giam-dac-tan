import { Router } from 'express';
import {
  getCalendarNotes,
  getTodayCalendarNotes,
  postCalendarNote,
  putCalendarNote,
  removeCalendarNote,
} from '../controllers/calendar-notes.controller';
import { requireRole } from '../middleware/auth';

export const calendarNotesRouter = Router();

calendarNotesRouter.get('/today', getTodayCalendarNotes);
calendarNotesRouter.get('/', getCalendarNotes);
calendarNotesRouter.post('/', requireRole('admin'), postCalendarNote);
calendarNotesRouter.put('/:id', requireRole('admin'), putCalendarNote);
calendarNotesRouter.delete('/:id', requireRole('admin'), removeCalendarNote);
