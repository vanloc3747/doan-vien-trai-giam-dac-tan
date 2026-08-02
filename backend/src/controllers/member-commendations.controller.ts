import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import { assertManageableChapter } from '../utils/chapterScope';
import { getMemberById } from '../repositories/members.repository';
import {
  listCommendations,
  getCommendationById,
  createCommendation,
  updateCommendation,
  deleteCommendation,
  getCommendationStats,
} from '../repositories/member-commendations.repository';

const commendationSchema = z.object({
  memberId: z.number(),
  type: z.enum(['khen_thuong', 'ky_luat']),
  decisionDate: z.string(),
  decisionNumber: z.string().nullable().optional(),
  content: z.string().min(1),
  issuedBy: z.string().nullable().optional(),
});

export async function getCommendations(req: AuthedRequest, res: Response) {
  const requestedChapterId = req.query.chapterId ? parseInt(req.query.chapterId as string, 10) : undefined;
  const managedChapterId = req.user!.managedChapterId;
  const chapterId =
    req.user!.role !== 'admin' && managedChapterId != null ? managedChapterId : requestedChapterId;
  res.json(
    await listCommendations({
      chapterId,
      type: req.query.type as 'khen_thuong' | 'ky_luat' | undefined,
      search: req.query.search as string | undefined,
    })
  );
}

export async function getCommendationStatsHandler(req: AuthedRequest, res: Response) {
  const managedChapterId = req.user!.managedChapterId;
  const chapterId = req.user!.role !== 'admin' && managedChapterId != null ? managedChapterId : undefined;
  res.json(await getCommendationStats(chapterId));
}

export async function postCommendation(req: AuthedRequest, res: Response) {
  const input = commendationSchema.parse(req.body);
  const member = await getMemberById(input.memberId);
  if (!member) return res.status(404).json({ error: 'Không tìm thấy đoàn viên' });
  const scopeError = assertManageableChapter(req, member.chapterId);
  if (scopeError) return res.status(403).json({ error: scopeError });

  const commendation = await createCommendation({
    memberId: input.memberId,
    type: input.type,
    decisionDate: input.decisionDate,
    decisionNumber: input.decisionNumber ?? null,
    content: input.content,
    issuedBy: input.issuedBy ?? null,
  });
  res.status(201).json(commendation);
}

export async function putCommendation(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const input = commendationSchema.parse(req.body);
  const existing = await getCommendationById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy bản ghi' });

  const newMember = await getMemberById(input.memberId);
  if (!newMember) return res.status(404).json({ error: 'Không tìm thấy đoàn viên' });

  const scopeError =
    assertManageableChapter(req, existing.chapterId) || assertManageableChapter(req, newMember.chapterId);
  if (scopeError) return res.status(403).json({ error: scopeError });

  const commendation = await updateCommendation(id, {
    memberId: input.memberId,
    type: input.type,
    decisionDate: input.decisionDate,
    decisionNumber: input.decisionNumber ?? null,
    content: input.content,
    issuedBy: input.issuedBy ?? null,
  });
  res.json(commendation);
}

export async function removeCommendation(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getCommendationById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy bản ghi' });
  const scopeError = assertManageableChapter(req, existing.chapterId);
  if (scopeError) return res.status(403).json({ error: scopeError });
  await deleteCommendation(id);
  res.status(204).send();
}
