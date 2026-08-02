import { Router } from 'express';
import {
  getPendingUsers,
  patchUserStatus,
  getAllUsers,
  patchUserManagedChapter,
  postUser,
  putUser,
  removeUser,
  patchUserPassword,
} from '../controllers/users.controller';
import { requireRole } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.get('/all', requireRole('admin'), getAllUsers);
usersRouter.get('/', requireRole('admin'), getPendingUsers);
usersRouter.post('/', requireRole('admin'), postUser);
usersRouter.put('/:id', requireRole('admin'), putUser);
usersRouter.delete('/:id', requireRole('admin'), removeUser);
usersRouter.patch('/:id/status', requireRole('admin'), patchUserStatus);
usersRouter.patch('/:id/managed-chapter', requireRole('admin'), patchUserManagedChapter);
usersRouter.patch('/:id/password', requireRole('admin'), patchUserPassword);
