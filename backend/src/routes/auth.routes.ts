import { Router } from 'express';
import { register, login, logout, me, changePassword, updateProfile } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
authRouter.patch('/me/password', requireAuth, changePassword);
authRouter.patch('/me/profile', requireAuth, updateProfile);
