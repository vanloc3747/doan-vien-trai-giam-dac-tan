import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { getActivityPlanById } from '../repositories/activity-plans.repository';
import {
  listActivityReports,
  getActivityReportById,
  createActivityReport,
  updateActivityReport,
  deleteActivityReport,
  addActivityReportImage,
  getActivityReportImageById,
  deleteActivityReportImageById,
} from '../repositories/activity-reports.repository';
import {
  uploadActivityReportImage,
  deleteActivityReportImage,
  getActivityReportImageSignedUrls,
} from '../lib/storage';

type ReportWithImages = { images: { id: number; imagePath: string }[] } & Record<string, unknown>;

async function attachImageUrls<T extends ReportWithImages>(report: T) {
  const urls = await getActivityReportImageSignedUrls(report.images.map((img) => img.imagePath));
  return { ...report, images: report.images.map((img, i) => ({ id: img.id, url: urls[i] })) };
}

async function attachImageUrlsMany<T extends ReportWithImages>(reports: T[]) {
  return Promise.all(reports.map(attachImageUrls));
}

export async function getActivityReports(req: AuthedRequest, res: Response) {
  const planId = req.query.planId ? parseInt(req.query.planId as string, 10) : undefined;
  const reports = await listActivityReports(planId);
  res.json(await attachImageUrlsMany(reports));
}

export async function postActivityReport(req: AuthedRequest, res: Response) {
  const planId = parseInt(req.body.planId as string, 10);
  const content = (req.body.content as string | undefined)?.trim();
  if (!Number.isInteger(planId)) return res.status(400).json({ error: 'Kế hoạch hoạt động không hợp lệ' });
  if (!content) return res.status(400).json({ error: 'Nội dung báo cáo không được để trống' });

  const plan = await getActivityPlanById(planId);
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy kế hoạch hoạt động' });

  const reportId = await createActivityReport(planId, content, req.user!.id);

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  for (const file of files) {
    const objectPath = await uploadActivityReportImage(file.buffer, file.mimetype);
    await addActivityReportImage(reportId, objectPath);
  }

  const report = await getActivityReportById(reportId);
  res.status(201).json(await attachImageUrls(report!));
}

export async function putActivityReport(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getActivityReportById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy báo cáo' });

  const planId = parseInt(req.body.planId as string, 10);
  const content = (req.body.content as string | undefined)?.trim();
  if (!Number.isInteger(planId)) return res.status(400).json({ error: 'Kế hoạch hoạt động không hợp lệ' });
  if (!content) return res.status(400).json({ error: 'Nội dung báo cáo không được để trống' });

  const plan = await getActivityPlanById(planId);
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy kế hoạch hoạt động' });

  await updateActivityReport(id, planId, content);

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  for (const file of files) {
    const objectPath = await uploadActivityReportImage(file.buffer, file.mimetype);
    await addActivityReportImage(id, objectPath);
  }

  const report = await getActivityReportById(id);
  res.json(await attachImageUrls(report!));
}

export async function removeActivityReport(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getActivityReportById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy báo cáo' });

  for (const image of existing.images) {
    await deleteActivityReportImage(image.imagePath);
  }
  await deleteActivityReport(id);
  res.status(204).send();
}

export async function removeActivityReportImage(req: AuthedRequest, res: Response) {
  const imageId = parseInt(req.params.imageId as string, 10);
  const image = await getActivityReportImageById(imageId);
  if (!image) return res.status(404).json({ error: 'Không tìm thấy hình ảnh' });

  await deleteActivityReportImage(image.imagePath);
  await deleteActivityReportImageById(imageId);
  res.status(204).send();
}
