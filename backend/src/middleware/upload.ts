import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const MEMBER_PHOTOS_DIR = path.join(__dirname, '../../uploads/members');

fs.mkdirSync(MEMBER_PHOTOS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MEMBER_PHOTOS_DIR),
  filename: (_req, file, cb) => {
    const ext = ALLOWED_MIME_TYPES[file.mimetype] ?? path.extname(file.originalname);
    cb(null, `member-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

export const uploadMemberPhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
      cb(new Error('Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WEBP'));
      return;
    }
    cb(null, true);
  },
});

export const MEMBER_PHOTOS_URL_PREFIX = '/uploads/members';
export { MEMBER_PHOTOS_DIR };
