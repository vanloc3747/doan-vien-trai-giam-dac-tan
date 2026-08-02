import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import {
  listActivityPlans,
  getActivityPlanById,
  createActivityPlan,
  updateActivityPlan,
  deleteActivityPlan,
} from '../repositories/activity-plans.repository';

const planSchema = z.object({
  title: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  content: z.string().nullable().optional(),
  chapterId: z.number().nullable().optional(),
  status: z.enum(['chua_thuc_hien', 'dang_thuc_hien', 'da_hoan_thanh']),
});

export async function getActivityPlans(req: AuthedRequest, res: Response) {
  res.json(await listActivityPlans());
}

export async function postActivityPlan(req: AuthedRequest, res: Response) {
  const input = planSchema.parse(req.body);
  const plan = await createActivityPlan({
    title: input.title,
    startDate: input.startDate,
    endDate: input.endDate,
    content: input.content ?? null,
    chapterId: input.chapterId ?? null,
    status: input.status,
  });
  res.status(201).json(plan);
}

export async function putActivityPlan(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getActivityPlanById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy kế hoạch hoạt động' });

  const input = planSchema.parse(req.body);
  const plan = await updateActivityPlan(id, {
    title: input.title,
    startDate: input.startDate,
    endDate: input.endDate,
    content: input.content ?? null,
    chapterId: input.chapterId ?? null,
    status: input.status,
  });
  res.json(plan);
}

export async function removeActivityPlan(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getActivityPlanById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy kế hoạch hoạt động' });
  await deleteActivityPlan(id);
  res.status(204).send();
}
