import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import {
  listChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
} from '../repositories/chapters.repository';

const chapterSchema = z.object({ name: z.string().min(1) });

export async function getChapters(req: AuthedRequest, res: Response) {
  res.json(await listChapters());
}

export async function getChapter(req: AuthedRequest, res: Response) {
  const chapter = await getChapterById(parseInt(req.params.id as string, 10));
  if (!chapter) return res.status(404).json({ error: 'Không tìm thấy chi đoàn' });
  res.json(chapter);
}

export async function postChapter(req: AuthedRequest, res: Response) {
  const { name } = chapterSchema.parse(req.body);
  const chapter = await createChapter(name);
  res.status(201).json(chapter);
}

export async function putChapter(req: AuthedRequest, res: Response) {
  const { name } = chapterSchema.parse(req.body);
  const chapter = await updateChapter(parseInt(req.params.id as string, 10), name);
  if (!chapter) return res.status(404).json({ error: 'Không tìm thấy chi đoàn' });
  res.json(chapter);
}

export async function removeChapter(req: AuthedRequest, res: Response) {
  await deleteChapter(parseInt(req.params.id as string, 10));
  res.status(204).send();
}
