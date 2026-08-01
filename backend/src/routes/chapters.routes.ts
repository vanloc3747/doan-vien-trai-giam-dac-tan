import { Router } from 'express';
import { getChapters, getChapter, postChapter, putChapter, removeChapter } from '../controllers/chapters.controller';

export const chaptersRouter = Router();

chaptersRouter.get('/', getChapters);
chaptersRouter.get('/:id', getChapter);
chaptersRouter.post('/', postChapter);
chaptersRouter.put('/:id', putChapter);
chaptersRouter.delete('/:id', removeChapter);
