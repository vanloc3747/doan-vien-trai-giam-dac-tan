import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import {
  listDocuments,
  getDocumentById,
  listDocumentCategories,
  createDocument,
  updateDocument,
  deleteDocument,
  type Document,
} from '../repositories/documents.repository';
import { uploadDocumentFile, deleteDocumentFile, getDocumentSignedUrls } from '../lib/storage';

type DocumentWithUrl = Document & { fileUrl: string | null };

async function attachUrl(doc: Document): Promise<DocumentWithUrl> {
  const [fileUrl] = await getDocumentSignedUrls([doc.filePath]);
  return { ...doc, fileUrl };
}

async function attachUrls(docs: Document[]): Promise<DocumentWithUrl[]> {
  const urls = await getDocumentSignedUrls(docs.map((d) => d.filePath));
  return docs.map((d, i) => ({ ...d, fileUrl: urls[i] }));
}

function fileTypeFromMime(mimetype: string): string {
  return mimetype === 'application/pdf' ? 'pdf' : 'image';
}

export async function getDocuments(req: AuthedRequest, res: Response) {
  const { search, category, fileType } = req.query;
  const docs = await listDocuments({
    search: typeof search === 'string' && search.trim() ? search.trim() : undefined,
    category: typeof category === 'string' && category ? category : undefined,
    fileType: typeof fileType === 'string' && fileType ? fileType : undefined,
  });
  res.json(await attachUrls(docs));
}

export async function getDocumentCategories(_req: AuthedRequest, res: Response) {
  res.json(await listDocumentCategories());
}

export async function postDocument(req: AuthedRequest, res: Response) {
  const title = (req.body.title as string | undefined)?.trim();
  const category = (req.body.category as string | undefined)?.trim() || null;
  if (!title) return res.status(400).json({ error: 'Tên tài liệu không được để trống' });
  if (!req.file) return res.status(400).json({ error: 'Vui lòng chọn file tài liệu (PDF hoặc ảnh)' });

  const filePath = await uploadDocumentFile(req.file.buffer, req.file.mimetype);
  const doc = await createDocument({
    title,
    category,
    filePath,
    fileName: req.file.originalname,
    fileType: fileTypeFromMime(req.file.mimetype),
    fileSize: req.file.size,
    uploadedBy: req.user!.id,
  });
  res.status(201).json(await attachUrl(doc));
}

export async function putDocument(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getDocumentById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy tài liệu' });

  const title = (req.body.title as string | undefined)?.trim();
  const category = (req.body.category as string | undefined)?.trim() || null;
  if (!title) return res.status(400).json({ error: 'Tên tài liệu không được để trống' });

  let file: { filePath: string; fileName: string; fileType: string; fileSize: number | null } | undefined;
  if (req.file) {
    const filePath = await uploadDocumentFile(req.file.buffer, req.file.mimetype);
    await deleteDocumentFile(existing.filePath);
    file = {
      filePath,
      fileName: req.file.originalname,
      fileType: fileTypeFromMime(req.file.mimetype),
      fileSize: req.file.size,
    };
  }

  const doc = await updateDocument(id, { title, category, file });
  res.json(await attachUrl(doc));
}

export async function removeDocument(req: AuthedRequest, res: Response) {
  const id = parseInt(req.params.id as string, 10);
  const existing = await getDocumentById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy tài liệu' });

  await deleteDocumentFile(existing.filePath);
  await deleteDocument(id);
  res.status(204).send();
}
