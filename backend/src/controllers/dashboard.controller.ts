import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import {
  getDashboardStats,
  getGenderDistribution,
  getDepartmentDistribution,
  getBirthdaysThisMonth,
  getReportByDimension,
  type ReportDimension,
} from '../repositories/dashboard.repository';

const REPORT_DIMENSIONS: ReportDimension[] = [
  'gender',
  'chapter',
  'department',
  'memberType',
  'roleTitle',
  'ageGroup',
];

export async function stats(req: AuthedRequest, res: Response) {
  res.json(await getDashboardStats());
}

export async function genderDistribution(req: AuthedRequest, res: Response) {
  res.json(await getGenderDistribution());
}

export async function departmentDistribution(req: AuthedRequest, res: Response) {
  res.json(await getDepartmentDistribution());
}

export async function birthdays(req: AuthedRequest, res: Response) {
  res.json(await getBirthdaysThisMonth());
}

export async function report(req: AuthedRequest, res: Response) {
  const groupBy = req.query.groupBy as string;
  if (!REPORT_DIMENSIONS.includes(groupBy as ReportDimension)) {
    return res.status(400).json({ error: 'Tiêu chí thống kê không hợp lệ' });
  }
  res.json(await getReportByDimension(groupBy as ReportDimension));
}
