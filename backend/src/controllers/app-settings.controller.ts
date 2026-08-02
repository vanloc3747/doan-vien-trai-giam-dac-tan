import fs from 'fs';
import path from 'path';
import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import { BRANDING_DIR, BRANDING_URL_PREFIX } from '../middleware/logoUpload';
import { getAppSettings, updateAppSettings, updateAppSettingsLogo } from '../repositories/app-settings.repository';

const settingsSchema = z.object({ title: z.string().min(1), subtitle: z.string().min(1) });

export async function getSettings(req: AuthedRequest, res: Response) {
  res.json(await getAppSettings());
}

export async function putSettings(req: AuthedRequest, res: Response) {
  const { title, subtitle } = settingsSchema.parse(req.body);
  res.json(await updateAppSettings({ title, subtitle }));
}

export async function postSettingsLogo(req: AuthedRequest, res: Response) {
  if (!req.file) return res.status(400).json({ error: 'Không có file ảnh nào được gửi lên' });

  const existing = await getAppSettings();
  if (existing.logoUrl) {
    const oldFilename = path.basename(existing.logoUrl);
    fs.unlink(path.join(BRANDING_DIR, oldFilename), () => {});
  }

  const logoUrl = `${BRANDING_URL_PREFIX}/${req.file.filename}`;
  res.json(await updateAppSettingsLogo(logoUrl));
}
