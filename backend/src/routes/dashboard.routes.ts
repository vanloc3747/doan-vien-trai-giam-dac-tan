import { Router } from 'express';
import {
  stats,
  genderDistribution,
  departmentDistribution,
  birthdays,
  report,
} from '../controllers/dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', stats);
dashboardRouter.get('/gender-distribution', genderDistribution);
dashboardRouter.get('/department-distribution', departmentDistribution);
dashboardRouter.get('/birthdays', birthdays);
dashboardRouter.get('/report', report);
