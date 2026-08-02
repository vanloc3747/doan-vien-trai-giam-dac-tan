import { Router } from 'express';
import {
  getRoleTitles,
  getRoleTitle,
  postRoleTitle,
  putRoleTitle,
  removeRoleTitle,
} from '../controllers/role-titles.controller';
import { requireRole } from '../middleware/auth';

export const roleTitlesRouter = Router();

roleTitlesRouter.get('/', getRoleTitles);
roleTitlesRouter.get('/:id', getRoleTitle);
roleTitlesRouter.post('/', requireRole('admin'), postRoleTitle);
roleTitlesRouter.put('/:id', requireRole('admin'), putRoleTitle);
roleTitlesRouter.delete('/:id', requireRole('admin'), removeRoleTitle);
