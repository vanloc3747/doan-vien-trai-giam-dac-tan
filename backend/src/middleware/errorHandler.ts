import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Kích thước file vượt quá giới hạn cho phép (4MB)' });
  }
  const status = err.status ?? 500;
  res.status(status).json({ error: err.message ?? 'Đã xảy ra lỗi máy chủ' });
}
