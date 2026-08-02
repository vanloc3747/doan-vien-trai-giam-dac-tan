import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthedRequest, signToken } from '../middleware/auth';
import {
  findUserByUsername,
  findUserById,
  createUser,
  updateUserPassword,
} from '../repositories/users.repository';

const isProd = process.env.NODE_ENV === 'production';

export async function register(req: AuthedRequest, res: Response) {
  const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    fullName: z.string().min(1),
  });
  const { username, password, fullName } = schema.parse(req.body);

  const existing = await findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(username, passwordHash, fullName);
  res.status(201).json({ message: 'Đăng ký thành công, vui lòng chờ quản trị viên duyệt tài khoản', user });
}

export async function login(req: AuthedRequest, res: Response) {
  const schema = z.object({ username: z.string(), password: z.string() });
  const { username, password } = schema.parse(req.body);

  const user = await findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
  }
  if (user.status === 'pending') {
    return res.status(403).json({ error: 'Tài khoản đang chờ quản trị viên duyệt' });
  }
  if (user.status === 'rejected') {
    return res.status(403).json({ error: 'Tài khoản đã bị từ chối' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
  }

  const token = signToken({ id: user.id, username: user.username, role: user.role });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    role: user.role,
    managedChapterId: user.managed_chapter_id,
  });
}

export async function logout(req: AuthedRequest, res: Response) {
  res.clearCookie('token');
  res.status(204).send();
}

export async function me(req: AuthedRequest, res: Response) {
  res.json(req.user);
}

export async function changePassword(req: AuthedRequest, res: Response) {
  const schema = z.object({ currentPassword: z.string(), newPassword: z.string().min(6) });
  const { currentPassword, newPassword } = schema.parse(req.body);

  const user = await findUserById(req.user!.id);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });

  const newHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(user.id, newHash);
  res.json({ message: 'Đổi mật khẩu thành công' });
}
