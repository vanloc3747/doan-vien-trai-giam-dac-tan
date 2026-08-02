import { Router } from 'express';
import {
  getActivityReports,
  postActivityReport,
  putActivityReport,
  removeActivityReport,
  removeActivityReportImage,
} from '../controllers/activity-reports.controller';
import { uploadActivityReportImages } from '../middleware/activityReportImagesUpload';
import { requireRole } from '../middleware/auth';

export const activityReportsRouter = Router();

activityReportsRouter.get('/', getActivityReports);
activityReportsRouter.post(
  '/',
  requireRole('admin'),
  uploadActivityReportImages.array('images', 6),
  postActivityReport
);
activityReportsRouter.put(
  '/:id',
  requireRole('admin'),
  uploadActivityReportImages.array('images', 6),
  putActivityReport
);
activityReportsRouter.delete('/:id', requireRole('admin'), removeActivityReport);
activityReportsRouter.delete('/images/:imageId', requireRole('admin'), removeActivityReportImage);
