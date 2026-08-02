import { Router } from 'express';
import { getSettings, putSettings, postSettingsLogo } from '../controllers/app-settings.controller';
import { requireRole } from '../middleware/auth';
import { uploadLogo } from '../middleware/logoUpload';

export const appSettingsRouter = Router();

appSettingsRouter.get('/', getSettings);
appSettingsRouter.put('/', requireRole('admin'), putSettings);
appSettingsRouter.post('/logo', requireRole('admin'), uploadLogo.single('logo'), postSettingsLogo);
