import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import { uploadBrandingLogo, deleteBrandingLogo, getBrandingPublicUrl } from '../lib/storage';
import { getAppSettings, updateAppSettings, updateAppSettingsLogo } from '../repositories/app-settings.repository';

const settingsSchema = z.object({ title: z.string().min(1), subtitle: z.string().min(1) });

export async function getSettings(req: AuthedRequest, res: Response) {
  const settings = await getAppSettings();
  res.json({ ...settings, logoUrl: getBrandingPublicUrl(settings.logoUrl) });
}

export async function putSettings(req: AuthedRequest, res: Response) {
  const { title, subtitle } = settingsSchema.parse(req.body);
  const settings = await updateAppSettings({ title, subtitle });
  res.json({ ...settings, logoUrl: getBrandingPublicUrl(settings.logoUrl) });
}

export async function postSettingsLogo(req: AuthedRequest, res: Response) {
  if (!req.file) return res.status(400).json({ error: 'Không có file ảnh nào được gửi lên' });

  const existing = await getAppSettings();
  const objectPath = await uploadBrandingLogo(req.file.buffer, req.file.mimetype);
  if (existing.logoUrl) await deleteBrandingLogo(existing.logoUrl);

  const settings = await updateAppSettingsLogo(objectPath);
  res.json({ ...settings, logoUrl: getBrandingPublicUrl(settings.logoUrl) });
}
