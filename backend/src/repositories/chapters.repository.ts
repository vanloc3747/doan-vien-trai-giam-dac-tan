import { pool } from '../db/pool';

export async function listChapters() {
  const result = await pool.query(
    `SELECT c.id, c.name, COUNT(m.id) AS member_count
     FROM chapters c
     LEFT JOIN members m ON m.chapter_id = c.id
     GROUP BY c.id, c.name
     ORDER BY c.name`
  );
  return result.rows.map((r) => ({ id: r.id, name: r.name, memberCount: parseInt(r.member_count, 10) }));
}

export async function getChapterById(id: number) {
  const result = await pool.query('SELECT id, name FROM chapters WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}
