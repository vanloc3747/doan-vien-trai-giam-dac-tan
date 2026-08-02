import { pool } from '../db/pool';

export interface CommendationFilters {
  chapterId?: number;
  memberId?: number;
}

function mapRow(row: any) {
  return {
    id: row.id,
    memberId: row.member_id,
    memberName: row.member_name,
    chapterId: row.chapter_id,
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

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT mc.*, m.full_name AS member_name, m.chapter_id
     FROM member_commendations mc
     JOIN members m ON m.id = mc.member_id
     ${whereClause}
     ORDER BY mc.decision_date DESC`,
    params
  );
  return result.rows.map(mapRow);
}

export async function getCommendationById(id: number) {
  const result = await pool.query(
    `SELECT mc.*, m.full_name AS member_name, m.chapter_id
     FROM member_commendations mc
     JOIN members m ON m.id = mc.member_id
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
