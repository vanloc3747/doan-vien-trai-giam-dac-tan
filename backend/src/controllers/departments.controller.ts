import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../repositories/departments.repository';

const departmentSchema = z.object({ name: z.string().min(1) });

export async function getDepartments(req: AuthedRequest, res: Response) {
  res.json(await listDepartments());
}

export async function getDepartment(req: AuthedRequest, res: Response) {
  const department = await getDepartmentById(parseInt(req.params.id as string, 10));
  if (!department) return res.status(404).json({ error: 'Không tìm thấy bộ phận công tác' });
  res.json(department);
}

export async function postDepartment(req: AuthedRequest, res: Response) {
  const { name } = departmentSchema.parse(req.body);
  const department = await createDepartment(name);
  res.status(201).json(department);
}

export async function putDepartment(req: AuthedRequest, res: Response) {
  const { name } = departmentSchema.parse(req.body);
  const department = await updateDepartment(parseInt(req.params.id as string, 10), name);
  if (!department) return res.status(404).json({ error: 'Không tìm thấy bộ phận công tác' });
  res.json(department);
}

export async function removeDepartment(req: AuthedRequest, res: Response) {
  await deleteDepartment(parseInt(req.params.id as string, 10));
  res.status(204).send();
}
