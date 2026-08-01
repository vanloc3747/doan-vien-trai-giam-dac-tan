import { pool } from '../db/pool';

export interface MemberFilters {
  search?: string;
  department?: string;
  chapterId?: number;
  memberType?: string;
  page: number;
  pageSize: number;
}

function mapMemberRow(row: any) {
  return {
    id: row.id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    chapterId: row.chapter_id,
    chapterName: row.chapter_name ?? undefined,
    department: row.department,
    joinDate: row.join_date,
    memberType: row.member_type,
    roleTitle: row.role_title,
    phone: row.phone,
    email: row.email,
    photoUrl: row.photo_url,
    notes: row.notes,
  };
}

export async function listMembers(filters: MemberFilters) {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`m.full_name ILIKE $${params.length}`);
  }
  if (filters.department) {
    params.push(filters.department);
    conditions.push(`m.department = $${params.length}`);
  }
  if (filters.chapterId) {
    params.push(filters.chapterId);
    conditions.push(`m.chapter_id = $${params.length}`);
  }
  if (filters.memberType) {
    params.push(filters.memberType);
    conditions.push(`m.member_type = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*) FROM members m ${whereClause}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (filters.page - 1) * filters.pageSize;
  params.push(filters.pageSize, offset);
  const dataResult = await pool.query(
    `SELECT m.*, c.name AS chapter_name
     FROM members m
     LEFT JOIN chapters c ON c.id = m.chapter_id
     ${whereClause}
     ORDER BY m.id
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    data: dataResult.rows.map(mapMemberRow),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getMemberById(id: number) {
  const result = await pool.query(
    `SELECT m.*, c.name AS chapter_name FROM members m LEFT JOIN chapters c ON c.id = m.chapter_id WHERE m.id = $1`,
    [id]
  );
  return result.rows[0] ? mapMemberRow(result.rows[0]) : null;
}

export interface MemberInput {
  fullName: string;
  dateOfBirth: string;
  gender: 'nam' | 'nu' | 'khac';
  chapterId: number | null;
  department: string | null;
  joinDate: string;
  memberType: 'doan_vien' | 'dang_vien_sinh_hoat_doan';
  roleTitle: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

export async function createMember(input: MemberInput) {
  const result = await pool.query(
    `INSERT INTO members (full_name, date_of_birth, gender, chapter_id, department, join_date, member_type, role_title, phone, email, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [
      input.fullName,
      input.dateOfBirth,
      input.gender,
      input.chapterId,
      input.department,
      input.joinDate,
      input.memberType,
      input.roleTitle,
      input.phone,
      input.email,
      input.notes,
    ]
  );
  const id = result.rows[0].id;
  await pool.query(`INSERT INTO member_events (member_id, event_type) VALUES ($1, 'created')`, [id]);
  return getMemberById(id);
}

export async function updateMember(id: number, input: MemberInput) {
  await pool.query(
    `UPDATE members SET full_name=$1, date_of_birth=$2, gender=$3, chapter_id=$4, department=$5, join_date=$6,
       member_type=$7, role_title=$8, phone=$9, email=$10, notes=$11, updated_at=now()
     WHERE id=$12`,
    [
      input.fullName,
      input.dateOfBirth,
      input.gender,
      input.chapterId,
      input.department,
      input.joinDate,
      input.memberType,
      input.roleTitle,
      input.phone,
      input.email,
      input.notes,
      id,
    ]
  );
  return getMemberById(id);
}

export async function deleteMember(id: number) {
  await pool.query('DELETE FROM members WHERE id = $1', [id]);
}

export async function updateMemberType(id: number, memberType: 'doan_vien' | 'dang_vien_sinh_hoat_doan') {
  await pool.query('UPDATE members SET member_type = $1, updated_at = now() WHERE id = $2', [memberType, id]);
  await pool.query(`INSERT INTO member_events (member_id, event_type, meta) VALUES ($1, 'type_changed', $2)`, [
    id,
    JSON.stringify({ memberType }),
  ]);
  return getMemberById(id);
}

export async function transferMemberChapter(id: number, chapterId: number) {
  await pool.query('UPDATE members SET chapter_id = $1, updated_at = now() WHERE id = $2', [chapterId, id]);
  await pool.query(`INSERT INTO member_events (member_id, event_type, meta) VALUES ($1, 'transferred', $2)`, [
    id,
    JSON.stringify({ chapterId }),
  ]);
  return getMemberById(id);
}
