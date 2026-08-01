import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import {
  listMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  updateMemberType,
  transferMemberChapter,
} from '../repositories/members.repository';

const memberSchema = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(['nam', 'nu', 'khac']),
  chapterId: z.number().nullable().optional(),
  departmentId: z.number().nullable().optional(),
  joinDate: z.string(),
  memberType: z.enum(['doan_vien', 'dang_vien_sinh_hoat_doan']),
  roleTitle: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function getMembers(req: AuthedRequest, res: Response) {
  const page = parseInt((req.query.page as string) ?? '1', 10);
  const pageSize = parseInt((req.query.pageSize as string) ?? '10', 10);
  const result = await listMembers({
    search: req.query.search as string | undefined,
    departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined,
    chapterId: req.query.chapterId ? parseInt(req.query.chapterId as string, 10) : undefined,
    memberType: req.query.memberType as string | undefined,
    page,
    pageSize,
  });
  res.json(result);
}

export async function getMember(req: AuthedRequest, res: Response) {
  const member = await getMemberById(parseInt(req.params.id as string, 10));
  if (!member) return res.status(404).json({ error: 'Không tìm thấy đoàn viên' });
  res.json(member);
}

export async function postMember(req: AuthedRequest, res: Response) {
  const input = memberSchema.parse(req.body);
  const member = await createMember({
    fullName: input.fullName,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    chapterId: input.chapterId ?? null,
    departmentId: input.departmentId ?? null,
    joinDate: input.joinDate,
    memberType: input.memberType,
    roleTitle: input.roleTitle ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    notes: input.notes ?? null,
  });
  res.status(201).json(member);
}

export async function putMember(req: AuthedRequest, res: Response) {
  const input = memberSchema.parse(req.body);
  const member = await updateMember(parseInt(req.params.id as string, 10), {
    fullName: input.fullName,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    chapterId: input.chapterId ?? null,
    departmentId: input.departmentId ?? null,
    joinDate: input.joinDate,
    memberType: input.memberType,
    roleTitle: input.roleTitle ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    notes: input.notes ?? null,
  });
  res.json(member);
}

export async function removeMember(req: AuthedRequest, res: Response) {
  await deleteMember(parseInt(req.params.id as string, 10));
  res.status(204).send();
}

export async function patchMemberType(req: AuthedRequest, res: Response) {
  const schema = z.object({ memberType: z.enum(['doan_vien', 'dang_vien_sinh_hoat_doan']) });
  const { memberType } = schema.parse(req.body);
  const member = await updateMemberType(parseInt(req.params.id as string, 10), memberType);
  res.json(member);
}

export async function patchMemberTransfer(req: AuthedRequest, res: Response) {
  const schema = z.object({ chapterId: z.number() });
  const { chapterId } = schema.parse(req.body);
  const member = await transferMemberChapter(parseInt(req.params.id as string, 10), chapterId);
  res.json(member);
}
