import { pool } from '../db/pool';

function mapRow(row: any) {
  return {
    id: row.id,
    planId: row.plan_id,
    planTitle: row.plan_title,
    content: row.content,
    reportedById: row.created_by,
    reportedByName: row.reporter_name,
    images: (row.images ?? []).map((img: any) => ({ id: img.id, imagePath: img.imagePath })),
  };
}

const SELECT_BASE = `
  SELECT ar.*, ap.title AS plan_title, u.full_name AS reporter_name,
         COALESCE(
           json_agg(json_build_object('id', ari.id, 'imagePath', ari.image_path) ORDER BY ari.id)
             FILTER (WHERE ari.id IS NOT NULL),
           '[]'
         ) AS images
  FROM activity_reports ar
  JOIN activity_plans ap ON ap.id = ar.plan_id
  LEFT JOIN users u ON u.id = ar.created_by
  LEFT JOIN activity_report_images ari ON ari.report_id = ar.id
`;

export async function listActivityReports(planId?: number) {
  const params: any[] = [];
  let whereClause = '';
  if (planId) {
    params.push(planId);
    whereClause = `WHERE ar.plan_id = $${params.length}`;
  }
  const result = await pool.query(
    `${SELECT_BASE} ${whereClause} GROUP BY ar.id, ap.title, u.full_name ORDER BY ar.created_at DESC`,
    params
  );
  return result.rows.map(mapRow);
}

export async function getActivityReportById(id: number) {
  const result = await pool.query(`${SELECT_BASE} WHERE ar.id = $1 GROUP BY ar.id, ap.title, u.full_name`, [
    id,
  ]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function createActivityReport(planId: number, content: string, createdBy: number) {
  const result = await pool.query(
    `INSERT INTO activity_reports (plan_id, content, created_by) VALUES ($1,$2,$3) RETURNING id`,
    [planId, content, createdBy]
  );
  return result.rows[0].id as number;
}

export async function updateActivityReport(id: number, planId: number, content: string) {
  await pool.query(
    'UPDATE activity_reports SET plan_id=$1, content=$2, updated_at=now() WHERE id=$3',
    [planId, content, id]
  );
}

export async function deleteActivityReport(id: number) {
  await pool.query('DELETE FROM activity_reports WHERE id = $1', [id]);
}

export async function addActivityReportImage(reportId: number, imagePath: string) {
  await pool.query('INSERT INTO activity_report_images (report_id, image_path) VALUES ($1,$2)', [
    reportId,
    imagePath,
  ]);
}

export async function getActivityReportImageById(imageId: number) {
  const result = await pool.query(
    'SELECT id, report_id, image_path FROM activity_report_images WHERE id = $1',
    [imageId]
  );
  return result.rows[0]
    ? { id: result.rows[0].id, reportId: result.rows[0].report_id, imagePath: result.rows[0].image_path }
    : null;
}

export async function deleteActivityReportImageById(imageId: number) {
  await pool.query('DELETE FROM activity_report_images WHERE id = $1', [imageId]);
}
