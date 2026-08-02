import { pool } from '../db/pool';

export interface CommendationFilters {
  chapterId?: number;
  memberId?: number;
  type?: 'khen_thuong' | 'ky_luat';
  search?: string;
}

function mapRow(row: any) {
  return {
    id: row.id,
    memberId: row.member_id,
    memberName: row.member_name,
    chapterId: row.chapter_id,
    chapterName: row.chapter_name,
    type: row.type,
    decisionDate: row.decision_date,
    decisionNumber: row.decision_number,
    content: row.content,
    issuedBy: row.issued_by,
  };
}

export async function listCommendations(filters: CommendationFilters) {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.chapterId) {
    params.push(filters.chapterId);
    conditions.push(`m.chapter_id = $${params.length}`);
  }
  if (filters.memberId) {
    params.push(filters.memberId);
    conditions.push(`mc.member_id = $${params.length}`);
  }
  if (filters.type) {
    params.push(filters.type);
    conditions.push(`mc.type = $${params.length}`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(
      `(m.full_name ILIKE $${params.length} OR mc.content ILIKE $${params.length} OR mc.decision_number ILIKE $${params.length})`
    );
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT mc.*, m.full_name AS member_name, m.chapter_id, c.name AS chapter_name
     FROM member_commendations mc
     JOIN members m ON m.id = mc.member_id
     LEFT JOIN chapters c ON c.id = m.chapter_id
     ${whereClause}
     ORDER BY mc.decision_date DESC`,
    params
  );
  return result.rows.map(mapRow);
}

export async function getCommendationById(id: number) {
  const result = await pool.query(
    `SELECT mc.*, m.full_name AS member_name, m.chapter_id, c.name AS chapter_name
     FROM member_commendations mc
     JOIN members m ON m.id = mc.member_id
     LEFT JOIN chapters c ON c.id = m.chapter_id
     WHERE mc.id = $1`,
    [id]
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export interface CommendationInput {
  memberId: number;
  type: 'khen_thuong' | 'ky_luat';
  decisionDate: string;
  decisionNumber: string | null;
  content: string;
  issuedBy: string | null;
}

export async function createCommendation(input: CommendationInput) {
  const result = await pool.query(
    `INSERT INTO member_commendations (member_id, type, decision_date, decision_number, content, issued_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [input.memberId, input.type, input.decisionDate, input.decisionNumber, input.content, input.issuedBy]
  );
  return getCommendationById(result.rows[0].id);
}

export async function updateCommendation(id: number, input: CommendationInput) {
  await pool.query(
    `UPDATE member_commendations SET member_id=$1, type=$2, decision_date=$3, decision_number=$4, content=$5, issued_by=$6, updated_at=now()
     WHERE id=$7`,
    [input.memberId, input.type, input.decisionDate, input.decisionNumber, input.content, input.issuedBy, id]
  );
  return getCommendationById(id);
}

export async function deleteCommendation(id: number) {
  await pool.query('DELETE FROM member_commendations WHERE id = $1', [id]);
}

export interface CommendationStats {
  totalByType: { khenThuong: number; kyLuat: number };
  byChapter: { chapterName: string; khenThuong: number; kyLuat: number }[];
  byMonth: { month: number; khenThuong: number; kyLuat: number }[];
}

export async function getCommendationStats(chapterId?: number): Promise<CommendationStats> {
  const conditions: string[] = [];
  const params: any[] = [];
  if (chapterId) {
    params.push(chapterId);
    conditions.push(`m.chapter_id = $${params.length}`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT mc.type, mc.decision_date, COALESCE(c.name, 'Chưa có chi đoàn') AS chapter_name
     FROM member_commendations mc
     JOIN members m ON m.id = mc.member_id
     LEFT JOIN chapters c ON c.id = m.chapter_id
     ${whereClause}`,
    params
  );

  const totalByType = { khenThuong: 0, kyLuat: 0 };
  const chapterMap = new Map<string, { khenThuong: number; kyLuat: number }>();
  const monthMap = new Map<number, { khenThuong: number; kyLuat: number }>();
  for (let m = 1; m <= 12; m++) monthMap.set(m, { khenThuong: 0, kyLuat: 0 });
  const currentYear = new Date().getFullYear();

  for (const row of result.rows) {
    const isKhenThuong = row.type === 'khen_thuong';

    if (isKhenThuong) totalByType.khenThuong++;
    else totalByType.kyLuat++;

    if (!chapterMap.has(row.chapter_name)) chapterMap.set(row.chapter_name, { khenThuong: 0, kyLuat: 0 });
    const chapterEntry = chapterMap.get(row.chapter_name)!;
    if (isKhenThuong) chapterEntry.khenThuong++;
    else chapterEntry.kyLuat++;

    const decisionDate: string = row.decision_date;
    const year = parseInt(decisionDate.slice(0, 4), 10);
    if (year === currentYear) {
      const month = parseInt(decisionDate.slice(5, 7), 10);
      const monthEntry = monthMap.get(month)!;
      if (isKhenThuong) monthEntry.khenThuong++;
      else monthEntry.kyLuat++;
    }
  }

  const byChapter = Array.from(chapterMap.entries())
    .map(([chapterName, counts]) => ({ chapterName, ...counts }))
    .sort((a, b) => b.khenThuong + b.kyLuat - (a.khenThuong + a.kyLuat));

  const byMonth = Array.from(monthMap.entries())
    .map(([month, counts]) => ({ month, ...counts }))
    .sort((a, b) => a.month - b.month);

  return { totalByType, byChapter, byMonth };
}
