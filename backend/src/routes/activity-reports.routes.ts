import { Router } from 'express';
import {
  getActivityReports,
  postActivityReport,
  putActivityReport,
  removeActivityReport,
  removeActivityReportImage,
} from '../controllers/activity-reports.controller';
import { uploadActivityReportImages } from '../middleware/activityReportImagesUpload';

export const activityReportsRouter = Router();

activityReportsRouter.get('/', getActivityReports);
activityReportsRouter.post('/', uploadActivityReportImages.array('images', 6), postActivityReport);
activityReportsRouter.put('/:id', uploadActivityReportImages.array('images', 6), putActivityReport);
activityReportsRouter.delete('/:id', removeActivityReport);
activityReportsRouter.delete('/images/:imageId', removeActivityReportImage);
