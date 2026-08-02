import { pool } from '../db/pool';

function mapRow(row: any) {
  return {
    id: row.id,
    noteDate: row.note_date,
    content: row.content,
  };
}

export async function listCalendarNotes(year: number, month: number) {
  const result = await pool.query(
    `SELECT * FROM calendar_notes
     WHERE EXTRACT(YEAR FROM note_date) = $1 AND EXTRACT(MONTH FROM note_date) = $2
     ORDER BY note_date ASC, id ASC`,
    [year, month]
  );
  return result.rows.map(mapRow);
}

export async function getCalendarNoteById(id: number) {
  const result = await pool.query('SELECT * FROM calendar_notes WHERE id = $1', [id]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function createCalendarNote(noteDate: string, content: string, createdBy: number) {
  const result = await pool.query(
    `INSERT INTO calendar_notes (note_date, content, created_by) VALUES ($1, $2, $3) RETURNING id`,
    [noteDate, content, createdBy]
  );
  return getCalendarNoteById(result.rows[0].id);
}

export async function updateCalendarNote(id: number, noteDate: string, content: string) {
  await pool.query(
    'UPDATE calendar_notes SET note_date = $1, content = $2, updated_at = now() WHERE id = $3',
    [noteDate, content, id]
  );
  return getCalendarNoteById(id);
}

export async function deleteCalendarNote(id: number) {
  await pool.query('DELETE FROM calendar_notes WHERE id = $1', [id]);
}
