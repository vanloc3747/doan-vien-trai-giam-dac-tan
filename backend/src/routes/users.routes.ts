import { Router } from 'express';
import {
  getPendingUsers,
  patchUserStatus,
  getAllUsers,
  patchUserManagedChapter,
} from '../controllers/users.controller';
import { requireRole } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.get('/all', requireRole('admin'), getAllUsers);
usersRouter.get('/', requireRole('admin'), getPendingUsers);
usersRouter.patch('/:id/status', requireRole('admin'), patchUserStatus);
usersRouter.patch('/:id/managed-chapter', requireRole('admin'), patchUserManagedChapter);
