import { Router } from 'express';
import { getChapters, getChapter } from '../controllers/chapters.controller';

export const chaptersRouter = Router();

chaptersRouter.get('/', getChapters);
chaptersRouter.get('/:id', getChapter);
