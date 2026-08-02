import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const BRANDING_DIR = path.join(__dirname, '../../uploads/branding');

fs.mkdirSync(BRANDING_DIR, { recursive: true });

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, BRANDING_DIR),
  filename: (_req, file, cb) => {
    const ext = ALLOWED_MIME_TYPES[file.mimetype] ?? path.extname(file.originalname);
    cb(null, `logo-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

export const uploadLogo = multer({
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

export const BRANDING_URL_PREFIX = '/uploads/branding';
export { BRANDING_DIR };
