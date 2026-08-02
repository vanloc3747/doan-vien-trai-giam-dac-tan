import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Kích thước file ảnh vượt quá giới hạn 5MB' });
  }
  const status = err.status ?? 500;
  res.status(status).json({ error: err.message ?? 'Đã xảy ra lỗi máy chủ' });
}
