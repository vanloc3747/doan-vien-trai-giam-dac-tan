import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { listChapters, getChapterById } from '../repositories/chapters.repository';

export async function getChapters(req: AuthedRequest, res: Response) {
  res.json(await listChapters());
}

export async function getChapter(req: AuthedRequest, res: Response) {
  const chapter = await getChapterById(parseInt(req.params.id as string, 10));
  if (!chapter) return res.status(404).json({ error: 'Không tìm thấy chi đoàn' });
  res.json(chapter);
}
