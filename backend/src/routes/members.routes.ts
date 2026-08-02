import { Router } from 'express';
import {
  getMembers,
  getMember,
  postMember,
  putMember,
  removeMember,
  patchMemberType,
  patchMemberTransfer,
  uploadMemberPhotoHandler,
  getPendingApprovalMembers,
  patchMemberApprove,
} from '../controllers/members.controller';
import { uploadMemberPhoto } from '../middleware/upload';
import { requireRole } from '../middleware/auth';

export const membersRouter = Router();

membersRouter.get('/', getMembers);
membersRouter.get('/pending-approval', requireRole('admin'), getPendingApprovalMembers);
membersRouter.patch('/:id/approve', requireRole('admin'), patchMemberApprove);
membersRouter.get('/:id', getMember);
membersRouter.post('/', postMember);
membersRouter.put('/:id', putMember);
membersRouter.delete('/:id', removeMember);
membersRouter.patch('/:id/member-type', patchMemberType);
membersRouter.patch('/:id/transfer', requireRole('admin'), patchMemberTransfer);
membersRouter.post('/:id/photo', uploadMemberPhoto.single('photo'), uploadMemberPhotoHandler);
