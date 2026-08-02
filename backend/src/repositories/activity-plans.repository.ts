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
    status: row.computed_status,
  };
}

// Trạng thái hiển thị được suy ra hoàn toàn tự động, không còn phụ thuộc lựa chọn thủ công:
// đã có ai báo cáo kết quả -> Đã hoàn thành; chưa ai báo cáo và đã quá ngày kết thúc ->
// Chưa thực hiện; chưa ai báo cáo và chưa quá hạn -> Đang thực hiện.
const SELECT_BASE = `
  SELECT ap.*, c.name AS chapter_name,
         CASE
           WHEN COUNT(ar.id) > 0 THEN 'da_hoan_thanh'
           WHEN ap.end_date < CURRENT_DATE THEN 'chua_thuc_hien'
           ELSE 'dang_thuc_hien'
         END AS computed_status
  FROM activity_plans ap
  LEFT JOIN chapters c ON c.id = ap.chapter_id
  LEFT JOIN activity_reports ar ON ar.plan_id = ap.id
`;

export async function listActivityPlans() {
  const result = await pool.query(
    `${SELECT_BASE} GROUP BY ap.id, c.name ORDER BY ap.start_date DESC, ap.id DESC`
  );
  return result.rows.map(mapRow);
}

export async function getActivityPlanById(id: number) {
  const result = await pool.query(`${SELECT_BASE} WHERE ap.id = $1 GROUP BY ap.id, c.name`, [id]);
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
