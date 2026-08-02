import { pool } from '../db/pool';

export async function listRoleTitles() {
  const result = await pool.query(
    `SELECT rt.id, rt.name, COUNT(m.id) AS member_count
     FROM role_titles rt
     LEFT JOIN members m ON m.role_title_id = rt.id
     GROUP BY rt.id, rt.name
     ORDER BY rt.name`
  );
  return result.rows.map((r) => ({ id: r.id, name: r.name, memberCount: parseInt(r.member_count, 10) }));
}

export async function getRoleTitleById(id: number) {
  const result = await pool.query('SELECT id, name FROM role_titles WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function createRoleTitle(name: string) {
  const result = await pool.query('INSERT INTO role_titles (name) VALUES ($1) RETURNING id, name', [name]);
  return result.rows[0];
}

export async function updateRoleTitle(id: number, name: string) {
  const result = await pool.query('UPDATE role_titles SET name = $1 WHERE id = $2 RETURNING id, name', [name, id]);
  return result.rows[0] ?? null;
}

export async function deleteRoleTitle(id: number) {
  await pool.query('DELETE FROM role_titles WHERE id = $1', [id]);
}
