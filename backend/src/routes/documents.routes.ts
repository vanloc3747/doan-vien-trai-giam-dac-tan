import { Router } from 'express';
import { requireRole } from '../middleware/auth';
import { uploadDocument } from '../middleware/documentUpload';
import {
  getDocuments,
  getDocumentCategories,
  postDocument,
  putDocument,
  removeDocument,
} from '../controllers/documents.controller';

export const documentsRouter = Router();

documentsRouter.get('/', getDocuments);
documentsRouter.get('/categories', getDocumentCategories);
documentsRouter.post('/', requireRole('admin'), uploadDocument.single('file'), postDocument);
documentsRouter.put('/:id', requireRole('admin'), uploadDocument.single('file'), putDocument);
documentsRouter.delete('/:id', requireRole('admin'), removeDocument);
