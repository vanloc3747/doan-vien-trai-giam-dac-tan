import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import {
  listUsersByStatus,
  updateUserStatus,
  listAllUsers,
  updateUserManagedChapter,
  findUserByUsername,
  findUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUser,
  updateUserPassword,
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

export async function postUser(req: AuthedRequest, res: Response) {
  const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    fullName: z.string().min(1),
    role: z.enum(['admin', 'can_bo_doan']),
    managedChapterId: z.number().nullable().optional(),
  });
  const input = schema.parse(req.body);

  const existing = await findUserByUsername(input.username);
  if (existing) return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại' });

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await createUserByAdmin({
    username: input.username,
    passwordHash,
    fullName: input.fullName,
    role: input.role,
    managedChapterId: input.role === 'admin' ? null : input.managedChapterId ?? null,
  });
  res.status(201).json(user);
}

export async function putUser(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await findUserById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });

  const schema = z.object({
    fullName: z.string().min(1),
    role: z.enum(['admin', 'can_bo_doan']),
    managedChapterId: z.number().nullable().optional(),
  });
  const input = schema.parse(req.body);

  if (id === req.user!.id && input.role !== 'admin') {
    return res.status(400).json({ error: 'Không thể tự hạ quyền quản trị của chính tài khoản đang đăng nhập' });
  }

  const user = await updateUserByAdmin(id, {
    fullName: input.fullName,
    role: input.role,
    managedChapterId: input.role === 'admin' ? null : input.managedChapterId ?? null,
  });
  res.json(user);
}

export async function removeUser(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  if (id === req.user!.id) {
    return res.status(400).json({ error: 'Không thể xóa chính tài khoản đang đăng nhập' });
  }
  const existing = await findUserById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });

  await deleteUser(id);
  res.status(204).send();
}

export async function patchUserPassword(req: AuthedRequest, res: Response) {
  const schema = z.object({ newPassword: z.string().min(6) });
  const { newPassword } = schema.parse(req.body);

  const id = parseInt(req.params.id as string, 10);
  const existing = await findUserById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(id, passwordHash);
  res.json({ message: 'Đổi mật khẩu thành công' });
}
