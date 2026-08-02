import { Router } from 'express';
import {
  getCommendations,
  postCommendation,
  putCommendation,
  removeCommendation,
} from '../controllers/member-commendations.controller';

export const commendationsRouter = Router();

commendationsRouter.get('/', getCommendations);
commendationsRouter.post('/', postCommendation);
commendationsRouter.put('/:id', putCommendation);
commendationsRouter.delete('/:id', removeCommendation);
