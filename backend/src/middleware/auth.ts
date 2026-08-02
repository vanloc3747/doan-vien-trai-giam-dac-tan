import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from '../repositories/users.repository';

export interface AuthedRequest extends Request {
  user?: { id: number; username: string; fullName: string; role: string; managedChapterId: number | null };
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export function signToken(payload: { id: number; username: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await findUserById(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Tài khoản không hợp lệ hoặc chưa được duyệt' });
    }
    req.user = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      managedChapterId: user.managed_chapter_id,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ' });
  }
}

export function requireRole(role: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    next();
  };
}
