import { Router } from 'express';
import {
  getCommendations,
  getCommendationStatsHandler,
  postCommendation,
  putCommendation,
  removeCommendation,
} from '../controllers/member-commendations.controller';

export const commendationsRouter = Router();

commendationsRouter.get('/stats', getCommendationStatsHandler);
commendationsRouter.get('/', getCommendations);
commendationsRouter.post('/', postCommendation);
commendationsRouter.put('/:id', putCommendation);
commendationsRouter.delete('/:id', removeCommendation);
