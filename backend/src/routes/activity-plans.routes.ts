import { Router } from 'express';
import {
  getActivityPlans,
  postActivityPlan,
  putActivityPlan,
  removeActivityPlan,
} from '../controllers/activity-plans.controller';
import { requireRole } from '../middleware/auth';

export const activityPlansRouter = Router();

activityPlansRouter.get('/', getActivityPlans);
activityPlansRouter.post('/', requireRole('admin'), postActivityPlan);
activityPlansRouter.put('/:id', requireRole('admin'), putActivityPlan);
activityPlansRouter.delete('/:id', requireRole('admin'), removeActivityPlan);
