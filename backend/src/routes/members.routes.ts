import { Router } from 'express';
import {
  getMembers,
  getMember,
  postMember,
  putMember,
  removeMember,
  patchMemberType,
  patchMemberTransfer,
} from '../controllers/members.controller';

export const membersRouter = Router();

membersRouter.get('/', getMembers);
membersRouter.get('/:id', getMember);
membersRouter.post('/', postMember);
membersRouter.put('/:id', putMember);
membersRouter.delete('/:id', removeMember);
membersRouter.patch('/:id/member-type', patchMemberType);
membersRouter.patch('/:id/transfer', patchMemberTransfer);
