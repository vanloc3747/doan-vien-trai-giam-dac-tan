import { pool } from '../db/pool';

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'can_bo_doan';
  status: 'pending' | 'active' | 'rejected';
  managed_chapter_id: number | null;
  avatar_url: string | null;
}

export async function findUserByUsername(username: string): Promise<UserRow | null> {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: number): Promise<UserRow | null> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function createUser(username: string, passwordHash: string, fullName: string) {
  const result = await pool.query(
    `INSERT INTO users (username, password_hash, full_name, role, status)
     VALUES ($1, $2, $3, 'can_bo_doan', 'pending') RETURNING id, username, full_name, role, status`,
    [username, passwordHash, fullName]
  );
  return result.rows[0];
}

export async function listUsersByStatus(status: string) {
  const result = await pool.query(
    'SELECT id, username, full_name, role, status, created_at FROM users WHERE status = $1 ORDER BY created_at',
    [status]
  );
  return result.rows;
}

export async function updateUserStatus(id: number, status: 'active' | 'rejected') {
  const result = await pool.query(
    'UPDATE users SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, username, full_name, role, status',
    [status, id]
  );
  return result.rows[0] ?? null;
}

export async function updateUserPassword(id: number, passwordHash: string) {
  await pool.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [passwordHash, id]);
}

export async function updateUserProfile(id: number, input: { fullName: string; username: string }) {
  const result = await pool.query(
    `UPDATE users SET full_name = $1, username = $2, updated_at = now() WHERE id = $3
     RETURNING id, username, full_name AS "fullName", role, managed_chapter_id AS "managedChapterId", avatar_url AS "avatarUrl"`,
    [input.fullName, input.username, id]
  );
  return result.rows[0] ?? null;
}

export async function updateUserAvatar(id: number, avatarUrl: string | null) {
  const result = await pool.query(
    `UPDATE users SET avatar_url = $1, updated_at = now() WHERE id = $2
     RETURNING id, username, full_name AS "fullName", role, managed_chapter_id AS "managedChapterId", avatar_url AS "avatarUrl"`,
    [avatarUrl, id]
  );
  return result.rows[0] ?? null;
}

export async function listAllUsers() {
  const result = await pool.query(
    `SELECT u.id, u.username, u.full_name AS "fullName", u.role, u.status,
            u.managed_chapter_id AS "managedChapterId", c.name AS "managedChapterName"
     FROM users u
     LEFT JOIN chapters c ON c.id = u.managed_chapter_id
     ORDER BY u.created_at`
  );
  return result.rows;
}

export async function updateUserManagedChapter(id: number, chapterId: number | null) {
  const result = await pool.query(
    `UPDATE users SET managed_chapter_id = $1, updated_at = now() WHERE id = $2
     RETURNING id, username, full_name AS "fullName", role, status, managed_chapter_id AS "managedChapterId"`,
    [chapterId, id]
  );
  return result.rows[0] ?? null;
}

export async function createUserByAdmin(input: {
  username: string;
  passwordHash: string;
  fullName: string;
  role: 'admin' | 'can_bo_doan';
  managedChapterId: number | null;
}) {
  const result = await pool.query(
    `INSERT INTO users (username, password_hash, full_name, role, status, managed_chapter_id)
     VALUES ($1, $2, $3, $4, 'active', $5)
     RETURNING id, username, full_name AS "fullName", role, status, managed_chapter_id AS "managedChapterId"`,
    [input.username, input.passwordHash, input.fullName, input.role, input.managedChapterId]
  );
  return result.rows[0];
}

export async function updateUserByAdmin(
  id: number,
  input: { fullName: string; role: 'admin' | 'can_bo_doan'; managedChapterId: number | null }
) {
  const result = await pool.query(
    `UPDATE users SET full_name = $1, role = $2, managed_chapter_id = $3, updated_at = now() WHERE id = $4
     RETURNING id, username, full_name AS "fullName", role, status, managed_chapter_id AS "managedChapterId"`,
    [input.fullName, input.role, input.managedChapterId, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteUser(id: number) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}
