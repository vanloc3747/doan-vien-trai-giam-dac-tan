import { pool } from '../db/pool';

interface DocumentRow {
  id: number;
  title: string;
  category: string | null;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  uploaded_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  title: string;
  category: string | null;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  uploadedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: DocumentRow): Document {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    filePath: row.file_path,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    uploadedByName: row.uploaded_by_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface DocumentFilters {
  search?: string;
  category?: string;
  fileType?: string;
}

export async function listDocuments(filters: DocumentFilters): Promise<Document[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`d.title ILIKE $${params.length}`);
  }
  if (filters.category) {
    params.push(filters.category);
    conditions.push(`d.category = $${params.length}`);
  }
  if (filters.fileType) {
    params.push(filters.fileType);
    conditions.push(`d.file_type = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query<DocumentRow>(
    `SELECT d.id, d.title, d.category, d.file_path, d.file_name, d.file_type, d.file_size,
            d.created_at, d.updated_at, u.full_name AS uploaded_by_name
     FROM documents d
     LEFT JOIN users u ON u.id = d.uploaded_by
     ${where}
     ORDER BY d.created_at DESC`,
    params
  );
  return rows.map(mapRow);
}

export async function getDocumentById(id: number): Promise<Document | null> {
  const { rows } = await pool.query<DocumentRow>(
    `SELECT d.id, d.title, d.category, d.file_path, d.file_name, d.file_type, d.file_size,
            d.created_at, d.updated_at, u.full_name AS uploaded_by_name
     FROM documents d
     LEFT JOIN users u ON u.id = d.uploaded_by
     WHERE d.id = $1`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function listDocumentCategories(): Promise<string[]> {
  const { rows } = await pool.query<{ category: string }>(
    `SELECT DISTINCT category FROM documents WHERE category IS NOT NULL ORDER BY category`
  );
  return rows.map((r) => r.category);
}

export interface CreateDocumentInput {
  title: string;
  category: string | null;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  uploadedBy: number;
}

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO documents (title, category, file_path, file_name, file_type, file_size, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [input.title, input.category, input.filePath, input.fileName, input.fileType, input.fileSize, input.uploadedBy]
  );
  return (await getDocumentById(rows[0].id))!;
}

export interface UpdateDocumentInput {
  title: string;
  category: string | null;
  file?: { filePath: string; fileName: string; fileType: string; fileSize: number | null };
}

export async function updateDocument(id: number, input: UpdateDocumentInput): Promise<Document> {
  if (input.file) {
    await pool.query(
      `UPDATE documents
       SET title = $1, category = $2, file_path = $3, file_name = $4, file_type = $5, file_size = $6, updated_at = now()
       WHERE id = $7`,
      [input.title, input.category, input.file.filePath, input.file.fileName, input.file.fileType, input.file.fileSize, id]
    );
  } else {
    await pool.query(`UPDATE documents SET title = $1, category = $2, updated_at = now() WHERE id = $3`, [
      input.title,
      input.category,
      id,
    ]);
  }
  return (await getDocumentById(id))!;
}

export async function deleteDocument(id: number): Promise<void> {
  await pool.query(`DELETE FROM documents WHERE id = $1`, [id]);
}
