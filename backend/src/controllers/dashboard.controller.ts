import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import {
  getDashboardStats,
  getGenderDistribution,
  getDepartmentDistribution,
  getBirthdaysThisMonth,
} from '../repositories/dashboard.repository';

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
