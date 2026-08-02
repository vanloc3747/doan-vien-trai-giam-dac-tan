import { Router } from 'express';
import { getChapters, getChapter, postChapter, putChapter, removeChapter } from '../controllers/chapters.controller';
import { requireRole } from '../middleware/auth';

export const chaptersRouter = Router();

chaptersRouter.get('/', getChapters);
chaptersRouter.get('/:id', getChapter);
chaptersRouter.post('/', requireRole('admin'), postChapter);
chaptersRouter.put('/:id', requireRole('admin'), putChapter);
chaptersRouter.delete('/:id', requireRole('admin'), removeChapter);
