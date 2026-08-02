import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import { assertManageableChapter } from '../utils/chapterScope';
import {
  uploadMemberPhoto as uploadMemberPhotoToStorage,
  deleteMemberPhoto,
  getMemberPhotoSignedUrl,
  getMemberPhotoSignedUrls,
} from '../lib/storage';
import {
  listMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  updateMemberType,
  transferMemberChapter,
  updateMemberPhoto,
  listPendingApprovalMembers,
  approveMemberRecord,
} from '../repositories/members.repository';

const memberSchema = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(['nam', 'nu', 'khac']),
  chapterId: z.number().nullable().optional(),
  departmentId: z.number().nullable().optional(),
  joinDate: z.string(),
  memberType: z.enum(['doan_vien', 'dang_vien_sinh_hoat_doan']),
  roleTitleId: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

type MemberWithPhoto = { photoUrl?: string | null } & Record<string, unknown>;

async function attachPhotoUrl<T extends MemberWithPhoto>(member: T): Promise<T> {
  const signedUrl = await getMemberPhotoSignedUrl(member.photoUrl ?? null);
  return { ...member, photoUrl: signedUrl };
}

async function attachPhotoUrls<T extends MemberWithPhoto>(members: T[]): Promise<T[]> {
  const urls = await getMemberPhotoSignedUrls(members.map((m) => m.photoUrl ?? null));
  return members.map((m, i) => ({ ...m, photoUrl: urls[i] }));
}

export async function getMembers(req: AuthedRequest, res: Response) {
  const page = parseInt((req.query.page as string) ?? '1', 10);
  const pageSize = parseInt((req.query.pageSize as string) ?? '10', 10);
  const requestedChapterId = req.query.chapterId ? parseInt(req.query.chapterId as string, 10) : undefined;
  const managedChapterId = req.user!.managedChapterId;
  const chapterId =
    req.user!.role !== 'admin' && managedChapterId != null ? managedChapterId : requestedChapterId;
  const result = await listMembers({
    search: req.query.search as string | undefined,
    departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined,
    chapterId,
    memberType: req.query.memberType as string | undefined,
    page,
    pageSize,
  });
  res.json({ ...result, data: await attachPhotoUrls(result.data) });
}

export async function getMember(req: AuthedRequest, res: Response) {
  const member = await getMemberById(parseInt(req.params.id as string, 10));
  if (!member) return res.status(404).json({ error: 'Không tìm thấy đoàn viên' });
  const managedChapterId = req.user!.managedChapterId;
  if (req.user!.role !== 'admin' && managedChapterId != null && member.chapterId !== managedChapterId) {
    return res.status(404).json({ error: 'Không tìm thấy đoàn viên' });
  }
  res.json(await attachPhotoUrl(member));
}

export async function postMember(req: AuthedRequest, res: Response) {
  const input = memberSchema.parse(req.body);
  const scopeError = assertManageableChapter(req, input.chapterId ?? null);
  if (scopeError) return res.status(403).json({ error: scopeError });
  const approvalStatus = req.user!.role === 'admin' ? 'approved' : 'pending';
  const member = await createMember({
    fullName: input.fullName,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    chapterId: input.chapterId ?? null,
    departmentId: input.departmentId ?? null,
    joinDate: input.joinDate,
    memberType: input.memberType,
    roleTitleId: input.roleTitleId ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    notes: input.notes ?? null,
    approvalStatus,
  });
  res.status(201).json(await attachPhotoUrl(member!));
}

export async function putMember(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const input = memberSchema.parse(req.body);
  const existing = await getMemberById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy đoàn viên' });
  const scopeError =
    assertManageableChapter(req, existing.chapterId) || assertManageableChapter(req, input.chapterId ?? null);
  if (scopeError) return res.status(403).json({ error: scopeError });
  const approvalStatus = req.user!.role === 'admin' ? 'approved' : 'pending';
  const member = await updateMember(id, {
    fullName: input.fullName,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    chapterId: input.chapterId ?? null,
    departmentId: input.departmentId ?? null,
    joinDate: input.joinDate,
    memberType: input.memberType,
    roleTitleId: input.roleTitleId ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    notes: input.notes ?? null,
    approvalStatus,
  });
  res.json(await attachPhotoUrl(member!));
}

export async function removeMember(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getMemberById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy đoàn viên' });
  const scopeError = assertManageableChapter(req, existing.chapterId);
  if (scopeError) return res.status(403).json({ error: scopeError });
  if (existing.photoUrl) await deleteMemberPhoto(existing.photoUrl);
  await deleteMember(id);
  res.status(204).send();
}

export async function patchMemberType(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getMemberById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy đoàn viên' });
  const scopeError = assertManageableChapter(req, existing.chapterId);
  if (scopeError) return res.status(403).json({ error: scopeError });
  const schema = z.object({ memberType: z.enum(['doan_vien', 'dang_vien_sinh_hoat_doan']) });
  const { memberType } = schema.parse(req.body);
  const member = await updateMemberType(id, memberType);
  res.json(await attachPhotoUrl(member!));
}

export async function patchMemberTransfer(req: AuthedRequest, res: Response) {
  const schema = z.object({ chapterId: z.number() });
  const { chapterId } = schema.parse(req.body);
  const member = await transferMemberChapter(parseInt(req.params.id as string, 10), chapterId);
  res.json(await attachPhotoUrl(member!));
}

export async function getPendingApprovalMembers(req: AuthedRequest, res: Response) {
  res.json(await attachPhotoUrls(await listPendingApprovalMembers()));
}

export async function patchMemberApprove(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const member = await approveMemberRecord(id);
  if (!member) return res.status(404).json({ error: 'Không tìm thấy đoàn viên' });
  res.json(await attachPhotoUrl(member));
}

export async function uploadMemberPhotoHandler(req: AuthedRequest, res: Response) {
  if (!req.file) return res.status(400).json({ error: 'Không có file ảnh nào được gửi lên' });

  const id = parseInt(req.params.id as string, 10);
  const existing = await getMemberById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy đoàn viên' });
  const scopeError = assertManageableChapter(req, existing.chapterId);
  if (scopeError) return res.status(403).json({ error: scopeError });

  const objectPath = await uploadMemberPhotoToStorage(req.file.buffer, req.file.mimetype);
  if (existing.photoUrl) await deleteMemberPhoto(existing.photoUrl);

  const member = await updateMemberPhoto(id, objectPath);
  res.json(await attachPhotoUrl(member!));
}
