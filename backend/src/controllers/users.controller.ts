import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import {
  listUsersByStatus,
  updateUserStatus,
  listAllUsers,
  updateUserManagedChapter,
} from '../repositories/users.repository';

export async function getPendingUsers(req: AuthedRequest, res: Response) {
  const status = (req.query.status as string) ?? 'pending';
  res.json(await listUsersByStatus(status));
}

export async function patchUserStatus(req: AuthedRequest, res: Response) {
  const schema = z.object({ status: z.enum(['active', 'rejected']) });
  const { status } = schema.parse(req.body);
  const user = await updateUserStatus(parseInt(req.params.id as string, 10), status);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
  res.json(user);
}

export async function getAllUsers(req: AuthedRequest, res: Response) {
  res.json(await listAllUsers());
}

export async function patchUserManagedChapter(req: AuthedRequest, res: Response) {
  const schema = z.object({ chapterId: z.number().nullable() });
  const { chapterId } = schema.parse(req.body);
  const user = await updateUserManagedChapter(parseInt(req.params.id as string, 10), chapterId);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
  res.json(user);
}
