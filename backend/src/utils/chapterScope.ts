import { AuthedRequest } from '../middleware/auth';

export function assertManageableChapter(req: AuthedRequest, chapterId: number | null): string | null {
  if (req.user!.role === 'admin') return null;
  const managed = req.user!.managedChapterId;
  if (managed == null) return 'Bạn không có quyền chỉnh sửa đoàn viên';
  if (chapterId !== managed) return 'Bạn chỉ được quản lý đoàn viên của chi đoàn mình phụ trách';
  return null;
}
