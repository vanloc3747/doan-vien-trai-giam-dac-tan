import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import {
  listRoleTitles,
  getRoleTitleById,
  createRoleTitle,
  updateRoleTitle,
  deleteRoleTitle,
} from '../repositories/role-titles.repository';

const roleTitleSchema = z.object({ name: z.string().min(1) });

export async function getRoleTitles(req: AuthedRequest, res: Response) {
  res.json(await listRoleTitles());
}

export async function getRoleTitle(req: AuthedRequest, res: Response) {
  const roleTitle = await getRoleTitleById(parseInt(req.params.id as string, 10));
  if (!roleTitle) return res.status(404).json({ error: 'Không tìm thấy chức vụ' });
  res.json(roleTitle);
}

export async function postRoleTitle(req: AuthedRequest, res: Response) {
  const { name } = roleTitleSchema.parse(req.body);
  const roleTitle = await createRoleTitle(name);
  res.status(201).json(roleTitle);
}

export async function putRoleTitle(req: AuthedRequest, res: Response) {
  const { name } = roleTitleSchema.parse(req.body);
  const roleTitle = await updateRoleTitle(parseInt(req.params.id as string, 10), name);
  if (!roleTitle) return res.status(404).json({ error: 'Không tìm thấy chức vụ' });
  res.json(roleTitle);
}

export async function removeRoleTitle(req: AuthedRequest, res: Response) {
  await deleteRoleTitle(parseInt(req.params.id as string, 10));
  res.status(204).send();
}
