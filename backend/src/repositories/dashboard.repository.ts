import { pool } from '../db/pool';

async function countMembers(memberType?: string) {
  const result = memberType
    ? await pool.query('SELECT COUNT(*) FROM members WHERE member_type = $1', [memberType])
    : await pool.query('SELECT COUNT(*) FROM members');
  return parseInt(result.rows[0].count, 10);
}

async function countEventsThisMonth(eventType: string) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM member_events
     WHERE event_type = $1
       AND date_trunc('month', event_date) = date_trunc('month', CURRENT_DATE)`,
    [eventType]
  );
  return parseInt(result.rows[0].count, 10);
}

async function countEventsLastMonth(eventType: string) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM member_events
     WHERE event_type = $1
       AND date_trunc('month', event_date) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')`,
    [eventType]
  );
  return parseInt(result.rows[0].count, 10);
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getDashboardStats() {
  const totalMembers = await countMembers();
  const doanVienCount = await countMembers('doan_vien');
  const dangVienCount = await countMembers('dang_vien_sinh_hoat_doan');

  const createdThisMonth = await countEventsThisMonth('created');
  const createdLastMonth = await countEventsLastMonth('created');
  const transfersThisMonth = await countEventsThisMonth('transferred');
  const transfersLastMonth = await countEventsLastMonth('transferred');
  const typeChangesThisMonth = await countEventsThisMonth('type_changed');
  const typeChangesLastMonth = await countEventsLastMonth('type_changed');

  return {
    totalMembers,
    totalMembersDeltaPct: pctChange(createdThisMonth, createdLastMonth),
    doanVienCount,
    doanVienDeltaPct: pctChange(typeChangesThisMonth, typeChangesLastMonth),
    dangVienCount,
    dangVienDeltaPct: pctChange(typeChangesThisMonth, typeChangesLastMonth),
    transfers: transfersThisMonth,
    transfersDeltaPct: pctChange(transfersThisMonth, transfersLastMonth),
  };
}

export async function getGenderDistribution() {
  const result = await pool.query('SELECT gender, COUNT(*) AS count FROM members GROUP BY gender');
  const total = result.rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0);
  return result.rows.map((r) => ({
    gender: r.gender,
    count: parseInt(r.count, 10),
    percentage: total > 0 ? Math.round((parseInt(r.count, 10) / total) * 1000) / 10 : 0,
  }));
}

export async function getDepartmentDistribution() {
  const result = await pool.query(
    `SELECT department, COUNT(*) AS count FROM members
     WHERE department IS NOT NULL
     GROUP BY department ORDER BY count DESC`
  );
  return result.rows.map((r) => ({ department: r.department, count: parseInt(r.count, 10) }));
}

export async function getBirthdaysThisMonth() {
  const result = await pool.query(
    `SELECT id, full_name, date_of_birth, department
     FROM members
     WHERE EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
     ORDER BY EXTRACT(DAY FROM date_of_birth)`
  );
  return result.rows.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    dateOfBirth: r.date_of_birth,
    department: r.department,
  }));
}
