import { Router } from 'express';
import { getPendingUsers, patchUserStatus } from '../controllers/users.controller';
import { requireRole } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.get('/', requireRole('admin'), getPendingUsers);
usersRouter.patch('/:id/status', requireRole('admin'), patchUserStatus);
