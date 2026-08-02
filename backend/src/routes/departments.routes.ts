import { Router } from 'express';
import {
  getDepartments,
  getDepartment,
  postDepartment,
  putDepartment,
  removeDepartment,
} from '../controllers/departments.controller';
import { requireRole } from '../middleware/auth';

export const departmentsRouter = Router();

departmentsRouter.get('/', getDepartments);
departmentsRouter.get('/:id', getDepartment);
departmentsRouter.post('/', requireRole('admin'), postDepartment);
departmentsRouter.put('/:id', requireRole('admin'), putDepartment);
departmentsRouter.delete('/:id', requireRole('admin'), removeDepartment);
