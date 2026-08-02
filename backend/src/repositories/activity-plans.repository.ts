import { pool } from '../db/pool';

function mapRow(row: any) {
  return {
    id: row.id,
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date,
    content: row.content,
    chapterId: row.chapter_id,
    chapterName: row.chapter_name,
    status: row.status,
  };
}

export async function listActivityPlans() {
  const result = await pool.query(
    `SELECT ap.*, c.name AS chapter_name
     FROM activity_plans ap
     LEFT JOIN chapters c ON c.id = ap.chapter_id
     ORDER BY ap.start_date DESC, ap.id DESC`
  );
  return result.rows.map(mapRow);
}

export async function getActivityPlanById(id: number) {
  const result = await pool.query(
    `SELECT ap.*, c.name AS chapter_name
     FROM activity_plans ap
     LEFT JOIN chapters c ON c.id = ap.chapter_id
     WHERE ap.id = $1`,
    [id]
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export interface ActivityPlanInput {
  title: string;
  startDate: string;
  endDate: string;
  content: string | null;
  chapterId: number | null;
  status: 'chua_thuc_hien' | 'dang_thuc_hien' | 'da_hoan_thanh';
}

export async function createActivityPlan(input: ActivityPlanInput) {
  const result = await pool.query(
    `INSERT INTO activity_plans (title, start_date, end_date, content, chapter_id, status)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [input.title, input.startDate, input.endDate, input.content, input.chapterId, input.status]
  );
  return getActivityPlanById(result.rows[0].id);
}

export async function updateActivityPlan(id: number, input: ActivityPlanInput) {
  await pool.query(
    `UPDATE activity_plans SET title=$1, start_date=$2, end_date=$3, content=$4, chapter_id=$5, status=$6, updated_at=now()
     WHERE id=$7`,
    [input.title, input.startDate, input.endDate, input.content, input.chapterId, input.status, id]
  );
  return getActivityPlanById(id);
}

export async function deleteActivityPlan(id: number) {
  await pool.query('DELETE FROM activity_plans WHERE id = $1', [id]);
}
