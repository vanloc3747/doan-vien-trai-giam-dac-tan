import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
  changePassword,
  updateProfile,
  uploadAvatarHandler,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { uploadAvatar } from '../middleware/avatarUpload';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
authRouter.patch('/me/password', requireAuth, changePassword);
authRouter.patch('/me/profile', requireAuth, updateProfile);
authRouter.post('/me/avatar', requireAuth, uploadAvatar.single('avatar'), uploadAvatarHandler);
