import { pool } from '../db/pool';

export async function listDepartments() {
  const result = await pool.query(
    `SELECT d.id, d.name, COUNT(m.id) AS member_count
     FROM departments d
     LEFT JOIN members m ON m.department_id = d.id
     GROUP BY d.id, d.name
     ORDER BY d.name`
  );
  return result.rows.map((r) => ({ id: r.id, name: r.name, memberCount: parseInt(r.member_count, 10) }));
}

export async function getDepartmentById(id: number) {
  const result = await pool.query('SELECT id, name FROM departments WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function createDepartment(name: string) {
  const result = await pool.query('INSERT INTO departments (name) VALUES ($1) RETURNING id, name', [name]);
  return result.rows[0];
}

export async function updateDepartment(id: number, name: string) {
  const result = await pool.query('UPDATE departments SET name = $1 WHERE id = $2 RETURNING id, name', [name, id]);
  return result.rows[0] ?? null;
}

export async function deleteDepartment(id: number) {
  await pool.query('DELETE FROM departments WHERE id = $1', [id]);
}
