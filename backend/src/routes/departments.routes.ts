import { Router } from 'express';
import {
  getDepartments,
  getDepartment,
  postDepartment,
  putDepartment,
  removeDepartment,
} from '../controllers/departments.controller';

export const departmentsRouter = Router();

departmentsRouter.get('/', getDepartments);
departmentsRouter.get('/:id', getDepartment);
departmentsRouter.post('/', postDepartment);
departmentsRouter.put('/:id', putDepartment);
departmentsRouter.delete('/:id', removeDepartment);
